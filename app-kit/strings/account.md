# 계정 공용 문구 — 두 유형(전역 CLAUDE.md 9절)

계정이 있는 앱은 아래 두 유형 중 앱에 맞는 것을 글자 그대로 쓴다(10-21 종인님 — 알롱이 계정 삭제로 가며 두 갈래로 나눔).
- **① 기록 연결**(주량체커·차곡): 계정은 기록을 백업하고 옮기는 수단, 기록의 주인은 기기. 메뉴 '연결 / 연결 해제' — 해제하면 기록은 이 기기에만 남고 서버 사본과 계정을 지운다.
- **② 계정 생성**(알롱): 계정이 서버에 남는 정체성(순위·알롱 번호, 출시 뒤 친구·크루·거래소), 게스트도 처음부터 서버에 저장. 메뉴는 '계정 삭제' 하나(연결 해제·데이터 초기화를 합침, 게스트·연결 계정 모두) — 서버는 14일 유예 뒤 영구 삭제, 이 기기는 바로 새 알로. 연결 계정만 14일 안에 다시 로그인하면 되돌릴 수 있고 게스트는 되돌릴 수 없다. 애플·구글 연결은 누르는 순간 끊는다.

'연결 전 설정 줄'은 두 유형 공통(게스트가 애플·구글을 연결하는 줄). 앱에 넣을 땐 이 표를 복사하고, 고칠 땐 이 파일부터 고친 뒤 세 앱에 알린다. 번역 원본은 차곡 1.0.0(10-17, 57efabf) — '기록' 낱말은 주량체커 연결 해제 번역과 같게.

## 공통 — 연결 전 설정 줄 — 제목 / 보조 줄

| 언어 | 제목 | 보조 줄 |
|---|---|---|
| ko | 계정 연결 | 기기를 바꿔도 기록이 이어져요 |
| en | Connect Account | Keep your records when you change devices |
| ja | アカウント連携 | デバイスを替えても記録が引き継がれます |
| zh-Hans | 连接账号 | 换设备也能保留记录 |
| zh-Hant | 連接帳號 | 換裝置也能保留紀錄 |
| es | Conectar cuenta | Conserva tus registros al cambiar de dispositivo |
| pt | Conectar conta | Mantenha seus registros ao trocar de dispositivo |
| de | Konto verbinden | Deine Einträge bleiben beim Geräte­wechsel erhalten |
| fr | Connecter un compte | Gardez vos enregis­trements en changeant d’appareil |
| it | Collega account | Mantieni i dati quando cambi dispositivo |
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

## ① 기록 연결 — 연결 해제 확인 창

| 언어 | 제목 | 본문 |
|---|---|---|
| ko | 연결을 해제할까요? | 기록은 이 기기에만 남고 계정은 지워요. 다시 로그인이 필요해요. |
| en | Disconnect your account? | Your records stay only on this device and your account is deleted. You'll need to sign in again. |

