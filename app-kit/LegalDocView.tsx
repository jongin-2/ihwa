// ⚠️ 공용 원본 — ihwa-site/app-kit/LegalDocView.tsx. 앱 저장소에는 이 파일을 글자 그대로 복사해 둔다(고치려면 원본을 고치고 세 앱에 다시 복사).
// 각 앱의 빌드 점검(check-docs-sync)이 원본과 같은지 본다. 2026-10-12 종인님 "약관 같은 건 모든 앱 화면도 동일하게 구성하고 잘 관리하면 될 것 같은데
// 주량체커 같은 거랑 왜 자꾸 달라지지" — 앱마다 따로 짠 사본(주량체커·응원석 가운데 제목, 차곡 큰 제목 + 원 ✕)이 고칠 때마다 벌어졌다.
//
// 이용약관·개인정보처리방침을 공용 사이트(jongin-2/ihwa) 페이지 그대로, 주소가 보이지 않는 앱 안 웹뷰로 보여 주는 화면 전체(머리글 포함).
// 앱은 이 화면을 모달 시트로 띄우되 화면 옵션에 headerShown: true를 처음부터 두고(모달에서 머리글을 나중에 켜면 화면이 다시 만들어져
// 머리글이 안 나온다 — 10-17 응원석 시험), navigation을 넘긴다. 이 부품은 setOptions로 제목과 왼쪽 단추만 채운다(직접 그리지 않음).
//  · 머리글: iOS 기본 머리글(native-stack — 앱이 react-navigation이든 expo-router든 같은 options를 받는다)에 가운데 문서 이름,
//    왼쪽 끝 ✕(닫기). 본문 링크로 다른 문서로 넘어가면 그 자리가 ‹(이전 문서)로 바뀌고, 닫기는 시트를 아래로 쓸어 내린다.
//    애플 HIG Sheets "한 화면짜리 시트의 Cancel(Close)은 위쪽 툴바 왼쪽 끝, 다음 단계에서는 Back이 Cancel을 대신".
//    버튼은 네이티브 바 버튼(unstable_headerLeftItems, SF Symbol)이라 iOS 26 Liquid Glass가 저절로 붙는다.
//    10-17 종인님 코어 시안 검토판 A안 선택(예전엔 직접 그린 회색 원 ✕를 오른쪽에 두었다 — 10-12 판).
//  · 본문: 페이지 큰 제목(h1)은 머리글과 겹쳐 숨기고, 바탕은 시트와 한 판(투명), 글자는 iOS 본문 글꼴(다이내믹 타입).
//    페이지 맨 위 버전 고르기(현재·이전 판 날짜 드롭다운)는 사이트가 그린다.
//  · 링크: 같은 사이트(약관 ↔ 방침, 이전 판)는 시트 안, 메일·다른 사이트는 기기 앱(메일 앱이 없으면 주소 복사).
//  · 오프라인·오류: 안내 한 줄 + 다시 시도.
// 앱마다 다른 값은 tint(강조색: 다시 시도) 하나뿐. 앱은 모달 화면 옵션에 headerShown: true를 두고 navigation(setOptions가 있는 것)을 넘긴다. 언어는 앱 언어 코드(없으면 영어). 페이지는 한국어·영어 두 가지(한국어 밖은 영어).
// 머리글 색은 내비게이션 테마를 따른다 — NavigationContainer(expo-router는 ThemeProvider)에 다크·라이트 테마를 꼭 넘긴다(10-26 한배: 안 넘겨 다크 모드에서 머리글이 흰색).
// 필요한 라이브러리: react-native-webview, expo-clipboard.
import { useEffect, useLayoutEffect, useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Linking, PlatformColor, Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { appDialog } from './AppDialog'; // 공용 원본 — 함께 복사(10-27 앱 확인 창)
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';

export const LEGAL_SITE = 'https://jongin-2.github.io/ihwa';
export type LegalDoc = 'terms' | 'privacy';
export const legalUrl = (doc: LegalDoc, lang: string) => `${LEGAL_SITE}/${doc}/${lang === 'ko' ? 'ko' : 'en'}/`;

const PAGE_STYLE = `(function(){var s=document.createElement('style');s.textContent='html{font:-apple-system-body}body{font-size:1rem!important;line-height:1.7}html,body{background:transparent!important}h1{display:none}main{padding-top:8px}';document.documentElement.appendChild(s);})();true;`;

type Words = { terms: string; privacy: string; close: string; offline: string; retry: string; back: string; emailCopied: string };
// 주량체커 20개 언어 번역(2026-10-12 기준)에서 옮김
const WORDS: Record<string, Words> = {
  'ko': {"terms": "이용약관", "privacy": "개인정보처리방침", "close": "닫기", "offline": "인터넷에 연결되면 볼 수 있어요", "retry": "다시 시도", "back": "이전 문서", "emailCopied": "이메일 주소를 복사했어요"},
  'en': {"terms": "Terms of Service", "privacy": "Privacy Policy", "close": "Close", "offline": "Available when you’re online", "retry": "Try Again", "back": "Previous page", "emailCopied": "Email address copied"},
  'ja': {"offline": "インターネットに接続すると表示されます", "retry": "再試行", "back": "前のページ", "emailCopied": "メールアドレスをコピーしました", "terms": "利用規約", "privacy": "プライバシーポリシー", "close": "閉じる"},
  'zh-Hant': {"offline": "連上網路即可查看", "retry": "重試", "back": "上一頁", "emailCopied": "已複製電子郵件地址", "terms": "服務條款", "privacy": "隱私權政策", "close": "關閉"},
  'zh-Hans': {"offline": "联网后即可查看", "retry": "重试", "back": "上一页", "emailCopied": "已复制电子邮件地址", "terms": "服务条款", "privacy": "隐私政策", "close": "关闭"},
  'es': {"offline": "Disponible cuando tengas conexión a internet", "retry": "Reintentar", "back": "Página anterior", "emailCopied": "Dirección de correo copiada", "terms": "Términos del servicio", "privacy": "Política de privacidad", "close": "Cerrar"},
  'pt': {"offline": "Disponível quando você estiver online", "retry": "Tentar novamente", "back": "Página anterior", "emailCopied": "Endereço de e-mail copiado", "terms": "Termos de uso", "privacy": "Política de privacidade", "close": "Fechar"},
  'de': {"offline": "Verfügbar, sobald du online bist", "retry": "Erneut versuchen", "back": "Vorherige Seite", "emailCopied": "E-Mail-Adresse kopiert", "terms": "Nutzungsbedingungen", "privacy": "Datenschutzerklärung", "close": "Schließen"},
  'fr': {"offline": "Disponible lorsque vous êtes en ligne", "retry": "Réessayer", "back": "Page précédente", "emailCopied": "Adresse e-mail copiée", "terms": "Conditions d'utilisation", "privacy": "Politique de confidentialité", "close": "Fermer"},
  'it': {"offline": "Disponibile quando sei online", "retry": "Riprova", "back": "Pagina precedente", "emailCopied": "Indirizzo email copiato", "terms": "Termini di servizio", "privacy": "Informativa sulla privacy", "close": "Chiudi"},
  'ru': {"offline": "Доступно при подключении к интернету", "retry": "Повторить", "back": "Предыдущая страница", "emailCopied": "Адрес эл. почты скопирован", "terms": "Условия использования", "privacy": "Политика конфиденциальности", "close": "Закрыть"},
  'tr': {"offline": "İnternete bağlandığında görüntülenebilir", "retry": "Tekrar dene", "back": "Önceki sayfa", "emailCopied": "E-posta adresi kopyalandı", "terms": "Kullanım Şartları", "privacy": "Gizlilik Politikası", "close": "Kapat"},
  'id': {"offline": "Tersedia saat Anda online", "retry": "Coba lagi", "back": "Halaman sebelumnya", "emailCopied": "Alamat email disalin", "terms": "Ketentuan Layanan", "privacy": "Kebijakan Privasi", "close": "Tutup"},
  'vi': {"offline": "Xem được khi có kết nối mạng", "retry": "Thử lại", "back": "Trang trước", "emailCopied": "Đã sao chép địa chỉ email", "terms": "Điều khoản dịch vụ", "privacy": "Chính sách quyền riêng tư", "close": "Đóng"},
  'nl': {"offline": "Beschikbaar zodra je online bent", "retry": "Probeer opnieuw", "back": "Vorige pagina", "emailCopied": "E-mailadres gekopieerd", "terms": "Gebruiksvoorwaarden", "privacy": "Privacybeleid", "close": "Sluit"},
  'pl': {"offline": "Dostępne po połączeniu z internetem", "retry": "Spróbuj ponownie", "back": "Poprzednia strona", "emailCopied": "Skopiowano adres e-mail", "terms": "Warunki korzystania", "privacy": "Polityka prywatności", "close": "Zamknij"},
  'sv': {"offline": "Finns när du är online", "retry": "Försök igen", "back": "Föregående sida", "emailCopied": "E-postadressen kopierades", "terms": "Användarvillkor", "privacy": "Integritetspolicy", "close": "Stäng"},
  'th': {"offline": "ดูได้เมื่อออนไลน์", "retry": "ลองอีกครั้ง", "back": "หน้าก่อนหน้า", "emailCopied": "คัดลอกอีเมลแล้ว", "terms": "ข้อกำหนดการใช้งาน", "privacy": "นโยบายความเป็นส่วนตัว", "close": "ปิด"},
  'cs': {"offline": "Dostupné po připojení k internetu", "retry": "Zkusit znovu", "back": "Předchozí stránka", "emailCopied": "E-mailová adresa zkopírována", "terms": "Podmínky použití", "privacy": "Zásady ochrany osobních údajů", "close": "Zavřít"},
  'uk': {"offline": "Доступно за наявності інтернету", "retry": "Спробувати ще раз", "back": "Попередня сторінка", "emailCopied": "Адресу електронної пошти скопійовано", "terms": "Умови використання", "privacy": "Політика конфіденційності", "close": "Закрити"},
};

// react-navigation·expo-router 어느 쪽 navigation이든 setOptions만 쓴다
type HeaderNav = { setOptions: (options: object) => void };

export default function LegalDocView({ doc, lang, tint, onClose, navigation }: { doc: LegalDoc; lang: string; tint: ColorValue; onClose: () => void; navigation: HeaderNav }) {
  const w = WORDS[lang] ?? WORDS.en;
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  // 본문 링크로 다른 문서로 넘어가면 머리글도 그 문서 이름 — 페이지 <title>은 탐색 이벤트에 빈 값·이전 제목이 섞여 와 주소 경로로 판단
  const [shown, setShown] = useState<LegalDoc>(doc);
  const [canGoBack, setCanGoBack] = useState(false);
  const web = useRef<ComponentRef<typeof WebView>>(null); // RN 0.88·webview 14 타입은 클래스 인스턴스로 못 씀(10-30 차곡 SDK 58)
  useLayoutEffect(() => {
    navigation.setOptions({
      title: w[shown],
      headerBackVisible: false,
      unstable_headerLeftItems: () => [
        canGoBack
          ? { type: 'button', label: w.back, icon: { type: 'sfSymbol', name: 'chevron.backward' }, onPress: () => web.current?.goBack() }
          : { type: 'button', label: w.close, icon: { type: 'sfSymbol', name: 'xmark' }, onPress: onClose },
      ],
    });
  }, [navigation, shown, canGoBack, w, onClose]);
  return (
    <View style={styles.container}>
      {failed ? (
        <View style={styles.center}>
          <Text style={styles.msg} maxFontSizeMultiplier={1.5}>{w.offline}</Text>
          <Pressable onPress={() => { setFailed(false); setLoading(true); setAttempt((a) => a + 1); }} style={styles.btn} accessibilityRole="button">
            {({ pressed }) => <Text style={[styles.retry, { color: tint }, pressed && styles.pressed]} maxFontSizeMultiplier={1.3}>{w.retry}</Text>}
          </Pressable>
        </View>
      ) : (
        <WebView
          key={attempt}
          ref={web}
          source={{ uri: legalUrl(doc, lang) }}
          style={styles.web}
          injectedJavaScriptBeforeContentLoaded={PAGE_STYLE}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(s) => {
            const m = s.url.match(/\/ihwa\/(terms|privacy)\//);
            if (m) setShown(m[1] as LegalDoc);
            setCanGoBack(s.canGoBack);
          }}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
          // 모든 링크를 아래 판단으로 — 기본값(http·https만)이면 메일 링크를 라이브러리가 먼저 가로채 실패해도 조용하다(주량체커 09-28 확인)
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url === LEGAL_SITE || req.url.startsWith(LEGAL_SITE + '/') || req.url === 'about:blank') return true; // '/'까지 봐야 ihwa-다른저장소가 안 열림(10-16 차곡 보안 점검)
            Linking.openURL(req.url).catch(() => {
              if (req.url.startsWith('mailto:')) {
                const email = decodeURIComponent(req.url.slice('mailto:'.length).split('?')[0]);
                Clipboard.setStringAsync(email).then(() => appDialog({ title: email, msg: w.emailCopied, buttons: [{ text: w.close, kind: 'cancel' }] })).catch(() => undefined);
              }
            });
            return false;
          }}
          allowsLinkPreview={false}
          dataDetectorTypes="none"
        />
      )}
      {!failed && <DelayedSpinner visible={loading} />}
    </View>
  );
}

