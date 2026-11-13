#!/usr/bin/env python3
"""src/*.md → docs/<이름>/index.html (GitHub Pages). 외부 라이브러리 없이 필요한 문법만 바꾼다:
제목(#·##·###), 문단, **굵게**, [글](주소), 가로줄(---), 그대로 둔 <a id>, 표(| 칸 | — 2026-10-07 앱별 차이를 본문 중간에 표로 적기 위해 추가)."""
import re, pathlib, html
ROOT = pathlib.Path(__file__).parent

# 사용자에게 보이는 운영자 표기 — 여기 한 곳에서만 바꾼다(src/*.md에는 {{키}}로 들어 있다).
# 2026-10-06 종인님: "아직 사업자를 낸 게 아니니 사용자에게 보이는 건 본명", "나중에 ihwa로 바꿀 거 고려해서
# 지금 노출되는 부분만 이종인으로". 사업자를 내면 아래를 ihwa 쪽 값으로 바꾸고 build.py → 푸시(앱 새 빌드 불필요).
# 함께 바꿀 곳(이 저장소 밖): App Store Connect 저작권(주량체커·차곡, 지금 "© 2026 Jongin Lee").
OPERATOR = {
    '운영_문장': '이종인이 운영하며, 개인정보 보호책임자도 겸합니다.',  # ihwa 때: ihwa가 운영합니다(개인정보 보호책임자: 이종인). 차곡 출시 때 '두 앱 모두 …'로(pending/chagok/README.md)
    'OPERATED_SENTENCE': 'The app is operated by Jongin Lee, who is also the privacy officer.',  # ihwa 때: The app is operated by ihwa (privacy officer: Jongin Lee). 차곡 출시 때 'Both apps are …'로
    '운영_줄': '운영자·개인정보 보호책임자: 이종인',  # ihwa 때: 운영: ihwa · 개인정보 보호책임자: 이종인
    'OPERATOR_LINE': 'Operator and privacy officer: Jongin Lee',  # ihwa 때: Operated by ihwa · Privacy officer: Jongin Lee
}
SITE_NAME = 'Jongin Lee'  # 첫 화면 제목 — ihwa 때: ihwa
TITLE_SUFFIX = ''         # 각 페이지 <title> 꼬리 — ihwa 때: ' — ihwa'
# 앱별 문장 표시(11-13 주량체커 지적 — 공통 조항 문장에 다른 앱 이름이 남아 '그 앱만'으로 안 읽힘): 줄 끝 ' <!-- 전체만 -->'은 전체 문서에만,
# ' <!-- 앱만 a,b -->'는 그 앱들의 앱별 페이지에만 쓰인다(바로 위 '전체만' 줄의 앱별 문장). 전체 문서는 표시를 지워 그대로 나온다.
MARK_ALL, MARK_APP = ' <!-- 전체만 -->', re.compile(r' <!-- 앱만 ([a-z,]+) -->$')
def full_only(md): return '\n'.join(l.replace(MARK_ALL, '') for l in md.split('\n') if not MARK_APP.search(l))
def fill(md):
    for k, v in OPERATOR.items(): md = md.replace('{{' + k + '}}', v)
    assert '{{' not in md, '채우지 못한 운영자 표기 자리'
    return md
