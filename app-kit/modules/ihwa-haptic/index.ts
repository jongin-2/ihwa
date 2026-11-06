// 공용 진동 — expo-haptics와 같은 모양(impactAsync 등)이라 import 한 줄만 바꿔 쓴다. 원본: ihwa-site/app-kit/modules/ihwa-haptic (앱 사본은 글자 그대로)
// expo-haptics는 부를 때마다 생성기를 새로 만들고 바로 울려 연타 때 손맛이 약하거나 늦었다(11-03 알롱 2fb70edc·한배 588741f).
// 모듈은 생성기를 종류마다 하나씩 들고 다시 쓰며, 울린 직후 prepare()로 탭틱 엔진을 깨워 둔다. 연타가 시작될 자리에서는 prepare()를 먼저 부른다.
// 앱과 함께 배포되므로 모듈은 늘 있다(없으면 조용히 건너뜀 — Expo Go·웹 등). Android는 화면의 공식 촉각 피드백(performHapticFeedback)으로 울리고 prepare는 하는 일 없음(11-06 한배 Android 판).
import { requireOptionalNativeModule } from 'expo';

type Native = { impact(style: string): void; notify(kind: string): void; selection(): void; prepare(kind: string): void };
const M = requireOptionalNativeModule<Native>('IhwaHaptic');

export enum ImpactFeedbackStyle { Light = 'light', Medium = 'medium', Heavy = 'heavy', Soft = 'soft', Rigid = 'rigid' }
export enum NotificationFeedbackType { Success = 'success', Warning = 'warning', Error = 'error' }

export async function impactAsync(style: ImpactFeedbackStyle = ImpactFeedbackStyle.Medium): Promise<void> { M?.impact(style); }
export async function notificationAsync(type: NotificationFeedbackType = NotificationFeedbackType.Success): Promise<void> { M?.notify(type); }
export async function selectionAsync(): Promise<void> { M?.selection(); }
/** 곧 연타가 나올 때 미리 부른다(탭틱 엔진은 몇 초 뒤 스스로 잠듦). */
export function prepare(kind: ImpactFeedbackStyle | 'notification' | 'selection' = ImpactFeedbackStyle.Light): void { M?.prepare(kind); }
