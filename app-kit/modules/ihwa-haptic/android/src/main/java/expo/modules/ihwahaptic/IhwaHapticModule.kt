// 공용 진동 모듈 Android 판 — iOS IhwaHapticModule.swift와 같은 이름·인자(index.ts 머리말).
// 진동기(Vibrator)를 직접 울리지 않고 화면의 performHapticFeedback(Android 공식 촉각 피드백)을 쓴다:
// VIBRATE 권한이 필요 없고, 기기마다 맞춰 둔 진동 모양과 사용자의 '터치 진동' 설정을 그대로 따른다.
// 탭틱 엔진처럼 미리 깨울 것이 없어 prepare는 아무것도 하지 않는다.
package expo.modules.ihwahaptic

import android.os.Build
import android.view.HapticFeedbackConstants
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class IhwaHapticModule : Module() {
  private fun perform(constant: Int) {
    val activity = appContext.currentActivity ?: return
    activity.runOnUiThread { activity.window?.decorView?.performHapticFeedback(constant) }
  }

  // iOS 세기에 가까운 Android 상수(가벼운 것 → 무거운 것). 새 상수는 지원하는 판에서만 쓴다.
  private fun impactConstant(style: String): Int = when (style) {
    "light" -> HapticFeedbackConstants.CLOCK_TICK
    "soft" -> if (Build.VERSION.SDK_INT >= 27) HapticFeedbackConstants.TEXT_HANDLE_MOVE else HapticFeedbackConstants.CLOCK_TICK
    "rigid" -> HapticFeedbackConstants.CONTEXT_CLICK
    "heavy" -> HapticFeedbackConstants.LONG_PRESS
    else -> HapticFeedbackConstants.VIRTUAL_KEY // medium
  }

  private fun notifyConstant(kind: String): Int = when (kind) {
    "error" -> if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.REJECT else HapticFeedbackConstants.LONG_PRESS
    "warning" -> HapticFeedbackConstants.LONG_PRESS
    else -> if (Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.VIRTUAL_KEY // success
  }

  override fun definition() = ModuleDefinition {
    Name("IhwaHaptic")

    Function("impact") { style: String -> perform(impactConstant(style)) }
    Function("notify") { kind: String -> perform(notifyConstant(kind)) }
    Function("selection") {
      perform(if (Build.VERSION.SDK_INT >= 34) HapticFeedbackConstants.SEGMENT_TICK else HapticFeedbackConstants.CLOCK_TICK)
    }
    Function("prepare") { _: String -> }
  }
}
