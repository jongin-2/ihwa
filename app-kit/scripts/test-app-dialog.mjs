// 공용 AppDialog brokeInsideShyWord 시험(11-22) — node app-kit/scripts/test-app-dialog.mjs app-kit/AppDialog.tsx, 종료 코드 0이면 통과.
// 제목은 하이픈 없이 먼저 그리고, 하이픈 든 낱말 한가운데에서 줄이 나뉜 경우만 하이픈을 넣어 다시 그린다.
import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8');
const fn = src.match(/export function brokeInsideShyWord[\s\S]*?\n}\n/)[0].replace('export ', '').replace(/: readonly string\[\]|: string|: boolean|: \[number, number\]\[\]/g, '');
const f = new Function(`${fn};return brokeInsideShyWord;`)();
const S = '­';
const cases = [
  ['de 낱말 사이에서 나뉨', `Konto lö${S}schen?`, ['Konto ', 'löschen?'], false],
  ['ru 낱말 사이에서 나뉨', `Адрес эл. почты ско${S}пи${S}ро${S}ван`, ['Адрес эл. почты ', 'скопирован'], false],
  ['fr 낱말 안에서 나뉨', `Supp${S}ri${S}mer le compte ?`, ['Supprim', 'er le compte ?'], true],
  ['ko 하이픈 없는 낱말 안은 무시', '계정을 삭제할까요?', ['계정을 삭', '제할까요?'], false],
  ['한 줄', `Konto lö${S}schen?`, ['Konto löschen?'], false],
  ['de 경계 낱말이 통째로 다음 줄(11-24 응원석 AX5 Update ver-/fügbar)', `Update ver${S}füg${S}bar`, ['Update ', 'verfügbar'], false],
  ['de 경계 낱말 안에서 나뉨', `Update ver${S}füg${S}bar`, ['Update ver', 'fügbar'], true],
  ['둘째 낱말 안에서 나뉨', `Konto${S}lö${S}schungs bestä${S}ti${S}gung`, ['Kontolöschungs ', 'bestä', 'tigung'], true],
];
let bad = 0;
for (const [name, t, lines, exp] of cases) { const r = f(t, lines); if (r !== exp) bad++; console.log(r === exp ? '통과' : '실패', name); }
process.exit(bad);
