// ureten: codex. Browser-only simulation. No transport or live feature flags.
import {MockProvider, smsTemplate} from './integrations/telephony.mjs';
import {normalizePhone, matchCustomer} from './integrations/core.mjs';
import {normalizeSpecto} from './integrations/specto.mjs';
export class SimulationProvider extends MockProvider {
  name = 'simulation';
  planCall(input) { return {requestId: input.requestId, customerId: input.customerId, recordingEnabled: false}; }
  planSms(input) { return {requestId: input.requestId, customerId: input.customerId, text: input.text}; }
}
export const templates = Object.freeze({appointment_reminder: 'Randevu hatırlatma', maintenance_due: 'Bakım zamanı', service_completed: 'İş tamamlandı', quote_ready: 'Teklif hazır'});
export const roles = Object.freeze({admin: 'Yönetici', office: 'Büro', technician: 'Teknisyen'});
const uid = () => 'ds-' + crypto.randomUUID();
const need = (ok, message) => { if (!ok) throw Error(message); };
const text = (v, max = 2000) => String(v ?? '').trim().slice(0, max);
const lookup = (rows, id) => { const row = rows.find(x => x.id === id); need(row, 'Kayıt bulunamadı.'); return row; };
const addDays = (day, n) => new Date(Date.parse(day) + n * 86400000).toISOString().slice(0, 10);
const names = Object.freeze({request: 'Deniz Eren', admin: 'Murat Aksoy', office: 'Ece Yıldırım', project: 'Ihlamur Proje Ofisi', dealer: 'Derya Şen', accounting: 'Burak Sezer', customer: 'Pelin Soyer'});
const mailCopy = {
  'demo-m1': {from: ['Örnek Proje', names.project], body: ['Yeni açılacak örnek ofisimizin iki odası için uygun kapasite ve montaj dahil teklif rica ederiz. Keşif için uygun günü birlikte belirleyebiliriz.', 'Yeni açılacak ofisimizin iki odası için uygun kapasite ve montaj dahil teklif rica ederiz. Keşif için uygun günü birlikte belirleyebiliriz.']},
  'demo-m2': {from: ['Örnek Bayi Masası', names.dealer], body: ['Bu kurgusal duyuru ürün eğitim toplantısının gündemini içerir. Herhangi bir gerçek kampanya, fiyat veya tarih taahhüdü değildir.', 'Ürün bilgilendirme toplantısının gündemini paylaşıyoruz. Teknik ekibinizin uygun olduğu günü bildirmenizi rica ederiz.']},
  'demo-m3': {from: ['Örnek Muhasebe', names.accounting], subject: ['Servis faturası örneği', 'Servis faturası kontrolü'], summary: ['Tamamlanan servis için örnek fatura kontrolü.', 'Tamamlanan servisin fatura bilgileri kontrol edilecek.'], body: ['Örnek servis faturasında adres ve işlem açıklamasının kontrol edilmesi rica ediliyor. Bu demo bir ödeme veya gerçek belge içermez.', 'Son servis faturasındaki adres ve işlem açıklamasını kontrol edebilir misiniz?']},
  'demo-m4': {from: ['Örnek Müşteri', names.customer]}
};
export function migrateSuiteContent(db) {
  const d = db.demoSuite;
  if (d?.version !== 1 || d.contentRevision >= 2) return false;
  // Stable seed identity + exact old value, never a global name/text replacement.
  const request = d.requests.find(r => r.id === 'demo-r3' && r.externalId === 'demo-r3' && r.source === 'specto' && normalizePhone(r.phone) === normalizePhone('0500 000 90 01'));
  if (request?.name === 'Örnek Deniz') request.name = names.request;
  for (const [id, role, previous, next] of [['demo-admin', 'admin', 'Örnek Yönetici', names.admin], ['demo-office', 'office', 'Örnek Büro', names.office]]) {
    const person = d.people.find(p => p.id === id && p.role === role);
    // Every historical person edit wrote staffId (including null for office/admin).
    if (person?.name === previous && !Object.hasOwn(person, 'staffId')) person.name = next;
  }
  for (const mail of d.mails) {
    const copy = mailCopy[mail.id]; if (!copy || (mail.id === 'demo-m4' && mail.customerId)) continue;
    for (const [field, [previous, next]] of Object.entries(copy)) if (mail[field] === previous) mail[field] = next;
  }
  // A converted seeded email keeps its identity; preserve user notes and all links/statuses.
  for (const request of d.requests) {
    const copy = request.source === 'mail' && mailCopy[request.externalId]; if (!copy) continue;
    if (request.externalId === 'demo-m4' && (request.customerId || d.mails.find(m => m.id === 'demo-m4')?.customerId)) continue;
    if (copy.from && request.name === copy.from[0]) request.name = copy.from[1];
    if (copy.summary && request.note === copy.summary[0]) request.note = copy.summary[1];
  }
  d.contentRevision = 2;
  return true;
}
export function initializeSuite(db) {
  if (db.demoSuite?.version === 1) return migrateSuiteContent(db);
  // New content is nested. Never replace customers, devices, calls or an old user's edits.
  const c = db.customers.find(c => c.active !== false && normalizePhone(c.phone));
  const c2 = db.customers.find(x => x.id !== c?.id && x.active !== false && normalizePhone(x.phone)) || c;
  const stamp = db.today + 'T08:30:00+03:00';
  const requests = [
    ['demo-r1', 'ariza', c, 'Klima soğutmuyor; ekranda E6 görünüyor.'],
    ['demo-r2', 'kesif', c2, 'Yeni oda için yerinde keşif istiyorum.'],
    ['demo-r3', 'teklif', null, 'Salon için klima fiyat teklifi rica ederim.'],
    ['demo-r4', 'bakim', c, 'Sezon öncesi iki cihaz için bakım talebi.']
  ].map(([id, type, customer, note]) => {const normalized=normalizeSpecto({externalId: id, type, name: customer?.name || names.request, phone: customer?.phone || '0500 000 90 01', createdAt: stamp}, db);return {id,...normalized,customerId:normalized.match.status==='matched'?normalized.match.customerId:null,note};});
  db.demoSuite = {version: 1, contentRevision: 2,
    switchboard: {line: '0232 461 74 25', extensions: [{number: '101', name: 'Yönetim'}, {number: '102', name: 'Büro'}, {number: '103', name: 'Teknisyen'}], start: '08:30', end: '18:00', outside: 'Yönetim dahili 101', greeting: 'Günay Klima’ya hoş geldiniz. Mesai dışında mesajınızı bırakabilirsiniz.'},
    calls: [
      {id: 'demo-call1', customerId: c?.id, phone: c?.phone, name: c?.name, direction: 'gelen', status: 'cevapsiz', date: db.today, time: '08:12', outside: true, voicemail: 'Bakım randevum için dönüş rica ediyorum.', notified: true, duration: 0},
      {id: 'demo-call2', customerId: c2?.id, phone: c2?.phone, name: c2?.name, direction: 'gelen', status: 'tamamlandi', date: db.today, time: '09:20', duration: 84, note: 'Filtre temizliği hakkında bilgi verildi.'},
      {id: 'demo-call3', customerId: null, phone: '0500 000 90 02', name: 'Kayıtsız numara', direction: 'gelen', status: 'cevapsiz', date: db.today, time: '07:45', outside: true, notified: true, voicemail: '', duration: 0}
    ], requests,
    mails: [
      ['demo-m1', 'Yeni ofis için teklif', names.project, 'yüksek', 'İki çalışma odası için klima seçimi ve teklif isteniyor.', mailCopy['demo-m1'].body[1], 'teklif'],
      ['demo-m2', 'Bayi duyurusu', names.dealer, 'normal', 'Yeni dönem ürün bilgilendirme toplantısı duyurusu.', mailCopy['demo-m2'].body[1], 'kesif'],
      ['demo-m3', mailCopy['demo-m3'].subject[1], names.accounting, 'normal', mailCopy['demo-m3'].summary[1], mailCopy['demo-m3'].body[1], 'bakim'],
      ['demo-m4', 'Servis sonrası ses şikâyeti', c?.name || names.customer, 'yüksek', 'Son kontrolden sonra cihazdan ses geldiği bildiriliyor.', 'Son servisten sonra iç ünitede titreşim sesi duyuyorum. Cihazın yeniden kontrol edilmesini rica ederim.', 'ariza']
    ].map(([id, subject, from, priority, summary, body, type]) => ({id, subject, from, priority, summary, body, type, customerId: id === 'demo-m4' ? c?.id : null, read: false, date: db.today})),
    sms: [], templateTexts: {}, rules: {appointment: true, maintenance: true},
    people: [{id: 'demo-admin', name: names.admin, role: 'admin'}, {id: 'demo-office', name: names.office, role: 'office'}, ...db.staff.filter(t => t.active).map(t => ({id: 'demo-' + t.id, name: t.name, role: 'technician', staffId: t.id}))],
    backupPlan: {enabled: true, time: '02:00'}, backups: [{id: 'demo-backup1', at: addDays(db.today, -1) + 'T02:00:00+03:00', status: 'Hazır', note: 'Gece planı, demo kaydı'}]
  };
  return true;
}
export function messageText(db, customerId, template, workOrderId) {
  need(Object.hasOwn(templates, template), 'Şablon seçin.');
  const customer = lookup(db.customers, customerId), w = db.workOrders.find(w => w.id === workOrderId);
  const custom = db.demoSuite.templateTexts[template];
  if (custom) return custom.replaceAll('{ad}', customer.name).replaceAll('{tarih}', w?.date || db.today).replaceAll('{saat}', w?.start || 'uygun saatte');
  if (template === 'quote_ready') return `Günay Klima: ${customer.name}, teklifiniz hazır. Bilgi için 0232 461 74 25.`;
  return smsTemplate(template, {date: w?.date || db.today, time: w?.start || 'uygun saatte', officePhone: '0232 461 74 25', device: 'klimanız'}).text;
}
export function allowedAction(db, personId, op, payload = {}) {
  const person = db.demoSuite.people.find(p => p.id === personId);
  if (!person || person.role === 'admin') return true;
  if (person.role === 'office') return !['person', 'switchboard', 'backupPlan', 'backupNow'].includes(op);
  if (['startCall', 'finishCall'].includes(op)) return db.workOrders.some(w => w.techId === person.staffId && w.customerId === payload.customerId);
  return false;
}
export function simulate(db, op, payload, engine, personId) {
  const next = structuredClone(db), d = next.demoSuite, p = payload || {};
  need(d?.version === 1, 'Demo hazırlanamadı. Yenileyip tekrar deneyin.');
  need(allowedAction(next, personId, op, p), 'Bu görünümde bu işlem için yetki yok.');
  const now = new Date().toISOString(); let id;
  if (op === 'startCall') {
    const c = p.customerId ? lookup(next.customers, p.customerId) : null;
    need(normalizePhone(c?.phone || p.phone), 'Aranacak telefon yok.');
    id = uid(); d.calls.unshift({id, customerId: c?.id || null, phone: c?.phone || p.phone, name: c?.name || 'Kayıtsız numara', direction: 'giden', status: 'suruyor', date: next.today, time: new Intl.DateTimeFormat('tr', {hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul'}).format(new Date()), duration: 0, startedAt: now});
    if (p.callbackId) lookup(d.calls, p.callbackId).returned = true;
  } else if (op === 'finishCall') {
    const call = lookup(d.calls, p.id); need(call.status === 'suruyor', 'Arama zaten tamamlandı.');
    call.status = 'tamamlandi'; call.duration = Math.max(0, Math.round((Date.now() - Date.parse(call.startedAt)) / 1000)); call.note = text(p.note);
    if (call.customerId) {
      const r = engine.execute(next, 'addCall', {customerId: call.customerId, dir: call.direction, result: 'bilgi', topic: 'Bilgi', note: call.note || 'Santral görüşmesi (demo)', reqs: []});
      need(r.ok, r.error); return {...r, id: call.id};
    }
  } else if (op === 'incoming') {
    const c = p.unknown ? null : next.customers.find(c => c.active !== false && normalizePhone(c.phone));
    id = uid(); d.calls.unshift({id, customerId: c?.id || null, name: c?.name || 'Kayıtsız numara', phone: c?.phone || '0500 000 90 03', direction: 'gelen', status: 'cevapsiz', date: next.today, time: '10:30', duration: 0, outside: false});
  } else if (op === 'bindCall') {
    const call = lookup(d.calls, p.id), customer = lookup(next.customers, p.customerId); call.customerId = customer.id; call.name = customer.name;
  } else if (op === 'incomingNote') {
    const call = lookup(d.calls, p.id); need(call.customerId, 'Önce müşteriyi kaydedin.');
    const r = engine.execute(next, 'addCall', {customerId: call.customerId, dir: 'gelen', result: 'bilgi', topic: 'Bilgi', note: text(p.note), reqs: []});
    need(r.ok, r.error); r.db.demoSuite.calls.find(x => x.id === call.id).status = 'tamamlandi'; return r;
  } else if (op === 'sms') {
    const ids = [...new Set(p.customerIds || [p.customerId])]; need(ids.length > 0 && ids.length <= 100, 'En az bir müşteri seçin.');
    for (const customerId of ids) {
      const c = lookup(next.customers, customerId); need(normalizePhone(c.phone), 'Telefonu olmayan müşteriye SMS hazırlanamaz.');
      need(c.contact !== 'istemiyor' && (p.template !== 'maintenance_due' || c.contact === 'izinli'), 'İletişim izni bu mesaj için uygun değil.');
      d.sms.unshift({id: uid(), customerId, text: text(p.text || messageText(next, customerId, p.template, p.workOrderId), 900), template: p.template, status: 'İletildi', simulated: true, at: now});
    }
  } else if (op === 'rule') { need(['appointment', 'maintenance'].includes(p.key), 'Kural bulunamadı.'); d.rules[p.key] = !!p.enabled;
  } else if (op === 'template') { need(Object.hasOwn(templates, p.key) && text(p.text), 'Şablon metni gerekli.'); d.templateTexts[p.key] = text(p.text, 900);
  } else if (op === 'linkRequest') { const r = lookup(d.requests, p.id); lookup(next.customers, p.customerId); r.customerId = p.customerId; r.match = {status: 'matched', customerId: p.customerId};
  } else if (op === 'requestStatus') { need(['new', 'assigned', 'completed'].includes(p.status), 'Durum seçin.'); lookup(d.requests, p.id).status = p.status;
  } else if (op === 'requestWO') {
    const r = lookup(d.requests, p.id); need(r.customerId, 'Önce talebi müşteriye bağlayın.'); need(!r.workOrderId, 'Bu talep zaten iş emrine çevrildi.');
    const result = engine.execute(next, 'saveWO', {...p.form, customerId: r.customerId, note: r.note, type: r.type === 'ariza' ? 'ariza' : r.type === 'bakim' ? 'bakim' : 'kontrol'});
    need(result.ok, Object.values(result.fields || {}).join(' ') || result.error); const linked = result.db.demoSuite.requests.find(x => x.id === r.id); linked.workOrderId = result.id; linked.status = 'assigned'; return result;
  } else if (op === 'requestQuote') {
    const r = lookup(d.requests, p.id); need(r.customerId, 'Önce talebi müşteriye bağlayın.');
    const a = next.addresses.find(a => a.customerId === r.customerId); need(a, 'Önce müşteriye tam adres ekleyin.');
    return {ok: true, db: next, id: r.customerId, addressId: a.id, saleId: r.saleId};
  } else if (op === 'mailRead') { lookup(d.mails, p.id).read = true;
  } else if (op === 'mailRequest') {
    const m = lookup(d.mails, p.id); if (m.requestId) return {ok: true, db: next, id: m.requestId};
    id = uid(); d.requests.unshift({id, source: 'mail', externalId: m.id, type: m.type, label: {ariza: 'Arıza', teklif: 'Fiyat teklifi', bakim: 'Bakım', kesif: 'Keşif'}[m.type], name: m.from, phone: next.customers.find(c => c.id === m.customerId)?.phone || '', customerId: m.customerId, status: 'new', priority: m.type === 'ariza' ? 100 : 50, note: m.summary, createdAt: now}); m.requestId = id; m.read = true;
  } else if (op === 'person') {
    need(text(p.name, 80) && Object.hasOwn(roles, p.role), 'Ad ve rol seçin.');
    let staffId=p.staffId;
    if(p.role==='technician'){
      const existing=staffId?lookup(next.staff,staffId):null;
      const result=engine.execute(next,'saveStaff',existing?{...existing,name:text(p.name,80)}:{name:text(p.name,80),phone:'',active:true,hours:{start:'08:30',end:'18:00',brk:['12:30','13:30']}});
      need(result.ok,result.error);next.staff=result.db.staff;staffId=result.id;
    }
    const person = p.id ? lookup(d.people, p.id) : {id: uid()};
    need(!(person.role === 'admin' && p.role !== 'admin' && d.people.filter(x => x.role === 'admin').length === 1), 'En az bir yönetici kalmalı.');
    Object.assign(person, {name: text(p.name, 80), role: p.role, staffId: p.role === 'technician' ? staffId : null}); if (!p.id) d.people.push(person);
  } else if (op === 'switchboard') {
    need(/^([01]\d|2[0-3]):[0-5]\d$/.test(p.start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.end) && p.start < p.end, 'Mesai saatlerini kontrol edin.');
    need(text(p.greeting) && text(p.line), 'Şirket hattı ve karşılama metni gerekli.');
    d.switchboard = {...d.switchboard, line: text(p.line, 30), start: p.start, end: p.end, outside: text(p.outside, 80), greeting: text(p.greeting), extensions: d.switchboard.extensions.map((x, i) => ({...x, name: text(p.extensions?.[i]?.name || x.name, 60)}))};
  } else if (op === 'backupPlan') { need(/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time), 'Yedek saatini seçin.'); d.backupPlan = {enabled: !!p.enabled, time: p.time};
  } else if (op === 'backupNow') { d.backups.unshift({id: uid(), at: now, status: 'Hazır', note: 'Elle başlatılan demo yedeği'});
  } else throw Error('Demo işlemi bulunamadı.');
  return {ok: true, db: next, id};
}
export {normalizePhone, matchCustomer};
