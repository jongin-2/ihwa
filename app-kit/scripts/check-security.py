#!/usr/bin/env python3
"""출시 전 보안 점검 — 네 앱 공용 원본(ihwa-site/app-kit/scripts/). 앱 impl/scripts/에 글자 그대로 복사해 쓴다.

전역 CLAUDE.md 10절(10-16 종인님 "모든 앱은 출시할 때는 전체, 업데이트할 때는 수정 부분만 보안 취약점 확인 및 대응"):
  python3 impl/scripts/check-security.py                 # 첫 출시(1.0): 저장소 전체
  python3 impl/scripts/check-security.py --since v1.3.0  # 업데이트: 직전 출시 태그 뒤 바뀐 파일만
의존성 취약점(npm audit)은 새로 알려지는 것이 있어 두 경우 모두 매번 전체를 본다(설치 없이 조회만).
자동으로 못 보는 것(권한 범위·웹뷰·딥링크·서버 인증 등)은 TESTCASES의 SEC 묶음으로 사람이 본다.
막힘(✗)이 있으면 종료 코드 1, 경고(△)만 있으면 0.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], cwd=HERE, capture_output=True, text=True, check=True).stdout.strip()
since = sys.argv[sys.argv.index('--since') + 1] if '--since' in sys.argv else None

def git(*a):
    return subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True).stdout.split('\n')

tracked = [f for f in git('ls-files') if f and os.path.isfile(os.path.join(ROOT, f))]
if since:
    changed = set(git('diff', '--name-only', f'{since}..HEAD')) | set(git('diff', '--name-only'))
    scope = [f for f in tracked if f in changed]
else:
    scope = tracked
bad, warn = [], []

# 1. 커밋된 비밀값 — 키 파일 자체와, 글 속 비밀키 모양
KEY_FILE = re.compile(r'(\.p8|\.p12|\.pem|\.key|\.keystore|\.jks|(^|/)\.env(\..+)?)$', re.I)
SECRET = [
    (re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----\s*\n?[A-Za-z0-9+/]{40}'), '개인키'),   # 본문이 있는 진짜 키만(시험 코드의 틀 문자열 제외)
    (re.compile(r'"private_key"\s*:\s*"'), '서비스 계정 개인키'),
    (re.compile(r'AKIA[0-9A-Z]{16}'), 'AWS 키'),
    (re.compile(r'gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,}'), 'GitHub 토큰'),
    (re.compile(r'\bsk-(ant-|proj-)?[A-Za-z0-9_-]{24,}'), 'API 비밀키'),
    (re.compile(r'xox[abpr]-[A-Za-z0-9-]{10,}'), 'Slack 토큰'),
    (re.compile(r'secret_[A-Za-z0-9]{40,}|ntn_[A-Za-z0-9]{40,}'), 'Notion 토큰'),
]
TEXT_SKIP = re.compile(r'(package-lock\.json|\.(png|jpe?g|gif|webp|m4a|mp3|wav|ttf|otf|ico|icns|pdf|zip))$', re.I)
for f in scope:
    if KEY_FILE.search(f) and not f.endswith('.env.example'):
        bad.append(f'{f} — 키·환경 파일이 커밋됨(고정 위치 ~/.appstoreconnect 등으로 옮기고 키를 새로 발급)')
        continue
    if TEXT_SKIP.search(f):
        continue
    try:
        text = open(os.path.join(ROOT, f), encoding='utf-8', errors='ignore').read()
    except OSError:
        continue
    for pat, name in SECRET:
        if pat.search(text):
            bad.append(f'{f} — {name} 모양 문자열(진짜면 키를 폐기·재발급하고 기록에서도 걷어냄)')

# 2. 암호화 안 된 통신 허용
for f in scope:
    if f.endswith(('app.json', 'Info.plist')):
        t = open(os.path.join(ROOT, f), encoding='utf-8', errors='ignore').read()
        if re.search(r'NSAllowsArbitraryLoads["\s:<>/a-z]*true', t, re.I):
            bad.append(f'{f} — NSAllowsArbitraryLoads=true(모든 http 허용)')
    elif re.search(r'\.(ts|tsx|js|swift)$', f) and '/node_modules/' not in f:
        t = open(os.path.join(ROOT, f), encoding='utf-8', errors='ignore').read()
        for m in re.finditer(r'["\'`]http://(?!localhost|127\.0\.0\.1|10\.|192\.168\.|www\.w3\.org/|www\.apple\.com/DTDs/)[^"\'`\s]+', t):   # 도식 이름표(xmlns·DTD)는 통신이 아님
            warn.append(f'{f} — 암호화 안 된 주소 {m.group(0)[1:60]}')

# 3. Firestore·Storage 규칙
for f in scope:
    if f.endswith(('firestore.rules', 'storage.rules')):
        t = open(os.path.join(ROOT, f), encoding='utf-8').read()
        if re.search(r'allow\s+[a-z, ]+:\s*if\s+true\s*;', t):
            bad.append(f'{f} — "if true" 규칙(누구나 읽고 씀)')
        if 'request.auth' not in t:
            warn.append(f'{f} — request.auth 확인이 없음')

# 4. 서버 설정에 비밀값을 평문으로
for f in scope:
    if f.endswith('wrangler.toml'):
        t = open(os.path.join(ROOT, f), encoding='utf-8').read()
        vars_block = re.search(r'\[vars\](.*?)(\n\[|\Z)', t, re.S)
        if vars_block and re.search(r'(?im)^\s*\w*(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|API_KEY)\s*=', vars_block.group(1)):   # KEY_ID 같은 번호는 비밀 아님
            bad.append(f'{f} — [vars]에 비밀값 이름이 있음(wrangler secret put으로)')

# 5. 의존성 취약점 — 늘 전체(설치 없이 lock 파일로 조회)
# 앱 실행 파일(번들)에 들어가지 않는 빌드·서버용 패키지 — 10-16 네 앱에서 확인한 원천. 새로 넣을 땐 이유를 적는다
NOT_IN_APP = {
    'braces': '빌드 도구 metro', 'brace-expansion': '빌드 도구', 'micromatch': '빌드 도구 metro',
    'shell-quote': 'Expo·RN 명령줄 도구', 'node-forge': 'Expo 코드 서명 도구',
    '@grpc/grpc-js': 'Node용 firestore만 씀 — 10-16 확인: 앱 코드가 firebase JS를 안 불러오고 RN 진입점 index.rn.js에 grpc 없음',
}
for f in tracked:
    if not f.endswith('package-lock.json') or '/node_modules/' in f:
        continue
    d = os.path.join(ROOT, os.path.dirname(f))
    r = subprocess.run(['npm', 'audit', '--omit=dev', '--json'], cwd=d, capture_output=True, text=True)
    try:
        v = json.loads(r.stdout).get('metadata', {}).get('vulnerabilities', {})
    except Exception:
        warn.append(f'{os.path.dirname(f) or "."} — npm audit 결과를 못 읽음(네트워크?)')
        continue
    # npm은 부모 패키지에도 같은 표시를 붙이므로, 실제 권고가 달린 원천 패키지만 센다
    vulns = json.loads(r.stdout).get('vulnerabilities', {})
    where = os.path.dirname(f) or '.'
    for name, info in sorted(vulns.items()):
        if info.get('severity') not in ('high', 'critical') or not any(isinstance(x, dict) for x in info.get('via', [])):
            continue
        title = next(x for x in info['via'] if isinstance(x, dict)).get('title', '')[:60]
        if name in NOT_IN_APP:
            warn.append(f'{where} — {name}({info["severity"]}) 앱 실행 파일엔 안 들어감({NOT_IN_APP[name]}) — 고친 판 나오면 올림')
        else:
            bad.append(f'{where} — {name}({info["severity"]}): {title} — 고친 판으로 올리기')
    if v.get('moderate', 0):
        warn.append(f'{where} — 의존성 취약점 보통 {v["moderate"]}건(부모 표시 포함)')

label = f'{since} 뒤 바뀐 파일 {len(scope)}개' if since else f'저장소 전체 {len(scope)}개'
for b in bad:
    print('✗ ' + b)
for w in warn:
    print('△ ' + w)
print(f'보안 점검({label}): 막힘 {len(bad)} · 경고 {len(warn)}')
sys.exit(1 if bad else 0)