CSS = """:root{color-scheme:light dark;--bg:#fff;--fg:#1c1c1e;--sub:#6e6e73;--line:#e5e5ea;--link:#0a7c3e}
@media (prefers-color-scheme:dark){:root{--bg:#000;--fg:#f2f2f7;--sub:#98989d;--line:#2c2c2e;--link:#4cd07d}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.7 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;word-break:keep-all;overflow-wrap:break-word}
main{max-width:720px;margin:0 auto;padding:32px 16px 64px}h1{font-size:1.6rem;line-height:1.3;margin:0 0 8px}h2{font-size:1.3rem;margin:40px 0 8px}h3{font-size:1.05rem;margin:28px 0 4px}
p{margin:8px 0}a{color:var(--link)}hr{border:0;border-top:1px solid var(--line);margin:40px 0}.lang{color:var(--sub)}
.ver{margin:4px 0 20px}.ver select{font:inherit;font-size:min(1em,26px);color:var(--fg);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 28px 6px 10px;max-width:100%;box-sizing:border-box;height:max(44px,calc(1.25em + 14px))}.old{background:var(--line);border-radius:10px;padding:12px 14px;margin:0 0 20px}
.tbl{overflow-x:auto;margin:12px 0;background:linear-gradient(to right,var(--bg) 30%,rgba(0,0,0,0)) left/32px 100% no-repeat local,linear-gradient(to left,var(--bg) 30%,rgba(0,0,0,0)) right/32px 100% no-repeat local,radial-gradient(farthest-side at 0 50%,rgba(0,0,0,.22),rgba(0,0,0,0)) left/12px 100% no-repeat scroll,radial-gradient(farthest-side at 100% 50%,rgba(0,0,0,.22),rgba(0,0,0,0)) right/12px 100% no-repeat scroll}table{border-collapse:collapse;width:100%;font-size:.95rem}th,td{border:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}th{color:var(--sub);font-weight:600}
th,td{overflow-wrap:normal;min-width:6em}td a{overflow-wrap:anywhere}.nw{white-space:nowrap}
ul{margin:8px 0;padding-left:1.3em}li{margin:6px 0}li ul{margin:6px 0}"""
def inline(t):
    t = html.escape(t, quote=False).replace('&lt;a id=', '<a id=').replace('&gt;&lt;/a&gt;', '></a>')
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
    # 11-13 주량체커 비평 AX5: 📧과 주소가 따로 꺾이지 않게 한 덩어리로(본문은 break-word라 긴 주소만 줄 끝에서 꺾임)
    t = re.sub(r'📧 (<a href="mailto:[^"]+">[^<]+</a>)', r'<span class="nw">📧 \1</span>', t)
    return t
def table(b):
    """| 머리 | 머리 |\n|---|---|\n| 칸 | 칸 | → <table>. 둘째 줄(구분선)은 건너뛴다."""
    rows = [[c.strip() for c in l.strip().strip('|').split('|')] for l in b.split('\n')]
    head, body = rows[0], [r for r in rows[2:]]
    th = ''.join(f'<th>{inline(c)}</th>' for c in head)
    tr = ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in body)
    return f'<div class="tbl"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div>'
def bullets(b):
    """'- 항목' 줄과 두 칸 들여 쓴 '  - 하위 항목' 줄 → <ul>. 11-06까지는 목록을 그리지 않아 앱별 줄이 한 문단으로 뭉쳐 보였다(종인님 "가독성이 왜이리 안좋아")."""
    html_, open_sub = ['<ul>'], False
    for l in b.split('\n'):
        sub = l.startswith('  ')
        if sub and not open_sub: html_[-1] = html_[-1][:-5] + '<ul>'; open_sub = True  # 바로 앞 <li>를 닫지 않고 하위 목록을 연다
        elif not sub and open_sub: html_.append('</ul></li>'); open_sub = False
        html_.append(f'<li>{inline(l.strip()[2:])}</li>')
    if open_sub: html_.append('</ul></li>')
    return '\n'.join(html_ + ['</ul>'])
def render(md):
    out, title = [], ''
    blocks = []
    for block in md.strip().split('\n\n'):  # <a id> 줄 바로 밑 제목처럼 한 덩어리에 붙은 줄을 떼어 낸다
        lines = block.strip().split('\n')
        while lines and lines[0].startswith('<a id='):
            blocks.append(lines.pop(0))
        if lines: blocks.append('\n'.join(lines))
    for b in blocks:
        if b.startswith('# '): title = b[2:]; out.append(f'<h1>{inline(b[2:])}</h1>')
        elif b.startswith('## '): out.append(f'<h2>{inline(b[3:])}</h2>')
        elif b.startswith('### '): out.append(f'<h3>{inline(b[4:])}</h3>')
        elif b == '---': out.append('<hr>')
        elif b.startswith('<a id='): out.append(b)
        elif b.startswith('[한국어]'): out.append(f'<p class="lang">{inline(b)}</p>')
        elif all(l.startswith('|') for l in b.split('\n')): out.append(table(b))
        elif all(re.match(r' {0,2}- ', l) for l in b.split('\n')): out.append(bullets(b))
        else: out.append(f'<p>{inline(b)}</p>')
    return title, '\n'.join(out)
# ---- 이전 판 보관(2026-10-10 종인님 "개인정보처리방침은 수정하면 기존 본도 볼 수 있어야 해", "이용약관도") ----
# 문서를 고치기 전에 지금 판을 src/archive/<문서>/<그 판의 수정일>.md로 복사해 둔다(내용은 그대로, 운영자 표기 자리도 그대로).
# 빌드하면 /<문서>/archive/<날짜>/(+ /ko/·/en/)로 게시되고, 현재 판 끝에 '이전 버전' 목록이, 보관 판 위에는 "이전 판" 안내와 현재 판 링크가 붙는다.
LABEL = {'ko': ('버전', '이 문서는 {d} 판입니다.', '현재 버전 보기', '현재'),
         'en': ('Version', 'This is the version of {d}.', 'View the current version', 'current')}
