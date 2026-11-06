// 공용 업데이트 확인 Android — Play In-App Updates(구글 공식). 공용 UpdatePrompt.ts가 이 모듈로 Android 새 판을 묻고 업데이트 화면을 띄운다.
// Play는 새 판의 버전 이름을 알려 주지 않는다 — 중요도는 판을 올릴 때 붙이는 업데이트 우선순위(0~5, 공식 방법)로 받는다(11-06 종인님 "첫번째판부터 준비").
// Play 스토어로 설치하지 않은 앱(에뮬레이터 직접 설치 등)은 조회가 실패하므로 '새 판 없음'으로 돌려준다.
package expo.modules.ihwaappupdate

import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class IhwaAppUpdateModule : Module() {
  private val manager by lazy { AppUpdateManagerFactory.create(appContext.reactContext!!) }

  override fun definition() = ModuleDefinition {
    Name("IhwaAppUpdate")

    // { available, priority, stalenessDays(없으면 -1), immediate, flexible } — 실패하면 available false
    AsyncFunction("getInfo") { promise: Promise ->
      val none = mapOf("available" to false, "priority" to 0, "stalenessDays" to -1, "immediate" to false, "flexible" to false)
      if (appContext.reactContext == null) { promise.resolve(none); return@AsyncFunction }
      manager.appUpdateInfo
        .addOnSuccessListener { i ->
          val avail = i.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE ||
            i.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
          promise.resolve(mapOf(
            "available" to avail,
            "priority" to i.updatePriority(),
            "stalenessDays" to (i.clientVersionStalenessDays() ?: -1),
            "immediate" to i.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE),
            "flexible" to i.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE),
          ))
        }
        .addOnFailureListener { promise.resolve(none) }
    }

    // 구글 전체 화면 업데이트(즉시형)를 띄운다 — 띄웠으면 true, 못 띄우면 false(그때 JS가 Play 링크로)
    AsyncFunction("startImmediate") { promise: Promise ->
      val activity = appContext.currentActivity
      if (activity == null) { promise.resolve(false); return@AsyncFunction }
      manager.appUpdateInfo
        .addOnSuccessListener { i ->
          val ok = (i.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE ||
            i.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) &&
            i.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
          if (!ok) { promise.resolve(false); return@addOnSuccessListener }
          manager.startUpdateFlow(i, activity, AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build())
            .addOnSuccessListener { promise.resolve(true) }
            .addOnFailureListener { promise.resolve(false) }
        }
        .addOnFailureListener { promise.resolve(false) }
    }
  }
}
