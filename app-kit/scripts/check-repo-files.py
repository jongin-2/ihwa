#!/usr/bin/env python3
"""저장소에 넣지 않는 파일이 커밋돼 있지 않은지 검사한다 — 네 앱 공용 원본(ihwa-site/app-kit/scripts/).

앱 저장소의 impl/scripts/check-repo-files.py로 **글자 그대로** 복사해 쓴다(앱 값은 저장소 폴더 이름에서 읽음).
고칠 땐 이 원본만 고치고 다시 복사한다. check-docs-sync.sh가 이 파일을 부른다.

GitHub에는 기획(prd)·설계(spec)·개발(impl) 문서와 코드만 둔다(전역 CLAUDE.md 5절).
- 스크린샷·녹화·PDF → iCloud Drive ihwa/<앱>/(store-shots/·qa-evidence/·design-review/)
- 작업 기록(NEXT_STEPS·QA_RESULT·FEEDBACK) → iCloud ihwa/<앱>/work/(10-16)
- 생성물(프로토타입 index.html 등) → 깃 무시 폴더 impl/out/
- 도구(.py·.sh) → impl/scripts/ 와 .githooks/ 에만
"""
import os, re, subprocess, sys

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], cwd=os.path.dirname(os.path.abspath(__file__)),
                      capture_output=True, text=True, check=True).stdout.strip()
APP = os.path.basename(ROOT)
files = subprocess.run(['git', 'ls-files'], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split('\n')
files = [f for f in files if f and os.path.exists(os.path.join(ROOT, f))]

MEDIA = re.compile(r'\.(png|jpe?g|gif|webp|heic|mp4|mov|m4v|pdf|zip|m4a|mp3|wav|caf|aac|aiff?)$', re.I)   # 소리도(10-16 알롱 제안)
APP_CODE = ('impl/app/', 'impl/ios/', 'impl/android/', 'impl/server/')   # 앱 코드 폴더 — 빌드에 쓰는 아이콘·그림·글꼴은 늘 보관
APP_RES = re.compile(r'\.(ttf|otf|m4a|mp3|wav|caf|aac)$', re.I)   # 앱 코드 폴더 안 글꼴·소리는 커도 둔다
HTML_OK = re.compile(r'^prd/[^/]+/mockup\.html$|^prd/prototype/(review-)?template\.html$')
TOOL = re.compile(r'\.(py|sh)$')
TOOL_OK = ('impl/scripts/', '.githooks/')
WORK_LOG = re.compile(r'(^|/)(NEXT_STEPS|QA_RESULT|FEEDBACK)\.md$')
BIG = 1_000_000                               # 1MB 넘는 파일은 대개 생성물
BIG_OK = re.compile(r'(^|/)(package-lock|licenses)\.json$')   # 의존성 잠금·앱이 쓰는 라이선스 목록은 커도 둔다

bad = []
for f in files:
    if MEDIA.search(f) and not f.startswith(APP_CODE):
        bad.append(f'{f} — 스크린샷·영상·소리·PDF는 iCloud ihwa/{APP}/에')
    elif WORK_LOG.search(f):
        bad.append(f'{f} — 작업 기록은 iCloud ihwa/{APP}/work/에')
    elif f.endswith('.html') and not HTML_OK.match(f):
        bad.append(f'{f} — 목업·템플릿 밖 html은 생성물(impl/out/, 깃 무시)')
    elif TOOL.search(f) and not f.startswith(TOOL_OK):
        bad.append(f'{f} — 도구는 impl/scripts/에만')
    elif os.path.getsize(os.path.join(ROOT, f)) > BIG and not BIG_OK.search(f) and not (APP_RES.search(f) and f.startswith(APP_CODE)):
        bad.append(f'{f} — 1MB가 넘음(생성물이면 깃에서 빼고, 꼭 필요하면 원본 BIG_OK에 이유와 함께)')

# 공용 원본과 글자 그대로 같아야 하는 사본 — 고칠 땐 원본만 고치고 다시 복사
KIT = os.path.expanduser('~/Projects/ihwa-site/app-kit')
COPIES = (('prototype/template.html', 'prd/prototype/template.html'),
          ('prototype/review-template.html', 'prd/prototype/review-template.html'),
          ('prototype/build-prototype.py', 'impl/scripts/build-prototype.py'),
          ('scripts/check-repo-files.py', 'impl/scripts/check-repo-files.py'))
for src, dst in COPIES:
    s, d = os.path.join(KIT, src), os.path.join(ROOT, dst)
    if os.path.exists(s) and os.path.exists(d) and open(s, 'rb').read() != open(d, 'rb').read():
        bad.append(f'{dst} — 공용 원본 ihwa-site/app-kit/{src}와 다름(원본을 다시 복사)')

if bad:
    print('저장소에 넣지 않는 파일:')
    for b in bad:
        print('  ' + b)
    sys.exit(1)
print(f'저장소 파일 {len(files)}개 규칙 통과')
