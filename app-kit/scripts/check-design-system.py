#!/usr/bin/env python3
# 디자인 시스템 → 컴포넌트 → 화면 목업이 한 줄로 이어졌는지 본다 — 원본 ihwa-site/app-kit/scripts/check-design-system.py,
# 앱마다 impl/scripts/check-design-system.py로 글자 그대로 복사하고 check-docs-sync.sh에서 부른다. 규칙 전문은 app-kit/prototype/README.md.
# 2026-11-06 종인님 "프로토타입이 앱마다 다 다르고 엉망 … 최신 디자인 시스템이랑 컴포넌트랑 각 화면이 있어야지".
#
# 막는 것(종료 코드 1):
#  ① 최신: 코드 테마 파일(screens.json "theme")의 색 값 = prd/design-system/tokens.css의 색 값(양쪽 모두, 대소문자 무시)
#  ② 컴포넌트 전부: 코드 컴포넌트 폴더(screens.json "components.dir")의 파일마다 prd/components/mockup.html에 data-component="파일 이름"
#     (화면이 없는 파일은 "components.skip": {"파일": "이유"})
#  ③ 화면은 공용 CSS만: prd/<화면>/mockup.html이 tokens.css·components.css를 링크하고, <style>·style=""에 색 값을 직접 적지 않는다
#     (팀 색·아이템 그림처럼 내용인 색은 "contentColors"에, SVG 그림 안과 data: 주소는 보지 않음). components.css·컴포넌트 목업도 같다.
#  ④ 크기도 최신(11-13 주량체커 제안, 맵나이츠 목업 낡은 수치 전파): tokens.css의 간격(--s-)·모서리(--r-) px 값이 코드 테마 파일에 숫자로 있다
#     (목업에만 있는 값 — iOS가 그리는 시트 모서리 등 — 은 "mockOnlySizes": {"--r-이름": "이유"}, 999 이상 알약 모서리는 뺌).
#     글자(--t-)는 보지 않는다 — iOS 기본 글자 크기·줄 높이를 옮긴 값이라 코드에 없는 게 정상(여섯 앱 시험에서 오탐뿐).
import json, os, re, sys


def repo_root(p=os.path.dirname(os.path.abspath(__file__))):
    while not os.path.exists(os.path.join(p, '.git')):
        if os.path.dirname(p) == p:
            sys.exit('✋ 저장소 맨 위(.git)를 찾지 못했습니다')
        p = os.path.dirname(p)
    return p


ROOT = repo_root()
P = lambda *a: os.path.join(ROOT, *a)
cfg = json.load(open(P('prd', 'prototype', 'screens.json'), encoding='utf-8'))
fails = []
# rgb()·rgba()는 괄호 안이 숫자·점·쉼표·공백·%·/일 때만 색 — 코드의 계산식(rgba(${…}), rgba(c.card, 0))까지 색으로 읽어 막았다(11-13 한배, AppDialog 흐림 띠).
COLOR = re.compile(r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(\s*[0-9.\s,%/]+\)|hsla?\([^)]*\)')


def norm(c):
    c = c.lower().replace(' ', '')
    if re.fullmatch(r'#[0-9a-f]{3}', c):
        c = '#' + ''.join(x * 2 for x in c[1:])
    m = re.fullmatch(r'(rgba?)\(([^)]*)\)', c)
    if m:  # rgba(255,255,255,.7) = rgba(255,255,255,0.70) — 숫자 표기만 다른 것은 같게(11-07 Swift opacity 대조)
        try:
            c = m.group(1) + '(' + ','.join(f'{float(x):g}' for x in m.group(2).split(',')) + ')'
        except ValueError:
            pass
    return c


