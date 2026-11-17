#!/usr/bin/env python3
"""App Store Connect API 호출 도우미 — 공용 원본(ihwa-site/app-kit/scripts/asc.py). 앱에는 impl/scripts/asc.py로 글자 그대로 복사한다.
외부 라이브러리 없이 openssl로 ES256 JWT를 만든다. 키 내용·Issuer ID는 절대 출력하지 않는다.

사용법:
  asc.py GET /v1/bundleIds?limit=200
  asc.py DELETE /v1/bundleIds/<id>
  asc.py POST /v1/appInfoLocalizations '{"data": ...}'     ← 본문을 JSON 문자열로
  asc.py PATCH /v1/appInfoLocalizations/<id> body.json      ← 또는 본문 파일 경로로(있는 파일이면 파일로 읽음)

출력·종료 코드(앱 스크립트는 종료 코드나 'HTTP ' 머리로 실패를 가린다 — 출력만 JSON으로 읽고 넘어가면 실패가 조용히 지나간다):
  0 성공 — 응답 JSON(들여쓰기) 또는 본문 없는 응답이면 'OK <상태>'
  1 실패 — 'HTTP <코드> <응답 앞 800자>'(네트워크 오류는 'HTTP 000 <이유>')
  2 사용법 오류
  3 POST가 서버 오류·네트워크 오류로 끝남 — 애플 쪽에서 실제로는 만들어졌을 수 있으니 GET으로 있는지 확인한 뒤 다시 하라

다시 시도(2026-11-18 애플 ASC 장애 직후 같은 호출이 401·429·5xx로 섞여 실패해 판 준비가 매번 중간에 멈춤 — 주량체커·차곡·응원석·한배):
  · 401·429는 애플이 처리하기 전에 거절한 것 → 모든 메서드에서 다시 시도
  · 5xx·네트워크 오류는 GET·PATCH·DELETE만 다시 시도(같은 호출을 되풀이해도 결과가 같다)
  · POST는 5xx·네트워크 오류면 다시 하지 않는다 — 처리됐을 수 있어 스크린샷 예약 같은 자원이 두 번 생긴다(차곡 검토)
  · 시도마다 토큰을 새로 만든다(401이 만료 때문일 수 있음), 6번까지, 사이 5·10·15·20·25초(ASC_WAIT_UNIT로 바꿈 — 시험용)
"""
import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

TRIES = 6
WAIT_UNIT = float(os.environ.get('ASC_WAIT_UNIT', '5'))
BASE = 'https://api.appstoreconnect.apple.com'


def b64u(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b'=').decode()


def der_to_raw(der: bytes) -> bytes:
    """ECDSA DER(SEQUENCE{INTEGER r, INTEGER s}) → JWS가 쓰는 r||s 64바이트."""
    assert der[0] == 0x30
    i = 2 if der[1] < 0x80 else 3 + (der[1] & 0x7F) - 1
    out = b''
    for _ in range(2):
        assert der[i] == 0x02
        ln = der[i + 1]
        val = der[i + 2:i + 2 + ln].lstrip(b'\x00')
        out += val.rjust(32, b'\x00')
        i += 2 + ln
    return out


def token() -> str:
    key_dir = os.path.expanduser('~/.appstoreconnect/private_keys')
    issuer = open(os.path.expanduser('~/.appstoreconnect/issuer_id.txt')).read().strip()
    key_files = [f for f in os.listdir(key_dir) if f.startswith('AuthKey_') and f.endswith('.p8')]
    if len(key_files) != 1:
        sys.exit(f'키 파일이 1개가 아닙니다: {len(key_files)}개')
    key_id = key_files[0][len('AuthKey_'):-len('.p8')]
    now = int(time.time())
    header = b64u(json.dumps({'alg': 'ES256', 'kid': key_id, 'typ': 'JWT'}, separators=(',', ':')).encode())
    payload = b64u(json.dumps({'iss': issuer, 'iat': now, 'exp': now + 900,
                               'aud': 'appstoreconnect-v1'}, separators=(',', ':')).encode())
    signing_input = f'{header}.{payload}'.encode()
    der = subprocess.run(['openssl', 'dgst', '-sha256', '-sign', os.path.join(key_dir, key_files[0])],
                         input=signing_input, capture_output=True, check=True).stdout
    return f'{header}.{payload}.{b64u(der_to_raw(der))}'


def retryable(method: str, code: int) -> bool:
    """code: HTTP 상태, 네트워크 오류는 0."""
    if code in (401, 429):
        return True
    if method == 'POST':
        return False
    return code == 0 or code >= 500


def call(method, path, body=None, send=None, sleep=time.sleep, make_token=token):
    """→ (종료 코드, 출력 문자열). send(req)는 시험에서 바꿔 끼운다 — (상태, 본문 문자열)을 돌려주거나 HTTPError·URLError를 던진다."""
    def real_send(req):
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, r.read().decode()
    send = send or real_send
    code, text = 0, ''
    for attempt in range(TRIES):
        req = urllib.request.Request(BASE + path, data=body, method=method)
        req.add_header('Authorization', 'Bearer ' + make_token())
        if body:
            req.add_header('Content-Type', 'application/json')
        try:
            status, raw = send(req)
            return 0, (json.dumps(json.loads(raw), ensure_ascii=False, indent=2) if raw else f'OK {status}')
        except urllib.error.HTTPError as e:
            code, text = e.code, e.read().decode(errors='replace')[:800]
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            code, text = 0, str(getattr(e, 'reason', e))[:800]
        if not retryable(method, code):
            break
        if attempt < TRIES - 1:
            sleep(WAIT_UNIT * (attempt + 1))
    out = f'HTTP {code:03d} {text}'
    if method == 'POST' and (code == 0 or code >= 500):
        return 3, out + '\n(POST가 서버·네트워크 오류로 끝남 — 실제로는 만들어졌을 수 있으니 GET으로 확인한 뒤 다시 하세요)'
    return 1, out


def read_body(arg):
    if arg is None:
        return None
    if os.path.isfile(arg):
        with open(arg, 'rb') as f:
            return f.read()
    return arg.encode()


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    rc, out = call(sys.argv[1].upper(), sys.argv[2], read_body(sys.argv[3] if len(sys.argv) > 3 else None))
    print(out)
    sys.exit(rc)
