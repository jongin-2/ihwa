// ⚠️ 공용 원본 — ihwa-site/app-kit/LegalDocView.tsx. 앱 저장소에는 이 파일을 글자 그대로 복사해 둔다(고치려면 원본을 고치고 세 앱에 다시 복사).
// 각 앱의 빌드 점검(check-docs-sync)이 원본과 같은지 본다. 2026-10-12 종인님 "약관 같은 건 모든 앱 화면도 동일하게 구성하고 잘 관리하면 될 것 같은데
// 주량체커 같은 거랑 왜 자꾸 달라지지" — 앱마다 따로 짠 사본(주량체커·응원석 가운데 제목, 차곡 큰 제목 + 원 ✕)이 고칠 때마다 벌어졌다.
//
// 이용약관·개인정보 처리방침을 공용 사이트(jongin-2/ihwa) 페이지 그대로, 주소가 보이지 않는 앱 안 웹뷰로 보여 주는 화면 전체(머리글 포함).
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
//  · Android(11-06 한배): 머리줄은 Material 기본 ←(닫기), 하드웨어 뒤로 가기는 이전 문서부터, 색은 Android 테마 속성.
// 앱마다 다른 값은 tint(강조색: 다시 시도)와 app(사이트 앱 페이지 이름)뿐. react-navigation이 없는 앱은 navigation 대신 renderHeader(아래 LegalHeader). 앱은 모달 화면 옵션에 headerShown: true를 두고 navigation(setOptions가 있는 것)을 넘긴다. 언어는 앱 언어 코드(없으면 영어). 페이지는 한국어·영어 두 가지(한국어 밖은 영어).
// 머리글 색은 내비게이션 테마를 따른다 — NavigationContainer(expo-router는 ThemeProvider)에 다크·라이트 테마를 꼭 넘긴다(10-26 한배: 안 넘겨 다크 모드에서 머리글이 흰색).
// 필요한 라이브러리: react-native-webview, expo-clipboard.
import { useEffect, useLayoutEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { ActivityIndicator, BackHandler, Linking, Platform, PlatformColor, Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { appDialog } from './AppDialog'; // 공용 원본 — 함께 복사(10-27 앱 확인 창)
import { WebView } from 'react-native-webview';
import * as Clipboard from 'expo-clipboard';

export const LEGAL_SITE = 'https://jongin-2.github.io/ihwa';
export type LegalDoc = 'terms' | 'privacy';
// app: 사이트 build.py APPS의 이름(drinkchecker·cheerseat·chagok·allong·sameboat) — '공통 + 그 앱'만 담은 페이지를 연다
// (11-13 종인님 "앱별 주소로 나눠", 전에는 다섯 앱 조항이 한 문서에 섞여 보였다). 사이트에 아직 앱 페이지가 없는 앱(출시 전)은 빼고 부른다 → 전체 문서.
export const legalUrl = (doc: LegalDoc, lang: string, app?: string) => `${LEGAL_SITE}/${doc}/${app ? app + '/' : ''}${lang === 'ko' ? 'ko' : 'en'}/`;

const PAGE_STYLE = `(function(){var s=document.createElement('style');s.textContent='html{font:-apple-system-body}body{font-size:1rem!important;line-height:1.7}html,body{background:transparent!important}h1{display:none}main{padding-top:8px}';document.documentElement.appendChild(s);})();true;`;

// 한국어·영어 밖 언어는 영어 본문 맨 위(버전 고르기 위)에 그 언어로 '영어·한국어로만 제공' 한 줄(11-13 종인님 "앱 언어로 안내 한 줄").
// 번역 의무는 없고(한국 법·애플 심사), Hostinger·GoDaddy처럼 다른 언어 이용자에게 알리는 관례. 법적 내용이 아닌 안내라 문서를 번역하지 않는다.
// 11-13 맵나이츠 ru 실측: 문서 끝에 도는 injectedJavaScript는 iOS에서 onMessage가 없으면 안 돌았다(PAGE_STYLE만 먹고 줄 없음).
// → 문서 앞에 넣는 injectedJavaScriptBeforeContentLoaded 하나로 합치고, 줄은 DOMContentLoaded 뒤에 넣는다(본문 링크로 옮긴 문서에도 같이).
// ja·zh 문장엔 띄어쓰기가 없어, 사이트의 word-break:keep-all 때문에 끊을 자리가 없어 아무 데서나 꺾였다('提供さ/れています', 11-13 차곡) — 구 사이에 폭 없는 공백(\u200b)을 넣어 그 자리에서만 꺾이게.
const noticeAdd = (text: string) => `(function(){function a(){if(document.getElementById('ihwa-only'))return;var h=document.querySelector('main h1');if(!h)return;var p=document.createElement('p');p.id='ihwa-only';p.className='old';p.textContent=${JSON.stringify(text)};h.parentNode.insertBefore(p,h.nextSibling);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',a);else a();})();`;
const pageScript = (text?: string) => text ? PAGE_STYLE.replace(/true;$/, noticeAdd(text) + 'true;') : PAGE_STYLE;

type Words = { terms: string; privacy: string; close: string; offline: string; retry: string; back: string; emailCopied: string; ok: string; only?: string };
// 주량체커 20개 언어 번역(2026-10-12 기준)에서 옮김
const WORDS: Record<string, Words> = {
  'ko': {"terms": "이용약관", "privacy": "개인정보 처리방침", "close": "닫기", "offline": "인터넷에 연결되면 볼 수 있어요", "retry": "다시 시도", "back": "이전 문서", "emailCopied": "이메일 주소를 복사했어요", "ok": "확인"},
  'en': {"terms": "Terms of Service", "privacy": "Privacy Policy", "close": "Close", "offline": "Available when you’re online", "retry": "Try Again", "back": "Previous page", "emailCopied": "Email address copied", "ok": "OK"},
  'ja': {"offline": "インターネットに接続すると表示されます", "retry": "再試行", "back": "前のページ", "emailCopied": "メールアドレスをコピーしました", "terms": "利用規約", "privacy": "プライバシーポリシー", "close": "閉じる", "ok": "OK", "only": "この\u200bドキュメントは\u200b英語と\u200b韓国語でのみ\u200b提供されて\u200bいます。"},
  'zh-Hant': {"offline": "連上網路即可查看", "retry": "重試", "back": "上一頁", "emailCopied": "已複製電子郵件地址", "terms": "服務條款", "privacy": "隱私權政策", "close": "關閉", "ok": "好", "only": "本文件\u200b僅提供\u200b英文和韓文版本。"},
  'zh-Hans': {"offline": "联网后即可查看", "retry": "重试", "back": "上一页", "emailCopied": "已复制电子邮件地址", "terms": "服务条款", "privacy": "隐私政策", "close": "关闭", "ok": "好", "only": "本文档\u200b仅提供\u200b英文和韩文版本。"},
  'es': {"offline": "Disponible cuando tengas conexión a internet", "retry": "Reintentar", "back": "Página anterior", "emailCopied": "Dirección de correo copiada", "terms": "Términos del servicio", "privacy": "Política de privacidad", "close": "Cerrar", "ok": "Aceptar", "only": "Este documento solo está disponible en inglés y coreano."},
  'pt': {"offline": "Disponível quando você estiver online", "retry": "Tentar novamente", "back": "Página anterior", "emailCopied": "Endereço de e-mail copiado", "terms": "Termos de uso", "privacy": "Política de privacidade", "close": "Fechar", "ok": "OK", "only": "Este documento está disponível apenas em inglês e coreano."},
  'de': {"offline": "Verfügbar, sobald du online bist", "retry": "Erneut versuchen", "back": "Vorherige Seite", "emailCopied": "E-Mail-Adresse kopiert", "terms": "Nutzungsbedingungen", "privacy": "Datenschutzerklärung", "close": "Schließen", "ok": "OK", "only": "Dieses Dokument ist nur auf Englisch und Koreanisch verfügbar."},
  'fr': {"offline": "Disponible lorsque vous êtes en ligne", "retry": "Réessayer", "back": "Page précédente", "emailCopied": "Adresse e-mail copiée", "terms": "Conditions d'utilisation", "privacy": "Politique de confidentialité", "close": "Fermer", "ok": "OK", "only": "Ce document est disponible uniquement en anglais et en coréen."},
  'it': {"offline": "Disponibile quando sei online", "retry": "Riprova", "back": "Pagina precedente", "emailCopied": "Indirizzo email copiato", "terms": "Termini di servizio", "privacy": "Informativa sulla privacy", "close": "Chiudi", "ok": "OK", "only": "Questo documento è disponibile solo in inglese e coreano."},
  'ru': {"offline": "Доступно при подключении к интернету", "retry": "Повторить", "back": "Предыдущая страница", "emailCopied": "Адрес эл. почты скопирован", "terms": "Условия использования", "privacy": "Политика конфиденциальности", "close": "Закрыть", "ok": "ОК", "only": "Этот документ доступен только на английском и корейском языках."},
  'tr': {"offline": "İnternete bağlandığında görüntülenebilir", "retry": "Tekrar dene", "back": "Önceki sayfa", "emailCopied": "E-posta adresi kopyalandı", "terms": "Kullanım Şartları", "privacy": "Gizlilik Politikası", "close": "Kapat", "ok": "Tamam", "only": "Bu belge yalnızca İngilizce ve Korece olarak sunulmaktadır."},
  'id': {"offline": "Tersedia saat Anda online", "retry": "Coba lagi", "back": "Halaman sebelumnya", "emailCopied": "Alamat email disalin", "terms": "Ketentuan Layanan", "privacy": "Kebijakan Privasi", "close": "Tutup", "ok": "OK", "only": "Dokumen ini hanya tersedia dalam bahasa Inggris dan Korea."},
  'vi': {"offline": "Xem được khi có kết nối mạng", "retry": "Thử lại", "back": "Trang trước", "emailCopied": "Đã sao chép địa chỉ email", "terms": "Điều khoản dịch vụ", "privacy": "Chính sách quyền riêng tư", "close": "Đóng", "ok": "OK", "only": "Tài liệu này chỉ có bằng tiếng Anh và tiếng Hàn."},
  'nl': {"offline": "Beschikbaar zodra je online bent", "retry": "Probeer opnieuw", "back": "Vorige pagina", "emailCopied": "E-mailadres gekopieerd", "terms": "Gebruiksvoorwaarden", "privacy": "Privacybeleid", "close": "Sluit", "ok": "OK", "only": "Dit document is alleen beschikbaar in het Engels en Koreaans."},
  'pl': {"offline": "Dostępne po połączeniu z internetem", "retry": "Spróbuj ponownie", "back": "Poprzednia strona", "emailCopied": "Skopiowano adres e-mail", "terms": "Warunki korzystania", "privacy": "Polityka prywatności", "close": "Zamknij", "ok": "OK", "only": "Ten dokument jest dostępny tylko w języku angielskim i koreańskim."},
  'sv': {"offline": "Finns när du är online", "retry": "Försök igen", "back": "Föregående sida", "emailCopied": "E-postadressen kopierades", "terms": "Användarvillkor", "privacy": "Integritetspolicy", "close": "Stäng", "ok": "OK", "only": "Det här dokumentet finns bara på engelska och koreanska."},
  'th': {"offline": "ดูได้เมื่อออนไลน์", "retry": "ลองอีกครั้ง", "back": "หน้าก่อนหน้า", "emailCopied": "คัดลอกอีเมลแล้ว", "terms": "ข้อกำหนดการใช้งาน", "privacy": "นโยบายความเป็นส่วนตัว", "close": "ปิด", "ok": "ตกลง", "only": "เอกสารนี้มีให้เฉพาะภาษาอังกฤษและภาษาเกาหลีเท่านั้น"},
  'cs': {"offline": "Dostupné po připojení k internetu", "retry": "Zkusit znovu", "back": "Předchozí stránka", "emailCopied": "E-mailová adresa zkopírována", "terms": "Podmínky použití", "privacy": "Zásady ochrany osobních údajů", "close": "Zavřít", "ok": "OK", "only": "Tento dokument je k dispozici pouze v angličtině a korejštině."},
  'uk': {"offline": "Доступно за наявності інтернету", "retry": "Спробувати ще раз", "back": "Попередня сторінка", "emailCopied": "Адресу електронної пошти скопійовано", "terms": "Умови використання", "privacy": "Політика конфіденційності", "close": "Закрити", "ok": "OK", "only": "Цей документ доступний лише англійською та корейською мовами."},
};

// react-navigation·expo-router 어느 쪽 navigation이든 setOptions만 쓴다
type HeaderNav = { setOptions: (options: object) => void };
// 머리글 없이 띄우는 앱(11-13 맵나이츠 — react-navigation 없이 게임 자체 화면 전환): navigation 대신 renderHeader로 머리줄을 앱이 그린다.
// 동작(문서 이름이 바뀌는 제목, 다른 문서로 가면 ‹ 이전 문서·처음엔 ✕ 닫기, 화면 낭독 이름, Android 뒤로 가기)은 이 부품이 정해 넘긴다 — 앱은 모양만.
// 배치는 위 머리글과 같게: 가운데 제목, 왼쪽 끝 단추 하나(44pt 이상).
export type LegalHeader = { title: string; button: 'close' | 'back'; label: string; onPress: () => void };

// ✕의 화면 낭독 이름은 문서 이름을 붙인다 — 메일 복사 알림 단추 '닫기'와 겹쳐 자동 시험이 엉뚱한 쪽을 누름(10-30 종인님 "문서 이름 붙여", 주량체커 SET-44).
// 한국어·영어는 자연스러운 어순, 나머지 언어는 새 번역 없이 "문서 이름, 닫기".
function closeLabel(lang: string, w: Words, doc: LegalDoc): string {
  if (lang === 'ko') return `${w[doc]} ${w.close}`;
  if (lang === 'en' || !WORDS[lang]) return `Close ${WORDS.en[doc]}`;
  return `${w[doc]}, ${w.close}`;
}

export default function LegalDocView({ doc, lang, app, tint, onClose, navigation, renderHeader }: { doc: LegalDoc; lang: string; app?: string; tint: ColorValue; onClose: () => void; navigation?: HeaderNav; renderHeader?: (h: LegalHeader) => ReactNode }) {
  const w = WORDS[lang] ?? WORDS.en;
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  // 본문 링크로 다른 문서로 넘어가면 머리글도 그 문서 이름 — 페이지 <title>은 탐색 이벤트에 빈 값·이전 제목이 섞여 와 주소 경로로 판단
  const [shown, setShown] = useState<LegalDoc>(doc);
  const [canGoBack, setCanGoBack] = useState(false);
  const web = useRef<ComponentRef<typeof WebView>>(null); // RN 0.88·webview 14 타입은 클래스 인스턴스로 못 씀(10-30 차곡 SDK 58)
  // 실패하면 웹뷰가 내려가고 다시 시도는 처음 문서부터 연다 — 머리글도 처음 상태(✕·처음 문서 이름)로(11-06 알롱 전수 검토: ‹가 남아 눌러도 반응 없음)
  // Android 웹뷰(react-native-webview 14)는 문서를 옮겨도 canGoBack을 늘 false로 보낸다(11-06 한배 실측) — 다녀간 주소를 직접 쌓는다
  const trail = useRef<string[]>([]);
  const fail = () => { setFailed(true); setCanGoBack(false); setShown(doc); trail.current = []; };
  useLayoutEffect(() => {
    // Android(11-06 한배): SF Symbol 바 버튼이 없어 머리줄에 아무 단추도 안 뜸 → Material 기본 ←(위로 = 시트 닫기)를 켜고,
    // 하드웨어 뒤로 가기는 아래 BackHandler가 이전 문서부터 되돌린다(Material: 위로는 화면 계층, 뒤로는 방문 순서).
    if (!navigation) return;
    if (Platform.OS !== 'ios') { navigation.setOptions({ title: w[shown], headerBackVisible: true }); return; }
    navigation.setOptions({
      title: w[shown],
      headerBackVisible: false,
      unstable_headerLeftItems: () => [
        canGoBack
          ? { type: 'button', label: w.back, icon: { type: 'sfSymbol', name: 'chevron.backward' }, onPress: () => web.current?.goBack() }
          : { type: 'button', label: closeLabel(lang, w, shown), icon: { type: 'sfSymbol', name: 'xmark' }, onPress: onClose },
      ],
    });
  }, [navigation, shown, canGoBack, w, lang, onClose]);
  useEffect(() => {
    if (Platform.OS !== 'android' || (!canGoBack && navigation)) return;
    // 머리글 없는 앱은 앞 문서가 없으면 하드웨어 뒤로 가기 = 닫기(native-stack이 해 주던 일)
    if (!canGoBack) { const sub = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; }); return () => sub.remove(); }
    // 네이티브 goBack은 기록을 모를 수 있어 페이지 안 history.back()으로(11-06 한배)
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { web.current?.injectJavaScript('history.back();true;'); return true; });
    return () => sub.remove();
  }, [canGoBack, navigation, onClose]);
  return (
    <View style={styles.container}>
      {!navigation && renderHeader?.(canGoBack
        ? { title: w[shown], button: 'back', label: w.back, onPress: () => (Platform.OS === 'android' ? web.current?.injectJavaScript('history.back();true;') : web.current?.goBack()) }
        : { title: w[shown], button: 'close', label: closeLabel(lang, w, shown), onPress: onClose })}
      {failed ? (
        <View style={styles.center}>
          <Text lineBreakStrategyIOS="hangul-word" style={styles.msg}>{w.offline}</Text>
          <Pressable onPress={() => { setFailed(false); setLoading(true); setAttempt((a) => a + 1); }} style={styles.btn} accessibilityRole="button">
            {({ pressed }) => <Text lineBreakStrategyIOS="hangul-word" style={[styles.retry, { color: tint }, pressed && styles.pressed]}>{w.retry}</Text>}
          </Pressable>
        </View>
      ) : (
        <WebView
          key={attempt}
          ref={web}
          source={{ uri: legalUrl(doc, lang, app) }}
          // 저장해 둔 사본을 쓰지 않는다 — GitHub Pages가 10분 캐시를 허락해, 게시 직후 앱에서 옛 판이 보였다(11-06 종인님 "앱에서 왜 최신이 안보이지")
          cacheEnabled={false}
          style={styles.web}
          injectedJavaScriptBeforeContentLoaded={pageScript(w.only)}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={(s) => {
            const m = s.url.match(/\/ihwa\/(terms|privacy)\//);
            if (m) setShown(m[1] as LegalDoc);
            if (Platform.OS !== 'android') { setCanGoBack(s.canGoBack); return; }
            if (s.loading) return;
            const t = trail.current;
            if (t[t.length - 1] === s.url) return;
            if (t[t.length - 2] === s.url) t.pop(); else t.push(s.url);
            setCanGoBack(t.length > 1);
          }}
          onError={fail}
          onHttpError={fail}
          // 웹 내용 프로세스가 죽으면(메모리 부족 등) Android는 처리기가 없을 때 앱째 죽고, iOS는 흰 화면으로 남는다(11-14 한배 c17ca0f3 실기기)
          // Android는 웹뷰를 새로 만든다 — 처음 문서부터 열리므로 머리글·다녀간 주소도 처음 상태로
          onRenderProcessGone={() => { setCanGoBack(false); setShown(doc); trail.current = []; setLoading(true); setAttempt((a) => a + 1); }}
          onContentProcessDidTerminate={() => web.current?.reload()}
          // 모든 링크를 아래 판단으로 — 기본값(http·https만)이면 메일 링크를 라이브러리가 먼저 가로채 실패해도 조용하다(주량체커 09-28 확인)
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url === LEGAL_SITE || req.url.startsWith(LEGAL_SITE + '/') || req.url === 'about:blank') return true; // '/'까지 봐야 ihwa-다른저장소가 안 열림(10-16 차곡 보안 점검)
            Linking.openURL(req.url).catch(() => {
              if (req.url.startsWith('mailto:')) {
                const raw = req.url.slice('mailto:'.length).split('?')[0];
                let email = raw;
                try { email = decodeURIComponent(raw); } catch { /* 잘못된 퍼센트 열이면 그대로 */ }
                // 창에 보이는 주소만 '@' 뒤에 폭 없는 공백 — AX5에서 'ihwa.support@g/mail.com'으로 끊겼다(11-13 한배). 복사 값은 그대로.
                Clipboard.setStringAsync(email).then(() => appDialog({ title: w.emailCopied, msg: email.replace('@', '@\u200b'), buttons: [{ text: w.ok, kind: 'cancel' }] })).catch(() => undefined);
              }
            });
            return false;
          }}
          allowsLinkPreview={false}
          dataDetectorTypes={NO_DATA_DETECTORS}
        />
      )}
      {!failed && <DelayedSpinner visible={loading} />}
    </View>
  );
}

