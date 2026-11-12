// ⚠️ 공용 원본 — ihwa-site/app-kit/AppDialog.tsx. 앱 저장소에는 이 파일을 글자 그대로 복사해 둔다(고치려면 원본을 고치고 앱마다 다시 복사).
// 앱 확인 창 — iOS 경고창(Alert.alert) 대신 앱 카드 모양을 화면 가운데에 띄운다.
// 10-27 종인님(한배) "그만둘까요나 로그아웃 계정삭제도 자체 다이얼로그 디자인이 입혀져야지 어색하잖아", "하단이 아니라 화면 중간에 떠야지"
//   → 같은 날 "모든 앱에 넓혀"(코어 질문 창). 원래 모양은 한배 impl/app/src/components/AppDialog.tsx.
//  · 모양: 가운데 카드(좌우 24·모서리 28·최대 폭 400), 제목 19 굵게, 설명 15 보조색, 단추 높이 50 알약.
//    단추 둘은 가로로(회색 취소 + 강조색 실행, 지우기·그만두기는 빨강), 셋 이상은 세로로. 다크에선 카드에 가는 테두리.
//    앱에 세로 쌓기 확인 카드가 이미 있으면 Host에 stack을 켠다 — 늘 세로, 위가 실행·아래가 취소(10-27 알롱 ConfirmCard B1과 같은 배치).
//    빨강은 흰 글자 대비 4.5 이상(라이트 #D70015 5.4 · 다크 #D63A2F 4.7 — iOS 다크 빨강 #FF453A는 3.4라 쓰지 않음, 10-27 알롱).
//    한국어는 단어 중간에서 꺾이지 않게 lineBreakStrategyIOS hangul-word(10-27 알롱 "완전/히").
//    큰 글씨: 제목·설명은 줄이지 않고 글 칸만 스크롤(카드 최대 85%), 단추 글자만 1.3·한 줄 줄여 맞추기, 단추 높이 최소 50(11-11 공통안, 10-30 주량체커 SET-43).
//    제목은 상한 2.65, 가장 긴 낱말이 한 줄에 안 들면 그 제목만 상한을 낮춤(11-13 맵나이츠 AX5 "로그아웃할까/요?"). 제목 띠가 있으면 띠가 카드 맨 위에 붙는다.
//    긴 낱말: 앱이 setDialogText(softHyphen)를 한 번 부르면 제목·설명·단추에 숨은 하이픈이 들어간다 — 공용 사본(LegalDocView·UpdatePrompt)이 여는 창에도(11-11 주량체커 AX5 fr 'Supprim/er').
//  · 바깥을 누르거나 뒤로 가기면 취소 단추(kind 'cancel')를 누른 것과 같다 — 취소 단추가 없거나 dismissable: false면 닫히지 않는다.
//  · 창이 떠 있는 동안 새 요청은 줄을 서서 차례로 뜬다.
//  · 층(10-27 알롱): 네이티브 시트(pageSheet·modal 화면)가 떠 있으면 앱 뿌리의 RN Modal은 "already presenting"으로 뜨지 않는다.
//    그래서 시트·모달 화면마다 그 안에 Host를 하나 더 두고, 가장 나중에 붙은(가장 위) Host 하나만 창을 그린다.
//    창이 떠 있던 시트가 닫히면 그 요청은 아래 층 Host로 넘어가 다시 뜬다. 시트 안 Host는 모양 값을 생략하면 맨 아래(앱 뿌리) Host 값을 쓴다.
// 쓰는 법: 앱 뿌리(내비게이션 바깥, 맨 마지막 자식)에 <AppDialogHost accent={브랜드색} />, 시트·모달 화면 안에는 <AppDialogHost />.
//   const i = await appDialog({ title, msg, buttons: [{ text: '취소', kind: 'cancel' }, { text: '삭제', kind: 'destructive' }] })
//   → 누른 단추 순번(바깥을 눌러 닫으면 취소 단추 순번). Host가 하나도 없으면 iOS 경고창으로 대신 띄운다(멈추지 않게).
// 앱마다 다른 값: accent(실행 단추 색)·onAccent(그 위 글자색, 기본 흰색)·colors(카드·글자 색을 앱 장면 값으로 바꿀 때만)·stack(늘 세로 쌓기).
//   장식(11-12 맵나이츠 'A 절충' — 모두 선택, 안 주면 지금 모양 그대로): radius(카드 모서리, 기본 28)·frame(2px 테두리+안쪽 이중선 2px/1px)
//   ·cornerOrnament(모서리 L자 4개 14×2·2×14, 안쪽 6)·titleBand(위·아래 선 있는 제목 띠+양끝 마름모 — 위 빛·아래 선 따로, 바탕 그라데이션은 back, 글자는 textStyle)·buttons(종류별 단추 색·테·모서리·뒤판 그리기 — 그라데이션은 앱이 back으로).
// 공용 원본 LegalDocView(메일 주소 복사 알림)·UpdatePrompt(업데이트 안내)가 './AppDialog'로 이 파일을 쓴다 — 셋을 같은 폴더에 함께 복사한다.
// 필요한 라이브러리: 없음(react-native만).
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View, useColorScheme, useWindowDimensions, type ColorValue, type TextStyle } from 'react-native';

