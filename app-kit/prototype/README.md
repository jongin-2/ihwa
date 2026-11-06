# 공용 프로토타입 — 디자인 시스템 → 컴포넌트 → 화면

2026-11-06 종인님 "프로토타입이 앱마다 다 다르고 엉망 … 디자인에 실제 필요한 목업 HTML을 만들고 그 기반으로 프로토타입을 만들라고 했는데 최신 디자인 시스템이랑 컴포넌트랑 각 화면이 있어야지".

모든 앱의 프로토타입은 같은 세 층으로 만든다. 아래 층을 위 층이 그대로 가져다 쓰므로, 색 하나를 바꾸면 모든 화면이 함께 바뀐다.
Figma 파일의 '스타일 → 컴포넌트 → 화면' 페이지 구성, Storybook의 'Foundations → Components → Pages', Apple Design Resources(iOS UI Kit)의 '색·글자 → 컨트롤 → 화면 예시'와 같은 순서다.

| 층 | 파일(앱 저장소) | 프로토타입 탭 | 기준 |
|---|---|---|---|
| ① 디자인 시스템 | `prd/design-system/tokens.css` (+ 선택 `notes.html`) | 디자인 시스템(자동 생성) | 코드 테마 파일과 색 값이 같아야 한다 |
| ② 컴포넌트 | `prd/components/components.css` + `mockup.html` | 컴포넌트 | 코드 컴포넌트 폴더의 파일마다 하나, 모든 상태 |
| ③ 화면 | `prd/<화면>/mockup.html` | 화면마다 하나 | ①·②를 링크하고 색을 직접 적지 않는다 |

## ① tokens.css

```css
:root {                              /* 라이트(기본) */
  --c-bg: #F2F2F7;  --c-text: #1C1C1E;  --c-accent: #2E9E4C;   /* 색 --c- */
  --t-large-title: 700 34px/41px -apple-system, sans-serif;      /* 글자 --t- (font 값 그대로) */
  --s-2: 8px;  --s-4: 16px;                                       /* 간격 --s- */
  --r-card: 16px;                                                 /* 모서리 --r- */
  --sh-card: 0 1px 3px rgba(0,0,0,.08);                           /* 그림자·재질 --sh- */
  --m-quick: 180ms cubic-bezier(.2,.8,.2,1);                      /* 움직임 --m- */
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --c-bg: #000000; --c-text: #FFFFFF; color-scheme: dark; } }
:root[data-theme="dark"] { --c-bg: #000000; --c-text: #FFFFFF; color-scheme: dark; }   /* 위와 같은 값 — 프로토타입 '다크' 단추가 쓴다 */
```

- 값은 코드 테마 파일(screens.json `theme`)에서 옮긴다. 위젯 Swift(`0xRRGGBB` 여섯 자리 포함)도 `theme`에 넣으면 대조한다. 검사가 양쪽 색 집합을 대조하므로 코드만 바꾸고 토큰을 안 바꾸면 막힌다(= 늘 최신).
- 이름은 쓰임새로(`--c-accent`, `--c-separator`) — 색 이름(`--c-green`) 금지.
- 머리말은 여섯 가지(`--c-`·`--t-`·`--s-`·`--r-`·`--sh-`·`--m-`)뿐 — 검사가 다른 머리말을 막는다.
- 코드에 값이 없는 목업 전용 색(iOS가 그리는 경고창·메뉴·유리의 사본, 목업의 기기 틀·바깥 바탕)도 `--c-`로 두고 screens.json `"mockOnlyColors": {"--c-sysalert-bg": "iOS 경고창 사본"}`에 이유를 적는다. 코드 대조에서 빠지고 디자인 시스템 탭에 '목업 전용'으로 보인다. 코드에 값이 있는 색(위젯 Swift 장식 등)은 여기에 넣지 말고 그 파일을 `theme`에 더한다(11-06 차곡 회신).
- 아이콘·Liquid Glass 재질·움직임처럼 값으로 못 보이는 것은 `notes.html`(본문 조각)에 그림으로.

