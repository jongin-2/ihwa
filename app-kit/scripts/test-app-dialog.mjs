// 공용 AppDialog unhyphenFitting 시험(11-22) — node app-kit/scripts/test-app-dialog.mjs app-kit/AppDialog.tsx, 종료 코드 0이면 통과. fr 'Supprimer'(AX5 한 줄 폭 초과)는 하이픈을 남긴다.
import fs from 'fs';
const src=fs.readFileSync(process.argv[2],'utf8');
const wide=src.match(/const WIDE = (\/.*\/);/)[1];
const fn=src.match(/export function unhyphenFitting[\s\S]*?\n}\n/)[0].replace('export ','').replace(/: string|: number/g,'').replace(/\(w\)/,'(w)');
const f=new Function(`const WIDE=${wide};${fn};return unhyphenFitting;`)();
const S='­';
const cases=[[`Konto lö${S}schen?`,19*2.65,289,'Konto löschen?'],[`Konto${S}lö${S}schungs${S}bestä${S}ti${S}gung`,19*2.65,289,null],[`Supp${S}ri${S}mer le compte ?`,19*2.65,289,null],[`Удалить ак${S}ка${S}унт?`,19*1,289,'Удалить аккаунт?'],['계정을 삭제할까요?',50,289,'계정을 삭제할까요?']];
let bad=0;for(const [t,px,w,exp] of cases){const r=f(t,px,w);const ok=exp===null?r.includes(S):r===exp;if(!ok)bad++;console.log(ok?'통과':'실패',JSON.stringify(r.replace(/­/g,'~')));}
process.exit(bad);
