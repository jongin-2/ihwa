#!/usr/bin/env python3
# 공용 프로토타입·시안 검토판 생성기 — 원본 ihwa-site/app-kit/prototype/build-prototype.py, 앱마다 impl/scripts/build-prototype.py로 글자 그대로 복사한다.
# 앱마다 다른 값은 prd/prototype/screens.json 하나: {"title": 앱 이름, "accent": 강조색, "screens": [{"key", "label", "path"(선택)}]}
#   path가 없으면 prd/<key>/mockup.html.
# 만드는 것(둘 다 깃 무시 impl/out/ — Artifact로 게시하는 원본):
#   impl/out/prototype/index.html  ← prd/prototype/template.html + 목업들(base64)
#   impl/out/review/index.html     ← prd/prototype/review-template.html + impl/out/review/body.html(없으면 "진행 중인 시안 없음")
# 2026-10-15 네 앱 통일(종인님 "통일하게 해", "모바일에서 주로 보는 것도 고려", "반응형으로 하면 되는거 아니야?").
import base64, html, json, os, subprocess, sys


def repo_root(p=os.path.dirname(os.path.abspath(__file__))):
    while not os.path.exists(os.path.join(p, '.git')):  # 작업 기록(FEEDBACK 등)은 10-16 깃 밖 iCloud로 — 맨 위 표지는 .git
        if os.path.dirname(p) == p:
            sys.exit('✋ 저장소 맨 위(.git)를 찾지 못했습니다')
        p = os.path.dirname(p)
    return p


ROOT = repo_root()
P = lambda *a: os.path.join(ROOT, *a)
cfg = json.load(open(P('prd', 'prototype', 'screens.json'), encoding='utf-8'))
title, accent = cfg['title'], cfg['accent']
# 갱신일 = 목업이 마지막으로 바뀐 커밋 날짜(빌드한 날로 하면 날마다 파일이 바뀌어 다시 게시해야 한다)
try:
    updated = subprocess.run(['git', '-C', ROOT, 'log', '-1', '--format=%cs', '--', 'prd'], capture_output=True, text=True).stdout.strip()
except Exception:
    updated = ''


def write(rel, text):
    path = P(*rel.split('/'))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    old = open(path, encoding='utf-8').read() if os.path.exists(path) else None
    if old != text:
        open(path, 'w', encoding='utf-8').write(text)
        print(f'{rel} 갱신됨 — Artifact 다시 게시 필요')
    else:
        print(f'{rel} 변경 없음')


screens = []
for s in cfg['screens']:
    path = P(*(s.get('path') or f"prd/{s['key']}/mockup.html").split('/'))
    if not os.path.exists(path):
        sys.exit(f'✋ 목업이 없습니다: {os.path.relpath(path, ROOT)}')
    screens.append({'key': s['key'], 'label': s['label'], 'html': base64.b64encode(open(path, 'rb').read()).decode()})

tpl = open(P('prd', 'prototype', 'template.html'), encoding='utf-8').read()
for k in ('__TITLE__', '__ACCENT__', '__UPDATED__', '__SCREENS__'):
    if k not in tpl:
        sys.exit(f'✋ template.html에 {k} 자리가 없습니다 — app-kit 원본을 다시 복사하세요')
write('impl/out/prototype/index.html',
      tpl.replace('__TITLE__', html.escape(title)).replace('__ACCENT__', accent).replace('__UPDATED__', updated)
         .replace('__SCREENS__', json.dumps(screens, ensure_ascii=False)))

rtpl = open(P('prd', 'prototype', 'review-template.html'), encoding='utf-8').read()
body_path = P('impl', 'out', 'review', 'body.html')
body = open(body_path, encoding='utf-8').read() if os.path.exists(body_path) else \
    '  <section class="empty"><h1>진행 중인 시안 없음</h1><p>시안을 비교할 일이 생기면 이 자리에 올린다.</p></section>'
write('impl/out/review/index.html',
      rtpl.replace('__TITLE__', html.escape(title)).replace('__ACCENT__', accent).replace('__BODY__', body))
