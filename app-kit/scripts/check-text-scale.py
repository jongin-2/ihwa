#!/usr/bin/env python3
"""큰 글씨(Dynamic Type) 글자 상한 검사 — 공용 원본 ihwa-site/app-kit/scripts/check-text-scale.py(앱에는 impl/scripts/에 글자 그대로 복사, 앱 값 없음).
처음 맵나이츠 3979d19(11-13 — 250곳 → 0곳), 코어가 공용으로 올림.
모든 <Text>·<TextInput>이 글자 배율을 어떻게 받을지 밝혔는지 본다(11-13 AX5에서 약관 동의 단추가 화면 밖으로 밀려 앱을 못 넘긴 사고).

규칙
  R1  여는 태그에 `maxFontSizeMultiplier={…}`(상한) 또는 값 없는 `allowFontScaling`(자유 — 늘어나고 스크롤되는 칸의 본문) 중 하나가 있어야 한다.
  R2  한 줄 고정(`numberOfLines={1}`)이 아닌 <Text>는 `lineBreakStrategyIOS="hangul-word"`가 있어야 한다(한글 낱말 줄바꿈).
      "standard"도 된다(조건식 안이어도) — UIKit NSParagraphStyle.h NSLineBreakStrategyStandard = 0xFFFF = 한글 어절 우선 + 끝줄 외톨이 밀어내기(11-13 알롱).
  R3  글자 크기 22 이상(style 안 `fontSize: 숫자`)은 상한이 `titleMul(…)`이거나 그 값 이하 숫자여야 한다(자유 금지).
  R4  자유(`allowFontScaling`)인데 한 줄 고정이면 안 된다(커지면 잘리거나 넘침 — 상한 + adjustsFontSizeToFit로).
  R5  `allowFontScaling={false}`는 쓰지 않는다(상한 1로 적는다 — 한 가지 표기). 예외: 같은 태그 style에 `cappedFontSize(`가 있으면
      (크기를 직접 계산 — maxFontSizeMultiplier는 그리기만 줄고 자리는 상한 없이 재서 옆이 밀림, 11-13 주량체커).
  앱 글자 래퍼: 파일이 Text를 'react-native'가 아닌 곳(../components/AppText 등)에서 가져오면 그 <Text>는 래퍼가 hangul-word를 걸고
      적지 않은 것은 자유(C, 본문은 iOS처럼 끝까지 커짐 — HIG)로 본다 → R1·R2 건너뜀, R3(22pt 이상)·R4(자유+한 줄 고정)는 그대로(11-13 주량체커 제안).
  R4 예외: 같은 태그에 adjustsFontSizeToFit(칸 폭에 맞춰 줄어듦) 또는 ellipsizeMode(일부러 말줄임 — iOS 설정 계정 줄 관례)가 있으면(11-13 주량체커).
  주석(// … · /* … */) 안의 <Text> 글자는 태그로 보지 않는다(문자열 안 '//'는 주석 아님).
  R6  한 줄 줄이기(adjustsFontSizeToFit)를 쓰는 <Text>의 style(태그 안이나 같은 파일 StyleSheet)에 lineHeight·고정 height를 직접 두지 않는다
      — iOS에서 글자가 4pt까지 줄어든다(11-13 알롱 69d168c5). 줄 높이가 필요하면 TextFit의 fitBox(줄 높이, 배율)를 같은 태그에.

쓰기
  python3 impl/scripts/check-text-scale.py            전체(위반이 있으면 종료 코드 1)
  python3 impl/scripts/check-text-scale.py <파일…>    그 파일만(코드 폴더 기준 경로나 절대 경로)
  python3 impl/scripts/check-text-scale.py --list     파일별 위반 수만
코드 폴더는 impl/app/src, 없으면 impl/ios/src(차곡). 공용 사본(AppDialog.tsx·TextFit.tsx·LegalDocView.tsx — 파일 이름으로)은 코어 원본에서 고치므로 보지 않는다.
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SRC = next((p for p in (os.path.join(ROOT, 'impl', 'app', 'src'), os.path.join(ROOT, 'impl', 'ios', 'src')) if os.path.isdir(p)), os.path.join(ROOT, 'impl', 'app', 'src'))
SRC_REL = os.path.relpath(SRC, ROOT)
SKIP = {'AppDialog.tsx', 'TextFit.tsx', 'LegalDocView.tsx'}  # 공용 사본 파일 이름(원본 ihwa-site/app-kit)


def title_mul(size):
    return 1.76 if size >= 34 else 2.07 if size >= 28 else 2.3 if size >= 24 else 2.55 if size >= 22 else 2.65


def mask_comments(src):
    """주석을 같은 길이 공백으로(줄바꿈은 남겨 줄 번호 유지). 따옴표·백틱 문자열 안은 그대로."""
    out, i, n, q = [], 0, len(src), None
    while i < n:
        c = src[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(src[i + 1]); i += 2; continue
            if c == q:
                q = None
            i += 1; continue
        if c in '\'"`':
            q = c; out.append(c); i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i); j = n if j < 0 else j
            out.append(' ' * (j - i)); i = j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            out.append(re.sub(r'[^\n]', ' ', src[i:j])); i = j; continue
        out.append(c); i += 1
    return ''.join(out)


def open_tags(src):
    """(시작 위치, 태그 이름, 여는 태그 글자) — 중괄호 깊이를 세어 `>`를 찾는다(화살표 함수 `=>` 제외)."""
    for m in re.finditer(r'<(TextInput|Text)(?=[\s/>])', src):
        depth, q = 0, m.end()
        while q < len(src):
            c = src[q]
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
            elif c == '>' and depth == 0 and src[q - 1] != '=':
                break
            q += 1
        yield m.start(), m.group(1), src[m.start():q + 1]


def wrapper_text(src):
    """Text를 react-native가 아닌 모듈(앱 래퍼)에서 가져오는지."""
    for m in re.finditer(r'import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*[\'"]([^\'"]+)[\'"]', src):
        names = [m.group(1) or ''] + [n.strip().split(' as ')[-1].strip() for n in (m.group(2) or '').split(',')]
        if 'Text' in names and m.group(3) != 'react-native':
            return True
    return False


NESTED = re.compile(r'\b\w+\s*:\s*\{[^{}]*\}')  # style 안 묶음 값(그림자 오프셋 등)


def balanced(src, i):
    """src[i]가 '{' 또는 '('일 때 짝 닫는 괄호까지의 글자."""
    op = src[i]; cl = '}' if op == '{' else ')'; d = 0
    for j in range(i, len(src)):
        if src[j] == op: d += 1
        elif src[j] == cl:
            d -= 1
            if d == 0: return src[i:j + 1]
    return src[i:]


def sheet_styles(src):
    """StyleSheet.create로 만든 변수 이름들과, 그 본문 안 스타일 이름 → 본문(한 단계)."""
    names, body = set(), {}
    for m in re.finditer(r'\b(?:const|let|var)\s+(\w+)\s*=\s*StyleSheet\.create\(', src):
        names.add(m.group(1))
        inner = balanced(src, m.end() - 1)
        body.update(re.findall(r'\b(\w+):\s*\{([^{}]*)\}', inner))
    return names, body


def style_attr(tag):
    """여는 태그의 style={…} 속성 안 글자(없으면 빈 글자)."""
    m = re.search(r'\bstyle=\{', tag)
    return balanced(tag, m.end() - 1) if m else ''


def check(rel, src):
    out = []
    wrap = wrapper_text(src)
    src = mask_comments(src)
    sheets, sheet = sheet_styles(src)  # StyleSheet.create로 만든 변수 이름들, 그 안 스타일 이름 → 본문(한 단계)
    for pos, name, tag in open_tags(src):
        line = src.count('\n', 0, pos) + 1
        capm = re.search(r'maxFontSizeMultiplier=\{([^}]*)\}', tag)
        free = re.search(r'\ballowFontScaling(?!\s*=)', tag) is not None
        one = re.search(r'numberOfLines=\{1\}', tag) is not None
        off = re.search(r'allowFontScaling=\{\s*false\s*\}', tag) is not None
        wrapped = wrap and name == 'Text'
        if wrapped and not capm and not off:
            free = True  # 래퍼 글자: 적지 않으면 자유
        if off and 'cappedFontSize(' not in tag:
            out.append((line, 'R5 allowFontScaling={false} 대신 maxFontSizeMultiplier={1}'))
        if not capm and not free and not off:
            out.append((line, f'R1 <{name}>에 maxFontSizeMultiplier(상한)나 allowFontScaling(자유)이 없음'))
        if capm and free:
            out.append((line, 'R1 상한과 자유를 함께 적음 — 하나만'))
        lbs = re.search(r'lineBreakStrategyIOS=(\"[^\"]*\"|\{[^}]*\})', tag)
        if name == 'Text' and not wrapped and not one and not (lbs and re.search(r'hangul-word|standard', lbs.group(1))):
            out.append((line, 'R2 여러 줄 <Text>에 lineBreakStrategyIOS(hangul-word 또는 standard)가 없음'))
        sizes = [float(x) for x in re.findall(r'fontSize:\s*(\d+(?:\.\d+)?)\b', tag)]
        if sizes and max(sizes) >= 22:
            big = max(sizes)
            if free:
                out.append((line, f'R3 글자 {big:g}pt(22 이상)는 자유 금지 — titleMul({big:g})'))
            elif capm and 'titleMul(' not in capm.group(1):
                try:
                    if float(capm.group(1)) > title_mul(big) + 1e-9:
                        out.append((line, f'R3 글자 {big:g}pt 상한 {capm.group(1)} > titleMul({big:g}) = {title_mul(big)}'))
                except ValueError:
                    pass  # 식(변수·함수)은 사람이 본다
        if name == 'Text' and 'adjustsFontSizeToFit' in tag and 'fitBox(' not in tag:
            sty = style_attr(tag)  # style={…} 속성 안만 본다(11-13 알롱 — maxFontSizeMultiplier={FONT_CAP.pill}의 pill을 컨테이너 스타일 pill과 잘못 짝지음)
            sty = NESTED.sub('', sty)  # textShadowOffset: { width, height } 같은 묶음 값 안 height는 고정 높이가 아님(11-13 맵나이츠)
            hit = re.search(r'(?<![\w])(lineHeight|height)\s*:', sty)
            if not hit:
                for obj, k in re.findall(r'\b(\w+)\.(\w+)\b', sty):
                    if obj in sheets and k in sheet and re.search(r'(?<![\w])(lineHeight|height)\s*:', sheet[k]):
                        hit = True; break
            if hit:
                out.append((line, 'R6 한 줄 줄이기 글자 style에 lineHeight·height — fitBox(줄 높이, 배율)로(iOS 4pt 버그)'))
        if free and one and 'adjustsFontSizeToFit' not in tag and 'ellipsizeMode' not in tag:
            out.append((line, 'R4 자유(allowFontScaling)인데 한 줄 고정 — 상한 + adjustsFontSizeToFit로'))
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    only_list = '--list' in sys.argv
    files = []
    if args:
        for a in args:
            p = a if os.path.isabs(a) else os.path.join(SRC, a)
            if not os.path.isfile(p):
                p2 = os.path.join(ROOT, a)
                p = p2 if os.path.isfile(p2) else p
            if not os.path.isfile(p):
                print(f'없는 파일: {a}')
                return 2
            files.append(p)
    else:
        for d, _, fs in os.walk(SRC):
            files += [os.path.join(d, f) for f in fs if f.endswith('.tsx')]
    total = 0
    for p in sorted(files):
        rel = os.path.relpath(p, SRC)
        if os.path.basename(rel) in SKIP:
            continue
        v = check(rel, open(p, encoding='utf-8').read())
        total += len(v)
        if only_list:
            if v:
                print(f'{len(v):4d} {rel}')
        else:
            for line, why in v:
                print(f'{SRC_REL}/{rel}:{line}: {why}')
    if total:
        print(f'✗ 큰 글씨 글자 상한 위반 {total}곳 — 고친 법은 이 파일 맨 위 규칙')
        return 1
    print(f'✓ 큰 글씨 글자 상한 — <Text>·<TextInput> 모두 상한 또는 자유를 밝힘({len(files)}개 파일)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