// disabled: 흐림(투명도 0.4·누름 무시) — body 안에서 고르기 전엔 실행 단추를 막을 때. 고른 뒤엔 updateDialog로 바꾼다(11-12 맵나이츠 신고 사유·골드 모자람).
// dim: 모양만 흐림(투명도 0.4)·누름은 그대로 — 눌렀을 때 왜 안 되는지 알려 줄 때(앱이 그 순번을 받아 토스트 등, 11-13 맵나이츠 골드 부족 [사기]).
export type DialogButton = { text: string; kind?: 'cancel' | 'primary' | 'destructive'; disabled?: boolean; dim?: boolean };
// body: 설명 글 아래(단추 위)에 그림 등 앱이 그린 내용을 넣을 때만(11-12 맵나이츠 장비·초상 확인 창). 안 주면 지금 그대로, Host가 없어 iOS 경고창으로 갈 땐 빠진다.
export type DialogOptions = { title: string; msg?: string; body?: ReactNode; buttons: DialogButton[]; dismissable?: boolean };
type Req = DialogOptions & { done: (i: number) => void };
type Palette = { card: string; text: string; sub: string; fill: string; red: string };
type Kind = 'cancel' | 'primary' | 'destructive';
export type ButtonLook = { bg?: ColorValue; fg?: ColorValue; border?: ColorValue; radius?: number; back?: (pressed: boolean) => ReactNode };
export type Look = {
  accent?: ColorValue; onAccent?: ColorValue; colors?: { light?: Partial<Palette>; dark?: Partial<Palette> }; stack?: boolean;
  radius?: number;
  frame?: { border: ColorValue; innerLo: ColorValue; innerHi: ColorValue };
  cornerOrnament?: ColorValue;
  titleBand?: { from: ColorValue; to: ColorValue; text: ColorValue; line: ColorValue; topLight?: ColorValue; bottomLine?: ColorValue; back?: () => ReactNode; textStyle?: TextStyle };
  buttons?: Partial<Record<Kind, ButtonLook>>;
};
type Layer = { look: Look; cur: Req | null; give: (r: Req | null) => void; redraw: () => void };

const layers: Layer[] = []; // 붙은 순서 = 아래 → 위
const queue: Req[] = [];

// 가장 위 층이 비었으면 줄의 맨 앞 요청을 띄운다
function pump() {
  const top = layers[layers.length - 1];
  if (!top || top.cur || !queue.length) return;
  top.cur = queue.shift()!;
  top.give(top.cur);
}

