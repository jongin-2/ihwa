#!/usr/bin/env python3
"""공용 asc.py 다시 시도 규칙 시험 — 키·네트워크 없이 send·sleep·토큰을 바꿔 끼운다(차곡 11-18 참고 시험 7가지 + 토큰·본문 파일).
실행: python3 -I app-kit/scripts/test-asc.py  (종료 코드 0 = 통과)"""
import io
import os
import sys
import tempfile
import urllib.error

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import asc  # noqa: E402


def fake(seq):
    """seq: 차례로 낼 결과 — 정수면 그 HTTP 오류, 'net'이면 네트워크 오류, 문자열이면 200 본문."""
    calls = []

    def send(req):
        calls.append(req)
        r = seq[min(len(calls), len(seq)) - 1]
        if r == 'net':
            raise urllib.error.URLError('connection reset')
        if isinstance(r, int):
            raise urllib.error.HTTPError(req.full_url, r, 'x', {}, io.BytesIO(b'{"errors":[]}'))
        return 200, r
    return send, calls


tokens = []


def tok():
    tokens.append(1)
    return f't{len(tokens)}'


OK = '{"data": {"id": "X"}}'
cases = [
    # 이름, 메서드, 차례, 기대 종료 코드, 기대 시도 수
    ('GET 500 두 번 뒤 성공', 'GET', [500, 500, OK], 0, 3),
    ('PATCH 502 두 번 뒤 성공', 'PATCH', [502, 502, OK], 0, 3),
    ('GET 네트워크 오류 한 번 뒤 성공', 'GET', ['net', OK], 0, 2),
    ('GET 401 계속 → 6번 뒤 실패', 'GET', [401], 1, 6),
    ('GET 404 → 바로 실패', 'GET', [404], 1, 1),
    ('POST 500 → 다시 안 함, 종료 3', 'POST', [500, OK], 3, 1),
    ('POST 네트워크 오류 → 다시 안 함, 종료 3', 'POST', ['net', OK], 3, 1),
    ('POST 429 두 번 뒤 성공', 'POST', [429, 429, OK], 0, 3),
    ('POST 401 계속 → 6번 뒤 실패(종료 1)', 'POST', [401], 1, 6),
    ('DELETE 본문 없는 204', 'DELETE', [''], 0, 1),
]
fail = 0
for name, method, seq, want_rc, want_n in cases:
    tokens.clear()
    send, calls = fake(seq)
    rc, out = asc.call(method, '/x', None, send=send, sleep=lambda s: None, make_token=tok)
    good = rc == want_rc and len(calls) == want_n and len(tokens) == want_n
    good = good and (rc != 1 or out.startswith('HTTP ')) and (rc != 0 or not out.startswith('HTTP'))
    good = good and len({r.get_header('Authorization') for r in calls}) == want_n  # 시도마다 새 토큰
    print(('통과' if good else '실패'), name, f'— 종료 {rc}, 시도 {len(calls)}', '' if good else out[:120])
    fail += not good

with tempfile.NamedTemporaryFile('wb', suffix='.json', delete=False) as f:
    f.write(b'{"a":1}')
ok_body = asc.read_body(f.name) == b'{"a":1}' and asc.read_body('{"b":2}') == b'{"b":2}' and asc.read_body(None) is None
os.unlink(f.name)
print(('통과' if ok_body else '실패'), '본문: 파일 경로·JSON 문자열 둘 다')
fail += not ok_body
ok_path = asc.bad_path('/v1/apps/1 1.4.8/x') and asc.bad_path('/v1/a\tb') and not asc.bad_path('/v1/apps/1/appStoreVersions?filter[versionString]=1.4.8')
print(('통과' if ok_path else '실패'), '주소: 공백·제어 문자 막고 정상 주소는 통과')
fail += not ok_path
print('실패', fail, '건')
sys.exit(1 if fail else 0)
