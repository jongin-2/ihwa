# ihwa — 공개 고객 지원·개인정보처리방침

주량체커(DrinkChecker)·차곡(Chagok) 두 앱이 함께 쓰는 **공개 페이지**다. **약관·방침·지원의 원문은 여기뿐이다** — 앱은 본문을 들고 있지 않고 아래 언어별 주소를 앱 안 브라우저(expo-web-browser)로 연다(2026-09-28 종인님 규칙: 앱 출시 없이 고칠 수 있게). App Store Support URL·방침 URL도 이 주소다.

- 고객 지원: https://jongin-2.github.io/ihwa/support/
- 개인정보처리방침: https://jongin-2.github.io/ihwa/privacy/
- 이용약관: https://jongin-2.github.io/ihwa/terms/
- 앱 안에서 여는 언어별 주소: `…/<support|privacy|terms>/ko/`, `…/en/`(build.py가 `## 한국어`·`## English` 절을 떼어 만든다)

원문은 `src/*.md`, `python3 build.py`로 `docs/`를 만든다(GitHub Pages가 `docs/`를 게시). 고치면 `python3 build.py` 후 커밋·푸시만 하면 두 앱에 바로 반영된다(Notion 사본은 폐기).
