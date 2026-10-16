// ureten: codex — Claude Design kuralları; sunucu doğrulaması engine.mjs.
// Günay Klima CRM — iş kuralları (GK.R), biçimlendirme (GK.F) ve servis katmanı (GK.ops).
// Ekranlar yalnız bu dosyadaki fonksiyonları kullanır. Backend entegrasyonunda GK.ops gövdeleri API çağrısına dönüşür.
export const GK = (() => {
  var MO = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var MS = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var DY = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  function pd(s) { var a = s.split('-').map(Number); return new Date(Date.UTC(a[0], a[1] - 1, a[2])); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  var D = {
    addDays: function (s, n) { var d = pd(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); },
    addMonths: function (s, n) { var d = pd(s), day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n); var last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); return iso(d); },
    diff: function (a, b) { return Math.round((pd(b) - pd(a)) / 864e5); },
    toMin: function (t) { var a = t.split(':').map(Number); return a[0] * 60 + a[1]; },
    fromMin: function (m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); },
    weekStart: function (s) { var d = pd(s), w = (d.getUTCDay() + 6) % 7; return D.addDays(s, -w); }
  };
  var nf = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Telefon ve giriş maskeleri. TR: her zaman 0 ile başlar, 11 hane, "0 5XX XXX XX XX". Yurt dışı: + ve 8–15 rakam (E.164).
  var P = {
    digits: function (s) { return String(s == null ? '' : s).replace(/\D/g, ''); },
    tr: function (v) { var d = P.digits(v); if (d.indexOf('90') === 0 && d.length > 11) d = d.slice(2); if (d && d[0] !== '0') d = '0' + d; d = d.slice(0, 11); return [d.slice(0, 1), d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)].filter(Boolean).join(' '); },
    intl: function (v) { var s = String(v || '').replace(/[^\d ]/g, '').replace(/\s{2,}/g, ' ').replace(/^\s+/, ''); var out = '', n = 0; for (var i = 0; i < s.length; i++) { if (s[i] === ' ') { out += ' '; continue; } if (n >= 15) break; out += s[i]; n++; } return '+' + out; },
    phone: function (v, intl) { return intl ? P.intl(v) : P.tr(v); },
    kind: function (v) { var d = P.digits(v); if (String(v || '')[0] === '+') return 'Yurt dışı'; if (d[1] === '5') return 'Cep'; if (d[1] === '8') return d.slice(1, 4) === '850' ? '0850 hattı' : d.slice(1, 4) === '800' ? 'Ücretsiz hat' : 'Özel hat'; return 'Sabit hat'; },
    validate: function (v, intl) {
      var d = P.digits(v);
      if (intl) { if (!d) return 'Ülke koduyla birlikte numara girin. Örnek: +49 151 2345 6789'; if (d.indexOf('90') === 0) return 'Türkiye numarası için “Türkiye” seçeneğini kullanın.'; if (d.length < 8) return 'Yanlış numara: yurt dışı numara ülke koduyla en az 8 rakam olmalı (' + d.length + ' girildi).'; if (d.length > 15) return 'Yanlış numara: en fazla 15 rakam olabilir.'; if (d[0] === '0') return 'Yanlış numara: ülke kodu 0 ile başlamaz.'; return null; }
      if (d.length <= 1) return 'Telefon numarasını girin. Örnek: 0 532 123 45 67';
      if (d.length < 11) return 'Yanlış numara: ' + (11 - d.length) + ' rakam eksik. Türkiye numaraları 0 dahil 11 hanedir.';
      if (d.length > 11) return 'Yanlış numara: ' + (d.length - 11) + ' rakam fazla.';
      if ('23458'.indexOf(d[1]) < 0) return 'Yanlış numara: 0’dan sonra 2, 3, 4 (sabit hat), 5 (cep) veya 8 (0850 vb.) gelmeli.';
      return null;
    },
    status: function (v, intl) {
      var d = P.digits(v), e = P.validate(v, intl);
      if (!e) return { ok: true, text: '✓ Geçerli ' + P.kind(v).toLocaleLowerCase('tr') + ' numarası' };
      if (intl) return { ok: false, text: d.length + ' / 8–15 rakam' };
      if (d.length > 1 && '23458'.indexOf(d[1]) < 0) return { ok: false, bad: true, text: 'Geçersiz başlangıç' };
      return { ok: false, text: Math.max(d.length, 1) + ' / 11 hane' + (d.length > 1 ? ' · ' + (11 - d.length) + ' eksik' : '') };
    },
    money: function (v) { var s = String(v == null ? '' : v).replace(/[^\d,]/g, ''); var i = s.indexOf(','); var a = i >= 0 ? s.slice(0, i) : s, b = i >= 0 ? s.slice(i + 1).replace(/,/g, '').slice(0, 2) : null; a = a.replace(/^0+(?=\d)/, '').slice(0, 10); a = a.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return b === null ? a : (a || '0') + ',' + b; },
    int: function (v, max) { var s = String(v == null ? '' : v).replace(/\D/g, '').replace(/^0+(?=\d)/, ''); return s.slice(0, max || 4); },
    dec: function (v) { var s = String(v == null ? '' : v).replace(',', '.').replace(/[^\d.]/g, ''); var i = s.indexOf('.'); return i >= 0 ? s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '').slice(0, 7) : s.slice(0, 3); },
    serial: function (v) { return String(v == null ? '' : v).toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24); },
    code: function (v) { return String(v == null ? '' : v).toUpperCase().replace(/[^A-Z0-9\-\/ ]/g, '').replace(/\s{2,}/g, ' ').slice(0, 32); },
    num: function (v) { if (v === '' || v == null) return null; if (typeof v === 'number') return Number.isFinite(v) ? v : null; var n = Number(String(v).replace(/\./g, '').replace(',', '.')); return isNaN(n) ? null : n; }
  };
  var F = {
    money: function (n) { return n == null ? 'Belirtilmedi' : nf.format(n) + ' ₺'; },
    date: function (s) { if (!s) return 'Belirtilmedi'; var d = pd(s); return d.getUTCDate() + ' ' + MO[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); },
    short: function (s) { if (!s) return '—'; var d = pd(s); return d.getUTCDate() + ' ' + MS[d.getUTCMonth()]; },
    weekday: function (s) { return DY[pd(s).getUTCDay()]; },
    km: function (n) { return n.toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' km'; },
    phone: function (p) { if (!p) return 'Belirtilmedi'; if (String(p)[0] === '+') return p; var d = P.digits(p); return d.length === 11 && d[0] === '0' ? P.tr(d) : p; },
    tel: function (p) { if (!p) return null; var d = P.digits(p); return 'tel:' + (String(p)[0] === '+' ? '+' + d : d[0] === '0' ? '+90' + d.slice(1) : d); }
  };
  var ST = {
    gecikti: { fg: '#A3001A', bg: '#FDECEE', dot: '#C8102E' },
    yaklasan: { fg: '#7A4A00', bg: '#FFF1D1', dot: '#D98A00' },
    guncel: { fg: '#1B6B3F', bg: '#E5F3EB', dot: '#2E9E5E' },
    plan: { fg: '#4B525B', bg: '#ECEEF1', dot: '#8A9099' },
    info: { fg: '#1D4F91', bg: '#E8F0FB', dot: '#3B73C4' },
    muted: { fg: '#5B626B', bg: '#F0F1F3', dot: '#A0A6AE' }
  };
  function badge(key, label) { var s = ST[key] || ST.muted; return { label: label, fg: s.fg, bg: s.bg, dot: s.dot, key: key }; }
  var TYPES = { bakim: 'Bakım', ariza: 'Arıza', kontrol: 'Kontrol', montaj: 'Montaj', gorusme: 'Görüşme' };
  var WOST = { planlandi: ['info', 'Planlandı'], islemde: ['yaklasan', 'İşlemde'], tamamlandi: ['guncel', 'Tamamlandı'], iptal: ['muted', 'İptal'] };
  var CALLR = { ulasilamadi: 'Ulaşılamadı', tekrar_ara: 'Tekrar ara', kabul: 'Kabul etti', istemiyor: 'İstemiyor', bilgi: 'Bilgi verildi' };
  var CONTACT = { izinli: ['guncel', 'İletişim izinli'], bilinmiyor: ['yaklasan', 'İletişim izni bilinmiyor'], istemiyor: ['muted', 'İletişim istemiyor'] };
  var lc = function (s) { return (s || '').toLocaleLowerCase('tr'); };
  var byId = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };

  var R = {
    addrLine: function(a){return a.line + (a.buildingNo?" · Bina "+a.buildingNo:"") + (a.doorNo?" · Kapı "+a.doorNo:"");},
    T: TYPES, CALLR: CALLR, byId: byId, badge: badge,
    staffName: function (db, id, fallback) { var s = id && byId(db.staff, id); return s ? s.name + (s.active ? '' : ' (pasif)') : (fallback || 'Belirtilmedi'); },
    activeStaff: function (db) { return db.staff.filter(function (s) { return s.active; }); },
    model: function (db, dev) {
      var p = dev.productId && byId(db.products, dev.productId);
      if (!p) return { code: null, series: dev.externalModel || 'Model belirtilmedi', title: dev.externalModel || 'Model belirtilmedi', level: 'dis', img: null, levelLabel: 'Katalog dışı' };
      return { code: p.code, series: p.series, title: p.code || p.series, level: p.level, img: p.img, type: p.type, levelLabel: p.level === 'seri' ? 'Seri düzeyinde · model kodu belirtilmedi' : p.series };
    },
    pTitle: function (p) { return p.code || p.series; },
    lastMaint: function (db, devId) { var best = null; db.history.forEach(function (h) { if (h.deviceId === devId && h.type === 'bakim' && h.done !== false && (!best || h.date > best.date)) best = h; }); return best; },
    next: function (db, dev) {
      if (dev.manualNext) return { date: dev.manualNext, basis: 'manual', note: 'Manuel tarih' + (dev.manualReason ? ': ' + dev.manualReason : '') };
      if (!dev.interval) return { date: null, basis: 'none', note: 'Bakım aralığı tanımlı değil' };
      var l = R.lastMaint(db, dev.id);
      if (l) return { date: D.addMonths(l.date, dev.interval), basis: 'last', note: 'Son bakım + ' + dev.interval + ' ay' };
      if (dev.baseRule === 'install' && dev.installDate) return { date: D.addMonths(dev.installDate, dev.interval), basis: 'install', note: 'Montaj tarihi başlangıç kabul edildi + ' + dev.interval + ' ay' };
      return { date: null, basis: 'nobase', note: 'Başlangıç tarihi yok' };
    },
    status: function (db, dev) {
      var n = R.next(db, dev);
      if (!n.date) return Object.assign(badge('plan', 'Bakım planı eksik'), { days: null, rank: 2 });
      var d = D.diff(db.today, n.date);
      if (d < 0) return Object.assign(badge('gecikti', 'Gecikti · ' + (-d) + ' gün'), { days: d, rank: 4 });
      if (d <= 30) return Object.assign(badge('yaklasan', d === 0 ? 'Bugün' : d + ' gün kaldı'), { days: d, rank: 3 });
      return Object.assign(badge('guncel', 'Güncel'), { days: d, rank: 1 });
    },
    worst: function (db, devs) { var w = null; devs.forEach(function (d) { var s = R.status(db, d); if (!w || s.rank > w.rank) w = s; }); return w || Object.assign(badge('muted', 'Cihaz yok'), { rank: 0 }); },
    isDue: function (db, dev) { var k = R.status(db, dev).key; return k === 'gecikti' || k === 'yaklasan'; },
    intervalLabel: function (dev) { return dev.interval ? dev.interval + ' ay' + (dev.intervalDemo ? ' (demo örneği)' : '') : 'Tanımlı değil'; },
    devicesAt: function (db, addrId) { return db.devices.filter(function (d) { return d.addressId === addrId && d.active !== false; }); },
    devicesOf: function (db, cId) { return db.devices.filter(function (d) { return d.customerId === cId && d.active !== false; }); },
    addrsOf: function (db, cId) { return db.addresses.filter(function (a) { return a.customerId === cId && a.active !== false; }); },
    locState: function (a) { return a.lat == null ? badge('gecikti', 'Konum yok') : a.verified ? badge('guncel', 'Konum doğrulandı') : badge('yaklasan', 'Konum doğrulanmadı'); },
    contact: function (c) { var x = CONTACT[c.contact] || CONTACT.bilinmiyor; return badge(x[0], x[1]); },
    woBadge: function (w) { var x = WOST[w.status]; return badge(x[0], x[1]); },
    plannedFor: function (db, devId) { return db.workOrders.filter(function (w) { return (w.status === 'planlandi' || w.status === 'islemde') && w.deviceIds.indexOf(devId) >= 0 && w.date >= db.today; }).sort(function (a, b) { return (a.date + a.start).localeCompare(b.date + b.start); })[0] || null; },
    lastCall: function (db, cId) { var c = db.calls.filter(function (k) { return k.customerId === cId; }).sort(function (a, b) { return b.date.localeCompare(a.date); }); return c[0] || null; },
    // Stok: fiziksel yalnız hareketlerden, rezerve onaylı satışların takılmamış kalemlerinden.
    stock: function (db, pId, wId) {
      var ph = 0, rs = 0;
      db.movements.forEach(function (m) {
        if (m.productId !== pId) return;
        if (m.kind === 'transfer') { if (m.depotId === wId) ph -= m.qty; if (m.toDepotId === wId) ph += m.qty; return; }
        if (m.depotId !== wId) return;
        ph += m.kind === 'cikis' ? -m.qty : m.qty;
      });
      db.sales.forEach(function (s) { if (s.status !== 'onayli') return; s.lines.forEach(function (l) { if (l.productId === pId && l.depotId === wId) rs += l.qty - l.installed; }); });
      return { physical: ph, reserved: rs, avail: ph - rs };
    },
    stockTotal: function (db, pId) { var t = { physical: 0, reserved: 0, avail: 0 }; db.depots.forEach(function (w) { var s = R.stock(db, pId, w.id); t.physical += s.physical; t.reserved += s.reserved; t.avail += s.avail; }); return t; },
    critical: function (db, p) { return p.threshold != null && R.stockTotal(db, p.id).avail <= p.threshold; },
    lastCost: function (db, pId) { var c = null; db.movements.forEach(function (m) { if (m.productId === pId && m.cost != null) c = m.cost; }); return c; },
    lineTotal: function (l) { return (l.qty * Math.round(l.price*100) - Math.round((l.disc||0)*100))/100; },
    saleTotals: function (db, s) { var t = 0; s.lines.forEach(function (l) { t += R.lineTotal(l); }); var p = 0; db.payments.forEach(function (y) { if (y.saleId === s.id) p += y.amount; }); return { total: Math.round(t*100)/100, paid: Math.round(p*100)/100, balance: (Math.round(t*100)-Math.round(p*100))/100 }; },
    saleState: function (s) {
      if (s.status === 'taslak') return Object.assign(badge('plan', 'Taslak'), { k: 'taslak' });
      if (s.status === 'iptal') return Object.assign(badge('muted', 'İptal'), { k: 'iptal' });
      var q = 0, i = 0; s.lines.forEach(function (l) { q += l.qty; i += l.installed; });
      if (i >= q) return Object.assign(badge('guncel', 'Montaj tamamlandı'), { k: 'tamam' });
      if (i > 0) return Object.assign(badge('info', 'Kısmi montaj'), { k: 'kismi' });
      return Object.assign(badge('yaklasan', 'Onaylandı · Montaj bekliyor'), { k: 'bekliyor' });
    },
    pendingUnits: function (s) { if (s.status !== 'onayli') return 0; var n = 0; s.lines.forEach(function (l) { n += l.qty - l.installed; }); return n; },
    stockProblems: function (db, s) {
      var need = {}; s.lines.forEach(function (l) { var k = l.productId + '|' + l.depotId; need[k] = (need[k] || 0) + l.qty - l.installed; });
      var out = []; Object.keys(need).forEach(function (k) { var a = k.split('|'), st = R.stock(db, a[0], a[1]); if (need[k] > st.avail) out.push({ productId: a[0], depotId: a[1], need: need[k], st: st }); });
      return out;
    },
    conflicts: function (db, f) {
      if (!f.techId || !f.date || !f.start) return [];
      var s = D.toMin(f.start), e = s + Number(f.dur || 60) + Number(f.buffer || 0);
      return db.workOrders.filter(function (w) { if (w.id === f.id || w.techId !== f.techId || w.date !== f.date || w.status === 'iptal' || w.status === 'tamamlandi') return false; var ws = D.toMin(w.start), we = ws + w.dur + (w.buffer || 0); return s < we && ws < e; });
    },
    // Çalışma saati / mola kontrolü (tasarım; çekirdekte henüz yok)
    offHours: function (db, f) {
      var t = f.techId && byId(db.staff, f.techId); if (!t || !t.hours || !f.start) return null;
      var s = D.toMin(f.start), e = s + Number(f.dur || 60), h = t.hours;
      if (s < D.toMin(h.start) || e > D.toMin(h.end)) return 'Çalışma saati dışında (' + h.start + '–' + h.end + ')';
      if (h.brk && s < D.toMin(h.brk[1]) && D.toMin(h.brk[0]) < e) return 'Mola saatine denk geliyor (' + h.brk[0] + '–' + h.brk[1] + ')';
      return null;
    },
    nextFree: function (w) { return D.fromMin(D.toMin(w.start) + w.dur + (w.buffer || 0)); },
    locSrc: function (a) {
      var map = { harita: 'Haritada doğrulandı', cihaz: 'Cihazdan alındı', adres: 'Adresten önerildi', mahalle: 'Yalnız mahalle bilgisi' };
      var src = a.src || (a.lat == null ? 'yok' : a.verified ? 'harita' : 'adres');
      return { label: map[src] || 'Konum yok', who: a.vBy ? a.vBy + ' · ' + F.date(a.vAt) : (a.verified ? 'Doğrulayan kişi ve tarih: sonraki entegrasyonda' : '') };
    },
    freeSlots: function (db, f) {
      var out = [], dur = Number(f.dur || 60);
      for (var m = 8 * 60; m + dur <= 18 * 60 + 30; m += 10) { var q = { techId: f.techId, date: f.date, start: D.fromMin(m), dur: dur, buffer: f.buffer, id: f.id }; if (!R.conflicts(db, q).length && !R.offHours(db, q)) out.push(D.fromMin(m)); }
      var want = f.start ? D.toMin(f.start) : 0;
      return out.sort(function (a, b) { return Math.abs(D.toMin(a) - want) - Math.abs(D.toMin(b) - want); }).slice(0, 4).sort();
    },
    dist: function (a, b) { var r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r; var h = Math.sin(dl / 2) * Math.sin(dl / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) * Math.sin(dg / 2); return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)); },
    // Merkeze kuş uçuşu uzaklık. Yalnız doğrulanmış konumlu ve bakımı gelen (gecikmiş / 30 gün) cihazı olan adresler alınır.
    // Kur: işlem tarihindeki (veya öncesindeki en yakın) kayıt. exact=false ise o gün için kur kaydı yok.
    fxAt: function (db, date) { var best = null; (db.fx || []).forEach(function (x) { if (x.date <= date && (!best || x.date > best.date)) best = x; }); return best ? { usd: best.usd, eur: best.eur, date: best.date, src: best.src, exact: best.date === date } : null; },
    fxText: function (db, amount, date, snap) {
      if (amount == null) return '';
      var x = snap || R.fxAt(db, date); if (!x) return 'Kur kaydı yok';
      var n2 = function (v) { return v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
      return '≈ ' + n2(amount / x.usd) + ' USD · ' + n2(amount / x.eur) + ' EUR (' + F.short(x.date) + ' ' + x.date.slice(0, 4) + (x.src === 'demo' ? ', demo kur' : x.src === 'elle' ? ', elle girilen kur' : ', TCMB') + (x.exact ? '' : ', önceki günün kuru') + ')';
    },
    FLAGS: { sikayet: 'Şikâyet', memnuniyetsiz: 'Memnuniyetsizlik', odeme: 'Ödeme sorunu', ulasilamiyor: 'Sürekli ulaşılamıyor', diger: 'Diğer olumsuzluk' },
    flag: function (c) { return c.flag ? badge('gecikti', 'Olumsuz deneyim · ' + R.FLAGS[c.flag.type]) : null; },
    // Müşteri yaşam döngüsü: kayıtlardan türetilir, elle aşama girilmez.
    lifecycle: function (db, c) {
      var sales = db.sales.filter(function (s) { return s.customerId === c.id; }), devs = R.devicesOf(db, c.id), calls = db.calls.filter(function (k) { return k.customerId === c.id; });
      var min = function (arr) { return arr.filter(Boolean).sort()[0] || null; };
      var bak = db.history.filter(function (h) { return h.type === 'bakim' && h.done !== false && devs.some(function (d) { return d.id === h.deviceId; }); }).map(function (h) { return h.date; });
      var st = [
        { k: 'aday', l: 'İlk temas', date: min(calls.map(function (k) { return k.date; }).concat(sales.map(function (s) { return s.date; })).concat(devs.map(function (d) { return d.installDate; })).concat(bak)) },
        { k: 'teklif', l: 'Teklif', date: min(sales.map(function (s) { return s.date; })) },
        { k: 'satis', l: 'Satış', date: min(sales.filter(function (s) { return s.status === 'onayli'; }).map(function (s) { return s.date; })) },
        { k: 'montaj', l: 'Montaj', date: min(devs.filter(function (d) { return d.fromGunay; }).map(function (d) { return d.installDate; })) },
        { k: 'bakim', l: 'Bakım döngüsü', date: min(bak) }
      ];
      if (!sales.length && devs.some(function (d) { return d.fromGunay === false; })) { st[1].skip = st[2].skip = st[3].skip = true; }
      var last = null; st.forEach(function (s) { if (s.date || (s.k === 'aday' && !s.date)) last = s.date ? s : last; });
      var label = c.active === false ? 'Pasif' : last ? ({ aday: 'Aday', teklif: 'Teklif aşamasında', satis: 'Satış yapıldı', montaj: 'Montajı yapıldı', bakim: 'Bakım müşterisi' })[last.k] : 'Yeni kayıt';
      var due = devs.some(function (d) { return R.status(db, d).key === 'gecikti'; });
      return { stages: st, label: label, risk: !!c.flag || due, riskText: c.flag ? R.FLAGS[c.flag.type] : due ? 'Bakımı geciken cihaz var' : '' };
    },
    norm: function (s) { return String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); },
    lev: function (a, b) { if (a === b) return 0; if (!a.length || !b.length) return Math.max(a.length, b.length); var p = [], i, j; for (j = 0; j <= b.length; j++) p[j] = j; for (i = 1; i <= a.length; i++) { var c = [i]; for (j = 1; j <= b.length; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[b.length]; },
    dupes: function (db, f) {
      var pd = f.phoneUnknown ? '' : String(f.phone || '').replace(/\D/g, ''), a = R.norm(f.name), la = R.norm(f.line), out = [];
      db.customers.forEach(function (c) {
        if (c.id === f.id) return;
        var rs = [], sc = 0, cd = String(c.phone || '').replace(/\D/g, ''), b = R.norm(c.name);
        if (pd.length >= 10 && cd.length >= 10 && cd.slice(-10) === pd.slice(-10)) { rs.push(['Aynı telefon', 'gecikti']); sc += 3; }
        else if (pd.length >= 9 && cd.length >= 7 && cd.slice(-7) === pd.slice(-7)) { rs.push(['Telefonun son 7 hanesi aynı', 'yaklasan']); sc += 1; }
        if (a.length >= 3 && b) {
          if (a === b) { rs.push(['Aynı ad', 'gecikti']); sc += 2; }
          else { var ta = a.split(' '), tb = b.split(' '), all = ta.length && ta.every(function (t) { return tb.some(function (u) { return u.indexOf(t) === 0 || t.indexOf(u) === 0; }); });
            if (all && a.length >= 4) { rs.push(['Benzer ad', 'yaklasan']); sc += 1; } else if (a.length >= 5 && R.lev(a, b) <= 2) { rs.push(['Yazımı çok benzer ad', 'yaklasan']); sc += 1; } }
        }
        if (la.length >= 6) { var hit = db.addresses.some(function (x) { return x.customerId === c.id && (R.norm(x.line) === la || R.lev(R.norm(x.line), la) <= 3); }); if (hit) { rs.push(['Aynı adres', 'gecikti']); sc += 2; } }
        if (sc > 0) out.push({ c: c, score: sc, reasons: rs });
      });
      return out.sort(function (x, y) { return y.score - x.score; }).slice(0, 3);
    },
    nearGroup: function (db, center, km) {
      var rows = [];
      db.addresses.forEach(function (a) {
        if (a.active === false || a.lat == null || !a.verified) return;
        var dist = R.dist(center, a); if (dist > km + 1e-9) return;
        var devs = R.devicesAt(db, a.id), due = devs.filter(function (d) { return R.isDue(db, d); }); if (!due.length) return;
        var c = byId(db.customers, a.customerId); if (!c || c.active === false) return;
        rows.push({ a: a, c: c, dist: dist, devs: devs, due: due, excluded: c.contact !== 'izinli', unknown: c.contact === 'bilinmiyor' });
      });
      rows.sort(function (x, y) { return x.dist - y.dist; });
      var ok = rows.filter(function (r) { return !r.excluded; }), cs = {};
      ok.forEach(function (r) { cs[r.c.id] = 1; });
      return { rows: rows, customers: Object.keys(cs).length, addresses: ok.length, devices: ok.reduce(function (n, r) { return n + r.due.length; }, 0), excluded: rows.length - ok.length };
    },
    plannedBakim: function (db, devId) { return db.workOrders.find(function (w) { return (w.status === 'planlandi' || w.status === 'islemde') && w.type === 'bakim' && w.deviceIds.indexOf(devId) >= 0; }) || null; },
    pinColor: function (db, devs) { var w = R.worst(db, devs); return (ST[w.key] || ST.muted).dot; },
    search: function (db, q) {
      q = lc(q.trim()); var dq = q.replace(/\D/g, ''); if (q.length < 1) return null;
      var hit = function (s) { return lc(s).indexOf(q) >= 0; };
      var cust = db.customers.filter(function (c) { if (c.active === false) return false; if (hit(c.name) || hit(c.person) || (dq.length >= 3 && (c.phone || '').replace(/\D/g, '').indexOf(dq) >= 0)) return true; return R.addrsOf(db, c.id).some(function (a) { return hit(a.line) || hit(a.mah) || hit(a.ilce); }); });
      var devs = db.devices.filter(function (d) { var m = R.model(db, d); return hit(d.serialIn) || hit(d.serialOut) || hit(m.code) || hit(m.series) || hit(d.room); });
      var sales = db.sales.filter(function (s) { var c = byId(db.customers, s.customerId); return hit(s.no) || hit(c && c.name); });
      return { customers: cust.slice(0, 6), devices: devs.slice(0, 6), sales: sales.slice(0, 5) };
    }
  };

  // ——— Servis katmanı: her işlem {ok, db, id} veya {ok:false, error, fields} döner. ———
  var uid = function (p) { return p + crypto.randomUUID(); };
  var fail = function (error, fields) { return { ok: false, error: error, fields: fields || {} }; };
  var put = function (arr, obj) { var i = arr.findIndex(function (x) { return x.id === obj.id; }); var n = arr.slice(); if (i >= 0) n[i] = Object.assign({}, arr[i], obj); else n.push(obj); return n; };
  var with_ = function (db, patch) { return Object.assign({}, db, patch); };
  var ops = {
    saveCustomer: function (db, f) {
      var e = {};
      if (!f.name || !f.name.trim()) e.name = 'Ad veya firma adı gerekli.';
      else if (f.name.trim().length < 2) e.name = 'Ad en az 2 karakter olmalı.';
      else if (/^[\d\s\W]+$/.test(f.name.trim())) e.name = 'Ad yalnız rakam veya işaretten oluşamaz.';
      if (!f.type) e.type = 'Müşteri türünü seçin.';
      if (!f.phoneUnknown) { var pe = P.validate(f.phone, f.phoneIntl); if (pe) e.phone = P.digits(f.phone).length <= 1 && !f.phoneIntl ? 'Telefon girin ya da “Telefon bilinmiyor” seçin.' : pe; }
      if (Object.keys(e).length) return fail('Eksik zorunlu alanlar var.', e);
      var id = f.id || uid('c');
      var c = { id: id, name: f.name.trim(), type: f.type, person: f.person || '', phone: f.phoneUnknown ? null : (f.phoneIntl ? P.intl(f.phone).trim() : P.tr(f.phone)), contact: f.contact || 'bilinmiyor', note: f.note || '', active: true };
      return { ok: true, id: id, db: with_(db, { customers: put(db.customers, c) }) };
    },
    flagCustomer: function (db, f) {
      if (!f.type) return fail('Olumsuzluk türünü seçin.', { flagType: 'Tür seçin.' });
      if (!(f.note || '').trim()) return fail('Kısa açıklama yazın.', { flagNote: 'Açıklama gerekli.' });
      var c = byId(db.customers, f.id), log = (c.flagLog || []).concat([{ date: db.today, action: 'isaret', type: f.type, note: f.note.trim() }]);
      return { ok: true, db: with_(db, { customers: put(db.customers, { id: f.id, flag: { type: f.type, note: f.note.trim(), date: db.today }, flagLog: log }) }) };
    },
    clearFlag: function (db, f) {
      if (!(f.note || '').trim()) return fail('Nasıl çözüldüğünü yazın.', { flagNote: 'Çözüm notu gerekli.' });
      var c = byId(db.customers, f.id), log = (c.flagLog || []).concat([{ date: db.today, action: 'cozuldu', type: c.flag && c.flag.type, note: f.note.trim() }]);
      return { ok: true, db: with_(db, { customers: put(db.customers, { id: f.id, flag: null, flagLog: log }) }) };
    },
    // Müşteri + isteğe bağlı ilk adres tek kayıtta. Konum (pin) sonradan doğrulanır.
    saveCustomerFull: function (db, f) {
      var ae = {};
      if (f.withAddr && !f.id && !(f.line || '').trim()) ae.line = 'Açık adres gerekli ya da adresi kaldırın.';
      var r = ops.saveCustomer(db, f);
      if (!r.ok) { r.fields = Object.assign({}, r.fields, ae); return r; }
      if (Object.keys(ae).length) return fail('Adres bilgisi eksik.', ae);
      if (!f.withAddr || f.id) return r;
      var r2 = ops.saveAddress(r.db, { customerId: r.id, label: f.label || 'Ev', line: f.line, mah: f.mah, ilce: f.ilce, lat: '', lng: '', verified: false });
      if (!r2.ok) return r2;
      return { ok: true, id: r.id, addressId: r2.id, db: r2.db };
    },
    // Olası mükerrer kayıt: telefon, ad (Türkçe karakter ve yazım farkı toleranslı) ve adres karşılaştırılır.
    archiveCustomer: function (db, id) { return { ok: true, db: with_(db, { customers: put(db.customers, { id: id, active: false }) }) }; },
    saveAddress: function (db, f) {
      var e = {};
      if (!f.line || !f.line.trim()) e.line = 'Açık adres gerekli.';
      var lat = f.lat === '' || f.lat == null ? null : Number(String(f.lat).replace(',', '.')), lng = f.lng === '' || f.lng == null ? null : Number(String(f.lng).replace(',', '.'));
      if ((lat == null) !== (lng == null) || (lat != null && (isNaN(lat) || isNaN(lng)))) e.coord = 'Enlem ve boylamı birlikte, sayı olarak girin.';
      if (f.verified && lat == null) e.coord = 'Konumu doğrulamak için önce haritadan pin seçin veya koordinat girin.';
      if (!e.coord && lat != null && (lat < -90 || lat > 90 || lng < -180 || lng > 180)) e.coord = 'Geçersiz koordinat: enlem −90…90, boylam −180…180 arasında olmalı.';
      if (!e.coord && lat != null && (lat < 35.8 || lat > 42.2 || lng < 25.6 || lng > 44.9)) e.coord = 'Koordinat Türkiye dışında görünüyor. Enlem (≈38,4) ve boylam (≈27,2) yer değiştirmiş olabilir.';
      if (Object.keys(e).length) return fail('Adres kaydedilemedi.', e);
      var id = f.id || uid('a');
      return { ok: true, id: id, db: with_(db, { addresses: put(db.addresses, { id: id, customerId: f.customerId, label: f.label || 'Ev', line: f.line.trim(), mah: f.mah || '', ilce: f.ilce || '', lat: lat, lng: lng, verified: !!f.verified && lat != null }) }) };
    },
    saveDevice: function (db, f) {
      var e = {};
      if (!f.addressId) e.addressId = 'Cihazın bulunduğu adresi seçin.';
      if (!f.productId && !(f.externalModel || '').trim()) e.productId = 'Katalogdan model seçin veya katalog dışı model yazın.';
      if (f.serialIn && db.devices.some(function (d) { return d.id !== f.id && d.serialIn && d.serialIn.toUpperCase() === f.serialIn.trim().toUpperCase(); })) e.serialIn = 'Bu iç ünite seri numarası başka bir cihazda kayıtlı. Kontrol edin.';
      if (f.manualNext && !(f.manualReason || '').trim()) e.manualReason = 'Manuel tarih için gerekçe yazın.';
      if (f.installDate && f.installDate > db.today) e.installDate = 'Montaj tarihi ileri bir tarih olamaz.';
      if (f.manualNext && f.installDate && f.manualNext < f.installDate) e.manualReason = 'Manuel bakım tarihi montaj tarihinden önce olamaz.';
      if (Object.keys(e).length) return fail('Cihaz kaydedilemedi.', e);
      var id = f.id || uid('d');
      var d = Object.assign({}, f, { id: id, serialIn: f.serialIn ? f.serialIn.trim() : null, serialOut: f.serialOut ? f.serialOut.trim() : null, interval: f.interval ? Number(f.interval) : null, intervalDemo: false });
      return { ok: true, id: id, db: with_(db, { devices: put(db.devices, d) }) };
    },
    saveWO: function (db, f) {
      var e = {};
      if (!f.customerId) e.customerId = 'Müşteri seçin.';
      if (!f.addressId) e.addressId = 'Adres seçin.';
      if (f.type !== 'montaj' && !(f.deviceIds || []).length) e.deviceIds = 'En az bir cihaz seçin.';
      if (!f.date) e.date = 'Tarih seçin.';
      if (!f.start) e.start = 'Saat seçin.';
      if (!f.techId) e.techId = 'Sorumlu teknisyen seçin.';
      if (f.date && !f.id && f.date < db.today) e.date = 'Geçmiş tarihe randevu açılamaz. Yapılmış işi Bakım › Geçmiş’ten kaydedin.';
      if (f.start && !/^\d{2}:\d{2}$/.test(f.start)) e.start = 'Saati SS:DD biçiminde girin.';
      var old = f.id && byId(db.workOrders, f.id);
      if (old && (old.date !== f.date || old.start !== f.start || old.techId !== f.techId) && !(f.changeReason || '').trim()) e.changeReason = 'Tarih/saat değişikliği için neden yazın.';
      if (!e.techId && !e.date && R.conflicts(db, f).length && !f.override) e.start = 'Teknisyenin bu saatte başka işi var.';
      if (Object.keys(e).length) return fail('Randevu kaydedilemedi.', e);
      var id = f.id || uid('wo');
      var log = (old && old.log || []).slice(); if (old && f.changeReason) log.push({ date: db.today, text: F.date(old.date) + ' ' + old.start + ' → ' + F.date(f.date) + ' ' + f.start + ' · ' + f.changeReason });
      var w = { id: id, customerId: f.customerId, addressId: f.addressId, type: f.type, date: f.date, start: f.start, dur: Number(f.dur), buffer: Number(f.buffer || 0), techId: f.techId, status: old ? old.status : 'planlandi', deviceIds: f.deviceIds || [], note: f.note || '', saleId: f.saleId, lineId: f.lineId, qty: f.qty, log: log, campaignId: f.campaignId };
      return { ok: true, id: id, db: with_(db, { workOrders: put(db.workOrders, w) }) };
    },
    collectFee: function (db, f) { if (!f.method) return fail('Ödeme yöntemini seçin.', { feeMethod: 'Yöntem seçin.' }); return { ok: true, db: with_(db, { workOrders: put(db.workOrders, { id: f.id, feePaid: true, feeMethod: f.method, feePaidAt: db.today }) }) }; },
    saveFx: function (db, f) { var u = Number(String(f.usd || '').replace(',', '.')), e2 = Number(String(f.eur || '').replace(',', '.')); if (!f.date || !(u > 0) || !(e2 > 0)) return fail('Tarih, USD ve EUR kurunu girin.', {}); if (f.date > db.today) return fail('İleri tarihli kur girilemez.', {}); if (u > 1000 || e2 > 1000) return fail('Kur değeri olağan dışı görünüyor; 1 USD/EUR’nun ₺ karşılığını girin.', {}); if (!(f.src || '').trim()) return fail('Kaynak notu gerekli (örn. TCMB döviz satış).', {}); var list = (db.fx || []).filter(function (x) { return x.date !== f.date; }).concat([{ date: f.date, usd: u, eur: e2, src: 'elle', note: f.src.trim() }]).sort(function (a, b) { return a.date.localeCompare(b.date); }); return { ok: true, db: with_(db, { fx: list }) }; },
    startWO: function (db, id) { return { ok: true, db: with_(db, { workOrders: put(db.workOrders, { id: id, status: 'islemde' }) }) }; },
    cancelWO: function (db, f) { if (!(f.note || '').trim()) return fail('İptal nedeni gerekli.', { note: 'İptal nedenini yazın.' }); return { ok: true, db: with_(db, { workOrders: put(db.workOrders, { id: f.id, status: 'iptal', cancelNote: f.note.trim() }) }) }; },
    completeWO: function (db, f) {
      var w = byId(db.workOrders, f.id), done = f.items.filter(function (i) { return i.done; });
      var e = {};
      if (!done.length) e.items = 'Gerçekten işlem yapılan en az bir cihazı işaretleyin. Hiçbirine işlem yapılmadıysa randevuyu iptal edin veya erteleyin.';
      if (!f.date) e.date = 'Tamamlanma tarihini girin.';
      if (f.date && f.date > db.today) e.date = 'Tamamlanma tarihi ileri bir tarih olamaz.';
      var fee = f.fee === '' || f.fee == null ? null : Number(String(f.fee).replace(/\./g, '').replace(',', '.'));
      if (fee != null && (isNaN(fee) || fee < 0)) e.fee = 'Ücreti sayı olarak girin.';
      if (fee != null && !f.feePaid) e.feePaid = 'Ücretin tahsil edilip edilmediğini seçin.';
      if (Object.keys(e).length) return fail('İş emri tamamlanamadı.', e);
      var h = db.history.slice();
      f.items.forEach(function (i) { h.push({ id: uid('h'), deviceId: i.deviceId, date: f.date, type: w.type, by: f.by || null, action: i.done ? (i.action || R.T[w.type]) : '', done: !!i.done, reason: i.done ? '' : (i.reason || 'Belirtilmedi'), fee: i.done && done.length === 1 ? fee : null, woId: w.id }); });
      return { ok: true, doneCount: done.length, notDone: f.items.filter(function (i) { return !i.done; }).map(function (i) { return i.deviceId; }), db: with_(db, { history: h, workOrders: put(db.workOrders, { id: w.id, status: 'tamamlandi', completedAt: f.date, completedBy: f.by || null, fee: fee, feePaid: fee != null ? f.feePaid === 'evet' : null, feeMethod: f.feePaid === 'evet' ? (f.feeMethod || '') : '', fx: fee != null ? R.fxAt(db, f.date) : null, note: f.note || w.note }) }) };
    },
    addCall: function (db, f) {
      var e = {};
      if (!f.result) e.result = 'Görüşme sonucunu seçin.';
      if (f.result === 'tekrar_ara' && !f.callback) e.callback = 'Tekrar arama tarihini seçin.';
      if (f.result === 'tekrar_ara' && f.callback && f.callback < db.today) e.callback = 'Tekrar arama tarihi bugünden önce olamaz.';
      if (f.flagIt && !f.flagType) e.flagType = 'Olumsuzluk türünü seçin.';
      if (Object.keys(e).length) return fail('Görüşme kaydedilemedi.', e);
      var k = { id: uid('k'), customerId: f.customerId, date: db.today, result: f.result, dir: f.dir || 'giden', topic: f.topic || '', callback: f.result === 'tekrar_ara' ? f.callback : null, note: f.note || '', campaignId: f.campaignId || null, addressId: f.addressId || null };
      var patch = { calls: db.calls.concat([k]) };
      if (f.noContact) patch.customers = put(db.customers, { id: f.customerId, contact: 'istemiyor' });
      if (f.flagIt && f.flagType) { var cc = byId(patch.customers || db.customers, f.customerId); patch.customers = put(patch.customers || db.customers, { id: f.customerId, flag: { type: f.flagType, note: f.note || 'Görüşmede işaretlendi', date: db.today }, flagLog: (cc.flagLog || []).concat([{ date: db.today, action: 'isaret', type: f.flagType, note: f.note || 'Görüşmede işaretlendi' }]) }); }
      return { ok: true, id: k.id, db: with_(db, patch) };
    },
    saveCampaign: function (db, f) {
      var e = {};
      if (!(f.name || '').trim()) e.name = 'Kampanya adı gerekli.';
      if (!(f.addressIds || []).length) e.addressIds = 'En az bir adres seçin.';
      if (!f.day) e.day = 'Önerilen ziyaret gününü seçin.';
      if (Object.keys(e).length) return fail('Kampanya planı kaydedilemedi.', e);
      var id = uid('kp');
      return { ok: true, id: id, db: with_(db, { campaigns: db.campaigns.concat([{ id: id, name: f.name.trim(), addressIds: f.addressIds, day: f.day, offer: f.offer || null, desc: f.desc || '', created: db.today }]) }) };
    },
    saveSale: function (db, f) {
      var e = {};
      if (!f.customerId) e.customerId = 'Müşteri seçin.';
      if (!f.addressId) e.addressId = 'Montaj adresini seçin.';
      if (!(f.lines || []).length) e.lines = 'En az bir satış kalemi ekleyin.';
      (f.lines || []).forEach(function (l) { var q = Number(l.qty), p = l.price == null ? null : Number(l.price), dsc = Number(l.disc || 0); if (!(q >= 1) || Math.floor(q) !== q) e.lines = 'Adet 1 veya daha büyük tam sayı olmalı.'; else if (q > 999) e.lines = 'Bir kalemde en fazla 999 adet olabilir.'; if (p == null || isNaN(p)) e.lines = 'Her kalem için birim satış fiyatı girin.'; else if (!(p > 0)) e.lines = 'Birim satış fiyatı 0 olamaz.'; if (p > 0 && dsc > q * p) e.lines = 'Satır indirimi satır tutarını (' + F.money(q * p) + ') aşamaz.'; if (dsc < 0) e.lines = 'İndirim negatif olamaz.'; if (l.cost != null && l.cost !== '' && Number(l.cost) < 0) e.lines = 'Alış maliyeti negatif olamaz.'; });
      if (f.date && f.date > db.today) e.date = 'Satış tarihi ileri bir tarih olamaz.';
      if (Object.keys(e).length) return fail('Satış kaydedilemedi.', e);
      var year = db.today.slice(0,4), n = db.sales.length + 1;
      var id = f.id || uid('s');
      var s = { id: id, no: 'S-' + year + '-' + String(n).padStart(5, '0'), customerId: f.customerId, addressId: f.addressId, date: f.date || db.today, status: 'taslak', note: f.note || '', lines: f.lines.map(function (l) { return Object.assign({ id: uid('l'), installed: 0 }, l, { qty: Number(l.qty), price: Number(l.price), disc: Number(l.disc || 0), cost: l.cost === '' || l.cost == null ? null : Number(l.cost) }); }) };
      s.fx = R.fxAt(db, s.date);
      if (f.confirm) { var sp = R.stockProblems(db, s); if (sp.length) return fail('Yetersiz stok: satış onaylanamadı. Taslak olarak kaydedebilirsiniz.', { stock: sp }); s.status = 'onayli'; }
      return { ok: true, id: id, db: with_(db, { sales: put(db.sales, s) }) };
    },
    confirmSale: function (db, id) {
      var s = byId(db.sales, id), p = R.stockProblems(db, s);
      if (p.length) return fail('Yetersiz stok', { stock: p });
      return { ok: true, db: with_(db, { sales: put(db.sales, { id: id, status: 'onayli' }) }) };
    },
    cancelSale: function (db, f) {
      var s = byId(db.sales, f.id), t = R.saleTotals(db, s), inst = s.lines.some(function (l) { return l.installed > 0; });
      if (inst || t.paid > 0) return fail('Bu satışta ' + (inst ? 'montaj yapılmış' : '') + (inst && t.paid ? ' ve ' : '') + (t.paid ? 'tahsilat var' : '') + '. Basit iptal yapılamaz; kontrollü iade gerekir.');
      if (!(f.note || '').trim()) return fail('İptal nedeni gerekli.', { note: 'İptal nedenini yazın.' });
      return { ok: true, db: with_(db, { sales: put(db.sales, { id: f.id, status: 'iptal', cancelNote: f.note.trim() }) }) };
    },
    addPayment: function (db, f) {
      var s = byId(db.sales, f.saleId), t = R.saleTotals(db, s), a = Number(String(f.amount || '').replace(/\./g, '').replace(',', '.'));
      var e = {};
      if (!f.date) e.date = 'Tarih seçin.';
      else if (f.date > db.today) e.date = 'Tahsilat tarihi ileri bir tarih olamaz.';
      else if (f.date < s.date) e.date = 'Tahsilat satış tarihinden önce olamaz.';
      if (!(a > 0)) e.amount = 'Tutarı sıfırdan büyük girin.';
      else if (a > t.balance + 0.001) e.amount = 'Tutar kalan bakiyeyi (' + F.money(t.balance) + ') aşıyor.';
      if (!f.method) e.method = 'Ödeme yöntemini seçin.';
      if (Object.keys(e).length) return fail('Tahsilat kaydedilemedi.', e);
      return { ok: true, db: with_(db, { payments: db.payments.concat([{ id: uid('y'), saleId: f.saleId, date: f.date, amount: a, method: f.method, note: f.note || '', fx: R.fxAt(db, f.date) }]) }) };
    },
    install: function (db, f) {
      var s = byId(db.sales, f.saleId), l = s && s.lines.find(function (x) { return x.id === f.lineId; }), e = {};
      if (!l) e.lineId = 'Satış kalemini seçin.';
      else if (l.installed >= l.qty) e.lineId = 'Bu kalemin bütün adetleri takılmış.';
      if (!f.date) e.date = 'Montaj tarihini girin.';
      if (f.date && f.date > db.today) e.date = 'Gerçekleşmemiş montaj kaydedilemez.';
      if (!f.by) e.by = 'Montajı yapan kişiyi seçin.';
      if (!(f.room || '').trim()) e.room = 'Oda / konum yazın.';
      if (f.serialIn && db.devices.some(function (d) { return d.serialIn && d.serialIn.toUpperCase() === f.serialIn.trim().toUpperCase(); })) e.serialIn = 'Bu iç ünite seri numarası başka bir cihazda kayıtlı.';
      if (Object.keys(e).length) return fail('Montaj kaydedilemedi.', e);
      var did = uid('d');
      var dev = { id: did, customerId: s.customerId, addressId: s.addressId, productId: l.productId, room: f.room.trim(), serialIn: f.serialIn ? f.serialIn.trim() : null, serialOut: f.serialOut ? f.serialOut.trim() : null, system: f.system || null, installDate: f.date, installBy: f.by, fromGunay: true, saleId: s.id, lineId: l.id, interval: f.interval ? Number(f.interval) : null, baseRule: f.baseInstall ? 'install' : null, note: f.note || '' };
      var lines = s.lines.map(function (x) { return x.id === l.id ? Object.assign({}, x, { installed: x.installed + 1 }) : x; });
      var patch = { devices: db.devices.concat([dev]), sales: put(db.sales, { id: s.id, lines: lines }), movements: db.movements.concat([{ id: uid('m'), date: f.date, kind: 'cikis', productId: l.productId, depotId: l.depotId, qty: 1, reason: 'Montaj', saleId: s.id, deviceId: did, customerId: s.customerId }]) };
      if (f.woId) patch.workOrders = put(db.workOrders, { id: f.woId, status: 'tamamlandi', completedAt: f.date, completedBy: f.by, deviceIds: [did] });
      return { ok: true, id: did, db: with_(db, patch) };
    },
    addMovement: function (db, f) {
      var e = {}, q = Number(f.qty);
      if (!f.productId) e.productId = 'Model seçin.';
      if (!f.depotId) e.depotId = 'Depo seçin.';
      if (!(q > 0) || Math.floor(q) !== q) e.qty = 'Adet pozitif tam sayı olmalı.'; else if (q > 9999) e.qty = 'Tek harekette en fazla 9.999 adet girilebilir.';
      if (f.date && f.date > db.today) e.date = 'Stok hareketi ileri tarihli olamaz.';
      if (!f.date) e.date = 'Tarih seçin.';
      if (f.kind === 'transfer' && (!f.toDepotId || f.toDepotId === f.depotId)) e.toDepotId = 'Farklı bir hedef depo seçin.';
      if ((f.kind === 'cikis' || f.kind === 'duzeltme') && !(f.reason || '').trim()) e.reason = 'Çıkış ve sayım düzeltmesi için gerekçe yazın.';
      var dec = f.kind === 'cikis' || f.kind === 'transfer' || (f.kind === 'duzeltme' && f.dir === 'eksik');
      if (!Object.keys(e).length && dec) { var st = R.stock(db, f.productId, f.depotId); if (q > st.avail) e.qty = 'Bu depoda satılabilir ' + st.avail + ' adet var (fiziksel ' + st.physical + ', rezerve ' + st.reserved + '). Stok negatif olamaz; rezerve ürün başka iş için düşülemez.'; }
      if (Object.keys(e).length) return fail('Stok hareketi kaydedilemedi.', e);
      var cost = f.cost === '' || f.cost == null ? null : Number(String(f.cost).replace(/\./g, '').replace(',', '.'));
      var m = { id: uid('m'), date: f.date, kind: f.kind, productId: f.productId, depotId: f.depotId, toDepotId: f.kind === 'transfer' ? f.toDepotId : undefined, qty: f.kind === 'duzeltme' && f.dir === 'eksik' ? -q : q, cost: f.kind === 'giris' ? cost : null, reason: f.reason || (f.kind === 'giris' ? 'Stok girişi' : '') };
      return { ok: true, db: with_(db, { movements: db.movements.concat([m]) }) };
    },
    saveProduct: function (db, f) {
      var e = {};
      if (!(f.brand || '').trim()) e.brand = 'Marka gerekli.';
      if (!(f.series || '').trim()) e.series = 'Seri / ürün adı gerekli.';
      if (!f.cat) e.cat = 'Kategori seçin.';
      if (!f.seriesLevel && !(f.code || '').trim()) e.code = 'Tam model kodunu yazın veya "Seri düzeyinde kayıt" seçin.';
      if (f.code && db.products.some(function (p) { return p.id !== f.id && p.code && p.code.toUpperCase() === f.code.trim().toUpperCase(); })) e.code = 'Bu model kodu katalogda zaten var.';
      if (Object.keys(e).length) return fail('Model kaydedilemedi.', e);
      var id = f.id || uid('p');
      var p = { id: id, brand: f.brand.trim(), series: f.series.trim(), type: f.type || '', code: f.seriesLevel ? null : f.code.trim().toUpperCase(), level: f.seriesLevel ? 'seri' : 'model', cat: f.cat, img: f.img || null, src: f.src || '', capacity: f.capacity || '', tech: f.tech || '', threshold: f.threshold === '' || f.threshold == null ? null : Number(f.threshold), price: null, parentId: f.parentId || null };
      return { ok: true, id: id, db: with_(db, { products: put(db.products, p) }) };
    },
    setThreshold: function (db, f) { return { ok: true, db: with_(db, { products: put(db.products, { id: f.id, threshold: f.value === '' ? null : Number(f.value) }) }) }; },
    saveStaff: function (db, f) { if (!(f.name || '').trim() || f.name.trim().length < 2) return fail('Ad soyad en az 2 karakter olmalı.', { name: 'Ad gerekli.' }); if (P.digits(f.phone).length > 1) { var spe = P.validate(f.phone, String(f.phone)[0] === '+'); if (spe) return fail(spe, { phone: spe }); } else f = Object.assign({}, f, { phone: null }); var id = f.id || uid('t'); return { ok: true, db: with_(db, { staff: put(db.staff, { id: id, name: f.name.trim(), phone: f.phone || null, active: f.active !== false }) }) }; },
    toggleStaff: function (db, id) { var s = byId(db.staff, id); return { ok: true, db: with_(db, { staff: put(db.staff, { id: id, active: !s.active }) }) }; },
    saveDepot: function (db, f) { if (!(f.name || '').trim()) return fail('Depo adı gerekli.', { name: 'Depo adı gerekli.' }); return { ok: true, db: with_(db, { depots: put(db.depots, { id: f.id || uid('w'), name: f.name.trim(), note: f.note || '' }) }) }; },
    applyRule: function (db, f) { var ids = f.ids; return { ok: true, db: with_(db, { settings: Object.assign({}, db.settings, { standardInterval: f.interval }), devices: db.devices.map(function (d) { return ids.indexOf(d.id) >= 0 ? Object.assign({}, d, { interval: f.interval, intervalDemo: false }) : d; }) }) }; },
    addHistory: function (db, f) {
      var e = {}; if (!f.deviceId) e.deviceId = 'Cihaz seçin.'; if (!f.date) e.date = 'Tarih girin.'; if (f.date > db.today) e.date = 'Geçmiş kayıt ileri tarihli olamaz.';
      if (Object.keys(e).length) return fail('Geçmiş kaydı eklenemedi.', e);
      var fee = f.fee ? Number(String(f.fee).replace(/\./g, '').replace(',', '.')) : null;
      return { ok: true, db: with_(db, { history: db.history.concat([{ id: uid('h'), deviceId: f.deviceId, date: f.date, type: f.type || 'bakim', by: f.by || null, action: f.action || '', fee: fee, done: true, legacy: true }]) }) };
    }
  };
  return { D: D, F: F, R: R, ops: ops, ST: ST, P: P };
})();
