// 공용 원본 — ihwa-site/app-kit/scripts/hyphenate.swift. 앱 낱말 목록(makeSoftHyphen의 appBreaks)을 손으로 채우지 않고 만드는 도구.
// 맥에 든 애플 사전 분철(CFStringGetHyphenationLocationBeforeIndex — iOS가 쓰는 것과 같은 사전)로 음절 자리를 '-'로 적는다(11-13 응원석 e134317 방법, 주량체커 349낱말 회신).
// 앱에 들어가는 것은 결과 낱말 목록뿐이라 앱 크기·의존성이 늘지 않는다(npm hyphen 패턴 9MB 대신).
// 쓰기: 한 줄에 "언어코드<TAB>낱말"(예: ru\tнастройки)을 넣으면 한 줄에 "на-строй-ки"를 낸다. 사전에 없는 언어·자리 없는 낱말은 '# 없음 <언어> <낱말>'.
//   swift ~/Projects/ihwa-site/app-kit/scripts/hyphenate.swift < words.tsv > breaks.txt
// 한 글자 조각은 옆 조각에 붙인다(줄 끝에 한 글자만 남거나 한 글자로 시작하지 않게 — 응원석과 같은 규칙).
// 애플 사전이 없는 언어(tr 등 — 11-13 맥에서 tr·ja 없음)는 '# 없음 … (사전 없음)'으로 나오니 그 언어만 손으로 더한다.
import Foundation

func breaks(_ word: String, _ lang: String) -> [Int]? {
  let loc = Locale(identifier: lang) as CFLocale
  guard CFStringIsHyphenationAvailableForLocale(loc) else { return nil }
  let s = word as NSString as CFString
  let n = CFStringGetLength(s)
  var at: [Int] = []
  var i = n
  while i > 0 {
    let k = CFStringGetHyphenationLocationBeforeIndex(s, i, CFRange(location: 0, length: n), 0, loc, nil)
    if k == kCFNotFound || k <= 0 { break }
    at.append(k)
    i = k
  }
  // UTF-16 위치 → 조각, 한 글자 조각 붙이기
  var cuts = Array(Set(at)).sorted().filter { $0 >= 2 && $0 <= n - 2 }
  var j = 1
  while j < cuts.count { if cuts[j] - cuts[j - 1] < 2 { cuts.remove(at: j) } else { j += 1 } }
  return cuts
}

while let line = readLine() {
  let p = line.split(separator: "\t", maxSplits: 1).map(String.init)
  guard p.count == 2, !p[1].isEmpty else { continue }
  let (lang, word) = (p[0], p[1])
  guard let cuts = breaks(word, lang) else { print("# 없음 \(lang) \(word) (사전 없음)"); continue }
  if cuts.isEmpty { print("# 없음 \(lang) \(word)"); continue }
  let u = Array(word.utf16)
  var out = "", prev = 0
  for c in cuts { out += String(utf16CodeUnits: Array(u[prev..<c]), count: c - prev) + "-"; prev = c }
  out += String(utf16CodeUnits: Array(u[prev...]), count: u.count - prev)
  print(out)
}
