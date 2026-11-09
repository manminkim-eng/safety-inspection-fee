// 안전점검등 대가 산출기 매뉴얼 화면 캡처 — usage: node capture_sif.js <repoDir> <outDir>
// 해체감리 · RTS · EPI 매뉴얼과 같은 규격: 1440×900 · DSF 1.25 · _marks.json(번호 배지 % 좌표) · _example.json(예제 검증값)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8893;
/* 예제 A = 앱 초기값: 정기안전점검 · 본관동 3,500㎡ 철근콘크리트 업무용 · 2008년 사용승인 · 제경비 110% · 기술료 20% · 만 원 미만 절사
   예제 B = 정밀안전점검 · 같은 구역 5개동(3,000 · 1,500 · 1,500 · 700 · 500㎡) 군집시설물 · 철도운임 편도 25,000원 · 나머지 초기값 */
const FREEZE=`(()=>{const T=new Date(2026,10,9,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear()}catch(e){}})()`;
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__set=(id,v)=>{const e=document.getElementById(id);e.value=String(v);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));};
window.__card=(t)=>{const h=[...document.querySelectorAll('.card-title')].find(e=>__vis(e)&&e.textContent.trim()===t);return h?h.closest('.card'):null;};
window.__ref=(i)=>[...document.querySelectorAll('#tab-reference .ref-block')][i]||null;
window.__find=(sel)=>{
 if(sel.startsWith('card:'))return __card(sel.slice(5));
 if(sel.startsWith('ref:'))return __ref(+sel.slice(4));
 if(sel.startsWith('wrap:')){const e=document.getElementById(sel.slice(5));return e?e.parentElement:null;}
 if(sel.startsWith('a4tbl:')){return document.querySelectorAll('#a4Page table')[+sel.slice(6)]||null;}
 if(sel.startsWith('a4sub:')){return document.querySelectorAll('#a4Page .a4-sub')[+sel.slice(6)]||null;}
 if(sel.startsWith('a4row:')){const [t,r]=sel.slice(6).split('|');const tb=document.querySelectorAll('#a4Page table')[+t];return tb?tb.querySelectorAll('tr')[+r]:null;}
 if(sel.startsWith('itab:')){return [...document.querySelectorAll('.fml-itab')][+sel.slice(5)]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__B=()=>{BLD=[{nm:'본관동',area:3000,st:0,us:0,yr:2008,pv:0},{nm:'별관동',area:1500,st:0,us:0,yr:2008,pv:0},{nm:'교육동',area:1500,st:0,us:0,yr:2008,pv:0},
  {nm:'창고동',area:700,st:0,us:0,yr:2008,pv:0},{nm:'경비동',area:500,st:0,us:0,yr:2008,pv:0}];renderBld();
 document.getElementById('clusterOn').checked=true;__set('task','prec');__set('fare','25,000');__set('projectName','만민캠퍼스 2026년 정밀안전점검');recalc();};`;
const SHOTS=[
 {id:'s01_overview',tab:'input',clip:'viewport',m:[['.tab-bar-inner','작업 탭'],['.sum-bar-wrap','요약 스트립'],['.law-strip','근거 안내'],['.total-banner','실시간 견적금액'],['card:용역 정보','용역 정보'],['card:산출 요율 설정','산출 요율 설정'],['#fab-group','이용방법 · 계산식']]},
 {id:'s02_tabs',tab:'input',clip:'.app-header',union:'.tab-bar',m:[['.tb:nth-of-type(1)','산출 입력'],['.tb:nth-of-type(2)','산출서 미리보기'],['.tb:nth-of-type(3)','법적 근거·기준표'],['.tb-manual','매뉴얼'],['.hdr-right','근거 법령·고시']]},
 {id:'s03_project',tab:'input',clip:'card:용역 정보',m:[['#projectName','용역명'],['#client','관리주체'],['#siteLoc','위치'],['#author','작성자'],['#reportDate','작성일']]},
 {id:'s04_task',tab:'input',clip:'card:과업 구분 · 노임단가',m:[['#task','과업 구분'],['#rateHigh','고급기술자 노임단가'],['#rateHelper','특별인부 노임단가']]},
 {id:'s05_bld',tab:'input',clip:'card:대상 건축물 (동별)',m:[['#b0-nm','동 명칭'],['#b0-area','연면적'],['#b0-st','구조형식'],['#b0-us','용도'],['#b0-yr','사용승인연도'],['#b0-pv','전차보고서'],['#b0-mini','동별 미리 계산'],['.sif-add','동 추가'],['#clusterInfo','적용 인원']]},
 {id:'s06_rate',tab:'input',clip:'card:산출 요율 설정',m:[['#overheadRate','제경비율'],['#overheadCalc','제경비 계산'],['#techFeeRate','기술료율'],['#techFeeCalc','기술료 계산']]},
 {id:'s07_direct',tab:'input',clip:'card:직접경비',m:[['#fare','철도 운임'],['#perDiem','일비 · 식비'],['#lodgeN','숙박'],['#fieldDays','외업 일수'],['#carPrice','차량'],['#dangerRate','위험수당률'],['#machRate','기계 · 기구손료율'],['#printCost','보고서 인쇄비']]},
 {id:'s08_corr',tab:'input',clip:'card:대가 보정',m:[['#complexRate','구조 복잡도'],['#corrInfo','적용 보정비']]},
 {id:'s09_opt',tab:'input',clip:'card:선택과업',m:[['#optDraw','실측도면'],['#optAna','구조해석 · 내진'],['#optEtcList','그 밖의 실비'],['#optInfo','선택과업 합계']]},
 {id:'s10_total',tab:'input',clip:'card:합계 · 계약 확인',m:[['#cutUnit','절사 단위'],['#contractAmt','계약(예정) 공급가액'],['wrap:includeVat','부가가치세'],['#checkInfo','70% 확인']]},
 {id:'s11_banner',tab:'input',clip:'.sum-bar-wrap',union:'.total-banner',m:[['.sum-bar-wrap','요약 스트립'],['.law-strip','근거 안내'],['#banner-desc','과업 · 규모'],['#banner-total','견적금액'],['#banner-sub','공급가액']]},
 {id:'s12_a4',tab:'result',clip:'viewport',m:[['.mm-btn-print','인쇄 / PDF 저장'],['#btn-jpg','JPG 저장'],['#a4Page','A4 산출서']]},
 {id:'s13_a4page',tab:'result',clip:'#a4Page',m:[['a4tbl:0','용역 개요'],['a4tbl:1','대가 총괄표'],['a4sub:1','산출근거 1 기준인원수'],['a4sub:2','산출근거 2 인건비'],['a4sub:3','산출근거 3 직접경비'],['a4sub:4','산출근거 4 보정'],['.a4-law','적용 법령'],['.a4-sign','제출 문구 · 작성자']]},
 {id:'s14_reference',tab:'reference',clip:'#tab-reference',m:[['ref:0','법적 근거'],['ref:1','단가 기준'],['ref:2','별표 22 기준인원수'],['ref:3','별표 23 조정비'],['ref:4','제62조 보정']]},
 {id:'s15_var_input',tab:'input',pre:"__B()",clip:'viewport',m:[['.sum-bar-wrap','요약 스트립'],['.total-banner','견적금액'],['card:대상 건축물 (동별)','5개동 입력']]},
 {id:'s16_var_bld',tab:'input',clip:'card:대상 건축물 (동별)',m:[['#b0-mini','본관동 3,000㎡'],['#b3-mini','창고동 700㎡'],['#b4-mini','경비동 500㎡'],['wrap:clusterOn','군집시설물 적용'],['#clusterInfo','군집 ③ 적용 인원']]},
 {id:'s17_var_a4page',tab:'result',clip:'#a4Page',m:[['a4tbl:2','기준인원수 — 가상 동 · 계수 0.7'],['a4tbl:4','직접경비 — 여비 8인']]},
 {id:'s18_help_howto',tab:'input',pre:"openModal()",wait:1500,fixed:true,clip:'#fmlBox',m:[['itab:0','이용방법'],['itab:1','산정 구조'],['itab:2','보간 · 군집'],['itab:3','핵심 주의사항']]},
 {id:'s19_help_method',tab:null,pre:"document.querySelectorAll('.fml-itab')[1].click();document.querySelector('.fml-bd').scrollTop=0",wait:1500,fixed:true,clip:'#fmlBox',m:[]},
 {id:'s20_help_formula',tab:null,pre:"document.querySelectorAll('.fml-itab')[2].click();document.querySelector('.fml-bd').scrollTop=0",wait:1500,fixed:true,clip:'#fmlBox',m:[]},
 {id:'s21_help_caution',tab:null,pre:"document.querySelectorAll('.fml-itab')[3].click();document.querySelector('.fml-bd').scrollTop=0",wait:1500,fixed:true,post:"closeModal()",clip:'#fmlBox',m:[]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(3000);
 await pg.evaluate(HELP);
 const readEx=()=>pg.evaluate(()=>{const q=id=>((document.getElementById(id)||{}).innerText||'').replace(/\s+/g,' ').trim();const s=window._s||{},C=s.C||{};
  return {banner:q('banner-total'),desc:q('banner-desc'),sub:q('banner-sub'),strip:['task','area','persons','basic','sub','total'].map(k=>q('sb-'+k)),
   mini:BLD.map((b,i)=>q('b'+i+'-mini')),cluster:q('clusterInfo'),corr:q('corrInfo'),over:q('overheadCalc'),tech:q('techFeeCalc'),check:q('checkInfo'),
   s:{task:s.task,taskNm:s.T&&s.T.nm,R:s.R,helper:s.opt&&s.opt.helperRate,oR:s.opt&&s.opt.oR,tR:s.opt&&s.opt.tR,dR:s.opt&&s.opt.dR,fare:s.opt&&s.opt.fare,perDiem:s.opt&&s.opt.perDiem,
    ctype:s.ctype,units:(C.rows||[]).map(u=>({nm:u.nm,area:u.area,adj:u.adj,f:u.f,bAll:u.bAll,bOut:u.bOut,all:u.all,out:u.out})),pAll:C.pAll,pOut:C.pOut,pIn:C.pIn,
    labor:C.labor,over:C.over,tech:C.tech,days:C.days,cars:C.cars,travel:C.travel,stay:C.stay,carHr:C.carHr,carDay:C.carDay,car:C.car,helperAmt:C.helper,outLabor:C.outLabor,danger:C.danger,mach:C.mach,prt:C.prt,exp:C.exp,basic:C.basic,
    cAvg:s.cAvg,cx:s.cx,K:s.K,basicK:s.basicK,corrAmt:s.corrAmt,optSum:s.optSum,sub:s.sub,vat:s.vatAmt,gross:s.gross,cut:s.cut,total:s.total,totalArea:s.totalArea,nb:(s.B||[]).length}};});
 const ex={A:await readEx()};const meta={};
 for(const S of SHOTS){
  if(S.tab){await pg.evaluate(t=>{switchTab(t);window.scrollTo(0,0);},S.tab);await pg.waitForTimeout(600);}
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||700);
  if(S.id==='s15_var_input')ex.B=await readEx();
  if(S.id==='s13_a4page')ex.A_a4=await pg.evaluate(()=>[...document.querySelectorAll('#a4Page table tr')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
  if(S.id==='s17_var_a4page')ex.B_a4=await pg.evaluate(()=>[...document.querySelectorAll('#a4Page table tr')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(a.w/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:c.x-(await pg.evaluate(()=>scrollX)),y:c.y-(await pg.evaluate(()=>scrollY)),width:c.width,height:c.height}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(cl.height),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(500);}
 }
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(3000);
 await mp.screenshot({path:path.join(out,'s22_mobile_main.png')});meta['s22_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{const h=[...document.querySelectorAll('.card-title')].find(e=>e.textContent.trim()==='대상 건축물 (동별)').closest('.card');window.scrollTo(0,h.getBoundingClientRect().top+scrollY-120);});await mp.waitForTimeout(600);
 await mp.screenshot({path:path.join(out,'s23_mobile_input.png')});meta['s23_mobile_input']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{switchTab('result');window.scrollTo(0,0);});await mp.waitForTimeout(900);
 await mp.screenshot({path:path.join(out,'s24_mobile_a4.png')});meta['s24_mobile_a4']={w:390,h:844,marks:[]};
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 console.log(JSON.stringify({A:{banner:ex.A.banner,s:ex.A.s},B:{banner:ex.B&&ex.B.banner,ctype:ex.B&&ex.B.s.ctype,units:ex.B&&ex.B.s.units},miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
