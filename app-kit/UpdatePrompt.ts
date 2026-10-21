// ⚠️ 공용 원본 — ihwa-site/app-kit/UpdatePrompt.ts. 앱 저장소에는 이 파일을 글자 그대로 복사해 둔다(고치려면 원본을 고치고 앱마다 다시 복사).
// 2026-10-14 종인님 "앱 시작시 앱마켓이랑 비교해서 업데이트 있으면 업데이트 유도하고 설정에서 버전 정보에도 업데이트 버튼 노출,
// 업데이트는 나중에와 지금 업데이트 버튼 2개", "업데이트 유도 방식은 모든 앱 동일하게 하고 앱에 따라 업데이트 미룰 수 있는 것과 무조건일 수는 있어".
//
//  · 최신 버전: App Store 공개 조회(itunes.apple.com/lookup?id=…) — 서버·키 없음. 기기 지역 스토어로 먼저, 없으면 미국 스토어.
//  · 버전 자리마다 다르게, 앱 종류마다 다르게(10-17 종인님 "일반 앱은 C 미안내·B 권장, 게임 앱은 C 권장·B도 강제", A는 둘 다 강제):
//      일반 앱(policy "app", 기본): 셋째 자리(1.4.0→1.4.1) 안내 창 없음(설정 버전 줄 `업데이트` 단추만) · 둘째 자리(1.4→1.5) 권장 · 첫째 자리 강제
//      게임(policy "game" — 서버·순위가 같은 판이어야 함): 셋째 자리 권장 · 둘째·첫째 자리 강제
//    권장은 `나중에`·`지금 업데이트`를 출시 하루 뒤부터 하루 한 번까지(Siren 기본 규칙과 같은 빈도). 앱마다 설정 파일의 `policy`로 고른다.
//  · 긴급 강제: 공용 사이트 설정 파일 `https://jongin-2.github.io/ihwa/app-config/<앱>.json`의 `minVersion`보다 낮으면 자리와 상관없이 강제 —
//    앱 출시 없이 그 숫자만 바꿔 켠다(종인님 결정 10-14 "공용 사이트 설정 파일"). 파일이 없거나 못 읽으면 일반 앱으로 본다.
//  · 안내 창(iOS 기본 경고 창): 제목 `새 버전이 있어요` + `버전 {v}`, 단추 `나중에`·`지금 업데이트`. 무조건이면 둘째 줄 `계속 쓰려면 업데이트가 필요해요`와
//    `지금 업데이트` 하나뿐이고, 스토어에 다녀와도 다시 뜬다.
//  · 언제: 앱을 열 때마다(처음 실행·백그라운드에서 돌아올 때) 조회한다. 강제는 열 때마다 뜨고, 권장은 하루 한 번까지 —
//    마지막으로 띄운 날은 앱이 넘긴 저장소(UpdateConfig.store)에 둔다(없으면 앱을 새로 켤 때 한 번).
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
  /** 권장 안내를 하루 한 번으로 줄이려고 마지막으로 띄운 날을 적는 곳(앱의 AsyncStorage 등). 없으면 앱을 새로 켤 때 한 번 */
  store?: { get: (key: string) => Promise<string | null>; set: (key: string, value: string) => Promise<void> };
};

/** 새 버전이 몇째 자리에서 올랐나 — major 1.x→2.0, minor 1.4→1.5, patch 1.4.0→1.4.1 */
export type UpdateLevel = 'major' | 'minor' | 'patch';
/** 앱 종류 — 공용 사이트 설정 파일의 policy */
export type UpdatePolicy = 'app' | 'game';

