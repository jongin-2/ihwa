// "언어<TAB>낱말" 줄을 받아 맥 애플 사전 분철(CFStringGetHyphenationLocationBeforeIndex)로 "언어<TAB>낱말<TAB>음-절-자-리"를 낸다.
// 사전이 없는 언어(id·tr 등)는 세 번째 칸이 NA — 음절 규칙으로 손으로 나눈다. 자리 없음(fr Juillet)은 세 번째 칸이 낱말 그대로라 손으로 정한다.
// 한 글자 조각(cs Li-s-to-pad)은 옆 조각에 자동으로 붙인다 — 줄 끝·줄 머리에 한 글자만 남지 않게(11-13 응원석 e134317 규칙, 코어가 잠깐 따로 만든 scripts/hyphenate.swift를 여기로 합침).
// 공용 원본 — ihwa-site/app-kit/scripts/hyphenate/. 빌드: swiftc -O hyphenate.swift -o "$TMPDIR/hyphenate"(바이너리는 저장소에 두지 않음)   쓰는 법: node date-words.js … | "$TMPDIR/hyphenate"
// 화면 문구 낱말은 앱 시험의 longWords 결과를 "언어<TAB>낱말"로 만들어 같은 식으로 넣는다. 손질 세 가지: NA 언어는 음절 규칙, 한 글자 조각은 붙임, 자리 없는 낱말은 손으로.
// 애플 사전이 틀리게 끊는 낱말은 아래 표가 이긴다(11-13 맵나이츠 b6b079d: en·fr notification → notif-ication). 열쇠는 "언어:소문자 낱말", 값은 하이픈 자리 — 대소문자는 원래 낱말을 따른다.
let FIX: [String: String] = [
  "en:notification": "no-ti-fi-ca-tion", "en:notifications": "no-ti-fi-ca-tions",
  "fr:notification": "no-ti-fi-ca-tion", "fr:notifications": "no-ti-fi-ca-tions",
]
import Foundation
while let line = readLine() {
  let p = line.split(separator: "\t").map(String.init); guard p.count >= 2 else { continue }
  let lang = String(p[0].prefix(2)); let w = p[1]
  if let f = FIX["\(lang):\(w.lowercased())"], f.replacingOccurrences(of: "-", with: "") == w.lowercased() {
    var o = ""; var i = w.startIndex
    for ch in f { if ch == "-" { o += "-" } else { o.append(w[i]); i = w.index(after: i) } }
    print("\(p[0])\t\(w)\t\(o)"); continue
  }
  let loc = Locale(identifier: lang) as CFLocale
  guard CFStringIsHyphenationAvailableForLocale(loc) else { print("\(p[0])\t\(w)\tNA"); continue }
  let s = w as NSString; var idx = s.length; var cuts: [Int] = []
  while idx > 0 {
    let r = CFStringGetHyphenationLocationBeforeIndex(w as CFString, idx, CFRange(location: 0, length: s.length), 0, loc, nil)
    if r == kCFNotFound || r <= 0 { break }; cuts.append(r); idx = r
  }
  var keep: [Int] = []
  for c in cuts.reversed() where c >= 2 && c <= s.length - 2 && c - (keep.last ?? 0) >= 2 { keep.append(c) }
  var o = ""; var last = 0
  for c in keep { o += s.substring(with: NSRange(location: last, length: c - last)) + "-"; last = c }
  o += s.substring(from: last); print("\(p[0])\t\(w)\t\(o)")
}
