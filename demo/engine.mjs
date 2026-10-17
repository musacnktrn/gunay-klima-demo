// ureten: codex. Authoritative validation for the imported Claude Design domain.
import { GK } from './rules.mjs';
export { GK };
export const todayTR = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
class Invalid extends Error { constructor(message,field){super(message);this.fields=field?{[field]:message}:{};} }
const check=(ok,message,field)=>{if(!ok)throw new Invalid(message,field);};
const text=(v)=>typeof v==='string'?v.trim():'';
const pick=(o,keys)=>Object.fromEntries(keys.split(' ').filter(k=>Object.hasOwn(o,k)).map(k=>[k,o[k]]));
const member=(db,table,id,field='id')=>{const x=db[table].find(x=>x.id===id);check(x,'İlgili kayıt bulunamadı. Sayfayı yenileyip tekrar deneyin.',field);return x;};
const date=(s,field='date')=>{check(typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s,'Geçerli bir tarih girin.',field);};
const money=(v,field,formatted=false,nullable=true)=>{if(v==null||v===''){check(nullable,'Tutar gerekli.',field);return null;}const n=formatted?GK.P.num(v):Number(v);check(Number.isFinite(n)&&n>=0&&n<=1e10&&Math.abs(n*100-Math.round(n*100))<0.001,'Tutar sıfır veya pozitif olmalı ve en fazla iki kuruş hanesi içermeli.',field);return n;};
const integer=(v,min,max,field)=>check(Number.isInteger(Number(v))&&Number(v)>=min&&Number(v)<=max,`${min}–${max} arasında tam sayı girin.`,field);
function scan(v,depth=0){check(depth<12,'Kayıt iç içe çok fazla alan içeriyor.');if(typeof v==='number')check(Number.isFinite(v),'Geçersiz sayı.');if(typeof v==='string')check(v.length<=10000,'Alan en fazla 10.000 karakter olabilir.');if(Array.isArray(v)){check(v.length<=5000,'Tek işlemde çok fazla kayıt var.');v.forEach(x=>scan(x,depth+1));}else if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)){check(!['__proto__','constructor','prototype'].includes(k),'Geçersiz alan.');scan(x,depth+1);}}
function addressFields(f,prefix=''){
 const structured=f.street!==undefined;
 if(structured){f.line=GK.R.composeLine(f);f.city=f.il;f.buildingNo=f.no;f.doorNo=f.door;}
 const key=k=>prefix+(structured?({line:'street',city:'il',buildingNo:'no',doorNo:'door'}[k]||k):k);
 check(text(structured?f.street:f.line).length>=3,'Sokak/cadde bilgisini içeren açık adresi yazın.',key('line'));
 check(text(f.mah).length>=2,'Mahalleyi yazın.',key('mah'));check(text(f.ilce).length>=2,'İlçeyi yazın.',key('ilce'));check(text(f.city).length>=2,'İli yazın.',key('city'));
 check(text(f.buildingNo),'Bina numarası gerekli.',key('buildingNo'));check(text(f.doorNo),'Daire/iş yeri kapı numarası gerekli; yoksa “Müstakil” yazın.',key('doorNo'));
}
function variant(db,f,field='variant',required=true){const p=member(db,'products',f.productId,field),vs=p.variants||[];if(f.variant)check(vs.some(v=>v.name===f.variant),'Bu modelde seçilen renk / varyasyon yok.',field);else if(required&&vs.length)check(false,'Renk / varyasyon seçin.',field);}

