#!/usr/bin/env node
// 공용 원본 app-kit/UpdatePrompt.ts의 판정 함수(decideUpdate)를 경우별로 시험한다.
// 앱 사본은 원본과 글자 그대로 같아야 하므로(cmp), 원본 하나만 시험하면 다섯 앱이 함께 확인된다.
// 쓰는 법: node app-kit/scripts/test-update-prompt.mjs [UpdatePrompt.ts 경로]  — 종료 코드 0이면 통과.
// react·react-native 없이 돌도록 사본의 import 줄만 빈 값으로 바꿔 임시 폴더에서 읽는다(Node 22.6 이상, 타입 지우기).
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const src = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'UpdatePrompt.ts');
let code = readFileSync(src, 'utf8').replace(/^import [^\n]*\n/gm, '');
code = 'const useEffect: any = 0, useRef: any = 0, useState: any = 0, AppState: any = {}, Linking: any = {}, Platform: any = { OS: "ios" }, appDialog: any = () => {};\n' + code;
const dir = mkdtempSync(join(tmpdir(), 'update-prompt-'));
const file = join(dir, 'UpdatePrompt.ts');
writeFileSync(file, code);
let failed = 0;
try {
  const { decideUpdate } = await import(pathToFileURL(file).href);
  const DAY = 86400000, now = Date.UTC(2026, 10, 3);
  const cases = [
    // [설명, 지금, 스토어 최신, minVersion, policy, 기대 forced, 기대 prompt]
    ['같은 판이면 아무것도 안 함', '1.0.0', '1.0.0', null, 'app', false, false],
    ['일반 앱 셋째 자리: 창 없음', '1.0.0', '1.0.1', null, 'app', false, false],
    ['일반 앱 둘째 자리: 하루 뒤 권장', '1.0.0', '1.1.0', null, 'app', false, true],
    ['일반 앱 첫째 자리: 강제', '1.0.0', '2.0.0', null, 'app', true, true],
    ['게임 셋째 자리: 권장', '1.0.0', '1.0.1', null, 'game', false, true],
    ['게임 둘째 자리: 강제', '1.0.0', '1.1.0', null, 'game', true, true],
    ['min보다 낮고 스토어에 min 판이 있음: 강제', '1.0.0', '1.0.1', '1.0.1', 'app', true, true],
    ['min보다 낮지만 스토어 최신이 min보다 낮음(심사 중): 강제 안 함', '1.0.0', '1.0.0', '1.0.1', 'app', false, false],
    ['min 1.0.4·스토어 1.0.3·지금 1.0.2: 강제 안 함(셋째 자리라 창 없음)', '1.0.2', '1.0.3', '1.0.4', 'app', false, false],
    ['스토어 조회 실패(그 지역에서 안 팖)면 강제 안 함', '1.0.0', null, '1.0.1', 'app', false, false],
    ['이미 min 이상이면 강제 안 함', '1.0.1', '1.0.1', '1.0.1', 'app', false, false],
    ['테스트플라이트(지금이 더 새것): 안내 없음', '1.1.0', '1.0.0', null, 'app', false, false],
  ];
  for (const [name, cur, latest, min, policy, f, p] of cases) {
    const s = decideUpdate(cur, latest, min, policy, now - 2 * DAY, now);
    const ok = s.forced === f && s.prompt === p;
    if (!ok) failed++;
    console.log(`${ok ? '통과' : '실패'} ${name}${ok ? '' : ` — forced ${s.forced}, prompt ${s.prompt}`}`);
  }
  const urgent = decideUpdate('1.0.0', null, '1.0.1', 'app', null, now, true);
  if (urgent.forced !== true) failed++;
  console.log(`${urgent.forced === true ? '통과' : '실패'} 조회 실패라도 forceEvenIfUnknown이면 긴급 강제`);
  const urgentKnown = decideUpdate('1.0.0', '1.0.0', '1.0.1', 'app', null, now, true);
  if (urgentKnown.forced !== false) failed++;
  console.log(`${urgentKnown.forced === false ? '통과' : '실패'} forceEvenIfUnknown이어도 스토어 최신이 min보다 낮으면 강제 안 함`);
  const fresh = decideUpdate('1.0.0', '1.1.0', null, 'app', now - DAY / 2, now);
  if (fresh.prompt !== false) failed++;
  console.log(`${fresh.prompt === false ? '통과' : '실패'} 둘째 자리라도 출시 하루 안이면 권장 안 띄움`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
console.log(failed ? `실패 ${failed}건` : '모두 통과');
process.exit(failed ? 1 : 0);