다른 언어는 주량체커 저장소 strings.ts·i18n/*.ts의 disconnectBody가 원본이다(차곡·알롱은 그 낱말을 따름). '폰'이 아니라 '기기'로 쓴다(10-20 종인님 — 알롱 계정 불러오기를 '이 기기'로 통일한 뒤 세 앱 모두, 같은 앱의 다른 안내(계정 충돌 등)도 같이): de Gerät, es·it·pt dispositivo, fr appareil, ja デバイス, zh-Hans 设备, zh-Hant 裝置, ru устройство, tr cihaz, id perangkat, vi thiết bị(알롱 cc5d84f 기준). 연결 전 줄도 '기기를 바꿔도'로 맞췄다(같은 날 종인님 "폰이 아닌 태블릿 등에서도 동작할 수 있으니 기기로 맞추는거야" — 앱 화면 문구는 '폰' 대신 '기기'). 스토어 설명의 '폰을 바꿔도'는 마케팅 문구라 이 표 밖(각 앱 출시 정보 확인 때 따로). 연결 전 줄의 nl·pl·sv·th·cs·uk 6개 언어는 주량체커 번역(10-17 추가).

낱말 기준(10-21 종인님 "언어는 보편적인거로, 너가 조사해"): 번체 '기록'(명사)은 紀錄 — 대만 법률 통일 용자(명사 紀錄·동사 記錄) — 연결 해제 본문 '紀錄只會留在此裝置…'도 같음(주량체커 원본 zhHant.ts 함께 고침). 이탈리아어 보조 줄은 'dati' — 기기 바꿀 때 '데이터 옮기기'(trasferire i dati)가 일반 표현, 'registri'는 장부 느낌. 독일어 '계정'은 Konto 유지 — 표준어이고 구글·주량체커·차곡이 Konto(애플만 Account).

## ② 계정 생성 — 계정 삭제(알롱)

원본은 알롱 저장소 `impl/app/src/lib/strings/settings.ts`·`notify.ts`·`i18n/*.ts`(14개 언어, 10-21 계정 삭제 구현), 결정·흐름은 `prd/settings/account-deletion.md`. 아래 표는 그 원본에서 뽑은 것 — 고칠 땐 알롱 원본과 이 파일을 함께 고친다. `${d}`는 삭제 예정일(언어별 날짜 꼴), `${p}`는 Apple·Google.

- 설정 맨 아래 빨간 한 줄 `delRow` → 확인 창 `delTitle` / 연결 계정 `delBodyLinked`·게스트 `delBodyGuest` / [취소] [`delRow`(빨강)]
- 요청 뒤 `delDoneTitle` / `delDoneBody`, 실패 `failDel` / `tryLater`, 예정일 로컬 알림(알림 허용 때만) `acctDeleted`
- 유예 중 같은 계정으로 다시 연결: `restoreTitle` / `restoreBody` / [`restoreYes`] [`restoreNow`(빨강)] [닫기]
- 다른 기기에 남은 로그인이 밀려날 때: `kickedTitle` / `kickedDeletedBody`

#### delRow

| 언어 | 문구 |
|---|---|
| ko | 계정 삭제 |
| en | Delete Account |
| de | Konto löschen |
| es | Eliminar cuenta |
| fr | Supprimer le compte |
| id | Hapus Akun |
| it | Elimina account |
| ja | アカウントを削除 |
| pt | Excluir conta |
| ru | Удалить аккаунт |
| tr | Hesabı sil |
| vi | Xóa tài khoản |
| zhHans | 删除账号 |
| zhHant | 刪除帳號 |

#### delTitle

| 언어 | 문구 |
|---|---|
| ko | 계정을 삭제할까요? |
| en | Delete Account? |
| de | Konto löschen? |
| es | ¿Eliminar la cuenta? |
| fr | Supprimer le compte ? |
| id | Hapus akun? |
| it | Eliminare l’account? |
| ja | アカウントを削除しますか？ |
| pt | Excluir a conta? |
| ru | Удалить аккаунт? |
| tr | Hesap silinsin mi? |
| vi | Xóa tài khoản? |
| zhHans | 要删除账号吗？ |
| zhHant | 要刪除帳號嗎？ |

#### delBodyLinked

| 언어 | 문구 |
|---|---|
| ko | 알롱과 기록이 14일 뒤(${d}) 완전히 지워져요. 그 전에 같은 ${p} 계정으로 로그인하면 되돌릴 수 있어요. 이 기기의 알롱은 바로 지워져요. |
| en | Your Allong and records will be permanently deleted in 14 days (${d}). Sign in with the same ${p} account before then to undo this. The Allong on this device is erased right away. |
| de | Dein Allong und deine Einträge werden in 14 Tagen (${d}) endgültig gelöscht. Melde dich vorher mit demselben ${p}-Konto an, um das rückgängig zu machen. Das Allong auf diesem Gerät wird sofort gelöscht. |
| es | Tu Allong y tus registros se eliminarán definitivamente en 14 días (${d}). Antes de eso, inicia sesión con la misma cuenta de ${p} para deshacerlo. El Allong de este dispositivo se elimina al instante. |
| fr | Votre Allong et vos données seront définitivement supprimés dans 14 jours (${d}). Connectez-vous avant avec le même compte ${p} pour annuler. L’Allong de cet appareil est supprimé immédiatement. |
| id | Allong dan catatanmu akan dihapus permanen dalam 14 hari (${d}). Masuk dengan akun ${p} yang sama sebelum itu untuk membatalkan. Allong di perangkat ini langsung dihapus. |
| it | Il tuo Allong e i tuoi dati verranno eliminati definitivamente tra 14 giorni (${d}). Prima di allora, accedi con lo stesso account ${p} per annullare. L’Allong su questo dispositivo viene eliminato subito. |
| ja | Allongと記録は14日後（${d}）に完全に削除されます。それまでに同じ${p}アカウントでサインインすると取り消せます。このデバイスのAllongはすぐに削除されます。 |
| pt | Seu Allong e seus registros serão excluídos permanentemente em 14 dias (${d}). Antes disso, entre com a mesma conta ${p} para desfazer. O Allong deste dispositivo é excluído na hora. |
| ru | Ваш Allong и записи будут безвозвратно удалены через 14 дней (${d}). Чтобы отменить, войдите до этого в тот же аккаунт ${p}. Allong на этом устройстве удаляется сразу. |
| tr | Allong’un ve kayıtların 14 gün sonra (${d}) kalıcı olarak silinir. Geri almak için o zamana kadar aynı ${p} hesabıyla giriş yap. Bu cihazdaki Allong hemen silinir. |
| vi | Allong và ghi chép của bạn sẽ bị xóa vĩnh viễn sau 14 ngày (${d}). Hãy đăng nhập lại bằng cùng tài khoản ${p} trước đó để hoàn tác. Allong trên thiết bị này bị xóa ngay. |
| zhHans | 你的 Allong 和记录将在 14 天后（${d}）被永久删除。在此之前用同一个 ${p} 账号登录即可撤销。这台设备上的 Allong 会立即删除。 |
| zhHant | 你的 Allong 與紀錄將在 14 天後（${d}）永久刪除。在此之前用同一個 ${p} 帳號登入即可復原。此裝置上的 Allong 會立即刪除。 |

#### delBodyGuest

| 언어 | 문구 |
|---|---|
| ko | 알롱과 기록이 14일 뒤(${d}) 완전히 지워져요. 이 기기의 알롱은 바로 지워져요. 되돌릴 수 없어요. |
| en | Your Allong and records will be permanently deleted in 14 days (${d}). The Allong on this device is erased right away. This can't be undone. |
| de | Dein Allong und deine Einträge werden in 14 Tagen (${d}) endgültig gelöscht. Das Allong auf diesem Gerät wird sofort gelöscht. Das lässt sich nicht rückgängig machen. |
| es | Tu Allong y tus registros se eliminarán definitivamente en 14 días (${d}). El Allong de este dispositivo se elimina al instante. No se puede deshacer. |
| fr | Votre Allong et vos données seront définitivement supprimés dans 14 jours (${d}). L’Allong de cet appareil est supprimé immédiatement. Cette action est irréversible. |
| id | Allong dan catatanmu akan dihapus permanen dalam 14 hari (${d}). Allong di perangkat ini langsung dihapus. Tindakan ini tidak bisa dibatalkan. |
| it | Il tuo Allong e i tuoi dati verranno eliminati definitivamente tra 14 giorni (${d}). L’Allong su questo dispositivo viene eliminato subito. L’operazione non si può annullare. |
| ja | Allongと記録は14日後（${d}）に完全に削除されます。このデバイスのAllongはすぐに削除されます。元に戻せません。 |
| pt | Seu Allong e seus registros serão excluídos permanentemente em 14 dias (${d}). O Allong deste dispositivo é excluído na hora. Isso não pode ser desfeito. |
| ru | Ваш Allong и записи будут безвозвратно удалены через 14 дней (${d}). Allong на этом устройстве удаляется сразу. Это нельзя отменить. |
| tr | Allong’un ve kayıtların 14 gün sonra (${d}) kalıcı olarak silinir. Bu cihazdaki Allong hemen silinir. Bu işlem geri alınamaz. |
| vi | Allong và ghi chép của bạn sẽ bị xóa vĩnh viễn sau 14 ngày (${d}). Allong trên thiết bị này bị xóa ngay. Không thể hoàn tác. |
| zhHans | 你的 Allong 和记录将在 14 天后（${d}）被永久删除。这台设备上的 Allong 会立即删除。此操作无法撤销。 |
| zhHant | 你的 Allong 與紀錄將在 14 天後（${d}）永久刪除。此裝置上的 Allong 會立即刪除。此操作無法還原。 |

#### delDoneTitle

| 언어 | 문구 |
|---|---|
| ko | 삭제를 요청했어요 |
| en | Deletion Requested |
| de | Löschung angefordert |
| es | Eliminación solicitada |
| fr | Suppression demandée |
| id | Penghapusan diminta |
| it | Eliminazione richiesta |
| ja | 削除をリクエストしました |
| pt | Exclusão solicitada |
| ru | Удаление запрошено |
| tr | Silme istendi |
| vi | Đã yêu cầu xóa |
| zhHans | 已申请删除 |
| zhHant | 已申請刪除 |

#### delDoneBody

| 언어 | 문구 |
|---|---|
| ko | ${d}에 완전히 지워져요. |
| en | Everything will be permanently deleted on ${d}. |
| de | Alles wird am ${d} endgültig gelöscht. |
| es | Todo se eliminará definitivamente el ${d}. |
| fr | Tout sera définitivement supprimé le ${d}. |
| id | Semuanya akan dihapus permanen pada ${d}. |
| it | Tutto verrà eliminato definitivamente il ${d}. |
| ja | ${d}にすべて完全に削除されます。 |
| pt | Tudo será excluído permanentemente em ${d}. |
| ru | Всё будет безвозвратно удалено ${d}. |
| tr | Her şey ${d} tarihinde kalıcı olarak silinecek. |
| vi | Mọi thứ sẽ bị xóa vĩnh viễn vào ${d}. |
| zhHans | 所有内容将于 ${d} 被永久删除。 |
| zhHant | 所有內容將於 ${d} 永久刪除。 |

#### failDel

| 언어 | 문구 |
|---|---|
| ko | 삭제하지 못했어요 |
| en | Couldn't Delete Account |
| de | Konto konnte nicht gelöscht werden |
| es | No se pudo eliminar la cuenta |
| fr | Impossible de supprimer le compte |
| id | Tidak bisa menghapus akun |
| it | Impossibile eliminare l’account |
| ja | アカウントを削除できませんでした |
| pt | Não foi possível excluir a conta |
| ru | Не удалось удалить аккаунт |
| tr | Hesap silinemedi |
| vi | Không thể xóa tài khoản |
| zhHans | 无法删除账号 |
| zhHant | 無法刪除帳號 |

#### tryLater

| 언어 | 문구 |
|---|---|
| ko | 잠시 뒤 다시 해 주세요. |
| en | Please try again in a moment. |
| de | Bitte versuche es gleich noch einmal. |
| es | Inténtalo de nuevo en un momento. |
| fr | Veuillez réessayer dans un instant. |
| id | Coba lagi nanti. |
| it | Riprova tra un momento. |
| ja | しばらくしてからもう一度お試しください。 |
| pt | Tente novamente em instantes. |
| ru | Повторите попытку чуть позже. |
| tr | Lütfen biraz sonra tekrar dene. |
| vi | Vui lòng thử lại sau giây lát. |
| zhHans | 请稍后再试。 |
| zhHant | 請稍後再試。 |

#### restoreTitle

| 언어 | 문구 |
|---|---|
| ko | 삭제를 취소할까요? |
| en | Cancel Deletion? |
| de | Löschung abbrechen? |
| es | ¿Cancelar la eliminación? |
| fr | Annuler la suppression ? |
| id | Batalkan penghapusan? |
| it | Annullare l’eliminazione? |
| ja | 削除を取り消しますか？ |
| pt | Cancelar a exclusão? |
| ru | Отменить удаление? |
| tr | Silme iptal edilsin mi? |
| vi | Hủy việc xóa? |
| zhHans | 要取消删除吗？ |
| zhHant | 要取消刪除嗎？ |

#### restoreBody

| 언어 | 문구 |
|---|---|
| ko | ${d}에 지워질 예정이에요. |
| en | Scheduled to be deleted on ${d}. |
| de | Wird am ${d} gelöscht. |
| es | Se eliminará el ${d}. |
| fr | Suppression prévue le ${d}. |
| id | Dijadwalkan dihapus pada ${d}. |
| it | Eliminazione prevista il ${d}. |
| ja | ${d}に削除される予定です。 |
| pt | Exclusão prevista para ${d}. |
| ru | Удаление запланировано на ${d}. |
| tr | ${d} tarihinde silinecek. |
| vi | Dự kiến xóa vào ${d}. |
| zhHans | 预定于 ${d} 删除。 |
| zhHant | 預定於 ${d} 刪除。 |

#### restoreYes

| 언어 | 문구 |
|---|---|
| ko | 삭제 취소하고 불러오기 |
| en | Cancel Deletion and Load |
| de | Löschung abbrechen und laden |
| es | Cancelar eliminación y cargar |
| fr | Annuler la suppression et charger |
| id | Batalkan penghapusan dan muat |
| it | Annulla eliminazione e carica |
| ja | 削除を取り消して読み込む |
| pt | Cancelar exclusão e carregar |
| ru | Отменить удаление и загрузить |
| tr | Silmeyi iptal et ve yükle |
| vi | Hủy xóa và tải về |
| zhHans | 取消删除并载入 |
| zhHant | 取消刪除並載入 |

#### restoreNow

| 언어 | 문구 |
|---|---|
| ko | 지금 바로 삭제 |
| en | Delete Now |
| de | Jetzt löschen |
| es | Eliminar ahora |
| fr | Supprimer maintenant |
| id | Hapus sekarang |
| it | Elimina ora |
| ja | 今すぐ削除 |
| pt | Excluir agora |
| ru | Удалить сейчас |
| tr | Şimdi sil |
| vi | Xóa ngay |
| zhHans | 立即删除 |
| zhHant | 立即刪除 |

#### kickedTitle

| 언어 | 문구 |
|---|---|
| ko | 연결이 해제됐어요 |
| en | Disconnected |
| de | Getrennt |
| es | Desconectado |
| fr | Déconnecté |
| id | Terputus |
| it | Disconnesso |
| ja | 連携が解除されました |
| pt | Desconectado |
| ru | Отключено |
| tr | Bağlantı kesildi |
| vi | Đã ngắt kết nối |
| zhHans | 已解除连接 |
| zhHant | 已解除連接 |

#### kickedDeletedBody

| 언어 | 문구 |
|---|---|
| ko | 다른 기기에서 이 계정의 삭제를 요청해 이 기기의 기록은 지워져요. |
| en | Deletion of this account was requested on another device, so this device’s records will be erased. |
| de | Auf einem anderen Gerät wurde die Löschung dieses Kontos angefordert, daher werden die Einträge auf diesem Gerät gelöscht. |
| es | Se solicitó eliminar esta cuenta desde otro dispositivo, así que se borrarán los registros de este. |
| fr | La suppression de ce compte a été demandée sur un autre appareil ; les données de cet appareil vont être effacées. |
| id | Penghapusan akun ini diminta dari perangkat lain, jadi catatan di perangkat ini akan dihapus. |
| it | L’eliminazione di questo account è stata richiesta da un altro dispositivo, quindi i dati su questo dispositivo verranno cancellati. |
| ja | 別のデバイスでこのアカウントの削除がリクエストされたため、このデバイスの記録は消去されます。 |
| pt | A exclusão desta conta foi solicitada em outro dispositivo, então os registros deste dispositivo serão apagados. |
| ru | Удаление этого аккаунта запрошено на другом устройстве, поэтому записи на этом устройстве будут стёрты. |
| tr | Bu hesabın silinmesi başka bir cihazda istendi, bu yüzden bu cihazdaki kayıtlar silinecek. |
| vi | Việc xóa tài khoản này được yêu cầu trên thiết bị khác, nên ghi chép trên thiết bị này sẽ bị xóa. |
| zhHans | 已在另一台设备上申请删除此账号，因此这台设备上的记录将被清除。 |
| zhHant | 已在另一台裝置上申請刪除此帳號，因此此裝置上的紀錄將被清除。 |

#### acctDeleted

| 언어 | 문구 |
|---|---|
| ko | 계정이 삭제됐어요 |
| en | Your account was deleted |
| de | Dein Konto wurde gelöscht |
| es | Tu cuenta se eliminó |
| fr | Votre compte a été supprimé |
| id | Akunmu telah dihapus |
| it | Il tuo account è stato eliminato |
| ja | アカウントが削除されました |
| pt | Sua conta foi excluída |
| ru | Ваш аккаунт удалён |
| tr | Hesabın silindi |
| vi | Tài khoản của bạn đã bị xóa |
| zhHans | 你的账号已删除 |
| zhHant | 你的帳號已刪除 |
