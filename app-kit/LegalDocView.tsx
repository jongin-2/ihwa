// ⚠️ 공용 원본 — ihwa-site/app-kit/LegalDocView.tsx. 앱 저장소에는 이 파일을 글자 그대로 복사해 둔다(고치려면 원본을 고치고 세 앱에 다시 복사).
// 각 앱의 빌드 점검(check-docs-sync)이 원본과 같은지 본다. 2026-10-12 종인님 "약관 같은 건 모든 앱 화면도 동일하게 구성하고 잘 관리하면 될 것 같은데
// 주량체커 같은 거랑 왜 자꾸 달라지지" — 앱마다 따로 짠 사본(주량체커·응원석 가운데 제목, 차곡 큰 제목 + 원 ✕)이 고칠 때마다 벌어졌다.
//
// 이용약관·개인정보처리방침을 공용 사이트(jongin-2/ihwa) 페이지 그대로, 주소가 보이지 않는 앱 안 웹뷰로 보여 주는 화면 전체(머리글 포함).
// 이동 방식(react-navigation·expo-router)과 무관하게 같은 모양이 되도록 머리글을 직접 그린다 — 앱은 이 화면을 모달 시트로 띄우고 네이티브 머리글은 숨긴다.
//  · 머리글: 가운데 문서 이름(17pt 굵게), 오른쪽 ✕(닫기), 본문 링크로 넘어간 문서에서만 왼쪽 ‹(이전 문서). 누르는 칸 44pt.
//  · 본문: 페이지 큰 제목(h1)은 머리글과 겹쳐 숨기고, 바탕은 시트와 한 판(투명), 글자는 iOS 본문 글꼴(다이내믹 타입).
//    페이지 맨 위 버전 고르기(현재·이전 판 날짜 드롭다운)는 사이트가 그린다.
//  · 링크: 같은 사이트(약관 ↔ 방침, 이전 판)는 시트 안, 메일·다른 사이트는 기기 앱(메일 앱이 없으면 주소 복사).
//  · 오프라인·오류: 안내 한 줄 + 다시 시도.
// 앱마다 다른 값은 tint(강조색: ‹·다시 시도) 하나뿐. 언어는 앱 언어 코드(없으면 영어). 페이지는 한국어·영어 두 가지(한국어 밖은 영어).
// 필요한 라이브러리: react-native-webview, expo-clipboard.
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, PlatformColor, Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';

export const LEGAL_SITE = 'https://jongin-2.github.io/ihwa';
export type LegalDoc = 'terms' | 'privacy';
export const legalUrl = (doc: LegalDoc, lang: string) => `${LEGAL_SITE}/${doc}/${lang === 'ko' ? 'ko' : 'en'}/`;

const PAGE_STYLE = `(function(){var s=document.createElement('style');s.textContent='html{font:-apple-system-body}body{font-size:1rem!important;line-height:1.7}html,body{background:transparent!important}h1{display:none}main{padding-top:8px}';document.documentElement.appendChild(s);})();true;`;

type Words = { terms: string; privacy: string; close: string; offline: string; retry: string; back: string; emailCopied: string };
// 주량체커 20개 언어 번역(2026-10-12 기준)에서 옮김
const WORDS: Record<string, Words> = {
  'ko': {"terms": "이용약관", "privacy": "개인정보 처리방침", "close": "닫기", "offline": "인터넷에 연결되면 볼 수 있어요", "retry": "다시 시도", "back": "이전 문서", "emailCopied": "이메일 주소를 복사했어요"},
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

export default function LegalDocView({ doc, lang, tint, onClose }: { doc: LegalDoc; lang: string; tint: ColorValue; onClose: () => void }) {
  const w = WORDS[lang] ?? WORDS.en;
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // 본문 링크로 다른 문서로 넘어가면 머리글도 그 문서 이름 — 페이지 <title>은 탐색 이벤트에 빈 값·이전 제목이 섞여 와 주소 경로로 판단
  const [shown, setShown] = useState<LegalDoc>(doc);
  const [canGoBack, setCanGoBack] = useState(false);
  const web = useRef<WebView>(null);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.side}>
          {canGoBack && (
            <Pressable onPress={() => web.current?.goBack()} hitSlop={8} style={styles.btn} accessibilityRole="button" accessibilityLabel={w.back}>
              <Text style={[styles.back, { color: tint }]}>‹</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} accessibilityRole="header">{w[shown]}</Text>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.btn} accessibilityRole="button" accessibilityLabel={w.close}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>
      </View>
      {failed ? (
        <View style={styles.center}>
          <Text style={styles.msg}>{w.offline}</Text>
          <Pressable onPress={() => { setFailed(false); setAttempt((a) => a + 1); }} style={styles.btn} accessibilityRole="button">
            <Text style={[styles.retry, { color: tint }]}>{w.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          key={attempt}
          ref={web}
          source={{ uri: legalUrl(doc, lang) }}
          style={styles.web}
          injectedJavaScriptBeforeContentLoaded={PAGE_STYLE}
          startInLoadingState
          renderLoading={() => <ActivityIndicator style={StyleSheet.absoluteFill} color={PlatformColor('secondaryLabel')} />}
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
            if (req.url.startsWith(LEGAL_SITE) || req.url === 'about:blank') return true;
            Linking.openURL(req.url).catch(() => {
              if (req.url.startsWith('mailto:')) {
                const email = decodeURIComponent(req.url.slice('mailto:'.length).split('?')[0]);
                Clipboard.setStringAsync(email).then(() => Alert.alert(email, w.emailCopied)).catch(() => undefined);
              }
            });
            return false;
          }}
          allowsLinkPreview={false}
          dataDetectorTypes="none"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PlatformColor('systemBackground') },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8, minHeight: 52 },
  side: { width: 52 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: PlatformColor('label') },
  btn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  back: { fontSize: 30, fontWeight: '300', marginTop: -3 },
  close: { fontSize: 17, fontWeight: '600', color: PlatformColor('secondaryLabel') },
  web: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  msg: { fontSize: 17, color: PlatformColor('secondaryLabel'), textAlign: 'center' },
  retry: { fontSize: 17, fontWeight: '600' },
});