- 글꼴 묶음 끝에는 늘 `system-ui, sans-serif`를 둔다. `ui-rounded, "SF Pro Rounded", -apple-system`으로 끝나면 화면 없는 크롬(캡처 대조)에서 숫자가 명조로 떨어진다(11-06 차곡 56820a2).

- 모드와 상관없이 늘 한쪽 색인 판(밤 방 위 HUD·전투 화면·위젯 장면처럼 기기 모드가 라이트여도 어두운 것)은 같은 토큰 이름을 `.lock-light {…}`·`.lock-dark {…}` 범위에서 다시 정의하고 그 판에 클래스를 단다 — 새 이름(`--c-hud-dark-text`)을 만들지 않는다(11-06 알롱 제안). 화면 목업은 `class="lock-dark"`만 달면 된다.
- 코드가 값 없이 이름만 쓰는 시스템 색(`PlatformColor('label')`·`UIColor.systemBlue`)은 screens.json `"systemColors": {"label": "--c-label"}`로 어느 토큰인지 밝히고(검사가 빠짐을 막음, 연결한 토큰은 코드 값 대조에서 빠짐). 코드가 이름조차 안 쓰는 iOS 기본 컨트롤 색(Switch의 `systemGreen`, 액션 시트 `systemBlue`)도 여기에 적는다, 토큰 값은 QA 앱 시뮬레이터 캡처에서 라이트·다크 각각 픽셀을 재 넣는다(기억한 값 금지 — iOS 판마다 다름). 토큰 이름은 늘 `--c-`(디자인 시스템 탭이 색 견본으로 그림), `--sys-` 같은 다른 머리말 금지.
- iOS 시스템 색(`#007AFF` 파랑, `#F2F2F7` 그룹 바탕, `rgba(60,60,67,.6)` 보조 글자 등)도 화면 UI에 쓰면 토큰이다(`--c-tint`·`--c-grouped-bg`·`--c-label-2` 꼴). `contentColors`에 넣지 않는다.

## ② 컴포넌트

- `components.css`: 컴포넌트 모양. 색은 `var(--c-…)`만.
- `mockup.html`: 코드 컴포넌트 폴더의 파일마다 `<section data-component="파일 이름">` 하나. 기본·눌림·끔·불러오는 중·오류·빈 값·긴 글자처럼 그 컴포넌트가 가질 수 있는 상태를 나란히.
- 화면이 없는 파일(`UpdatePrompt.ts` 같은 것)은 screens.json `components.skip`에 이유와 함께.
- 링크: `<link rel="stylesheet" href="../design-system/tokens.css"><link rel="stylesheet" href="../components/components.css">`

## ③ 화면 목업

- 화면 탭은 앱 화면 목업만 — 기능 요약·한눈에 보기·앱 캡처 모음·작업판 탭은 두지 않는다(그런 내용은 기획서·Notion에). screens.json `path`로 목업 밖 파일을 탭에 넣지 않는다(11-06 종인님 "알롱 프로토타입에 한눈에가 왜 필요한데").

- 같은 두 줄을 링크하고, 화면에만 있는 배치만 `<style>`에 적는다. 색은 `var(--c-…)`만.
- 팀 색·아이템 그림처럼 내용인 색은 screens.json `contentColors`에. SVG 그림 안과 `data:` 주소는 검사하지 않는다.
- 테마 파일 밖 코드에 UI 색이 있으면(공용 AppDialog의 경고 빨강·채움 회색, 구글 로그인 단추, 시작 표지 등) `contentColors`가 아니라 그 파일을 `theme`에 더하고 토큰(`--c-dialog-…`)으로 만든다 — 그래야 목업도 토큰을 쓰고 코드와 대조된다(11-06 주량체커 회신).
- 공용 AppDialog 색은 다섯 앱이 같은 이름을 쓴다: `--c-dialog-sub`·`--c-dialog-fill`·`--c-dialog-destructive`·`--c-dialog-line`·`--c-dialog-scrim`, 그림자 `--sh-dialog`(값은 app-kit/AppDialog.tsx 그대로, 기준 예시 주량체커 af7b9c6).
- 앱에서 뜨는 모든 경우를 상태 단추로 연다(확인 창·시트·결과·토스트·오류·빈 화면·권한 앞 안내·위젯) — 기존 규칙 그대로.
- `proto-page`·`proto-device`·`proto-notch`·`proto-controls` 이름표 — 기존 규칙 그대로.

