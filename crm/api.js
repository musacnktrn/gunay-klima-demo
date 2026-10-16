// ureten: codex. Explicit browser-only DEMO; never connects to the real CRM.
(()=>{
 const base=new URL('../',document.currentScript.src),apiPrefix=new URL('demo-api/',base).href;
 const nativeFetch=window.fetch.bind(window);let pending;
 const walk=(x,fn)=>typeof x==='string'?fn(x):Array.isArray(x)?x.map(v=>walk(v,fn)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,walk(v,fn)])):x;
 const display=x=>walk(x,s=>s.startsWith('/assets/')?base.pathname+s.slice(1):s);
 const normalize=x=>walk(x,s=>s.startsWith(base.pathname+'assets/')?'/'+s.slice(base.pathname.length):s);
 const ready=(async()=>{
  const [engine,response]=await Promise.all([import(new URL('demo/engine.mjs',base)),nativeFetch(new URL('demo/seed.json',base))]);
  if(!response.ok)throw Error('Demo verileri yüklenemedi.');
  const seed=await response.json(),today=engine.todayTR(),delta=(Date.parse(today)-Date.parse(seed.today))/86400000;
  const shifted=walk(seed,s=>/^\d{4}-\d{2}-\d{2}$/.test(s)?new Date(Date.parse(s)+delta*86400000).toISOString().slice(0,10):s);shifted.today=today;
  const database=await new Promise((resolve,reject)=>{const r=indexedDB.open('gunay-pages-demo-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('demo');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  return {engine,seed:shifted,database};
 })();
 async function transaction(fn){const {database,seed,engine}=await ready;return new Promise((resolve,reject)=>{
  const tx=database.transaction('demo','readwrite'),store=tx.objectStore('demo'),q=store.get('state');let result;
  q.onsuccess=()=>{try{const state=q.result||{db:structuredClone(seed),revision:0,receipts:[],audit:[]};state.db.today=engine.todayTR();result=fn(state,engine);store.put(state,'state');}catch(e){tx.abort();reject(e);}};
  tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||Error('Demo kaydı bu tarayıcıya yazılamadı.'));tx.onabort=()=>reject(tx.error||Error('Demo işlemi iptal edildi.'));
 });}
 const state=()=>transaction(s=>display({ok:true,db:s.db,revision:s.revision,workspace:'demo'}));
 const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json'}});
 async function run(input){return transaction((s,engine)=>{
  const key=JSON.stringify({op:input.op,payload:input.payload}),old=s.receipts.find(x=>x.id===input.requestId);
  if(old)return old.key===key?display({...old.result,ok:true,replayed:true,db:s.db,revision:s.revision}):{ok:false,status:409,error:'İşlem kimliği farklı veriyle tekrar kullanıldı.'};
  if(input.revision!==s.revision)return display({ok:false,status:409,error:'Başka bir sekme demoyu güncelledi. Formu kontrol edip tekrar kaydedin.',db:s.db,revision:s.revision});
  const payload=normalize(input.payload),photos=new Map();
  // Local demo photos remain in IndexedDB. Server validators still see a permitted image path.
  if(input.op==='saveProduct'&&payload.img?.startsWith('data:image/')){photos.set('new',payload.img);payload.img='/assets/demo-photo.png';}
  if(input.op==='restoreBackup')for(const p of payload.backup?.db?.products||[])if(p.img?.startsWith('data:image/')){photos.set(p.id,p.img);p.img='/assets/demo-photo.png';}
  const r=engine.execute(s.db,input.op,payload);if(!r.ok)return {...r,status:422};
  if(input.op==='saveProduct'&&photos.has('new'))r.db.products.find(p=>p.id===r.id).img=photos.get('new');
  if(input.op==='restoreBackup')for(const p of r.db.products)if(photos.has(p.id))p.img=photos.get(p.id);
  s.db=r.db;s.revision++;const result=Object.fromEntries(Object.entries(r).filter(([k])=>k!=='db'));
  s.receipts.push({id:input.requestId,key,result});s.receipts=s.receipts.slice(-200);
  s.audit.unshift({revision:s.revision,operation:input.op,actor:'Bu tarayıcıdaki demo',createdAt:new Date().toISOString()});s.audit=s.audit.slice(0,200);
  return display({...r,revision:s.revision});
 });}
 async function upload(file){
  if(!file||file.size<12||file.size>5*1024*1024)return {ok:false,error:'JPG, PNG veya WEBP dosyası seçin (en fazla 5 MB).'};
  const bytes=new Uint8Array(await file.arrayBuffer()),magic=Array.from(bytes.slice(0,8)).join(','),str=new TextDecoder().decode(bytes.slice(0,12));
  const type=magic==='137,80,78,71,13,10,26,10'?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':str.startsWith('RIFF')&&str.slice(8)==='WEBP'?'image/webp':null;
  if(!type)return {ok:false,error:'Dosya gerçek JPG, PNG veya WEBP olmalı.'};
  const url=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(new Blob([bytes],{type}));});return {ok:true,url};
 }
 const backup=()=>transaction(s=>({format:'gunay-crm-v1',workspace:'demo',exportedAt:new Date().toISOString(),db:s.db,revision:s.revision}));
 window.fetch=async(input,options)=>{const url=new URL(typeof input==='string'||input instanceof URL?input:input.url,location.href);if(!url.href.startsWith(apiPrefix))return nativeFetch(input,options);
  const p=url.pathname.slice(new URL(apiPrefix).pathname.length);if(p==='state')return json(await state());if(p==='audit')return json(await transaction(s=>({ok:true,rows:s.audit})));if(p==='backup')return json(await backup());return json({ok:false,error:'Demo işlemi yok.'},404);
 };
 window.GKApi={space:'demo',path:p=>apiPrefix+p,state,
  async action(op,payload,revision){const key=JSON.stringify({op,payload});if(!pending||pending.key!==key)pending={key,requestId:crypto.randomUUID(),revision};try{const r=await run({op,payload,revision:pending.revision,requestId:pending.requestId});if(r.ok||r.status<500)pending=null;return r;}catch(e){throw Error('Bu tarayıcıya kayıt yapılamadı. '+e.message);}},
  upload,
  async switchSpace(){if(!confirm('Yalnız bu tarayıcıdaki demo değişiklikleri sıfırlansın mı?'))return;const {seed}=await ready;await transaction(s=>{s.db=structuredClone(seed);s.revision++;s.receipts=[];s.audit=[];});location.reload();},
  tools:section=>{location.href=new URL('crm/tools.html?space=demo&section='+encodeURIComponent(section||''),base);},
  icsText:v=>String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'),
  csvCell:v=>'"'+String(v??'').replace(/^[\s]*[=+\-@\t\r]/,m=>"'"+m).replace(/"/g,'""')+'"'
 };
 window.addEventListener('beforeunload',e=>{if(pending){e.preventDefault();e.returnValue='';}});
 document.addEventListener('DOMContentLoaded',()=>{const a=document.getElementById('backup');if(a)a.onclick=async e=>{e.preventDefault();const url=URL.createObjectURL(new Blob([JSON.stringify(await backup(),null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='gunay-tarayici-demo-yedegi.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};});
})();