# 날짜 표기: 한국어 2026. 10. 11.(토스·쿠팡 시행일 표기), 영어 2026-10-11
def fmt(d, lang): return f'{int(d[:4])}. {int(d[5:7])}. {int(d[8:10])}.' if lang == 'ko' else d
def current_date(md): m = re.search(r'최종 수정일: (\d{4}-\d{2}-\d{2})', md); return m.group(1) if m else None
def archives(stem):
    d = ROOT/'src'/'archive'/stem
    return sorted((x.stem for x in d.glob('*.md')), reverse=True) if d.exists() else []
def versions_html(stem, langs, prefix, cur=None, now=None, here=None):
    """문서 맨 위 버전 고르기(10-12 종인님 "이전 버전 확인하는 UI 다른 사례 보고 개선해, 보통 드롭다운 리스트박스 같은 형태야").
    예전엔 맨 아래 날짜 링크 한 줄이라 찾기 어려웠다. prefix = 지금 페이지에서 /<문서>/까지의 상대 경로, cur = 보고 있는 보관 판 날짜(현재 판이면 None).
    iOS 웹뷰에선 기본 선택 목록(휠)이 뜬다. 스크립트가 꺼져도 아래 noscript 링크로 갈 수 있다"""
    vs = archives(stem)
    if not vs: return ''
    rows = []
    for lang in langs:
        sub = '' if len(langs) > 1 else f'{lang}/'
        # 토스처럼 제목 바로 아래, 날짜가 곧 이름(10-12 사례 확인: 토스 제목 아래 시행일 드롭다운, 쿠팡 본문 끝 "다른 버전 보기")
        head = f'{fmt(now, lang)} ({LABEL[lang][3]})' if now else LABEL[lang][3]
        opts = [(here or f'{prefix}{sub}', head, cur is None)] + [(f'{prefix}archive/{v}/{sub}', fmt(v, lang), cur == v) for v in vs]  # here = 앱별 페이지의 현재 판 주소(자기 자신)
        o = ''.join(f'<option value="{u}"{" selected" if sel else ""}>{html.escape(t)}</option>' for u, t, sel in opts)
        links = ' · '.join(f'<a href="{u}">{html.escape(t)}</a>' for u, t, _ in opts)
        rows.append(f'<p class="ver"><select aria-label="{LABEL[lang][0]}" onchange="location.href=this.value">{o}</select>'
                    f'<noscript> {links}</noscript></p>')
    return ''.join(rows)
def banner_html(date, langs, prefix):
    """보관 판 맨 위 안내. prefix = 보관 페이지에서 /<문서>/까지의 상대 경로."""
    rows = []
    for lang in langs:
        sub = '' if len(langs) > 1 else f'{lang}/'
        rows.append(f'{LABEL[lang][1].format(d=fmt(date, lang))} <a href="{prefix}{sub}">{LABEL[lang][2]}</a>')
    return '<p class="old">' + '<br>'.join(rows) + '</p>'
def page(dst, lang, title, body):
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                   f'<meta name="robots" content="noindex"><title>{html.escape(title)}{TITLE_SUFFIX}</title><style>{CSS}</style></head><body><main>\n{body}\n</main></body></html>\n')
    print('→', dst.relative_to(ROOT))
def split_lang(md):
    """원문 구조: <a id="ko"></a> ## 한국어 … --- <a id="en"></a> ## English … → (이름들, 한국어 본문, 영어 본문)"""
    names = md.split('\n', 1)[0][2:].split(' · ')  # '# 이용약관 · Terms of Service'
    ko = md.split('<a id="ko"></a>', 1)[1].split('<a id="en"></a>', 1)[0].rsplit('\n---', 1)[0]
    en = md.split('<a id="en"></a>', 1)[1]
    return names, ko.strip().split('\n', 1)[1], en.strip().split('\n', 1)[1]  # '## 한국어' / '## English' 줄은 뗀다
def under_title(body, extra):
    """버전 고르기를 제목(h1) 바로 아래에"""
    i = body.find('</h1>')
    return body[:i + 5] + extra + body[i + 5:] if i >= 0 else extra + body
