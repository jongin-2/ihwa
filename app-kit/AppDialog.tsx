// ⚠️ 공용 원본 — ihwa-site/app-kit/AppDialog.tsx. 앱 저장소에는 이 파일을 글자 그대로 복사해 둔다(고치려면 원본을 고치고 앱마다 다시 복사).
// 앱 확인 창 — iOS 경고창(Alert.alert) 대신 앱 카드 모양을 화면 가운데에 띄운다.
// 10-27 종인님(한배) "그만둘까요나 로그아웃 계정삭제도 자체 다이얼로그 디자인이 입혀져야지 어색하잖아", "하단이 아니라 화면 중간에 떠야지"
//   → 같은 날 "모든 앱에 넓혀"(코어 질문 창). 원래 모양은 한배 impl/app/src/components/AppDialog.tsx.
//  · 모양: 가운데 카드(좌우 24·모서리 28·최대 폭 400), 제목 19 굵게, 설명 15 보조색, 단추 높이 50 알약.
//    단추 둘은 가로로(회색 취소 + 강조색 실행, 지우기·그만두기는 빨강), 셋 이상은 세로로. 다크에선 카드에 가는 테두리.
//    앱에 세로 쌓기 확인 카드가 이미 있으면 Host에 stack을 켠다 — 늘 세로, 위가 실행·아래가 취소(10-27 알롱 ConfirmCard B1과 같은 배치).
//    빨강은 흰 글자 대비 4.5 이상(라이트 #D70015 5.4 · 다크 #D63A2F 4.7 — iOS 다크 빨강 #FF453A는 3.4라 쓰지 않음, 10-27 알롱).
//    한국어는 단어 중간에서 꺾이지 않게 lineBreakStrategyIOS hangul-word(10-27 알롱 "완전/히").
//    아주 큰 글씨(AX5)에서 제목 끝 '?'가 혼자 떨어지고 단추 글자가 꽉 차 글자 배율 상한 — 제목·설명 1.5·단추 1.3(LegalDocView와 같은 값), 단추 높이는 최소 50(10-30 주량체커 SET-43).
//  · 바깥을 누르거나 뒤로 가기면 취소 단추(kind 'cancel')를 누른 것과 같다 — 취소 단추가 없거나 dismissable: false면 닫히지 않는다.
//  · 창이 떠 있는 동안 새 요청은 줄을 서서 차례로 뜬다.
//  · 층(10-27 알롱): 네이티브 시트(pageSheet·modal 화면)가 떠 있으면 앱 뿌리의 RN Modal은 "already presenting"으로 뜨지 않는다.
//    그래서 시트·모달 화면마다 그 안에 Host를 하나 더 두고, 가장 나중에 붙은(가장 위) Host 하나만 창을 그린다.
//    창이 떠 있던 시트가 닫히면 그 요청은 아래 층 Host로 넘어가 다시 뜬다. 시트 안 Host는 모양 값을 생략하면 맨 아래(앱 뿌리) Host 값을 쓴다.
// 쓰는 법: 앱 뿌리(내비게이션 바깥, 맨 마지막 자식)에 <AppDialogHost accent={브랜드색} />, 시트·모달 화면 안에는 <AppDialogHost />.
//   const i = await appDialog({ title, msg, buttons: [{ text: '취소', kind: 'cancel' }, { text: '삭제', kind: 'destructive' }] })
//   → 누른 단추 순번(바깥을 눌러 닫으면 취소 단추 순번). Host가 하나도 없으면 iOS 경고창으로 대신 띄운다(멈추지 않게).
// 앱마다 다른 값: accent(실행 단추 색)·onAccent(그 위 글자색, 기본 흰색)·colors(카드·글자 색을 앱 장면 값으로 바꿀 때만)·stack(늘 세로 쌓기).
// 공용 원본 LegalDocView(메일 주소 복사 알림)·UpdatePrompt(업데이트 안내)가 './AppDialog'로 이 파일을 쓴다 — 셋을 같은 폴더에 함께 복사한다.
// 필요한 라이브러리: 없음(react-native만).
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View, useColorScheme, type ColorValue } from 'react-native';

export type DialogButton = { text: string; kind?: 'cancel' | 'primary' | 'destructive' };
export type DialogOptions = { title: string; msg?: string; buttons: DialogButton[]; dismissable?: boolean };
type Req = DialogOptions & { done: (i: number) => void };
type Palette = { card: string; text: string; sub: string; fill: string; red: string };
type Look = { accent?: ColorValue; onAccent?: ColorValue; colors?: { light?: Partial<Palette>; dark?: Partial<Palette> }; stack?: boolean };
type Layer = { look: Look; cur: Req | null; give: (r: Req | null) => void };

const layers: Layer[] = []; // 붙은 순서 = 아래 → 위
const queue: Req[] = [];

// 가장 위 층이 비었으면 줄의 맨 앞 요청을 띄운다
function pump() {
  const top = layers[layers.length - 1];
  if (!top || top.cur || !queue.length) return;
  top.cur = queue.shift()!;
  top.give(top.cur);
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
  const dark = useColorScheme() === 'dark';
  const me = useRef<Layer>({ look: props, cur: null, give: setCur }).current;
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
  if (stack) order.sort((x, y) => Number(x.b.kind === 'cancel') - Number(y.b.kind === 'cancel'));
  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => closable && pick(cancel)}>
      <Pressable style={st.scrim} onPress={() => closable && pick(cancel)} accessible={false}>
        <Pressable style={[st.card, { backgroundColor: c.card }, dark && st.cardDark]} accessible={false} accessibilityViewIsModal>
          <Text style={[st.title, { color: c.text }]} accessibilityRole="header" lineBreakStrategyIOS="hangul-word" maxFontSizeMultiplier={1.5}>{cur.title}</Text>
          {!!cur.msg && <Text style={[st.msg, { color: c.sub }]} lineBreakStrategyIOS="hangul-word" maxFontSizeMultiplier={1.5}>{cur.msg}</Text>}
          <View style={[st.row, stack && st.stack]}>
            {order.map(({ b, i }) => {
              const k = b.kind ?? 'primary';
              const bg = k === 'cancel' ? c.fill : k === 'destructive' ? c.red : look.accent ?? '#007AFF';
              const fg = k === 'cancel' ? c.text : k === 'destructive' ? '#FFFFFF' : look.onAccent ?? '#FFFFFF';
              return (
                <Pressable key={i} onPress={() => pick(i)} accessibilityRole="button" style={({ pressed }) => [st.btn, !stack && st.btnFlex, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}>
                  <Text style={[st.btnText, { color: fg, fontWeight: k === 'cancel' ? '600' : '700' }]} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.3}>{b.text}</Text>
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
  card: { width: '100%', maxWidth: 400, borderRadius: 28, paddingTop: 24, paddingHorizontal: 20, paddingBottom: 20, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  cardDark: { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: 'rgba(255,255,255,0.12)' }, // 다크에선 카드가 배경과 붙어 테두리
  title: { fontSize: 19, fontWeight: '700', textAlign: 'center', paddingHorizontal: 8 },
  msg: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8, paddingHorizontal: 8 },
  row: { flexDirection: 'row', gap: 10, marginTop: 20 },
  stack: { flexDirection: 'column' },
  btn: { minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  btnFlex: { flex: 1 },
  btnText: { fontSize: 17 },
});
