#!/usr/bin/env python3
# 프로토타입 수준이 다섯 앱 같은지 본다 — 원본 ihwa-site/app-kit/scripts/check-prototype-level.py, 앱마다 impl/scripts/로 글자 그대로 복사해
# check-docs-sync.sh에서 부른다. 기준 전문은 app-kit/prototype/README.md '수준 기준'.
# 2026-11-06 종인님 "여전히 앱마다 프로토타입 수준이 다르잖아" — 색 대조(check-design-system.py)만으로는 모양·깊이가 맞지 않았다.
#
# 막는 것(종료 코드 1):
#  ① 디자인 시스템: 공통 토큰 이름(색 9·글자 11)이 있고, 간격 3·모서리 2 이상, notes.html(아이콘·재질·움직임)이 있다
#  ② 컴포넌트: 공통 UI 패턴 14가지를 data-pattern="이름"으로 그린다(앱에 없는 것은 screens.json "patternsNA": {"이름": "이유"})
#  ③ 화면 탭: 목업마다 폰 하나(.proto-device 정확히 1 — 여러 폰을 늘어놓은 갤러리 금지), 상태 단추 2개 이상(.proto-controls 안 <button>),
#     목업 안 다크 단추 금지(프로토타입 머리 '시스템/라이트/다크' 단추를 쓴다), 상태 막대 시각 9:41(애플 제품 화면 관례), screens.json path 탭 금지
import json, os, re, subprocess, sys
from html.parser import HTMLParser


def repo_root(p=os.path.dirname(os.path.abspath(__file__))):
    while not os.path.exists(os.path.join(p, '.git')):
        if os.path.dirname(p) == p:
            sys.exit('✋ 저장소 맨 위(.git)를 찾지 못했습니다')
        p = os.path.dirname(p)
    return p


ROOT = repo_root()
P = lambda *a: os.path.join(ROOT, *a)
cfg = json.load(open(P('prd', 'prototype', 'screens.json'), encoding='utf-8'))
read = lambda rel: open(P(*rel.split('/')), encoding='utf-8').read()
fails = []

CORE_COLORS = ['bg', 'card', 'label', 'label-sub', 'separator', 'fill', 'accent', 'on-accent', 'destructive']
CORE_TYPE = ['large-title', 'title1', 'title2', 'title3', 'headline', 'body', 'callout', 'subhead', 'footnote', 'caption1', 'caption2']  # iOS 글자 스타일 11
PATTERNS = {
    'nav-title': '큰 제목·내비게이션 막대', 'tab-bar': '탭 막대', 'list-row': '목록 행', 'button-primary': '주 단추',
    'button-secondary': '보조 단추', 'button-destructive': '삭제·위험 단추', 'dialog': '확인 창(AppDialog)', 'sheet': '바텀시트',
    'toast': '토스트', 'empty': '빈 화면', 'error': '오류·오프라인', 'loading': '불러오는 중', 'switch': '스위치', 'segmented': '세그먼트',
}

# ① 디자인 시스템
tokens = read('prd/design-system/tokens.css') if os.path.exists(P('prd', 'design-system', 'tokens.css')) else ''
names = set(re.findall(r'(--[\w-]+)\s*:', tokens))
miss = [f'--c-{n}' for n in CORE_COLORS if f'--c-{n}' not in names] + [f'--t-{n}' for n in CORE_TYPE if f'--t-{n}' not in names]
if miss:
    fails.append('공통 토큰 없음: ' + ', '.join(miss))
for pre, need, what in (('--s-', 3, '간격'), ('--r-', 2, '모서리')):
    if len([n for n in names if n.startswith(pre)]) < need:
        fails.append(f'{what} 토큰({pre}) {need}개 미만')
if not os.path.exists(P('prd', 'design-system', 'notes.html')):
    fails.append('prd/design-system/notes.html 없음 — 아이콘·재질(Liquid Glass)·움직임을 그림으로')

