// Sanity-checks the recipe library: node tools/validate-recipes.js
const fs=require("fs"),path=require("path"),vm=require("vm");
const dir=path.join(__dirname,"..","recipes");
// Load the recipe files in the same order index.html does.
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const order=[...html.matchAll(/<script src="recipes\/([^"]+)"/g)].map(m=>m[1]);
const ctx={};vm.createContext(ctx);
const errs=[],warn=[],ids=new Set();
let seenKeys=null;
for(const f of order){
  vm.runInContext(fs.readFileSync(path.join(dir,f),"utf8")+"\n;this.TJ=TJ;this.KINDS=KINDS;this.RECIPES=RECIPES;",ctx,{filename:f});
  if(f==="catalog.js")seenKeys=new Set(Object.keys(ctx.TJ));
  if(f==="catalog-more.js"){
    const src=fs.readFileSync(path.join(dir,f),"utf8");
    for(const m of src.matchAll(/^ (\w+):P\(/gm))if(seenKeys.has(m[1]))errs.push(`catalog-more redefines ${m[1]}`);
  }
}
const {TJ,KINDS,RECIPES}=ctx;
const CUI=[...html.matchAll(/\{id:"(\w+)",name:/g)].map(m=>m[1]);
const TAGS=["veg","freezer","onepot","ip","slow","spicy","cozy","sick","light","cold","nocook","fresh"];
for(const k in TJ){const p=TJ[k];if(p.sub&&!TJ[p.sub])errs.push(`catalog ${k}: sub ${p.sub} missing`);if(p.sub&&TJ[p.sub].s)warn.push(`catalog ${k}: sub ${p.sub} is itself seasonal`);}
for(const r of RECIPES){
  const at=`${r.id} ${r.name}`;
  if(ids.has(r.id))errs.push(`${at}: duplicate id`);ids.add(r.id);
  if(!CUI.includes(r.cu))errs.push(`${at}: bad cuisine ${r.cu}`);
  if(!KINDS[r.kind])errs.push(`${at}: bad kind ${r.kind}`);
  for(const t of r.tags||[])if(!TAGS.includes(t))errs.push(`${at}: bad tag ${t}`);
  for(const k of ["min","serves","cal","p","c","f","keeps"])if(typeof r[k]!=="number"||r[k]<=0)errs.push(`${at}: bad ${k}`);
  for(const x of r.ing){if(!TJ[x[0]])errs.push(`${at}: unknown ingredient ${x[0]}`);if(!(x[1]>0))errs.push(`${at}: bad qty for ${x[0]}`);}
  if(!r.steps||!r.steps.length)errs.push(`${at}: no steps`);
  const kc=r.p*4+r.c*4+r.f*9;if(Math.abs(kc-r.cal)/r.cal>.12)warn.push(`${at}: macros sum to ${kc} kcal vs ${r.cal}`);
  if(r.tags.includes("veg")&&r.ing.some(x=>TJ[x[0]]&&TJ[x[0]].a==="meat"))errs.push(`${at}: tagged veg but uses meat`);
  if(r.tags.includes("veg")&&r.ing.some(x=>["broth","fishsauce","oystersauce","smokedsalmon","tuna","tunawater","tinsalmon","trout","sardines","prosciutto","salame","deliturkey","chorizo","cookedshrimp","shrimp","salmon","cod","ahi","mahi","tilapia","salmonburger","turkburger","chickmeatball","turkmeatball","cranmeatball","soupdump","porkdump","chickgyoza","wontons","orangechicken","lasagnasoup","wbchili","redcurrysoup"].includes(x[0])))errs.push(`${at}: tagged veg but uses meat or fish`);
  if(r.tags.includes("nocook")&&r.min>25)warn.push(`${at}: no-cook but ${r.min} min`);
}
const by=(f)=>RECIPES.reduce((m,r)=>{const k=f(r);m[k]=(m[k]||0)+1;return m;},{});
console.log(`${RECIPES.length} recipes, ${Object.keys(TJ).length} catalog items`);
console.log("by kind",by(r=>r.kind));console.log("by cuisine",by(r=>r.cu));
const used=new Set(RECIPES.flatMap(r=>r.ing.map(x=>x[0])));
const unused=Object.keys(TJ).filter(k=>!used.has(k));if(unused.length)console.log("unused catalog:",unused.join(", "));
warn.forEach(w=>console.log("WARN",w));errs.forEach(e=>console.log("ERR ",e));
process.exit(errs.length?1:0);
