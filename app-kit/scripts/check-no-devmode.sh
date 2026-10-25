#!/bin/bash
# 운영 빌드에 QA 개발자 모드가 남지 않았는지 확인한다(10-25 종인님 "빌드에서 빼기로 앱 고쳐" — ihwa-qa 스킬 '개발자 모드(QA 전용)').
# 앱은 개발자 모드 코드에만 표식 글자 IHWA_DEV_MODE를 둔다(JS: 개발자 모드 모듈 안 상수, Swift: #if QA 안 상수).
# 운영 빌드는 그 모듈이 빌드 때 빠지므로 표식이 없어야 한다. QA 빌드엔 있어야 한다(검사 자체가 도는지 확인용).
#   bash check-no-devmode.sh <운영 .app 또는 .ipa 또는 main.jsbundle> [--expect-present]
# 업로드 스크립트(testflight.sh --release)가 아카이브 뒤 부른다. 실패하면 0이 아닌 값으로 끝난다.
set -euo pipefail
target="${1:?사용: check-no-devmode.sh <.app|.ipa|jsbundle> [--expect-present]}"
expect="${2:-}"
MARK='IHWA_DEV_MODE'
tmp=""
if [[ "$target" == *.ipa ]]; then
  tmp=$(mktemp -d); unzip -q "$target" -d "$tmp"; target="$tmp"
fi
found=$(grep -rla "$MARK" "$target" 2>/dev/null | head -3 || true)
[ -n "$tmp" ] && rm -rf "${tmp:?}"
if [ "$expect" = "--expect-present" ]; then
  [ -n "$found" ] && { echo "통과: QA 빌드에 개발자 모드 표식 있음"; exit 0; }
  echo "실패: QA 빌드에 표식 $MARK 이 없음 — 개발자 모드 모듈에 표식 상수를 두었는지 확인" >&2; exit 1
fi
if [ -n "$found" ]; then
  echo "실패: 운영 빌드에 개발자 모드가 남음($MARK):" >&2; echo "$found" >&2; exit 1
fi
echo "통과: 운영 빌드에 개발자 모드 없음"
