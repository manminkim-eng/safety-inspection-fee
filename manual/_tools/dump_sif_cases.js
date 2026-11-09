// 앱 계산값 덤프 — usage: node dump_sif_cases.js <repoDir> <out.json> [건수=600]
// 무작위 입력(과업 9종 · 1~5동 · 구조/용도/전차보고서 · 사용승인연도 · 요율 · 직접경비 · 보정 · 선택과업 · 절사)을 넣고 window._s 를 기록한다.
// verify_sif_calc.py 가 고시 원문(.md)에서 읽은 기준표로 같은 입력을 독립 재계산해 대조한다.
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]),N=+(process.argv[4]||600),PORT=8897;
const FREEZE=`(()=>{const T=new Date(2026,10,9,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;})()`;
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({serviceWorkers:'block'});await setup(ctx);const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.waitForTimeout(2500);
 const cases=await pg.evaluate((N)=>{
  let seed=20261109;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
  const pick=a=>a[Math.floor(rnd()*a.length)],ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
  const set=(id,v)=>{const e=document.getElementById(id);if(e.type==='checkbox')e.checked=!!v;else e.value=String(v);};
  const res=[];
  for(let k=0;k<N;k++){
   const task=pick(['reg','prec','diag','p1only','p1with','p1use','p2only','p2with','p2use']);
   const nb=k<40?1:ri(1,5);
   const areaOf=()=>pick([()=>ri(100,999),()=>ri(1000,5000),()=>ri(5000,30000),()=>ri(30000,120000),()=>pick([500,1000,3000,5000,10000,30000,50000,100000]),()=>Math.round(rnd()*2000000)/100])();
   BLD=Array.from({length:nb},(_,i)=>({nm:'동'+(i+1),area:areaOf(),st:ri(0,6),us:ri(0,4),yr:pick([0,ri(1955,2025)]),pv:ri(0,2)}));
   renderBld();
   set('task',task);onTaskChange();
   set('rateHigh',pick([310884,ri(250000,400000)]).toLocaleString());set('rateHelper',pick([228717,ri(150000,300000)]).toLocaleString());
   set('clusterOn',rnd()<0.7);
   set('overheadRate',ri(110,120));set('techFeeRate',ri(20,40));set('dangerRate',ri(10,20));
   set('fare',pick([0,ri(5000,60000)]).toLocaleString());set('perDiem',pick([50000,ri(20000,60000)]).toLocaleString());
   set('lodgeN',pick([0,ri(1,12)]));set('lodgeRate',pick([70000,ri(50000,100000)]).toLocaleString());
   set('fieldDays',pick(['',ri(1,15)]));set('carPrice',pick([10000000,ri(5000000,40000000)]).toLocaleString());
   set('carHours',pick([0,1,1.5,2,3]));set('fuelPrice',pick([1400,ri(1200,2000)]).toLocaleString());
   if(rnd()<0.3)set('machRate',ri(0,15));if(rnd()<0.3)set('printCost',ri(0,800000).toLocaleString());
   set('complexRate',ri(-15,15));
   set('optDraw',pick(['0','0','10','20']));set('optAna',pick(['none','none','struct','seis1','seis2']));set('anaType',pick(['rc','pc','sp']));
   set('anaArea',pick(['',ri(1000,120000)]));set('seisMul',pick([2.5,2.7,3.0]));
   for(let i=0;i<3;i++){set('oe'+i+'-it',rnd()<0.2?'지질조사':'');set('oe'+i+'-amt',rnd()<0.5?ri(0,3000000).toLocaleString():'');}
   set('cutUnit',pick(['1','1000','10000']));set('includeVat',rnd()<0.8);
   recalc();
   const S=window._s,C=S.C;
   const raw=id=>document.getElementById(id).value;
   res.push({in:{task,bld:BLD.map(b=>({...b})),R:S.R,helper:S.opt.helperRate,cluster:document.getElementById('clusterOn').checked,oR:S.opt.oR,tR:S.opt.tR,dR:S.opt.dR,mR:S.opt.mR,
     fare:S.opt.fare,perDiem:S.opt.perDiem,lodgeN:S.opt.lodgeN,lodgeRate:S.opt.lodgeRate,days:S.opt.days,carPrice:S.opt.carPrice,carHours:S.opt.carHours,fuel:S.opt.fuel,prt:S.opt.prt,
     cx:S.cx,draw:+raw('optDraw'),ana:raw('optAna'),anaType:raw('anaType'),anaArea:raw('anaArea'),seisMul:raw('seisMul'),
     etc:[0,1,2].map(i=>({it:raw('oe'+i+'-it'),amt:+(raw('oe'+i+'-amt')||'0').replace(/,/g,'')})),cut:S.cut,vat:S.vatOn,repYear:2026},
    out:C?{ctype:S.ctype,units:C.rows.map(u=>({area:u.area,adj:u.adj,f:u.f,all:u.all,out:u.out})),pAll:C.pAll,pOut:C.pOut,labor:C.labor,over:C.over,tech:C.tech,days:C.days,cars:C.cars,
     travel:C.travel,stay:C.stay,car:C.car,helper:C.helper,danger:C.danger,mach:C.mach,prt:C.prt,exp:C.exp,basic:C.basic,cAvg:S.cAvg,K:S.K,basicK:S.basicK,
     opt:S.oRows.map(r=>r.amt),optSum:S.optSum,sub:S.sub,vat:S.vatAmt,gross:S.gross,total:S.total}:null});
  }
  return res;},N);
 const consts=await pg.evaluate(()=>({P_TBL,STRUCT,USE,PREV,ANA_TBL,TASK:Object.fromEntries(Object.entries(TASK).map(([k,v])=>[k,{trv:v.trv,mach:v.mach,prt:v.prt}])),CAR_K}));
 fs.writeFileSync(out,JSON.stringify({consts,cases,errs},null,0));
 console.log('cases',cases.length,'errs',errs.length);await b.close();s.close();
})();