// 제목 큰 글씨 상한 — TextFit titleMul(19)과 같은 값(iOS Title 3 AX5 20→53 급). 19pt가 AX5 약 3.1배면 '삭제할까요?'의 '?'가 혼자 떨어짐(11-13 차곡 1.0.6 재회귀).
// AppDialog만 복사한 앱도 돌게 TextFit을 가져오지 않고 값을 둔다.
const TITLE_MUL = 2.65;
// 한 낱말이 칸 폭을 넘으면 글자 단위로 꺾이므로(AX5 ko '로그아웃할까/요?', 11-13 맵나이츠) 그 제목만 상한을 낮춰 가장 긴 낱말이 한 줄에 들게 한다.
// 낱말 폭은 글자 수로 어림(한글·한자·가나 1em, 그 밖 0.66em — 굵은 라틴·키릴 평균보다 넉넉히). 숨은 하이픈(U+00AD)·공백·하이픈에서 끊을 수 있으니 그 사이 조각으로 잰다.
const WIDE = /[\u1100-\u11FF\u3040-\u30FF\u3130-\u318F\u4E00-\u9FFF\uAC00-\uD7AF\uFF00-\uFFEF]/;
function titleMul(text: string, fontSize: number, width: number): number {
  let em = 0;
  for (const part of text.split(/[\s\u00AD\-‐–—/]+/)) {
    let w = 0;
    for (const ch of part.replace(/\u2060/g, '')) w += WIDE.test(ch) ? 1 : 0.66;
    if (w > em) em = w;
  }
  return em ? Math.max(1, Math.min(TITLE_MUL, width / (fontSize * em))) : TITLE_MUL;
}

let shown: (t: string) => string = (t) => t;
/** 앱 뿌리에서 한 번 — 창에 그릴 글자 변환(보통 makeSoftHyphen(앱 낱말).softHyphen). 기본은 그대로. iOS 경고창 대신 띄울 땐 쓰지 않는다. */
export function setDialogText(fn: (t: string) => string): void { shown = fn; }

/** 지금 떠 있는 창(가장 위 층)의 단추·글·body를 바꾼다 — body 안 선택에 따라 단추 흐림을 풀 때. 떠 있는 창이 없으면 아무것도 안 한다. */
export function updateDialog(patch: Partial<Pick<DialogOptions, 'buttons' | 'msg' | 'body'>>): void {
  const top = [...layers].reverse().find((l) => l.cur);
  if (!top || !top.cur) return;
  Object.assign(top.cur, patch);
  top.redraw();
}

export function appDialog(o: DialogOptions): Promise<number> {
  return new Promise((done) => {
    if (layers.length) { queue.push({ ...o, done }); pump(); return; }
    // Host가 없으면 기본 경고창으로 — 창이 영영 안 떠서 흐름이 멈추는 것보다 낫다
    const cancel = o.buttons.findIndex((b) => b.kind === 'cancel');
    Alert.alert(o.title, o.msg, o.buttons.map((b, i) => ({
      text: b.text, style: b.kind === 'cancel' ? 'cancel' : b.kind === 'destructive' ? 'destructive' : 'default', onPress: () => done(i),
    })), { cancelable: o.dismissable !== false && cancel >= 0, onDismiss: () => done(cancel) });
  });
}

const LIGHT: Palette = { card: '#FFFFFF', text: '#1C1C1E', sub: '#6C6C70', fill: 'rgba(120,120,128,0.16)', red: '#D70015' };
const DARK: Palette = { card: '#2C2C2E', text: '#FFFFFF', sub: '#AEAEB2', fill: 'rgba(120,120,128,0.32)', red: '#D63A2F' };

