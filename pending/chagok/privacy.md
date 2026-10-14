# 개인정보처리방침 · Privacy Policy

[한국어](#ko) · [English](#en)

<a id="ko"></a>
## 한국어

**적용 앱: 주량체커 · 응원석 · 차곡**

세 앱 모두 기본으로는 개인정보를 수집하지 않습니다. 주량체커·차곡은 설정에서 '계정 연결'(Apple·Google)을 한 경우에만 계정 정보와 기록을 백업 서버에 저장하고(2절), 응원석은 '실시간 현황'을 켠 경우에만 잠금 화면에 점수를 띄우기 위한 기기 토큰을 운영자 서버에 보관합니다(2절). 세 앱 모두 앱을 개선하기 위해 익명 사용 통계를 보냅니다(3절). 각 절에서 앱 이름으로 구분해 적었습니다.

### 1. 수집하는 정보

주량체커·차곡은 계정 연결 없이 모든 기능을 쓸 수 있고, 계정을 연결하지 않으면 이름·이메일·전화번호 등 어떤 개인 식별 정보도 수집하지 않습니다(3절의 통계 도구가 설치마다 붙이는 무작위 식별자는 이름·연락처와 연결되지 않습니다).

설정에서 계정을 연결하면 로그인 서비스(Apple 또는 Google)가 주는 계정 식별자·이메일(Apple '이메일 가리기'를 쓰면 대체 주소)·이름(Google 프로필에 있을 때)을 받습니다.

**응원석**은 계정·로그인 없이 쓰는 앱으로, 이름·이메일·전화번호·위치를 수집하지 않습니다.

### 2. 데이터 저장 방식

앱에서 입력하는 모든 정보는 사용자의 기기 안에 저장됩니다. 홈 화면 위젯과 데이터를 주고받을 때도 같은 기기 안의 앱 전용 공유 공간만 씁니다. 앱을 삭제하면 이 데이터도 함께 삭제됩니다. 앱은 이 정보를 외부 서버로 보내는 일이 없습니다.

계정을 연결하면 기록(술 종류·양·날짜·시각·한도)과 지금 연결된 기기를 구별하는 무작위 번호가 Google Firebase(Cloud Firestore)의 계정별 공간에 저장되어, 폰을 바꿔도 같은 계정으로 연결하면 기록이 돌아옵니다. 이 공간은 본인 계정으로만 읽고 쓸 수 있습니다.

- **국외 이전 고지**: 계정 정보(계정 식별자·이메일·이름)는 미국에서, 기록은 대한민국(서울 리전)에서 Google LLC가 처리·보관합니다. 계정을 연결하거나 기록이 바뀔 때마다 인터넷으로 전송되며, 연결을 해제할 때까지 보관합니다.
- **삭제**: 설정 맨 위 '연결된 계정' 아래의 '연결 해제'를 누르면 서버의 기록과 계정을 바로 지웁니다. 이 폰의 기록은 그대로 남습니다. 다른 기기에서 같은 계정을 연결하면 앞 기기는 연결이 해제되고(서버 기록은 유지), 그 기기의 기록도 그대로 남습니다.

**차곡**: 계정을 연결하면 기록(어느 취미에 무엇을 언제 기록했는지 — 앨범 사진으로 기록했으면 사진을 찍은 날짜 포함, 사진으로 확인된 기록인지)과 지금 연결된 기기를 구별하는 무작위 번호가 위와 같은 방식(Google Firebase Cloud Firestore, 계정 정보는 미국·기록은 대한민국 서울 리전)으로 계정별 공간에 저장됩니다. **기록에 쓴 사진은 서버에 올리지 않습니다** — 사진은 기기에만 남아, 기기를 바꾸면 사진 자리에 안내만 보입니다. 서버의 기록과 계정은 설정의 계정 카드에서 '연결 해제'를 누르면 바로 지워지며(되돌릴 수 없음), 이 폰의 기록은 그대로 남습니다.

**응원석**: 고른 응원팀과 '실시간 현황' 켜기·끄기는 기기 안에만 저장하며, 홈 화면 위젯과는 같은 기기 안의 앱 전용 공유 공간으로 주고받습니다. '실시간 현황'을 켠 경우에만, 경기가 시작될 때 잠금 화면에 점수를 띄우기 위해 Apple이 발급하는 **기기 토큰**(사람을 알아볼 수 없는 무작위 값)과 **응원팀 코드**, **앱 언어**를 운영자 서버에 보관합니다.

- **국외 이전 고지**: 운영자 서버는 Cloudflare, Inc.(미국)의 서비스이며 데이터베이스는 아시아·태평양 지역에서 운영됩니다. '실시간 현황'을 켤 때와 응원팀을 바꿀 때 인터넷으로 전송되며, '실시간 현황'을 끄면 서버에서 바로 지웁니다. 앱을 지우면 Apple이 토큰을 무효로 하고 서버도 그 토큰을 지웁니다.

다만 기기에서 iCloud 백업을 켜 두었다면, iOS가 기기를 백업할 때 이 앱의 데이터도 함께 백업됩니다. 이는 iOS가 사용자 본인의 iCloud 계정으로 암호화해 보관하는 것이고 앱이 따로 전송하는 것이 아니며, 개발자는 그 백업에 접근할 수 없습니다. 원하지 않으면 기기 설정 > 사용자 이름 > iCloud > iCloud 백업에서 백업을 끄거나 이 앱을 백업 대상에서 제외할 수 있습니다.

### 3. 네트워크 통신과 사용 통계

계정을 연결하지 않으면 기록한 내용을 주고받는 서버가 없습니다(연결하면 2절의 백업 서버만 씁니다). 입력한 내용은 기기에도 그대로 있어 인터넷이 없어도 핵심 기능이 동작합니다.

**차곡**의 사진 인식은 전부 기기 안에서 처리되며 사진은 기기 밖으로 나가지 않습니다. 다만 사진이 책(표지나 뒷면)으로 판단되면 저자 등 도서 정보를 찾기 위해 사진에서 읽어 낸 **책 제목 글자 또는 ISBN 번호만**(사진도 개인 식별 정보도 아님) 도서 정보 제공처 **Open Library**(Internet Archive, 미국)와 **국립중앙도서관**(대한민국)에 조회합니다. 사진 인식을 쓰지 않고 직접 입력하면 이 조회는 일어나지 않습니다.

**응원석**은 경기 점수·일정·순위를 운영자 서버(Cloudflare)에서 받습니다. 이때 일반적인 웹 요청처럼 IP 주소 같은 접속 정보가 Cloudflare를 거치며, 운영자는 이를 따로 보관하지 않습니다.

서비스 개선을 위한 통계 분석에 쓰기 위해 Google Firebase Analytics로 **서비스 이용 기록**과 **기기정보**(기기 종류·OS 버전·앱 버전, 앱 설치마다 정해지는 무작위 식별값), IP 주소로 추정한 **대략적인 지역**(국가·도시 수준 — Google이 IP 주소 일부를 가린 뒤 추정합니다)을 자동으로 수집합니다. 이 정보로 이용자를 식별하지 않으며, 이름·연락처·광고 식별자와 연결하지 않습니다.

**통계로 보내지 않는 것**: 사용자가 기록한 내용 자체입니다. 주량체커의 마신 양·술 종류·마신 시각·설정한 한도 값·한도를 넘었는지 여부, 차곡의 기록한 제목·메모·사진은 통계에 어떤 형태로도 담기지 않습니다(계정을 연결했을 때 2절의 백업 공간에만 저장됩니다 — 사진은 그곳에도 올리지 않습니다). 광고 식별자(IDFA)도 수집하지 않으며, 광고나 사용자 추적에 이 정보를 쓰지 않습니다. 크래시 리포트도 보내지 않습니다.

### 4. 기기 권한

앱이 요청하는 기기 권한은 그 서비스가 실제로 필요로 하는 최소한으로 제한됩니다 — 주량체커는 음주량이 한도를 넘을 때 알려주기 위해 **알림** 권한을 요청합니다. 알림은 기기 안에서 만들어지며 외부 서버를 거치지 않습니다. 어떤 권한을 왜 쓰는지는 이 방침과 앱 화면에서 안내됩니다(주량체커는 처음 실행할 때 안내하고, 설정의 '알림'에서 켜고 끔). 차곡은 기록을 사진으로 자동 인식하기 위해 **카메라**(앨범에서 고르는 경우 **사진 보관함**) 권한을, 기록하지 않은 날 저녁에 한 번 알려 주기 위해 **알림** 권한을 요청합니다(카메라 권한을 꺼도 직접 입력은 그대로 됩니다). 응원석은 기기 권한을 요청하지 않습니다 — '실시간 현황'은 알림 권한과 별개로 동작하며, 앱의 내 자리나 기기 설정에서 끌 수 있습니다. 모든 권한은 언제든 기기 설정에서 끌 수 있고, 꺼도 앱의 핵심 기능에는 영향이 없습니다.

### 5. 제3자 서비스

앱은 3절의 사용 통계를 위해 Google Firebase Analytics를, 계정을 연결했을 때 2절의 백업을 위해 Firebase Authentication·Cloud Firestore와 Sign in with Apple·Google 로그인을 씁니다. 설정에서 이용약관·개인정보처리방침을 열면 이 문서를 보여 주기 위해 앱이 **GitHub Pages**(GitHub, Inc.)에서 페이지를 불러옵니다. 이때 일반적인 웹 페이지를 열 때처럼 IP 주소 같은 접속 정보가 GitHub에 전달될 수 있으며, 운영자는 이 정보를 받거나 보관하지 않습니다. 차곡은 주량체커와 같은 Firebase 서비스(통계·계정 연결 때의 인증·Cloud Firestore)에 더해, 서버 요청이 진짜 차곡 앱에서 왔는지 확인하기 위해 **Firebase App Check**(Apple App Attest·DeviceCheck — 사람을 알아보는 정보가 아닌 앱 무결성 확인)를, 3절의 도서 정보 조회를 위해 Open Library와 국립중앙도서관을 씁니다. 응원석은 Google Firebase Analytics(3절), 운영자 서버를 위한 Cloudflare, 잠금 화면 점수 전달을 위한 Apple 푸시 알림 서비스(APNs)를 씁니다. 광고 SDK와 크래시 리포트 도구는 포함하지 않습니다. Firebase Analytics에는 3절에 적은 정보만 전달되며, 기록 내용은 전달되지 않습니다. 앱이 사용하는 오픈소스 라이브러리 목록은 설정 > 오픈소스 라이선스에서 확인할 수 있습니다.

### 6. 아동의 개인정보

앱은 아동을 대상으로 하지 않으며, 아동을 겨냥한 기능이나 별도 수집은 없습니다. 3절의 사용 통계는 사용자와 연결되지 않는 익명 정보입니다.

### 7. 변경 사항

이 방침이 변경되면 이 페이지에 바로 반영됩니다. 앱 안에서도 이 페이지를 그대로 보여 주므로 늘 최신 내용을 확인할 수 있습니다.

### 운영자와 문의

{{운영_줄}}

📧 [ihwa.support@gmail.com](mailto:ihwa.support@gmail.com)

최종 수정일: 2026-10-11

---

<a id="en"></a>
## English

**Applies to: DrinkChecker · CheerSeat · Chagok**

By default none of the apps collects your personal information. DrinkChecker and Chagok store your account details and records on a backup server only if you connect an account (Apple or Google) in Settings (section 2), and CheerSeat keeps a device token on the operator's server only if you turn on Live Activities, so it can show the score on your Lock Screen (section 2). All three apps send anonymous usage statistics to help improve them (section 3). Each section names the app it applies to.

### 1. Information we collect

Every feature of DrinkChecker and Chagok works without connecting an account, and if you don't connect one, the app collects no personally identifying information — no name, email, or phone number (the analytics tool in section 3 assigns a random per-installation identifier that is not linked to your name or contact details).

If you connect an account in Settings, the app receives the account identifier, email address (a relay address if you use Apple's Hide My Email) and name (if your Google profile has one) provided by the sign-in service (Apple or Google).

**CheerSeat** has no account or login and does not collect your name, email, phone number, or location.

### 2. How your data is stored

Everything you enter in the app is stored on your own device. When the app exchanges data with its Home Screen widget, it uses only a private storage area on the same device. Deleting the app deletes this data too. The app never sends this information to any server.

If you connect an account, your records (drink type, amount, date and time, and limit) and a random number that identifies the currently connected device are stored in a per-account space in Google Firebase (Cloud Firestore), so your records come back when you connect the same account on a new phone. Only your own account can read or write that space.

- **International transfer**: your account details (account identifier, email, name) are processed and stored by Google LLC in the United States, and your records in South Korea (Seoul region). They are sent over the internet when you connect and whenever your records change, and kept until you disconnect.
- **Deletion**: tapping Disconnect under Connected Account at the top of Settings deletes your records and account from the server immediately. The records on your phone stay. If you connect the same account on another device, the earlier device is disconnected (the server copy stays) and keeps its records too.

**Chagok**: if you connect an account, your records (which hobby, what and when — including the date a photo was taken if you logged from your photo library — and whether a record was confirmed by a photo) and a random number that identifies the currently connected device are stored in a per-account space the same way (Google Firebase Cloud Firestore; account details in the United States, records in the Seoul region of South Korea). **Photos you use for records are never uploaded** — they stay on your device, so on a new device a note appears in their place. Tapping Disconnect on the account card in Settings deletes your server records and account immediately (this cannot be undone); the records on your phone stay.

**CheerSeat**: your team and the Live Activities setting are stored on your device only; the Home Screen widget reads them from a private storage area on the same device. Only if Live Activities are on, the app keeps a **device token** issued by Apple (a random value that cannot identify you), your **team code** and the **app language** on the operator's server, so it can start the Live Activity on your Lock Screen when a game begins.

- **International transfer**: the operator's server runs on Cloudflare, Inc. (United States), with the database in the Asia-Pacific region. This data is sent over the internet when you turn Live Activities on or change your team, and is deleted from the server as soon as you turn Live Activities off. If you delete the app, Apple invalidates the token and the server deletes it.

If iCloud Backup is turned on, your device backup includes this app's data. That backup is made and encrypted by iOS under your own iCloud account — the app does not send anything itself, and the developer cannot access it. You can turn it off, or exclude this app from it, under Settings > [your name] > iCloud > iCloud Backup.

### 3. Network communication and usage statistics

If you don't connect an account, there is no server that exchanges what you record (if you do, only the backup server in section 2 is used). What you enter also stays on your device, so the core features work with no internet connection.

**Chagok** recognizes photos entirely on your device, and photos never leave it. If a photo is judged to be a book (cover or back), only the **book title text or ISBN read from it** (neither the photo nor personal information) is looked up with the book-information providers **Open Library** (Internet Archive, United States) and the **National Library of Korea**, to find details such as the author. If you enter a record by hand instead, no lookup happens.

**CheerSeat** gets scores, schedules and standings from the operator's server (Cloudflare). As with any web request, connection details such as your IP address pass through Cloudflare; the operator does not keep them.

To analyze statistics for improving the service, the apps automatically collect **service usage records**, **device information** (device model, OS version, app version, and a random identifier created for each installation of the app) and an **approximate region** derived from your IP address (country or city level — Google masks part of the IP address before estimating it) through Google Firebase Analytics. This information is not used to identify you and is not linked to your name, contact details, or advertising identifier.

**What the statistics never include**: the contents of what you record. In DrinkChecker, how much you drank, what you drank, when, the limit you set, and whether you went over it; in Chagok, the titles, notes and photos you record — none of these are included in the statistics in any form (if you connect an account, they are stored only in the backup space in section 2, and photos are never uploaded there either). The app does not collect an advertising identifier (IDFA), and none of this is used for advertising or to track you. It sends no crash reports.

### 4. Device permissions

The app only requests the minimum device permissions that the service actually needs — DrinkChecker requests **notifications** to let you know when you've gone over your limit. Notifications are created on your device and never pass through a server. What the app uses and why is explained in this policy and in the app itself (DrinkChecker explains notifications during first-run setup, and you can turn them on or off under Notifications in Settings). Chagok requests the **camera** (or **photo library** when you pick from your albums) to recognize records from photos, and **notifications** to remind you once in the evening on days you haven't logged (with the camera off you can still enter records by hand). CheerSeat requests no device permissions — Live Activities work separately from notification permission and can be turned off in My Seat or in your device settings. Every permission can be turned off anytime in your device settings, and the app's core functionality still works either way.

### 5. Third-party services

The app uses Google Firebase Analytics for the usage statistics in section 3 and, if you connect an account, Firebase Authentication, Cloud Firestore, Sign in with Apple and Google Sign-In for the backup in section 2. When you open Terms of Service or the Privacy Policy in Settings, the app loads these pages from **GitHub Pages** (GitHub, Inc.). As with opening any web page, connection details such as your IP address may reach GitHub; the operator does not receive or keep this information. Chagok uses the same Firebase services as DrinkChecker (analytics, and authentication and Cloud Firestore when you connect an account), plus **Firebase App Check** (Apple App Attest and DeviceCheck — an app-integrity check, not information that identifies you) to verify that server requests come from the genuine Chagok app, and Open Library and the National Library of Korea for the book lookup in section 3. CheerSeat uses Google Firebase Analytics (section 3), Cloudflare for the operator's server, and the Apple Push Notification service (APNs) to deliver scores to your Lock Screen. The app does not include advertising SDKs or crash-reporting tools. Firebase Analytics receives only the information described in section 3 — never the contents of your records. The list of open-source libraries the app uses is available under Settings > Open Source Licenses.

### 6. Children's privacy

The app is not directed at children, and has no child-directed features or separate collection from children. The usage statistics in section 3 are anonymous and not linked to any person.

### 7. Changes

Any change to this policy is published on this page right away. The app shows this same page, so you always see the current version.

### Operator and contact

{{OPERATOR_LINE}}

📧 [ihwa.support@gmail.com](mailto:ihwa.support@gmail.com)

Last updated: 2026-10-11