// 대기 표시(10-22 종인님 "버퍼링이 걸리는 진입 화면은 로딩 스피너를 넣든가 해서 자연스럽게", 알롱 lib/loadingGate.ts와 같은 값):
// 0.3초 안에 끝나는 짧은 대기엔 아무것도 띄우지 않고(깜빡임 방지), 넘으면 띄우며, 한 번 뜨면 0.4초는 유지한다.
// 숫자는 애플이 정한 값이 아니라 관례(HIG는 '조금 넘게 걸리면 진행 표시'까지만 말함).
// 목록으로 넘긴다 — 네이티브 정의가 두 플랫폼 모두 목록이라 문자열이면 Android가 ClassCastException으로 멈춤(11-06 한배 Android).
// 밖에 상수로 둔다 — 그릴 때마다 새 배열이면 개발 경고가 남(11-06 응원석).
const NO_DATA_DETECTORS: 'none'[] = ['none'];
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
  return on ? <ActivityIndicator style={StyleSheet.absoluteFill} pointerEvents="none" color={SUB} /> : null;
}

// 시스템 색 — iOS 이름은 Android에서 못 찾아 앱이 멈춘다(11-06 한배 Android "ColorValue: None of the paths…"), Android는 테마 속성으로
const BG = Platform.select({ ios: PlatformColor('systemBackground'), default: PlatformColor('?android:attr/colorBackground') });
const SUB = Platform.select({ ios: PlatformColor('secondaryLabel'), default: PlatformColor('?android:attr/textColorSecondary') });

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  btn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 }, // 앱들의 Tap(PRESSED_OPACITY 0.6)과 같게 — 2026-10-14 차곡 빌드 11 회귀 DSN-02
  web: { flex: 1, backgroundColor: 'transparent' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  msg: { fontSize: 17, color: SUB, textAlign: 'center' },
  retry: { fontSize: 17, fontWeight: '600' },
});