export function AppDialogHost(props: Look) {
  const [cur, setCur] = useState<Req | null>(null);
  const [, setTick] = useState(0);
  const dark = useColorScheme() === 'dark';
  const win = useWindowDimensions();
  const me = useRef<Layer>({ look: props, cur: null, give: setCur, redraw: () => setTick((n) => n + 1) }).current;
  me.look = props;
  useEffect(() => {
    // 새 층이 위에 붙으면 아래 층에 떠 있던 창은 가려지므로 줄 맨 앞으로 되돌려 이 층에서 다시 띄운다
    for (const l of layers) if (l.cur) { queue.unshift(l.cur); l.cur = null; l.give(null); }
    layers.push(me);
    pump();
    return () => {
      const i = layers.indexOf(me);
      if (i >= 0) layers.splice(i, 1);
      if (me.cur) { queue.unshift(me.cur); me.cur = null; }
      pump();
    };
  }, [me]);
  if (!cur) return null;
  const look: Look = { ...layers[0]?.look, ...Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) };
  const pick = (i: number) => {
    if (me.cur !== cur) return;
    me.cur = null;
    setCur(null);
    cur.done(i);
    pump();
  };
  const cancel = cur.buttons.findIndex((b) => b.kind === 'cancel');
  const closable = cur.dismissable !== false && cancel >= 0;
  const c = dark ? { ...DARK, ...look.colors?.dark } : { ...LIGHT, ...look.colors?.light };
  const stack = !!look.stack || cur.buttons.length > 2;
  // 세로일 때 취소는 맨 아래로(누른 순번은 원래 순번 그대로 돌려준다)
  const order = cur.buttons.map((b, i) => ({ b, i }));
  // 제목 칸 폭: 카드(화면 − 좌우 24, 최대 400) − 카드 안쪽 20×2 − 제목 안쪽 8×2, 제목 띠면 띠 안쪽 32×2(띠는 카드 안쪽 여백을 넘어 그림)
  const cardW = Math.min(win.width - 48, 400) - (look.frame ? 4 : 0);
  const titleW = look.titleBand ? cardW - 64 : cardW - 56;
  const titleText = shown(cur.title);
  const bandSize = StyleSheet.flatten(look.titleBand?.textStyle)?.fontSize ?? 19;
  const mul = titleMul(titleText, look.titleBand ? bandSize : 19, titleW);
  const innerR = Math.max(0, (look.radius ?? 28) - (look.frame ? 2 : 0));
  if (stack) order.sort((x, y) => Number(x.b.kind === 'cancel') - Number(y.b.kind === 'cancel'));
  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => { if (closable) pick(cancel); }}>
      <Pressable style={st.scrim} onPress={() => closable && pick(cancel)} accessible={false}>
        <Pressable style={[st.card, { backgroundColor: c.card }, look.radius != null && { borderRadius: look.radius }, look.titleBand && { paddingTop: 0 }, look.frame ? { borderWidth: 2, borderColor: look.frame.border } : dark && st.cardDark]} accessible={false} accessibilityViewIsModal>
          {look.frame && (
            <View pointerEvents="none" style={[st.fill, { margin: 2, borderWidth: 2, borderColor: look.frame.innerLo, borderRadius: Math.max(0, (look.radius ?? 28) - 4) }]}>
              <View style={[st.fill, { borderWidth: 1, borderColor: look.frame.innerHi, borderRadius: Math.max(0, (look.radius ?? 28) - 6) }]} />
            </View>
          )}
          {look.cornerOrnament != null && (['tl', 'tr', 'bl', 'br'] as const).map((k) => {
            const v = k[0] === 't' ? { top: 6 } : { bottom: 6 };
            const h = k[1] === 'l' ? { left: 6 } : { right: 6 };
            return (
              <View key={k} pointerEvents="none" style={[st.orn, v, h]}>
                <View style={[st.ornH, { backgroundColor: look.cornerOrnament }, k[0] === 't' ? { top: 0 } : { bottom: 0 }, k[1] === 'l' ? { left: 0 } : { right: 0 }]} />
                <View style={[st.ornV, { backgroundColor: look.cornerOrnament }, k[0] === 't' ? { top: 0 } : { bottom: 0 }, k[1] === 'l' ? { left: 0 } : { right: 0 }]} />
              </View>
            );
          })}
          {/* 큰 글씨(AX)를 줄이지 않는다 — 글이 길면 이 칸만 스크롤하고 버튼은 늘 보인다(iOS 기본 경고창과 같음, ihwa-design '큰 글씨'). */}
          {/* 제목 띠는 카드 좌우 안쪽 여백을 넘어 그려야 해서 글 칸을 여백만큼 넓힌다(ScrollView가 넘친 곳을 자르므로). */}
          <ScrollView style={[st.body, look.titleBand && st.bodyWide]} contentContainerStyle={[st.bodyIn, look.titleBand && st.bodyInWide]} bounces={false}>
            {/* 글 칸이 터치 응답권을 받아야 바깥 카드 Pressable이 스크롤을 가로채지 않는다(11-12 알롱 AX5 es·fr·ru·tr 실측 — 감싸지 않으면 밀어도 안 움직임). */}
            <View onStartShouldSetResponder={() => true}>
              {look.titleBand ? (
                <View style={[st.band, { borderTopLeftRadius: innerR, borderTopRightRadius: innerR }, { backgroundColor: look.titleBand.from, borderTopColor: look.titleBand.topLight ?? look.titleBand.line, borderBottomColor: look.titleBand.bottomLine ?? look.titleBand.line }]}>
                  {look.titleBand.back
                    ? <View pointerEvents="none" style={st.fill}>{look.titleBand.back()}</View>
                    : <View pointerEvents="none" style={[st.fill, { top: '50%', backgroundColor: look.titleBand.to }]} />}
                  <View pointerEvents="none" style={[st.diamond, { left: 18, backgroundColor: look.titleBand.line }]} />
                  <View pointerEvents="none" style={[st.diamond, { right: 18, backgroundColor: look.titleBand.line }]} />
                  <Text style={[st.title, st.bandTitle, { color: look.titleBand.text }, look.titleBand.textStyle]} accessibilityRole="header" lineBreakStrategyIOS="hangul-word" maxFontSizeMultiplier={mul}>{titleText}</Text>
                </View>
              ) : (
                <Text style={[st.title, { color: c.text }]} accessibilityRole="header" lineBreakStrategyIOS="hangul-word" maxFontSizeMultiplier={mul}>{titleText}</Text>
              )}
              {!!cur.msg && <Text style={[st.msg, { color: c.sub }]} lineBreakStrategyIOS="hangul-word">{shown(cur.msg)}</Text>}
              {cur.body != null && <View style={st.extra}>{cur.body}</View>}
            </View>
          </ScrollView>
          <View style={[st.row, stack && st.stack]}>
            {order.map(({ b, i }) => {
              const k = b.kind ?? 'primary';
              const bl = look.buttons?.[k];
              const bg = bl?.bg ?? (k === 'cancel' ? c.fill : k === 'destructive' ? c.red : look.accent ?? '#007AFF');
              const fg = bl?.fg ?? (k === 'cancel' ? c.text : k === 'destructive' ? '#FFFFFF' : look.onAccent ?? '#FFFFFF');
              return (
                <Pressable key={i} onPress={() => pick(i)} disabled={!!b.disabled} accessibilityRole="button" accessibilityState={{ disabled: !!b.disabled }} style={({ pressed }) => [st.btn, !stack && st.btnFlex, { backgroundColor: bg, opacity: b.disabled || b.dim ? (pressed && !b.disabled ? 0.3 : 0.4) : pressed ? 0.7 : 1 }, bl?.radius != null && { borderRadius: bl.radius }, bl?.border != null && { borderWidth: 1, borderColor: bl.border }, bl?.back && { overflow: 'hidden' }]}>
                  {({ pressed }) => (<>
                  {bl?.back && <View pointerEvents="none" style={st.fill}>{bl.back(pressed)}</View>}
                  <Text style={[st.btnText, { color: fg, fontWeight: k === 'cancel' ? '600' : '700' }]} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.3}>{shown(b.text)}</Text>
                  </>)}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const st = StyleSheet.create({
  scrim: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.4)' },
  card: { width: '100%', maxWidth: 400, maxHeight: '85%', borderRadius: 28, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  cardDark: { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: 'rgba(255,255,255,0.12)' }, // 다크에선 카드가 배경과 붙어 테두리
  body: { flexGrow: 0, flexShrink: 1 },
  bodyIn: { flexGrow: 0 },
  extra: { marginTop: 12 },
  bodyWide: { marginHorizontal: -20 },
  bodyInWide: { paddingHorizontal: 20 },
  title: { fontSize: 19, fontWeight: '700', textAlign: 'center', paddingHorizontal: 8 },
  msg: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8, paddingHorizontal: 8 },
  row: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stack: { flexDirection: 'column' },
  btn: { minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnFlex: { flex: 1 },
  btnText: { fontSize: 17 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  orn: { position: 'absolute', width: 14, height: 14 },
  ornH: { position: 'absolute', width: 14, height: 2 },
  ornV: { position: 'absolute', width: 2, height: 14 },
  band: { marginHorizontal: -20, paddingVertical: 9, paddingHorizontal: 32, borderTopWidth: 1, borderBottomWidth: 1, overflow: 'hidden', justifyContent: 'center' },
  bandTitle: { paddingHorizontal: 0, lineHeight: 24 },
  diamond: { position: 'absolute', top: '50%', marginTop: -3.5, width: 7, height: 7, transform: [{ rotate: '45deg' }] },
});
