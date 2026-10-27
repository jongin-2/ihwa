#!/usr/bin/env python3
"""목업 흐름 점검 — 공용 원본(코어 관리, 앱에는 글자 그대로 복사). 원래 모양은 한배 impl/scripts/qa/check-mockup-flows.py(10-27).

왜: 10-27 종인님 "프로토타입에 모든 케이스 화면 넣어놔 확인할수 있게 … 다른앱도 동일하게"(ihwa-repo 스킬 프로토타입 줄).
무엇을: 장면 목업(prd/<장면>/mockup.html)마다 크롬 머리 없는 창에서
  ① proto-controls 상태 단추를 모두 눌러 JS 오류가 0인지 보고,
  ② 폰 안에서 띄우는 창(위에 겹치는 absolute·fixed 요소 중 z-index 10 이상이고 처음엔 숨은 것 — 시트·확인 창·토스트·카드)이
     상태 단추 중 하나로 한 번이라도 보였는지 본다. 한 번도 안 보인 창은 "프로토타입 단추로 못 여는 창"으로 막는다.
  ③ '경우 그림' 단추(proto-controls의 button[data-case] — 누르면 그 경우의 폰 그림 #<case_prefix><id>가 열림, 알롱 방식)가 있으면
     단추마다 그 그림이 실제로 보이고 비어 있지 않으며 한 번에 하나만 열렸는지 본다(알롱 check-mockup-cases.py에서 옮김).
  ④ 앱이 따로 적은 실제 흐름 스크립트(예: 한배 말풍선 → 신고 → 보내기)를 돌린다.
업로드 스크립트(testflight.sh)가 부르고, 막히면 0이 아닌 값으로 끝난다.
크롬은 한 번에 하나만, 장면 하나씩 차례로 돈다(10-26 한배 크롬 여럿 동시로 맥 대기 상태). 맥이 '대기'면 미뤄서 돌린다.

설정(impl/scripts/qa-config.json의 "mockup_flows", 모두 선택):
  "scenes": ["home", ...]            점검할 장면 폴더(없으면 prd/*/mockup.html 전부)
  "skip": ["#pop", ...]              창으로 보지 않을 요소(게임 중 효과처럼 쓰면 저절로 보이는 것) — CSS 선택자의 id만
  "popup_class": "bmenu|qalert"      창으로 볼 클래스 이름 추가(기본: sheet·dlg·dialog·modal·toast·alert·mask·scrim·popup·menu·card)
  "case_prefix": "pc-"               경우 그림 id 앞머리(기본 pc-)
  "flows": {"chat": "impl/scripts/qa/flow-chat.js"}   장면별 실제 흐름 JS(점검 함수 __need·__vis·__wait를 쓸 수 있음)
쓰는 법: python3 impl/scripts/qa/check-mockup-flows.py [--config 경로]
"""
import argparse, glob, html, json, os, re, subprocess, sys, tempfile

ap = argparse.ArgumentParser()
ap.add_argument('--config', help='설정 파일 위치(시험용 — 기본은 <저장소>/impl/scripts/qa-config.json)')
ap.add_argument('--root', help='저장소 위치(시험용 — 기본은 이 파일에서 세 단계 위)')
args = ap.parse_args()
R = os.path.abspath(args.root or os.path.join(os.path.dirname(__file__), '../../..'))
cfg_path = args.config or f'{R}/impl/scripts/qa-config.json'
cfg = (json.load(open(cfg_path)) if os.path.exists(cfg_path) else {}).get('mockup_flows', {})
CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

scenes = cfg.get('scenes') or sorted(os.path.basename(os.path.dirname(p)) for p in glob.glob(f'{R}/prd/*/mockup.html'))
if not scenes:
    print('· 목업 흐름 — prd/*/mockup.html 없음, 건너뜀')
    sys.exit(0)
SKIP = cfg.get('skip', [])
CLS = 'sheet|dlg|dialog|modal|toast|alert|mask|scrim|popup|menu|card' + ('|' + cfg['popup_class'] if cfg.get('popup_class') else '')
FLOWS = cfg.get('flows', {})
PFX = cfg.get('case_prefix', 'pc-')

