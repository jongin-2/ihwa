// ⚠️ 공용 원본 — ihwa-site/app-kit/UpdatePrompt.ts. 앱 저장소에는 이 파일을 글자 그대로 복사해 둔다(고치려면 원본을 고치고 앱마다 다시 복사).
// 2026-10-14 종인님 "앱 시작시 앱마켓이랑 비교해서 업데이트 있으면 업데이트 유도하고 설정에서 버전 정보에도 업데이트 버튼 노출,
// 업데이트는 나중에와 지금 업데이트 버튼 2개", "업데이트 유도 방식은 모든 앱 동일하게 하고 앱에 따라 업데이트 미룰 수 있는 것과 무조건일 수는 있어".
//
//  · 최신 버전: App Store 공개 조회(itunes.apple.com/lookup?id=…) — 서버·키 없음. 기기 지역 스토어로 먼저, 없으면 미국 스토어.
//  · 무조건 업데이트: 공용 사이트 설정 파일 `https://jongin-2.github.io/ihwa/app-config/<앱>.json`의 `minVersion`보다 낮으면 —
//    앱 출시 없이 그 숫자만 바꿔 켠다(종인님 결정 10-14 "공용 사이트 설정 파일"). 파일이 없거나 못 읽으면 미룰 수 있는 안내만.
//  · 안내 창(iOS 기본 경고 창): 제목 `새 버전이 있어요` + `버전 {v}`, 단추 `나중에`·`지금 업데이트`. 무조건이면 둘째 줄 `계속 쓰려면 업데이트가 필요해요`와
//    `지금 업데이트` 하나뿐이고, 스토어에 다녀와도 다시 뜬다.
//  · 언제: 앱을 열 때마다(처음 실행·백그라운드에서 돌아올 때) — '나중에'를 눌러도 다음에 열면 다시(종인님 결정 10-14 "앱 열 때마다").
//    조회 결과는 1시간 동안 기억해 돌아올 때마다 네트워크를 쓰지 않는다.
//  · 설정 버전 줄: 앱이 `useUpdateState()`의 `available`을 보고 `업데이트` 단추를 그린다(누르면 `openStore`).
// 앱마다 다른 값은 UpdateConfig(스토어 앱 ID·설정 파일 이름·지금 버전·언어)뿐. 문구는 아래 20개 언어를 이 파일이 들고 있다.
// 필요한 라이브러리: 없음(react-native만).
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking } from 'react-native';

export const CONFIG_SITE = 'https://jongin-2.github.io/ihwa/app-config';

export type UpdateConfig = {
  /** App Store 앱 ID(숫자) — 예: 주량체커 6815909044 */
  appStoreId: string;
  /** 공용 사이트 설정 파일 이름 — app-config/<configName>.json */
  configName: string;
  /** 지금 앱 버전(app.json expo.version) */
  currentVersion: string;
  /** 앱 언어 코드(없는 언어는 영어) */
  lang: string;
};

export type UpdateState = {
  /** 스토어 최신 버전(못 읽었으면 null) */
  latest: string | null;
  /** 지금 버전보다 새 버전이 있다(또는 무조건 업데이트) */
  available: boolean;
  /** 지금 버전이 최소 버전보다 낮다 — 나중에 없이 업데이트만 */
  forced: boolean;
};