def swift_opacity(src):
    # 위젯 Swift의 반투명 색을 rgba로 읽는다(11-07 차곡 widget-plus·widget-empty — 전엔 mockOnly로 뺐음):
    #   Color.white.opacity(0.7)·.black.opacity(.4) → rgba(255,255,255,0.7)
    #   ink(#RRGGBB).opacity(0.5)·Color(hex: #RRGGBB).opacity(0.5)(0x는 위에서 #로 바꾼 뒤) → rgba(r,g,b,0.5)
    #   값이 숫자 그대로인 것만(변수·식은 안 읽음)
    def hexa(m):
        h, a = m.group(1), m.group(2)
        return f'rgba({int(h[0:2], 16)},{int(h[2:4], 16)},{int(h[4:6], 16)},{a})'
    src = re.sub(r'\b\w+\(\s*(?:hex:\s*)?#([0-9A-Fa-f]{6})\s*\)\.opacity\(\s*([0-9]*\.?[0-9]+)\s*\)', hexa, src)
    src = re.sub(r'(?:\bColor)?\.white\.opacity\(\s*([0-9]*\.?[0-9]+)\s*\)', r'rgba(255,255,255,\1)', src)
    src = re.sub(r'(?:\bColor)?\.black\.opacity\(\s*([0-9]*\.?[0-9]+)\s*\)', r'rgba(0,0,0,\1)', src)
    return src


def read(rel):
    return open(P(*rel.split('/')), encoding='utf-8').read()


def strip_comments(t):
    return re.sub(r'/\*.*?\*/|//[^\n]*|<!--.*?-->', '', t, flags=re.S)


tokens_rel = 'prd/design-system/tokens.css'
if not os.path.exists(P(*tokens_rel.split('/'))):
    sys.exit(f'✋ {tokens_rel}이 없습니다 — app-kit/prototype/README.md대로 디자인 시스템을 먼저 만드세요')
tokens = strip_comments(read(tokens_rel))
token_colors = {norm(c) for c in COLOR.findall(tokens)}
# 반대 방향(토큰 → 코드)은 색 토큰(--c-)만 — 그림자·재질 값은 코드의 다른 파일에 있을 수 있다
# 목업 전용 토큰(코드에 값이 없는 것 — iOS가 그리는 경고창·메뉴의 사본, 목업 틀 등)은 screens.json "mockOnlyColors": {"--c-이름": "이유"}에 밝히고 이 대조에서 뺀다(11-06 차곡 회신)
mock_only = cfg.get('mockOnlyColors') or {}
for k in mock_only:
    if not re.search(re.escape(k) + r'\s*:', tokens):
        fails.append(f'mockOnlyColors {k}: tokens.css에 없음')
# systemColors에 연결한 토큰도 값이 코드에 없으니(iOS가 정함) 같은 대조에서 뺀다 — 코드가 이름조차 안 쓰는 기본 컨트롤 색(Switch의 systemGreen 등)도 systemColors에 적어도 된다(11-06 응원석 회신)
skip_tokens = set(mock_only) | set((cfg.get('systemColors') or {}).values())
c_token_colors = {norm(c) for k, v in re.findall(r'(--c-[\w-]+)\s*:\s*([^;]+);', tokens) if k not in skip_tokens for c in COLOR.findall(v)}
bad_prefix = sorted(set(re.findall(r'(--(?!c-|t-|s-|r-|sh-|m-)[\w-]+)\s*:', tokens)))
if bad_prefix:
    fails.append('tokens.css 머리말은 --c-·--t-·--s-·--r-·--sh-·--m-만: ' + ', '.join(bad_prefix[:6]) + (' …' if len(bad_prefix) > 6 else ''))

# ① 코드 테마 = 토큰
theme_files = cfg.get('theme') or []
if not theme_files:
    fails.append('screens.json에 "theme": [코드 테마 파일 경로]가 없습니다')
code_colors = set()
for rel in theme_files:
    if not os.path.exists(P(*rel.split('/'))):
        fails.append(f'테마 파일이 없습니다: {rel}')
        continue
    src = strip_comments(read(rel))
    if rel.endswith('.swift'):  # 위젯 Swift의 Color(hex: 0xRRGGBB) 꼴도 대조(11-06 차곡 회신) — 여섯 자리만(여덟 자리는 알파 순서가 코드마다 달라 안 봄)
        src = re.sub(r'\b0x([0-9A-Fa-f]{6})\b', r'#\1', src)
        src = swift_opacity(src)
    code_colors |= {norm(c) for c in COLOR.findall(src)}
