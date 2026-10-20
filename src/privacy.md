# 개인정보처리방침 · Privacy Policy

[한국어](#ko) · [English](#en)

<a id="ko"></a>
## 한국어

**적용 앱: 주량체커 · 응원석 · 차곡**

모든 앱은 기본으로는 개인정보를 수집하지 않습니다. 계정 연결(Apple·Google)을 제공하는 주량체커·차곡은 설정에서 '계정 연결'을 한 경우에만 계정 정보와 기록을 백업 서버에 저장합니다(2절). 응원석은 '실시간 현황'을 켜거나 위젯을 놓은 경우에만 점수를 바로 띄우기 위한 기기 토큰을 운영자 서버에 보관합니다(2절). 모든 앱은 앱을 개선하기 위해 익명 사용 통계를 보냅니다(3절). 앱마다 다른 내용은 각 절 끝에 앱 이름을 붙여 적었습니다.

### 1. 수집하는 정보

받는 정보는 앱마다 다릅니다. 통계 도구가 설치마다 붙이는 무작위 식별자는 이름·연락처와 연결되지 않습니다(3절).

- **주량체커·차곡**: 계정 연결 없이 모든 기능을 쓸 수 있고, 계정을 연결하지 않으면 이름·이메일·전화번호 등 어떤 개인 식별 정보도 수집하지 않습니다. 설정에서 계정을 연결하면 로그인 서비스(Apple 또는 Google)가 주는 계정 식별자·이메일(Apple '이메일 가리기'를 쓰면 대체 주소)만 받습니다.
- **응원석**: 계정·로그인 없이 쓰는 앱으로, 이름·이메일·전화번호·위치를 수집하지 않습니다.

### 2. 데이터 저장 방식

앱에서 입력하는 정보는 사용자의 기기 안에 저장되며, 앱을 삭제하면 함께 삭제됩니다.

**주량체커·차곡**: 계정을 연결하면 기록과 지금 연결된 기기를 구별하는 무작위 번호가 Google Firebase(Cloud Firestore)의 계정별 공간에 저장되어, 폰을 바꿔도 같은 계정으로 연결하면 기록이 돌아옵니다. 이 공간은 본인 계정으로만 읽고 쓸 수 있습니다. 한 계정은 한 기기에만 연결되며, 다른 기기에서 같은 계정을 연결하면 앞 기기는 연결이 해제됩니다(서버 기록과 그 기기의 기록은 그대로 남습니다).

- **국외 이전 고지**: 계정 정보(계정 식별자·이메일, 차곡은 닉네임)는 미국에서, 기록은 대한민국(서울 리전)에서 Google LLC가 처리·보관합니다. 계정을 연결하거나 기록이 바뀔 때마다 인터넷으로 전송되며, 연결을 해제할 때까지 보관합니다.
- **삭제**: 설정의 계정 카드에서 '연결 해제'를 누르면 서버의 기록과 계정을 바로 지웁니다. 이 폰의 기록은 그대로 남습니다.

- **주량체커**: 서버에 저장되는 기록은 술 종류·양·날짜·시각·한도입니다. 계정 카드는 설정 맨 위에 있습니다.
- **차곡**: 서버에 저장되는 기록은 어느 취미에 무엇을 언제 기록했는지(앨범 사진으로 기록했으면 사진을 찍은 날짜 포함)와 사진으로 확인된 기록인지입니다. 앱에서 닉네임을 정하면 계정 정보의 이름 칸에 저장됩니다. **기록에 쓴 사진은 서버에 올리지 않습니다** — 사진은 기기에만 남아, 기기를 바꾸면 사진 자리에 안내만 보입니다. '연결 해제'로 지운 서버의 기록과 계정은 되돌릴 수 없습니다.
- **응원석**: 고른 응원팀과 '실시간 현황' 켜기·끄기는 기기 안에만 저장합니다. '실시간 현황'을 켠 경우에만, 경기가 시작될 때 잠금 화면에 점수를 띄우기 위해 Apple이 발급하는 **기기 토큰**(무작위 값)과 **응원팀 코드**, **앱 언어**를 운영자 서버에 보관합니다. iOS 26 이상에서 홈 화면·잠금 화면에 위젯을 놓으면 Apple이 발급하는 **위젯 토큰**(무작위 값)과 **응원팀 코드**를 운영자 서버에 보관하며, 점수가 바뀔 때 위젯을 바로 새로 그리는 데 씁니다.
  - **국외 이전 고지**: 운영자 서버는 Cloudflare, Inc.(미국)의 서비스이며 데이터베이스는 아시아·태평양 지역에서 운영됩니다. '실시간 현황'을 켤 때, 위젯을 놓을 때, 응원팀을 바꿀 때 인터넷으로 전송되며, '실시간 현황'을 끄면 그 토큰을 서버에서 바로 지웁니다. 앱을 지우는 등으로 Apple이 토큰을 무효로 하면 서버도 그 토큰을 지웁니다.

### 3. 네트워크 통신과 사용 통계

모든 앱은 서비스 개선을 위한 통계 분석에 쓰기 위해 Google Firebase Analytics로 **서비스 이용 기록**과 **기기정보**(기기 종류·OS 버전·앱 버전, 앱 설치마다 정해지는 무작위 식별값)를 자동으로 수집합니다. IP 주소로 추정한 **대략적인 지역**(국가·도시 수준)도 수집하며, Google이 IP 주소 일부를 가린 뒤 추정합니다. 이 정보로 이용자를 식별하지 않으며, 이름·연락처·광고 식별자와 연결하지 않습니다. Firebase Analytics에는 이 절에 적은 정보만 전달됩니다.

**통계로 보내지 않는 것**: 사용자가 기록한 내용 자체는 통계에 어떤 형태로도 담기지 않습니다. 광고 식별자(IDFA)도 수집하지 않으며, 광고나 사용자 추적에 이 정보를 쓰지 않습니다. 크래시 리포트도 보내지 않습니다.

**외부 요청과 IP 주소**: 앱이 5절의 외부 서비스에 요청을 보낼 때 일반적인 웹 요청처럼 IP 주소 같은 접속 정보가 그 서비스에 전달될 수 있으며, 운영자는 이를 받거나 보관하지 않습니다.

- **주량체커**: 통계에 담기지 않는 기록 내용은 마신 양·술 종류·마신 시각·설정한 한도 값·한도를 넘었는지 여부입니다. 계정을 연결했을 때 이 기록은 2절의 백업 공간에만 저장됩니다.
- **차곡**: 통계에 담기지 않는 기록 내용은 기록한 제목·메모·사진입니다. 계정을 연결했을 때 기록은 2절의 백업 공간에만 저장되며, 사진은 그곳에도 올리지 않습니다. 사진 인식은 전부 기기 안에서 처리되며 사진은 기기 밖으로 나가지 않습니다. 다만 사진이 책(표지나 뒷면)으로 판단되면 저자 등 도서 정보를 찾기 위해 사진에서 읽어 낸 **책 제목 글자 또는 ISBN 번호만**(사진도 개인 식별 정보도 아님) 도서 정보 제공처 **Open Library**(Internet Archive, 미국)와 **국립중앙도서관**(대한민국)에 조회합니다. 사진 인식을 쓰지 않고 직접 입력하면 이 조회는 일어나지 않습니다.
- **응원석**: 경기 점수·일정·순위를 운영자 서버(Cloudflare)에서 받습니다. 이 요청의 접속 정보는 Cloudflare를 거치며, 운영자는 이를 따로 보관하지 않습니다.

### 4. 기기 권한

앱이 요청하는 기기 권한은 그 서비스가 실제로 필요로 하는 최소한으로 제한됩니다. 어떤 권한을 왜 쓰는지는 이 방침과 앱 화면에서 안내됩니다. 모든 권한은 언제든 기기 설정에서 끌 수 있고, 꺼도 앱의 핵심 기능에는 영향이 없습니다.

- **주량체커**: 음주량이 한도를 넘을 때 알려주기 위해 **알림** 권한을 요청합니다. 알림은 기기 안에서 만들어지며 외부 서버를 거치지 않습니다. 처음 실행할 때 안내하고, 설정의 '알림'에서 켜고 끕니다.
- **차곡**: 기록을 사진으로 자동 인식하기 위해 **카메라**(앨범에서 고르는 경우 **사진 보관함**) 권한을, 기록하지 않은 날 저녁에 한 번 알려 주기 위해 **알림** 권한을 요청합니다(카메라 권한을 꺼도 직접 입력은 그대로 됩니다).
- **응원석**: 기기 권한을 요청하지 않습니다 — '실시간 현황'은 알림 권한과 별개로 동작하며, 앱의 내 자리나 기기 설정에서 끌 수 있습니다.

### 5. 제3자 서비스

모든 앱은 3절의 사용 통계를 위해 Google Firebase Analytics를 씁니다. 설정에서 이용약관·개인정보처리방침을 열 때 **GitHub Pages**(GitHub, Inc.)에서 문서 페이지를 불러옵니다. 앱을 켤 때는 업데이트 안내가 필요한지 확인하려고 같은 곳의 작은 설정 파일을 불러오고, App Store(Apple)의 공개 조회로 최신 버전 번호를 확인합니다(IP 주소 전달은 3절 참고). 광고 SDK와 크래시 리포트 도구는 포함하지 않습니다.

- **주량체커·차곡**: 계정을 연결했을 때 2절의 백업을 위해 Firebase Authentication·Cloud Firestore와 Sign in with Apple·Google 로그인을 씁니다.
- **차곡**: 3절의 도서 정보 조회를 위해 Open Library와 국립중앙도서관을 씁니다.
- **응원석**: 운영자 서버를 위한 Cloudflare, 잠금 화면·위젯 점수 전달을 위한 Apple 푸시 알림 서비스(APNs)를 씁니다.

### 6. 아동의 개인정보

앱은 아동을 대상으로 하지 않으며, 아동을 겨냥한 기능이나 별도 수집은 없습니다. 3절의 사용 통계는 익명입니다.

### 7. 변경 사항

이 방침이 변경되면 이 페이지에 바로 반영됩니다. 앱 안에서도 이 페이지를 그대로 보여 주므로 늘 최신 내용을 확인할 수 있습니다.

### 운영자와 문의

{{운영_줄}}

📧 [ihwa.support@gmail.com](mailto:ihwa.support@gmail.com)

최종 수정일: 2026-10-17

---

<a id="en"></a>
## English

**Applies to: DrinkChecker · CheerSeat · Chagok**

By default none of the apps collects your personal information. DrinkChecker and Chagok, which offer account connection (Apple or Google), store your account details and records on a backup server only if you connect an account in Settings (section 2). CheerSeat keeps a device token on the operator's server only if you turn on Live Activities or add a widget, so it can show the score right away (section 2). All apps send anonymous usage statistics to help improve them (section 3). What differs by app is listed at the end of each section under the app's name.

### 1. Information we collect

What we receive differs by app. The analytics tool assigns a random per-installation identifier that is not linked to your name or contact details (section 3).

- **DrinkChecker and Chagok**: every feature works without connecting an account, and if you don't connect one, the app collects no personally identifying information — no name, email, or phone number. If you connect an account in Settings, the app receives only the account identifier and email address (a relay address if you use Apple's Hide My Email) provided by the sign-in service (Apple or Google).
- **CheerSeat**: has no account or login and does not collect your name, email, phone number, or location.

