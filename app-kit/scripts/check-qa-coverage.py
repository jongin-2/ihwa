#!/usr/bin/env python3
"""QA 누락 검사 — 공용 원본(코어 관리, 앱에는 글자 그대로 복사). 앱마다 다른 값은 impl/scripts/qa-config.json(없어도 됨)에만 둔다.

왜(2026-09-29 종인님 "V1.1 해야 하는 것도 QA까지 완료했어?", "다시는 이런 누락 없도록 해"): "QA 실패 0"만 보고 완료라고 했는데
  ① 한 번도 실행하지 않은 케이스가 있었고 ② "실행 불가"의 대부분은 방법이 있었고 ③ 같은 번호가 두 케이스에 쓰였다.

막는 것
 1. spec/qa/TESTCASES.md에서 케이스를 하나도 못 읽음(번호 형식 문제로 헛통과 방지)
 2. 케이스 번호 중복
 3. QA_RESULT.md 결과 표에 한 번도 안 나온 케이스
 4. 마지막 결과 행이 "실행 불가"인데 `시도:`가 없거나, 이미 방법이 있는 사유(SOLVABLE)인 것
 5. 마지막 결과 행의 결과 칸에 판정(통과·실패·실행 불가·폐기·고침·보류)이 없는 것
 6. --release <버전>: 첫 출시(1.0·1.0.0)는 "## <버전> 전체 회귀" 절에 모든 케이스,
    그 뒤는 "## <버전> 출시 회귀" 절에 돌린 케이스 1건 이상 + `> 승계: 나머지는 <직전 버전> 결과` 줄
    (옛 "## <버전> 전체 회귀" 절이 있으면 그것도 받는다). 설정 release_mode가 "full"이면 늘 전체 회귀 절("## 빌드 7 전체 회귀").
작업 기록 위치: 환경변수 QA_WORK_DIR > iCloud ihwa/<저장소 폴더 이름>/work/ > 저장소 impl/qa/ (옛 위치).
사용: python3 impl/scripts/check-qa-coverage.py [--root <저장소>] [--release <버전>]   (표준 라이브러리만, 저장소 파일은 쓰지 않음)
설정(impl/scripts/qa-config.json, 모두 선택): {"app": "폴더와 iCloud 이름이 다를 때", "release_mode": "incremental"|"full",
  "frames_hint": "화면 녹화 프레임 추출 도구 안내", "strict_rows": true(결과를 표 첫 칸 번호로만 인정 — 기본은 글 어디에 나와도 인정), "extra_solvable": {"사유 낱말": "방법"}, "testcases": "spec/qa/TESTCASES.md"}
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True
ap = argparse.ArgumentParser()
ap.add_argument('--root')
ap.add_argument('--release')
ap.add_argument('--config', help='설정 파일 위치(시험용 — 기본은 <저장소>/impl/scripts/qa-config.json)')
args = ap.parse_args()


def find_root():
    if args.root:
        return Path(args.root).resolve()
    for start in (Path(__file__).resolve().parent, Path.cwd().resolve()):
        for p in (start, *start.parents):
            if (p / '.git').exists():
                return p
    raise SystemExit('✋ 저장소 맨 위(.git)를 못 찾음 — --root <저장소>로 지정')


ROOT = find_root()
cfg_path = Path(args.config) if args.config else ROOT / 'impl/scripts/qa-config.json'
CFG = json.loads(cfg_path.read_text(encoding='utf-8')) if cfg_path.exists() else {}
APP = CFG.get('app') or ROOT.name

SF_DATALESS = 0x40000000  # macOS: 내용이 iCloud에만 있는 자리표시자


def read_local(path: Path, timeout=120) -> str:
    if hasattr(os.stat(path), 'st_flags') and os.stat(path).st_flags & SF_DATALESS:
        subprocess.run(['brctl', 'download', str(path)], capture_output=True)
        end = time.time() + timeout
        while os.stat(path).st_flags & SF_DATALESS:
            if time.time() > end:
                raise SystemExit(f'✋ iCloud에서 내려받지 못함: {path}')
            time.sleep(1)
    return path.read_text(encoding='utf-8')


def qa_result_path() -> Path:
    if os.environ.get('QA_WORK_DIR'):
        return Path(os.environ['QA_WORK_DIR']).expanduser() / 'QA_RESULT.md'
    icloud = Path.home() / 'Library/Mobile Documents/com~apple~CloudDocs/ihwa' / APP / 'work' / 'QA_RESULT.md'
    if icloud.exists():
        return icloud
    old = ROOT / 'impl/qa/QA_RESULT.md'
    if old.exists():
        return old
    raise SystemExit(f'✋ QA_RESULT.md가 없음: {icloud} 또는 {old}')


TC = read_local(ROOT / CFG.get('testcases', 'spec/qa/TESTCASES.md'))
QR_PATH = qa_result_path()
QR = read_local(QR_PATH)

FRAMES = CFG.get('frames_hint', '화면 녹화 → 프레임 추출')
SOLVABLE = {  # 이미 방법을 찾은 사유 — 이 말로 "실행 불가"를 적으면 막는다
    '새로 설치': '새 시뮬레이터를 만들어 설치(xcrun simctl create)',
    '앱 삭제': '새 시뮬레이터를 만들어 설치',
    '스크린샷으로': FRAMES,
    '캡처 타이밍': '화면 녹화 프레임',
    '애니메이션': '화면 녹화 프레임',
    '강제로 실패': '저장 폴더(RCTAsyncLocalStorage_V1)를 밖에서 읽기 전용으로',
    '강제 실패': '저장 폴더를 읽기 전용으로',
    '시간 배분': '시간은 사유가 아니다 — 실행한다',
    '미실행': '실행한다',
    '범위 밖': '실행한다',
}
SOLVABLE.update(CFG.get('extra_solvable', {}))

# 번호: 앞부분(HOME, RULE4, ACC-DEL, NAV-404) + '-' + [글자]숫자[소문자] (SC-A1, SCAN-T3, HOME-73a). 가운데 숫자 칸은 뒤에 하이픈이 더 있을 때만.
PREFIX = r'[A-Z][A-Z0-9]*(?:-(?:[A-Z][A-Z0-9]*|\d+(?=-)))*'
ID = PREFIX + r'-[A-Z]?\d+[a-z]?'
VERDICT = re.compile(r'통과|실패|실행 불가|실기기 대기|폐기|고침|미실행|보류')
BLOCKED = ('실행 불가', '실기기 대기')  # 시도 기록이 있어야 하는 상태

ids = re.findall(rf'^\|\s*({ID})\s*\|', TC, re.M)


def expand(cell: str) -> list[str]:
    """결과 표 첫 칸의 번호 묶음 — "A-01·02", "DEP-02~06", "HOME-14 · MY-02", "SCAN-04/05", "STA-13 설명" 모두."""
    cell = cell.replace('*', '').replace('`', '')
    out = re.findall(rf'\b({ID})\b', cell)
    if not CFG.get('strict_rows'):
        return out  # 기본 모드는 범위·축약("01~12", "A-01·02")을 풀지 않는다 — 묶음 요약 행이 개별 상태를 덮지 않게(주량체커 LIVE-01~12)
    for part in re.split(r'\s*[,·/]\s*(?=[A-Z])|\s+·\s+', cell):
        m = re.match(rf'({PREFIX})-([A-Z]?)(\d+)((?:\s*[·~/,]\s*[A-Z]?\d+)*)', part.strip())
        if not m:
            continue
        pre, letter, first, rest = m.groups()
        nums = [first] + re.findall(r'\d+', rest)
        w = len(first)
        if '~' in rest and len(nums) == 2:
            nums = [str(n).zfill(w) for n in range(int(nums[0]), int(nums[1]) + 1)]
        out += [f'{pre}-{letter}{n.zfill(w)}' for n in nums]
    return out


def table_rows(text: str):
    """(번호들, 둘째 칸, 원 행) — 표 행만."""
    for line in text.splitlines():
        if not line.startswith('|'):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) >= 2:
            yield expand(cells[0]), cells[1], line


STRICT = bool(CFG.get('strict_rows'))
problems = []  # 줄 단위 메시지
if not ids:
    problems.append('테스트 케이스를 하나도 못 읽음 — 번호 형식 확인')

dups = [k for k, v in Counter(ids).items() if v > 1]
if dups:
    problems.append(f'테스트 케이스 번호 중복: {", ".join(dups)}')

# ID별 마지막 결과 행(파일 뒤쪽이 최신). 둘째 칸에 판정이 있는 행만 — 요약표(둘째 칸이 사유)는 상태가 아니다.
last: dict[str, tuple[str, str]] = {}
seen: set[str] = set()
for nums, second, line in table_rows(QR):
    seen.update(nums)
    if VERDICT.search(second):
        for i in nums:
            last[i] = (second, line)

# 기본: 번호가 QA_RESULT 어디에든(표·목록·문장) 나오면 결과 있음(주량체커·응원석·알롱 방식). strict_rows면 표 첫 칸에 있어야 함(차곡 방식).
mentioned = {i for i in ids if re.search(r'\b' + re.escape(i) + r'\b', QR)}
missing = [i for i in ids if i not in (seen if STRICT else mentioned)]
if missing:
    problems.append(f'결과가 없는 케이스 {len(missing)}건(실행하지 않음): {", ".join(missing)}')

blocked = []
for i in ids:
    if i in missing:
        continue
    if i not in last:
        if STRICT:
            problems.append(f'결과 칸에 판정이 없음: {i}')
        continue  # 기본 모드: 표 행이 아닌 곳(목록·문장)에만 나온 번호는 상태를 모른다 — 통과로 본다(옛 도구와 같음)
    second, line = last[i]
    if not any(b in second for b in BLOCKED) or '통과' in second:
        continue
    blocked.append(i)
    if '시도:' not in line:
        problems.append(f'{i} 실행 불가인데 `시도:`(무엇을 해 봤는지)가 없음')
    for word, how in SOLVABLE.items():
        if word in line:
            problems.append(f'{i} 실행 불가 사유 "{word}"는 방법이 있다 → {how}')

# 출시 회귀
if args.release:
    ver = args.release
    full, part = f'## {ver} 전체 회귀', f'## {ver} 출시 회귀'
    first = re.fullmatch(r'1\.0(\.0)?', ver) is not None
    full_only = CFG.get('release_mode') == 'full'

    def section(h):
        sec = QR[QR.index(h):]
        nxt = sec.find('\n## ', 1)
        return sec if nxt < 0 else sec[:nxt]

    if full in QR:
        done = {}
        for nums, second, _ in table_rows(section(full)):
            for i in nums:
                if i not in done or VERDICT.search(second):
                    done[i] = second  # 뒤의 "비고 해결" 같은 행이 판정을 덮지 않게
        miss = [i for i in ids if i not in done and not re.search(r'\b' + re.escape(i) + r'\b', section(full))]
        if miss:
            problems.append(f'{ver} 전체 회귀에 없는 케이스 {len(miss)}건: {", ".join(miss[:30])}{" …" if len(miss) > 30 else ""}')
        nov = [i for i in ids if i in done and not VERDICT.search(done[i])]
        if nov:
            problems.append(f'{ver} 전체 회귀 판정 없음: {", ".join(nov[:30])}')
    elif part in QR and not full_only and not first:
        sec = section(part)
        ran = [i for i in ids if re.search(r'^\| ' + re.escape(i) + r'\b', sec, re.M)]
        if not ran:
            problems.append(f'"{part}" 절에 돌린 케이스가 없다 — 바꾼 부분의 케이스를 {ver} 코드로 돌려 적을 것')
        if not re.search(r'^> 승계: 나머지는 \S+ 결과', sec, re.M):
            problems.append(f'"{part}" 절에 승계 선언 줄(`> 승계: 나머지는 <직전 버전> 결과`)이 없다')
    elif full_only or first:
        problems.append(f'QA_RESULT에 "{full}" 절이 없다 — {ver} 코드로 모든 케이스를 다시 돌려 그 절에 적을 것')
    else:
        problems.append(f'QA_RESULT에 "{part}"(첫 출시는 "{full}") 절이 없다 — 바꾼 부분의 케이스를 {ver} 코드로 돌려 그 절에 적을 것')

if problems:
    for p in problems:
        print(f'  ✗ {p}')
    sys.exit(1)
print(f'  ✓ 케이스 {len(ids)}건 모두 결과 있음 · 번호 중복 없음 · 실행 불가 {len(blocked)}건 모두 시도 기록'
      + (f'({", ".join(blocked)})' if blocked else ''))
sys.exit(0)
