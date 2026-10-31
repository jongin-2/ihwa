#!/usr/bin/env python3
# ⚠️ 공용 원본 — ihwa-site/app-kit/scripts/check-store-shots.py. 앱 저장소 impl/scripts/에 글자 그대로 복사해 둔다.
# 스토어 스크린샷의 기기 틀이 공용 값(app-kit/store/device_frame.py: 바깥 928, 왼쪽·오른쪽 196, 위 740)과 맞는지 픽셀로 잰다.
# 10-31 종인님 "다시는 이런문제없게" — 응원석·한배·알롱 틀이 14px 오른쪽으로 치우쳐 제출됨(content-box 테두리).
# 쓰는 법: check-store-shots.py <PNG 또는 폴더>...   (폴더는 아래 *.png 전부, 1320×2868만 검사)
#   --measure를 붙이면 장마다 잰 왼쪽·오른쪽을 찍는다.
#   종료 코드 0 = 모두 맞음, 1 = 어긋난 장 있음. ASC 업로드 스크립트가 올리기 전에 부른다.
#   틀 위에 장식이 겹치는 줄은 건너뛰도록 여러 높이를 재서, 틀이 보이는 줄의 과반이 맞아야 통과.
# 필요한 것: macOS sips(기본 설치) — PNG를 BMP로 풀어 읽는다(외부 라이브러리 없음).
import os, struct, subprocess, sys, tempfile

W, H = 1320, 2868
OUTER_W, LEFT, TOP, BEZEL = 928, 196, 740, 14
ROWS = range(1000, 2700, 100)
TOL = 1   # 허용 오차(px)


def load_bmp(png):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, 'x.bmp')
        r = subprocess.run(['sips', '-s', 'format', 'bmp', png, '--out', out], capture_output=True, text=True)
        if not os.path.exists(out):   # iCloud에서 아직 안 받은 파일 등
            raise SystemExit(f'❌ 읽지 못함 {png}: {r.stderr.strip() or r.stdout.strip()} — iCloud 파일이면 brctl download 뒤 다시')
        b = open(out, 'rb').read()
    off = struct.unpack_from('<I', b, 10)[0]
    w, h = struct.unpack_from('<ii', b, 18)
    bpp = struct.unpack_from('<H', b, 28)[0] // 8
    stride = (w * bpp + 3) & ~3
    def px(x, y):   # BMP는 아래에서 위로(h>0), 색 순서 BGR
        row = (h - 1 - y) if h > 0 else y
        i = off + row * stride + x * bpp
        return b[i + 2], b[i + 1], b[i]
    return w, abs(h), px


def near(a, c, t=18):
    return sum(abs(p - q) for p, q in zip(a, c)) <= t


def check(png, measure=False):
    w, h, px = load_bmp(png)
    if (w, h) != (W, H):
        return None
    color = px(W // 2, TOP + BEZEL // 2)   # 위 테두리 한가운데 = 틀 색
    msgs, good, seen, got = [], 0, 0, []
    if near(px(W // 2, TOP - 3), color) or not near(px(W // 2, TOP + 1), color):
        msgs.append(f'위 테두리가 {TOP}에서 시작하지 않음')
    for y in ROWS:
        xs = [x for x in range(W) if near(px(x, y), color)]
        if not xs:
            continue
        l, r = xs[0], W - 1 - xs[-1]
        # 양쪽 틀이 BEZEL 두께로 이어지는 줄만 센다(장식이 겹친 줄은 건너뜀)
        if not (all(near(px(x, y), color) for x in range(l, l + BEZEL - 2))
                and all(near(px(W - 1 - x, y), color) for x in range(r, r + BEZEL - 2))):
            continue
        seen += 1
        got.append((l, r))
        if abs(l - LEFT) <= TOL and abs(r - LEFT) <= TOL:
            good += 1
    if measure:
        print(f'{png}: 틀 색 {color} 왼쪽·오른쪽 {sorted(set(got))[:3]}')
    if seen == 0:
        msgs.append(f'틀 색 {color}의 틀을 찾지 못함')
    elif good * 2 <= seen:
        l, r = max(set(got), key=got.count)
        msgs.append(f'왼쪽 {l}·오른쪽 {r}(둘 다 {LEFT}이어야 함)')
    return msgs


def main(args):
    files = []
    for a in args:
        if os.path.isdir(a):
            for root, _, fs in os.walk(a):
                files += [os.path.join(root, f) for f in sorted(fs) if f.lower().endswith('.png')]
        else:
            files.append(a)
    bad = n = 0
    for f in files:
        m = check(f, MEASURE)
        if m is None:
            continue
        n += 1
        if m:
            bad += 1
            print(f'❌ {f}: ' + ' · '.join(m[:3]))
    print(f'{"✅" if not bad else "❌"} 스토어 스크린샷 기기 틀 {n}장 검사, 어긋남 {bad}장')
    return 1 if bad or not n else 0


MEASURE = '--measure' in sys.argv   # 잰 값을 모두 찍기(점검용)
if __name__ == '__main__':
    sys.exit(main([a for a in sys.argv[1:] if a != '--measure'] or ['.']))
