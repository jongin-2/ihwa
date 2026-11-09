#!/usr/bin/env python3
# 공용 프로토타입·시안 검토판 생성기 — 원본 ihwa-site/app-kit/prototype/build-prototype.py, 앱마다 impl/scripts/build-prototype.py로 글자 그대로 복사한다.
# 앱마다 다른 값은 prd/prototype/screens.json 하나: {"title", "accent", "theme": [코드 테마 파일], "components": {...}, "screens": [{"key", "label", "path"(선택)}]}
#   path가 없으면 prd/<key>/mockup.html. 규칙 전문은 app-kit/prototype/README.md.
# 프로토타입 탭은 늘 ① 디자인 시스템(prd/design-system/tokens.css에서 자동 생성) ② 컴포넌트(prd/components/mockup.html) ③ 화면들 순서.
#   목업의 <link href="../design-system/tokens.css">·<link href="../components/components.css">는 여기서 본문에 끼워 넣는다(파일로 열어도 같은 모양).
# 만드는 것(둘 다 깃 무시 impl/out/ — Artifact로 게시하는 원본):
#   impl/out/prototype/index.html  ← impl/prototype/template.html + 디자인 시스템 + 컴포넌트 + 목업들(base64)
#   impl/out/review/index.html     ← impl/prototype/review-template.html + impl/out/review/body.html(없으면 "진행 중인 시안 없음")
# 2026-10-15 네 앱 통일(종인님 "통일하게 해", "모바일에서 주로 보는 것도 고려", "반응형으로 하면 되는거 아니야?").
# 2026-11-06 디자인 시스템·컴포넌트 탭 추가(종인님 "프로토타입이 앱마다 다 다르고 엉망 … 최신 디자인 시스템이랑 컴포넌트랑 각 화면이 있어야지").
import base64, html, json, os, re, subprocess, sys


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


TOKENS = P('prd', 'design-system', 'tokens.css')
COMP_CSS = P('prd', 'components', 'components.css')
COMP_HTML = P('prd', 'components', 'mockup.html')
# 디자인 시스템으로 옮기기 전 앱은 경고만 하고 예전처럼 화면 탭만 만든다(옮긴 뒤엔 check-design-system.py가 막는다)
HAS_DS = os.path.exists(TOKENS)
if not HAS_DS:
    print('⚠ prd/design-system/tokens.css 없음 — 디자인 시스템·컴포넌트 탭 없이 만듦(app-kit/prototype/README.md대로 옮길 것)')


def read(path):
    return open(path, encoding='utf-8').read()


def inline_shared(text):
    """목업의 공용 CSS 링크를 본문 <style>로 바꾼다 — 프로토타입은 srcdoc이라 상대 경로를 못 읽는다."""
    for href, path in (('../design-system/tokens.css', TOKENS), ('../components/components.css', COMP_CSS)):
        pat = re.compile(r'<link[^>]+href="' + re.escape(href) + r'"[^>]*>')
        if pat.search(text):
            if not os.path.exists(path):
                sys.exit(f'✋ 목업이 {href}를 쓰는데 파일이 없습니다')
            text = pat.sub(lambda m, c=read(path): f'<style data-shared="{href}">\n{c}\n</style>', text)
    return text


def blocks(css):
    """tokens.css → {'light': {이름: 값}, 'dark': {이름: 값}}. 라이트는 맨 앞 :root{}, 다크는 :root[data-theme="dark"]{}."""
    out = {'light': {}, 'dark': {}}
    for sel, body in re.findall(r'([^{}]+)\{([^{}]*)\}', re.sub(r'/\*.*?\*/', '', css, flags=re.S)):
        sel = sel.strip()
        mode = 'dark' if sel == ':root[data-theme="dark"]' else 'light' if sel == ':root' else None
        if mode:
            for k, v in re.findall(r'(--[\w-]+)\s*:\s*([^;]+);', body):
                out[mode].setdefault(k, v.strip())
    return out


GROUPS = [('--c-', '색', '라이트·다크 두 값. 화면·컴포넌트는 이 이름만 쓴다.'), ('--t-', '글자', 'font 값 그대로(굵기 크기/줄 높이).'),
          ('--s-', '간격', ''), ('--r-', '모서리', ''), ('--sh-', '그림자·재질', ''), ('--m-', '움직임', '시간·곡선.')]


MOCK_ONLY = cfg.get('mockOnlyColors') or {}