type Words = { title: string; version: string; forced: string; later: string; updateNow: string; update: string };
const WORDS: Record<string, Words> = {
  'ko': { title: '새 버전이 있어요', version: '버전 {v}', forced: '계속 쓰려면 업데이트가 필요해요', later: '나중에', updateNow: '지금 업데이트', update: '업데이트' },
  'en': { title: 'Update Available', version: 'Version {v}', forced: 'Update to keep using the app', later: 'Later', updateNow: 'Update Now', update: 'Update' },
  'ja': { title: '新しいバージョンがあります', version: 'バージョン {v}', forced: '引き続き使うにはアップデートが必要です', later: 'あとで', updateNow: '今すぐアップデート', update: 'アップデート' },
  'zh-Hant': { title: '有新版本', version: '版本 {v}', forced: '需要更新才能繼續使用', later: '稍後', updateNow: '立即更新', update: '更新' },
  'zh-Hans': { title: '有新版本', version: '版本 {v}', forced: '需要更新才能继续使用', later: '稍后', updateNow: '立即更新', update: '更新' },
  'es': { title: 'Actualización disponible', version: 'Versión {v}', forced: 'Actualiza para seguir usando la app', later: 'Más tarde', updateNow: 'Actualizar ahora', update: 'Actualizar' },
  'pt': { title: 'Atualização disponível', version: 'Versão {v}', forced: 'Atualize para continuar usando o app', later: 'Mais tarde', updateNow: 'Atualizar agora', update: 'Atualizar' },
  'de': { title: 'Update verfügbar', version: 'Version {v}', forced: 'Aktualisiere, um die App weiter zu nutzen', later: 'Später', updateNow: 'Jetzt aktualisieren', update: 'Aktualisieren' },
  'fr': { title: 'Mise à jour disponible', version: 'Version {v}', forced: 'Mettez à jour pour continuer à utiliser l’app', later: 'Plus tard', updateNow: 'Mettre à jour', update: 'Mettre à jour' },
  'it': { title: 'Aggiornamento disponibile', version: 'Versione {v}', forced: 'Aggiorna per continuare a usare l’app', later: 'Più tardi', updateNow: 'Aggiorna ora', update: 'Aggiorna' },
  'ru': { title: 'Доступно обновление', version: 'Версия {v}', forced: 'Обновите, чтобы продолжить пользоваться приложением', later: 'Позже', updateNow: 'Обновить сейчас', update: 'Обновить' },
  'tr': { title: 'Güncelleme mevcut', version: 'Sürüm {v}', forced: 'Kullanmaya devam etmek için güncelleyin', later: 'Daha sonra', updateNow: 'Şimdi güncelle', update: 'Güncelle' },
  'id': { title: 'Pembaruan tersedia', version: 'Versi {v}', forced: 'Perbarui untuk terus memakai aplikasi', later: 'Nanti', updateNow: 'Perbarui sekarang', update: 'Perbarui' },
  'vi': { title: 'Đã có bản cập nhật', version: 'Phiên bản {v}', forced: 'Cần cập nhật để tiếp tục sử dụng', later: 'Để sau', updateNow: 'Cập nhật ngay', update: 'Cập nhật' },
  'nl': { title: 'Update beschikbaar', version: 'Versie {v}', forced: 'Werk bij om de app te blijven gebruiken', later: 'Later', updateNow: 'Nu bijwerken', update: 'Bijwerken' },
  'pl': { title: 'Dostępna aktualizacja', version: 'Wersja {v}', forced: 'Zaktualizuj, aby dalej korzystać z aplikacji', later: 'Później', updateNow: 'Aktualizuj teraz', update: 'Aktualizuj' },
  'sv': { title: 'Uppdatering finns', version: 'Version {v}', forced: 'Uppdatera för att fortsätta använda appen', later: 'Senare', updateNow: 'Uppdatera nu', update: 'Uppdatera' },
  'th': { title: 'มีเวอร์ชันใหม่', version: 'เวอร์ชัน {v}', forced: 'ต้องอัปเดตเพื่อใช้งานต่อ', later: 'ภายหลัง', updateNow: 'อัปเดตเลย', update: 'อัปเดต' },
  'cs': { title: 'Je k dispozici aktualizace', version: 'Verze {v}', forced: 'Aktualizujte, abyste mohli aplikaci dál používat', later: 'Později', updateNow: 'Aktualizovat teď', update: 'Aktualizovat' },
  'uk': { title: 'Доступне оновлення', version: 'Версія {v}', forced: 'Оновіть, щоб і далі користуватися застосунком', later: 'Пізніше', updateNow: 'Оновити зараз', update: 'Оновити' },
};

export const updateWords = (lang: string): Words => WORDS[lang] ?? WORDS.en;

