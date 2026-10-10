# 개인정보처리방침 · Privacy Policy

[한국어](#ko) · [English](#en)

<a id="ko"></a>
## 한국어

**적용 앱: 주량체커**

기본으로는 개인정보를 수집하지 않고 기록은 기기 안에만 있습니다. 설정에서 '계정 연결'(Apple·Google)을 한 경우에만 계정 정보와 기록을 백업 서버에 저장합니다(2절). 또 앱을 개선하기 위해 익명 사용 통계를 보냅니다(3절).

### 1. 수집하는 정보

주량체커는 계정 연결 없이 모든 기능을 쓸 수 있고, 계정을 연결하지 않으면 이름·이메일·전화번호 등 어떤 개인 식별 정보도 수집하지 않습니다(3절의 통계 도구가 설치마다 붙이는 무작위 식별자는 이름·연락처와 연결되지 않습니다).

설정에서 계정을 연결하면 로그인 서비스(Apple 또는 Google)가 주는 계정 식별자·이메일(Apple '이메일 가리기'를 쓰면 대체 주소)·이름(Google 프로필에 있을 때)을 받습니다.

### 2. 데이터 저장 방식

앱에서 입력하는 모든 정보는 사용자의 기기 안에 저장됩니다. 홈 화면 위젯과 데이터를 주고받을 때도 같은 기기 안의 앱 전용 공유 공간만 씁니다. 앱을 삭제하면 이 데이터도 함께 삭제됩니다. 앱은 이 정보를 외부 서버로 보내는 일이 없습니다.

계정을 연결하면 기록(술 종류·양·날짜·시각·한도)과 지금 연결된 기기를 구별하는 무작위 번호가 Google Firebase(Cloud Firestore)의 계정별 공간에 저장되어, 폰을 바꿔도 같은 계정으로 연결하면 기록이 돌아옵니다. 이 공간은 본인 계정으로만 읽고 쓸 수 있습니다.

- **국외 이전 고지**: 계정 정보(계정 식별자·이메일·이름)는 미국에서, 기록은 대한민국(서울 리전)에서 Google LLC가 처리·보관합니다. 계정을 연결하거나 기록이 바뀔 때마다 인터넷으로 전송되며, 연결을 해제할 때까지 보관합니다.
- **삭제**: 설정 맨 위 '연결된 계정' 아래의 '연결 해제'를 누르면 서버의 기록과 계정을 바로 지웁니다. 이 폰의 기록은 그대로 남습니다. 다른 기기에서 같은 계정을 연결하면 앞 기기는 연결이 해제되고(서버 기록은 유지), 그 기기의 기록도 그대로 남습니다.

다만 기기에서 iCloud 백업을 켜 두었다면, iOS가 기기를 백업할 때 이 앱의 데이터도 함께 백업됩니다. 이는 iOS가 사용자 본인의 iCloud 계정으로 암호화해 보관하는 것이고 앱이 따로 전송하는 것이 아니며, 개발자는 그 백업에 접근할 수 없습니다. 원하지 않으면 기기 설정 > 사용자 이름 > iCloud > iCloud 백업에서 백업을 끄거나 이 앱을 백업 대상에서 제외할 수 있습니다.

### 3. 네트워크 통신과 사용 통계

계정을 연결하지 않으면 기록한 내용을 주고받는 서버가 없습니다(연결하면 2절의 백업 서버만 씁니다). 입력한 내용은 기기에도 그대로 있어 인터넷이 없어도 핵심 기능이 동작합니다.

다만 어떤 기능이 실제로 이용되는지 알기 위해 Google Firebase Analytics로 **익명 사용 통계**를 보냅니다. 앱이 직접 보내는 것은 해당 기능을 이용했다는 사실뿐입니다.

주량체커가 직접 보내는 항목은 다음 일곱 가지입니다: 한 잔을 기록함(앱에서인지 위젯에서인지만) · 위젯 설치 · 주량(한도) 설정(온보딩인지 설정인지만) · 한도 점검 카드 응답(적용/닫음) · 기록 되돌리기 · 알림 권한 허용/거부 · 저장 실패(어느 단계인지만).

이와 별도로 Firebase Analytics가 통계 도구로서 다음을 자동으로 기록합니다: 앱 설치마다 무작위로 정해지는 식별자(이름·연락처·광고 식별자와 연결되지 않음), 앱을 연 횟수·사용 시간 같은 기본 사용 정보, 기기 종류·OS 버전·앱 버전, IP 주소로 추정한 대략적인 지역(국가·도시 수준 — Google이 IP 주소 일부를 가린 뒤 추정합니다).

**통계로 보내지 않는 것**: 사용자가 기록한 내용 자체입니다. 마신 양·술 종류·마신 시각·설정한 한도 값·한도를 넘었는지 여부는 통계에 어떤 형태로도 담기지 않습니다(계정을 연결했을 때 2절의 백업 공간에만 저장됩니다). 광고 식별자(IDFA)도 수집하지 않으며, 광고나 사용자 추적에 이 정보를 쓰지 않습니다. 크래시 리포트도 보내지 않습니다.

### 4. 기기 권한

앱이 요청하는 기기 권한은 그 서비스가 실제로 필요로 하는 최소한으로 제한됩니다 — 주량체커는 음주량이 한도를 넘을 때 알려주기 위해 **알림** 권한을 요청합니다. 알림은 기기 안에서 만들어지며 외부 서버를 거치지 않습니다. 어떤 권한을 왜 쓰는지는 이 방침과 앱 화면에서 안내됩니다(주량체커는 처음 실행할 때 안내하고, 설정의 '알림'에서 켜고 끔). 모든 권한은 언제든 기기 설정에서 끌 수 있고, 꺼도 앱의 핵심 기능에는 영향이 없습니다.

### 5. 제3자 서비스

앱은 3절의 사용 통계를 위해 Google Firebase Analytics를, 계정을 연결했을 때 2절의 백업을 위해 Firebase Authentication·Cloud Firestore와 Sign in with Apple·Google 로그인을 씁니다. 설정에서 이용약관·개인정보처리방침을 열면 이 문서를 보여 주기 위해 앱이 **GitHub Pages**(GitHub, Inc.)에서 페이지를 불러옵니다. 이때 일반적인 웹 페이지를 열 때처럼 IP 주소 같은 접속 정보가 GitHub에 전달될 수 있으며, 운영자는 이 정보를 받거나 보관하지 않습니다. 광고 SDK와 크래시 리포트 도구는 포함하지 않습니다. Firebase Analytics에는 3절에 적은 정보만 전달되며, 기록 내용은 전달되지 않습니다. 앱이 사용하는 오픈소스 라이브러리 목록은 설정 > 오픈소스 라이선스에서 확인할 수 있습니다.

### 6. 아동의 개인정보

앱은 아동을 대상으로 하지 않으며, 아동을 겨냥한 기능이나 별도 수집은 없습니다. 3절의 사용 통계는 사용자와 연결되지 않는 익명 정보입니다.

### 7. 변경 사항

이 방침이 변경되면 이 페이지에 바로 반영됩니다. 앱 안에서도 이 페이지를 그대로 보여 주므로 늘 최신 내용을 확인할 수 있습니다.

### 운영자와 문의

{{운영_줄}}

📧 [ihwa.support@gmail.com](mailto:ihwa.support@gmail.com)

최종 수정일: 2026-10-10

---

<a id="en"></a>
## English

**Applies to: DrinkChecker**

By default the app does not collect your personal information, and your records stay on your device. Only if you connect an account (Apple or Google) in Settings are your account details and records stored on a backup server (section 2). The app also sends anonymous usage statistics to help improve it (section 3).

### 1. Information we collect

Every feature of DrinkChecker works without connecting an account, and if you don't connect one, the app collects no personally identifying information — no name, email, or phone number (the analytics tool in section 3 assigns a random per-installation identifier that is not linked to your name or contact details).

If you connect an account in Settings, the app receives the account identifier, email address (a relay address if you use Apple's Hide My Email) and name (if your Google profile has one) provided by the sign-in service (Apple or Google).

### 2. How your data is stored

Everything you enter in the app is stored on your own device. When the app exchanges data with its Home Screen widget, it uses only a private storage area on the same device. Deleting the app deletes this data too. The app never sends this information to any server.

If you connect an account, your records (drink type, amount, date and time, and limit) and a random number that identifies the currently connected device are stored in a per-account space in Google Firebase (Cloud Firestore), so your records come back when you connect the same account on a new phone. Only your own account can read or write that space.

- **International transfer**: your account details (account identifier, email, name) are processed and stored by Google LLC in the United States, and your records in South Korea (Seoul region). They are sent over the internet when you connect and whenever your records change, and kept until you disconnect.
- **Deletion**: tapping Disconnect under Connected Account at the top of Settings deletes your records and account from the server immediately. The records on your phone stay. If you connect the same account on another device, the earlier device is disconnected (the server copy stays) and keeps its records too.

If iCloud Backup is turned on, your device backup includes this app's data. That backup is made and encrypted by iOS under your own iCloud account — the app does not send anything itself, and the developer cannot access it. You can turn it off, or exclude this app from it, under Settings > [your name] > iCloud > iCloud Backup.

### 3. Network communication and usage statistics

If you don't connect an account, there is no server that exchanges what you record (if you do, only the backup server in section 2 is used). What you enter also stays on your device, so the core features work with no internet connection.

To learn which features people actually use, the app does send **anonymous usage statistics** through Google Firebase Analytics. It records only that a feature was used. DrinkChecker itself sends these seven items: a drink was logged (only whether from the app or the widget) · the widget was added · a drink limit was set (only whether during setup or from Settings) · the limit check-in card was answered (applied or dismissed) · an entry was undone · whether notification permission was granted or denied · a save failed (only which step).

Separately, Firebase Analytics as an analytics tool automatically records: a random identifier created for each installation of the app (not linked to your name, contact details, or advertising identifier), basic usage such as how often and how long the app is opened, your device model, OS version and app version, and an approximate region derived from your IP address (country or city level — Google masks part of the IP address before estimating it).

**What the statistics never include**: the contents of what you record. How much you drank, what you drank, when, the limit you set, and whether you went over it are never included in the statistics in any form (if you connect an account, they are stored only in the backup space in section 2). The app does not collect an advertising identifier (IDFA), and none of this is used for advertising or to track you. It sends no crash reports.

### 4. Device permissions

The app only requests the minimum device permissions that the service actually needs — DrinkChecker requests **notifications** to let you know when you've gone over your limit. Notifications are created on your device and never pass through a server. What the app uses and why is explained in this policy and in the app itself (DrinkChecker explains notifications during first-run setup, and you can turn them on or off under Notifications in Settings). Every permission can be turned off anytime in your device settings, and the app's core functionality still works either way.

### 5. Third-party services

The app uses Google Firebase Analytics for the usage statistics in section 3 and, if you connect an account, Firebase Authentication, Cloud Firestore, Sign in with Apple and Google Sign-In for the backup in section 2. When you open Terms of Service or the Privacy Policy in Settings, the app loads these pages from **GitHub Pages** (GitHub, Inc.). As with opening any web page, connection details such as your IP address may reach GitHub; the operator does not receive or keep this information. The app does not include advertising SDKs or crash-reporting tools. Firebase Analytics receives only the information described in section 3 — never the contents of your records. The list of open-source libraries the app uses is available under Settings > Open Source Licenses.

### 6. Children's privacy

The app is not directed at children, and has no child-directed features or separate collection from children. The usage statistics in section 3 are anonymous and not linked to any person.

### 7. Changes

Any change to this policy is published on this page right away. The app shows this same page, so you always see the current version.

### Operator and contact

{{OPERATOR_LINE}}

📧 [ihwa.support@gmail.com](mailto:ihwa.support@gmail.com)

Last updated: 2026-10-10
