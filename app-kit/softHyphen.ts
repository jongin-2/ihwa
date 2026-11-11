// 공용 원본 — ihwa-site/app-kit/softHyphen.ts. 앱에는 글자 그대로 복사하고, 앱 낱말은 makeSoftHyphen(앱 낱말 목록)으로 더한다.
// 고칠 게 있으면 코어에(ihwa-design '큰 글씨·다국어 낱말 끊김').
//
// 왜: React Native iOS 글자는 자동 하이픈이 없어, 큰 글씨(AX)에서 줄 폭보다 긴 낱말이 하이픈 없이 아무 글자에서 꺾인다
// (11-11 차곡·주량체커 AX5 — de 'Nutzungsbedingungen', ru 'конфиденциальности', es 'Recordatorio').
// 정해 둔 낱말에만 사전 음절 자리 숨은 하이픈(U+00AD)을 넣는다. 그 줄에서 꺾일 때만 '-'로 보이고, 한 줄에 들어가면 보이지 않으며
// VoiceOver도 읽지 않는다(차곡 b03020f AX5 es·ru·de·fr 실측). 글자를 줄여 맞추지 않으므로 큰 글씨를 켠 사용자의 크기를 지킨다.
//
// 쓰는 법: 화면에 그릴 때만 softHyphen(text). 저장 값·검색어·서버로 보내는 값에는 넣지 않는다.
// 빠짐 막기(문구에 이미 든 U+00AD는 떼고 봄): 앱 단위 테스트가 모든 언어 문자열에서 띄어쓰기 없는 12자 이상 낱말(라틴·키릴)이 hasBreaks()에 없으면 실패하게 한다.
// 확인 창 제목처럼 큰 굵은 글자는 8자부터 — longWords(제목들, 8)(11-11 주량체커 AX5 fr 'Supprimer'). 확인 창은 AppDialog의 setDialogText(softHyphen)로 넣는다.
// 음절 자리는 각 언어 사전 분철(Duden·RAE·Larousse·러시아어 음절 규칙)을 따른다. '-'로 적는다.

/** 모든 앱 설정·법 문서 줄에 나오는 공통 낱말(앱 낱말은 앱에서 더함). */
export const COMMON_BREAKS: readonly string[] = [
  // de
  'Nut-zungs-be-din-gun-gen', 'Da-ten-schutz-er-klä-rung', 'Be-nach-rich-ti-gun-gen', 'Mit-tei-lun-gen', 'Er-in-ne-rung', 'Ein-stel-lun-gen',
  // es
  'Re-cor-da-to-rio', 'No-ti-fi-ca-cio-nes', 'In-for-ma-ción', 'Pri-va-ci-dad',
  // fr
  'con-fi-den-tia-li-té', 'No-ti-fi-ca-tions', 'd’u-ti-li-sa-tion', 'Con-di-tions', 'Po-li-tique',
  // ru
  'кон-фи-ден-ци-аль-но-сти', 'ис-поль-зо-ва-ния', 'Уве-дом-ле-ния', 'На-по-ми-на-ние', 'Ли-цен-зии', 'кон-фі-ден-цій-но-сті',
];

const norm = (w: string) => w.replace(/'/g, '’'); // 곧은 따옴표(d'utilisation)도 같은 낱말로 본다

/** 앱 낱말을 더해 화면용 함수와 사전 확인 함수를 만든다. */
export function makeSoftHyphen(appBreaks: readonly string[] = []) {
  // 낱말(따옴표 정규화) → 하이픈을 넣을 글자 위치. 값은 위치만 두고 화면 글자는 원래 낱말에 넣는다(곧은 따옴표 그대로 — 11-11 차곡 fr d'utilisation).
  const map = new Map<string, number[]>();
  for (const w of [...COMMON_BREAKS, ...appBreaks]) {
    const at: number[] = [];
    let n = 0;
    for (const ch of w) { if (ch === '-') at.push(n); else n += ch.length; }
    map.set(norm(w.replace(/-/g, '')), at);
  }
  const put = (w: string, at: number[]) => { let o = '', i = 0; for (const k of at) { o += w.slice(i, k) + '\u00AD'; i = k; } return o + w.slice(i); };
  return {
    /** 화면에 그릴 글자에 정해 둔 긴 낱말의 숨은 하이픈을 넣는다(모르는 낱말은 그대로, 하이픈 말고는 원문 글자 그대로). */
    softHyphen: (text: string): string => text.replace(/[\p{L}’']+/gu, (w) => { const at = map.get(norm(w)); return at ? put(w, at) : w; }),
    /** 단위 테스트용 — 이 낱말에 하이픈 자리가 있는가. */
    hasBreaks: (word: string): boolean => map.has(norm(word.replace(/\u00AD/g, ''))),
  };
}

/** 단위 테스트용 — 문자열들에서 하이픈 자리가 필요한 긴 낱말(띄어쓰기 없는 12자 이상, 라틴·키릴)을 뽑는다. */
export function longWords(texts: readonly string[], min = 12): string[] {
  const out = new Set<string>();
  for (const t of texts) for (const w of t.replace(/\u00AD/g, '').match(/[\p{Script=Latin}\p{Script=Cyrillic}’']+/gu) ?? []) if (w.length >= min) out.add(norm(w));
  return [...out];
}
