#!/usr/bin/env python3
"""src/*.md → docs/<이름>/index.html (GitHub Pages). 외부 라이브러리 없이 필요한 문법만 바꾼다:
제목(#·##·###), 문단, **굵게**, [글](주소), 가로줄(---), 그대로 둔 <a id>."""
import re, pathlib, html
ROOT = pathlib.Path(__file__).parent

# 사용자에게 보이는 운영자 표기 — 여기 한 곳에서만 바꾼다(src/*.md에는 {{키}}로 들어 있다).
# 2026-10-06 종인님: "아직 사업자를 낸 게 아니니 사용자에게 보이는 건 본명", "나중에 ihwa로 바꿀 거 고려해서
# 지금 노출되는 부분만 이종인으로". 사업자를 내면 아래를 ihwa 쪽 값으로 바꾸고 build.py → 푸시(앱 새 빌드 불필요).
# 함께 바꿀 곳(이 저장소 밖): App Store Connect 저작권(두 앱, 지금 "© 2026 Jongin Lee").
OPERATOR = {
    '운영_문장': '두 앱 모두 이종인이 운영하며, 개인정보 보호책임자도 겸합니다.',  # ihwa 때: 두 앱 모두 ihwa가 운영합니다(개인정보 보호책임자: 이종인).
    'OPERATED_SENTENCE': 'Both apps are operated by Jongin Lee, who is also the privacy officer.',  # ihwa 때: Both apps are operated by ihwa (privacy officer: Jongin Lee).
    '운영_줄': '운영자·개인정보 보호책임자: 이종인',  # ihwa 때: 운영: ihwa · 개인정보 보호책임자: 이종인
    'OPERATOR_LINE': 'Operator and privacy officer: Jongin Lee',  # ihwa 때: Operated by ihwa · Privacy officer: Jongin Lee
}
SITE_NAME = 'Jongin Lee'  # 첫 화면 제목 — ihwa 때: ihwa
TITLE_SUFFIX = ''         # 각 페이지 <title> 꼬리 — ihwa 때: ' — ihwa'
def fill(md):
    for k, v in OPERATOR.items(): md = md.replace('{{' + k + '}}', v)
    assert '{{' not in md, '채우지 못한 운영자 표기 자리'
    return md
CSS = """:root{--bg:#fff;--fg:#1c1c1e;--sub:#6e6e73;--line:#e5e5ea;--link:#0a7c3e}
@media (prefers-color-scheme:dark){:root{--bg:#000;--fg:#f2f2f7;--sub:#98989d;--line:#2c2c2e;--link:#4cd07d}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.7 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;word-break:keep-all;overflow-wrap:anywhere}
main{max-width:720px;margin:0 auto;padding:32px 16px 64px}h1{font-size:1.6rem;line-height:1.3;margin:0 0 8px}h2{font-size:1.3rem;margin:40px 0 8px}h3{font-size:1.05rem;margin:28px 0 4px}
p{margin:8px 0}a{color:var(--link)}hr{border:0;border-top:1px solid var(--line);margin:40px 0}.lang{color:var(--sub)}"""
def inline(t):
    t = html.escape(t, quote=False).replace('&lt;a id=', '<a id=').replace('&gt;&lt;/a&gt;', '></a>')
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', t)
    return t
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
        else: out.append(f'<p>{inline(b)}</p>')
    return title, '\n'.join(out)
for src in sorted((ROOT/'src').glob('*.md')):
    title, body = render(fill(src.read_text()))
    dst = ROOT/'docs'/src.stem/'index.html'; dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                   f'<meta name="robots" content="noindex"><title>{html.escape(title)}{TITLE_SUFFIX}</title><style>{CSS}</style></head><body><main>\n{body}\n</main></body></html>\n')
    print('→', dst.relative_to(ROOT))
    # 앱 안 웹뷰용 언어별 페이지(docs/<이름>/ko/, /en/) — 한국어 절과 English 절을 떼어 한 언어만 보여 준다.
    # 원문 구조: <a id="ko"></a> ## 한국어 … --- <a id="en"></a> ## English …
    md = fill(src.read_text())
    names = md.split('\n', 1)[0][2:].split(' · ')  # '# 이용약관 · Terms of Service'
    ko = md.split('<a id="ko"></a>', 1)[1].split('<a id="en"></a>', 1)[0].rsplit('\n---', 1)[0]
    en = md.split('<a id="en"></a>', 1)[1]
    for lang, part, name in (('ko', ko, names[0]), ('en', en, names[-1])):
        part = part.strip().split('\n', 1)[1]  # '## 한국어' / '## English' 줄은 뗀다
        _, lbody = render(f'# {name}\n\n' + part)
        ldst = ROOT/'docs'/src.stem/lang/'index.html'; ldst.parent.mkdir(parents=True, exist_ok=True)
        ldst.write_text(f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
                        f'<meta name="robots" content="noindex"><title>{html.escape(name)}{TITLE_SUFFIX}</title><style>{CSS}</style></head><body><main>\n{lbody}\n</main></body></html>\n')
        print('→', ldst.relative_to(ROOT))
(ROOT/'docs'/'index.html').write_text('<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' + SITE_NAME + '</title>'
    f'<style>{CSS}</style></head><body><main><h1>' + SITE_NAME + '</h1><p><a href="support/">고객 지원 · Support</a></p><p><a href="privacy/">개인정보처리방침 · Privacy Policy</a></p><p><a href="terms/">이용약관 · Terms of Service</a></p></main></body></html>\n')
