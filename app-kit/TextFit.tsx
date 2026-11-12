// 큰 글씨(AX5)에서 낱말이 글자 단위로 꺾이지 않게 하는 공용 도구 — 원본 ihwa-site/app-kit, 앱 사본은 글자 그대로(11-12 응원석 1.1.2 회귀 a33a4d9에서 옮김).
import { Text, View, type StyleProp, type TextStyle } from 'react-native';

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

// 두 줄 이름을 줄마다 한 줄짜리 글자로 그려 따로 줄여 맞춘다 — numberOfLines 2 + adjustsFontSizeToFit 대신.
// 좁은 칸(세그먼트·스위치 옆 이름 등)은 상한 1.3이 기본.
export function FitLines({ text, style, max = 1.3, min = 0.5, align = 'left' }: { text: string; style?: StyleProp<TextStyle>; max?: number; min?: number; align?: 'left' | 'right' | 'center' }) {
  const parts = splitTwo(text).split('\n');
  if (parts.length === 1) return <Text maxFontSizeMultiplier={max} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={min} style={style}>{text}</Text>;
  return (
    <View style={{ flexShrink: 1, alignItems: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start' }}>
      {parts.map((p, i) => <Text key={i} maxFontSizeMultiplier={max} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={min} style={style}>{p}</Text>)}
    </View>
  );
}