for c in sorted(code_colors - token_colors):
    fails.append(f'코드 테마에 있는 색이 tokens.css에 없음: {c}')
for c in sorted(c_token_colors - code_colors):
    fails.append(f'tokens.css에 있는 색이 코드 테마에 없음(옛 값?): {c}')

# ④ 간격·모서리 토큰 값 = 코드 테마의 숫자
mock_sizes = cfg.get('mockOnlySizes') or {}
for k in mock_sizes:
    if not re.search(re.escape(k) + r'\s*:', tokens):
        fails.append(f'mockOnlySizes {k}: tokens.css에 없음')
code_nums = set()
for rel in theme_files:
    if os.path.exists(P(*rel.split('/'))):
        code_nums |= {float(x) for x in re.findall(r'(?<![\w.#])(\d+(?:\.\d+)?)(?![\w])', strip_comments(read(rel)))}
seen_size = set()
for k, v in re.findall(r'(--(?:s|r)-[\w-]+)\s*:\s*([^;]+);', tokens):
    if k in seen_size or k in mock_sizes:
        continue
    seen_size.add(k)
    for x in re.findall(r'(\d+(?:\.\d+)?)px', v):
        f = float(x)
        if f and f < 999 and f not in code_nums:
            fails.append(f'tokens.css {k} {x}px가 코드 테마에 없음(옛 값? 목업 전용이면 screens.json "mockOnlySizes")')

# ①-2 시스템 색: 코드가 값 없이 이름만 쓰는 색(PlatformColor('label')·UIColor.systemBlue·Color(.secondaryLabel))은
#   screens.json "systemColors": {"이름": "--c-토큰"}으로 어느 토큰인지 밝힌다. 값은 앱이 QA 앱 시뮬레이터 캡처에서 재 넣는다(11-06 응원석 회신).
sysmap = cfg.get('systemColors') or {}
light_tokens = set(re.findall(r'(--c-[\w-]+)\s*:', tokens))
sys_names = set()
for rel in theme_files:
    if os.path.exists(P(*rel.split('/'))):
        src = strip_comments(read(rel))
        sys_names |= set(re.findall(r'PlatformColor\(\s*[\'"](\w+)[\'"]', src))
        sys_names |= set(re.findall(r'UIColor\.(system\w+|\w*[Ll]abel|separator|opaqueSeparator)\b', src))
        sys_names |= set(re.findall(r'Color\(\s*\.(\w+)\s*\)', src))
for n in sorted(sys_names - {'white', 'black', 'clear'}):  # 모드와 무관한 고정 색은 값이 분명해 뺌
    t = sysmap.get(n)
    if not t:
        fails.append(f'코드의 시스템 색 {n}이 screens.json "systemColors"에 없음(어느 --c- 토큰인지)')
    elif t not in light_tokens:
        fails.append(f'systemColors {n} → {t}: tokens.css에 그 --c- 토큰이 없음')

# ② 컴포넌트 전부
comp_html_rel = 'prd/components/mockup.html'
comp = cfg.get('components') or {}
if not os.path.exists(P(*comp_html_rel.split('/'))):
    fails.append(f'{comp_html_rel}이 없습니다')
    comp_html = ''
else:
    comp_html = read(comp_html_rel)
drawn = set(re.findall(r'data-component="([^"]+)"', comp_html))
cdir = comp.get('dir')
if not cdir:
    fails.append('screens.json에 "components": {"dir": 코드 컴포넌트 폴더}가 없습니다')
