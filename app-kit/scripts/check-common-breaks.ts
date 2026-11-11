// 공용 창(UpdatePrompt·LegalDocView·AppDialog)이 그리는 문구의 긴 낱말이 COMMON_BREAKS에 다 있는지 본다 — 앱 시험은 앱 문구만 보므로 공용 문구는 여기서(11-11 응원석).
// 실행: node --experimental-strip-types app-kit/scripts/check-common-breaks.ts   (빠지면 종료 코드 1)
// 기준: 확인 창에 뜨는 업데이트 안내는 8자부터, 문서 보기(오프라인 안내 등)는 12자부터 — ihwa-design '큰 글씨·다국어 낱말 끊김' ③.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { makeSoftHyphen, longWords } from '../softHyphen.ts';

const kit = join(dirname(fileURLToPath(import.meta.url)), '..');
const { hasBreaks } = makeSoftHyphen();
const texts = (file: string) => readFileSync(join(kit, file), 'utf8').split('\n')
  .filter((l) => /^\s*'[A-Za-z-]+': \{/.test(l))
  .flatMap((l) => [...l.matchAll(/\w+: '([^']*)'/g)].map((m) => m[1]));
const miss = [...longWords(texts('UpdatePrompt.ts'), 8), ...longWords(texts('LegalDocView.tsx'), 12)].filter((w) => !hasBreaks(w));
if (miss.length) { console.error(`COMMON_BREAKS에 없는 낱말 ${miss.length}개: ${miss.join(' ')}`); process.exit(1); }
console.log('공용 창 낱말 모두 있음');
