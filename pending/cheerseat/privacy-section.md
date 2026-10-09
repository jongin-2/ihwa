<!-- 응원석 앱별 단락 — src/privacy.md 각 절에 끼워 넣을 내용(한국어·영어) -->

## 한국어

**응원석**은 계정·로그인이 없고 이름·이메일·전화번호·위치를 수집하지 않습니다.

- **기기 안에만 두는 것**: 고른 응원팀, 잠금화면 실시간 켜기·끄기. 홈 화면 위젯과는 같은 기기 안 앱 전용 공유 공간으로 주고받습니다.
- **운영자 서버(Cloudflare)로 보내는 것**: 잠금화면 실시간을 켠 경우에만, 경기가 시작될 때 잠금화면에 점수를 띄우기 위한 **기기 토큰**(Apple이 발급하는 무작위 값, 사람을 알아볼 수 없음)과 **응원팀 코드**, **앱 언어**를 보냅니다. 잠금화면 실시간을 끄면 서버에서 지웁니다. 앱을 지우면 Apple이 토큰을 무효로 하고 서버도 그 토큰을 지웁니다.
- **경기 정보 받기**: 경기 점수·일정·순위는 운영자 서버에서 받습니다. 이때 일반 웹 요청처럼 IP 주소 같은 접속 정보가 Cloudflare를 거치며, 운영자는 이를 따로 보관하지 않습니다.
- **사용 통계(Google Firebase Analytics)** — 앱이 직접 보내는 것은 여섯 가지 사실뿐입니다: 위젯 설치 · 응원팀을 고름(처음 실행인지 내 자리인지, 고른 구단) · 잠금화면 실시간이 켜짐(앱에서인지 서버에서인지) · 잠금화면 실시간 켜기/끄기/iOS에서 꺼짐 · 위젯·잠금화면을 눌러 앱을 엶 · 서버 연결 실패(어느 화면인지만). 그 밖의 자동 수집 항목은 공통 3절과 같습니다. 광고 식별자는 수집하지 않습니다.
- **알림 권한은 요청하지 않습니다**(잠금화면 실시간은 알림 권한 없이 동작하며 iOS 설정에서 끌 수 있습니다).
- 경기 데이터 출처: API-Sports, 순위 대조: 위키백과(CC BY-SA). 구단 이름·엠블럼은 각 구단의 상표입니다.

## English

**Cheer Seat** has no account or login and does not collect your name, email, phone number, or location.

- **Kept on your device only**: your team and the Lock Screen live-score setting. The Home Screen widget reads them from a private storage area on the same device.
- **Sent to the operator's server (Cloudflare)**: only if Lock Screen live scores are on — a **device token** issued by Apple (a random value that cannot identify you), your **team code**, and the **app language**, so the server can start live scores on your Lock Screen when a game begins. Turning the setting off deletes them from the server; deleting the app makes Apple invalidate the token and the server deletes it.
- **Game data**: scores, schedules, and standings come from the operator's server. As with any web request, connection information such as your IP address passes through Cloudflare; the operator does not store it.
- **Usage statistics (Google Firebase Analytics)** — the app itself sends only six facts: widget installed · team chosen (first launch or My Seat, and which club) · Lock Screen live score started (by the app or the server) · Lock Screen setting on/off/disabled in iOS · app opened from the widget or Lock Screen · server connection failed (which screen only). Other automatically collected items are as in section 3. No advertising identifier is collected.
- **No notification permission is requested** (Lock Screen live scores work without it and can be turned off in iOS Settings).
- Game data: API-Sports; standings check: Wikipedia (CC BY-SA). Club names and emblems are trademarks of their respective clubs.
