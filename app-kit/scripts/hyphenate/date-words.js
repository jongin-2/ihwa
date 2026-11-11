// Intl 날짜 서식이 만드는 달·요일 이름 중 min자 이상 낱말을 "언어<TAB>낱말"로 뽑는다(달 머리글·날짜 머리글·먼 날짜, 생격 포함).
// 공용 원본 — ihwa-site/app-kit/scripts/hyphenate/(11-12 주량체커 eda5fc5에서 옮김). 앱에 복사하지 않고 여기서 돌려 결과를 앱 낱말 목록에 넣는다.
// 쓰는 법: node date-words.js cs,de,es,fr,id,it,nl,pl,pt-BR,ru,sv,tr,uk,vi,en [min=7] [--cap]
// --cap: 머리글처럼 첫 글자를 대문자로 쓰는 앱(주량체커·차곡 등)만. 앱 서식이 아래 add 줄과 다르면 그 서식을 더해 돌린다.
// 같은 낱말이 여러 언어에 있으면(en·de September) 하나만 넣는다 — makeSoftHyphen은 뒤 항목이 앞 항목을 덮는다.
const locs = (process.argv[2] || '').split(',').filter(Boolean);
const min = Number(process.argv[3] || 7);
const upper = process.argv.includes('--cap');
const cap = (s, l) => (upper ? s.charAt(0).toLocaleUpperCase(l) + s.slice(1) : s);
const out = new Set();
const add = (l, t) => { for (const w of t.match(/[\p{Script=Latin}\p{Script=Cyrillic}’']+/gu) ?? []) if (w.length >= min) out.add(l + '\t' + w); };
for (const l of locs) for (let m = 0; m < 12; m++) {
  const d = new Date(2026, m, 1);
  add(l, cap(new Intl.DateTimeFormat(l, { year: 'numeric', month: 'long' }).format(d), l));
  add(l, new Intl.DateTimeFormat(l, { month: 'long', day: 'numeric' }).format(d));
  add(l, new Intl.DateTimeFormat(l, { year: 'numeric', month: 'long', day: 'numeric' }).format(d));
  for (let k = 0; k < 7; k++) add(l, cap(new Intl.DateTimeFormat(l, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(2026, m, 1 + k)), l));
}
console.log([...out].join('\n'));