# 오류를 모으는 머리 스크립트 — 장면 스크립트보다 먼저 돈다
HEAD = """<script>window.__err=[];addEventListener('error',e=>__err.push(String(e.message||e.type)+' @'+(e.lineno||'')));
addEventListener('unhandledrejection',e=>__err.push('promise: '+String(e.reason)));const __ce=console.error;console.error=(...a)=>{__err.push('console: '+a.join(' '));__ce.apply(console,a)};</script>"""
TAIL = """<script>const __log=[];const __vis=s=>{const e=document.querySelector(s);if(!e)return false;let a=e;while(a){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05)return false;a=a.parentElement}const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
const __need=(ok,m)=>{if(!ok)__log.push(m)};const __wait=ms=>new Promise(r=>setTimeout(r,ms));
const __done=()=>{const p=document.createElement('pre');p.id='__out';p.textContent=JSON.stringify({err:__err,miss:__log});document.body.appendChild(p)};
setTimeout(async()=>{try{%s}catch(e){__err.push('점검 스크립트: '+e.message)};__done()},900)</script>"""
# 상태 단추를 모두 눌러 보며, 처음엔 숨은 창이 한 번이라도 보였는지 센다. 다른 창이 열려야 열리는 창이 있어 못 연 것이 남으면 한 바퀴 더
STATES = """const __h=e=>{if(e.classList.contains('show'))return false;for(let a=e;a&&a!==document.body;a=a.parentElement){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05)return true}const r=e.getBoundingClientRect();return r.width<2||r.height<2};
const __nm=e=>e.id?'#'+e.id:'.'+String(e.className).trim().split(/\\s+/).join('.');const __ph=document.querySelector('.proto-device')||document.querySelector('.phone')||document.body;
const __cand=[...__ph.querySelectorAll('*')].filter(e=>{if(e.closest('.proto-controls')||SKIP.includes('#'+e.id))return false;const c=getComputedStyle(e);return (c.position==='absolute'||c.position==='fixed')&&+c.zIndex>=10&&__h(e)&&(e.id||new RegExp(CLS).test(e.className))});
const __seen=new Set();
for(let pass=0;pass<2&&(pass===0||__cand.some(e=>!__seen.has(e)));pass++)for(const b of document.querySelectorAll('.proto-controls button')){try{b.click()}catch(e){if(!pass)__err.push('단추 '+b.textContent+': '+e.message)}await __wait(pass?600:250);__cand.forEach(e=>{if(!__h(e))__seen.add(e)})}
[...new Set(__cand.filter(e=>!__seen.has(e)).map(__nm))].forEach(n=>__log.push('프로토타입 단추로 못 여는 창 '+n+' — proto-controls에 그 창을 여는 단추를 더할 것'));"""

# 경우 그림 단추 — 누를 때마다 그 그림만 열리고(다시 누르면 닫힘), 열린 그림이 보이고 비어 있지 않은지
CASES = """const __big=e=>{if(!e)return false;let a=e;while(a){const c=getComputedStyle(a);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05)return false;a=a.parentElement}const r=e.getBoundingClientRect();return r.width>20&&r.height>20};
const __open=()=>[...document.querySelectorAll('[id^="'+PFX+'"]')].filter(__big);
for(const b of document.querySelectorAll('.proto-controls button[data-case]')){const id=b.dataset.case;
 if(__big(document.getElementById(PFX+id))){b.click();await __wait(60)} // 처음부터 열린 그림(단추 class on)은 누르면 닫히므로 먼저 닫고 연다
 b.click();await __wait(60);const f=document.getElementById(PFX+id);
 if(!f){__log.push(id+': 그림 요소 #'+PFX+id+' 없음');continue}
 if(!__big(f))__log.push(id+': 눌러도 그림이 안 보임');else{if(f.querySelectorAll('*').length<2)__log.push(id+': 그림이 비어 있음');const n=__open().length;if(n!==1)__log.push(id+': 열린 그림이 '+n+'개')}
 b.click();await __wait(30)}"""

bad = []
with tempfile.TemporaryDirectory() as d:
    for sc in scenes:
        path = f'{R}/prd/{sc}/mockup.html'
        if not os.path.exists(path):
            bad.append(f'{sc}: 목업 없음({path})')
            continue
        src = open(path).read()
        runs = [('상태 단추', STATES)]
        if 'data-case' in src:
            runs.append(('경우 그림', CASES))
        if sc in FLOWS:
            runs.append(('흐름', open(os.path.join(R, FLOWS[sc])).read()))
        for name, body in runs:
            s = src.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + HEAD, 1) if '<meta charset="utf-8">' in src else HEAD + src
            f = f'{d}/{sc}.html'
            pre = 'const SKIP=' + json.dumps(SKIP) + ';const CLS=' + json.dumps(CLS) + ';const PFX=' + json.dumps(PFX) + ';'
            open(f, 'w').write(s + TAIL % (pre + body))
            # 말풍선이 뜨는 때(가상 시간)에 따라 창이 열리고 닫히는 순서가 달라 가끔 헛걸림(10-27 한배 5번 중 1번) — 걸리면 한 번 더 돌려 두 번 다 걸린 것만 막는다
            for attempt in range(2):
                o = subprocess.run([CH, '--headless=new', '--disable-gpu', '--window-size=440,900', '--virtual-time-budget=90000', '--dump-dom', 'file://' + f],
                                   capture_output=True, text=True, timeout=300).stdout
                m = re.search(r'<pre id="__out">(.*?)</pre>', o, re.S)
                r = json.loads(html.unescape(m.group(1))) if m else None
                if r is not None and not r['err'] and not r['miss']:
                    break
            if r is None:
                bad.append(f'{sc} {name}: 결과를 못 읽음(장면 스크립트가 멈춤, 두 번)')
                continue
            bad += [f'{sc} {name}: 오류 {e}' for e in dict.fromkeys(r['err'])] + [f'{sc} {name}: {x}' for x in r['miss']]
if bad:
    print('❌ 목업 흐름 점검:\n  ' + '\n  '.join(bad))
    sys.exit(1)
print(f'✓ 목업 흐름 — 장면 {len(scenes)}개 상태 단추 JS 오류 0·못 여는 창 0' + (f', 흐름 {len(FLOWS)}개 통과' if FLOWS else ''))