def design_system_page():
    css = read(TOKENS)
    t = blocks(css)
    if not t['light']:
        sys.exit('✋ tokens.css에 :root { --이름: 값; } 이 없습니다')
    E = html.escape
    sec = []
    rest = [k for k in t['light'] if not any(k.startswith(g[0]) for g in GROUPS)]
    for pre, name, note in GROUPS + [('', '그 밖', '')]:
        keys = [k for k in t['light'] if k.startswith(pre)] if pre else rest
        if not keys:
            continue
        rows = []
        for k in keys:
            lv, dv = t['light'][k], t['dark'].get(k, t['light'][k])
            if pre == '--c-':
                demo = f'<span class="sw" style="background:{E(lv)}"></span><span class="sw" style="background:{E(dv)}"></span>'
                val = E(lv) + ('' if dv == lv else f' · <i>다크</i> {E(dv)}')
            elif pre == '--t-':
                demo = f'<span class="ty" style="font:{E(lv)}">가나다 Aa 123</span>'; val = E(lv)
            elif pre == '--s-':
                demo = f'<span class="sp" style="width:{E(lv)}"></span>'; val = E(lv)
            elif pre == '--r-':
                demo = f'<span class="rd" style="border-radius:{E(lv)}"></span>'; val = E(lv)
            elif pre == '--sh-':
                demo = f'<span class="rd" style="box-shadow:{E(lv)};background:var(--ds-card)"></span>'; val = E(lv)
            else:
                demo = ''; val = E(lv) + ('' if dv == lv else f' · <i>다크</i> {E(dv)}')
            if k in MOCK_ONLY:  # 코드에 값이 없는 목업 전용 토큰(screens.json mockOnlyColors)
                val += f' · <b>목업 전용</b> {E(MOCK_ONLY[k])}'
            rows.append(f'<div class="row"><div class="demo">{demo}</div><code>{E(k)}</code><span class="v">{val}</span></div>')
        sec.append(f'<section><h2>{name} <small>{len(keys)}</small></h2>' + (f'<p>{note}</p>' if note else '') + ''.join(rows) + '</section>')
    extra = P('prd', 'design-system', 'notes.html')  # 선택: 아이콘·재질·움직임처럼 값으로 못 보이는 것(본문 조각)
    if os.path.exists(extra):
        sec.append(read(extra))
    return ('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>디자인 시스템</title><style>'
            ':root{--ds-bg:#f2f2f7;--ds-card:#fff;--ds-text:#1c1c1e;--ds-sub:#6b6b70;--ds-line:#e2e2e6}'
            '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ds-bg:#000;--ds-card:#1c1c1e;--ds-text:#fff;--ds-sub:#98989d;--ds-line:#38383a;color-scheme:dark}}'
            ':root[data-theme="dark"]{--ds-bg:#000;--ds-card:#1c1c1e;--ds-text:#fff;--ds-sub:#98989d;--ds-line:#38383a;color-scheme:dark}'
            'body{margin:0;background:var(--ds-bg);color:var(--ds-text);font:15px/1.45 -apple-system,"Apple SD Gothic Neo",system-ui,sans-serif}'
            'main{max-width:760px;margin:0 auto;padding:16px max(16px,env(safe-area-inset-left)) 48px;display:grid;gap:16px}'
            'section{background:var(--ds-card);border-radius:16px;padding:14px 16px}h2{margin:0 0 4px;font-size:17px}h2 small{color:var(--ds-sub);font-weight:500}'
            'section>p{margin:0 0 8px;color:var(--ds-sub);font-size:13px}.row{display:grid;grid-template-columns:minmax(0,150px) minmax(0,1fr);gap:2px 12px;padding:9px 0;border-top:1px solid var(--ds-line);align-items:center}'
            '.row .demo{grid-row:span 2;display:flex;gap:6px;align-items:center;min-width:0}.row code{font:600 13px ui-monospace,Menlo,monospace;overflow-wrap:anywhere}.row .v{color:var(--ds-sub);font-size:12px;overflow-wrap:anywhere}'
            '.sw{width:40px;height:40px;border-radius:10px;box-shadow:inset 0 0 0 1px rgba(127,127,127,.35)}.ty{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
            '.sp{display:block;height:12px;background:currentColor;opacity:.5;border-radius:3px;max-width:100%}.rd{display:block;width:56px;height:40px;border:1.5px solid var(--ds-sub)}'
            f'</style><style data-shared="tokens">{css}</style></head><body><main>' + ''.join(sec) + '</main></body></html>')


screens = []


def add(key, label, text):
    screens.append({'key': key, 'label': label, 'html': base64.b64encode(inline_shared(text).encode()).decode()})


if HAS_DS:
    if not os.path.exists(COMP_HTML):
        sys.exit('✋ prd/components/mockup.html이 없습니다 — 컴포넌트를 모두 그린 목업이 있어야 합니다')
    add('design-system', '디자인 시스템', design_system_page())
    add('components', '컴포넌트', read(COMP_HTML))
for s in cfg['screens']:
    if s['key'] in ('design-system', 'components'):
        sys.exit(f"✋ screens.json에 {s['key']}를 넣지 마세요 — 자동으로 맨 앞에 붙습니다")
    path = P(*(s.get('path') or f"prd/{s['key']}/mockup.html").split('/'))
    if not os.path.exists(path):
        sys.exit(f'✋ 목업이 없습니다: {os.path.relpath(path, ROOT)}')
    add(s['key'], s['label'], read(path))

tpl = open(P('impl', 'prototype', 'template.html'), encoding='utf-8').read()
for k in ('__TITLE__', '__ACCENT__', '__UPDATED__', '__SCREENS__'):
    if k not in tpl:
        sys.exit(f'✋ template.html에 {k} 자리가 없습니다 — app-kit 원본을 다시 복사하세요')
write('impl/out/prototype/index.html',
      tpl.replace('__TITLE__', html.escape(title)).replace('__ACCENT__', accent).replace('__UPDATED__', updated)
         .replace('__SCREENS__', json.dumps(screens, ensure_ascii=False)))

rtpl = open(P('impl', 'prototype', 'review-template.html'), encoding='utf-8').read()
body_path = P('impl', 'out', 'review', 'body.html')
body = open(body_path, encoding='utf-8').read() if os.path.exists(body_path) else \
    '  <section class="empty"><h1>진행 중인 시안 없음</h1><p>시안을 비교할 일이 생기면 이 자리에 올린다.</p></section>'
write('impl/out/review/index.html',
      rtpl.replace('__TITLE__', html.escape(title)).replace('__ACCENT__', accent).replace('__BODY__', body))