NOW = {}
def build(md, base, stem, archived=None):
    """base = 출력 폴더(docs/<문서> 또는 docs/<문서>/archive/<날짜>). archived = 보관 판 날짜(현재 판이면 None)."""
    if not archived: NOW[stem] = current_date(md)
    title, body = render(md)
    up = '../../' if archived else ''
    top = banner_html(archived, ['ko', 'en'], up) if archived else ''
    page(base/'index.html', 'ko', title, top + under_title(body, versions_html(stem, ['ko', 'en'], up, archived, NOW.get(stem))))
    # 앱 안 웹뷰용 언어별 페이지(/ko/, /en/) — 한 언어만 보여 준다.
    names, ko, en = split_lang(md)
    for lang, part, name in (('ko', ko, names[0]), ('en', en, names[-1])):
        _, lbody = render(f'# {name}\n\n' + part)
        up = '../../../' if archived else '../'
        top = banner_html(archived, [lang], up) if archived else ''
        page(base/lang/'index.html', lang, name, top + under_title(lbody, versions_html(stem, [lang], up, archived, NOW.get(stem))))
# 방침에는 개인정보만 쓴다(2026-10-15 종인님 "개인정보 아닌 건 제거하고 이런 일 없게 해") — 개인정보가 아닌 내용의 낱말이
# 현재 방침에 들어 있으면 빌드를 멈춘다. 보관 판(archive)은 당시 문서 그대로라 보지 않는다. 낱말을 빼려면 이유와 함께 여기서.
# 위젯 낱말 자체는 막지 않는다 — 응원석 위젯 토큰은 서버에 보관하는 정보라 방침에 들어간다(10-15). 기기 안 공유 공간 설명만 막는다
NOT_PERSONAL = ['위젯 공유', '공유 공간', 'App Group', 'shared container', 'iCloud', 'App Check', '오픈소스', 'open-source']  # 닉네임은 계정 이름 칸에 저장돼 개인정보다 — 10-15 조사 후 다시 넣음
_pv = (ROOT/'src'/'privacy.md').read_text(encoding='utf-8')
_hit = [w for w in NOT_PERSONAL if w.lower() in _pv.lower()]
if _hit:
    raise SystemExit(f'✋ 개인정보처리방침에 개인정보가 아닌 내용이 있습니다: {_hit} — README "방침에 쓰는 것과 쓰지 않는 것"')

for src in sorted((ROOT/'src').glob('*.md')):
    build(full_only(fill(src.read_text())), ROOT/'docs'/src.stem, src.stem)
    for v in archives(src.stem):
        build(fill((ROOT/'src'/'archive'/src.stem/f'{v}.md').read_text()), ROOT/'docs'/src.stem/'archive'/v, src.stem, archived=v)
# ---- 앱별 페이지(2026-11-13 종인님 "앱별 주소로 나눠") ----
# 앱 안에서 약관·방침을 열면 다른 앱 조항이 섞여 보였다. 원본은 하나로 두고, 빌드 때 '공통 + 그 앱'만 남긴 페이지를
# /<문서>/<앱>/(ko|en)/로 만든다(Google·카카오의 공통 문서 + 서비스별 문서 방식). 앱(LegalDocView)은 자기 주소만 연다.
# 거르는 규칙 — 원본을 쓸 때 이 모양을 지킨다:
#  · '**적용 앱: …**'·'**Applies to: …**' → 그 앱 이름만
#  · 앱 이름만 굵게 쓴 머리 문단('**주량체커·차곡** — …')부터 다음 머리 문단·제목 전까지가 그 앱 묶음
#  · '### <앱> 추가 조항'·'### <App> addendum' 절
#  · 머리에 '앱'·'App(s)'이 든 표는 그 칸에 다른 앱 이름만 있는 줄을 뺀다('모든 앱'은 남김)
#  · 목록 줄: 굵은 머리가 있으면 머리의 앱 이름으로, 없으면 줄 전체의 앱 이름으로 — 다른 앱만 적힌 줄을 뺀다
#  · 앱 칸이 없는 묶음 표는 첫 칸이 다른 앱 이름으로 시작하는 줄만 뺀다, 머리 문단 이름은 그 앱 이름만으로
#  · 그 밖의 문단은 그대로 — 이용 연령·공개 글처럼 여러 앱의 범위를 정하는 법 문장이라 문장을 잘라 내면 뜻이 바뀐다
# 새 앱은 출시 준비 때 여기와 원본 문서에 함께 넣는다(맵나이츠는 아직 — 앱은 app 없이 전체 문서를 연다).
APPS = {'drinkchecker': ('주량체커', 'DrinkChecker'), 'cheerseat': ('응원석', 'CheerSeat'), 'chagok': ('차곡', 'Chagok'),
        'allong': ('알롱', 'Allong'), 'sameboat': ('한배', 'SameBoat')}
