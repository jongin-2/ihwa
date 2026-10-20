# 계정 연결 공용 문구(주량체커·차곡·알롱)

세 앱이 글자 그대로 같은 말을 쓴다(전역 CLAUDE.md 9절). 앱에 넣을 땐 이 표를 복사하고, 고칠 땐 이 파일부터 고친 뒤 세 앱에 알린다. 번역 원본은 차곡 1.0.0(10-17, 57efabf) — '기록' 낱말은 주량체커 연결 해제 번역과 같게.

## 연결 전 설정 줄 — 제목 / 보조 줄

| 언어 | 제목 | 보조 줄 |
|---|---|---|
| ko | 계정 연결 | 폰을 바꿔도 기록이 이어져요 |
| en | Connect Account | Keep your records when you change phones |
| ja | アカウント連携 | 機種変更しても記録が引き継がれます |
| zh-Hans | 连接账号 | 换手机也能保留记录 |
| zh-Hant | 連接帳號 | 換手機也能保留記錄 |
| es | Conectar cuenta | Conserva tus registros al cambiar de teléfono |
| pt | Conectar conta | Mantenha seus registros ao trocar de celular |
| de | Konto verbinden | Deine Einträge bleiben beim Handywechsel erhalten |
| fr | Connecter un compte | Gardez vos enregistrements en changeant de téléphone |
| it | Collega account | Mantieni i registri quando cambi telefono |
| ru | Подключить аккаунт | Записи сохранятся при смене телефона |
| tr | Hesap bağla | Telefon değiştirsen de kayıtların kalır |
| id | Hubungkan akun | Catatan tetap ada saat ganti ponsel |
| vi | Kết nối tài khoản | Đổi điện thoại vẫn giữ được ghi chép |
| nl | Account koppelen | Je logs blijven bewaard als je van telefoon wisselt |
| pl | Połącz konto | Zachowaj wpisy po zmianie telefonu |
| sv | Anslut konto | Dina poster följer med när du byter telefon |
| th | เชื่อมต่อบัญชี | เปลี่ยนโทรศัพท์ก็ยังมีบันทึกเหมือนเดิม |
| cs | Připojit účet | Záznamy zůstanou i po výměně telefonu |
| uk | Підключити обліковий запис | Записи збережуться після зміни телефону |

시트 제목은 위 '제목'과 같다. 시트 안 설명 줄은 두지 않는다.

## 연결 해제 확인 창

| 언어 | 제목 | 본문 |
|---|---|---|
| ko | 연결을 해제할까요? | 기록은 이 기기에만 남고 계정은 지워요. 다시 로그인이 필요해요. |
| en | Disconnect your account? | Your records stay only on this device and your account is deleted. You'll need to sign in again. |

다른 언어는 주량체커 저장소 strings.ts·i18n/*.ts의 disconnectBody가 원본이다(차곡·알롱은 그 낱말을 따름). '폰'이 아니라 '기기'로 쓴다(10-20 종인님 — 알롱 계정 불러오기를 '이 기기'로 통일한 뒤 세 앱 모두, 같은 앱의 다른 안내(계정 충돌 등)도 같이): de Gerät, es·it·pt dispositivo, fr appareil, ja デバイス, zh-Hans 设备, zh-Hant 裝置, ru устройство, tr cihaz, id perangkat, vi thiết bị(알롱 cc5d84f 기준). 연결 전 줄의 '폰을 바꿔도'는 기기 변경을 뜻하는 일상 표현이라 그대로 둔다. 연결 전 줄의 nl·pl·sv·th·cs·uk 6개 언어는 주량체커 번역(10-17 추가).
