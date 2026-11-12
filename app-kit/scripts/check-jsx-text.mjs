#!/usr/bin/env node
// 글자를 그리지 않는 부품(View·Pressable 등) 안에 글자 노드가 들어가는 곳을 찾는다.
// React Native는 그런 곳에서 "Text strings must be rendered within a <Text> component"로 멈춘다(개발 판은 빨간 줄, 출시 판은 앱이 죽을 수 있음).
// 잡는 꼴 ① 여는·닫는 태그와 {/* 주석 */}·{식} 사이에 같은 줄 공백(줄바꿈 없는 공백은 JSX가 글자로 남김)  ② View 안에 바로 적은 글자
//         ③ {수 && <X/>}·{글자 변수}처럼 식의 타입에 숫자·빈 글자가 아닌 문자열이 섞인 자식(0은 "0"으로 그려진다)
// 쓰기: node impl/scripts/check-jsx-text.mjs [--survey]   (종료 코드 0 = 없음, 1 = 있음)
// 공용 원본 ihwa-site/app-kit/scripts/check-jsx-text.mjs — 앱마다 impl/scripts/에 글자 그대로 복사하고 check-docs-sync.sh에서 부른다(11-13 맵나이츠 58d78dd·0a7dda3발).
// 앱 값은 prd/prototype/screens.json "textComponents": ["부품 이름", …]만 — 자식을 ReactNode로 받아 스스로 Text에 담는 부품(맵나이츠 SecHead 등).
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
// 앱 코드 폴더: impl/app 또는 impl/ios 중 tsconfig.json이 있는 곳(APP_DIR로 바꿔 시험)
const app = process.env.APP_DIR || ['app', 'ios'].map((d) => path.resolve(here, '..', d)).find((d) => fs.existsSync(path.join(d, 'tsconfig.json'))) || path.resolve(here, '..', 'app')
const root = path.resolve(app, '..', '..')
const ts = createRequire(path.join(app, 'package.json'))('typescript')

// 자식 글자를 스스로 Text에 담아 그리는 부품(이 안의 글자는 괜찮다).
// 이름이 Text로 끝나는 것과, children을 글자·숫자로만 선언한 부품({ children: string })은 자동으로 알아본다 — children: ReactNode로 받아 Text에 담는 부품만 여기에 이름을 적는다.
// SVG 글자(TSpan·TextPath)도 글자를 그린다. TextProps(numberOfLines)를 받는 래퍼(차곡 <T> 등)는 자동으로 알아본다.
let extra = []
try { extra = JSON.parse(fs.readFileSync(path.join(root, 'prd', 'prototype', 'screens.json'), 'utf8')).textComponents || [] } catch {}
const TEXTY = new Set(['Text', 'TextInput', 'Animated.Text', 'TSpan', 'TextPath', ...extra])

const cfg = ts.getParsedCommandLineOfConfigFile(path.join(app, 'tsconfig.json'), {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n')) },
})
const program = ts.createProgram(cfg.fileNames, cfg.options)
const checker = program.getTypeChecker()
const survey = process.argv.includes('--survey')

const F = ts.TypeFlags
function stringy(t) {
  if (t.flags & (F.Any | F.Unknown | F.Never)) return false
  if (t.isUnion()) return t.types.some(stringy)
  if (t.isStringLiteral()) return t.value !== ''          // 빈 글자는 React가 그리지 않는다
  return !!(t.flags & (F.StringLike | F.NumberLike | F.BigIntLike))
}
// 자식을 그대로 넘겨받는 값(children: ReactNode)은 부르는 쪽에서 본다
const passthrough = (t) => /ReactNode|ReactPortal|Iterable</.test(checker.typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation))

// 부품의 children 선언이 글자·숫자뿐인가(그 부품이 스스로 Text에 담는다고 본다)
function textChildrenOnly(opening) {
  const sig = checker.getResolvedSignature(opening)
  if (!sig || !sig.parameters.length) return false
  const props = checker.getTypeOfSymbolAtLocation(sig.parameters[0], opening)
  if (props.getProperty('numberOfLines') && props.getProperty('allowFontScaling')) return true   // TextProps를 그대로 받는 Text 래퍼
  const ch = props.getProperty('children')
  if (!ch) return false
  const t = checker.getTypeOfSymbolAtLocation(ch, opening)
  return (t.isUnion() ? t.types : [t]).every((p) => p.flags & (F.StringLike | F.NumberLike | F.Undefined | F.Null))
}
const texty = (node, name) => TEXTY.has(name) || /Text$/.test(name) || (ts.isJsxElement(node) && /^[A-Z]/.test(name) && textChildrenOnly(node.openingElement))

const found = []
const seen = new Map()
for (const sf of program.getSourceFiles()) {
  if (sf.isDeclarationFile || !sf.fileName.endsWith('.tsx') || sf.fileName.includes('/node_modules/')) continue
  const rel = path.relative(root, sf.fileName)
  const at = (node) => { const p = sf.getLineAndCharacterOfPosition(ts.isJsxText(node) ? node.pos : node.getStart(sf)); return `${rel}:${p.line + 1}` }
  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxFragment(node)) {
      const name = ts.isJsxElement(node) ? node.openingElement.tagName.getText(sf) : '<>'
      if (!texty(node, name)) {
        for (const ch of node.children) {
          if (ts.isJsxText(ch)) {
            if (ch.containsOnlyTriviaWhiteSpaces) continue
            const raw = ch.text
            found.push(`${at(ch)}  <${name}> 안에 글자 노드 ${JSON.stringify(raw.length > 30 ? raw.slice(0, 30) + '…' : raw)}`)
            seen.set(name, (seen.get(name) || 0) + 1)
          } else if (ts.isJsxExpression(ch) && ch.expression) {
            const t = checker.getTypeAtLocation(ch.expression)
            if (passthrough(t) || !stringy(t)) continue
            found.push(`${at(ch)}  <${name}> 안의 식이 글자·숫자일 수 있음: {${ch.expression.getText(sf).replace(/\s+/g, ' ').slice(0, 60)}} — 타입 ${checker.typeToString(t).slice(0, 60)}`)
            seen.set(name, (seen.get(name) || 0) + 1)
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}
if (survey) console.log('부품별 건수:', JSON.stringify(Object.fromEntries([...seen].sort((a, b) => b[1] - a[1]))))
if (found.length) {
  console.log(`✗ 글자를 그리지 않는 부품 안의 글자 노드 ${found.length}곳`)
  for (const f of found) console.log('  ' + f)
  console.log('  고치는 법: 주석은 제 줄로, 글자는 <Text>로, {수 && …}는 {수 > 0 && …}로. 자식 글자를 스스로 Text에 담는 부품이면 prd/prototype/screens.json "textComponents"에 이름을 더한다.')
  process.exit(1)
}
console.log('✓ 글자를 그리지 않는 부품 안에 글자 노드 없음')