SITE = 'https://jongin-2.github.io/ihwa'
def names_in(t): return {k for k, (ko, en) in APPS.items() if ko in t or re.search(rf'\b{en}\b', t)}
def only_names(t):
    r = t
    for ko, en in APPS.values(): r = r.replace(ko, '').replace(en, '')
    return names_in(t) and not re.sub(r'[·,\s]|\band\b', '', r)
def own_list(t, app):
    """'주량체커·차곡·알롱'·'Chagok, CheerSeat, SameBoat'·'DrinkChecker and Chagok'처럼 앱 이름만 이어 쓴 나열을 그 앱 이름 하나로."""
    names = '|'.join(re.escape(n) for v in APPS.values() for n in v)
    pat = rf'(?:{names})(?:(?:·|, | and )(?:{names}))+'
    ko, en = APPS[app]
    return re.sub(pat, lambda m: (ko if ko in m.group(0) else en) if app in names_in(m.group(0)) else m.group(0), t)
def for_app(md, app):
    out, skip = [], False
    kept = []
    for l in md.split('\n'):
        if MARK_ALL in l: continue
        m = MARK_APP.search(l)
        if m and app not in m.group(1).split(','): continue
        kept.append(MARK_APP.sub('', l))
    for b in '\n'.join(kept).split('\n\n'):
        s = b.strip()
        if not s: continue
        if s.startswith('#'):
            m = re.match(r'#+ (.+?) (추가 조항|addendum)$', s)
            skip = bool(m) and app not in names_in(m.group(1))
            if not skip: out.append(b)
            continue
        if re.match(r'\*\*(적용 앱|Applies to): ', s):
            out.append(re.sub(r'(\*\*(?:적용 앱|Applies to): ).*?\*\*', lambda m: m.group(1) + APPS[app][0 if '적용' in m.group(1) else 1] + '**', s)); continue
        lead = re.match(r'\*\*([^*]+)\*\* —', s)
        if lead and only_names(lead.group(1)):
            skip = app not in names_in(lead.group(1))
            if not skip: s = s.replace(lead.group(0), f'**{APPS[app][0] if re.search(r"[가-힣]", lead.group(1)) else APPS[app][1]}** —', 1)
        if skip: continue
        lines = s.split('\n')
        if all(l.startswith('|') for l in lines):
            head = [c.strip() for c in lines[0].strip('|').split('|')]
            col = next((i for i, c in enumerate(head) if re.search(r'앱|\bapps?\b', c, re.I)), None)
            if col is not None:
                keep = [l for l in lines[2:] if not names_in(l.strip('|').split('|')[col]) or app in names_in(l.strip('|').split('|')[col])]
                if not keep: continue
                lines = lines[:2] + [own_list(l, app) for l in keep]
            else:  # 앱 칸이 없는 묶음 표: 첫 칸이 다른 앱 이름으로 시작하는 줄('차곡 기록(…)')만 뺀다
                lines = lines[:2] + [l for l in lines[2:] if not ((n := names_in(l.strip('|').split('|')[0].strip().split('(')[0].split(' ')[0])) and app not in n)]
            out.append('\n'.join(lines)); continue
        if all(re.match(r' {0,2}- ', l) for l in lines):
            keep, drop = [], False
            for l in lines:
                if not l.startswith('  '):
                    bl = re.match(r'- \*\*([^*]+)\*\*', l)
                    n = names_in(bl.group(1)) if bl else names_in(l)
                    drop = bool(n) and app not in n
                if not drop: keep.append(re.sub(r'^- \*\*([^*]+)\*\*', lambda m: f'- **{own_list(m.group(1), app)}**' if only_names(m.group(1)) else m.group(0), l))
            if keep: out.append('\n'.join(keep))
            continue
        out.append(s)
    # 그 앱에 해당하지 않는 절(원본에 앱만 줄로 '이 앱에는 해당하지 않습니다'를 둔 절)은 빼고 번호를 다시 매긴다(11-13 타사 조사: Google·Microsoft·Apple·카카오는
    # 서비스별 문서에 '해당 없음' 절을 두지 않고 빼며, Apple은 국가별 판마다 절을 다시 매김. 개인정보보호위원회 작성지침도 해당 없는 항목 생략 허용). 'N절'·'section N' 참조도 함께 고치고, 뺀 절을 가리키면 멈춘다.
    NA = ('이 앱에는 해당하지 않습니다.', 'This section does not apply to this app.')
    out = [b.strip() for b in out]
    kept, removed, i = [], [], 0
    while i < len(out):
        h = re.match(r'### (\d+)\. ', out[i])
        if h and i + 1 < len(out) and out[i + 1].strip() in NA: removed.append(int(h.group(1))); i += 2; continue
        kept.append(out[i]); i += 1
    nums = [int(m.group(1)) for b in kept for m in [re.match(r'### (\d+)\. ', b)] if m]
    new = {n: k + 1 for k, n in enumerate(nums)}
    md = '\n\n'.join(kept)
    for n in removed: assert not re.search(rf'(?<!\d){n}절|[Ss]ection {n}\b', md), f'{app}: 뺀 {n}절을 가리키는 참조'
    md = re.sub(r'^### (\d+)\. ', lambda m: f'### {new[int(m.group(1))]}. ', md, flags=re.M)
    md = re.sub(r'(?<!\d)(\d+)절', lambda m: f'{new.get(int(m.group(1)), int(m.group(1)))}절', md)
    md = re.sub(r'\b([Ss]ection) (\d+)\b', lambda m: f'{m.group(1)} {new.get(int(m.group(2)), int(m.group(2)))}', md)
    for d in ('terms', 'privacy'):
        for lang in ('ko', 'en'): md = md.replace(f'{SITE}/{d}/{lang}/', f'{SITE}/{d}/{app}/{lang}/')
    return md
