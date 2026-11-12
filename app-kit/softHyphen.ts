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
// 확인 창 제목처럼 큰 굵은 글자는 7자부터(물음표가 붙으면 8칸) — longWords(제목들, 7)(11-11 주량체커 AX5 fr 'Supprimer', 11-12 알롱 ru 'аккаунт?'). 확인 창은 AppDialog의 setDialogText(softHyphen)로 넣는다.
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
  // 공용 업데이트 안내창(UpdatePrompt)·문서 보기(LegalDocView) 낱말 — 확인 창 제목 기준 8자부터(11-11 응원석 지적). 맥 애플 사전 분철(CFStringGetHyphenationLocationBeforeIndex), tr·id는 음절 규칙, 한 글자 조각은 붙임.
  // en·de·es·fr·it·pt·nl·sv
  'Avail-able', 'Ak-tua-li-sie-re', 'ak-tua-li-sie-ren', 'Ak-tua-li-sie-ren', 'ver-füg-bar',
  'Ac-tua-li-za', 'Ac-tua-li-za-ción', 'Ac-tua-li-zar', 'dis-po-ni-ble', 'con-ti-nuer', 'uti-li-ser',
  'Ag-gior-na', 'Ag-gior-na-men-to', 'con-ti-nua-re', 'di-spo-ni-bi-le',
  'Atua-li-za-ção', 'Atua-li-zar', 'Atua-li-ze', 'con-ti-nu-ar', 'dis-po-ní-vel',
  'be-schik-baar', 'bij-wer-ken', 'Bij-wer-ken', 'ge-brui-ken', 'fort-sät-ta', 'Upp-da-te-ra', 'Upp-da-te-ring',
  // pl·cs
  'Póź-niej', 'Poz-dě-ji', 'blij-ven', 'an-vän-da', 'ak-tu-ali-za-cja', 'Ak-tu-ali-zuj', 'apli-ka-cji', 'Do-stęp-na', 'ko-rzy-stać', 'Zak-tu-ali-zuj',
  'ak-tua-li-za-ce', 'Ak-tua-li-zo-vat', 'Ak-tua-li-zuj-te', 'ap-li-ka-ci', 'dis-po-zi-ci', 'pou-ží-vat',
  // tr·id(음절 규칙)
  'gün-cel-le', 'Gün-cel-le', 'Gün-cel-le-me', 'gün-cel-le-yin', 'Kul-lan-ma-ya',
  'me-ma-kai', 'ap-li-ka-si', 'Pem-ba-ru-an', 'Per-ba-rui', 'se-ka-rang', 'ter-se-dia',
  // ru·uk
  'До-ступ-но', 'Об-но-ви-те', 'Об-но-вить', 'про-дол-жить', 'об-нов-ле-ние', 'при-ло-же-ни-ем', 'поль-зо-вать-ся',
  'До-ступ-не', 'Оно-віть', 'Оно-ви-ти', 'Піз-ні-ше', 'онов-лен-ня', 'за-сто-сун-ком', 'ко-ри-сту-ва-ти-ся',
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

// 영문·숫자와 뒤 한글 사이 줄바꿈 막기(11-13 — 차곡 'CGK / 도'·주량체커 '약 1 / 잔'·알롱 TextKit 실험 1092건 중 205건 끊김 → U+2060 뒤 48건, 남은 것은 낱말이 줄보다 넓은 폭뿐).
// iOS 어절 줄바꿈(hangul-word)도 숫자·라틴·%·닫는 괄호 → 한글 경계는 끊을 자리로 본다. 그 사이에 U+2060(WORD JOINER, 폭 0·VoiceOver 안 읽음)을 넣는다.
// 화면에 그릴 때만. 여러 번 불러도 같다(이미 넣은 자리는 앞 글자가 U+2060이라 다시 안 맞음). 확인 창은 setDialogText((t) => glueHangul(softHyphen(t))).
const GLUE_BEFORE_HANGUL = /([0-9A-Za-z%)\]])(?=[가-힣])/g; // ko-ok: 줄바꿈 규칙(화면 문구 아님)
export function glueHangul(text: string): string {
  return text.replace(GLUE_BEFORE_HANGUL, '$1\u2060');
}

// 조각으로 들어온 글(<Text>{n}잔</Text> → [3, '잔'])은 조각 사이 경계도 본다(11-13 주량체커 d4d5d14 AppText). 문자열 조각만 바꾸고 요소·숫자는 그대로.
// shy: 조각마다 먼저 적용할 변환(보통 앱 softHyphen). 쓰기: Text 래퍼에서 Array.isArray(children) ? glueHangulParts(Children.toArray(children), softHyphen) : …
// Children.toArray를 거친다 — 새 배열을 그대로 자식으로 넘기면 React가 목록으로 보고 중첩 <Text>에 key 경고를 낸다(11-13 차곡 5fd2636).
export function glueHangulParts<T>(parts: readonly T[], shy: (t: string) => string = (t) => t): (T | string)[] {
  return parts.map((p, i) => {
    if (typeof p !== 'string') return p;
    const prev = i > 0 ? parts[i - 1] : null;
    const tail = typeof prev === 'number' ? String(prev) : typeof prev === 'string' ? prev : '';
    const g = glueHangul(shy(p));
    return tail && /^[가-힣]/.test(g) && /[0-9A-Za-z%)\]]$/.test(tail) ? '\u2060' + g : g; // ko-ok: 줄바꿈 규칙(화면 문구 아님)
  });
}
