// 공용 진동 모듈 — 생성기를 종류마다 하나씩 보관해 다시 쓰고, 울린 직후 prepare()로 탭틱 엔진을 깨워 둔다(index.ts 머리말).
import ExpoModulesCore
import UIKit

public class IhwaHapticModule: Module {
  private var impacts: [String: UIImpactFeedbackGenerator] = [:]
  private var notifier: UINotificationFeedbackGenerator?
  private var selector: UISelectionFeedbackGenerator?

  private func impactGen(_ style: String) -> UIImpactFeedbackGenerator {
    if let g = impacts[style] { return g }
    let s: UIImpactFeedbackGenerator.FeedbackStyle
    switch style {
    case "light": s = .light
    case "heavy": s = .heavy
    case "soft": s = .soft
    case "rigid": s = .rigid
    default: s = .medium
    }
    let g = UIImpactFeedbackGenerator(style: s)
    impacts[style] = g
    return g
  }

  private func notifyGen() -> UINotificationFeedbackGenerator {
    if let g = notifier { return g }
    let g = UINotificationFeedbackGenerator()
    notifier = g
    return g
  }

  private func selectGen() -> UISelectionFeedbackGenerator {
    if let g = selector { return g }
    let g = UISelectionFeedbackGenerator()
    selector = g
    return g
  }

  public func definition() -> ModuleDefinition {
    Name("IhwaHaptic")

    Function("impact") { (style: String) in
      DispatchQueue.main.async {
        let g = self.impactGen(style)
        g.impactOccurred()
        g.prepare()
      }
    }
    Function("notify") { (kind: String) in
      DispatchQueue.main.async {
        let g = self.notifyGen()
        switch kind {
        case "warning": g.notificationOccurred(.warning)
        case "error": g.notificationOccurred(.error)
        default: g.notificationOccurred(.success)
        }
        g.prepare()
      }
    }
    Function("selection") {
      DispatchQueue.main.async {
        let g = self.selectGen()
        g.selectionChanged()
        g.prepare()
      }
    }
    Function("prepare") { (kind: String) in
      DispatchQueue.main.async {
        switch kind {
        case "notification": self.notifyGen().prepare()
        case "selection": self.selectGen().prepare()
        default: self.impactGen(kind).prepare()
        }
      }
    }
  }
}