## 수준 기준(다섯 앱 같게 — `check-prototype-level.py`가 막음)

11-06 종인님 "여전히 앱마다 프로토타입 수준이 다르잖아". 색 대조만으로는 모양·깊이가 맞지 않아 아래를 검사로 정한다.

1. **디자인 시스템**: 공통 토큰 이름 — 색 `--c-bg`·`card`·`label`·`label-sub`·`separator`·`fill`·`accent`·`on-accent`·`destructive`, 글자 iOS 글자 스타일 11개 `--t-large-title`·`title1`·`title2`·`title3`·`headline`·`body`·`callout`·`subhead`·`footnote`·`caption1`·`caption2`(앱이 안 쓰는 크기도 iOS 기본값으로 채움). 간격 `--s-` 3개·모서리 `--r-` 2개 이상. `notes.html`에 아이콘·재질(Liquid Glass)·움직임.
2. **컴포넌트**: 코드 컴포넌트 파일마다 한 칸(기존) + 공통 UI 패턴 14가지를 `data-pattern`으로 — `nav-title`(큰 제목) · `tab-bar` · `list-row` · `button-primary` · `button-secondary` · `button-destructive` · `dialog` · `sheet` · `toast` · `empty` · `error`(오류·오프라인) · `loading` · `switch` · `segmented`. 앱에 없는 패턴은 screens.json `"patternsNA": {"segmented": "이유"}`.
4. **그림은 지금 앱 것**: 목업의 캐릭터·아이콘·로고·그림은 앱이 실제로 쓰는 자산·렌더러에서 뽑는다(옛 캡처·손 그림 금지). 그림을 만드는 스크립트는 생성물 대조(`check-generated`)에 넣어 앱 그림이 바뀌면 목업도 다시 만들게 한다(11-06 종인님 "알롱은 심지어 알롱이 옛날 디자인이잖아").
3. **화면 탭**: 목업마다 폰 하나(`.proto-device` 정확히 1개, 여러 폰을 늘어놓는 갤러리 금지) + `.proto-controls` 안 상태 단추 2개 이상(기본 + 앱에서 뜨는 경우 전부). 다크는 프로토타입 머리의 시스템/라이트/다크 단추로 — 목업 안 다크 단추 금지. 상태 막대 시각 9:41(애플 제품 화면 관례). 위젯·잠금화면 탭도 폰 하나 위에 그린다.

## screens.json

```json
{
  "title": "주량체커",
  "accent": "#2E9E4C",
  "theme": ["impl/app/src/lib/theme.ts"],
  "components": { "dir": "impl/app/src/components", "skip": { "UpdatePrompt.ts": "화면 없음(시스템 알림 창)" } },
  "contentColors": [],
  "systemColors": { "systemGroupedBackground": "--c-bg" },
  "screens": [{ "key": "onboarding", "label": "온보딩" }, { "key": "home", "label": "홈" }]
}
```

`design-system`·`components` 탭은 자동으로 맨 앞에 붙으니 `screens`에 넣지 않는다.

## 일하는 순서

1. 디자인을 바꿀 땐 토큰·컴포넌트부터 → 화면 목업 → 코드 → 프로토타입 게시. 코드부터 바꿨으면 같은 커밋에 토큰·목업도.
2. `python3 impl/scripts/build-prototype.py`로 만들고 `check-design-system.py`가 통과해야 게시한다(`check-docs-sync.sh`에 연결).
3. 프로토타입 머리의 '시스템/라이트/다크' 단추로 모든 탭을 두 모드에서 본다.

## 파일(원본 → 앱 사본, 글자 그대로)

- `prototype/template.html` → `prd/prototype/template.html`
- `prototype/review-template.html` → `prd/prototype/review-template.html`
- `prototype/build-prototype.py` → `impl/scripts/build-prototype.py`
- `scripts/check-design-system.py` → `impl/scripts/check-design-system.py`
- `scripts/check-prototype-level.py` → `impl/scripts/check-prototype-level.py`