### 2. How your data is stored

What you enter in the app is stored on your device and is deleted when you delete the app.

**DrinkChecker and Chagok**: if you connect an account, your records and a random number that identifies the currently connected device are stored in a per-account space in Google Firebase (Cloud Firestore), so your records come back when you connect the same account on a new phone. Only your own account can read or write that space. An account can be connected to one device at a time; connecting it on another device disconnects the earlier one (the server copy and that device's records stay).

- **International transfer**: your account details (account identifier, email, and in Chagok your nickname) are processed and stored by Google LLC in the United States, and your records in South Korea (Seoul region). They are sent over the internet when you connect and whenever your records change, and kept until you disconnect.
- **Deletion**: tapping Disconnect on the account card in Settings deletes your records and account from the server immediately. The records on your phone stay.

- **DrinkChecker**: the records stored on the server are drink type, amount, date and time, and limit. The account card is at the top of Settings.
- **Chagok**: the records stored on the server are which hobby, what and when — including the date a photo was taken if you logged from your photo library — and whether a record was confirmed by a photo. If you set a nickname in the app, it is stored in the name field of your account details. **Photos you use for records are never uploaded** — they stay on your device, so on a new device a note appears in their place. Server records and the account deleted with Disconnect cannot be recovered.
- **CheerSeat**: your team and the Live Activities setting are stored on your device only. Only if Live Activities are on, the app keeps a **device token** issued by Apple (a random value), your **team code** and the **app language** on the operator's server, so it can start the Live Activity on your Lock Screen when a game begins. On iOS 26 or later, if you add a widget to your Home Screen or Lock Screen, the app keeps a **widget token** issued by Apple (a random value) and your **team code** on the operator's server and uses them to redraw the widget right away when the score changes.
  - **International transfer**: the operator's server runs on Cloudflare, Inc. (United States), with the database in the Asia-Pacific region. This data is sent over the internet when you turn Live Activities on, add a widget or change your team. The Live Activities token is deleted from the server as soon as you turn Live Activities off. When Apple invalidates a token, for example because you deleted the app, the server deletes it too.

### 3. Network communication and usage statistics

To analyze statistics for improving the service, all apps automatically collect **service usage records** and **device information** (device model, OS version, app version, and a random identifier created for each installation of the app) through Google Firebase Analytics. They also collect an **approximate region** derived from your IP address (country or city level); Google masks part of the IP address before estimating it. This information is not used to identify you and is not linked to your name, contact details, or advertising identifier. Firebase Analytics receives only the information described in this section.

**What the statistics never include**: the contents of what you record. No app collects an advertising identifier (IDFA), and none of this is used for advertising or to track you. The apps send no crash reports.

**External requests and your IP address**: when an app makes a request to an external service listed in section 5, then, as with any web request, connection details such as your IP address may reach that service; the operator does not receive or keep this information.

- **DrinkChecker**: the record contents kept out of the statistics are how much you drank, what you drank, when, the limit you set, and whether you went over it. If you connect an account, these records are stored only in the backup space in section 2.
- **Chagok**: the record contents kept out of the statistics are the titles, notes and photos you record. If you connect an account, records are stored only in the backup space in section 2, and photos are never uploaded there either. Chagok recognizes photos entirely on your device, and photos never leave it. If a photo is judged to be a book (cover or back), only the **book title text or ISBN read from it** (neither the photo nor personal information) is looked up with the book-information providers **Open Library** (Internet Archive, United States) and the **National Library of Korea**, to find details such as the author. If you enter a record by hand instead, no lookup happens.
- **CheerSeat**: gets scores, schedules and standings from the operator's server (Cloudflare). Connection details of this request pass through Cloudflare; the operator does not keep them.

### 4. Device permissions

The apps only request the minimum device permissions that the service actually needs. What each app uses and why is explained in this policy and in the app itself. Every permission can be turned off anytime in your device settings, and the app's core functionality still works either way.

- **DrinkChecker**: requests **notifications** to let you know when you've gone over your limit. Notifications are created on your device and never pass through a server. The app explains this during first-run setup, and you can turn notifications on or off under Notifications in Settings.
- **Chagok**: requests the **camera** (or **photo library** when you pick from your albums) to recognize records from photos, and **notifications** to remind you once in the evening on days you haven't logged (with the camera off you can still enter records by hand).
- **CheerSeat**: requests no device permissions — Live Activities work separately from notification permission and can be turned off in My Seat or in your device settings.

### 5. Third-party services

All apps use Google Firebase Analytics for the usage statistics in section 3. Opening Terms of Service or the Privacy Policy in Settings loads the page from **GitHub Pages** (GitHub, Inc.). When an app opens, it loads a small settings file from the same place and checks the latest version number with the App Store's public lookup (Apple) to see whether an update notice is needed (see section 3 for the IP address). The apps do not include advertising SDKs or crash-reporting tools.

- **DrinkChecker and Chagok**: if you connect an account, they use Firebase Authentication, Cloud Firestore, Sign in with Apple and Google Sign-In for the backup in section 2.
- **Chagok**: uses Open Library and the National Library of Korea for the book lookup in section 3.
- **CheerSeat**: uses Cloudflare for the operator's server, and the Apple Push Notification service (APNs) to deliver scores to your Lock Screen and widgets.

### 6. Children's privacy

The app is not directed at children, and has no child-directed features or separate collection from children. The usage statistics in section 3 are anonymous.

### 7. Changes

Any change to this policy is published on this page right away. The app shows this same page, so you always see the current version.

### Operator and contact

{{OPERATOR_LINE}}

📧 [ihwa.support@gmail.com](mailto:ihwa.support@gmail.com)

Last updated: 2026-10-17