for stem in ('terms', 'privacy'):
    names, ko, en = split_lang(fill((ROOT/'src'/f'{stem}.md').read_text()))
    for app, (ko_name, en_name) in APPS.items():
        for lang, part, name in (('ko', ko, names[0]), ('en', en, names[-1])):
            part = for_app(part, app)
            other = {APPS[a][0 if lang == 'ko' else 1] for a in APPS if a != app}
            hit = [h for h in re.findall(r'^### (.+?) (?:추가 조항|addendum)$', part, re.M) if h in other]
            assert not hit and APPS[app][0 if lang == 'ko' else 1] in part, f'{stem}/{app}/{lang} 거르기 실패 {hit}'
            left = sorted({n for a, v in APPS.items() if a != app for n in v if n in part})
            if left: print(f'  · {stem}/{app}/{lang} 공통 문장에 남은 다른 앱 이름: {left}')
            _, lbody = render(f'# {name}\n\n' + part)
            page(ROOT/'docs'/stem/app/lang/'index.html', lang, name, under_title(lbody, versions_html(stem, [lang], '../../', None, NOW.get(stem), here='./')))

# ---- 옛 주소 이동 페이지 ----
# 지원 페이지는 2026-10-10에 내렸지만, 판매 중인 주량체커 1.2.0의 ko·en-US·en-GB 스토어 지원 URL이 /support/(ko|en)/에 고정돼 있다
# (출시된 버전은 supportUrl을 못 고침 — 409). 그 링크가 404가 되지 않게 방침 페이지(문의 이메일 포함)로 넘긴다.
# 다음 버전에서 세 현지화의 supportUrl을 방침 주소로 바꾼 뒤에도, 옛 버전을 보는 사람이 있을 수 있어 남겨 둔다.
REDIRECTS = {}  # 10-20 종인님 "만들어" — /support/는 다시 실제 지원 페이지(src/support.md)
for old, new in REDIRECTS.items():
    for sub in ('', 'ko/', 'en/'):
        dst = ROOT/'docs'/old/sub/'index.html'; dst.parent.mkdir(parents=True, exist_ok=True)
        target = f'../{new}/{sub}' if not sub else f'../../{new}/{sub}'
        dst.write_text(f'<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex">'
                       f'<meta http-equiv="refresh" content="0; url={target}"><link rel="canonical" href="{target}"><title>→</title></head>'
                       f'<body><p><a href="{target}">개인정보처리방침 · Privacy Policy</a></p></body></html>\n')
        print('→', dst.relative_to(ROOT), '(이동)')
(ROOT/'docs'/'index.html').write_text('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' + SITE_NAME + '</title>'
    f'<style>{CSS}</style></head><body><main><h1>' + SITE_NAME + '</h1><p><a href="privacy/">개인정보처리방침 · Privacy Policy</a></p><p><a href="terms/">이용약관 · Terms of Service</a></p><p><a href="support/">고객 지원 · Support</a></p></main></body></html>\n')