function relation(db,f){const c=member(db,'customers',f.customerId,'customerId');check(c.active!==false,'Pasif müşteri için yeni işlem açılamaz.','customerId');const a=member(db,'addresses',f.addressId,'addressId');check(a.customerId===c.id,'Adres bu müşteriye ait değil.','addressId');return a;}
function interval(f){if(f.interval!=null&&f.interval!=='')integer(f.interval,1,120,'interval');if(f.manualNext)date(f.manualNext,'manualNext');}
function technician(db,id,field){const t=member(db,'staff',id,field);check(t.active,'Pasif personel seçilemez.',field);return t;}
const openWO=(db,id)=>{const w=member(db,'workOrders',id);check(['planlandi','islemde'].includes(w.status),'Bu iş emri kapalı; tekrar işlenemez.');return w;};
const deviceKeys='id customerId addressId productId externalModel variant room serialIn serialOut system installDate installBy installByText interval baseRule manualNext manualReason note fromGunay';
function ensureStock(db){for(const p of db.products)for(const w of db.depots){const s=GK.R.stock(db,p.id,w.id);check(s.physical>=0&&s.avail>=0,'Stok yetersiz: onay veya hareket bütün kalemlerle birlikte değerlendirildi.','stock');for(const v of p.variants||[]){const sv=GK.R.stock(db,p.id,w.id,v.name);check(sv.physical>=0&&sv.avail>=0,'Seçilen renk / varyasyon için stok yetersiz.','stock');}}}
export function execute(db,operation,payload){
 try {
  check(Object.hasOwn(GK.ops,operation)||['saveBusiness','importCustomers','restoreBackup'].includes(operation),'Bilinmeyen işlem.');scan(payload);
  let f=structuredClone(payload??{});const oldDB=db;db=structuredClone(db);
  if(operation==='restoreBackup')return restore(db,f);
  if(operation==='importCustomers'){
   check(Array.isArray(f.rows)&&f.rows.length>0&&f.rows.length<=100,'1–100 müşteri satırı seçin.');let ids=[];
   for(let i=0;i<f.rows.length;i++){const r=execute(db,'saveCustomerFull',{...f.rows[i],dupOk:false});if(!r.ok)return {...r,error:`Satır ${i+2}: ${r.error}`};db=r.db;ids.push(r.id);}return {ok:true,db,count:ids.length};
  }
  if(operation==='saveBusiness'){
   check(text(f.name),'İşletme adı gerekli.','name');if(f.web)check(/^https:\/\//.test(f.web),'Web adresi https:// ile başlamalı.','web');
   return {ok:true,db:{...db,business:{...db.business,...pick(f,'name phone address web instagram desc')}}};
  }
  const customers=['saveCustomerFull','saveCustomer'];
  if(customers.includes(operation)){
   if(f.id)member(db,'customers',f.id);else {
    if(!Object.hasOwn(f,'addrs')){addressFields(f);f.addrs=[pick(f,'label line mah ilce city buildingNo doorNo lat lng')];}
    check(Array.isArray(f.addrs)&&f.addrs.length>0&&f.addrs.length<=20,'En az bir tam adres girin.','addrs');f.withAddr=true;
    f.addrs.forEach((a,i)=>addressFields(a,'a'+i+'_'));
    check(!GK.R.dupes(db,{...f,line:f.addrs[0].line}).some(x=>x.score>=3)||f.dupOk===true,'Benzer müşteri var; mevcut kaydı açın ya da ayrı kişi olduğunu onaylayın.','dupOk');
    if(f.withDevice)f.devs=[...(f.devs||[]),{productId:f.firstProductId||null,externalModel:f.firstExternalModel||'',room:f.firstRoom,serialIn:f.firstSerial,addrIdx:0}];
    check(!f.devs||Array.isArray(f.devs),'Klima satırlarını kontrol edin.','devs');
    for(const d of f.devs||[]){integer(d.addrIdx||0,0,f.addrs.length-1,'devs');check(text(d.room),'Her klima için oda / konum yazın.','devs');if(d.productId)variant(db,d,'devs',false);else check(text(d.externalModel),'Her klima için model seçin veya katalog dışı model yazın.','devs');}
   }
   check(['Kişi','Firma'].includes(f.type),'Müşteri türünü seçin.','type');check(['bilinmiyor','izinli','istemiyor'].includes(f.contact||'bilinmiyor'),'İletişim tercihini kontrol edin.','contact');
   operation='saveCustomerFull';
  }
  if(['flagCustomer','clearFlag'].includes(operation))member(db,'customers',f.id);
  if(operation==='archiveCustomer'){member(db,'customers',f);check(!db.workOrders.some(w=>w.customerId===f&&['planlandi','islemde'].includes(w.status)),'Müşterinin açık işleri var; önce tamamlayın veya gerekçeyle iptal edin.');check(!db.sales.some(s=>s.customerId===f&&s.status==='onayli'&&(GK.R.saleTotals(db,s).balance>0||s.lines.some(l=>l.installed<l.qty))),'Açık satış, montaj veya bakiye varken müşteri pasife alınamaz.');}
  if(operation==='saveAddress'){
   member(db,'customers',f.customerId,'customerId');addressFields(f);if(f.id)check(member(db,'addresses',f.id).customerId===f.customerId,'Adres başka müşteriye taşınamaz.');
  }
  if(operation==='saveDevice'){
   f=pick(f,deviceKeys);relation(db,f);interval(f);if(f.productId)variant(db,f,'variant',false);check(text(f.room),'Oda / cihaz konumunu yazın.','room');
   if(f.installDate)date(f.installDate,'installDate');if(f.installBy)technician(db,f.installBy,'installBy');
   if(f.id){const prev=member(db,'devices',f.id);check(prev.customerId===f.customerId,'Cihaz başka müşteriye taşınamaz.');if(prev.saleId){check(prev.productId===f.productId&&prev.addressId===f.addressId&&(prev.variant||'')===(f.variant||''),'Satışa bağlı cihazın modeli/adresi bu formdan değiştirilemez.');f={...f,saleId:prev.saleId,lineId:prev.lineId,fromGunay:prev.fromGunay,installDate:prev.installDate,installBy:prev.installBy};}}
  }
  if(operation==='saveWO'){
   money(f.price,'price',true);if(f.price!=null&&f.price!=='')check(['kesin','tahmini'].includes(f.priceKind||'kesin'),'Ücret türünü seçin.','priceKind');relation(db,f);date(f.date);check(['bakim','ariza','kontrol','montaj','gorusme'].includes(f.type),'İş türü geçersiz.','type');
   const t=technician(db,f.techId,'techId');check(/^([01]\d|2[0-3]):[0-5]\d$/.test(f.start||''),'Geçerli saat girin.','start');integer(f.dur,15,720,'dur');integer(f.buffer||0,0,240,'buffer');
   const start=GK.D.toMin(f.start),end=start+Number(f.dur)+Number(f.buffer||0);check(end<=1440,'Randevu gece yarısını aşamaz.','dur');
   if(t.hours){check(start>=GK.D.toMin(t.hours.start)&&end<=GK.D.toMin(t.hours.end),'Randevu personelin mesai saatleri dışında.','start');const b=t.hours.brk;if(b?.length===2)check(end<=GK.D.toMin(b[0])||start>=GK.D.toMin(b[1]),'Randevu personelin molasıyla çakışıyor.','start');}
   if(f.id)openWO(db,f.id);check(!GK.R.conflicts(db,f).length,'Teknisyenin bu saatlerde başka işi var; saat değiştirin.','start');f.override=false;
   check(Array.isArray(f.deviceIds??[]),'Cihaz seçimini kontrol edin.','deviceIds');check(new Set(f.deviceIds||[]).size===(f.deviceIds||[]).length,'Aynı cihaz iki kez seçilemez.','deviceIds');
   for(const id of f.deviceIds||[]){const d=member(db,'devices',id,'deviceIds');check(d.customerId===f.customerId&&d.addressId===f.addressId,'Seçilen cihaz müşteri/adrese ait değil.','deviceIds');}
   if(f.type==='montaj'){const s=member(db,'sales',f.saleId,'saleId');check(s.status==='onayli'&&s.customerId===f.customerId&&s.addressId===f.addressId,'Montaj için bu adreste onaylı satış gerekli.');const l=s.lines.find(l=>l.id===f.lineId);check(l&&l.installed<l.qty,'Montaj bekleyen kalem seçin.','lineId');}
  }
  if(operation==='startWO'){const w=openWO(db,f);check(w.status==='planlandi','İş zaten başlatılmış.');check(w.date<=db.today,'İleri tarihli iş başlatılamaz.');}
  if(operation==='cancelWO')openWO(db,f.id);
  if(operation==='completeWO'){
   const w=openWO(db,f.id);check(w.type!=='montaj','Montajı satış kaleminden tamamlayın.');date(f.date);check(f.date>=w.date,'Tamamlanma planlanan tarihten önce olamaz.','date');technician(db,f.by,'by');money(f.fee,'fee',true);
   check(Array.isArray(f.items)&&f.items.length===w.deviceIds.length&&new Set(f.items.map(i=>i.deviceId)).size===f.items.length&&f.items.every(i=>w.deviceIds.includes(i.deviceId)),'Yalnız iş emrine bağlı cihazları birer kez değerlendirin.','items');
   for(const i of f.items){check(typeof i.done==='boolean','Cihazın işlem durumunu seçin.','items');check(text(i.done?i.action:i.reason),i.done?'Yapılan işlemi yazın.':'Yapılmama gerekçesini yazın.','items');}
   if(f.feePaid==='evet')check(['Nakit','Kredi kartı','Havale / EFT'].includes(f.feeMethod),'Ödeme yöntemini seçin.','feeMethod');
  }
  if(operation==='collectFee'){const w=member(db,'workOrders',f.id);check(w.status==='tamamlandi'&&w.fee>0&&!w.feePaid,'Tahsil edilebilir açık servis ücreti yok.');check(['Nakit','Kredi kartı','Havale / EFT'].includes(f.method),'Ödeme yöntemini seçin.','feeMethod');}
  if(operation==='saveFx')date(f.date);
  if(operation==='addCall'){
   const c=member(db,'customers',f.customerId,'customerId');if(f.det?.promiseDate)date(f.det.promiseDate,'promiseDate');if(f.det?.promise)money(f.det.promise,'promise',true);for(const id of f.det?.devs||[])check(member(db,'devices',id).customerId===c.id,'Görüşmedeki cihaz bu müşteriye ait değil.');check(Object.hasOwn(GK.R.CALLR,f.result),'Görüşme sonucunu seçin.','result');if(f.callback)date(f.callback,'callback');if(f.addressId)check(member(db,'addresses',f.addressId).customerId===c.id,'Adres müşteriye ait değil.');if(f.campaignId){const k=member(db,'campaigns',f.campaignId);check(k.addressIds.some(id=>db.addresses.find(a=>a.id===id)?.customerId===c.id),'Müşteri kampanyada değil.');}
  }
  if(operation==='saveCampaign'){
   date(f.day,'day');check(f.day>=db.today,'Kampanya günü geçmişte olamaz.','day');check(Array.isArray(f.addressIds)&&new Set(f.addressIds).size===f.addressIds.length,'Adresleri birer kez seçin.','addressIds');
   for(const id of f.addressIds){const a=member(db,'addresses',id),c=member(db,'customers',a.customerId);check(a.verified&&Number.isFinite(a.lat)&&Number.isFinite(a.lng),'Kampanya için adres konumunu doğrulayın.','addressIds');check(c.active!==false&&c.contact==='izinli','Kampanyaya yalnız iletişim izni kayıtlı aktif müşteriler alınabilir.','addressIds');}
  }
  if(operation==='saveSale'){
   relation(db,f);date(f.date);if(f.id)check(member(db,'sales',f.id).status==='taslak','Onaylı veya iptal satış taslak olarak değiştirilemez.');
   check(Array.isArray(f.lines)&&f.lines.length>0,'Satış kalemi ekleyin.','lines');f.lines=f.lines.map(l=>{variant(db,l,'lines');member(db,'depots',l.depotId,'lines');money(l.price,'lines',false,false);money(l.disc||0,'lines');money(l.cost,'lines');return pick(l,'productId variant depotId qty price disc cost');});delete f.no;
  }
  if(operation==='confirmSale'){const sale=member(db,'sales',f);check(sale.status==='taslak','Yalnız taslak satış onaylanabilir.');sale.lines.forEach(l=>variant(db,l,'lines'));}
  if(operation==='cancelSale')check(member(db,'sales',f.id).status!=='iptal','Satış zaten iptal.');
  if(operation==='addPayment'){const s=member(db,'sales',f.saleId,'saleId');check(s.status==='onayli','Tahsilat için onaylı satış gerekli.');date(f.date);money(f.amount,'amount',true,false);check(['Nakit','Kredi kartı','Havale / EFT'].includes(f.method),'Geçerli ödeme yöntemi seçin.','method');}
  if(operation==='install'){
   const s=member(db,'sales',f.saleId,'saleId');check(s.status==='onayli','Montaj için satış önce onaylanmalı.');const l=s.lines.find(l=>l.id===f.lineId);check(l&&l.installed<l.qty,'Montaj bekleyen satış kalemi seçin.','lineId');check(GK.R.stock(db,l.productId,l.depotId,l.variant||undefined).physical>=1,'Depoda takılacak fiziksel cihaz yok.');date(f.date);check(f.date>=s.date,'Montaj satış tarihinden önce olamaz.','date');technician(db,f.by,'by');interval(f);
   if(f.woId){const w=openWO(db,f.woId);check(w.type==='montaj'&&w.saleId===s.id&&w.lineId===l.id,'Montaj iş emri satış kalemine ait değil.');}
  }
  if(operation==='addMovement'){variant(db,f);member(db,'depots',f.depotId,'depotId');check(['giris','cikis','transfer','duzeltme'].includes(f.kind),'Stok hareket türünü seçin.','kind');if(f.kind==='transfer')member(db,'depots',f.toDepotId,'toDepotId');if(f.kind==='duzeltme')check(['eksik','fazla'].includes(f.dir),'Sayım yönünü seçin.','dir');date(f.date);money(f.cost,'cost',true);}
  if(operation==='saveProduct'){
   if(f.id)member(db,'products',f.id);
   check(!f.variants||Array.isArray(f.variants),'Varyasyonları kontrol edin.','variants');
   for(const v of f.variants||[]){check(text(v.name),'Boş renk / varyasyon adını doldurun veya satırı kaldırın.','variants');check(!v.img||/^\/(?:assets|api\/gk\/files)\/[a-zA-Z0-9_./-]+$/.test(v.img),'Varyasyon görselini dosya seçerek yükleyin.','variants');}
   if(f.id)for(const v of member(db,'products',f.id).variants||[]){const used=db.devices.some(d=>d.productId===f.id&&d.variant===v.name)||db.movements.some(m=>m.productId===f.id&&m.variant===v.name)||db.sales.some(s=>s.lines.some(l=>l.productId===f.id&&l.variant===v.name));if(used)check((f.variants||[]).some(x=>x.name===v.name),'Kayıtlarda kullanılan renk silinemez veya yeniden adlandırılamaz: '+v.name,'variants');}
   check(db.categories.some(c=>c.id===f.cat),'Kategori seçin.','cat');check(!f.img||/^\/(?:assets|api\/gk\/files)\/[a-zA-Z0-9_./-]+$/.test(f.img),'Görseli dosya seçerek yükleyin.','img');check(!f.src||/^https:\/\//.test(f.src),'Kaynak bağlantısı https:// ile başlamalı.','src');if(f.threshold!=null&&f.threshold!=='')integer(f.threshold,0,9999,'threshold');
  }
  if(operation==='setThreshold'){member(db,'products',f.id);if(f.value!=='')integer(f.value,0,9999,'value');}
  if(operation==='saveStaff'){if(f.id)member(db,'staff',f.id);if(f.hours){for(const v of [f.hours.start,f.hours.end,...(f.hours.brk||[])])check(/^([01]\d|2[0-3]):[0-5]\d$/.test(v),'Mesai/mola saatini kontrol edin.');check(f.hours.start<f.hours.end,'Mesai bitişi başlangıçtan sonra olmalı.');if(f.hours.brk?.length){check(f.hours.brk.length===2&&f.hours.brk[0]>=f.hours.start&&f.hours.brk[0]<f.hours.brk[1]&&f.hours.brk[1]<=f.hours.end,'Mola mesai aralığı içinde olmalı.');}}}
  if(operation==='toggleStaff'){const t=member(db,'staff',f);check(!t.active||!db.workOrders.some(w=>w.techId===f&&['planlandi','islemde'].includes(w.status)),'Personelin açık işleri var; önce başka personele atayın.');}
  if(operation==='saveDepot'&&f.id)member(db,'depots',f.id);
  if(operation==='applyRule'){interval(f);check(f.interval,'Bakım aralığı seçin.');check(Array.isArray(f.ids),'Cihazları seçin.');f.ids.forEach(id=>member(db,'devices',id));}
  if(operation==='addHistory'){const d=member(db,'devices',f.deviceId,'deviceId');date(f.date);check(!d.installDate||f.date>=d.installDate,'İşlem montajdan önce olamaz.','date');check(['bakim','ariza','kontrol'].includes(f.type),'İşlem türünü seçin.','type');check(text(f.action),'Yapılan işlemi yazın.','action');if(f.by)member(db,'staff',f.by);money(f.fee,'fee',true);}
  let result=GK.ops[operation](db,f);if(!result.ok)return result;db=result.db;
  if(operation==='saveCustomerFull'){
   const c=db.customers.find(c=>c.id===result.id);if(f.id)c.active=oldDB.customers.find(x=>x.id===f.id).active;
   const added=db.devices.filter(d=>!oldDB.devices.some(x=>x.id===d.id));if(added.length)result.deviceId=added[0].id;
  }
  if(operation==='saveAddress')Object.assign(db.addresses.find(a=>a.id===result.id),pick(f,'city buildingNo doorNo src vBy vAt'));
  if(operation==='saveStaff'){result.id=f.id||db.staff.find(t=>!oldDB.staff.some(old=>old.id===t.id)).id;if(f.hours)db.staff.find(t=>t.id===result.id).hours=f.hours;}
  if(operation==='saveDepot')result.id=f.id||db.depots.find(w=>!oldDB.depots.some(old=>old.id===w.id)).id;
  if(operation==='completeWO'&&oldDB.workOrders.find(w=>w.id===f.id).type==='bakim')for(const i of f.items.filter(i=>i.done)){const d=db.devices.find(d=>d.id===i.deviceId);d.manualNext=null;d.manualReason=null;}
  if(['saveSale','confirmSale','install','addMovement'].includes(operation))ensureStock(db);
  return {...result,db};
 }catch(e){if(e instanceof Invalid)return {ok:false,error:e.message,fields:e.fields};throw e;}
}
function restore(db,f){
 check(f.confirm==='GERİ YÜKLE','Geri yüklemek için GERİ YÜKLE yazın.');const b=f.backup;check(b?.format==='gunay-crm-v1'&&b.db&&b.workspace===f.workspace,'Yedek biçimi veya çalışma alanı uyuşmuyor.');
 const x=b.db;for(const k of Object.keys(db)){if(Array.isArray(db[k])){check(Array.isArray(x[k]),`Yedekte ${k} eksik.`);const ids=x[k].map(r=>r.id??r.date);check(new Set(ids).size===ids.length,`Yedekte ${k} mükerrer kayıt içeriyor.`);}}
 for(const a of x.addresses)member(x,'customers',a.customerId);for(const d of x.devices){const a=member(x,'addresses',d.addressId);check(a.customerId===d.customerId,'Yedekte cihaz/adres ilişkisi hatalı.');if(d.productId)member(x,'products',d.productId);}
 for(const s of x.sales){relation(x,s);for(const l of s.lines){member(x,'products',l.productId);member(x,'depots',l.depotId);money(l.price,'price',false,false);integer(l.installed,0,l.qty,'installed');}}
 for(const h of x.history)member(x,'devices',h.deviceId);for(const p of x.payments){member(x,'sales',p.saleId);money(p.amount,'amount',false,false);}ensureStock(x);return {ok:true,db:{...x,today:db.today}};
}