# ② 공통 패턴
comp = read('prd/components/mockup.html') if os.path.exists(P('prd', 'components', 'mockup.html')) else ''
drawn = set(re.findall(r'data-pattern="([\w-]+)"', comp))
na = cfg.get('patternsNA') or {}
for k, label in PATTERNS.items():
    if k not in drawn and k not in na:
        fails.append(f'컴포넌트 목업에 공통 패턴 없음: {label} (data-pattern="{k}", 앱에 없으면 screens.json patternsNA에 이유)')


# ③ 화면 탭
class Scan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.devices = 0
        self.stack = []      # 열린 요소마다 proto-controls 안인지
        self.buttons = []    # proto-controls 안 단추 글자
        self.cur = None

    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get('class') or ''
        if re.search(r'\bproto-device\b', cls):
            self.devices += 1
        inside = (self.stack[-1] if self.stack else False) or bool(re.search(r'\bproto-controls\b', cls))
        if tag not in ('br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'path', 'circle', 'rect', 'line', 'use', 'stop'):
            self.stack.append(inside)
        if tag == 'button' and inside:
            self.cur = ''

    def handle_endtag(self, tag):
        if tag == 'button' and self.cur is not None:
            self.buttons.append(self.cur.strip())
            self.cur = None
        if self.stack and tag not in ('br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'path', 'circle', 'rect', 'line', 'use', 'stop'):
            self.stack.pop()

    def handle_data(self, d):
        if self.cur is not None:
            self.cur += d


SHELL = os.path.expanduser('~/.cache/ihwa/chrome-headless-shell/chrome-headless-shell-mac-arm64/chrome-headless-shell')


def rendered(rel):
    """상태 단추를 스크립트로 그리는 목업도 있어 렌더 뒤 DOM을 본다(화면 없는 크롬 전용 실행 파일 — 일반 크롬 헤드리스 금지)."""
    if not os.path.exists(SHELL):
        sys.exit('✋ chrome-headless-shell 없음 — bash ~/Projects/core/chrome-shell.sh 로 받을 것(일반 크롬으로 대신하지 않음)')
    r = subprocess.run([SHELL, '--dump-dom', '--virtual-time-budget=3000', '--hide-scrollbars', 'file://' + P(*rel.split('/'))],
                       capture_output=True, text=True, timeout=60)
    return r.stdout or read(rel)


for s in cfg.get('screens', []):
    if s.get('path'):
        fails.append(f"화면 탭 '{s['label']}': path 탭 금지 — 앱 화면 목업(prd/<화면>/mockup.html)만")
        continue
    rel = f"prd/{s['key']}/mockup.html"
    if not os.path.exists(P(*rel.split('/'))):
        continue
    text = rendered(rel)
    sc = Scan()
    sc.feed(re.sub(r'<script\b.*?</script>|<style\b.*?</style>', '', text, flags=re.S | re.I))
    tag = f"화면 탭 '{s['label']}'"
    if sc.devices != 1:
        fails.append(f'{tag}: 폰(.proto-device) {sc.devices}개 — 폰 하나에 상태 단추로 바꿔 보이게')
    states = [b for b in sc.buttons if '다크' not in b and 'Dark' not in b]
    if len(states) < 2:
        fails.append(f'{tag}: 상태 단추 {len(states)}개 — 기본 + 앱에서 뜨는 경우(창·시트·오류·빈 화면…)를 단추로')
    if any('다크' in b or 'Dark' in b for b in sc.buttons):
        fails.append(f'{tag}: 목업 안 다크 단추 — 프로토타입 머리의 시스템/라이트/다크 단추를 쓴다')
    if '9:41' not in text:
        fails.append(f'{tag}: 상태 막대 시각이 9:41이 아님')

if fails:
    print(f'✗ 프로토타입 수준 점검 실패 {len(fails)}건')
    for f in fails:
        print('  - ' + f)
    sys.exit(1)
print('✓ 프로토타입 수준 점검 통과 — 공통 토큰·패턴 14·화면마다 폰 하나·상태 단추')
