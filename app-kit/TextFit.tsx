// 큰 글씨(AX5)에서 낱말이 글자 단위로 꺾이지 않게 하는 공용 도구 — 원본 ihwa-site/app-kit, 앱 사본은 글자 그대로(11-12 응원석 1.1.2 회귀 a33a4d9에서 옮김).
import { StyleSheet, Text, View, useWindowDimensions, type StyleProp, type TextStyle } from 'react-native';

// 큰 제목 상한 — RN은 모든 글자를 같은 배율(AX5 약 3.1배)로 키우지만 iOS 글자 스타일은 제목일수록 덜 커진다(애플 HIG Dynamic Type 크기표, AX5:
// Large Title 34→60·Title 1 28→58·Title 2 22→56·Title 3 20→53). 상한을 푼 제목이 그 이상 커져 짧은 낱말까지 꺾이던 것(es 'Jugadore/s').
// 쓰기: <Text maxFontSizeMultiplier={titleMul(28)} …> — 22pt 이상 제목에.
export const titleMul = (size: number) => (size >= 34 ? 1.76 : size >= 28 ? 2.07 : size >= 24 ? 2.3 : size >= 22 ? 2.55 : 2.65);

// 두 줄까지 줄여 맞추는 이름은 iOS가 낱말 가운데서 꺾는다(ru 'Республи/ка Корея') — 가운데에 가까운 띄어쓰기에서 미리 나눈다.
export const splitTwo = (s: string) => {
  const sp = [...s.matchAll(/ /g)].map((m) => m.index!);
  if (!sp.length) return s;
  const i = sp.reduce((b, x) => (Math.abs(x - s.length / 2) < Math.abs(b - s.length / 2) ? x : b));
  return s.slice(0, i) + '\n' + s.slice(i + 1);
};

// 한 줄 줄이기(adjustsFontSizeToFit)에 줄 높이를 그대로 주면 iOS에서 글자가 4pt까지 줄어든다(11-13 알롱 69d168c5 — RN 0.86 iOS 원문 확인):
// 줄이기 판정이 '상자 높이 ≥ 잰 글자 높이'도 보는데 lineHeight는 글꼴을 줄여도 안 줄고, Yoga 픽셀 반올림 뒤 32비트 오차로 상자가 미세하게 작으면
// 끝까지 '넘침' → 최소 4pt(iOS는 minimumFontScale을 안 쓰고 minimumFontSize 기본 4pt). 어떤 폭·자리에서만 나서 잘 안 보인다.
// 쓰기: 줄이기 쓰는 글자에 lineHeight·고정 height를 직접 적지 말고 style={[s.name, fitBox(20, 1.3)]} — 상자를 1pt 넉넉히(minHeight), 아래 여백 -1로 배치는 그대로.
// scale = 지금 글자 배율(상한까지) — Math.min(useWindowDimensions().fontScale, 상한). 상한을 그대로 넣으면 기본 크기에서도 상자가 커져 배치가 바뀜(11-13 맵나이츠).
// height 고정은 큰 글씨에서 같은 문제라 minHeight.
export const fitBox = (lineHeight: number, scale = 1): TextStyle => ({ lineHeight, minHeight: lineHeight * scale + 1, marginBottom: -1 });
// 호출부 style에 lineHeight가 있으면 fitBox로 바꿔 끼운다(height는 뺌).
const fitStyle = (style: StyleProp<TextStyle>, scale: number): StyleProp<TextStyle> => {
  const f = StyleSheet.flatten(style);
  if (!f || f.lineHeight == null) return style;
  const { lineHeight, height: _h, ...rest } = f;
  return [rest, fitBox(lineHeight, scale)];
};

// 두 줄 이름을 줄마다 한 줄짜리 글자로 그려 따로 줄여 맞춘다 — numberOfLines 2 + adjustsFontSizeToFit 대신.
// 좁은 칸(세그먼트·스위치 옆 이름 등)은 상한 1.3이 기본.
export function FitLines({ text, style, max = 1.3, min = 0.5, align = 'left' }: { text: string; style?: StyleProp<TextStyle>; max?: number; min?: number; align?: 'left' | 'right' | 'center' }) {
  const parts = splitTwo(text).split('\n');
  const { fontScale } = useWindowDimensions();
  style = fitStyle(style, Math.min(Math.max(fontScale, 1), max));
  if (parts.length === 1) return <Text maxFontSizeMultiplier={max} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={min} style={style}>{text}</Text>;
  return (
    <View style={{ flexShrink: 1, alignItems: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start' }}>
      {parts.map((p, i) => <Text key={i} maxFontSizeMultiplier={max} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={min} style={style}>{p}</Text>)}
    </View>
  );
}