export type UpdateState = {
  /** 스토어 최신 버전(못 읽었으면 null) */
  latest: string | null;
  /** 지금 버전보다 새 버전이 있다(또는 무조건 업데이트) */
  available: boolean;
  /** 나중에 없이 업데이트만 — 최소 버전보다 낮거나, 앱 종류에서 강제인 자리가 올랐다 */
  forced: boolean;
  /** 창을 띄울지 — 강제는 늘, 권장은 출시 하루 뒤부터 하루 한 번, 안내 없음 자리는 띄우지 않음(설정 단추만) */
  prompt: boolean;
  /** 오른 자리(새 버전이 없으면 null) */
  level: UpdateLevel | null;
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

/** 몇째 자리가 올랐나(latest가 더 새것일 때만 의미가 있다) */
export function updateLevel(current: string, latest: string): UpdateLevel {
  const c = current.split('.').map((n) => parseInt(n, 10) || 0);
  const l = latest.split('.').map((n) => parseInt(n, 10) || 0);
  if ((l[0] ?? 0) !== (c[0] ?? 0)) return 'major';
  if ((l[1] ?? 0) !== (c[1] ?? 0)) return 'minor';
  return 'patch';
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** 조회 결과 → 상태. 순수 함수(단위 테스트 대상). releasedAt은 스토어의 그 버전 공개 시각(모르면 null — 권장을 바로 띄움). */
export function decideUpdate(
  current: string, latest: string | null, minVersion: string | null,
  policy: UpdatePolicy = 'app', releasedAt: number | null = null, now: number = Date.now(),
): UpdateState {
  const newer = !!latest && compareVersions(latest, current) > 0;
  const level = newer ? updateLevel(current, latest!) : null;
  const belowMin = !!minVersion && compareVersions(current, minVersion) < 0;
  const forceLevels: UpdateLevel[] = policy === 'game' ? ['major', 'minor'] : ['major'];
  const recommendLevel: UpdateLevel = policy === 'game' ? 'patch' : 'minor';
  const forced = belowMin || (!!level && forceLevels.includes(level));
  const recommend = !forced && level === recommendLevel && (releasedAt === null || now - releasedAt >= DAY_MS);
  return { latest, available: forced || newer, forced, prompt: forced || recommend, level };
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

async function fetchLatest(appStoreId: string): Promise<{ version: string; releasedAt: number | null } | null> {
  const region = deviceRegion();
  // 애플 조회 응답은 중간 서버(Akamai)에 최대 하루 저장돼 요청 머리글 no-cache로는 못 피한다 — 출시 뒤 몇 시간 옛 버전이 와서
  // 설정 `업데이트` 단추가 안 떴다(10-22 응원석 1.0.1). 주소에 10분 단위 값을 붙여 늦어도 10분 안에 새 버전을 받는다.
  const bucket = Math.floor(Date.now() / 600000);
  for (const country of region ? [region, 'us'] : ['us']) {
    const j = await getJson(`https://itunes.apple.com/lookup?id=${appStoreId}&country=${country}&t=${bucket}`);
    const r = j?.results?.[0];
    if (typeof r?.version === 'string') {
      const t = Date.parse(r.currentVersionReleaseDate ?? '');
      return { version: r.version, releasedAt: Number.isNaN(t) ? null : t };
    }
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
  const policy: UpdatePolicy = config?.policy === 'game' ? 'game' : 'app';
  const state = decideUpdate(cfg.currentVersion, latest?.version ?? null, min, policy, latest?.releasedAt ?? null);
  // 둘 다 못 읽었으면(오프라인) 기억하지 않는다 — 다음에 열 때 다시 조회
  if (latest || config) cache = { at: Date.now(), key, state };
  return state;
}

/** App Store 앱 페이지 — 애플 표준 링크(https). 기기에서는 App Store 앱이 바로 열린다(유니버설 링크), App Store가 없는 곳(시뮬레이터)은 웹 페이지. */
export function openStore(appStoreId: string) {
  Linking.openURL(`https://apps.apple.com/app/id${appStoreId}`).catch(() => {});
}

let alertShowing = false;
let shownThisLaunch = false;
const LAST_KEY = 'updatePrompt.lastShownDay';

/** 권장 안내를 오늘 아직 안 띄웠나 — 띄우기로 하면 오늘 날짜를 적는다 */
async function dueToday(cfg: UpdateConfig, s: UpdateState): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10) + ':' + (s.latest ?? '');
  if (!cfg.store) {
    if (shownThisLaunch) return false;
    shownThisLaunch = true;
    return true;
  }
  try {
    if ((await cfg.store.get(LAST_KEY)) === today) return false;
    await cfg.store.set(LAST_KEY, today);
  } catch {
    if (shownThisLaunch) return false;
    shownThisLaunch = true;
  }
  return true;
}

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
  const [state, setState] = useState<UpdateState>(cache?.state ?? { latest: null, available: false, forced: false, prompt: false, level: null });
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
      if (s.prompt && (s.forced || (await dueToday(cfgRef.current, s)))) showPrompt(cfgRef.current, s);
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
  const [state, setState] = useState<UpdateState>(cache?.state ?? { latest: null, available: false, forced: false, prompt: false, level: null });
  useEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);
  return state;
}
