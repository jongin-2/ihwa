# ⚠️ 공용 원본 — ihwa-site/app-kit/store/erase_island.py. 앱 저장소에는 글자 그대로 복사해 둔다(impl/scripts/store/erase_island.py).
# 시뮬레이터 캡처에서 다이나믹 아일랜드(위 가운데 검은 알약)를 지운다 — 11-09 종인님 "앱 마켓 스크린샷등에 다이나믹 아일랜드 없게해".
#  · 왜 필요한가: iOS 26 시뮬레이터는 섬을 화면(프레임버퍼)에 직접 그린다. `simctl io screenshot`은 --mask=ignored·black·기본값
#    모두 섬이 찍혔다(11-09 코어 실측, iPhone 17 Pro Max 1320×2868: 섬 x 472~847·y 42~151). 찍는 방식으로는 못 뺀다.
#  · 하는 일: 위 가운데에서 섬 모양(완전히 검은 알약, 폭·높이가 기기 폭에 비례)을 찾아, 섬 상자 바로 바깥 네 변(왼·오·위·아래)
#    색을 함께 잇는 면(쿤스 패치)으로 메운다. 한 색·세로·가로·대각선 그라데이션 모두 자국이 남지 않는다(11-09 주량체커 제안).
#    섬을 가로지르는 줄은 양옆을 따라 이어지지만, 무늬(바둑판·사진·글자) 배경은 매끄러운 면으로 칠해져 네모 자국이 남는다 —
#    그런 장은 지우지 말고 섬이 안 찍힐 때까지 다시 찍는다(섬은 같은 기기에서도 찍히는 장·안 찍히는 장이 섞임, 11-09 한배).
#  · 안 지우는 것: 섬 안에 무언가 그려져 있으면(실시간 현황 점수 등 기능 그림) 검은 알약이 아니라서 건드리지 않는다.
#    섬을 못 찾으면 파일을 그대로 두고 '섬 없음'이라 알린다.
#  · 쓰는 법: python3 erase_island.py <PNG…>             제자리에서 고침
#            python3 erase_island.py --out <폴더> <PNG…>  고친 사본을 폴더에
#    고친 뒤 첫 장은 눈으로 확인(섬 자리·상태 막대 시계·아이콘이 그대로인지).
#    제자리 고침은 원본이 사라진다 — 지우기 전 원본을 따로 남겨 두면 이 도구가 바뀔 때 다시 지울 수 있다(11-09 주량체커 소개용 3장 못 다시 지움).
#    iCloud 폴더에 바로 쓰면 시간 초과(Errno 60)가 난다 — 스크래치에서 --out으로 지운 뒤 복사(11-09 주량체커).
#  · 표준 라이브러리만 쓴다(PIL 없음). 8비트 RGB·RGBA PNG만.
import os, struct, sys, zlib


def load(path):
    b = open(path, 'rb').read()
    assert b[:8] == b'\x89PNG\r\n\x1a\n', f'PNG 아님: {path}'
    i, idat, chunks = 8, b'', []
    while i < len(b):
        n = struct.unpack('>I', b[i:i + 4])[0]; t = b[i + 4:i + 8]; d = b[i + 8:i + 8 + n]
        if t == b'IHDR': w, h, bd, ct, _, _, il = struct.unpack('>IIBBBBB', d)
        elif t == b'IDAT': idat += d
        elif t not in (b'IEND',): chunks.append((t, d))
        i += 12 + n
    assert bd == 8 and ct in (2, 6) and il == 0, f'8비트 RGB·RGBA만(비트 {bd}, 색 {ct}, 인터레이스 {il}): {path}'
    bpp = 3 if ct == 2 else 4; stride = w * bpp
    raw = zlib.decompress(idat); rows = []; prev = bytearray(stride); p = 0
    for _ in range(h):
        f = raw[p]; line = bytearray(raw[p + 1:p + 1 + stride]); p += 1 + stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0; up = prev[x]; c = prev[x - bpp] if x >= bpp else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + up) & 255
            elif f == 3: line[x] = (line[x] + (a + up) // 2) & 255
            elif f == 4:
                pa, pb, pc = abs(up - c), abs(a - c), abs(a + up - 2 * c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else up if pb <= pc else c)) & 255
        rows.append(line); prev = line
    return w, h, ct, bpp, rows, chunks


