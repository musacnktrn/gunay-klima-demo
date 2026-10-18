// ureten: codex. Same-origin, browser-only sales demo; text is always inserted as text.
import {templates, roles, messageText, matchCustomer} from '../demo/demo-suite.mjs';
const h = (tag, props = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'class') el.className = value;
    else if (key === 'checked') el.checked = value;
    else if (value != null) el.setAttribute(key, value);
  }
  for (const child of children.flat(Infinity)) if (child != null) el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  return el;
};
const host = () => window.GKDemoHost;
const db = () => host()?.app.state.db;
const suite = () => db()?.demoSuite;
const person = () => suite()?.people.find(x => x.id === sessionStorage.getItem('gk-demo-person'));
const btn = (label, action, primary = false) => h('button', {type: 'button', class: primary ? 'ds-button ds-primary' : 'ds-button', onClick: async event => {const el=event.currentTarget;if(el.disabled)return;el.disabled=true;try{await action();}finally{el.disabled=false;}}}, label);
const p = text => h('p', {class: 'ds-muted'}, text);
const row = (...items) => h('div', {class: 'ds-actions'}, ...items);
const card = (...items) => h('article', {class: 'ds-card'}, ...items);
const field = (label, value = '', type = 'text') => {
  const input = h(type === 'textarea' ? 'textarea' : 'input', type === 'textarea' ? {rows: '3'} : {type}); input.value = value;
  return {input, el: h('label', {class: 'ds-field'}, label, input)};
};
const select = (label, options, value) => {
  const input = h('select', {}, ...options.map(([k, v]) => h('option', {value: k}, v))); input.value = value;
  return {input, el: h('label', {class: 'ds-field'}, label, input)};
};
const cust = id => db().customers.find(c => c.id === id);
const customerName = id => cust(id)?.name || 'Müşteri seçilmedi';
const badge = (label, urgent = false) => h('span', {class: 'ds-badge' + (urgent ? ' ds-urgent' : '')}, label);
const title = (name, sub, ...actions) => h('div', {class: 'ds-heading'}, h('div', {}, h('h1', {}, name), p(sub)), row(...actions));
const toast = text => host().act.toast(text);
const go = (screen, params) => host().act.go(screen, params);
let activeDialog, activeCall, pendingCustomer, autoTimer;
function dialog(label, ...content) {
  closeDialog(); const d = h('dialog', {class: 'ds-dialog', 'aria-label': label}, h('header', {}, h('h2', {}, label), btn('Kapat', () => closeDialog())), ...content);
  d.addEventListener('cancel', event => { if (activeCall) {event.preventDefault(); return;} if (d.dataset.dirty === 'true' && !confirm('Değişiklikler kaydedilmeden kapatılsın mı?')) event.preventDefault(); });
  d.addEventListener('close', () => { clearInterval(d.timer); d.remove(); if (activeDialog === d) activeDialog = null; });
  document.body.append(d); activeDialog = d; d.showModal(); return d;
}
function closeDialog() {
  if (!activeDialog) return;
  if (activeCall) {toast('Önce aramayı bitirin.'); return;}
  if (activeDialog.dataset.dirty === 'true' && !confirm('Değişiklikler kaydedilmeden kapatılsın mı?')) return;
  activeDialog.close();
}
async function run(op, payload = {}, notice) {
  try {
    const result = await window.GKApi.demo(op, payload);
    if (!result.ok) throw Error(result.error);
    host().app.setState({db: result.db, revision: result.revision});
    if (notice) toast(notice);
    return result;
  } catch (error) { toast(error.message); if (activeDialog) { let e = activeDialog.querySelector('[role=alert]'); if (!e) {e = h('p', {role: 'alert', class: 'ds-error'}); activeDialog.append(e);} e.textContent = error.message; } return null; }
}
function cleanClose(d) { d.dataset.dirty = 'false'; d.close(); }
async function startCall(customerId, phone, callbackId) {
  if (activeCall) return toast('Bir arama zaten açık.');
  const result = await run('startCall', {customerId, phone, callbackId}); if (!result) return;
  const note = field('Görüşme notu', '', 'textarea'), clock = h('strong', {class: 'ds-clock'}, '00:00');
  let muted = false; const mute = btn('Sessize al', () => {muted = !muted; mute.textContent = muted ? 'Sesi aç' : 'Sessize al'; mute.setAttribute('aria-pressed', String(muted));});
  const d = dialog('Santral araması', badge('Görüşme sürüyor'), h('h3', {}, customerName(customerId)), p('Müşteri sizi ' + suite().switchboard.line + ' olarak görüyor'), clock, note.el, row(mute, btn('Aramayı bitir ve notu kaydet', async () => {
    const r = await run('finishCall', {id: result.id, customerId, note: note.input.value}, 'Arama tamamlandı (demo).');
    if (r) {activeCall = null; cleanClose(d);}
  }, true)), p('Demo görüşmesi, gerçek arama yapılmadı.'));
  activeCall = result.id;
  const start = Date.now(); d.timer = setInterval(() => {const s = Math.floor((Date.now() - start) / 1000); clock.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');}, 1000);
}
async function incoming(unknown = false) {
  if (activeDialog || document.querySelector('[aria-modal=true]')) return;
  const result = await run('incoming', {unknown}); if (!result) return;
  const call = result.db.demoSuite.calls.find(x => x.id === result.id), match = matchCustomer(result.db, call.phone), c = match.status === 'matched' ? cust(match.customerId) : null;
  const addresses = db().addresses.filter(a => a.customerId === c?.id), devices = db().devices.filter(d => d.customerId === c?.id);
  const maintenance = db().history.filter(x => devices.some(d => d.id === x.deviceId) && x.type === 'bakim' && x.done !== false).sort((a, b) => b.date.localeCompare(a.date))[0];
  const jobs = db().workOrders.filter(w => w.customerId === c?.id && ['planlandi', 'islemde'].includes(w.status));
  const note = field('Çağrı notu', '', 'textarea');
  const d = dialog('Gelen çağrı', badge('Gelen çağrı'), h('h3', {}, c?.name || 'Kayıtsız numara'), p(call.phone), ...(c ? [
    p(addresses.map(a => window.GK.R.addrLine(a) + ', ' + a.mah + ' / ' + a.ilce).join(' · ') || 'Adres yok'),
    p(devices.map(x => window.GK.R.model(db(), x).title + ' · ' + x.room).join(' / ') || 'Cihaz yok'),
    p('Son bakım: ' + (maintenance?.date || 'Kayıt yok') + ' · Açık iş: ' + jobs.length),
    note.el, row(btn('Not ekle', async () => {if (!note.input.value.trim()) return toast('Görüşme notunu yazın.'); if (await run('incomingNote', {id: call.id, note: note.input.value}, 'Gelen çağrı notu kaydedildi (demo).')) cleanClose(d);}), btn('İş emri aç', () => {cleanClose(d); const a = addresses[0]; host().act.open('appt', {customerId: c.id, addressId: a?.id, type: 'ariza', date: db().today, dur: '60'});}), btn('Müşteri kartı', () => {cleanClose(d); go('musteriler', {customerId: c.id});}))
  ] : [p(match.status === 'ambiguous' ? 'Birden fazla müşteri eşleşti. Kayıt kontrolü gerekiyor.' : 'Bu numara müşteri listenizde yok.'), btn('Yeni müşteri olarak kaydet', () => {pendingCustomer = {kind: 'bindCall', id: call.id}; cleanClose(d); host().act.open('customer', {name: '', phone: call.phone, type: 'Kişi', contact: 'bilinmiyor'});}, true)]), p('Örnek çağrı (demo), ses çalınmaz.'));
}
function sms(customerId, workOrderId, bulk = false) {
  const candidates = bulk ? db().customers.filter(c => c.contact === 'izinli' && c.phone && db().devices.some(x => x.customerId === c.id && window.GK.R.isDue(db(), x))) : [cust(customerId)].filter(Boolean);
  if (!candidates.length) return toast('Hatırlatmaya uygun, izinli müşteri yok.');
  const pick = select('Mesaj şablonu', Object.entries(templates), bulk ? 'maintenance_due' : workOrderId ? 'appointment_reminder' : 'quote_ready');
  if (bulk) pick.input.disabled = true;
  const body = field('Mesaj önizlemesi', messageText(db(), candidates[0].id, pick.input.value, workOrderId), 'textarea');
  pick.input.onchange = () => {body.input.value = messageText(db(), candidates[0].id, pick.input.value, workOrderId);};
  const selected = candidates.map(c => {const input = h('input', {type: 'checkbox', checked: true}); return {id: c.id, input, el: h('label', {class: 'ds-check'}, input, c.name + ' · ' + c.phone)};});
  const d = dialog(bulk ? 'Toplu bakım hatırlatması' : 'SMS gönder', p(bulk ? 'Göndermeden önce müşteri listesini kontrol edin. Her mesaj alıcının bilgileriyle hazırlanır.' : customerName(customerId)), ...(bulk ? selected.map(x => x.el) : []), pick.el, body.el,
    btn('Gönder', async () => {
      const ids = selected.filter(x => x.input.checked).map(x => x.id);
      if (await run('sms', {customerIds: ids, template: pick.input.value, workOrderId, ...(bulk ? {} : {text: body.input.value})}, 'SMS gönderildi (demo, gerçek mesaj gitmedi).')) cleanClose(d);
    }, true), p('Bu tarayıcıda iletim örneği oluşturulur. Gerçek SMS gitmez.'));
}
function callScreen() {
  const filter = select('Çağrı filtresi', [['all', 'Tüm çağrılar'], ['gelen', 'Gelen'], ['giden', 'Giden'], ['cevapsiz', 'Cevapsız'], ['outside', 'Mesai dışı']], 'all');
  const list = h('div', {class: 'ds-list'});
  const render = () => list.replaceChildren(...suite().calls.filter(c => filter.input.value === 'all' || filter.input.value === c.direction || filter.input.value === c.status || filter.input.value === 'outside' && c.outside).map(c => card(
    row(badge(c.status === 'cevapsiz' ? 'Cevapsız' : c.direction === 'gelen' ? 'Gelen' : 'Giden', c.status === 'cevapsiz'), c.outside ? badge('Mesai dışı') : null, c.returned ? badge('Geri arandı') : null), h('h3', {}, c.customerId ? customerName(c.customerId) : c.name), p(c.phone + ' · ' + c.date + ' ' + c.time + (c.duration ? ' · ' + c.duration + ' sn' : '')),
    c.voicemail ? p('Telesekreter: ' + c.voicemail) : null, c.notified ? p('Talep bildirimi gönderildi (demo).') : null, c.note ? p(c.note) : null,
    row(btn(c.status === 'cevapsiz' ? 'Geri ara' : 'Ara', () => startCall(c.customerId, c.phone, c.id)), c.customerId ? btn('Müşteri kartı', () => go('musteriler', {customerId: c.customerId})) : null)
  )));
  filter.input.onchange = render; render();
  return [title('Çağrılar', 'Şirket hattı · ' + suite().switchboard.line, badge(suite().calls.filter(c => c.status === 'cevapsiz' && !c.returned).length + ' cevapsız', true), btn('Gelen çağrı dene', () => incoming()), btn('Kayıtsız numara dene', () => incoming(true)), btn('Santral ayarları', () => go('ayarlar', {section: 'santral'}))), filter.el, list];
}
function requestForm(r) {
  const addresses = db().addresses.filter(a => a.customerId === r.customerId);
  if (!addresses.length) return toast('Önce müşteriye tam adres ekleyin.');
  const ad = select('İş adresi', addresses.map(a => [a.id, a.label + ' · ' + window.GK.R.addrLine(a)]), addresses[0].id), tech = select('Teknisyen', db().staff.filter(t => t.active).map(t => [t.id, t.name]), db().staff.find(t => t.active)?.id);
  const date = field('Randevu tarihi', db().today, 'date'), time = field('Randevu saati', '09:00', 'time'), duration = field('Süre (dakika)', '60', 'number');
  const deviceList=h('div');
  const devices=()=>{deviceList.replaceChildren(...db().devices.filter(x=>x.customerId===r.customerId&&x.addressId===ad.input.value).map(x=>h('label',{class:'ds-check'},h('input',{type:'checkbox',value:x.id,checked:true}),x.room+' · '+window.GK.R.model(db(),x).title)));if(!deviceList.children.length)deviceList.append(p('Bu adreste klima kaydı yok. Önce müşteri kartından klima ekleyin.'));};ad.input.onchange=devices;devices();
  const d = dialog('Talebi iş emrine çevir', p(r.name + ' · ' + r.label), ad.el, deviceList, tech.el, row(date.el, time.el), duration.el, btn('İş emrini kaydet', async () => {
    const result = await run('requestWO', {id: r.id, form: {addressId: ad.input.value, techId: tech.input.value, date: date.input.value, start: time.input.value, dur: duration.input.value, buffer: '0', deviceIds: [...deviceList.querySelectorAll('input:checked')].map(x=>x.value)}}, 'Talep iş emrine çevrildi.');
    if (result) {cleanClose(d); host().act.open('wo', {woId: result.id});}
  }, true));
}
function linkRequest(r) {
  const choice = select('Kayıtlı müşteri', db().customers.filter(c => c.active !== false).map(c => [c.id, c.name + ' · ' + (c.phone || 'Telefon yok')]), r.customerId || db().customers[0]?.id);
  const d = dialog('Müşteriye bağla', p(r.name + ' · ' + r.phone), choice.el, btn('Bağla', async () => {if (await run('linkRequest', {id: r.id, customerId: choice.input.value}, 'Talep müşteriye bağlandı.')) cleanClose(d);}, true));
}
function requestScreen() {
  const rows = [...suite().requests].sort((a, b) => b.priority - a.priority);
  return [title('Talepler', 'Specto CX ve e-postadan gelen talepler'), ...rows.map(r => card(row(badge(r.label, r.type === 'ariza'), badge({new: 'Yeni', assigned: 'Atandı', completed: 'Tamamlandı'}[r.status]), badge(r.source === 'mail' ? 'E-posta' : 'Specto CX')), h('h3', {}, r.name), p(r.note), p(r.customerId ? 'Kayıtlı müşteri: ' + customerName(r.customerId) : 'Müşteri eşleşmesi bekliyor · ' + r.phone),
    row(btn('Müşteriye bağla', () => linkRequest(r)), !r.customerId ? btn('Yeni müşteri', () => {pendingCustomer = {kind: 'linkRequest', id: r.id}; host().act.open('customer', {name: r.name, phone: r.phone, type: 'Kişi', contact: 'bilinmiyor'});}) : null,
      btn(r.workOrderId ? 'İş emrini aç' : 'İş emrine çevir', () => r.workOrderId ? host().act.open('wo', {woId: r.workOrderId}) : requestForm(r)),
      btn('Teklif hazırla', async () => {const result = await run('requestQuote', {id: r.id}, 'Teklif taslağı açıldı.'); if (result) go('satis', result.saleId ? {saleId:result.saleId} : {newSale:true,customerId:result.id,addressId:result.addressId,quoteRequestId:r.id,note:r.note});}), btn('Durumu değiştir', () => {
        const choice = select('Talep durumu', [['new', 'Yeni'], ['assigned', 'Atandı'], ['completed', 'Tamamlandı']], r.status);
        const d = dialog('Talep durumu', choice.el, btn('Durumu kaydet', async () => {if (await run('requestStatus', {id: r.id, status: choice.input.value}, 'Talep durumu güncellendi.')) cleanClose(d);}, true));
      }))
  ))];
}
function mailScreen() { return [title('Mail', 'info@ · önemli e-postalar'), ...suite().mails.map(m => card(row(badge(m.priority === 'yüksek' ? 'Önemli' : 'Bilgi', m.priority === 'yüksek'), badge(m.read ? 'Okundu' : 'Yeni')), h('h3', {}, m.subject), p(m.from + ' · ' + m.date), p(m.summary), row(btn('Tamamını göster', () => dialog(m.subject, p(m.from), h('p', {}, m.body))), btn('Talebe çevir', async () => {if (await run('mailRequest', {id: m.id}, 'E-posta talebe çevrildi.')) go('talepler');}), btn('Okundu', () => run('mailRead', {id: m.id}, 'E-posta okundu olarak işaretlendi.')))))]; }
function smsScreen() {
  return [h('h2', {}, 'SMS'), p('Şablonlar ve hatırlatma kuralları'), card(h('h3', {}, 'Otomatik hatırlatmalar'), ...[['appointment', 'Randevudan 1 gün önce'], ['maintenance', 'Bakım tarihine 15 gün kala']].map(([key, label]) => {const input = h('input', {type: 'checkbox', checked: suite().rules[key], onChange: e => run('rule', {key, enabled: e.target.checked}, 'Hatırlatma kuralı kaydedildi (demo).')}); return h('label', {class: 'ds-check'}, input, label);}), p('Kurallar demo ayarıdır. Arka planda gerçek mesaj gönderilmez.'), btn('Toplu bakım hatırlatması', () => sms(null, null, true), true)),
    card(h('h3', {}, 'Mesaj şablonları'), ...Object.entries(templates).map(([key, label]) => row(h('strong', {}, label), btn('Düzenle: ' + label, () => {const t = field('Şablon metni', suite().templateTexts[key] || messageText(db(), db().customers.find(c => c.phone).id, key), 'textarea'); const d = dialog(label, t.el, p('{ad}, {tarih}, {saat} alanları müşteriye göre doldurulur.'), btn('Şablonu kaydet', async () => {if (await run('template', {key, text: t.input.value}, 'Şablon kaydedildi.')) cleanClose(d);}, true));})))),
    card(h('h3', {}, 'SMS geçmişi'), ...(suite().sms.length ? suite().sms.map(m => h('div', {class: 'ds-history'}, row(h('strong', {}, customerName(m.customerId)), badge(m.status)), p(m.text), p(new Date(m.at).toLocaleString('tr-TR') + ' · Demo, gerçek mesaj gitmedi.'))) : [p('Henüz gönderilen mesaj yok.')]))];
}
function staffForm(person) {
  const name = field('Ad soyad', person?.name || ''), role = select('Rol', Object.entries(roles), person?.role || 'office'), staff = select('İş atanan teknisyen', [['', 'Seçin'], ...db().staff.map(t => [t.id, t.name])], person?.staffId || '');
  const d = dialog(person ? 'Personeli düzenle' : 'Personel ekle', name.el, role.el, staff.el, p('Teknisyen rolünde iş atanan kişiyi seçin.'), btn('Personeli kaydet', async () => {if (await run('person', {id: person?.id, name: name.input.value, role: role.input.value, staffId: staff.input.value}, 'Personel kaydedildi (demo hesabı).')) cleanClose(d);}, true));
}
function personScreen() {return [row(h('h2', {}, 'Personel'), btn('Personel ekle', () => staffForm(), true)), ...suite().people.map(t => card(row(h('h3', {}, t.name), badge(roles[t.role])), row(btn('Düzenle', () => staffForm(t)), btn('Bu kişi gibi görüntüle', () => {sessionStorage.setItem('gk-demo-person', t.id); host().app.setState({screen: 'bugun', params: {t: Date.now()}, modal: null});})))),
    card(h('h3', {}, 'Yetki tablosu'), h('div', {class: 'ds-permissions'}, ...[['Alan', 'Yönetici', 'Büro', 'Teknisyen'], ['Müşteri, çağrı, SMS, talepler', 'Tümü', 'Tümü', 'Kendi işleri'], ['İş planı', 'Tümü', 'Tümü', 'Kendi işleri'], ['Personel ve santral ayarı', 'Düzenler', 'Görüntüler', 'Kapalı'], ['Yedek planı', 'Düzenler', 'Görüntüler', 'Kapalı']].map(items => h('div', {}, ...items.map(x => h('span', {}, x))))), p('Bu kişi gibi görüntüle, demo görünümünü değiştirir. Gerçek giriş hesabı açılmaz.'))];}
function switchboardScreen() {
  const s = suite().switchboard, line = field('Şirket hattı', s.line), start = field('Mesai başlangıcı', s.start, 'time'), end = field('Mesai bitişi', s.end, 'time'), outside = field('Mesai dışı yönlendirme', s.outside), greeting = field('Telesekreter karşılama metni', s.greeting, 'textarea');
  const extensions = s.extensions.map(x => field(x.number + ' dahili', x.name));
  return [h('h2', {}, 'Santral'), card(line.el, h('h3', {}, 'Dahili hatlar'), ...extensions.map(x => x.el), row(start.el, end.el), outside.el, greeting.el, btn('Santral ayarlarını kaydet', () => run('switchboard', {line: line.input.value, start: start.input.value, end: end.input.value, outside: outside.input.value, greeting: greeting.input.value, extensions: extensions.map(x => ({name: x.input.value}))}, 'Santral ayarları kaydedildi (demo).'), true))];
}
function backupScreen() {
  const time = field('Her gece yedek saati', suite().backupPlan.time, 'time'), enabled = h('input', {type: 'checkbox', checked: suite().backupPlan.enabled});
  return [h('h2', {}, 'Yedekleme'), card(h('label', {class: 'ds-check'}, enabled, 'Her gece otomatik yedekle'), time.el, row(btn('Yedek planını kaydet', () => run('backupPlan', {time: time.input.value, enabled: enabled.checked}, 'Yedek planı kaydedildi (demo).')), btn('Şimdi yedekle', () => run('backupNow', {}, 'Yedek hazır (demo, yalnız geçmiş kaydı oluşturuldu).'), true)), p('Otomatik plan ve geçmiş demo kaydıdır. Dosya yedeği için Veri aktarımı bölümünü kullanın.'), btn('JSON yedeği al / geri yükle', () => window.GKApi.tools('data'))), card(h('h3', {}, 'Yedek geçmişi'), ...suite().backups.map(b => h('div', {class: 'ds-history'}, row(badge(b.status), h('strong', {}, new Date(b.at).toLocaleString('tr-TR'))), p(b.note + ' · Demo'))))];
}
function ownJobs() {
  const t = person(), jobs = db().workOrders.filter(w => w.techId === t.staffId);
  return [title('Bana atanan işler', t.name + ' · Teknisyen görünümü'), ...jobs.map(w => card(h('h3', {}, customerName(w.customerId)), p(w.date + ' · ' + w.start + ' · ' + window.GK.R.T[w.type]), p(window.GK.R.addrLine(db().addresses.find(a => a.id === w.addressId) || {})), row(btn('İş emrini aç', () => host().act.open('wo', {woId: w.id})), btn('Ara', () => startCall(w.customerId)))))];
}
function summary() { return [h('div', {class: 'ds-summary'}, ...[
  ['Cevapsız çağrılar', suite().calls.filter(c => c.status === 'cevapsiz' && !c.returned).length, 'cagrilar'],
  ['Yeni talepler', suite().requests.filter(r => r.status === 'new').length, 'talepler'],
  ['Önemli mailler', suite().mails.filter(m => !m.read && m.priority === 'yüksek').length, 'mail']
].map(([label, n, screen]) => h('button', {class: 'ds-summary-card', onClick: () => go(screen)}, h('span', {}, label), h('strong', {}, n), h('small', {}, 'Listeyi aç →'))))]; }
function renderHosts() {
  if (!suite()) return;
  const t = person();
  document.querySelectorAll('[data-demo-host]').forEach(el => {
    const key = el.dataset.demoHost, cache = host().app.state.revision + ':' + key + ':' + (t?.id || 'admin');
    if (el.dataset.rendered === cache) return;
    el.dataset.rendered = cache; el.classList.add('ds-suite');
    const content = {cagrilar: callScreen, talepler: requestScreen, mail: mailScreen, sms: smsScreen, personel: personScreen, santral: switchboardScreen, yedekleme: backupScreen, summary, jobs: ownJobs,
      role: () => t ? [h('div', {class: 'ds-role'}, h('span', {}, t.name + ' · ' + roles[t.role] + ' görünümü'), btn('Yönetici görünümüne dön', () => {sessionStorage.removeItem('gk-demo-person'); host().app.setState({screen: 'bugun', params: {t: Date.now()}, modal: null});}))] : []};
    el.replaceChildren(...(content[key]?.() || []));
  });
}
let queued = false;
function queue() { if (queued) return; queued = true; requestAnimationFrame(() => {queued = false; renderHosts(); if (suite() && !autoTimer && !sessionStorage.getItem('gk-demo-incoming-shown')) {autoTimer = setTimeout(() => {sessionStorage.setItem('gk-demo-incoming-shown', '1'); if (!person() && !window.GKUpdateDirty?.() && !document.querySelector('[aria-modal=true]') && !activeDialog) incoming();}, 7000);} }); }
new MutationObserver(queue).observe(document.body, {childList: true, subtree: true});
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]'); if (!link) return;
  const value=link.getAttribute('href'),url=new URL(value,location.href);
  if(url.protocol==='tel:'){
    event.preventDefault(); event.stopImmediatePropagation();
    const match=matchCustomer(db(),value.slice(4));startCall(match.status==='matched'?match.customerId:null,value.slice(4));
  }else if(!['blob:','data:'].includes(url.protocol)&&url.origin!==location.origin){event.preventDefault();event.stopImmediatePropagation();toast('Dış bağlantı açılmadı (demo).');}
}, true);
const nativeOpen=window.open.bind(window);
window.open=(url,...args)=>{const target=new URL(url,location.href);if(target.origin!==location.origin){toast('Dış bağlantı açılmadı (demo).');return null;}return nativeOpen(url,...args);};
window.GKDemoUI = {sms, startCall, incoming, cancelPendingCustomer(){pendingCustomer=null;}, async customerSaved(customerId) {if (!pendingCustomer) return; const pending = pendingCustomer; pendingCustomer = null; await run(pending.kind, {id: pending.id, customerId}, 'Yeni müşteri gelen kayda bağlandı.');}};
queue();