// 대기 표시(10-22 종인님 "버퍼링이 걸리는 진입 화면은 로딩 스피너를 넣든가 해서 자연스럽게", 알롱 lib/loadingGate.ts와 같은 값):
// 0.3초 안에 끝나는 짧은 대기엔 아무것도 띄우지 않고(깜빡임 방지), 넘으면 띄우며, 한 번 뜨면 0.4초는 유지한다.
// 숫자는 애플이 정한 값이 아니라 관례(HIG는 '조금 넘게 걸리면 진행 표시'까지만 말함).
const SHOW_AFTER_MS = 300;
const MIN_SHOW_MS = 400;
function DelayedSpinner({ visible }: { visible: boolean }) {
  const [on, setOn] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    if (visible) {
      if (on) return;
      const t = setTimeout(() => { shownAt.current = Date.now(); setOn(true); }, SHOW_AFTER_MS);
      return () => clearTimeout(t);
    }
    if (!on) return;
    const t = setTimeout(() => setOn(false), Math.max(0, shownAt.current + MIN_SHOW_MS - Date.now()));
    return () => clearTimeout(t);
  }, [visible, on]);
  return on ? <ActivityIndicator style={StyleSheet.absoluteFill} pointerEvents="none" color={PlatformColor('secondaryLabel')} /> : null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PlatformColor('systemBackground') },
  btn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 }, // 앱들의 Tap(PRESSED_OPACITY 0.6)과 같게 — 2026-10-14 차곡 빌드 11 회귀 DSN-02
  web: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  msg: { fontSize: 17, color: PlatformColor('secondaryLabel'), textAlign: 'center' },
  retry: { fontSize: 17, fontWeight: '600' },
});