def save(path, w, h, ct, rows, chunks):
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    keep = b''.join(chunk(t, d) for t, d in chunks if t in (b'sRGB', b'gAMA', b'cHRM', b'iCCP', b'pHYs'))
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0)) + keep
                           + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def find_island(w, rows, bpp):
    """가운데 줄에서 이어진 검은 구간으로 섬 범위(위·아래·줄마다 왼·오)를 찾는다. 못 찾으면 None."""
    dark = lambda y, x: max(rows[y][x * bpp:x * bpp + 3]) < 24
    c = w // 2; span = {}; y = 0; lim = int(w * 0.2)
    while y < lim and not dark(y, c): y += 1
    if y >= lim: return None
    top = y
    # 위에서 처음 만난 검은 구간을 가운데 열이 검은 동안 따라간다. 폭은 섬다운 줄(가운데 쪽 0.33~0.67w 안·폭 0.15w 이상)로만 잰다 —
    # 섬을 가로지르거나(게임 화면의 검은 가로줄) 섬 아래에 붙은 검은 그림이 있어도 섬 모양만 본다(11-09 한배 미니게임 화면에서 섬을 놓침)
    while y < lim and y - top <= 0.1 * w and dark(y, c):
        l = c
        while l > 0 and dark(y, l - 1): l -= 1
        r = c
        while r < w - 1 and dark(y, r + 1): r += 1
        if not (l < 0.33 * w or r > 0.67 * w or r - l + 1 < 0.15 * w): span[y] = (l, r)
        y += 1
    if len(span) < 0.03 * w or min(span) - top > 0.01 * w: return None
    # 섬은 알약이라 위 끝에서 가운데까지 폭이 넓어지다 좁아진다 → 위에서부터 가장 넓은 줄(가운데)을 찾고 같은 거리만큼 아래를 아래끝으로.
    ys = sorted(span); wid = [span[y][1] - span[y][0] for y in ys]; i = 0
    while i + 1 < len(wid) and wid[i + 1] >= wid[i]: i += 1
    j = i
    while j > 0 and wid[j - 1] == wid[i]: j -= 1
    bot = min(y - 1, top + round(ys[i] + ys[j] - 2 * top))
    span = {y: span[y] for y in ys if y <= bot}
    width = max(r - l + 1 for l, r in span.values()); height = bot - top + 1
    # 1320 폭에서 섬 376×110 — 기기 폭에 비례, 넉넉히 ±20%. 그 밖이면 섬이 아니다(화면 위가 원래 검은 경우 등)
    if not (0.23 * w <= width <= 0.34 * w and 0.067 * w <= height <= 0.1 * w and top < 0.06 * w): return None
    return top, bot, span


def erase(path, out):
    w, h, ct, bpp, rows, chunks = load(path)
    f = find_island(w, rows, bpp)
    if not f: print(f'섬 없음 — 그대로: {path}'); return False
    top, bot, span = f; pad = max(3, w // 300)
    L = min(l for l, r in span.values()) - pad; R = max(r for l, r in span.values()) + pad
    Y0 = max(1, top - pad); Y1 = min(h - 2, bot + pad)
    # 네 변을 함께 잇는다(쿤스 패치) — 줄마다 좌우만 이으면 대각선 그라데이션 벽지에서 네모난 띠 자국이 남는다(11-09 주량체커 잠금화면)
    px = lambda y, x: rows[y][x * bpp:(x + 1) * bpp]
    lc = {y: px(y, L - 2) for y in range(Y0 - 1, Y1 + 2)}; rc = {y: px(y, R + 2) for y in range(Y0 - 1, Y1 + 2)}
    tr = {x: px(Y0 - 1, x) for x in range(L - 2, R + 3)}; br = {x: px(Y1 + 1, x) for x in range(L - 2, R + 3)}
    c00, c10, c01, c11 = px(Y0 - 1, L - 2), px(Y0 - 1, R + 2), px(Y1 + 1, L - 2), px(Y1 + 1, R + 2)
    for y in range(Y0, Y1 + 1):
        v = (y - Y0 + 1) / (Y1 - Y0 + 2); line = rows[y]
        for x in range(L, R + 1):
            u = (x - L + 2) / (R - L + 4)
            line[x * bpp:(x + 1) * bpp] = bytes(max(0, min(255, round(
                (1 - u) * lc[y][k] + u * rc[y][k] + (1 - v) * tr[x][k] + v * br[x][k]
                - ((1 - u) * (1 - v) * c00[k] + u * (1 - v) * c10[k] + (1 - u) * v * c01[k] + u * v * c11[k])))) for k in range(bpp))
    save(out, w, h, ct, rows, chunks)
    print(f'섬 지움 x {L}~{R} · y {top}~{bot}: {out}'); return True


if __name__ == '__main__':
    args = sys.argv[1:]; outdir = None
    if args[:1] == ['--out']: outdir = args[1]; args = args[2:]; os.makedirs(outdir, exist_ok=True)
    if not args: print(__doc__ or '쓰기: erase_island.py [--out 폴더] <PNG…>'); sys.exit(2)
    for p in args: erase(p, os.path.join(outdir, os.path.basename(p)) if outdir else p)
