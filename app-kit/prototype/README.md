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

- 값은 코드 테마 파일(screens.json `theme`)에서 옮긴다. 검사가 양쪽 색 집합을 대조하므로 코드만 바꾸고 토큰을 안 바꾸면 막힌다(= 늘 최신).
- 이름은 쓰임새로(`--c-accent`, `--c-separator`) — 색 이름(`--c-green`) 금지.
- 아이콘·Liquid Glass 재질·움직임처럼 값으로 못 보이는 것은 `notes.html`(본문 조각)에 그림으로.

## ② 컴포넌트

- `components.css`: 컴포넌트 모양. 색은 `var(--c-…)`만.
- `mockup.html`: 코드 컴포넌트 폴더의 파일마다 `<section data-component="파일 이름">` 하나. 기본·눌림·끔·불러오는 중·오류·빈 값·긴 글자처럼 그 컴포넌트가 가질 수 있는 상태를 나란히.
- 화면이 없는 파일(`UpdatePrompt.ts` 같은 것)은 screens.json `components.skip`에 이유와 함께.
- 링크: `<link rel="stylesheet" href="../design-system/tokens.css"><link rel="stylesheet" href="../components/components.css">`

## ③ 화면 목업

- 같은 두 줄을 링크하고, 화면에만 있는 배치만 `<style>`에 적는다. 색은 `var(--c-…)`만.
- 팀 색·아이템 그림처럼 내용인 색은 screens.json `contentColors`에. SVG 그림 안과 `data:` 주소는 검사하지 않는다.
- 테마 파일 밖 코드에 UI 색이 있으면(공용 AppDialog의 경고 빨강·채움 회색, 구글 로그인 단추, 시작 표지 등) `contentColors`가 아니라 그 파일을 `theme`에 더하고 토큰(`--c-dialog-…`)으로 만든다 — 그래야 목업도 토큰을 쓰고 코드와 대조된다(11-06 주량체커 회신).
- 앱에서 뜨는 모든 경우를 상태 단추로 연다(확인 창·시트·결과·토스트·오류·빈 화면·권한 앞 안내·위젯) — 기존 규칙 그대로.
- `proto-page`·`proto-device`·`proto-notch`·`proto-controls` 이름표 — 기존 규칙 그대로.

## screens.json

```json
{
  "title": "주량체커",
  "accent": "#2E9E4C",
  "theme": ["impl/app/src/lib/theme.ts"],
  "components": { "dir": "impl/app/src/components", "skip": { "UpdatePrompt.ts": "화면 없음(시스템 알림 창)" } },
  "contentColors": [],
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