/** "1.10.0" > "1.9.2" — 숫자 자리별 비교. 양수면 a가 새것. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** 조회 결과 → 상태. 순수 함수(단위 테스트 대상). */
export function decideUpdate(current: string, latest: string | null, minVersion: string | null): UpdateState {
  const forced = !!minVersion && compareVersions(current, minVersion) < 0;
  const newer = !!latest && compareVersions(latest, current) > 0;
  return { latest, available: forced || newer, forced };
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

function deviceRegion(): string | null {
  try {
    const m = Intl.DateTimeFormat().resolvedOptions().locale.match(/[-_]([A-Z]{2})\b/);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

async function fetchLatest(appStoreId: string): Promise<string | null> {
  const region = deviceRegion();
  for (const country of region ? [region, 'us'] : ['us']) {
    const j = await getJson(`https://itunes.apple.com/lookup?id=${appStoreId}&country=${country}`);
    const v = j?.results?.[0]?.version;
    if (typeof v === 'string') return v;
  }
  return null;
}

const CACHE_MS = 60 * 60 * 1000;
let cache: { at: number; key: string; state: UpdateState } | null = null;

export async function checkForUpdate(cfg: UpdateConfig): Promise<UpdateState> {
  const key = `${cfg.appStoreId}:${cfg.currentVersion}`;
  if (cache && cache.key === key && Date.now() - cache.at < CACHE_MS) return cache.state;
  const [latest, config] = await Promise.all([
    fetchLatest(cfg.appStoreId),
    getJson(`${CONFIG_SITE}/${cfg.configName}.json`),
  ]);
  const min = typeof config?.minVersion === 'string' ? config.minVersion : null;
  const state = decideUpdate(cfg.currentVersion, latest, min);
  // 둘 다 못 읽었으면(오프라인) 기억하지 않는다 — 다음에 열 때 다시 조회
  if (latest || config) cache = { at: Date.now(), key, state };
  return state;
}

export function openStore(appStoreId: string) {
  Linking.openURL(`itms-apps://apps.apple.com/app/id${appStoreId}`).catch(() =>
    Linking.openURL(`https://apps.apple.com/app/id${appStoreId}`).catch(() => {}),
  );
}

let alertShowing = false;

function showPrompt(cfg: UpdateConfig, s: UpdateState) {
  if (alertShowing) return;
  const w = updateWords(cfg.lang);
  // 새 번호는 지금보다 높을 때만 — 무조건 업데이트를 스토어 반영보다 먼저 켰을 때 낮은 번호가 보이지 않게
  const v = s.latest && compareVersions(s.latest, cfg.currentVersion) > 0 ? s.latest : '';
  alertShowing = true;
  const done = () => { alertShowing = false; };
  const update = { text: w.updateNow, style: 'default' as const, isPreferred: true, onPress: () => { done(); openStore(cfg.appStoreId); } };
  if (s.forced) {
    Alert.alert(w.title, (v ? w.version.replace('{v}', v) + '\n' : '') + w.forced, [update], { cancelable: false });
  } else {
    Alert.alert(w.title, v ? w.version.replace('{v}', v) : undefined, [
      { text: w.later, style: 'cancel', onPress: done },
      update,
    ], { cancelable: true, onDismiss: done });
  }
}

/**
 * 앱 뿌리 화면에서 한 번 부른다(첫 실행 안내가 끝난 뒤 화면). 앱을 열 때마다 조회해 새 버전이 있으면 안내 창을 띄우고,
 * 지금 상태를 돌려준다 — 설정 버전 줄의 `업데이트` 단추는 이 값의 `available`을 쓴다(같은 값을 쓰려면 useUpdateState).
 */
export function useUpdatePrompt(cfg: UpdateConfig, enabled = true): UpdateState {
  const [state, setState] = useState<UpdateState>(cache?.state ?? { latest: null, available: false, forced: false });
  const cfgRef = useRef(cfg);
  cfgRef.current = cfg;
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const run = async () => {
      const s = await checkForUpdate(cfgRef.current);
      if (!alive) return;
      setState(s);
      listeners.forEach((l) => l(s));
      if (s.available) showPrompt(cfgRef.current, s);
    };
    run();
    let prev = AppState.currentState;
    const sub = AppState.addEventListener('change', (next) => {
      if (prev === 'background' && next === 'active') run();
      prev = next;
    });
    return () => { alive = false; sub.remove(); };
  }, [enabled]);
  return state;
}

const listeners = new Set<(s: UpdateState) => void>();

/** 안내 창 없이 지금 상태만 — 설정 화면처럼 다른 곳에서 `업데이트` 단추를 그릴 때. useUpdatePrompt가 조회할 때마다 같이 바뀐다. */
export function useUpdateState(): UpdateState {
  const [state, setState] = useState<UpdateState>(cache?.state ?? { latest: null, available: false, forced: false });
  useEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);
  return state;
}
