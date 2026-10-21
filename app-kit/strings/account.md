# 계정 연결 공용 문구(주량체커·차곡·알롱)

세 앱이 글자 그대로 같은 말을 쓴다(전역 CLAUDE.md 9절). 앱에 넣을 땐 이 표를 복사하고, 고칠 땐 이 파일부터 고친 뒤 세 앱에 알린다. 번역 원본은 차곡 1.0.0(10-17, 57efabf) — '기록' 낱말은 주량체커 연결 해제 번역과 같게.

## 연결 전 설정 줄 — 제목 / 보조 줄

| 언어 | 제목 | 보조 줄 |
|---|---|---|
| ko | 계정 연결 | 기기를 바꿔도 기록이 이어져요 |
| en | Connect Account | Keep your records when you change devices |
| ja | アカウント連携 | デバイスを替えても記録が引き継がれます |
| zh-Hans | 连接账号 | 换设备也能保留记录 |
| zh-Hant | 連接帳號 | 換裝置也能保留記錄 |
| es | Conectar cuenta | Conserva tus registros al cambiar de dispositivo |
| pt | Conectar conta | Mantenha seus registros ao trocar de dispositivo |
| de | Konto verbinden | Deine Einträge bleiben beim Geräte­wechsel erhalten |
| fr | Connecter un compte | Gardez vos enregis­trements en changeant d’appareil |
| it | Collega account | Mantieni i registri quando cambi dispositivo |
| ru | Подклю­чить аккаунт | Записи сохранятся при смене устройства |
| tr | Hesap bağla | Cihaz değiştirsen de kayıtların kalır |
| id | Hubungkan akun | Catatan tetap ada saat ganti perangkat |
| vi | Kết nối tài khoản | Đổi thiết bị vẫn giữ được ghi chép |
| nl | Account koppelen | Je logs blijven bewaard als je van apparaat wisselt |
| pl | Połącz konto | Zachowaj wpisy po zmianie urządzenia |
| sv | Anslut konto | Dina poster följer med när du byter enhet |
| th | เชื่อมต่อบัญชี | เปลี่ยนอุปกรณ์ก็ยังมีบันทึกเหมือนเดิม |
| cs | Připojit účet | Záznamy zůstanou i po výměně zařízení |
| uk | Підклю­чити обліковий запис | Записи збережуться після зміни пристрою |

시트 제목은 위 '제목'과 같다. 시트 안 설명 줄은 두지 않는다.

독일어 보조 줄 'Geräte­wechsel', 러시아어 제목 'Подклю­чить', 우크라이나어 제목 'Підклю­чити', 프랑스어 보조 줄 'enregis­trements'(10-21 주량체커 fd17c8e, AX5에서 'Подключи/ть' 등으로 꺾이던 것)에는 소프트 하이픈(U+00AD, 꺾일 때만 '-'가 보임)이 들어 있다 — 가장 큰 글씨에서 'Gerätewechse/l'처럼 단어 중간이 꺾이던 것(10-21 주량체커 49c08ee 등). 눈에 안 보이니 손으로 옮겨 적지 말고 이 파일에서 복사하고, `grep -c $'\u00ad'`로 들어갔는지 확인한다.

중국어 낱말(10-20 코어 — 공용 표·주량체커·차곡이 이미 쓰는 쪽): 로그인 계정은 zh-Hans '账号'·zh-Hant '帳號', 연결은 '连接'·'連接'. '账户/帳戶'는 차곡에서 적금 '계좌' 뜻이라 계정에 쓰지 않고, '連結'도 쓰지 않는다. 같은 화면의 계정 충돌·연결 해제·밀려남 문구도 이 낱말로.

## 연결 해제 확인 창

| 언어 | 제목 | 본문 |
|---|---|---|
| ko | 연결을 해제할까요? | 기록은 이 기기에만 남고 계정은 지워요. 다시 로그인이 필요해요. |
| en | Disconnect your account? | Your records stay only on this device and your account is deleted. You'll need to sign in again. |

다른 언어는 주량체커 저장소 strings.ts·i18n/*.ts의 disconnectBody가 원본이다(차곡·알롱은 그 낱말을 따름). '폰'이 아니라 '기기'로 쓴다(10-20 종인님 — 알롱 계정 불러오기를 '이 기기'로 통일한 뒤 세 앱 모두, 같은 앱의 다른 안내(계정 충돌 등)도 같이): de Gerät, es·it·pt dispositivo, fr appareil, ja デバイス, zh-Hans 设备, zh-Hant 裝置, ru устройство, tr cihaz, id perangkat, vi thiết bị(알롱 cc5d84f 기준). 연결 전 줄도 '기기를 바꿔도'로 맞췄다(같은 날 종인님 "폰이 아닌 태블릿 등에서도 동작할 수 있으니 기기로 맞추는거야" — 앱 화면 문구는 '폰' 대신 '기기'). 스토어 설명의 '폰을 바꿔도'는 마케팅 문구라 이 표 밖(각 앱 출시 정보 확인 때 따로). 연결 전 줄의 nl·pl·sv·th·cs·uk 6개 언어는 주량체커 번역(10-17 추가).