elif os.path.isdir(P(*cdir.split('/'))):
    skip = comp.get('skip') or {}
    for f in sorted(os.listdir(P(*cdir.split('/')))):
        stem, ext = os.path.splitext(f)
        if ext not in ('.tsx', '.ts', '.swift', '.jsx', '.js') or f in skip or stem in skip:
            continue
        if stem not in drawn:
            fails.append(f'컴포넌트 목업에 없음: {cdir}/{f} (data-component="{stem}")')
    for name in sorted(drawn):
        if not any(os.path.splitext(f)[0] == name for f in os.listdir(P(*cdir.split('/')))):
            fails.append(f'컴포넌트 목업에 코드에 없는 컴포넌트: {name}(지운 것이면 목업에서도 빼기)')
else:
    fails.append(f'컴포넌트 폴더가 없습니다: {cdir}')

# ③ 공용 CSS만
allowed = {norm(c) for c in cfg.get('contentColors', [])}


def literal_colors(text):
    text = strip_comments(text)
    text = re.sub(r'<svg\b.*?</svg>', '', text, flags=re.S | re.I)          # 그림 안의 색은 내용
    text = re.sub(r'url\(\s*["\']?data:[^)]*\)', '', text)                     # 바탕 그림 data: 주소
    text = re.sub(r'<style data-shared[^>]*>.*?</style>', '', text, flags=re.S)
    parts = re.findall(r'<style[^>]*>(.*?)</style>', text, flags=re.S | re.I) + re.findall(r'\sstyle="([^"]*)"', text)
    if not re.search(r'<[a-z]', text, re.I):                                   # .css 파일 그 자체
        parts = [text]
    return sorted({norm(c) for p in parts for c in COLOR.findall(p)} - allowed)


targets = [('prd/components/components.css', False), (comp_html_rel, 'comp')]
for s in cfg.get('screens', []):
    if s.get('path'):  # 앱 캡처처럼 목업이 아닌 탭은 보지 않는다
        continue
    targets.append((f"prd/{s['key']}/mockup.html", 'screen'))
for rel, kind in targets:
    if not os.path.exists(P(*rel.split('/'))):
        fails.append(f'파일이 없습니다: {rel}')
        continue
    text = read(rel)
    if kind:
        for href in ('../design-system/tokens.css', '../components/components.css'):  # 컴포넌트 목업도 같은 경로(prd/components/에서도 맞음)
            if not re.search(r'<link[^>]+href="' + re.escape(href) + '"', text):
                fails.append(f'{rel}: <link rel="stylesheet" href="{href}"> 없음')
    lits = literal_colors(text)
    if lits:
        fails.append(f'{rel}: 색 값을 직접 적음 {len(lits)}개 — 토큰(var(--c-…))으로: ' + ', '.join(lits[:6]) + (' …' if len(lits) > 6 else ''))

# ④ 모서리: components.css에 --r- 토큰과 같은 값을 숫자로 적으면 토큰으로(11-07 차곡 — 목업 .card가 14로 박혀 코드 16과 어긋난 채 남음).
#   토큰에 없는 값(스위치 알약 등 그 컴포넌트만의 모서리)은 숫자 그대로 둬도 된다.
r_tokens = {}
for name, val in re.findall(r'(--r-[\w-]+)\s*:\s*([0-9.]+px)', tokens):
    r_tokens.setdefault(val, []).append(name)
if os.path.exists(P('prd', 'components', 'components.css')):
    css = re.sub(r'/\*.*?\*/', '', read('prd/components/components.css'), flags=re.S)
    hits = {}
    for v in re.findall(r'border-radius\s*:\s*([0-9.]+px)\s*[;}]', css):
        if v in r_tokens:
            hits[v] = hits.get(v, 0) + 1
    if hits:
        fails.append('components.css: 토큰과 같은 모서리를 숫자로 적음 — var(--r-…)로: '
                     + ', '.join(f"{v}×{n} → {'/'.join(r_tokens[v])}" for v, n in sorted(hits.items())))

if fails:
    print('✗ 디자인 시스템 점검 실패')
    for f in fails:
        print('  - ' + f)
    sys.exit(1)
print(f'✓ 디자인 시스템 점검 통과 — 토큰 색 {len(token_colors)}개 = 코드, 컴포넌트 {len(drawn)}개, 화면 {len(targets) - 2}개 공용 CSS만')
