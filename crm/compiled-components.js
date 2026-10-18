// ureten: codex. Precompiled controllers from the preserved Claude Design.
window.GKCompiled=Object.create(null);
window.GKCompiled["EkranAyarlar.dc.html"]=function(DCLogic,StreamableLogic,React){

const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
const SECT = [['isletme', 'İşletme bilgileri'], ['katalog', 'Klima kataloğu'], ['personel', 'Personel'], ['depolar', 'Depolar'], ['bakim', 'Bakım ayarları'], ['kur', 'Döviz kurları'], ['kullanici', 'Kullanıcılar'], ['veri', 'Veri aktarımı']].concat(window.GKApi.demo ? [['santral','Santral'],['sms','SMS'],['yedekleme','Yedekleme']] : []);
const MFK = ['brand', 'series', 'type', 'cat', 'code', 'threshold', 'src', 'capacity', 'tech', 'seriesLevel'];
class Component extends DCLogic {
  state = this.init(this.props.params || {});
  init(p) { return { section: p.section || 'katalog', cat: '', level: 'all', q: '', brand: '', mf: p.newModel ? { brand: 'Mitsubishi Electric', seriesLevel: false } : null, mfErr: {}, mfError: '', photoErr: '', doneId: null, sf: null, sfErr: '', df: null, rule: '', rulePrev: false, xf: { date: this.props.db ? this.props.db.today : '', usd: '', eur: '', src: '' }, xfErr: '', map: { 'Müşteri adı': 'name', 'Tel': 'phone', 'Semt': 'mah', 'Açıklama': 'note' } }; }
  _pt = (this.props.params || {}).t;
  componentDidUpdate() { const p = this.props.params || {}; const changed = this._pt !== p.t; this._pt = p.t; if (changed) this.setState(this.init(p)); }
  renderVals() {
    const db = this.props.db, act = this.props.act, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F } = window.GK, s = this.state, mobile = bp === 'mobile', set = x => this.setState(x);
    const sec = {}; SECT.forEach(([k]) => sec[k] = s.section === k);
    const q = s.q.toLocaleLowerCase('tr');
    const prods = db.products.filter(p => (!s.cat || p.cat === s.cat) && (s.level === 'all' || p.level === s.level) && (!s.brand || p.brand === s.brand) && (!q || (R.pTitle(p) + ' ' + p.series + ' ' + p.type).toLocaleLowerCase('tr').includes(q)));
    const catName = id => (R.byId(db.categories, id) || {}).name || id;
    const openMf = f => set({ mf: f, mfErr: {}, mfError: '', photoErr: '', doneId: null });
    const mf = s.mf, mfv = {}, mfOn = {}, mfEb = {};
    MFK.forEach(k => { mfv[k] = mf && mf[k] != null ? mf[k] : ''; mfOn[k] = e => { const P = window.GK.P, raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value; const v = k === 'code' ? P.code(raw) : k === 'threshold' ? P.int(raw, 3) : k === 'brand' || k === 'series' || k === 'type' ? String(raw).slice(0, 60) : raw; this.setState(st => ({ mf: Object.assign({}, st.mf, { [k]: v }), mfErr: Object.assign({}, st.mfErr, { [k]: null }) })); }; mfEb[k] = s.mfErr[k] ? '#C8102E' : '#CDD2D9'; });
    if (mf) mfv.img = mf.img || '';
    const parent = mf && mf.parentId && R.byId(db.products, mf.parentId);
    const affected = db.devices.filter(d => d.active !== false && !d.interval);
    const csv = () => { const rows = [['Ad / firma', 'Tür', 'Telefon', 'İletişim tercihi', 'Adresler', 'Cihaz sayısı']].concat(db.customers.filter(c => c.active !== false).map(c => [c.name, c.type, c.phone || 'Belirtilmedi', c.contact, R.addrsOf(db, c.id).map(a => a.label + ': ' + R.addrLine(a) + ' ' + a.mah + '/' + a.ilce).join(' | '), R.devicesOf(db, c.id).length])); const txt = '\ufeff' + rows.map(r => r.map(window.GKApi.csvCell).join(';')).join('\r\n'); const u = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' })), el = document.createElement('a'); el.href = u; el.download = 'gunay-musteriler-'+window.GKApi.space+'.csv'; document.body.appendChild(el); el.click(); el.remove();setTimeout(()=>URL.revokeObjectURL(u),1000); act.toast('Müşteri listesi CSV olarak indirildi.'); };
    const sfOn = {}; ['name', 'phone'].forEach(k => sfOn[k] = e => { const P = window.GK.P, raw = e.target.value, v = k === 'phone' ? (raw.trim()[0] === '+' ? P.intl(raw) : (P.digits(raw) ? P.tr(raw) : '')) : raw.slice(0, 60); this.setState(st => ({ sf: Object.assign({}, st.sf, { [k]: v }), sfErr: '' })); });
    const dfOn = {}; ['name', 'note'].forEach(k => dfOn[k] = e => this.setState(st => ({ df: Object.assign({}, st.df, { [k]: e.target.value }) })));
    const xfOn = {}; ['date', 'usd', 'eur', 'src'].forEach(k => xfOn[k] = e => { const v = k === 'usd' || k === 'eur' ? window.GK.P.dec(e.target.value) : e.target.value; this.setState(st => ({ xf: Object.assign({}, st.xf, { [k]: v }), xfErr: '' })); });
    const n4 = v => v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return {
      mobile, notMobile: !mobile, cols: mobile ? 'minmax(0,1fr)' : '220px minmax(0,1fr)', hideImg: act.hideImg, saving: this.props.saving, saveLabel: this.props.saving ? 'Kaydediliyor…' : 'Kaydet',
      mAlign: mobile ? 'flex-end' : 'center', mPad: mobile ? '0' : '24px', mRadius: mobile ? '16px 16px 0 0' : '16px',
      section: s.section, onSection: e => set({ section: e.target.value }),
      sections: SECT.map(([k, l]) => ({ k, l, sel: s.section === k, fw: s.section === k ? 600 : 500, bg: s.section === k ? '#FBEFF1' : 'transparent', fg: s.section === k ? '#B1001A' : '#252B32', pick: () => set({ section: k }) })),
      isIsletme: sec.isletme, isKatalog: sec.katalog, isPersonel: sec.personel && !window.GKApi.demo, demoPersonel: sec.personel && !!window.GKApi.demo, demoSantral: sec.santral, demoSMS: sec.sms, demoYedek: sec.yedekleme, isDepolar: sec.depolar, isBakim: sec.bakim, isKur: sec.kur, isKullanici: sec.kullanici, isVeri: sec.veri,
      openData:()=>window.GKApi.tools('data'),openBusiness:()=>window.GKApi.tools('business'),openHours:()=>window.GKApi.tools('hours'),biz: db.business, logoSrc: db.img.logo,
      shownN: db.products.length, newModel: () => openMf({ brand: 'Mitsubishi Electric', seriesLevel: false }),
      cats: [{ id: '', name: 'Tümü', count: db.products.length }].concat(db.categories.map(c=>Object.assign({},c,{count:db.products.filter(p=>p.cat===c.id).length}))).map(c => Object.assign({ l: c.name + ' · ' + c.count + ' kayıt', sel: s.cat === c.id, pick: () => set({ cat: c.id }) }, s.cat === c.id ? SEL : UNS)),
      levels: [['all', 'Tüm kayıtlar'], ['model', 'Model kodu tanımlı'], ['seri', 'Seri düzeyi']].map(([k, l]) => Object.assign({ l, sel: s.level === k, pick: () => set({ level: k }) }, s.level === k ? SEL : UNS)),
      q: s.q, onQ: e => set({ q: e.target.value }), brand: s.brand, onBrand: e => set({ brand: e.target.value }), brands: Array.from(new Set(db.products.map(p => p.brand))),
      catEmpty: !prods.length, catEmptyText: s.cat && !db.products.some(p => p.cat === s.cat) ? 'Bu kategoride henüz kayıt yok. Yeni model ekleyebilirsiniz.' : 'Aramaya uyan model yok.',
      products: prods.map(p => { const t = R.stockTotal(db, p.id); return { title: R.pTitle(p), sub: (p.level === 'model' ? p.series + ' · ' : '') + (p.type || '') + ' · ' + p.brand, img: p.img, noImg: p.img ? 'Görsel yüklenemedi' : 'Klima görseli eklenmedi', vars: (p.variants || []).length ? (p.variants || []).map(v => v.name) : null, level: p.level === 'seri' ? 'Seri düzeyi · model kodu yok' : 'Model kodu tanımlı', lvBg: p.level === 'seri' ? '#FFF1D1' : '#E5F3EB', lvFg: p.level === 'seri' ? '#7A4A00' : '#1B6B3F', cat: catName(p.cat), stock: t.physical ? 'Stok: fiziksel ' + t.physical + ' · satılabilir ' + t.avail : 'Stok hareketi yok', isSeri: p.level === 'seri', src: p.src,
        edit: () => openMf(Object.assign({}, p, { seriesLevel: p.level === 'seri', code: p.code || '', threshold: p.threshold == null ? '' : String(p.threshold) })),
        variant: () => openMf({ brand: p.brand, series: p.series, type: p.type, cat: p.cat, src: p.src, parentId: p.id, seriesLevel: false, code: '', variants: (p.variants || []).map(v => Object.assign({}, v)) }) }; }),
      mfOpen: !!mf, closeMf: () => set({ mf: null, doneId: null }), catOpts: db.categories, photoErr: s.photoErr,
      mf: mf ? { title: s.doneId ? 'Model kaydedildi' : mf.id ? 'Modeli düzenle' : parent ? 'Model varyantı tanımla' : 'Yeni model ekle', done: !!s.doneId, form: !s.doneId, doneText: (mf.seriesLevel ? mf.series + ' (seri düzeyi)' : (mf.code || '').toUpperCase()) + ' kataloğa kaydedildi.', toStock: () => act.go('depo', { move: true, productId: s.doneId }),
        v: mfv, on: mfOn, eb: mfEb, e: s.mfErr, error: s.mfError, seriesLevel: !!mf.seriesLevel, pickL: mf.img ? 'Fotoğrafı değiştir' : 'Fotoğraf seç / yükle',
        vars: (mf.variants || []).map((v, i) => ({ name: v.name || '', img: v.img || '', onName: e => this.setState(st => ({ mf: Object.assign({}, st.mf, { variants: st.mf.variants.map((x, j) => j === i ? Object.assign({}, x, { name: e.target.value.slice(0, 30) }) : x) }), mfErr: Object.assign({}, st.mfErr, { variants: null }) })), rm: () => this.setState(st => ({ mf: Object.assign({}, st.mf, { variants: st.mf.variants.filter((x, j) => j !== i) }) })), onFile: async e => {const file=e.target.files&&e.target.files[0];e.target.value='';if(!file)return;const form=this.state.mf;this.setState({photoErr:'Fotoğraf yükleniyor…'});try{const r=await window.GKApi.upload(file);if(!r.ok)throw Error(r.error);if(this.state.mf!==form)return;this.setState(st=>({photoErr:'',mf:Object.assign({},st.mf,{variants:st.mf.variants.map((x,j)=>j===i?Object.assign({},x,{img:r.url}):x)})}));}catch(e){this.setState({photoErr:e.message});}} })),
        varQuick: ['Beyaz', 'Siyah', 'Gümüş', 'Kırmızı', 'Gri'].filter(n => !(mf.variants || []).some(v => (v.name || '').toLocaleLowerCase('tr') === n.toLocaleLowerCase('tr'))).map(n => ({ l: n, add: () => this.setState(st => ({ mf: Object.assign({}, st.mf, { variants: (st.mf.variants || []).concat([{ name: n, img: null }]) }) })) })),
        addVar: () => this.setState(st => ({ mf: Object.assign({}, st.mf, { variants: (st.mf.variants || []).concat([{ name: '', img: null }]) }) })), varErr: s.mfErr.variants,
        parent: parent ? parent.series + ' seri kaydından kesin model kodu tanımlıyorsunuz. Seri kaydı korunur; stoklar ayrı tutulur.' : '', parentImg: parent && parent.img && !mf.img ? parent.img : '' } : {},
      onFile: async e => {const file=e.target.files&&e.target.files[0];e.target.value='';if(!file)return;set({photoErr:'Fotoğraf yükleniyor…'});try{const r=await window.GKApi.upload(file);if(!r.ok)throw Error(r.error);this.setState(st=>({mf:Object.assign({},st.mf,{img:r.url}),photoErr:''}));}catch(e){set({photoErr:e.message});}},
      removeImg: () => this.setState(st => ({ mf: Object.assign({}, st.mf, { img: null }) })), useParentImg: () => parent && this.setState(st => ({ mf: Object.assign({}, st.mf, { img: parent.img }) })),
      saveModel: () => act.submit('saveProduct', s.mf, r => { if (s.mf.id) { act.toast('Model güncellendi.'); set({ mf: null }); } else set({ doneId: r.id }); }, r => set({ mfErr: r.fields || {}, mfError: r.error })),
      staff: db.staff.map(t => { const jobs = db.workOrders.filter(w => w.techId === t.id).length + db.history.filter(h => h.by === t.id).length; return { name: t.name, phone: F.phone(t.phone), jobs: jobs + ' iş kaydı', b: t.active ? R.badge('guncel', 'Aktif') : R.badge('muted', 'Pasif'), toggleL: t.active ? 'Pasife al' : 'Aktifleştir', toggle: () => act.submit('toggleStaff', t.id, () => act.toast(t.name + (t.active ? ' pasife alındı; geçmiş işlerde adı korunur.' : ' aktifleştirildi.'))) }; }),
      staffForm: !!s.sf, sf: s.sf || {}, sfOn, sfErr: s.sfErr, newStaff: () => set({ sf: { name: '', phone: '' } }), saveStaff: () => act.submit('saveStaff', s.sf, () => { set({ sf: null }); act.toast('Personel eklendi.'); }, r => set({ sfErr: r.error })),
      depots: db.depots.map(w => { let u = 0; db.products.forEach(p => u += R.stock(db, p.id, w.id).physical); return { name: w.name, note: w.note || '—', units: u + ' adet fiziksel stok' }; }),
      depotForm: !!s.df, df: s.df || {}, dfOn, newDepot: () => set({ df: { name: '', note: '' } }), saveDepot: () => act.submit('saveDepot', s.df, () => { set({ df: null }); act.toast('Depo eklendi.'); }),
      ruleNow: db.settings.standardInterval ? db.settings.standardInterval + ' ay' : 'Tanımlı değil', ruleVal: s.rule, onRule: e => set({ rule: e.target.value, rulePrev: false }), noRule: !s.rule,
      previewRule: () => set({ rulePrev: true }), cancelRule: () => set({ rulePrev: false }), rulePreview: s.rulePrev, affectedN: affected.length,
      affected: affected.map(d => { const c = R.byId(db.customers, d.customerId), nx = R.next(db, Object.assign({}, d, { interval: Number(s.rule) })); return { name: c.name, dev: d.room + ' · ' + R.model(db, d).title, before: 'Bakım planı eksik', after: s.rule + ' ay · ' + (nx.date ? 'sonraki ' + F.date(nx.date) : 'sonraki tarih hesaplanamaz (son bakım / başlangıç yok)') }; }),
      applyRule: () => act.submit('applyRule', { interval: Number(s.rule), ids: affected.map(d => d.id) }, () => { set({ rulePrev: false }); act.toast('Kural ' + affected.length + ' cihaza uygulandı. Diğer cihazlar değişmedi.'); }),
      fxRows: (db.fx || []).slice().reverse().map(x => ({ date: F.date(x.date), usd: n4(x.usd) + ' ₺', eur: n4(x.eur) + ' ₺', src: x.src === 'demo' ? 'Demo değer' : x.src === 'elle' ? 'Elle · ' + (x.note || '') : 'TCMB' })),
      xf: s.xf, xfOn, xfErr: s.xfErr, saveFx: () => act.submit('saveFx', s.xf, () => { set({ xf: { date: db.today, usd: '', eur: '', src: '' } }); act.toast('Kur kaydı eklendi.'); }, r => set({ xfErr: r.error })),
      users: db.users,
      mapRows: Object.keys(s.map).map(col => ({ col, val: s.map[col], on: e => set({ map: Object.assign({}, s.map, { [col]: e.target.value }) }) })),
      sample: [{ a: 'Müşteri adı', b: 'Tel', c: 'Semt', warn: 'Kontrol', bg: '#F5F6F8', fg: '#747B85' }, { a: 'Örnek Kişi A', b: '0500 000 99 01', c: 'Evka 3', warn: 'Hazır', bg: '#FFFFFF', fg: '#1B6B3F' }, { a: 'Örnek Kişi B', b: '—', c: 'Erzene', warn: 'Telefon eksik', bg: '#FFFFFF', fg: '#7A4A00' }, { a: 'Örnek Kişi C', b: '0500 000 11 04', c: 'Kazımdirik', warn: 'Tekrar telefon: Levent Bozkurt', bg: '#FFFFFF', fg: '#A3001A' }, { a: 'Örnek Firma D', b: '0500 000 99 04', c: 'Bayraklı', warn: 'Hazır', bg: '#FFFFFF', fg: '#1B6B3F' }],
      exportCsv: csv
    };
  }
}

return Component;};
window.GKCompiled["EkranBakim.dc.html"]=function(DCLogic,StreamableLogic,React){

const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
const HH = 56, START = 8 * 60, END = 18 * 60 + 30;
const WOC = { planlandi: ['#E8F0FB', '#1D4F91', '#B9CDEB'], islemde: ['#FFF1D1', '#5C3800', '#F0D38C'], tamamlandi: ['#E5F3EB', '#1B6B3F', '#B6DCC5'], iptal: ['#F0F1F3', '#5B626B', '#D5D9DF'] };
class Component extends DCLogic {
  state = { view: (this.props.params || {}).view || 'gelen', filter: (this.props.params || {}).filter || 'gecikti', fMah: '', fModel: '', fTech: '', fFrom: '', fTo: '', cal: 'gun', day: null, hf: null, hfErr: '' };
  _pt = (this.props.params || {}).t;
  componentDidUpdate() { const p = this.props.params || {}; const changed = this._pt !== p.t; this._pt = p.t; if (changed) this.setState({ view: p.view || this.state.view, filter: p.filter || this.state.filter }); }
  renderVals() {
    const db = this.props.db, act = this.props.act, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F, D } = window.GK, s = this.state, mobile = bp === 'mobile', today = db.today, day = s.day || today;
    const set = x => this.setState(x), go = (sc, p) => () => act.go(sc, p);
    const allDevs = db.devices.filter(d => d.active !== false && (R.byId(db.customers, d.customerId) || {}).active !== false);
    const info = allDevs.map(d => { const st = R.status(db, d), a = R.byId(db.addresses, d.addressId), c = R.byId(db.customers, d.customerId), lm = R.lastMaint(db, d.id), nx = R.next(db, d), md = R.model(db, d); return { d, st, a, c, lm, nx, md }; });
    const cnt = k => info.filter(x => k === 'all' || (k === 'yaklasan' ? x.st.key === 'yaklasan' : x.st.key === k)).length;
    const due = info.filter(x => s.filter === 'all' || x.st.key === s.filter)
      .filter(x => !s.fMah || x.a.mah + ', ' + x.a.ilce === s.fMah).filter(x => !s.fModel || x.md.title === s.fModel).filter(x => !s.fTech || (x.lm && x.lm.by === s.fTech))
      .filter(x => !s.fFrom || (x.nx.date && x.nx.date >= s.fFrom)).filter(x => !s.fTo || (x.nx.date && x.nx.date <= s.fTo))
      .sort((a, b) => (a.st.days == null ? 9999 : a.st.days) - (b.st.days == null ? 9999 : b.st.days))
      .map(x => { const pw = R.plannedBakim(db, x.d.id), blocked = x.c.contact === 'istemiyor'; return { cName: x.c.name, addr: x.a.label + ' · ' + x.a.mah + ', ' + x.a.ilce, room: x.d.room, model: x.md.title, last: x.lm ? F.date(x.lm.date) + ' · ' + R.staffName(db, x.lm.by) : 'Kayıt yok', next: x.nx.date ? F.date(x.nx.date) : '—', basis: x.nx.basis === 'manual' ? 'Manuel tarih' : x.nx.note, st: x.st, planned: pw ? 'Randevu: ' + F.short(pw.date) + ' ' + pw.start : '', canCall: !blocked && x.st.key !== 'plan', isPlan: x.st.key === 'plan', canPlan: !pw, open: go('musteriler', { customerId: x.c.id, tab: 'klimalar', deviceId: x.d.id }), edit: go('musteriler', { customerId: x.c.id, tab: 'klimalar', deviceId: x.d.id }), call: () => act.open('call', { customerId: x.c.id, addressId: x.a.id }), plan: () => act.open('appt', { customerId: x.c.id, addressId: x.a.id, deviceIds: [x.d.id], type: 'bakim', dur: '60' }) }; });
    const chip = (k, l) => Object.assign({ l, n: cnt(k), sel: s.filter === k, pick: () => set({ filter: k }) }, s.filter === k ? SEL : UNS);
    // Gün görünümü
    const techs = R.activeStaff(db);
    const dayWos = db.workOrders.filter(w => w.date === day && w.status !== 'iptal');
    const pos = m => Math.round((m - START) / 60 * HH);
    const dayTechs = techs.map(t => {
      const h = t.hours || { start: '08:30', end: '18:00' }, hs = D.toMin(h.start), he = D.toMin(h.end), blocks = [], busy = [];
      blocks.push({ top: 0, h: pos(hs), static: true, bg: '#F5F6F8', bd: 'transparent', fg: '#747B85', cur: 'default', l1: 'Mesai dışı', l2: '', range: D.fromMin(START) + '–' + h.start, title: 'Mesai dışı' });
      blocks.push({ top: pos(he), h: pos(END) - pos(he), static: true, bg: '#F5F6F8', bd: 'transparent', fg: '#747B85', cur: 'default', l1: 'Mesai dışı', l2: '', range: h.end + '–' + D.fromMin(END), title: 'Mesai dışı' });
      if (h.brk) { const b0 = D.toMin(h.brk[0]), b1 = D.toMin(h.brk[1]); busy.push([b0, b1]); blocks.push({ top: pos(b0), h: pos(b1) - pos(b0), static: true, bg: '#F0F1F3', bd: '#D5D9DF', fg: '#4B525B', cur: 'default', l1: 'Mola', l2: h.brk[0] + '–' + h.brk[1], range: h.brk[0] + '–' + h.brk[1], title: 'Mola' }); }
      dayWos.filter(w => w.techId === t.id).sort((a, b) => a.start.localeCompare(b.start)).forEach(w => {
        const s0 = D.toMin(w.start), e0 = s0 + w.dur, c = R.byId(db.customers, w.customerId), a = R.byId(db.addresses, w.addressId), col = WOC[w.status], conf = R.conflicts(db, w).length > 0;
        busy.push([s0, e0 + (w.buffer || 0)]);
        blocks.push({ top: pos(s0) + 1, h: Math.max(28, pos(e0) - pos(s0) - 2), static: false, bg: col[0], fg: col[1], bd: conf ? '#C8102E' : col[2], cur: 'pointer', l1: w.start + '–' + D.fromMin(e0) + ' · ' + R.T[w.type] + (conf ? ' · Çakışma' : ''), l2: c.name + ' · ' + a.mah + ' · ' + R.woBadge(w).label, range: w.start + '–' + D.fromMin(e0), title: c.name, open: () => act.open('wo', { woId: w.id }) });
        if (w.buffer) blocks.push({ top: pos(e0), h: Math.max(18, pos(e0 + w.buffer) - pos(e0)), static: true, bg: 'repeating-linear-gradient(135deg,#FFFFFF 0 6px,#F3F4F6 6px 12px)', bd: '#D5D9DF', fg: '#4B525B', cur: 'default', l1: w.buffer + ' dk yol/hazırlık (kullanıcı tanımlı)', l2: 'Müsait: ' + R.nextFree(w), range: D.fromMin(e0) + '–' + R.nextFree(w), title: 'Kullanıcı tanımlı boşluk' });
      });
      busy.sort((a, b) => a[0] - b[0]);
      const free = []; let cur = hs; busy.forEach(([b0, b1]) => { if (b0 - cur >= 30) free.push(D.fromMin(cur) + '–' + D.fromMin(b0)); cur = Math.max(cur, b1); }); if (he - cur >= 30) free.push(D.fromMin(cur) + '–' + h.end);
      if (mobile) blocks.sort((a, b) => a.top - b.top);
      return { name: t.name, hours: 'Mesai ' + h.start + '–' + h.end + (h.brk ? ' · Mola ' + h.brk[0] + '–' + h.brk[1] : ''), free: free.join(', ') || 'Yok', blocks: mobile ? blocks.filter(b => b.l1 !== 'Mesai dışı') : blocks };
    });
    const hours = []; for (let m = START; m <= END; m += 60) hours.push({ top: pos(m), l: D.fromMin(m) });
    const ws = D.weekStart(day), dn = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const week = dn.map((n, i) => { const d = D.addDays(ws, i), its = db.workOrders.filter(w => w.date === d && w.status !== 'iptal').sort((a, b) => a.start.localeCompare(b.start)); return { label: n + ' ' + F.short(d), bg: d === today ? '#FFFAFA' : '#FFFFFF', bd: d === today ? '#B1001A' : '#E7E9ED', fg: d === today ? '#B1001A' : '#252B32', empty: !its.length, items: its.map(w => ({ time: w.start, type: R.T[w.type], cName: R.byId(db.customers, w.customerId).name, tech: R.staffName(db, w.techId), b: R.woBadge(w), bd: R.conflicts(db, w).length ? '#C8102E' : '#E7E9ED', open: () => act.open('wo', { woId: w.id }) })) }; });
    const upcoming = db.workOrders.filter(w => w.date >= today && w.status !== 'iptal' && w.status !== 'tamamlandi').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).map(w => { const a = R.byId(db.addresses, w.addressId); return { when: F.short(w.date) + ' · ' + w.start, cName: R.byId(db.customers, w.customerId).name, addr: a.mah + ', ' + a.ilce, devText: w.type === 'montaj' ? 'montaj' : w.deviceIds.length + ' cihaz', type: R.T[w.type], tech: R.staffName(db, w.techId), b: R.woBadge(w), open: () => act.open('wo', { woId: w.id }) }; });
    const K = { bakim: ['Bakım', '#1B6B3F', '#E5F3EB'], ariza: ['Arıza', '#A3001A', '#FDECEE'], kontrol: ['Kontrol', '#5B4A00', '#F6F0D8'], montaj: ['Montaj', '#1D4F91', '#E8F0FB'], iptal: ['İptal', '#5B626B', '#F0F1F3'] };
    const past = [];
    db.workOrders.filter(w => w.status === 'tamamlandi' || w.status === 'iptal').forEach(w => { const c = R.byId(db.customers, w.customerId), hs = db.history.filter(h => h.woId === w.id), done = hs.filter(h => h.done).length, k = K[w.status === 'iptal' ? 'iptal' : w.type]; past.push({ sort: w.completedAt || w.date, date: F.date(w.completedAt || w.date), kind: k[0], fg: k[1], bg: k[2], title: c.name + ' · İş emri', sub: w.status === 'iptal' ? 'İptal: ' + (w.cancelNote || '') : (hs.length ? done + '/' + hs.length + ' cihaza işlem yapıldı' : w.deviceIds.length + ' cihaz') + ' · ' + R.staffName(db, w.completedBy) + (w.fee != null ? ' · ' + F.money(w.fee) : ''), open: () => act.open('wo', { woId: w.id }), noOpen: false }); });
    db.history.filter(h => !h.woId && h.done !== false).forEach(h => { const d = R.byId(db.devices, h.deviceId), c = R.byId(db.customers, d.customerId), k = K[h.type]; past.push({ sort: h.date, date: F.date(h.date), kind: k[0], fg: k[1], bg: k[2], title: c.name + ' · ' + d.room, sub: (h.action || '') + ' · ' + R.staffName(db, h.by) + (h.fee != null ? ' · ' + F.money(h.fee) : '') + (h.legacy ? ' · sonradan girildi' : ''), open: go('musteriler', { customerId: c.id, tab: 'klimalar', deviceId: d.id }), noOpen: false }); });
    past.sort((a, b) => b.sort.localeCompare(a.sort));
    const hfOn = {}; ['deviceId', 'date', 'type', 'by', 'action', 'fee'].forEach(k => hfOn[k] = e => this.setState(st => ({ hf: Object.assign({}, st.hf, { [k]: e.target.value }), hfErr: '' })));
    const mahs = Array.from(new Set(info.map(x => x.a.mah + ', ' + x.a.ilce))).sort(), models = Array.from(new Set(info.map(x => x.md.title))).sort();
    const shift = n => set({ day: D.addDays(day, s.cal === 'hafta' ? 7 * n : n) });
    return {
      notMobile: !mobile, planNew: () => act.open('appt', { type: 'bakim', date: today, dur: '60' }),
      views: [['gelen', 'Bakımı gelenler'], ['randevu', 'Randevular'], ['gecmis', 'Geçmiş']].map(([k, l]) => ({ l, sel: s.view === k, bd: s.view === k ? '#B1001A' : 'transparent', fg: s.view === k ? '#B1001A' : '#4B525B', pick: () => set({ view: k }) })),
      v: { gelen: s.view === 'gelen', randevu: s.view === 'randevu', gecmis: s.view === 'gecmis' },
      chips: [chip('gecikti', 'Geciken'), chip('yaklasan', 'Önümüzdeki 30 gün'), chip('plan', 'Bakım planı eksik'), chip('all', 'Tümü')],
      fMah: s.fMah, fModel: s.fModel, fTech: s.fTech, fFrom: s.fFrom, fTo: s.fTo, mahs, models, staff: db.staff.map(t => ({ id: t.id, name: t.name + (t.active ? '' : ' (pasif)') })),
      onMah: e => set({ fMah: e.target.value }), onModel: e => set({ fModel: e.target.value }), onTech: e => set({ fTech: e.target.value }), onFrom: e => set({ fFrom: e.target.value }), onTo: e => set({ fTo: e.target.value }),
      due, dueEmpty: !due.length, wide: bp === 'desktop', dueCols: bp === 'desktop' ? 'minmax(160px,1.2fr) minmax(170px,1.2fr) 120px 150px 160px minmax(200px,auto)' : 'minmax(0,1fr)',
      calModes: [['gun', 'Gün'], ['hafta', 'Hafta'], ['liste', 'Liste']].map(([k, l]) => ({ l, sel: s.cal === k, bg: s.cal === k ? '#FFFFFF' : 'transparent', fg: s.cal === k ? '#252B32' : '#4B525B', pick: () => set({ cal: k }) })),
      cal: { day: s.cal === 'gun', week: s.cal === 'hafta', list: s.cal === 'liste' },
      prev: () => shift(-1), next: () => shift(1), toToday: () => set({ day: null }),
      rangeText: s.cal === 'hafta' ? F.short(ws) + ' – ' + F.date(D.addDays(ws, 6)) : s.cal === 'liste' ? 'Bugünden itibaren açık işler' : F.date(day) + ', ' + F.weekday(day),
      dayGrid: !mobile, dayList: mobile, dayTechs, hours, techN: techs.length, gridH: pos(END), gridMin: 56 + techs.length * 220,
      week, weekCols: mobile ? 'minmax(0,1fr)' : bp === 'tablet' ? 'repeat(4,minmax(0,1fr))' : 'repeat(7,minmax(0,1fr))',
      upcoming, listCols: mobile ? 'minmax(0,1fr)' : '130px minmax(0,1.4fr) minmax(0,1fr) 120px',
      past, pastCols: mobile ? '90px 84px 1fr' : '130px 100px 1fr',
      histForm: !!s.hf, hf: s.hf || {}, hfOn, hfErr: s.hfErr, openHist: () => set({ hf: { type: 'bakim', date: '', by: '', deviceId: '', action: '', fee: '' } }), closeHist: () => set({ hf: null }),
      allDevs: allDevs.map(d => ({ id: d.id, name: R.byId(db.customers, d.customerId).name + ' · ' + d.room + ' · ' + R.model(db, d).title })), staffAll: db.staff.map(t => ({ id: t.id, name: t.name + (t.active ? '' : ' (pasif)') })),
      saving: this.props.saving, saveLabel: this.props.saving ? 'Kaydediliyor…' : 'Kaydet',
      saveHist: () => act.submit('addHistory', s.hf, () => { act.toast('Geçmiş kayıt eklendi.'); set({ hf: null }); }, r => set({ hfErr: r.error + ' ' + Object.values(r.fields || {}).join(' ') }))
    };
  }
}

return Component;};
window.GKCompiled["EkranBugun.dc.html"]=function(DCLogic,StreamableLogic,React){

// [codex] Daily CRM view with integrated demo summary host.
const WOC = { planlandi: ['#E8F0FB', '#1D4F91', '#B9CDEB'], islemde: ['#FFF1D1', '#5C3800', '#F0D38C'], tamamlandi: ['#E5F3EB', '#1B6B3F', '#B6DCC5'] };
class Component extends DCLogic {
  state = { pv: 'saat', pday: null };
  tlRef = React.createRef();
  componentDidMount() { this.tick = setInterval(() => this.forceUpdate(), 30000); this.hookWheel(); }
  componentDidUpdate() { this.hookWheel(); }
  componentWillUnmount() { clearInterval(this.tick); if (this.wEl) this.wEl.removeEventListener('wheel', this.onWheel); }
  onWheel = e => { const el = this.wEl; if (!el || el.scrollWidth <= el.clientWidth) return; if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); el.style.scrollBehavior = 'auto'; el.scrollLeft += e.deltaY; } };
  hookWheel() {
    const el = this.tlRef.current; if (!el || el === this.wEl) return;
    if (this.wEl) this.wEl.removeEventListener('wheel', this.onWheel);
    this.wEl = el; el.addEventListener('wheel', this.onWheel, { passive: false });
    setTimeout(() => { if (this.nowFrac != null && el.scrollWidth > el.clientWidth) { const inner = el.firstElementChild; const x = 112 + (inner.scrollWidth - 112) * this.nowFrac; el.scrollLeft = Math.max(0, x - el.clientWidth / 2); } }, 60);
  }
  renderVals() {
    const db = this.props.db, act = this.props.act, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F, D } = window.GK, mobile = bp === 'mobile', today = db.today;
    const go = (s, p) => () => act.go(s, p);
    const wos = db.workOrders.filter(w => w.date === today && w.status !== 'iptal').sort((a, b) => a.start.localeCompare(b.start));
    const od = db.devices.filter(d => R.status(db, d).key === 'gecikti');
    const odC = new Set(od.map(d => d.customerId)).size;
    const pend = db.sales.filter(s => R.pendingUnits(s) > 0), pendU = pend.reduce((n, s) => n + R.pendingUnits(s), 0), pendToday = wos.filter(w => w.type === 'montaj' && w.status !== 'tamamlandi').length;
    const crit = db.products.filter(p => R.critical(db, p));
    const techs = new Set(wos.map(w => w.techId)).size;
    const cards = [
      { label: 'Bugünkü randevular', n: wos.length, sub: techs + ' teknisyen · ' + wos.filter(w => w.status === 'tamamlandi').length + ' tamamlandı', dot: '#3B73C4', go: go('bakim', { view: 'randevu' }) },
      { label: 'Bakımı geciken cihazlar', n: od.length, sub: odC + ' müşteride · cihaz sayısıdır, müşteri sayısı değil', dot: '#C8102E', go: go('bakim', { view: 'gelen', filter: 'gecikti' }) },
      { label: 'Montaj bekleyen cihazlar', n: pendU, sub: pend.length + ' satışta' + (pendToday ? ' · ' + pendToday + ' montaj bugün planlı' : ''), dot: '#D98A00', go: go('satis', { filter: 'montaj' }) },
      { label: 'Kritik stoktaki modeller', n: crit.length, sub: 'Satılabilir adet kritik eşikte veya altında', dot: '#D98A00', go: go('depo', { critical: true }) }
    ];
    const pday = this.state.pday || today, dayWos = db.workOrders.filter(w => w.date === pday && w.status !== 'iptal').sort((a, b) => a.start.localeCompare(b.start));
    const DN = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const DL = ['PAZ', 'PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'], MS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'], BC = { bakim: '#2E9E5E', ariza: '#C8102E', kontrol: '#D98A00', montaj: '#3B73C4' };
    const days = [0, 1, 2, 3, 4, 5, 6].map(i => { const d = D.addDays(today, i), list = db.workOrders.filter(w => w.date === d && w.status !== 'iptal'), sel = d === pday, dt = new Date(d + 'T00:00:00Z'); const bars = list.length ? list.slice(0, 6).map(w => ({ c: sel ? 'rgba(255,255,255,.85)' : BC[w.type] })) : [{ c: sel ? 'rgba(255,255,255,.3)' : '#E7E9ED' }]; return { l1: i === 0 ? 'BUGÜN' : i === 1 ? 'YARIN' : DL[dt.getUTCDay()], num: dt.getUTCDate(), mon: MS[dt.getUTCMonth()], n: list.length ? list.length + ' iş' : 'Boş gün', bars, today: i === 0, dotC: sel ? '#FFFFFF' : '#B1001A', sel, op: sel ? 0.9 : 0.62, bg: sel ? '#B1001A' : '#FFFFFF', fg: sel ? '#FFFFFF' : '#252B32', bd: sel ? '#B1001A' : '#E7E9ED', sh: sel ? '0 6px 16px rgba(177,0,26,.25)' : '0 1px 2px rgba(37,43,50,.04)', pick: () => this.setState({ pday: d }) }; });
    const lastEnd = dayWos.reduce((n, w) => Math.max(n, D.toMin(w.start) + w.dur + (w.buffer || 0)), 0);
    const T0 = 8 * 60, T1 = Math.max(20 * 60, Math.ceil(lastEnd / 60) * 60), pc = m => ((m - T0) / (T1 - T0) * 100).toFixed(2) + '%', pw = m => (m / (T1 - T0) * 100).toFixed(2) + '%';
    const ticks = []; for (let m = T0; m <= T1; m += 60) ticks.push({ left: pc(m), l: D.fromMin(m) });
    const nd = new Date(), nowMin = nd.getHours() * 60 + nd.getMinutes(), nowOn = pday === today, nf = Math.max(0, Math.min(1, (nowMin - T0) / (T1 - T0)));
    const now = { show: nowOn, t: D.fromMin(nowMin) + (nowMin < T0 ? ' · gün başlamadı' : nowMin > T1 ? ' · gün bitti' : ''), left: 'calc(112px + (100% - 112px) * ' + nf.toFixed(4) + ')', pastW: (nf * 100).toFixed(2) + '%' };
    this.nowFrac = nowOn ? nf : null;
    const tlRows = R.activeStaff(db).map(t => {
      const h = t.hours || { start: '00:00', end: '23:59' }, hs = D.toMin(h.start), he = D.toMin(h.end), segs = [];
      const st = (l, a, b, bg) => ({ static: true, left: pc(a), width: pw(b - a), bg, bd: 'transparent', fg: '#747B85', cur: 'default', l, l2: '', title: l });
      if (hs > T0) segs.push(st('', T0, hs, '#F5F6F8')); if (he < T1) segs.push(st('Mesai dışı', he, T1, '#F5F6F8'));
      if (h.brk && h.brk.length===2) segs.push(Object.assign(st('Mola', D.toMin(h.brk[0]), D.toMin(h.brk[1]), '#EEF0F3'), { bd: '#D5D9DF', fg: '#4B525B', l2: h.brk[0] + '–' + h.brk[1] }));
      dayWos.filter(w => w.techId === t.id).forEach(w => { const s0 = D.toMin(w.start), c = R.byId(db.customers, w.customerId), col = WOC[w.status] || WOC.planlandi; segs.push({ pe: 'auto', static: false, left: pc(s0), width: pw(w.dur), bg: col[0], fg: col[1], bd: col[2], cur: 'pointer', l: w.start + ' ' + c.name, l2: R.T[w.type] + ' · ' + R.woBadge(w).label, title: c.name, open: e => { if (e) e.stopPropagation(); act.open('wo', { woId: w.id }); } }); if (w.buffer) segs.push({ static: true, left: pc(s0 + w.dur), width: pw(w.buffer), bg: 'repeating-linear-gradient(135deg,#FFFFFF 0 5px,#ECEEF1 5px 10px)', bd: '#D5D9DF', fg: '#4B525B', cur: 'default', l: w.buffer + ' dk', l2: 'boşluk', title: 'Kullanıcı tanımlı yol/hazırlık boşluğu' }); });
      segs.forEach(g => { if (g.pe === undefined) g.pe = 'none'; });
      return { name: t.name, hours: t.hours ? h.start + '–' + h.end : 'Mesai tanımlanmamış', segs, onTrack: e => { const rc = e.currentTarget.getBoundingClientRect(); const fr = Math.max(0, Math.min(1, (e.clientX - rc.left) / rc.width)); const mins = Math.min(T1 - 30, Math.round((T0 + fr * (T1 - T0)) / 15) * 15); act.open('appt', { techId: t.id, date: pday < today ? today : pday, start: D.fromMin(mins), dur: '60', type: 'bakim' }); } };
    });
    const program = dayWos.map(w => {
      const c = R.byId(db.customers, w.customerId), a = R.byId(db.addresses, w.addressId);
      return { time: w.start, end: D.fromMin(D.toMin(w.start) + w.dur), cName: c.name, addr: a.label + ' · ' + a.mah + ', ' + a.ilce, devText: w.type === 'montaj' ? (w.qty || 1) + ' cihaz montajı' : w.deviceIds.length + ' cihaz', tech: R.staffName(db, w.techId), type: R.T[w.type], b: R.woBadge(w), open: () => act.open('wo', { woId: w.id }) };
    });
    const groups = {};
    db.devices.forEach(d => { const st = R.status(db, d); if ((st.key !== 'gecikti' && st.key !== 'yaklasan') || R.plannedBakim(db, d.id)) return; (groups[d.addressId] = groups[d.addressId] || []).push({ d, st }); });
    const calls = Object.keys(groups).map(aid => {
      const a = R.byId(db.addresses, aid), c = R.byId(db.customers, a.customerId), list = groups[aid].sort((x, y) => x.st.days - y.st.days), w = list[0];
      const lm = R.lastMaint(db, w.d.id), nx = R.next(db, w.d), blocked = c.contact === 'istemiyor';
      const otherWo = db.workOrders.find(x => x.addressId === aid && x.date >= today && (x.status === 'planlandi' || x.status === 'islemde'));
      return {
        days: w.st.days, cName: c.name, addr: a.label + ' · ' + a.mah, devText: list.length === 1 ? R.model(db, w.d).title + ' (' + w.d.room + ')' : list.length + ' cihaz: ' + list.map(x => x.d.room).join(', '),
        last: lm ? F.date(lm.date) : 'kayıt yok', next: F.date(nx.date), st: w.st, ct: R.contact(c), showCt: c.contact !== 'izinli', canCall: !blocked, op: blocked ? 0.7 : 1,
        note: blocked ? 'İletişim istemiyor; aranmaz. Müşteri ararsa randevu planlanabilir.' : otherWo ? 'Bugün ' + R.T[otherWo.type].toLowerCase() + ' randevusu var; arıza işlemi bakım sayılmaz.' : '',
        open: go('musteriler', { customerId: c.id, tab: 'klimalar' }),
        call: () => act.open('call', { customerId: c.id, addressId: aid }),
        plan: () => act.open('appt', { customerId: c.id, addressId: aid, deviceIds: list.map(x => x.d.id), type: 'bakim', dur: '60' })
      };
    }).sort((x, y) => x.days - y.days);
    const latest = {};
    db.calls.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(k => latest[k.customerId] = k);
    const callbacks = Object.values(latest).filter(k => k.result === 'tekrar_ara' && k.callback).sort((a, b) => a.callback.localeCompare(b.callback)).map(k => {
      const c = R.byId(db.customers, k.customerId), dd = D.diff(today, k.callback);
      return { cName: c.name, when: (dd < 0 ? 'Gecikti · ' : dd === 0 ? 'Bugün · ' : dd === 1 ? 'Yarın · ' : '') + F.date(k.callback), note: k.note, call: () => act.open('call', { customerId: c.id }) };
    });
    const stock = crit.map(p => { const t = R.stockTotal(db, p.id), drafts = db.sales.filter(s => s.status === 'taslak' && s.lines.some(l => l.productId === p.id)); return { title: R.pTitle(p), avail: t.avail, th: p.threshold, demand: drafts.length ? drafts.length + ' taslak satış ' + drafts.reduce((n, s) => n + s.lines.filter(l => l.productId === p.id).reduce((m, l) => m + l.qty, 0), 0) + ' adet istiyor' : '', go: go('depo', { critical: true }) }; });
    const center = db.addresses.find(a=>a.verified&&a.lat!=null&&a.lng!=null)||{lat:38.4237,lng:27.1428,mah:'Henüz doğrulanmış adres yok',ilce:''}, g = center.id?R.nearGroup(db, center, 1):{rows:[],customers:0,addresses:0,devices:0,excluded:0};
    const near = {
      center: { lat: center.lat, lng: center.lng }, km: 1, kmText: '1 km', zoom: 15, area: center.mah + ', ' + center.ilce,
      pins: g.rows.map(r => ({ id: r.a.id, lat: r.a.lat, lng: r.a.lng, color: r.excluded ? '#A0A6AE' : R.pinColor(db, r.due), label: String(r.due.length), title: r.c.name })),
      customers: g.customers, addresses: g.addresses, devices: g.devices, excluded: g.excluded > 0,
      excludedText: g.excluded + ' müşterinin iletişim izni uygun olmadığı için gruba alınmadı. Konumu doğrulanmamış adresler hesaba katılmaz.',
      open: go('harita', { group: true })
    };
    const t = today;
    return {
      nextJob: (() => { if (!mobile) return null; const w = wos.find(x => x.status === 'islemde') || wos.find(x => x.status === 'planlandi'); if (!w) return null; const c = R.byId(db.customers, w.customerId), a = R.byId(db.addresses, w.addressId); return { kicker: w.status === 'islemde' ? 'ŞU AN İŞLEMDE' : 'SIRADAKİ İŞ', time: w.start, type: R.T[w.type], devText: w.type === 'montaj' ? (w.qty || 1) + ' cihaz montajı' : w.deviceIds.length + ' cihaz', cName: c.name, addr: a.label + ' · ' + a.line + ', ' + a.mah, tech: R.staffName(db, w.techId), status: R.woBadge(w).label, dir: 'https://www.google.com/maps/dir/?api=1&destination=' + (a.lat != null && a.verified ? a.lat + ',' + a.lng : encodeURIComponent(a.line + ', ' + a.mah + ', ' + a.ilce + ', İzmir')), tel: F.tel(c.phone) || '#', open: () => act.open('wo', { woId: w.id }) }; })(),
      notMobile: !mobile, dateText: F.date(t) + ', ' + F.weekday(t),
      newCustomer: () => act.open('customer', { type: 'Kişi', contact: 'bilinmiyor' }), planNew: () => act.open('appt', { type: 'bakim', date: today, dur: '60' }), toCalendar: go('bakim', { view: 'randevu' }),
      cards, cardCols: mobile ? 'repeat(2,minmax(0,1fr))' : bp === 'tablet' ? 'repeat(2,minmax(0,1fr))' : 'repeat(4,minmax(0,1fr))',
      mapRatio: mobile ? '4 / 5' : '16 / 9', topCols: bp === 'desktop' ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)',
      mainCols: bp === 'desktop' ? 'minmax(0,1.7fr) minmax(320px,1fr)' : 'minmax(0,1fr)',
      program, noProgram: !program.length, days, ticks, tlRows, now, tlRef: this.tlRef, tlMinW: 112 + Math.round((T1 - T0) / 60 * 96), pvSaat: this.state.pv === 'saat' && program.length > 0, pvListe: this.state.pv === 'liste',
      progTitle: pday === today ? 'Bugünkü program' : 'Program · ' + F.date(pday) + ', ' + F.weekday(pday),
      pvModes: [['liste', 'Liste'], ['saat', 'Saat çizelgesi']].map(([k, l]) => ({ l, sel: this.state.pv === k, bg: this.state.pv === k ? '#FFFFFF' : 'transparent', fg: this.state.pv === k ? '#B1001A' : '#4B525B', pick: () => this.setState({ pv: k }) })), progCols: mobile ? '56px minmax(0,1fr) auto' : '72px minmax(0,1fr) auto',
      calls, callCols: mobile ? 'minmax(0,1fr)' : 'minmax(0,1fr) auto auto', badgeAlign: mobile ? 'flex-start' : 'flex-end',
      callbacks, noCallbacks: !callbacks.length, stock, near
    };
  }
}

return Component;};
window.GKCompiled["EkranDepo.dc.html"]=function(DCLogic,StreamableLogic,React){

const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
const MK = { giris: ['Giriş', '#1B6B3F', '#E5F3EB'], cikis: ['Çıkış', '#A3001A', '#FDECEE'], transfer: ['Transfer', '#1D4F91', '#E8F0FB'], duzeltme: ['Sayım düzeltmesi', '#7A4A00', '#FFF1D1'] };
class Component extends DCLogic {
  state = this.init(this.props.params || {});
  init(p) { return { depot: 'all', q: '', view: 'kart', critical: !!p.critical, mv: p.move ? { kind: 'giris', productId: p.productId || '', depotId: 'w1', qty: '1', date: this.props.db && this.props.db.today, dir: 'eksik' } : null, mvErr: {}, mvError: '', thr: null, thVal: '' }; }
  _pt = (this.props.params || {}).t;
  componentDidUpdate() { const p = this.props.params || {}; const changed = this._pt !== p.t; this._pt = p.t; if (changed) this.setState(this.init(p)); }
  renderVals() {
    const db = this.props.db, act = this.props.act, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F } = window.GK, s = this.state, mobile = bp === 'mobile', set = x => this.setState(x);
    const deps = s.depot === 'all' ? db.depots : db.depots.filter(w => w.id === s.depot);
    const used = db.products.filter(p => db.movements.some(m => m.productId === p.id) || db.sales.some(x => x.status === 'onayli' && x.lines.some(l => l.productId === p.id)));
    const q = s.q.toLocaleLowerCase('tr');
    const list = used.filter(p => !q || (R.pTitle(p) + ' ' + p.series).toLocaleLowerCase('tr').includes(q)).filter(p => !s.critical || R.critical(db, p));
    let known = 0; const missing = [];
    db.products.forEach(p => { const t = R.stockTotal(db, p.id); if (t.physical <= 0) return; const c = R.lastCost(db, p.id); if (c == null) missing.push(R.pTitle(p) + ' (' + t.physical + ')'); else known += c * t.physical; });
    const items = list.map(p => { const t = R.stockTotal(db, p.id), crit = R.critical(db, p), lc = R.lastCost(db, p.id); return { title: R.pTitle(p), sub: p.level === 'seri' ? 'Seri düzeyinde stok · kapasite belirtilmedi' : p.series + ' · ' + p.type, img: p.img, noImg: p.img ? 'Görsel yüklenemedi' : 'Klima görseli eklenmedi', crit, th: p.threshold, thText: p.threshold == null ? 'tanımlı değil' : p.threshold, bd: crit ? '#F0D38C' : '#E7E9ED',
      rows: deps.map(w => { const st = R.stock(db, p.id, w.id); return { name: w.name, ph: st.physical, rs: st.reserved, av: st.avail }; }).concat(deps.length > 1 ? [{ name: 'Toplam', ph: t.physical, rs: t.reserved, av: t.avail }] : []),
      hasVars: (p.variants || []).length > 0, varRows: (p.variants || []).map(v => { let av = 0; deps.forEach(w => av += R.stock(db, p.id, w.id, v.name).avail); return { name: v.name, av, fg: av > 0 ? '#1B6B3F' : '#A3001A' }; }), costText: lc == null ? 'Son alış maliyeti: Belirtilmedi' : 'Son alış maliyeti: ' + F.money(lc), thEdit: s.thr === p.id,
      move: () => set({ mv: { kind: 'giris', productId: p.id, depotId: deps[0].id, qty: '1', date: db.today, dir: 'eksik' }, mvErr: {}, mvError: '' }), thr: () => set({ thr: s.thr === p.id ? null : p.id, thVal: p.threshold == null ? '' : String(p.threshold) }) }; });
    const tableRows = []; list.forEach(p => deps.forEach(w => { const st = R.stock(db, p.id, w.id), crit = R.critical(db, p); tableRows.push({ title: R.pTitle(p), depot: w.name, ph: st.physical, rs: st.reserved, av: st.avail, th: p.threshold == null ? '—' : p.threshold, st: p.threshold == null ? 'Eşik yok' : crit ? 'Kritik' : 'Yeterli', stFg: crit ? '#7A4A00' : p.threshold == null ? '#747B85' : '#1B6B3F' }); }));
    const moves = db.movements.slice().reverse().map(m => { const p = R.byId(db.products, m.productId), k = MK[m.kind], c = m.customerId && R.byId(db.customers, m.customerId), sale = m.saleId && R.byId(db.sales, m.saleId); const neg = m.kind === 'cikis' || m.qty < 0; return { date: F.date(m.date), kind: k[0], fg: k[1], bg: k[2], title: R.pTitle(p), qty: m.kind === 'transfer' ? m.qty + ' adet' : (neg ? '−' : '+') + Math.abs(m.qty), qFg: neg ? '#A3001A' : m.kind === 'transfer' ? '#1D4F91' : '#1B6B3F', depot: m.kind === 'transfer' ? R.byId(db.depots, m.depotId).name + ' → ' + R.byId(db.depots, m.toDepotId).name : R.byId(db.depots, m.depotId).name, reason: (m.reason || '—') + (m.cost != null ? ' · birim ' + F.money(m.cost) : ''), link: sale ? sale.no + ' · ' + c.name : '', open: sale ? () => act.go('satis', { saleId: sale.id }) : null }; });
    const mv = s.mv || {}, mvOn = {};
    ['productId', 'depotId', 'toDepotId', 'qty', 'date', 'cost', 'reason', 'dir'].forEach(k => mvOn[k] = e => { const P = window.GK.P, raw = e.target.value, v = k === 'qty' ? P.int(raw, 4) : k === 'cost' ? P.money(raw) : k === 'reason' ? raw.slice(0, 140) : raw; this.setState(st => ({ mv: Object.assign({}, st.mv, { [k]: v }), mvErr: Object.assign({}, st.mvErr, { [k]: null }), mvError: '' })); });
    const stNow = mv.productId && mv.depotId ? R.stock(db, mv.productId, mv.depotId, mv.variant || undefined) : null;
    const mvP = mv.productId && R.byId(db.products, mv.productId);
    const costN = mv.cost ? Number(String(mv.cost).replace(/\./g, '').replace(',', '.')) : null;
    return {
      notMobile: !mobile, hideImg: act.hideImg, mAlign: mobile ? 'flex-end' : 'center', mPad: mobile ? '0' : '24px', mRadius: mobile ? '16px 16px 0 0' : '16px', saving: this.props.saving, saveLabel: this.props.saving ? 'Kaydediliyor…' : 'Kaydet',
      openMove: () => set({ mv: { kind: 'giris', productId: '', depotId: 'w1', qty: '1', date: db.today, dir: 'eksik' }, mvErr: {}, mvError: '' }),
      value: { text: 'Maliyeti bilinen ürünler: ' + F.money(known), missing: missing.length ? 'Alış maliyeti eksik: ' + missing.join(', ') + '. Toplam depo değeri kesin değildir.' : '' },
      q: s.q, onQ: e => set({ q: e.target.value }),
      depChips: [{ id: 'all', name: 'Tüm depolar' }].concat(db.depots).map(w => Object.assign({ l: w.name, sel: s.depot === w.id, pick: () => set({ depot: w.id }) }, s.depot === w.id ? SEL : UNS)),
      critical: s.critical, toggleCrit: () => set({ critical: !s.critical }), critChip: s.critical ? SEL : UNS, critN: db.products.filter(p => R.critical(db, p)).length,
      viewModes: [['kart', 'Kartlar'], ['tablo', 'Tablo']].map(([k, l]) => ({ l, sel: s.view === k, bg: s.view === k ? '#FFFFFF' : 'transparent', fg: s.view === k ? '#252B32' : '#4B525B', pick: () => set({ view: k }) })),
      items, cards: s.view === 'kart' && items.length > 0, table: s.view === 'tablo' && items.length > 0, tableRows, empty: !items.length,
      thVal: s.thVal, onThVal: e => set({ thVal: window.GK.P.int(e.target.value, 3) }), todayIso: db.today, saveThr: () => act.submit('setThreshold', { id: s.thr, value: s.thVal }, () => { set({ thr: null }); act.toast('Kritik eşik güncellendi.'); }),
      moves, moveCols: mobile ? '90px 1fr' : '120px 130px minmax(0,1fr) auto',
      moveOpen: !!s.mv, mv, mvOn, mve: s.mvErr, mvError: s.mvError, closeMove: () => set({ mv: null }),
      kinds: [['giris', 'Giriş'], ['cikis', 'Çıkış'], ['transfer', 'Transfer'], ['duzeltme', 'Sayım farkı']].map(([k, l]) => Object.assign({ l, sel: mv.kind === k, pick: () => this.setState(st => ({ mv: Object.assign({}, st.mv, { kind: k }), mvErr: {}, mvError: '' })) }, mv.kind === k ? SEL : UNS)),
      products: db.products.map(p => ({ id: p.id, name: R.pTitle(p) + (p.level === 'seri' ? ' (seri düzeyi)' : '') })), depots: db.depots.map(w => ({ id: w.id, name: w.name })),
      hasMvVars: !!(mvP && (mvP.variants || []).length), mvVars: mvP ? (mvP.variants || []).map(v => Object.assign({ l: v.name, sel: mv.variant === v.name, pick: () => this.setState(st => ({ mv: Object.assign({}, st.mv, { variant: v.name }), mvErr: Object.assign({}, st.mvErr, { variant: null }) })) }, mv.variant === v.name ? SEL : UNS)) : [],
      depLabel: mv.kind === 'transfer' ? 'Kaynak depo' : 'Depo', isTransfer: mv.kind === 'transfer', isFix: mv.kind === 'duzeltme', isIn: mv.kind === 'giris',
      costFx: costN ? R.fxText(db, costN, mv.date || db.today) : 'Boş bırakılırsa maliyet “Belirtilmedi” olur, sıfır sayılmaz.',
      stockNow: stNow ? 'Bu depoda şu an: fiziksel ' + stNow.physical + ' · rezerve ' + stNow.reserved + ' · satılabilir ' + stNow.avail : '',
      qtyBd: s.mvErr.qty ? '#C8102E' : '#CDD2D9', reasonBd: s.mvErr.reason ? '#C8102E' : '#CDD2D9',
      reasonLabel: mv.kind === 'duzeltme' ? 'Sayım farkı gerekçesi *' : mv.kind === 'cikis' ? 'Çıkış nedeni *' : 'Açıklama',
      saveMove: () => act.submit('addMovement', s.mv, () => { set({ mv: null }); act.toast('Stok hareketi kaydedildi.'); }, r => set({ mvErr: r.fields || {}, mvError: r.error }))
    };
  }
}

return Component;};
window.GKCompiled["EkranHarita.dc.html"]=function(DCLogic,StreamableLogic,React){

const PIN = { gecikti: '#C8102E', yaklasan: '#D98A00', planlandi: '#3B73C4', plan: '#8A9099', guncel: '#2E9E5E' };
const LEG = [['gecikti', 'Geciken'], ['yaklasan', 'Yaklaşan'], ['planlandi', 'Planlandı'], ['plan', 'Plan eksik'], ['guncel', 'Güncel']];
const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
class Component extends DCLogic {
  listRef = React.createRef();
  state = this.initState();
  initState() {
    const mem = (this.props.act && this.props.act.recall('harita')) || {};
    const p = this.props.params || {};
    const s = Object.assign({ tab: 'grup', mode: 'harita', km: 1, customKm: '', centerId: 'a1', filters: { gecikti: true, yaklasan: true, planlandi: true, plan: true, guncel: false }, sel: null, stops: [], checked: null, tech: 'all', campForm: false, cf: {}, cfErr: '', campId: null, sug: null, focus: null }, mem.state || {});
    this.view = mem.view || null;
    if (p.group) Object.assign(s, { tab: 'grup', centerId: 'a1', km: 1, focus: { key: 'g' + p.t, group: true } });
    if (p.addressId) Object.assign(s, { sel: p.addressId, focus: { key: 'a' + p.t, aid: p.addressId } });
    return s;
  }
  componentDidUpdate(pp, ps) {
    this.props.act && this.props.act.keep('harita', { state: Object.assign({}, this.state, { focus: null, sug: null }), view: this.view });
    if (this.scrollTo && this.listRef.current) { const el = this.listRef.current.querySelector('[data-aid="' + this.scrollTo + '"]'); if (el) this.listRef.current.scrollTop = Math.max(0, el.offsetTop - 60); this.scrollTo = null; }
  }
  componentWillUnmount() { this.props.act && this.props.act.keep('harita', { state: Object.assign({}, this.state, { focus: null, sug: null }), view: this.view }); }
  addrClass(db, a) {
    const R = window.GK.R, devs = R.devicesAt(db, a.id);
    if (devs.some(d => R.plannedBakim(db, d.id))) return { key: 'planlandi', devs };
    const w = R.worst(db, devs); return { key: devs.length ? w.key : 'plan', devs };
  }
  lastCall(db, cId) { let best = null; db.calls.forEach((k, i) => { if (k.customerId === cId && (!best || k.date >= best.date)) best = k; }); return best; }
  renderVals() {
    const db = this.props.db, act = this.props.act, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F, D } = window.GK, s = this.state, mobile = bp === 'mobile', today = db.today;
    const set = p => this.setState(p);
    const km = s.customKm && Number(String(s.customKm).replace(',', '.')) > 0 ? Number(String(s.customKm).replace(',', '.')) : s.km;
    const centerA = db.addresses.find(a=>a.id===s.centerId&&a.verified&&a.lat!=null)||db.addresses.find(a=>a.verified&&a.lat!=null)||{lat:38.4237,lng:27.1428,mah:'Doğrulanmış adres yok'}, center = s.centerId === 'biz' && Number.isFinite(db.business.lat) ? { lat: db.business.lat, lng: db.business.lng } : { lat: centerA.lat, lng: centerA.lng };
    const cls = {}; db.addresses.forEach(a => cls[a.id] = this.addrClass(db, a));
    const withCoords = db.addresses.filter(a => a.active !== false && a.lat != null);
    const counts = {}; LEG.forEach(([k]) => counts[k] = withCoords.filter(a => cls[a.id].key === k).length);
    const legend = LEG.map(([k, l]) => { const on = !!s.filters[k]; return { label: l, n: counts[k], color: PIN[k], on, op: on ? 1 : 0.55, bg: on ? '#FFFFFF' : '#F5F6F8', bd: on ? '#B9BFC7' : '#E7E9ED', toggle: () => set({ filters: Object.assign({}, s.filters, { [k]: !on }) }) }; });
    const g = centerA.id?R.nearGroup(db, center, km):{rows:[],customers:0,addresses:0,devices:0,excluded:0};
    const gRows = g.rows.filter(r => s.filters[cls[r.a.id].key]);
    const okRows = gRows.filter(r => !r.excluded), cset = {}; okRows.forEach(r => cset[r.c.id] = 1);
    const gDev = okRows.reduce((n, r) => n + r.due.length, 0), gAll = okRows.reduce((n, r) => n + r.devs.length, 0);
    const checked = s.checked || (() => { const o = {}; okRows.forEach(r => { if (r.c.contact === 'izinli') o[r.a.id] = true; }); return o; })();
    const stops = s.stops.filter(id => R.byId(db.addresses, id));
    const stopIdx = {}; stops.forEach((id, i) => stopIdx[id] = i + 1);
    const groupIds = {}; gRows.forEach(r => groupIds[r.a.id] = 1);
    const daily = db.workOrders.filter(w => w.date === today && w.status !== 'iptal' && (s.tech === 'all' || w.techId === s.tech)).sort((a, b) => a.start.localeCompare(b.start));
    const dailyIds = {}; daily.forEach((w, i) => { if (!dailyIds[w.addressId]) dailyIds[w.addressId] = i + 1; });
    const visible = withCoords.filter(a => s.filters[cls[a.id].key] || stopIdx[a.id] || a.id === s.sel);
    const pins = visible.map(a => {
      const k = cls[a.id].key, c = R.byId(db.customers, a.customerId), n = stopIdx[a.id];
      const ctx = s.tab === 'grup' ? (stops.length ? !!n : !!groupIds[a.id]) : s.tab === 'gunluk' ? !!dailyIds[a.id] : true;
      return { id: a.id, lat: a.lat, lng: a.lng, color: a.verified ? PIN[k] : '#D98A00', hollow: !a.verified, stop: s.tab === 'grup' && !!n || s.tab === 'gunluk' && !!dailyIds[a.id], label: s.tab === 'grup' && n ? String(n) : s.tab === 'gunluk' && dailyIds[a.id] ? String(dailyIds[a.id]) : a.verified ? String(cls[a.id].devs.length) : '?', dim: !ctx && a.id !== s.sel, title: c.name + ' · ' + a.label };
    });
    const route = s.tab === 'grup' ? stops.map(id => R.byId(db.addresses, id)) : s.tab === 'gunluk' && s.tech !== 'all' ? daily.map(w => R.byId(db.addresses, w.addressId)).filter(a => a.lat != null && a.verified) : [];
    const select = (aid, fromMap) => { if (fromMap) this.scrollTo = aid; set({ sel: aid, focus: fromMap ? s.focus : { key: 'sel' + aid + Date.now(), aid } }); };
    const boundsOf = list => list.filter(a => a && a.lat != null).map(a => [a.lat, a.lng]);
    let focus = s.focus;
    if (focus && focus.aid) { const a = R.byId(db.addresses, focus.aid); focus = a && a.lat != null ? { key: focus.key, lat: a.lat, lng: a.lng, zoom: 16 } : null; }
    else if (focus && focus.group) focus = { key: focus.key, bounds: boundsOf((stops.length ? stops.map(id => R.byId(db.addresses, id)) : gRows.map(r => r.a)).concat([centerA])) };
    else if (focus && focus.all) focus = { key: focus.key, bounds: boundsOf(visible) };
    const pt = a => a.lat != null && a.verified ? a.lat + ',' + a.lng : encodeURIComponent(R.addrLine(a) + ', ' + a.mah + ', ' + a.ilce + ', ' + (a.city || ''));
    const dirOne = a => 'https://www.google.com/maps/dir/?api=1&destination=' + pt(a) + '&travelmode=driving';
    const stopA = stops.map(id => R.byId(db.addresses, id)), parts = [];
    for (let i = 0; i < stopA.length; i += 4) { const ch = stopA.slice(i, i + 4), origin = i > 0 ? '&origin=' + pt(stopA[i - 1]) : ''; parts.push({ l: (stopA.length > 4 ? 'Bölüm ' + (parts.length + 1) + ': ' : '') + 'Google Maps’te yol tarifi (' + (i + 1) + '–' + (i + ch.length) + '. durak)', url: 'https://www.google.com/maps/dir/?api=1' + origin + '&destination=' + pt(ch[ch.length - 1]) + (ch.length > 1 ? '&waypoints=' + ch.slice(0, -1).map(pt).join('%7C') : '') + '&travelmode=driving' }); }
    const apptOf = aid => db.workOrders.filter(w => w.addressId === aid && w.date >= today && (w.status === 'planlandi' || w.status === 'islemde')).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
    const apptText = w => w ? F.short(w.date) + ' ' + w.start + '–' + D.fromMin(D.toMin(w.start) + w.dur) + ' · ' + R.staffName(db, w.techId) + ' (' + R.T[w.type] + ')' : '';
    const fixed = stopA.map((a, i) => ({ i, w: apptOf(a.id) })).filter(x => x.w);
    let orderWarn = '';
    for (let i = 1; i < fixed.length; i++) { const p = fixed[i - 1].w, q = fixed[i].w; if ((p.date + p.start) > (q.date + q.start)) { orderWarn = 'Sıra sabit saatli randevularla çelişiyor: ' + (fixed[i - 1].i + 1) + '. durak ' + p.start + ', ' + (fixed[i].i + 1) + '. durak ' + q.start + '. Saatler değişmedi; sırayı veya randevuyu elle düzeltin.'; break; } }
    const move = (i, d) => { const n = stops.slice(), j = i + d; [n[i], n[j]] = [n[j], n[i]]; set({ stops: n, sug: null }); };
    const camp = s.campId && R.byId(db.campaigns, s.campId);
    const stopRows = stopA.map((a, i) => {
      const c = R.byId(db.customers, a.customerId), devs = R.devicesAt(db, a.id), due = devs.filter(d => R.isDue(db, d)), k = this.lastCall(db, c.id), w = apptOf(a.id);
      return { n: i + 1, name: c.name, mah: a.mah, line: R.addrLine(a), devText: devs.length + ' cihaz · ' + due.length + ' cihazın bakımı geldi', call: k ? R.CALLR[k.result] + ' (' + F.short(k.date) + ')' : 'Henüz aranmadı', appt: w ? 'Randevu: ' + apptText(w) : '', tel: F.tel(c.phone), first: i === 0, last: i === stopA.length - 1, bd: a.id === s.sel ? '#252B32' : '#E7E9ED', accepted: k && k.result === 'kabul', w,
        up: e => { e.stopPropagation(); move(i, -1); }, down: e => { e.stopPropagation(); move(i, 1); }, stop: e => e.stopPropagation(), select: () => select(a.id),
        logCall: e => { e.stopPropagation(); act.open('call', { customerId: c.id, addressId: a.id, campaignId: s.campId, day: camp ? camp.day : '' }); } };
    });
    const accepted = stopRows.filter(r => r.accepted || r.w).map(r => { const a = stopA[r.n - 1]; return { n: r.n, name: r.name, apptText: r.w ? apptText(r.w) : 'Kabul etti · randevu saati henüz seçilmedi', needAppt: !r.w, plan: () => act.open('appt', { customerId: a.customerId, addressId: a.id, deviceIds: R.devicesAt(db, a.id).filter(d => R.isDue(db, d)).map(d => d.id), type: 'bakim', date: camp ? camp.day : '', dur: '60', campaignId: s.campId }) }; });
    const suggest = () => { let cur = center, left = stopA.slice(), out = []; while (left.length) { left.sort((x, y) => R.dist(cur, x) - R.dist(cur, y)); cur = left.shift(); out.push(cur.id); } set({ sug: out }); };
    const sug = s.sug ? { text: s.sug.map(id => stopIdx[id]).join(' → '), warn: fixed.length ? 'Sabit saatli randevu var; öneri saatleri dikkate almaz ve otomatik uygulanmadı.' : '', apply: () => set({ stops: s.sug, sug: null }), dismiss: () => set({ sug: null }) } : null;
    const selA = s.sel && R.byId(db.addresses, s.sel);
    let card = null;
    if (selA) {
      const c = R.byId(db.customers, selA.customerId), devs = R.devicesAt(db, selA.id), due = devs.filter(d => R.isDue(db, d)), k = this.lastCall(db, c.id), w = apptOf(selA.id), ck = cls[selA.id].key;
      const lab = { gecikti: 'Geciken bakım', yaklasan: 'Bakımı yaklaşan', planlandi: 'Randevu planlandı', plan: 'Bakım planı eksik', guncel: 'Güncel' }[ck];
      const ls = R.locSrc(selA);
      card = { name: c.name, addr: selA.label + ' · ' + selA.line + ', ' + selA.mah + ' / ' + selA.ilce, st: R.badge(ck === 'planlandi' ? 'info' : ck, lab), loc: R.badge(selA.lat == null ? 'gecikti' : selA.verified ? 'guncel' : 'yaklasan', ls.label), locWho: ls.who,
        devText: 'Toplam ' + devs.length + ' cihaz · ' + due.length + ' cihazın bakımı geldi', phone: F.phone(c.phone), tel: F.tel(c.phone), telOrHash: F.tel(c.phone) || '#', telLabel: c.phone ? 'Ara' : 'Tel yok', call: k ? R.CALLR[k.result] + ' · ' + F.date(k.date) : 'Kayıt yok', appt: w ? apptText(w) : 'Planlı randevu yok',
        dir: dirOne(selA), dirNote: selA.verified ? '' : 'Adresle açılıyor, pin doğrulanmadı.',
        logCall: () => act.open('call', { customerId: c.id, addressId: selA.id, campaignId: s.campId }), plan: () => act.open('appt', { customerId: c.id, addressId: selA.id, deviceIds: due.map(d => d.id), type: 'bakim', dur: '60' }),
        open: () => act.go('musteriler', { customerId: c.id, tab: 'adresler' }), woLabel: w ? 'İş emrini aç' : 'Randevu planla', openWo: () => w ? act.open('wo', { woId: w.id }) : act.open('appt', { customerId: c.id, addressId: selA.id, deviceIds: due.map(d => d.id), type: 'bakim', dur: '60' }) };
    }
    const tabs = [['grup', 'Bakım grupları'], ['gunluk', 'Günlük işler'], ['eksik', 'Konumu eksik (' + db.addresses.filter(a => a.active !== false && (a.lat == null || !a.verified)).length + ')']].map(([k, l]) => ({ l, sel: s.tab === k, bd: s.tab === k ? '#B1001A' : 'transparent', fg: s.tab === k ? '#B1001A' : '#4B525B', pick: () => set({ tab: k }) }));
    const desk = !mobile, showPanel = desk || s.mode === 'liste', showMap = desk || s.mode === 'harita';
    const cfOn = {}; ['name', 'day', 'offer', 'desc'].forEach(k => cfOn[k] = e => set({ cf: Object.assign({}, this.state.cf, { [k]: e.target.value }), cfErr: '' }));
    return {
      mobile, legend, tabs, isGrup: s.tab === 'grup', isGunluk: s.tab === 'gunluk', isEksik: s.tab === 'eksik', listRef: this.listRef,
      modes: [['harita', 'Harita'], ['liste', 'Liste']].map(([k, l]) => ({ l, sel: s.mode === k, bg: s.mode === k ? '#FFFFFF' : 'transparent', fg: s.mode === k ? '#252B32' : '#4B525B', pick: () => set({ mode: k }) })),
      mapOrder: bp === 'tablet' ? -1 : 0, cols: mobile || bp === 'tablet' ? 'minmax(0,1fr)' : '370px minmax(0,1fr)', panelH: mobile ? 'auto' : bp === 'tablet' ? '560px' : '100%', panelMinH: mobile || bp === 'tablet' ? '0' : '380px', panelPos: mobile ? 'relative' : 'absolute', mapRatio: mobile ? '4 / 5' : '16 / 9', showPanel, showMap,
      centerId: s.centerId, centers: (Number.isFinite(db.business.lat)?[{id:'biz',name:'Günay Klima'}]:[]).concat(db.addresses.filter(a => a.lat != null && a.verified).map(a => ({ id: a.id, name: R.byId(db.customers, a.customerId).name + ' · ' + a.mah }))),
      onCenter: e => set({ centerId: e.target.value, checked: null }),
      radii: [0.5, 1, 2, 5].map(v => Object.assign({ l: F.km(v), sel: !s.customKm && s.km === v, pick: () => set({ km: v, customKm: '', checked: null }) }, !s.customKm && s.km === v ? SEL : UNS)),
      customKm: s.customKm, onCustomKm: e => set({ customKm: e.target.value, checked: null }),
      g: { summary: Object.keys(cset).length + ' müşteri · ' + okRows.length + ' adres · ' + gDev + ' cihazın bakımı geldi (adreslerde toplam ' + gAll + ' cihaz)', exText: gRows.length - okRows.length ? (gRows.length - okRows.length) + ' adres iletişim istemediği için gruba alınmadı.' : '', empty: !gRows.length,
        rows: gRows.map(r => { const on = !!checked[r.a.id], ck = cls[r.a.id].key; return { aid: r.a.id, name: r.c.name, dist: F.km(Math.round(r.dist * 10) / 10), addr: r.a.label + ' · ' + r.a.line, devText: r.devs.length + ' cihaz · ' + r.due.length + ' cihazın bakımı geldi', st: R.worst(db, r.due), ct: R.contact(r.c), showCt: r.c.contact !== 'izinli', excluded: r.excluded, checked: on && !r.excluded, bg: r.a.id === s.sel ? '#FFF8F8' : '#FFFFFF', bl: r.a.id === s.sel ? '#B1001A' : 'transparent', select: () => select(r.a.id), stop: e => e.stopPropagation(), toggle: () => set({ checked: Object.assign({}, checked, { [r.a.id]: !on }) }) }; }) },
      checkedN: okRows.filter(r => checked[r.a.id]).length, noChecked: !okRows.some(r => checked[r.a.id]), checkOp: okRows.some(r => checked[r.a.id]) ? 1 : 0.5,
      toStops: () => set({ stops: okRows.filter(r => checked[r.a.id]).map(r => r.a.id), sug: null, focus: { key: 'st' + Date.now(), group: true } }), clearStops: () => set({ stops: [], campId: null, campForm: false }),
      hasStops: stops.length > 0, stopsN: stops.length, stops: stopRows, orderWarn, suggestOrder: suggest, sug, dirParts: parts,
      noCamp: !camp, campForm: s.campForm, noCampForm: !s.campForm, openCamp: () => set({ campForm: true, cf: { name: (centerA.mah || 'Yakın') + ' bakım grubu — ' + F.date(today).split(' ').slice(1).join(' '), day: D.addDays(today, 3), offer: '', desc: '' } }),
      cf: s.cf, cfOn, cfErr: s.cfErr, saving: this.props.saving, campSaveLabel: this.props.saving ? 'Kaydediliyor…' : 'Planı kaydet',
      saveCamp: () => act.submit('saveCampaign', Object.assign({}, s.cf, { addressIds: stops }), r => { set({ campId: r.id, campForm: false }); act.toast('Kampanya planı kaydedildi. Arama listesi hazır; mesaj gönderilmedi.'); }, r => set({ cfErr: r.error + ' ' + Object.values(r.fields || {}).join(' ') })),
      camp: camp ? { name: camp.name, day: F.date(camp.day), offer: camp.offer ? ' · Teklif: ' + camp.offer : '' } : null,
      accepted, acceptedN: accepted.length, noAccepted: !accepted.length,
      techChips: [['all', 'Tümü']].concat(R.activeStaff(db).map(t => [t.id, t.name])).map(([k, l]) => Object.assign({ l, sel: s.tech === k, pick: () => set({ tech: k }) }, s.tech === k ? SEL : UNS)),
      daily: daily.map((w, i) => { const a = R.byId(db.addresses, w.addressId), c = R.byId(db.customers, w.customerId); return { aid: a.id, n: i + 1, nbg: a.lat != null && a.verified ? '#252B32' : '#A0A6AE', time: w.start + '–' + D.fromMin(D.toMin(w.start) + w.dur), name: c.name, mah: a.mah, type: R.T[w.type], tech: R.staffName(db, w.techId), b: R.woBadge(w), extra: (w.buffer ? 'Sonrasında ' + w.buffer + ' dk kullanıcı tanımlı boşluk · müsait ' + R.nextFree(w) : '') + (a.lat == null || !a.verified ? (w.buffer ? ' · ' : '') + 'Konum doğrulanmadı; sıra bağlantısına alınmadı' : ''), bg: a.id === s.sel ? '#FFF8F8' : '#FFFFFF', bl: a.id === s.sel ? '#B1001A' : 'transparent', select: () => select(a.id) }; }),
      missing: db.addresses.filter(a => a.active !== false && (a.lat == null || !a.verified)).map(a => { const c = R.byId(db.customers, a.customerId), devs = R.devicesAt(db, a.id); return { aid: a.id, name: c.name, label: a.label, line: R.addrLine(a) + ', ' + a.mah + ' / ' + a.ilce, loc: R.locState(a), src: R.locSrc(a).label, devText: devs.length + ' cihaz', bg: a.id === s.sel ? '#FFF8F8' : '#FFFFFF', fixLabel: a.lat == null ? 'Konumu tamamla' : 'Konumu doğrula', fix: () => act.open('address', Object.assign({}, a, { lat: a.lat == null ? '' : String(a.lat), lng: a.lng == null ? '' : String(a.lng) })) }; }),
      pins, route, center, radiusKm: s.tab === 'grup' ? km : 0, sel: s.sel, business: Number.isFinite(db.business.lat)&&Number.isFinite(db.business.lng)?{lat:db.business.lat,lng:db.business.lng}:null, view: this.view, focus,
      onPin: id => select(id, true), onView: v => { this.view = v; },
      showAll: () => set({ focus: { key: 'all' + Date.now(), all: true } }),
      showGroup: () => set({ focus: { key: 'grp' + Date.now(), group: true } }),
      card, cardOnMap: !!card && desk, drawer: !!card && mobile && s.mode === 'harita', closeCard: () => set({ sel: null })
    };
  }
}

return Component;};
window.GKCompiled["EkranMusteriler.dc.html"]=function(DCLogic,StreamableLogic,React){

const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
const KIND = { montaj: ['Montaj', '#1D4F91', '#E8F0FB'], bakim: ['Bakım', '#1B6B3F', '#E5F3EB'], ariza: ['Arıza', '#A3001A', '#FDECEE'], kontrol: ['Kontrol', '#5B4A00', '#F6F0D8'], gorusme: ['Görüşme', '#4B525B', '#ECEEF1'], yapilmadi: ['Yapılmadı', '#5B626B', '#F0F1F3'], planli: ['Planlandı', '#1D4F91', '#E8F0FB'], iptal: ['İptal', '#5B626B', '#F0F1F3'], satis: ['Satış', '#252B32', '#ECEEF1'] };
const DF = ['pq', 'addressId', 'productId', 'externalModel', 'room', 'serialIn', 'serialOut', 'system', 'installDate', 'installBy', 'fromGunay', 'interval', 'baseInstall', 'manualNext', 'manualReason', 'note'];
class Component extends DCLogic {
  state = { flagForm: null, q: '', fStatus: 'all', fLoc: false, fIlce: '', tab: (this.props.params || {}).tab || 'genel', deviceId: (this.props.params || {}).deviceId || null, archiveAsk: false, df: null, dfErr: {}, dfError: '' };
  _pt = (this.props.params || {}).t;
  componentDidUpdate() { const p = this.props.params || {}; const changed = this._pt !== p.t; this._pt = p.t; if (changed) this.setState({ flagForm: null, tab: p.tab || 'genel', deviceId: p.deviceId || null, archiveAsk: false, df: null }); }
  ev(kind, date, title, sub) { const k = KIND[kind]; return { kind: k[0], fg: k[1], bg: k[2], date, title, sub, sortKey: date || '0000' }; }
  renderVals() {
    const db = this.props.db, act = this.props.act, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F, D } = window.GK, s = this.state, mobile = bp === 'mobile', p = this.props.params || {};
    const set = x => this.setState(x), go = (sc, pp) => () => act.go(sc, pp);
    const cid = p.customerId, c = cid && R.byId(db.customers, cid);
    const lastAct = cu => { let best = null; R.devicesOf(db, cu.id).forEach(d => db.history.forEach(h => { if (h.deviceId === d.id && h.done !== false && (!best || h.date > best.date)) best = { date: h.date, t: R.T[h.type] }; })); db.calls.forEach(k => { if (k.customerId === cu.id && (!best || k.date > best.date)) best = { date: k.date, t: 'Görüşme' }; }); return best ? F.short(best.date) + ' ' + best.date.slice(0, 4) + ' · ' + best.t : 'Kayıt yok'; };
    const ql = s.q.trim().toLocaleLowerCase('tr'), qd = ql.replace(/\D/g, '');
    const all = db.customers.filter(x => x.active !== false);
    const rowsAll = all.map(x => { const ad = R.addrsOf(db, x.id), dv = R.devicesOf(db, x.id), st = R.worst(db, dv), a0 = ad[0]; return { x, ad, dv, st, locMissing: ad.some(a => a.lat == null || !a.verified), ilces: ad.map(a => a.ilce) }; });
    const rows = rowsAll.filter(r => {
      if (ql && !(r.x.name.toLocaleLowerCase('tr').includes(ql) || (qd.length >= 3 && (r.x.phone || '').replace(/\D/g, '').includes(qd)) || r.ad.some(a => (a.mah + ' ' + a.ilce + ' ' + R.addrLine(a)).toLocaleLowerCase('tr').includes(ql)))) return false;
      if (s.fStatus === 'flag') { if (!r.x.flag) return false; } else if (s.fStatus !== 'all' && r.st.key !== s.fStatus) return false;
      if (s.fLoc && !r.locMissing) return false;
      if (s.fIlce && r.ilces.indexOf(s.fIlce) < 0) return false;
      return true;
    }).map(r => ({ ...(() => {
      const x = r.x, ds = r.dv, a0 = r.ad[0], k = R.lastCall(db, x.id), pw = db.workOrders.filter(w => w.customerId === x.id && w.date >= db.today && (w.status === 'planlandi' || w.status === 'islemde')).sort((p, q) => (p.date + p.start).localeCompare(q.date + q.start))[0];
      const nexts = ds.map(d => R.next(db, d).date).filter(Boolean).sort(), bal = db.sales.filter(sl => sl.customerId === x.id && sl.status === 'onayli').reduce((n, sl) => n + R.saleTotals(db, sl).balance, 0);
      const models = {}; ds.forEach(d => { const t = R.model(db, d).title; models[t] = (models[t] || 0) + 1; });
      const tone = r.st.key === 'gecikti' ? ['#FDECEE', '#A3001A'] : r.st.key === 'yaklasan' ? ['#FFF1D1', '#7A4A00'] : ['#F0F1F3', '#4B525B'];
      return { ini: x.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toLocaleUpperCase('tr'), avBg: tone[0], avFg: tone[1],
        addrLine: a0 ? a0.label + ' · ' + a0.line + ', ' + a0.mah + ' / ' + a0.ilce + (r.ad.length > 1 ? ' (+' + (r.ad.length - 1) + ' adres)' : '') : 'Adres yok',
        devLine: ds.length ? Object.keys(models).map(t => models[t] + ' × ' + t).join(', ') : 'Klima kaydı yok',
        nextLine: nexts.length ? F.date(nexts[0]) : ds.length ? 'Bakım planı eksik' : '—',
        lastLine: k ? F.date(k.date) + ' · ' + R.CALLR[k.result] + (k.topic ? ' · ' + k.topic : '') : 'Görüşme yok',
        balLine: bal > 0 ? F.money(bal) : '', appt: pw ? 'Randevu ' + F.short(pw.date) + ' ' + pw.start : '',
        hasTags: !!(x.flag || r.locMissing || pw),
        call: () => act.open('call', { customerId: x.id }),
        plan: () => { const ad = a0; act.open('appt', { customerId: x.id, addressId: ad ? ad.id : '', deviceIds: ad ? R.devicesAt(db, ad.id).filter(d => R.isDue(db, d)).map(d => d.id) : [], type: 'bakim', dur: '60' }); } };
    })(), name: r.x.name, type: r.x.type, phone: F.phone(r.x.phone), phoneFg: r.x.phone ? '#252B32' : '#7A4A00', area: r.ad.length ? r.ad.map(a => a.mah + ', ' + a.ilce).filter((v, i, arr) => arr.indexOf(v) === i).join(' · ') : 'Adres yok', addrN: r.ad.length, devN: r.dv.length, st: r.st, life: R.lifecycle(db, r.x).label, flag: r.x.flag ? 'Olumsuz deneyim · ' + R.FLAGS[r.x.flag.type] : '', locMissing: r.locMissing, last: lastAct(r.x), open: go('musteriler', { customerId: r.x.id }) }));
    const chip = (k, l) => Object.assign({ l, sel: s.fStatus === k, pick: () => set({ fStatus: k }) }, s.fStatus === k ? SEL : UNS);
    const base = {
      todayIso: db.today, isList: !c, isFile: !!c, notMobile: !mobile, saving: this.props.saving, saveLabel: this.props.saving ? 'Kaydediliyor…' : 'Kaydet', hideImg: act.hideImg,
      countText: all.length + ' aktif müşteri · ' + db.devices.filter(d => d.active !== false).length + ' fiziksel cihaz',
      newCustomer: () => act.open('customer', { type: 'Kişi', contact: 'bilinmiyor' }),
      q: s.q, onQ: e => set({ q: e.target.value }), statusChips: [chip('all', 'Tümü'), chip('gecikti', 'Bakımı geciken'), chip('yaklasan', '30 gün içinde'), chip('plan', 'Plan eksik'), chip('guncel', 'Güncel'), chip('flag', 'Olumsuz deneyim')],
      fLoc: s.fLoc, toggleLoc: () => set({ fLoc: !s.fLoc }), locChip: s.fLoc ? SEL : UNS, fIlce: s.fIlce, onIlce: e => set({ fIlce: e.target.value }),
      ilceler: Array.from(new Set(db.addresses.map(a => a.ilce))).sort(), clearFilters: () => set({ q: '', fStatus: 'all', fLoc: false, fIlce: '' }),
      rows, empty: !rows.length, tableView: !mobile && bp === 'desktop' && rows.length > 0, cardCols: mobile ? 'minmax(0,1fr)' : 'repeat(auto-fill,minmax(320px,1fr))', cardView: (mobile || bp === 'tablet') && rows.length > 0,
      mAlign: mobile ? 'flex-end' : 'center', mPad: mobile ? '0' : '24px', mRadius: mobile ? '16px 16px 0 0' : '16px',
      dlgTop: mobile ? '8%' : '0', dlgW: mobile ? '100%' : 'min(560px, 100%)', dlgR: mobile ? '16px 16px 0 0' : '0'
    };
    if (!c) return Object.assign(base, { tab: {}, devDetail: false, devFormOpen: false });
    const addrs = R.addrsOf(db, c.id), devs = R.devicesOf(db, c.id), sales = db.sales.filter(x => x.customerId === c.id), calls = db.calls.filter(k => k.customerId === c.id).reverse().sort((a, b) => b.date.localeCompare(a.date));
    const planFor = (aid, ids) => act.open('appt', { customerId: c.id, addressId: aid, deviceIds: ids, type: 'bakim', dur: '60' });
    const devCard = d => {
      const md = R.model(db, d), lm = R.lastMaint(db, d.id), nx = R.next(db, d), st = R.status(db, d), sameOut = d.serialOut && devs.filter(x => x.serialOut === d.serialOut).length > 1;
      return { id: d.id, room: d.room, title: md.title + (d.variant ? ' · ' + d.variant : ''), level: md.level === 'model' ? md.series + ' · ' + (md.type || '') : md.levelLabel, img: md.img, noImg: md.img ? 'Görsel yüklenemedi' : 'Klima görseli eklenmedi',
        sn: d.serialIn || 'Belirtilmedi', install: d.installDate ? F.date(d.installDate) + ' · ' + R.staffName(db, d.installBy, d.installByText || 'Belirtilmedi') : 'Belirtilmedi' + (d.installByText ? ' · ' + d.installByText : ''),
        last: lm ? F.date(lm.date) : 'Kayıt yok', next: nx.date ? F.date(nx.date) + (nx.basis === 'manual' ? ' (manuel)' : '') : '—', interval: R.intervalLabel(d), st, bd: d.id === s.deviceId ? '#B1001A' : '#E7E9ED',
        origin: d.fromGunay === true ? 'Günay’dan alındı' : d.fromGunay === false ? 'Günay’dan alınmadı' : 'Satın alma bilinmiyor',
        multi: sameOut ? 'Ortak dış ünite ' + d.serialOut + (d.system ? ' (' + d.system + ')' : '') + ' — multi sistemde normaldir.' : '',
        plan: () => planFor(d.addressId, [d.id]), open: () => set({ deviceId: d.id }), edit: () => this.openForm(d) };
    };
    const tabsDef = [['genel', 'Genel bakış'], ['klimalar', 'Klimalar (' + devs.length + ')'], ['adresler', 'Adresler (' + addrs.length + ')'], ['satislar', 'Satışlar (' + sales.length + ')'], ['gecmis', 'İşlem geçmişi'], ['gorusmeler', 'Görüşmeler (' + calls.length + ')']];
    const tab = {}; tabsDef.forEach(([k]) => tab[k] = s.tab === k);
    const stCount = {}; devs.forEach(d => { const k = R.status(db, d).label.split(' ·')[0]; stCount[k] = (stCount[k] || 0) + 1; });
    const futureWo = db.workOrders.filter(w => w.customerId === c.id && w.date >= db.today && (w.status === 'planlandi' || w.status === 'islemde')).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    const bal = sales.filter(x => x.status === 'onayli').reduce((n, x) => n + R.saleTotals(db, x).balance, 0);
    const tl = [];
    devs.forEach(d => { const md = R.model(db, d); if (d.installDate) tl.push(this.ev('montaj', d.installDate, 'Montaj · ' + d.room, md.title + ' · ' + R.staffName(db, d.installBy, d.installByText))); });
    db.history.forEach(h => { const d = devs.find(x => x.id === h.deviceId); if (!d) return; tl.push(h.done === false ? this.ev('yapilmadi', h.date, R.T[h.type] + ' planlandı, yapılmadı · ' + d.room, h.reason || '') : this.ev(h.type, h.date, R.T[h.type] + ' · ' + d.room, (h.action || '') + ' · ' + R.staffName(db, h.by) + (h.fee != null ? ' · ' + F.money(h.fee) : ''))); });
    calls.forEach(k => tl.push(this.ev('gorusme', k.date, 'Görüşme · ' + R.CALLR[k.result], k.note || '')));
    db.workOrders.filter(w => w.customerId === c.id).forEach(w => { if (w.status === 'iptal') tl.push(this.ev('iptal', w.date, R.T[w.type] + ' randevusu iptal edildi', w.cancelNote || '')); if (w.status === 'planlandi' || w.status === 'islemde') tl.push(this.ev('planli', w.date, R.T[w.type] + ' · ' + w.start + ' · ' + R.staffName(db, w.techId), w.status === 'islemde' ? 'İşlemde — henüz tamamlanmadı' : 'Planlandı — henüz yapılmadı')); });
    sales.forEach(x => tl.push(this.ev('satis', x.date, 'Satış ' + x.no, R.saleState(x).label + ' · ' + F.money(R.saleTotals(db, x).total))));
    (c.flagLog || []).forEach(l => tl.push(this.ev(l.action === 'cozuldu' ? 'kontrol' : 'ariza', l.date, l.action === 'cozuldu' ? 'Olumsuzluk çözüldü' : 'Olumsuz deneyim işaretlendi · ' + (R.FLAGS[l.type] || ''), l.note)));
    calls.forEach(k => { if (k.dir === 'gelen') { const e = tl.find(x => x.sub === (k.note || '') && x.title.indexOf('Görüşme') === 0); if (e) e.title = 'Gelen arama · ' + R.CALLR[k.result] + (k.topic ? ' · ' + k.topic : ''); } });
    tl.sort((a, b) => b.sortKey.localeCompare(a.sortKey)); tl.forEach(e => e.date = F.date(e.date));
    let dv = null;
    const sd = s.deviceId && R.byId(db.devices, s.deviceId);
    if (sd) {
      const cc = devCard(sd), nx = R.next(db, sd), a = R.byId(db.addresses, sd.addressId), sale = sd.saleId && R.byId(db.sales, sd.saleId), line = sale && sale.lines.find(l => l.id === sd.lineId), pw = R.plannedFor(db, sd.id);
      const hist = [];
      if (sd.installDate) hist.push(this.ev('montaj', sd.installDate, 'Montaj', R.staffName(db, sd.installBy, sd.installByText)));
      db.history.filter(h => h.deviceId === sd.id).forEach(h => hist.push(h.done === false ? this.ev('yapilmadi', h.date, R.T[h.type] + ' planlandı, yapılmadı', h.reason || '') : this.ev(h.type, h.date, h.action || R.T[h.type], R.staffName(db, h.by) + (h.fee != null ? ' · ' + F.money(h.fee) : ' · Ücret girilmedi'))));
      if (pw) hist.push(this.ev('planli', pw.date, R.T[pw.type] + ' ' + pw.start, 'Planlandı · ' + R.staffName(db, pw.techId)));
      hist.sort((x, y) => y.sortKey.localeCompare(x.sortKey)); hist.forEach(e => e.date = F.date(e.date));
      const tot = sale && R.saleTotals(db, sale);
      dv = Object.assign(cc, { snOut: sd.serialOut || 'Belirtilmedi', system: sd.system || '—', addr: a.label + ' · ' + R.addrLine(a), note: sd.note || '—', next: nx.date ? F.date(nx.date) : '—', basis: nx.note, planned: pw ? 'Planlı randevu: ' + F.date(pw.date) + ' ' + pw.start + ' · ' + R.staffName(db, pw.techId) : '', hist,
        origin: sd.fromGunay === true ? 'Evet' + (sale ? '' : ' · satış kaydı bu sisteme aktarılmadı') : sd.fromGunay === false ? 'Hayır — bakım müşterisi' : 'Bilinmiyor',
        sale: line ? { no: sale.no, date: F.date(sale.date), line: R.pTitle(R.byId(db.products, line.productId)) + ' · ' + line.qty + ' adet (' + line.installed + ' takıldı)', price: F.money(line.price), disc: F.money(line.disc || 0), cost: line.cost == null ? 'Belirtilmedi' : F.money(line.cost), total: F.money(tot.total), paid: F.money(tot.paid), balance: F.money(tot.balance), open: go('satis', { saleId: sale.id }) } : null });
    }
    const df = s.df;
    let dfv = null;
    if (df) {
      const on = {}, eb = {}, v = {};
      DF.forEach(k => { v[k] = df[k] == null ? '' : df[k]; on[k] = e => { const raw = e.target.type === 'checkbox' ? e.target.checked : e.target.value, P = window.GK.P; const val = k === 'serialIn' || k === 'serialOut' ? P.serial(raw) : k === 'room' || k === 'system' ? String(raw).slice(0, 40) : k === 'externalModel' ? String(raw).slice(0, 80) : raw; this.setState(st => ({ df: Object.assign({}, st.df, { [k]: val }), dfErr: Object.assign({}, st.dfErr, { [k]: null }) })); }; eb[k] = s.dfErr[k] ? '#C8102E' : '#CDD2D9'; });
      dfv = { title: df.id ? 'Cihazı düzenle' : 'Yeni klima ekle', v, on, eb, e: s.dfErr, error: s.dfError, baseInstall: !!df.baseInstall, external: !df.productId,
        addrs: addrs.map(a => ({ id: a.id, name: a.label + ' — ' + R.addrLine(a) })), products: db.products.map(x => ({ id: x.id, name: R.pTitle(x) + (x.level === 'seri' ? ' (seri düzeyi)' : '') })),
        staff: db.staff.map(x => ({ id: x.id, name: x.name + (x.active ? '' : ' (pasif)') })),
        save: () => { const f = Object.assign({}, df, { customerId: c.id, installDate: df.installDate || null, installBy: df.installBy && df.installBy !== 'ext' ? df.installBy : null, installByText: df.installBy === 'ext' ? 'Başka firma' : (df.installByText || null), fromGunay: df.fromGunay === 'evet' ? true : df.fromGunay === 'hayir' ? false : null, baseRule: df.baseInstall ? 'install' : null, manualNext: df.manualNext || null, productId: df.productId || null }); act.submit('saveDevice', f, () => { act.toast(df.id ? 'Cihaz güncellendi.' : 'Yeni cihaz eklendi.'); set({ df: null }); }, r => set({ dfErr: r.fields || {}, dfError: r.error })); } };
      const upd = p => this.setState(st => ({ df: Object.assign({}, st.df, p), dfErr: {} }));
      const pq = (df.pq || '').toLocaleLowerCase('tr').replace(/\s/g, '');
      const SELC = (on_) => on_ ? { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' } : { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
      const pr = df.productId && R.byId(db.products, df.productId), addr = df.addressId && R.byId(db.addresses, df.addressId);
      const dupDev = df.serialIn && db.devices.find(d => d.id !== df.id && d.serialIn && d.serialIn.toUpperCase() === String(df.serialIn).toUpperCase());
      const sameOut = df.serialOut && db.devices.filter(d => d.id !== df.id && d.serialOut && d.serialOut.toUpperCase() === String(df.serialOut).toUpperCase());
      const tmp = { id: df.id || '__yeni', interval: df.interval ? Number(df.interval) : null, baseRule: df.baseInstall ? 'install' : null, installDate: df.installDate || null, manualNext: df.manualNext || null, manualReason: df.manualReason };
      const nx = R.next(db, tmp), stt = R.status(db, tmp);
      const fields = [!!(df.productId || (df.ext && df.externalModel)), !!df.addressId, !!df.room, !!df.serialIn, !!df.installDate, !!df.installBy, !!df.fromGunay, !!df.interval];
      const filled = fields.filter(Boolean).length;
      const mobile2 = bp === 'mobile' || bp === 'tablet';
      Object.assign(dfv, {
        hasVars: !!(pr && (pr.variants || []).length), vars: pr ? (pr.variants || []).map(v => { const sel = df.variant === v.name; return { l: v.name, img: v.img, sel, bw: sel ? '2px' : '1px', bd: sel ? '#B1001A' : '#D5D9DF', pick: () => upd({ variant: sel ? '' : v.name }) }; }) : [],
        subtitle: c.name + ' · fiziksel iç ünite kaydı', cols: mobile2 ? 'minmax(0,1fr)' : 'minmax(0,1fr) 300px', sumDisplay: mobile2 ? 'none' : 'flex', external: !!df.ext,
        tiles: db.products.filter(p => !pq || (R.pTitle(p) + p.series + (p.type || '')).toLocaleLowerCase('tr').replace(/\s/g, '').includes(pq)).map(p => { const sel = df.productId === p.id; return { title: R.pTitle(p), sub: p.level === 'seri' ? 'Seri düzeyi' : p.series, subFg: p.level === 'seri' ? '#7A4A00' : '#4B525B', img: p.img, noImg: p.img ? 'Görsel yüklenemedi' : 'Görsel eklenmedi', sel, bd: sel ? '#B1001A' : '#E7E9ED', bw: sel ? '2px' : '1px', sh: sel ? '0 6px 16px rgba(177,0,26,.14)' : 'none', pick: () => upd({ productId: p.id, ext: false, variant: '' }) }; }),
        pickExt: () => upd({ productId: '', ext: true }), extBd: df.ext ? '#B1001A' : '#CDD2D9', extBw: df.ext ? '2px' : '1px',
        addrCards: addrs.map(a => { const sel = df.addressId === a.id; return { label: a.label, line: R.addrLine(a) + ', ' + a.mah, sel, bw: sel ? '2px' : '1px', bd: sel ? '#B1001A' : '#E7E9ED', bg: sel ? '#FFFAFA' : '#FFFFFF', pick: () => upd({ addressId: a.id }) }; }),
        rooms: ['Salon', 'Yatak odası', 'Çocuk odası', 'Mutfak', 'Ofis', 'Toplantı odası', 'Dükkân'].map(l => Object.assign({ l, sel: df.room === l, pick: () => upd({ room: l }) }, SELC(df.room === l))),
        snWarn: dupDev ? 'Bu iç ünite seri numarası ' + R.byId(db.customers, dupDev.customerId).name + ' · ' + dupDev.room + ' cihazında kayıtlı. Aynı cihaz iki kez eklenemez; numarayı kontrol edin.' : '', snBd: dupDev ? '#C8102E' : '#CDD2D9',
        outInfo: sameOut && sameOut.length ? 'Bu dış ünite ' + sameOut.length + ' iç üniteye daha bağlı (' + sameOut.map(d => d.room).join(', ') + '). Multi sistemde normaldir.' : '',
        idBd: s.dfErr.installDate ? '#C8102E' : '#CDD2D9',
        origins: [['evet', 'Evet'], ['hayir', 'Hayır'], ['', 'Bilinmiyor']].map(([k, l]) => { const sel = (df.fromGunay || '') === k; return { l, sel, bg: sel ? '#FFFFFF' : 'transparent', fg: sel ? '#B1001A' : '#4B525B', sh: sel ? '0 1px 3px rgba(37,43,50,.12)' : 'none', pick: () => upd({ fromGunay: k }) }; }),
        intervals: [['', 'Bilinmiyor / seçilmedi'], ['6', '6 ay'], ['12', '12 ay'], ['24', '24 ay']].map(([k, l]) => Object.assign({ l, sel: String(df.interval || '') === k, pick: () => upd({ interval: k }) }, SELC(String(df.interval || '') === k))),
        manualOpen: !!(df.showManual || df.manualNext), manualClosed: !(df.showManual || df.manualNext), openManual: () => upd({ showManual: true }),
        sum: { img: pr ? (((pr.variants || []).find(v => v.name === df.variant) || {}).img || pr.img) : null, noImg: pr ? (pr.img ? '' : 'Klima görseli eklenmedi') : 'Model seçilmedi', title: pr ? R.pTitle(pr) + (df.variant ? ' · ' + df.variant : '') : df.ext ? (df.externalModel || 'Katalog dışı model') : '—', level: pr ? (pr.level === 'seri' ? 'Seri düzeyi · model kodu yok' : pr.series + ' · ' + pr.type) : '', room: df.room || 'Oda belirtilmedi', addr: addr ? addr.label + ' · ' + addr.mah : '—', sn: df.serialIn || 'Belirtilmedi', inst: (df.installDate ? F.date(df.installDate) : 'Tarih belirtilmedi') + ' · ' + (df.installBy === 'ext' ? 'Başka firma' : df.installBy ? R.staffName(db, df.installBy) : 'Bilinmiyor'), origin: df.fromGunay === 'evet' ? 'Günay’dan alındı' : df.fromGunay === 'hayir' ? 'Günay’dan alınmadı' : 'Bilinmiyor', st: stt, next: nx.date ? F.date(nx.date) : 'Hesaplanamıyor', basis: nx.note, filled: filled + ' / ' + fields.length, pct: Math.round(filled / fields.length * 100) + '%' },
        footNote: dupDev ? 'Seri numarası tekrarlı; kaydetmeden önce düzeltin.' : 'Bilinmeyen alanlar “Belirtilmedi” olarak kaydedilir.', saveL: this.props.saving ? 'Kaydediliyor…' : df.id ? 'Değişiklikleri kaydet' : 'Cihazı kaydet'
      });
    }
    return Object.assign(base, {
      c: { name: c.name, type: c.type, person: c.person, phone: F.phone(c.phone), phoneFg: c.phone ? '#252B32' : '#7A4A00', tel: F.tel(c.phone), ct: R.contact(c), note: c.note, archived: c.active === false, telOrHash: F.tel(c.phone) || '#', flag: c.flag ? { title: 'Olumsuz deneyim · ' + R.FLAGS[c.flag.type], note: c.flag.note, date: F.date(c.flag.date) } : null },
      life: (() => { const L = R.lifecycle(db, c), st = L.stages.filter(x => !x.skip); let lastDone = -1; st.forEach((x, i) => { if (x.date) lastDone = i; }); return { label: L.label, risk: L.risk ? L.riskText : '', n: st.length, minW: st.length * 92, stages: st.map((x, i) => { const done = !!x.date, cur = i === lastDone, nextDone = st[i + 1] && st[i + 1].date; return { l: x.l, title: x.l + (done ? ' · ' + F.date(x.date) : ' · henüz yok'), d: done ? F.date(x.date).replace(/^(\d+) (\S{3})\S* (\d{4})$/, '$1 $2 $3') : 'henüz yok', mark: done ? '✓' : String(i + 1), bg: done ? '#B1001A' : '#FFFFFF', fg: done ? '#FFFFFF' : '#A0A6AE', bd: done ? '#B1001A' : '#D5D9DF', ring: cur ? '0 0 0 4px rgba(177,0,26,.14)' : 'none', tc: done ? '#252B32' : '#A0A6AE', line: i === st.length - 1 ? 'transparent' : done && nextDone ? '#B1001A' : '#E7E9ED' }; }) }; })(),
      flagBtn: c.flag ? { l: 'Çözüldü olarak işaretle', help: 'Sorun giderildiğinde nasıl çözüldüğünü yazarak uyarıyı kapatır. İşaret ve çözüm notu müşteri geçmişinde kalır.', fg: '#1B6B3F', bd: '#B6DCC5', run: () => set({ flagForm: { mode: 'clear', note: '' } }) } : { l: 'Olumsuzluk işaretle', help: 'Şikâyet, memnuniyetsizlik veya ödeme sorunu yaşanan müşteriye kırmızı uyarı ekler. Uyarı dosyada, listede, aramada ve görüşme kaydında görünür; “Olumsuz deneyim” filtresiyle listelenir. Kayıt silinmez, çözülünce kapatılır.', fg: '#A3001A', bd: '#F3C2C9', run: () => set({ flagForm: { mode: 'set', type: '', note: '' } }) },
      flagForm: s.flagForm ? { title: s.flagForm.mode === 'set' ? 'Olumsuz deneyim işaretle' : 'Olumsuzluğu çözüldü olarak kapat', isSet: s.flagForm.mode === 'set', type: s.flagForm.type, note: s.flagForm.note, err: s.flagForm.err, ph: s.flagForm.mode === 'set' ? 'Ne oldu? (örn. montaj sonrası su damlatma şikâyeti)' : 'Nasıl çözüldü?', saveL: this.props.saving ? 'Kaydediliyor…' : 'Kaydet',
        onType: e => set({ flagForm: Object.assign({}, s.flagForm, { type: e.target.value, err: '' }) }), onNote: e => set({ flagForm: Object.assign({}, s.flagForm, { note: e.target.value, err: '' }) }), cancel: () => set({ flagForm: null }),
        save: () => act.submit(s.flagForm.mode === 'set' ? 'flagCustomer' : 'clearFlag', { id: c.id, type: s.flagForm.type, note: s.flagForm.note }, () => { set({ flagForm: null }); act.toast(s.flagForm.mode === 'set' ? 'Müşteri olumsuz deneyim olarak işaretlendi.' : 'Olumsuzluk çözüldü olarak kapatıldı; kayıt geçmişte duruyor.'); }, r => set({ flagForm: Object.assign({}, s.flagForm, { err: r.error }) })) } : null,
      mobileBar: mobile, back: go('musteriler', {}),
      addDevice: () => { if (addrs.length) { this.setState({ tab: 'klimalar' }); this.openForm({ addressId: addrs[0].id }); } else { act.toast('Klima bir adrese takılır. Önce adres ekleyin.'); act.open('address', { customerId: c.id, label: 'Ev', after: 'file' }); } }, plan: () => { const a = addrs[0]; planFor(a ? a.id : '', a ? R.devicesAt(db, a.id).filter(d => R.isDue(db, d)).map(d => d.id) : []); },
      demoSms: ()=>window.GKDemoUI?.sms(c.id), isDemo:!!window.GKApi.demo,
      logCall: () => act.open('call', { customerId: c.id }), edit: () => act.open('customer', Object.assign({}, c, { phoneUnknown: !c.phone, phoneIntl: !!(c.phone && c.phone[0] === '+'), phone: c.phone ? (c.phone[0] === '+' ? c.phone : window.GK.P.tr(c.phone)) : '' })),
      archiveAsk: s.archiveAsk, askArchive: () => set({ archiveAsk: true }), cancelArchive: () => set({ archiveAsk: false }), doArchive: () => act.submit('archiveCustomer', c.id, () => { act.toast(c.name + ' pasife alındı. Geçmiş kayıtlar korundu.'); act.go('musteriler', {}); }),
      tabs: tabsDef.map(([k, l]) => ({ l, sel: s.tab === k, bd: s.tab === k ? '#B1001A' : 'transparent', fg: s.tab === k ? '#B1001A' : '#4B525B', pick: () => set({ tab: k }) })), tab,
      ov: { status: Object.keys(stCount).map(k => ({ l: k, n: stCount[k] })), appts: futureWo.map(w => ({ text: F.date(w.date) + ' ' + w.start + ' · ' + R.T[w.type] + ' · ' + R.staffName(db, w.techId), open: () => act.open('wo', { woId: w.id }) })), noAppt: !futureWo.length, balance: F.money(bal), salesText: sales.length + ' satış kaydı · tahsil edilmemiş tutar', call: calls[0] ? F.date(calls[0].date) + ' · ' + R.CALLR[calls[0].result] + (calls[0].note ? ' — ' + calls[0].note : '') : 'Görüşme kaydı yok' },
      noAddrs: !addrs.length, addAddress: () => act.open('address', { customerId: c.id, label: 'Ev' }),
      devGroups: addrs.map(a => { const ds = R.devicesAt(db, a.id); return { title: a.label, sub: R.addrLine(a) + ', ' + a.mah + ' / ' + a.ilce, devs: ds.map(devCard), empty: !ds.length, addDevice: () => this.openForm({ addressId: a.id }) }; }),
      addrs: addrs.map(a => { const ls = R.locSrc(a); return { label: a.label, line: R.addrLine(a), area: a.mah + ' / ' + a.ilce, devN: R.devicesAt(db, a.id).length, loc: R.locState(a), src: 'Kaynak: ' + ls.label, who: ls.who, hasPin: a.lat != null, noPin: a.lat == null, showMap: go('harita', { addressId: a.id }), edit: () => act.open('address', Object.assign({}, a, { lat: a.lat == null ? '' : String(a.lat), lng: a.lng == null ? '' : String(a.lng) })), dir: 'https://www.google.com/maps/dir/?api=1&destination=' + (a.lat != null && a.verified ? a.lat + ',' + a.lng : encodeURIComponent(R.addrLine(a) + ', ' + a.mah + ', ' + a.ilce + ', ' + (a.city || ''))) + '&travelmode=driving', dirNote: a.lat != null && a.verified ? '' : 'Adresle açılıyor, pin doğrulanmadı.' }; }),
      sales: sales.map(x => { const t = R.saleTotals(db, x); return { no: x.no, date: F.date(x.date), items: x.lines.map(l => l.qty + ' × ' + R.pTitle(R.byId(db.products, l.productId))).join(', '), total: F.money(t.total), balance: F.money(t.balance), st: R.saleState(x), open: go('satis', { saleId: x.id }) }; }), noSales: !sales.length,
      timeline: tl, tlCols: mobile ? '90px 1fr' : '130px 100px 1fr',
      callsList: calls.map(k => ({ det: R.callSummary(db, k), date: F.date(k.date), result: (k.dir === 'gelen' ? 'Gelen · ' : '') + R.CALLR[k.result], cb: k.callback ? 'Tekrar arama: ' + F.date(k.callback) : '', note: k.note || '—' })), noCalls: !calls.length,
      devDetail: !!dv, dv, closeDev: () => set({ deviceId: null }),
      devFormOpen: !!dfv, df: dfv, closeForm: () => set({ df: null })
    });
  }
  openForm(d) {
    const f = d.id ? Object.assign({}, d, { ext: !d.productId, interval: d.interval ? String(d.interval) : '', baseInstall: d.baseRule === 'install', fromGunay: d.fromGunay === true ? 'evet' : d.fromGunay === false ? 'hayir' : '', installBy: d.installBy || (d.installByText === 'Başka firma' ? 'ext' : '') }) : { addressId: d.addressId, productId: '', interval: '', fromGunay: '', ext: false };
    this.setState({ df: f, dfErr: {}, dfError: '', deviceId: null });
  }
}

return Component;};
window.GKCompiled["EkranRaporlar.dc.html"]=function(DCLogic,StreamableLogic,React){

const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
class Component extends DCLogic {
  state = { preset: 'ay', from: '', to: '' };
  renderVals() {
    const db = this.props.db, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F, D } = window.GK, s = this.state, today = db.today, set = x => this.setState(x);
    const pr = { ay: [today.slice(0, 8) + '01', today], gun30: [D.addDays(today, -30), today], yil: [today.slice(0, 4) + '-01-01', today], tumu: ['2000-01-01', today] };
    const [from, to] = s.preset === 'ozel' ? [s.from || '2000-01-01', s.to || today] : pr[s.preset];
    const inR = d => d && d >= from && d <= to;
    const sales = db.sales.filter(x => x.status === 'onayli' && inR(x.date));
    const salesSum = sales.reduce((n, x) => n + R.saleTotals(db, x).total, 0);
    const pays = db.payments.filter(y => inR(y.date)), paySum = pays.reduce((n, y) => n + y.amount, 0);
    const openBal = db.sales.filter(x => x.status === 'onayli').reduce((n, x) => n + R.saleTotals(db, x).balance, 0);
    const insts = db.devices.filter(d => d.fromGunay && d.saleId && inR(d.installDate));
    const woDone = db.workOrders.filter(w => w.status === 'tamamlandi' && w.type === 'bakim' && inR(w.completedAt));
    const devDone = db.history.filter(h => h.type === 'bakim' && h.done !== false && inR(h.date)).length;
    const fees = db.workOrders.filter(w => w.status === 'tamamlandi' && w.fee != null && inR(w.completedAt)), feeSum = fees.reduce((n, w) => n + w.fee, 0), feePaid = fees.filter(w => w.feePaid).reduce((n, w) => n + w.fee, 0);
    const od = db.devices.filter(d => R.status(db, d).key === 'gecikti').length;
    const mv = db.movements.filter(m => inR(m.date)).length;
    const fxNow = R.fxAt(db, today);
    const usdOf = (amt, date, snap) => { const x = snap || R.fxAt(db, date); return x ? amt / x.usd : null; };
    const eurOf = (amt, date, snap) => { const x = snap || R.fxAt(db, date); return x ? amt / x.eur : null; };
    const n2 = v => v == null ? '—' : v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let usdSum = 0, eurSum = 0; sales.forEach(x => { const t = R.saleTotals(db, x).total; usdSum += usdOf(t, x.date, x.fx) || 0; eurSum += eurOf(t, x.date, x.fx) || 0; });
    const fxCovered=sales.filter(x=>usdOf(R.saleTotals(db,x).total,x.date,x.fx)!=null).length, fxComplete=fxCovered===sales.length;
    const costLines=sales.flatMap(s=>s.lines), knownLines=costLines.filter(l=>l.cost!=null), gross=knownLines.reduce((n,l)=>n+l.qty*(l.price-l.cost)-(l.disc||0),0);
    const rows = [];
    sales.forEach(x => { const t = R.saleTotals(db, x).total; rows.push({ d: x.date, date: F.date(x.date), what: 'Satış ' + x.no + ' · ' + R.byId(db.customers, x.customerId).name, amount: F.money(t), usd: n2(usdOf(t, x.date, x.fx)), eur: n2(eurOf(t, x.date, x.fx)) }); });
    pays.forEach(y => rows.push({ d: y.date, date: F.date(y.date), what: 'Tahsilat · ' + R.byId(db.sales, y.saleId).no + ' · ' + y.method, amount: F.money(y.amount), usd: n2(usdOf(y.amount, y.date, y.fx)), eur: n2(eurOf(y.amount, y.date, y.fx)) }));
    fees.forEach(w => rows.push({ d: w.completedAt, date: F.date(w.completedAt), what: 'Bakım ücreti · ' + R.byId(db.customers, w.customerId).name + (w.feePaid ? ' · tahsil edildi' : ' · bekliyor'), amount: F.money(w.fee), usd: n2(usdOf(w.fee, w.completedAt, w.fx)), eur: n2(eurOf(w.fee, w.completedAt, w.fx)) }));
    rows.sort((a, b) => b.d.localeCompare(a.d));
    const mah = {}; db.devices.forEach(d => { if (!R.isDue(db, d)) return; const a = R.byId(db.addresses, d.addressId), k = a.mah + ', ' + a.ilce; mah[k] = (mah[k] || 0) + 1; });
    const mx = Math.max(1, ...Object.values(mah));
    return {
      presets: [['ay', 'Bu ay'], ['gun30', 'Son 30 gün'], ['yil', 'Bu yıl'], ['tumu', 'Tümü']].map(([k, l]) => Object.assign({ l, sel: s.preset === k, pick: () => set({ preset: k }) }, s.preset === k ? SEL : UNS)),
      from, to, onFrom: e => set({ preset: 'ozel', from: e.target.value, to: s.to || to }), onTo: e => set({ preset: 'ozel', to: e.target.value, from: s.from || from }), rangeText: F.date(from === '2000-01-01' ? (db.sales.map(x => x.date).sort()[0]) : from) + ' – ' + F.date(to),
      tiles: [
        { l: 'Satış tutarı', v: F.money(salesSum), sub: sales.length + ' onaylı satış · tahsil edilmiş para değildir · taslak ve iptal hariç' },
        { l:'Ürün brüt kârı (maliyeti bilinen kalemler)',v:knownLines.length?F.money(gross):'Maliyet girilmedi',sub:knownLines.length+'/'+costLines.length+' satış kalemi · işçilik, malzeme ve genel giderler hariç' },
        { l: 'Satış tahsilatı', v: F.money(paySum), sub: pays.length + ' tahsilat kaydı (kasaya giren para)' },
        { l: 'Açık bakiye', v: F.money(openBal), sub: 'Bugün itibarıyla bütün onaylı satışlarda kalan' },
        { l: 'Bakım ücretleri', v: F.money(feeSum), sub: 'Tahsil edilen ' + F.money(feePaid) + ' · bekleyen ' + F.money(feeSum - feePaid) },
        { l: 'Tamamlanan montaj', v: insts.length + ' cihaz', sub: 'Montaj kaydı girilen fiziksel cihaz adedi' },
        { l: 'Tamamlanan bakım', v: woDone.length + ' iş emri', sub: devDone + ' cihaza bakım yapıldı (iş emri ve cihaz adedi ayrı sayılır)' },
        { l: 'Bakımı geciken cihaz', v: od + ' cihaz', sub: 'Bugün itibarıyla, dönemden bağımsız' },
        { l: 'Depo hareketi', v: mv + ' kayıt', sub: 'Giriş, çıkış, transfer ve sayım düzeltmeleri' }
      ],
      fxCards: [
        { l: 'Dönem satışları · işlem günü kuruyla', v: fxCovered?n2(usdSum)+' USD':'Kur eksik',sub:fxCovered+'/'+sales.length+' satışın kuru var · '+n2(eurSum)+' EUR' },
        { l: 'Aynı satışların bugünkü kurla değeri', v: fxNow && fxComplete ? F.money(usdSum * fxNow.usd) : '—', sub: 'Satış toplamı ' + F.money(salesSum) + ' ile karşılaştırın' },
        { l: 'Kur kaynaklı fark (USD bazında)', v: fxNow && fxComplete ? F.money(usdSum * fxNow.usd - salesSum) : '—', sub: 'Pozitif değer: TL’nin döviz karşısında değer kaybı' }
      ],
      fxRows: rows,
      twoCols: bp === 'desktop' ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)',
      techRows: db.staff.map(t => ({ name: t.name + (t.active ? '' : ' (pasif)'), wo: db.workOrders.filter(w => w.status === 'tamamlandi' && w.completedBy === t.id && inR(w.completedAt)).length, dev: db.history.filter(h => h.by === t.id && h.done !== false && inR(h.date)).length, inst: db.devices.filter(d => d.installBy === t.id && inR(d.installDate)).length })),
      mahRows: Object.keys(mah).sort((a, b) => mah[b] - mah[a]).map(k => ({ name: k, n: mah[k], w: (mah[k] / mx * 100).toFixed(0) + '%' }))
    };
  }
}

return Component;};
window.GKCompiled["EkranSatis.dc.html"]=function(DCLogic,StreamableLogic,React){

const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
const num = v => { if (v === '' || v == null) return null; const n = Number(String(v).replace(/\./g, '').replace(',', '.')); return isNaN(n) ? null : n; };
class Component extends DCLogic {
  state = { filter: (this.props.params || {}).filter || 'all', wiz: (this.props.params || {}).newSale ? { step: 1, lines: [], date: this.props.db && this.props.db.today, customerId:this.props.params?.customerId,addressId:this.props.params?.addressId,note:this.props.params?.note,quoteRequestId:this.props.params?.quoteRequestId, cq: '', pq: '' } : null, pay: null, payErr: {}, payError: '', stockErr: null, cancelAsk: false, cancelNote: '', cancelErr: '', wizErr: '' };
  _pt = (this.props.params || {}).t;
  componentDidUpdate() { const p = this.props.params || {}; const changed = this._pt !== p.t; this._pt = p.t; if (changed) this.setState({ filter: p.filter || 'all', wiz: p.newSale ? { step: 1, lines: [], date: this.props.db.today, customerId:p.customerId,addressId:p.addressId,note:p.note,quoteRequestId:p.quoteRequestId,cq: '', pq: '' } : null, stockErr: null, cancelAsk: false }); }
  renderVals() {
    const db = this.props.db, act = this.props.act, bp = this.props.bp;
    if (!db || !window.GK) return {};
    const { R, F } = window.GK, s = this.state, mobile = bp === 'mobile', p = this.props.params || {};
    const set = x => this.setState(x), go = (sc, pp) => () => act.go(sc, pp);
    const stateK = x => R.saleState(x).k;
    const match = (x, f) => f === 'all' || (f === 'montaj' ? (stateK(x) === 'bekliyor' || stateK(x) === 'kismi') : stateK(x) === f);
    const chipDef = [['all', 'Tümü'], ['taslak', 'Taslak'], ['bekliyor', 'Montaj bekliyor'], ['kismi', 'Kısmi montaj'], ['tamam', 'Montaj tamamlandı'], ['iptal', 'İptal']];
    if (s.filter === 'montaj') chipDef.splice(1, 0, ['montaj', 'Montajı bekleyenler']);
    const sorted = db.sales.slice().sort((a, b) => b.date.localeCompare(a.date));
    const rows = sorted.filter(x => match(x, s.filter)).map(x => { const t = R.saleTotals(db, x), c = R.byId(db.customers, x.customerId), q = x.lines.reduce((n, l) => n + l.qty, 0), i = x.lines.reduce((n, l) => n + l.installed, 0); return { no: x.no, date: F.date(x.date), cName: c.name, items: x.lines.map(l => l.qty + ' × ' + R.pTitle(R.byId(db.products, l.productId))).join(', '), inst: i + '/' + q, total: F.money(t.total), paid: F.money(t.paid), balance: F.money(t.balance), st: R.saleState(x), open: go('satis', { saleId: x.id }) }; });
    const base = {
      todayIso: db.today, notMobile: !mobile, hideImg: act.hideImg, saving: this.props.saving, saveLabel: this.props.saving ? 'Kaydediliyor…' : 'Kaydet',
      newSale: () => set({ wiz: { step: 1, lines: [], date: db.today, cq: '', pq: '' }, wizErr: '' }),
      chips: chipDef.map(([k, l]) => Object.assign({ l, n: db.sales.filter(x => match(x, k)).length, sel: s.filter === k, pick: () => set({ filter: k }) }, s.filter === k ? SEL : UNS)),
      rows, listEmpty: !rows.length, rowCols: mobile ? 'minmax(0,1fr)' : '130px minmax(0,1.6fr) 100px minmax(0,1.3fr) 190px',
      mAlign: mobile ? 'flex-end' : 'center', mPad: mobile ? '0' : '24px', mRadius: mobile ? '16px 16px 0 0' : '16px', detailCols: bp === 'desktop' ? 'minmax(0,1.6fr) minmax(300px,1fr)' : 'minmax(0,1fr)'
    };
    const sale = p.saleId && R.byId(db.sales, p.saleId);
    base.isList = !sale; base.isDetail = !!sale;
    if (sale) {
      const t = R.saleTotals(db, sale), c = R.byId(db.customers, sale.customerId), a = R.byId(db.addresses, sale.addressId), st = R.saleState(sale), inst = sale.lines.some(l => l.installed > 0);
      const mwo = db.workOrders.find(w => w.saleId === sale.id && (w.status === 'planlandi' || w.status === 'islemde'));
      base.x = { no: sale.no, st, cName: c.name, openCustomer: go('musteriler', { customerId: c.id, tab: 'satislar' }), addr: a.label + ' · ' + R.addrLine(a) + ', ' + a.mah, date: F.date(sale.date), note: sale.note, cancelNote: sale.status === 'iptal' ? sale.cancelNote : '',
        isDraft: sale.status === 'taslak', confirmLabel: this.props.saving ? 'Kontrol ediliyor…' : 'Onayla ve stok ayır', canPay: sale.status === 'onayli' && t.balance > 0, canCancel: sale.status !== 'iptal' && st.k !== 'tamam' || (sale.status === 'onayli' && st.k === 'tamam' && false),
        cancelLabel: sale.status === 'taslak' ? 'Taslağı iptal et' : (inst || t.paid > 0 ? 'İptal / iade' : 'İptal et'),
        refundNeeded: inst || t.paid > 0, simpleCancel: !(inst || t.paid > 0), refundText: 'Bu satışta ' + (inst ? 'montaj yapılmış' : '') + (inst && t.paid ? ' ve ' : '') + (t.paid ? F.money(t.paid) + ' tahsilat var' : '') + '.',
        cancelSummary: sale.status === 'taslak' ? 'Taslak iptal edilir; stok etkilenmez.' : 'Rezerve edilen ' + R.pendingUnits(sale) + ' adet serbest kalır. Montaj ve tahsilat yok.',
        total: F.money(t.total), paid: F.money(t.paid), balance: F.money(t.balance), balFg: t.balance > 0 ? '#A3001A' : '#1B6B3F',
        pays: db.payments.filter(y => y.saleId === sale.id).map(y => ({ amount: F.money(y.amount), date: F.date(y.date), method: y.method, note: y.note ? ' · ' + y.note : '', fx: R.fxText(db, y.amount, y.date, y.fx) })),
        totalFx: R.fxText(db, t.total, sale.date, sale.fx),
        fxDiff: (() => { const f0 = sale.fx || R.fxAt(db, sale.date), ps = db.payments.filter(y => y.saleId === sale.id); if (!f0 || !ps.length) return ''; let u = 0; for (const y of ps) { const fy = y.fx || R.fxAt(db, y.date); if (!fy) return ''; u += y.amount / fy.usd; } const u0 = t.paid / f0.usd, dlt = u - u0; if (Math.abs(dlt) < 0.5) return 'Tahsilatlar satış günü kuruyla aynı USD değerinde.'; return 'Kur etkisi: tahsil edilen ' + F.money(t.paid) + ', satış günü kuruyla ' + u0.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' USD ederdi; tahsilat günlerinin kuruyla ' + u.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' USD (' + (dlt < 0 ? '' : '+') + dlt.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' USD).'; })(), noPay: !db.payments.some(y => y.saleId === sale.id),
        woText: mwo ? 'Montaj randevusu: ' + F.date(mwo.date) + ' ' + mwo.start + ' · ' + R.staffName(db, mwo.techId) + ' — planlandı, henüz yapılmadı.' : '',
        lines: sale.lines.map(l => { const pr = R.byId(db.products, l.productId), w = R.byId(db.depots, l.depotId), pend = sale.status === 'onayli' ? l.qty - l.installed : 0, devs = db.devices.filter(d => d.lineId === l.id); const vImg = l.variant && (pr.variants || []).find(v => v.name === l.variant); return { title: R.pTitle(pr) + (pr.level === 'seri' ? ' (seri düzeyi)' : '') + (l.variant ? ' · ' + l.variant : ''), img: (vImg && vImg.img) || pr.img, depot: w.name, qty: l.qty, inst: l.installed + ' takıldı', price: F.money(l.price), disc: F.money(l.disc || 0), total: F.money(R.lineTotal(l)), cost: l.cost == null ? 'Belirtilmedi' : F.money(l.cost),
          pending: pend > 0 ? [{ text: pend + ' adet montaj bekliyor · ' + w.name + ' stoğunda rezerve. Montaj tarihi ve yapan kişi: Bekliyor', install: () => act.open('install', { saleId: sale.id, lineId: l.id, date: db.today, woId: mwo && mwo.lineId === l.id ? mwo.id : undefined, by: mwo ? mwo.techId : '' }) }] : [],
          devices: devs.map(d => ({ text: d.room + ' · ' + F.date(d.installDate) + ' · ' + R.staffName(db, d.installBy) + ' · SN ' + (d.serialIn || 'Belirtilmedi'), open: go('musteriler', { customerId: d.customerId, tab: 'klimalar', deviceId: d.id }) })) }; }),
        confirm: () => act.submit('confirmSale', sale.id, () => { set({ stockErr: null }); act.toast(sale.no + ' onaylandı; adetler rezerve edildi.'); }, r => set({ stockErr: (r.fields && r.fields.stock) || null })),
        editDraft: () => set({ wiz: { id: sale.id, no: sale.no, step: 3, customerId: sale.customerId, addressId: sale.addressId, date: sale.date, note: sale.note, lines: sale.lines.map(l => ({ id: l.id, productId: l.productId, variant: l.variant || '', depotId: l.depotId, qty: String(l.qty), price: String(l.price), cost: l.cost == null ? '' : String(l.cost), disc: l.disc ? String(l.disc) : '' })), cq: '', pq: '' }, stockErr: null, wizErr: '' }),
        pay: () => set({ pay: { date: db.today, amount: '', method: '', note: '' }, payErr: {}, payError: '' }),
        askCancel: () => set({ cancelAsk: true, cancelNote: '', cancelErr: '' })
      };
      base.stockErr = s.stockErr ? s.stockErr.map(e => ({ text: R.pTitle(R.byId(db.products, e.productId)) + ': ' + e.need + ' adet gerekli, ' + R.byId(db.depots, e.depotId).name + ' satılabilir ' + e.st.avail + ' (fiziksel ' + e.st.physical + ', rezerve ' + e.st.reserved + ').' })) : null;
      base.toStock = go('depo', { move: true, productId: s.stockErr && s.stockErr[0] && s.stockErr[0].productId });
      base.cancelAsk = s.cancelAsk; base.cancelNote = s.cancelNote; base.cancelErr = s.cancelErr; base.onCancelNote = e => set({ cancelNote: e.target.value, cancelErr: '' }); base.closeCancel = () => set({ cancelAsk: false });
      base.doCancel = () => act.submit('cancelSale', { id: sale.id, note: s.cancelNote }, () => { set({ cancelAsk: false }); act.toast(sale.no + ' iptal edildi.'); }, r => set({ cancelErr: r.error }));
      base.payOpen = !!s.pay; base.closePay = () => set({ pay: null });
      if (s.pay) { const pfOn = {}; ['date', 'amount', 'method', 'note'].forEach(k => pfOn[k] = e => { const v = k === 'amount' ? window.GK.P.money(e.target.value) : k === 'note' ? e.target.value.slice(0, 120) : e.target.value; this.setState(st => ({ pay: Object.assign({}, st.pay, { [k]: v }), payErr: Object.assign({}, st.payErr, { [k]: null }) })); }); Object.assign(base, { pf: s.pay, pfOn, pfe: s.payErr, payError: s.payError, pfAmountBd: s.payErr.amount ? '#C8102E' : '#CDD2D9', savePay: () => act.submit('addPayment', Object.assign({ saleId: sale.id }, s.pay), () => { set({ pay: null }); act.toast('Tahsilat kaydedildi.'); }, r => set({ payErr: r.fields || {}, payError: r.error })) }); }
    } else base.x = {};
    const wz = s.wiz;
    base.wizOpen = !!wz; base.closeWiz = () => set({ wiz: null });
    if (wz) {
      const upd = patch => this.setState(st => ({ wiz: Object.assign({}, st.wiz, patch), wizErr: '' }));
      const c = wz.customerId && R.byId(db.customers, wz.customerId), a = wz.addressId && R.byId(db.addresses, wz.addressId);
      const cq = (wz.cq || '').toLocaleLowerCase('tr'), pq = (wz.pq || '').toLocaleLowerCase('tr');
      const lines = wz.lines.map((l, i) => {
        const pr = R.byId(db.products, l.productId), stk = R.stock(db, l.productId, l.depotId, l.variant || undefined), q = Number(l.qty) || 0, tot = q * (num(l.price) || 0) - (num(l.disc) || 0), on = {};
        ['depotId', 'qty', 'price', 'cost', 'disc'].forEach(k => on[k] = e => { const P = window.GK.P, raw = e.target.value, v = k === 'depotId' ? raw : k === 'qty' ? P.int(raw, 3) : P.money(raw); this.setState(st => ({ wiz: Object.assign({}, st.wiz, { lines: st.wiz.lines.map((x, j) => j === i ? Object.assign({}, x, { [k]: v }) : x) }) })); });
        return { hasVars: (pr.variants || []).length > 0, vars: (pr.variants || []).map(v => Object.assign({ l: v.name, sel: l.variant === v.name, pick: () => this.setState(st => ({ wiz: Object.assign({}, st.wiz, { lines: st.wiz.lines.map((x, j) => j === i ? Object.assign({}, x, { variant: v.name }) : x) }) })) }, l.variant === v.name ? SEL : UNS)), title: R.pTitle(pr) + (l.variant ? ' · ' + l.variant : ''), seriesWarn: pr.level === 'seri', depotId: l.depotId, qty: l.qty, price: l.price, cost: l.cost, disc: l.disc, on, depots: db.depots.map(w => ({ id: w.id, name: w.name + ' (satılabilir ' + R.stock(db, l.productId, w.id).avail + ')' })), total: F.money(tot), tot, short: q > stk.avail,
          stockText: q > stk.avail ? 'Yetersiz: ' + q + ' adet istendi, bu depoda satılabilir ' + stk.avail : 'Stok yeterli: satılabilir ' + stk.avail, stockFg: q > stk.avail ? '#A3001A' : '#1B6B3F', costText: num(l.cost) == null ? 'Belirtilmedi' : F.money(num(l.cost)),
          remove: () => upd({ lines: wz.lines.filter((x, j) => j !== i) }) };
      });
      const short = lines.some(l => l.short), stepOk = [true, !!c, !!a, lines.length > 0 && lines.every(l => Number(l.qty) > 0 && num(l.price) != null), !!wz.date, true];
      const names = ['Müşteri', 'Montaj adresi', 'Kalemler', 'Tarih ve not', 'Özet'];
      const payload = confirm => ({ id: wz.id, no: wz.no, customerId: wz.customerId, addressId: wz.addressId, date: wz.date, note: wz.note, demoRequestId:wz.quoteRequestId, confirm, lines: wz.lines.map(l => ({ id: l.id, productId: l.productId, variant: l.variant || null, depotId: l.depotId, qty: Number(l.qty), price: num(l.price), cost: num(l.cost), disc: num(l.disc) || 0 })) });
      base.wz = {
        title: wz.id ? 'Taslağı düzenle · ' + wz.no : 'Yeni satış', error: s.wizErr,
        steps: names.map((l, i) => { const n = i + 1, cur = wz.step === n, dis = !stepOk.slice(0, n).every(Boolean); return { n, l, dis, bg: cur ? '#FBEFF1' : 'transparent', fg: cur ? '#B1001A' : dis ? '#A0A6AE' : '#252B32', nbg: cur ? '#B1001A' : n < wz.step ? '#2E9E5E' : '#A0A6AE', pick: () => !dis && upd({ step: n }) }; }),
        s1: wz.step === 1, s2: wz.step === 2, s3: wz.step === 3, s4: wz.step === 4, s5: wz.step === 5,
        cq: wz.cq, onCq: e => upd({ cq: e.target.value }), pq: wz.pq, onPq: e => upd({ pq: e.target.value }),
        customers: db.customers.filter(x => x.active !== false && (!cq || x.name.toLocaleLowerCase('tr').includes(cq) || (x.phone || '').includes(cq))).map(x => Object.assign({ name: x.name, sub: F.phone(x.phone) + ' · ' + R.addrsOf(db, x.id).length + ' adres', pick: () => upd({ customerId: x.id, addressId: (R.addrsOf(db, x.id)[0] || {}).id, step: 2 }) }, x.id === wz.customerId ? SEL : UNS)),
        newCustomer: () => act.open('customer', { type: 'Kişi', contact: 'bilinmiyor' }),
        cName: c ? c.name : '', addrs: c ? R.addrsOf(db, c.id).map(x => Object.assign({ label: x.label, line: x.line + ', ' + x.mah + ' / ' + x.ilce, pick: () => upd({ addressId: x.id }) }, x.id === wz.addressId ? SEL : UNS)) : [], noAddr: c && !R.addrsOf(db, c.id).length,
        newAddr: () => act.open('address', { customerId: wz.customerId, label: 'Ev' }),
        products: db.products.filter(x => !pq || (R.pTitle(x) + ' ' + x.series).toLocaleLowerCase('tr').includes(pq)).map(x => { const tt = R.stockTotal(db, x.id); return { title: R.pTitle(x), series: x.level === 'seri' ? 'Seri düzeyi · ' + x.type : x.series, img: x.img, noImg: x.img ? 'Görsel yüklenemedi' : 'Klima görseli eklenmedi', avail: 'Satılabilir ' + tt.avail + ' · ' + db.depots.map(w => w.name.split(' ')[0] + ' ' + R.stock(db, x.id, w.id).avail).join(' / '), availFg: tt.avail > 0 ? '#1B6B3F' : '#A3001A', add: () => { const best = db.depots.slice().sort((p1, p2) => R.stock(db, x.id, p2.id).avail - R.stock(db, x.id, p1.id).avail)[0]; const lc = R.lastCost(db, x.id); upd({ lines: wz.lines.concat([{ productId: x.id, depotId: best.id, qty: '1', price: x.price != null ? String(x.price) : '', cost: lc != null ? String(lc) : '', disc: '' }]) }); } }; }),
        lines, noLines: !lines.length, date: wz.date, onDate: e => upd({ date: e.target.value }), note: wz.note || '', onNote: e => upd({ note: e.target.value }),
        addrText: a ? a.label + ' · ' + R.addrLine(a) : '', dateText: F.date(wz.date), total: F.money(lines.reduce((n, l) => n + l.tot, 0)),
        stockBlock: short ? 'Yetersiz stok nedeniyle onaylanamaz. Taslak olarak kaydedebilir, stok gelince onaylayabilirsiniz.' : '',
        canBack: wz.step > 1, back: () => upd({ step: wz.step - 1 }), notLast: wz.step < 5, last: wz.step === 5,
        next: () => stepOk[wz.step] && upd({ step: wz.step + 1 }), nextDis: !stepOk[wz.step], nextOp: stepOk[wz.step] ? 1 : 0.5,
        confirmDis: short || this.props.saving, confirmOp: short ? 0.5 : 1,
        saveDraft: () => act.submit('saveSale', payload(false), r => { set({ wiz: null }); act.toast('Taslak kaydedildi; stok ayrılmadı.'); act.go('satis', { saleId: r.id }); }, r => set({ wizErr: r.error })),
        saveConfirm: () => act.submit('saveSale', payload(true), r => { set({ wiz: null }); act.toast('Satış onaylandı; adetler rezerve edildi.'); act.go('satis', { saleId: r.id }); }, r => set({ wizErr: r.error }))
      };
    }
    return base;
  }
}

return Component;};
window.GKCompiled["HaritaBileseni.dc.html"]=function(DCLogic,StreamableLogic,React){

class Component extends DCLogic {
  mapRef = React.createRef();
  state = { failed: false, ready: false };
  componentDidMount() {
    this.tries = 0;
    if (!window.L && !document.getElementById('gk-leaflet-js')) {
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = './leaflet.css'; document.head.appendChild(css);
      const js = document.createElement('script'); js.id = 'gk-leaflet-js'; js.src = './e18ce9ea-f869-42df-9c61-8f9cb1d6e341.js'; document.head.appendChild(js);
    }
    this.boot();
  }
  boxRef = React.createRef();
  toggleFull = () => { const f = !this.state.full; this.setState({ full: f }); if (f) { this.onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); this.setState({ full: false }); window.removeEventListener('keydown', this.onKey, true); } }; window.addEventListener('keydown', this.onKey, true); } else if (this.onKey) window.removeEventListener('keydown', this.onKey, true); setTimeout(() => this.map && this.map.invalidateSize({ pan: false }), 260); };
  resetSize = () => this.setState({ h: null });
  startDrag = e => {
    const el = this.boxRef.current; if (!el) return; e.preventDefault();
    const r = el.getBoundingClientRect(), sc = r.height / (el.offsetHeight || r.height) || 1, y0 = e.clientY, h0 = el.offsetHeight;
    const mv = ev => { const nh = Math.max(200, Math.min(1600, Math.round(h0 + (ev.clientY - y0) / sc))); this.setState({ h: nh }); };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    this.dragCleanup=up; document.body.style.cursor = 'ns-resize'; document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };
  componentWillUnmount() { this.disposed=true;clearTimeout(this.tileFallbackTimer);window.removeEventListener('online',this.useRealTiles);window.removeEventListener('offline',this.useFallbackTiles);clearTimeout(this.resizeTimer);if(this.dragCleanup)this.dragCleanup(); if (this.onKey) window.removeEventListener('keydown', this.onKey, true); clearTimeout(this.t); if (this.ro) this.ro.disconnect(); if(this.map){this.map.stop();this.map.off();this.map.remove();this.map=null;} }
  boot() {
    if (window.L) return this.init();
    if (++this.tries > 50) return this.setState({ failed: true });
    this.t = setTimeout(() => this.boot(), 150);
  }
  init() {
    const L = window.L, el = this.mapRef.current; if (!el || this.map) return;
    const v = this.props.view, c = v || this.props.center || { lat: 38.4585, lng: 27.2115 };
    this.mk = {};
    this.map = L.map(el, { maxZoom: 18, scrollWheelZoom: true, wheelPxPerZoomLevel: 110, zoomSnap: 0.25, zoomDelta: 0.5, tap: true }).setView([c.lat, c.lng], (v && v.zoom) || this.props.zoom || 15);
    this.map.on('moveend', () => { const ce = this.map.getCenter(); this.props.onView && this.props.onView({ lat: ce.lat, lng: ce.lng, zoom: this.map.getZoom() }); });
    if (window.ResizeObserver) { this.ro = new ResizeObserver(() => this.map && this.map.invalidateSize({ pan: false })); this.ro.observe(el); }
    this.focusKey = this.props.focus && this.props.focus.key;
    const base = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { attribution: 'Harita © Esri · Esri, HERE, Garmin, © OpenStreetMap katkıda bulunanlar', maxZoom: 18, maxNativeZoom: 16 });
    const reference = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, maxNativeZoom: 16, pane: 'overlayPane' });
    const fallback = L.tileLayer('/gunay-klima-demo/assets/demo-map-tile.svg', { maxZoom: 18, attribution: 'Bu altlık gerçek yol haritası değildir' });
    this.useFallbackTiles = () => {
      if (this.disposed || !this.map) return;
      base.remove(); reference.remove(); fallback.addTo(this.map); el.dataset.mapSource = 'fallback';
    };
    this.useRealTiles = () => {
      if (this.disposed || !this.map) return;
      clearTimeout(this.tileFallbackTimer); fallback.remove(); el.dataset.mapSource = 'esri';
      base.addTo(this.map); reference.addTo(this.map);
    };
    for (const layer of [base, reference]) {
      let errors = 0;
      layer.on('loading', () => { errors = 0; });
      layer.on('tileerror', () => { errors++; });
      layer.on('load', () => { if (errors && el.dataset.mapSource === 'esri') this.tileFallbackTimer = setTimeout(this.useFallbackTiles, 0); });
    }
    window.addEventListener('online', this.useRealTiles); window.addEventListener('offline', this.useFallbackTiles);
    if (navigator.onLine === false) this.useFallbackTiles(); else this.useRealTiles();
    this.map.on('click', e => { if (this.props.pickMode && this.props.onPick) this.props.onPick(+e.latlng.lat.toFixed(6), +e.latlng.lng.toFixed(6)); });
    this.setState({ ready: true });
    this.sync();
    this.resizeTimer=setTimeout(() => !this.disposed && this.map && this.map.invalidateSize(),250);
  }
  componentDidUpdate() { if (this.map) this.sync(); }
  // Pinler kimlikle tutulur; yalnız değişen ikon/konum güncellenir. Görünüm yalnız `focus.key` değişince taşınır.
  sync() {
    const L = window.L, p = this.props;
    if (p.center && p.radiusKm) {
      if (!this.circle) this.circle = L.circle([p.center.lat, p.center.lng], { radius: p.radiusKm * 1000, color: '#B1001A', weight: 1.5, fillColor: '#B1001A', fillOpacity: 0.05, dashArray: '5 5', interactive: false }).addTo(this.map);
      else { this.circle.setLatLng([p.center.lat, p.center.lng]); this.circle.setRadius(p.radiusKm * 1000); }
    } else if (this.circle) { this.circle.remove(); this.circle = null; }
    if (p.business && Number.isFinite(p.business.lat) && Number.isFinite(p.business.lng) && !this.biz) {
      const html = '<div style="width:30px;height:30px;border-radius:8px;background:#252B32;color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);font:700 13px/26px IBM Plex Sans,sans-serif;text-align:center">G</div>';
      this.biz = L.marker([p.business.lat, p.business.lng], { icon: L.divIcon({ className: '', html, iconSize: [30, 30], iconAnchor: [15, 15] }), title: 'Günay Klima (yaklaşık konum)' }).addTo(this.map);
    }
    const route = (p.route || []).map(r => [r.lat, r.lng]);
    if (route.length > 1) { if (!this.line) this.line = L.polyline(route, { color: '#252B32', weight: 2, dashArray: '6 6', opacity: 0.75, interactive: false }).addTo(this.map); else this.line.setLatLngs(route); }
    else if (this.line) { this.line.remove(); this.line = null; }
    const seen = {};
    (p.pins || []).forEach(pin => {
      seen[pin.id] = 1;
      const sel = pin.id === p.selectedId, sz = sel ? 38 : pin.dim ? 20 : 30, fill = pin.hollow ? '#fff' : pin.color;
      const inner = '<div style="position:relative;width:' + sz + 'px;height:' + sz + 'px;border-radius:' + (pin.stop ? '8px' : '50%') + ';background:' + fill + ';opacity:' + (pin.dim ? 0.55 : 1) + ';border:' + (pin.hollow ? '2px dashed ' + pin.color : '2px solid #fff') + ';box-shadow:0 1px 4px rgba(0,0,0,.35)' + (sel ? ',0 0 0 3px #252B32' : '') + ';color:' + (pin.hollow ? pin.color : '#fff') + ';font:700 ' + (pin.stop ? 14 : 12) + 'px/1 IBM Plex Sans,sans-serif;display:flex;align-items:center;justify-content:center">' + (pin.dim ? '' : String(pin.label || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))) + '</div>';
      const html = '<div style="position:relative;transition:transform .18s cubic-bezier(.4,0,.2,1);width:' + sz + 'px;height:' + sz + 'px">' + (sel ? '<span style="position:absolute;inset:0;border-radius:' + (pin.stop ? '10px' : '50%') + ';background:' + pin.color + ';animation:gkPulse 1.6s ease-out infinite"></span>' : '') + inner + '</div>';
      let mk = this.mk[pin.id];
      if (!mk) { mk = L.marker([pin.lat, pin.lng], { title: pin.title || '', keyboard: true }); mk.on('click', () => this.props.onSelect && this.props.onSelect(pin.id)); mk.addTo(this.map); this.mk[pin.id] = mk; mk._sig = ''; mk.bindTooltip(Object.assign(document.createElement('span'),{textContent:pin.title||''}), { direction: 'top', offset: [0, -16], opacity: 1 }); mk.on('mouseover', () => { const e = mk.getElement(); if (e && e.firstChild) e.firstChild.style.transform = 'scale(1.18)'; }); mk.on('mouseout', () => { const e = mk.getElement(); if (e && e.firstChild) e.firstChild.style.transform = ''; }); }
      if (mk._tt !== pin.title) { mk.setTooltipContent(Object.assign(document.createElement('span'),{textContent:pin.title||''})); mk._tt = pin.title; }
      if (mk._sig !== html) { mk.setIcon(L.divIcon({ className: '', html, iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2] })); mk._sig = html; mk.setZIndexOffset(sel ? 1000 : pin.stop ? 500 : 0); }
      const ll = mk.getLatLng(); if (ll.lat !== pin.lat || ll.lng !== pin.lng) mk.setLatLng([pin.lat, pin.lng]);
    });
    Object.keys(this.mk).forEach(id => { if (!seen[id]) { this.mk[id].remove(); delete this.mk[id]; } });
    const f = p.focus;
    if (f && f.key !== this.focusKey) {
      this.focusKey = f.key;
      if (f.bounds && f.bounds.length > 1) this.map.flyToBounds(f.bounds, { padding: [48, 48], maxZoom: 16, duration: 0.7 });
      else if (f.bounds && f.bounds.length === 1) this.map.flyTo(f.bounds[0], Math.max(this.map.getZoom(), 16), { duration: 0.6 });
      else if (f.lat != null) this.map.flyTo([f.lat, f.lng], f.zoom || Math.max(this.map.getZoom(), 15), { duration: 0.6 });
    }
  }
  renderVals() {
    const p = this.props, s = this.state, full = !!s.full, fixed = p.height && p.height !== 'auto' ? p.height : null, resizable = p.resizable !== false && !full;
    return {
      mapRef: this.mapRef, boxRef: this.boxRef, failed: s.failed, loading: !s.ready && !s.failed, note: p.note || 'Doğrulanmış müşteri konumları',
      full, pos: full ? 'fixed' : 'relative', inset: full ? '16px' : 'auto', z: full ? 2400 : 0, w: full ? 'auto' : '100%', h: full ? 'auto' : s.h ? s.h + 'px' : (fixed || 'auto'), ar: full || s.h || fixed ? 'auto' : (p.ratio || '16 / 9'),
      rad: full ? '16px' : '12px', sh: full ? '0 30px 80px rgba(0,0,0,.35)' : 'none', anim: full ? 'gkPop .24s cubic-bezier(.2,.8,.2,1)' : 'none',
      toggleFull: this.toggleFull, fullTitle: full ? 'Tam ekrandan çık (Esc)' : 'Tam ekran', fullLabel: full ? 'Küçült' : 'Tam ekran', fullIcon: full ? 'M9 4v5H4 M15 4v5h5 M9 20v-5H4 M15 20v-5h5' : 'M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5',
      showHandle: resizable, startDrag: this.startDrag, resetSize: this.resetSize, canReset: !!s.h && !full, ctlBottom: resizable ? '26px' : '10px'
    };
  }
}

return Component;};
window.GKCompiled["index.html"]=function(DCLogic,StreamableLogic,React){

const IC = {
  bugun: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4 M9 15l2 2 4-4',
  musteriler: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6 M16 4.5a3.5 3.5 0 0 1 0 6.5 M18 14.2c2.1.7 3.5 2.8 3.5 5.8',
  satis: 'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',
  bakim: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  harita: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  depo: 'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z M3 7.5l9 4.5 9-4.5 M12 12v9',
  raporlar: 'M4 20V11 M10 20V5 M16 20v-6 M21 20H3',
  ayarlar: 'M4 6h9 M17 6h3 M15 4v4 M4 12h3 M11 12h9 M9 10v4 M4 18h11 M19 18h1 M17 16v4',
  daha: 'M5 12h.01 M12 12h.01 M19 12h.01'
};
IC.cagrilar = 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.09 9.89a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92z';
IC.talepler = 'M4 4h16l2 10v6H2v-6L4 4z M2 14h6l2 3h4l2-3h6';
IC.mail = 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6';
const LABEL = { cagrilar: 'Çağrılar', talepler: 'Talepler', mail: 'Mail', bugun: 'Bugün', musteriler: 'Müşteriler', satis: 'Satış', bakim: 'Bakım', harita: 'Harita', depo: 'Depo', raporlar: 'Raporlar', ayarlar: 'Ayarlar' };
const SAN = { price: v => window.GK.P.money(v), phone: (v, m) => window.GK.P.phone(v, m && m.phoneIntl), fee: v => window.GK.P.money(v), serialIn: v => window.GK.P.serial(v), serialOut: v => window.GK.P.serial(v), lat: v => window.GK.P.dec(v), lng: v => window.GK.P.dec(v), room: v => String(v).slice(0, 40), name: v => String(v).replace(/\s{2,}/g, ' ').slice(0, 80), person: v => String(v).slice(0, 60), line: v => String(v).slice(0, 140), street: v => String(v).slice(0, 80), no: v => String(v).replace(/[^0-9A-Za-zÇĞİÖŞÜçğıöşü\/-]/g, '').slice(0, 8), building: v => String(v).slice(0, 60), block: v => String(v).slice(0, 10), floor: v => String(v).slice(0, 8), door: v => String(v).slice(0, 30), directions: v => String(v).slice(0, 120), mah: v => String(v).slice(0, 40), ilce: v => String(v).slice(0, 40) };
const KEYS = ['price','priceKind','street','no','building','block','floor','door','directions','il','dupOk','withAddr','feePaid','feeMethod','dir','topic','flagIt','flagType','buffer','name','type','phone','phoneUnknown','contact','note','person','label','line','mah','ilce','lat','lng','verified','customerId','addressId','date','start','dur','techId','override','changeReason','result','callback','noContact','lineId','serialIn','serialOut','room','by','interval','baseInstall','fee','cancelNote'];
const SEL = { bg: '#FBEFF1', fg: '#B1001A', bd: '#B1001A' }, UNS = { bg: '#FFFFFF', fg: '#252B32', bd: '#CDD2D9' };
const opt = (sel) => sel ? SEL : UNS;

class Component extends DCLogic {
  state = { db: null, screen: this.props.screen || 'bugun', params: Object.assign({ t: 1 }, this.props.params || {}), view: 'auto', EW: 390, EH: 844, W: window.innerWidth, H: window.innerHeight, modal: null, m: {}, err: {}, formError: null, saving: false, toast: null, scen: false, offline: !navigator.onLine, q: '', sOpen: false, more: false, askClose: false, result: null, fakeLoad: false };
  panelRef = React.createRef();
  h = {};
  mem = {};
  geoSeq = 0;
  locate(idx) {
    const m=this.state.m,a=idx>=0?(m.addrs||[])[idx]:m;
    if(!a||!(a.street||'').trim()||!(a.ilce||'').trim()){this.toast('Haritada aramak için cadde / sokak ve ilçe girin.','err');return;}
    window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([a.street,a.no,a.mah,a.ilce,a.il].filter(Boolean).join(' ')),'_blank','noopener,noreferrer');
    this.toast('Harita açıldı. Kayıttan sonra Adresler bölümünde doğru pini seçip doğrulayın.');
  }
  autoLocate(idx) { this.setState({geo:null}); }
  geoQuery(text,idx) {
    const q=String(text||'').trim().toLocaleLowerCase('tr');
    if(q.length<3){this.setState({geo:null});return;}
    const R=window.GK.R, items=(this.state.db?.addresses||[]).filter(a=>Number.isFinite(a.lat)&&Number.isFinite(a.lng)&&(a.street||a.line||'').toLocaleLowerCase('tr').includes(q)).slice(0,5).map(a=>{
      const f=R.splitLine(a.line||'');return {lat:a.lat,lng:a.lng,road:a.street||f.street,house:a.no||a.buildingNo||f.no,mah:a.mah,ilce:a.ilce,main:a.line,sub:[a.mah,a.ilce,a.il||a.city].filter(Boolean).join(', ')};
    });this.setState({geo:items.length?{idx,items}:null});
  }
  scrollMem = {};
  mainRef = React.createRef();
  rootRef = React.createRef();
  wrapRef = React.createRef();
  attachObs() {
    if (this.wo || !window.ResizeObserver || !this.wrapRef.current) return;
    this.wo = new ResizeObserver(es => { const r = es[0] && es[0].contentRect; if (!r || !r.width) return; const WW = Math.round(r.width), WH = Math.round(r.height); if (WW !== this.state.WW || WH !== this.state.WH) this.setState({ WW, WH }); });
    this.wo.observe(this.wrapRef.current);
  }
  componentDidMount() {
    this.onNetwork=()=>this.setState({offline:!navigator.onLine});window.addEventListener('online',this.onNetwork);window.addEventListener('offline',this.onNetwork);
    this.onR = () => { const de = document.documentElement, W = window.innerWidth || de.clientWidth, H = window.innerHeight || de.clientHeight; if (W && H && (W !== this.state.W || H !== this.state.H)) this.setState({ W, H }); };
    window.addEventListener('resize', this.onR);
    this.onR(); requestAnimationFrame(this.onR); setTimeout(this.onR, 300);
    if (window.ResizeObserver) { this.wro = new ResizeObserver(this.onR); this.wro.observe(document.documentElement); }
    if (window.ResizeObserver && this.rootRef.current) { this.rro = new ResizeObserver(es => { const r = es[0] && es[0].contentRect; if (r && r.width > 0 && Math.round(r.width) !== this.state.MW) this.setState({ MW: Math.round(r.width) }); }); this.rro.observe(this.rootRef.current); const bar = this.rootRef.current.firstElementChild; if (bar) { this.bro = new ResizeObserver(() => { const h = bar.offsetHeight; if (h && h !== this.state.BH) this.setState({ BH: h }); }); this.bro.observe(bar); } }
    this.onVis = () => { if (!document.hidden) this.onR(); }; document.addEventListener('visibilitychange', this.onVis);
    this.onK = e => { if (e.key !== 'Escape') return; if (this.state.modal) this.tryClose(); else if (this.state.scen) this.setState({ scen: false }); else if (this.state.sOpen) this.setState({ sOpen: false }); };
    window.addEventListener('keydown', this.onK);
    const sync = () => { this.raf = null; document.querySelectorAll('select[data-v]').forEach(sel => { const v = sel.getAttribute('data-v') || ''; if (sel.value !== v && Array.prototype.some.call(sel.options, o => o.value === v)) sel.value = v; }); };
    this.mo = new MutationObserver(() => { if (!this.raf) this.raf = requestAnimationFrame(sync); });
    this.mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-v'] });
    this.loadState();
    this.onFocus = () => { if (!this.state.saving && !this.state.modal) this.loadState(true); };
    window.addEventListener('focus', this.onFocus);
    this.refreshTimer = setInterval(this.onFocus, 60000);
  }
  componentWillUnmount() { window.removeEventListener('online',this.onNetwork);window.removeEventListener('offline',this.onNetwork);clearInterval(this.refreshTimer);window.removeEventListener('focus',this.onFocus);clearTimeout(this.geoT);clearTimeout(this.autoLocT); if (this.wo) this.wo.disconnect(); if (this.bro) this.bro.disconnect(); if (this.rro) this.rro.disconnect(); if (this.wro) this.wro.disconnect(); document.removeEventListener('visibilitychange', this.onVis); if (this.ero) this.ero.disconnect(); if (this.mo) this.mo.disconnect(); window.removeEventListener('resize', this.onR); window.removeEventListener('keydown', this.onK); clearTimeout(this.bt); clearTimeout(this.tt); }
  componentDidUpdate() {
    this.attachObs();
    window.dispatchEvent(new Event('gk-form-state'));
    const cur = this.state.modal, prev = this._pm; this._pm = cur;
    if (cur && cur !== prev) setTimeout(() => {
      const el = this.panelRef.current; if (!el) return;
      const lim = el.getBoundingClientRect().top + Math.min(el.clientHeight, 420);
      const f = Array.from(el.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([disabled]),select,textarea')).find(x => x.offsetParent !== null && x.getBoundingClientRect().top < lim);
      try { (f || el).focus({ preventScroll: true }); } catch (e) { (f || el).focus(); }
      el.scrollTop = 0;
      let p = el.parentElement; while (p && p !== document.body) { if (p.scrollTop && getComputedStyle(p).overflowY === 'hidden') p.scrollTop = 0; p = p.parentElement; }
    }, 80);
    if (!cur && prev && this.lastFocus) { try { this.lastFocus.focus(); } catch (e) {} }
  }
  makeAct() {
    return {
      go: (screen, params) => {
        if (window.GKApi.demo && sessionStorage.getItem('gk-demo-person')) { const role = this.state.db?.demoSuite?.people.find(x => x.id === sessionStorage.getItem('gk-demo-person')); if (role?.role === 'technician' && !['bugun','bakim'].includes(screen)) return this.toast('Bu görünümde yalnız kendi işleriniz var.'); }
        const el = this.mainRef.current, rk = (sc, p) => sc + '|' + ((p && (p.customerId || p.saleId)) || '');
        if (el) this.scrollMem[rk(this.state.screen, this.state.params)] = el.scrollTop;
        const nk = rk(screen, params || {});
        this.setState({ screen, params: Object.assign({ t: Date.now() }, params || {}), more: false, sOpen: false, q: '', scen: false, modal: null }, () => {
          const restore = () => { const m = this.mainRef.current; if (m) m.scrollTop = this.scrollMem[nk] || 0; };
          requestAnimationFrame(() => { restore(); setTimeout(restore, 120); });
        });
      },
      sms: (customerId, workOrderId) => window.GKDemoUI?.sms(customerId, workOrderId),
      open: (modal, m) => { if(modal==='customer'&&!m?.id)m=Object.assign({withAddr:true,addrs:[{label:'Ev',il:'',ilce:''}],devs:[]},m||{}); if (modal === 'address' && m && m.street === undefined) m = Object.assign({}, m, window.GK.R.splitLine(m.line || ''), { il: m.il || m.city || '', no: m.no || m.buildingNo || window.GK.R.splitLine(m.line||'').no || '', door: m.door || m.doorNo || window.GK.R.splitLine(m.line||'').door || '' }); this.lastFocus = document.activeElement; this.setState({ modal, m: Object.assign({}, m || {}), err: {}, formError: null, askClose: false, result: null }); },
      close: () => this.closeNow(),
      toast: (t, tone) => this.toast(t, tone),
      submit: (op, payload, ok, bad) => this.submit(op, payload, ok, bad),
      hideImg: e => { e.target.style.display = 'none'; },
      keep: (k,v) => { this.mem[k]=v;try{sessionStorage.setItem('gk-'+window.GKApi.space+'-'+k,JSON.stringify(v));}catch(e){} },
      recall: k => {if(this.mem[k])return this.mem[k];try{return JSON.parse(sessionStorage.getItem('gk-'+window.GKApi.space+'-'+k));}catch(e){return null;}}
    };
  }
  toast(text, tone) { clearTimeout(this.tt); this.setState({ toast: { text, tone: tone || 'ok' } }); this.tt = setTimeout(() => this.setState({ toast: null }), 4500); }
  async loadState(quiet=false) {
    try { const r=await window.GKApi.state(); if(!r.ok)throw new Error(r.error);this.setState({db:r.db,revision:r.revision,loadError:null}); }
    catch(e){ if(!quiet)this.setState({loadError:'Kayıtlar yüklenemedi. Bağlantıyı kontrol edip yeniden deneyin.'}); }
  }
  async submit(op,payload,ok,bad) {
    if(this.state.saving)return;
    this.setState({saving:true,formError:null});
    try {
      const r=await window.GKApi.action(op,payload,this.state.revision);
      if(!r.ok){this.setState({saving:false,err:r.fields||{},formError:r.error,...(r.db?{db:r.db,revision:r.revision}:{})});if(!this.state.modal)this.toast(r.error,'err');bad&&bad(r);return;}
      this.setState({db:r.db,revision:r.revision,saving:false,err:{},formError:null});ok&&ok(r);
    }catch(e){const r={ok:false,fields:{},error:e.message||'Bağlantı kurulamadı. Formunuz korunuyor.'};this.setState({saving:false,formError:r.error});this.toast(r.error,'err');bad&&bad(r);}
  }
  tryClose = () => { if (this.state.m.dirty && !this.state.result && !this.state.m.doneId && !this.state.m.callDone) this.setState({ askClose: true }); else this.closeNow(); };
  closeNow = () => {window.GKDemoUI?.cancelPendingCustomer();this.setState({ geo: null, modal: null, m: {}, err: {}, formError: null, askClose: false, result: null });};
  fh(k) { return this.h[k] || (this.h[k] = e => { const v0 = e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; const v = SAN[k] && typeof v0 === 'string' ? SAN[k](v0, this.state.m) : v0; this.setState(s => ({ m: Object.assign({}, s.m, { [k]: v, dirty: true }), err: Object.assign({}, s.err, { [k]: null, coord: k === 'lat' || k === 'lng' ? null : s.err.coord }) })); }); }
  setM(p) { this.setState(s => ({ m: Object.assign({}, s.m, p, { dirty: true }) })); }
  btn(l, run, kind, dis) { const k = kind === 'p' ? { bg: '#B1001A', fg: '#FFFFFF', bd: '#B1001A' } : kind === 'd' ? { bg: '#FFFFFF', fg: '#A3001A', bd: '#A3001A' } : { bg: '#FFFFFF', fg: '#252B32', bd: '#D5D9DF' }; return Object.assign({ l, run, dis: !!dis }, k); }

  ics(w, c, a) {
    const D = window.GK.D, R = window.GK.R, dt = (d, t) => d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
    const txt = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Gunay Klima CRM//TR', 'BEGIN:VEVENT', 'UID:' + w.id + '@gunay-klima-crm', 'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''), 'DTSTART;TZID=Europe/Istanbul:' + dt(w.date, w.start), 'DTEND;TZID=Europe/Istanbul:' + dt(w.date, D.fromMin(D.toMin(w.start) + w.dur)), 'SUMMARY:' + R.T[w.type] + ' - ' + window.GKApi.icsText(c.name), 'LOCATION:' + window.GKApi.icsText(R.addrLine(a) + ' ' + a.mah + ' ' + a.ilce), 'DESCRIPTION:Tek seferlik dosya. CRM degisiklikleri otomatik aktarilmaz.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const u = URL.createObjectURL(new Blob([txt], { type: 'text/calendar' })), el = document.createElement('a');
    el.href = u; el.download = 'randevu-' + w.id + '.ics'; document.body.appendChild(el); el.click(); el.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
    this.toast('Takvim dosyası indirildi. Tek seferliktir; CRM’deki sonraki değişiklikler telefona otomatik geçmez.');
  }
  renderVals() {
    const s = this.state, act = this.act || (this.act = this.makeAct()), GK = window.GK;
    const view = s.view, W = s.MW || s.W || document.documentElement.clientWidth || 1280, H = s.H || document.documentElement.clientHeight || 800, availW = s.WW && s.view !== 'auto' ? s.WW : W - 32, availH = s.WH && s.view !== 'auto' ? s.WH : H - (s.BH || 44) - 32;
    let fw, fh, fs = 1;
    const embed = !!this.props.embed;
    if (embed) { fw = s.EW || 390; fh = s.EH || 844; } else if (view === 'auto') { fw = W; fh = H - 44; } else if (view === '390') { fw = 390; fh = Math.min(844, availH); } else { fw = Number(view); fs = Math.min(1, availW / fw); fh = Math.round(availH / fs); }
    const bp = fw <= 640 ? 'mobile' : fw <= 1180 ? 'tablet' : 'desktop', mobile = bp === 'mobile';
    const base = {
      workspaceLabel:window.GKApi.space==='demo'?'DEMO · BU CİHAZ':'GÜNAY KLİMA · CRM',
      workspaceNote:window.GKApi.space==='demo'?'Kayıtlar yalnız bu tarayıcıda · Ortak sunucu bağlantısı yok':'Kayıtlar güvenli veritabanında saklanır',
      switchLabel:window.GKApi.space==='demo'?'Demoyu sıfırla':'Deneme alanını aç',
      switchSpace:()=>{if(this.state.modal&&!confirm('Açık form kaydedilmeden çalışma alanı değiştirilsin mi?'))return;window.GKApi.switchSpace();},
      loadError:s.loadError,retryLoad:()=>this.loadState(),
      views: [['auto', 'Otomatik'], ['1440', '1440'], ['1024', '1024'], ['390', '390']].map(([k, l]) => ({ label: l, sel: view === k, bg: view === k ? '#FFFFFF' : 'transparent', fg: view === k ? '#252B32' : '#D5D9DF', pick: () => this.setState({ view: k }) })),
      fw, fh, fs, boxW: Math.round(fw * fs), boxH: Math.round(fh * fs),
      boxWs: embed ? fw + 'px' : view === 'auto' ? '100%' : Math.round(fw * fs) + 'px', boxHs: embed ? fh + 'px' : view === 'auto' ? 'auto' : view === '390' ? 'min(100%, 844px)' : '100%',
      fws: embed ? fw + 'px' : view === 'auto' ? '100%' : fw + 'px', fhs: embed ? fh + 'px' : view === 'auto' ? '100%' : 'calc(100% / ' + fs + ')', outerPad: embed || view === 'auto' ? '0' : '16px', frameRadius: embed ? '0' : view === '390' ? '28px' : view === 'auto' ? '0' : '10px', frameShadow: embed || view === 'auto' ? 'none' : '0 12px 40px rgba(0,0,0,.18)',
      rootRef: this.rootRef, wrapRef: this.wrapRef, notEmbed: !embed, rootMinH: '0', rootH: embed ? '100%' : 'var(--gk-viewport-height,100dvh)', wrapAlign: 'stretch',
      openScen: () => this.setState({ scen: true }), openHandoff: () => act.open('handoff', {}),
      ready: !!(s.db && GK) && !s.fakeLoad, notReady: !(s.db && GK) || s.fakeLoad
    };
    if (!s.db || !GK) return base;
    const db = s.db, preview = db.demoSuite?.people.find(x => x.id === sessionStorage.getItem('gk-demo-person')), technician = preview?.role === 'technician';
    const R = GK.R, F = GK.F, D = GK.D, m = s.m, err = s.err || {};
    if (window.GKApi.demo) window.GKDemoHost = {app: this, act};
    const contextCustomerId = m.customerId || db.workOrders.find(w=>w.id===m.woId)?.customerId;
    const go = (scr, p) => () => act.go(scr, p);
    const navItem = (id, count) => { const cur = s.screen === id; return { id, label: LABEL[id] || 'Daha', icon: IC[id], cur, fw: cur ? 600 : 500, bg: cur ? '#FBEFF1' : 'transparent', fg: cur ? '#B1001A' : '#252B32', go: go(id), count }; };
    const overdue = db.devices.filter(d => R.status(db, d).key === 'gecikti').length;
    const is = {}; Object.keys(LABEL).forEach(k => is[k] = s.screen === k);
    const fv = {}, fc = {}, on = {}, eb = {};
    KEYS.forEach(k => { fv[k] = m[k] == null ? '' : m[k]; fc[k] = !!m[k]; on[k] = this.fh(k); eb[k] = err[k] ? '#C8102E' : '#CDD2D9'; });
    eb.coord = err.coord ? '#C8102E' : '#CDD2D9';
    on.street = this.streetH || (this.streetH = e => { const v = e.target.value; this.fh('street')(e); this.geoQuery(v + ' ' + (this.state.m.no || ''), -1); });
    fv.il = fv.il || 'İzmir';
    on.no = this.noH || (this.noH = e => { this.fh('no')(e); if (this.state.modal === 'address') this.autoLocate(-1); });
    ['street', 'no', 'mah', 'ilce'].forEach(k => { eb[k] = err[k] ? '#C8102E' : '#CDD2D9'; });
    const gs = s.geo && s.geo.idx === -1 ? s.geo : null, gOpen = s.modal === 'address' && gs;
    const geo = { show: !!(gOpen && !gs.picked && (gs.loading || gs.err || gs.none || (gs.items && gs.items.length))), loading: !!(gs && gs.loading && !(gs.items || []).length), err: gs && gs.err, none: !!(gs && gs.none && !gs.loading), picked: gOpen && gs.picked,
      items: gOpen && !gs.picked ? (gs.items || []).map(x => ({ main: x.main, sub: x.sub, pick: () => { this.setM({ street: x.road || m.street, no: m.no || x.house || '', mah: x.mah || m.mah, ilce: x.ilce || m.ilce, lat: String(+x.lat.toFixed(6)), lng: String(+x.lng.toFixed(6)), verified: false, src: 'adres' }); this.setState({ geo: { idx: -1, picked: x.main + (x.sub ? ', ' + x.sub.split(',')[0] : '') } }); } })) : [] }; eb.note = err.note ? '#C8102E' : '#CDD2D9';
    const moreIds = window.GKApi.demo ? ['cagrilar','talepler','mail','satis','depo','raporlar','ayarlar'] : ['satis','depo','raporlar','ayarlar'];
    const mnav = ['bugun', 'musteriler', 'bakim', 'harita'].map(id => navItem(id)).concat([{ label: 'Daha', icon: IC.daha, cur: moreIds.indexOf(s.screen) >= 0, fw: moreIds.indexOf(s.screen) >= 0 ? 600 : 500, fg: moreIds.indexOf(s.screen) >= 0 ? '#B1001A' : '#4B525B', go: () => this.setState({ more: !s.more }) }]);
    mnav.forEach(n => { if (n.id) n.fg = n.cur ? '#B1001A' : '#4B525B'; });
    const fabMap = { bugun: ['Bakım planla', () => act.open('appt', { type: 'bakim', date: db.today, dur: '60' })], bakim: ['Bakım planla', () => act.open('appt', { type: 'bakim', date: db.today, dur: '60' })], musteriler: ['Yeni müşteri', () => act.open('customer', { type: 'Kişi', contact: 'bilinmiyor' })], satis: ['Yeni satış', go('satis', { newSale: true })], depo: ['Stok hareketi', go('depo', { move: true })] };
    const fab = !technician && fabMap[s.screen] && !s.params.customerId && !s.params.saleId ? { show: true, label: fabMap[s.screen][0], run: fabMap[s.screen][1] } : { show: false };

    // arama
    let sr = { none: false };
    const res = s.q ? R.search(db, s.q) : null;
    if (res) {
      sr = {
        customers: res.customers.map(c => { const a = R.addrsOf(db, c.id)[0]; return { title: c.name, sub: F.phone(c.phone) + (a ? ' · ' + a.mah + ', ' + a.ilce : '') + ' · ' + R.lifecycle(db, c).label + (c.flag ? ' · Olumsuz deneyim' : ''), go: go('musteriler', { customerId: c.id }), ...(() => { const ds = R.devicesOf(db, c.id), ad = R.addrsOf(db, c.id)[0], k = R.lastCall(db, c.id), w = R.worst(db, ds); return { info: (ad ? ad.label + ' · ' + ad.mah + ', ' + ad.ilce : 'Adres yok') + ' · ' + (ds.length ? ds.length + ' klima' + (ds.length === 1 ? ' (' + R.model(db, ds[0]).title + ')' : '') + ' · ' + w.label : 'Klima kaydı yok'), last: k ? 'Son temas ' + F.date(k.date) + ' · ' + R.CALLR[k.result] + (k.topic ? ' · ' + k.topic : '') : 'Görüşme kaydı yok' }; })(), call: () => { this.setState({ sOpen: false, q: '' }); act.open('call', { customerId: c.id }); } }; }),
        devices: res.devices.map(d => { const c = R.byId(db.customers, d.customerId), md = R.model(db, d); return { title: md.title + ' · ' + d.room, sub: 'SN ' + (d.serialIn || 'Belirtilmedi') + ' · ' + (c ? c.name : ''), go: go('musteriler', { customerId: d.customerId, tab: 'klimalar', deviceId: d.id }) }; }),
        sales: res.sales.map(x => { const c = R.byId(db.customers, x.customerId); return { title: x.no + ' · ' + (c ? c.name : ''), sub: R.saleState(x).label + ' · ' + F.money(R.saleTotals(db, x).total), go: go('satis', { saleId: x.id }) }; })
      };
      sr.hasC = sr.customers.length > 0; sr.hasD = sr.devices.length > 0; sr.hasS = sr.sales.length > 0; sr.none = !sr.hasC && !sr.hasD && !sr.hasS;
    } else if (s.sOpen) {
      const ids = Array.from(new Set(db.workOrders.filter(w => w.date === db.today && w.status !== 'iptal').map(w => w.customerId).concat(db.calls.slice().sort((a, b) => b.date.localeCompare(a.date)).map(k => k.customerId)))).slice(0, 6);
      sr = { hasSug: true, sug: ids.map(id => { const c = R.byId(db.customers, id), w = db.workOrders.find(x => x.customerId === id && x.date === db.today && x.status !== 'iptal'), k = R.lastCall(db, id); return { title: c.name + (c.flag ? ' · Olumsuz deneyim' : ''), sub: w ? 'Bugün ' + w.start + ' · ' + R.T[w.type] : k ? 'Son görüşme ' + F.date(k.date) + ' · ' + R.CALLR[k.result] : R.lifecycle(db, c).label, go: go('musteriler', { customerId: id }), ...(() => { const ds = R.devicesOf(db, id), ad = R.addrsOf(db, id)[0], k = R.lastCall(db, id), w = R.worst(db, ds); return { info: (ad ? ad.label + ' · ' + ad.mah + ', ' + ad.ilce : 'Adres yok') + ' · ' + (ds.length ? ds.length + ' klima' + (ds.length === 1 ? ' (' + R.model(db, ds[0]).title + ')' : '') + ' · ' + w.label : 'Klima kaydı yok'), last: k ? 'Son temas ' + F.date(k.date) + ' · ' + R.CALLR[k.result] + (k.topic ? ' · ' + k.topic : '') : 'Görüşme kaydı yok' }; })(), call: () => { this.setState({ sOpen: false, q: '' }); act.open('call', { customerId: id }); } }; }) };
    }
    const flat = []; ['sug', 'customers', 'devices', 'sales'].forEach(k => (sr[k] || []).forEach(r => flat.push(r)));
    const sIdx = Math.max(0, Math.min(s.sIdx || 0, flat.length - 1));
    flat.forEach((r, i) => { r.bg = i === sIdx ? '#F5F6F8' : 'transparent'; });
    const scenarios = [
      ['A', 'Üç klimalı ev, tek cihaza bakım', 'Selin Arıkan: 8 Ekim iş emrinde yalnız salon klimasına bakım yapıldı; diğer ikisinin önceki tarihleri korundu.', go('musteriler', { customerId: 'c1', tab: 'klimalar' })],
      ['B', 'İki adresli müşteri', 'Hakan Er: ev ve iş yeri ayrı adresler, cihazlar adrese göre ayrılır, haritada iki ayrı pin.', go('musteriler', { customerId: 'c2', tab: 'adresler' })],
      ['C', 'Günay’dan alınmamış cihaza bakım', 'Fatma Şen: başka firmadan alınmış cihaz, seri no belirtilmedi, 2 Ekim bakım kaydı.', go('musteriler', { customerId: 'c9', tab: 'klimalar', deviceId: 'd14' })],
      ['D', 'İki cihazlı satış, tek montaj', 'Nur Pastanesi S-2026-011: 1 cihaz takıldı, 1 cihaz rezerve ve montaj bekliyor.', go('satis', { saleId: 's2' })],
      ['E', 'Yakın dört müşteri, kampanya', 'Kazımdirik: grubu incele, aranacakları seç, planı kaydet, görüşme sonucunu gir, kabul edene randevu aç.', go('harita', { group: true })],
      ['F', 'Konumu bilinmeyen müşteri', 'Deniz Aksoy: haritada otomatik pin yok, “Konumu tamamla” aksiyonu var.', go('musteriler', { customerId: 'c8', tab: 'adresler' })],
      ['G', 'Bakım aralığı bilinmeyen cihaz', 'Mavi Ofis Mimarlık: otomatik tarih yerine “Bakım planı eksik”.', go('musteriler', { customerId: 'c10', tab: 'klimalar', deviceId: 'd15' })],
      ['H', 'Yeni model + fotoğraf + ayrı stok girişi', 'Ayarlar › Klima kataloğu: model ekle, fotoğraf yükle, sonra stok girişi ekle.', go('ayarlar', { section: 'katalog', newModel: true })],
      ['I', 'Yetersiz stokla onaylanamayan satış', 'Ahmet Yurt S-2026-015: 3 adet MSZ-AP50VGK isteniyor, satılabilir 1.', go('satis', { saleId: 's4' })],
      ['J', 'Çakışan teknisyen randevusu', 'Emre Yalçın 15:30’da Mavi Ofis’te; aynı saate yeni randevu ve önerilen alternatif saatler.', () => { this.setState({ scen: false, screen: 'bakim', params: { t: Date.now(), view: 'randevu' } }); act.open('appt', { customerId: 'c1', addressId: 'a1', deviceIds: ['d2', 'd3'], type: 'bakim', date: db.today, start: '15:30', dur: '60', techId: 't1', note: 'Kalan iki oda (yatak, çocuk)' }); }]
      ,['H1', 'Liste → pin → dosya → geri', 'Harita listesinden müşteri seç: pin ve kart açılır. Müşteri dosyasına gidip Harita’ya dönünce konum, filtre ve seçim korunur.', go('harita', { addressId: 'a1' })],
      ['H2', 'Dört duraklı grup, sıra değiştirme', 'Kazımdirik grubunda 4 uygun adres var; iletişim izni bilinen 3’ü otomatik seçilir. İzni bilinmeyen Gülay Tunç’u teyit edip işaretleyin, “Ziyaret planına al” deyin: 4 durak (Selin Arıkan’ın evi 3 cihazla tek durak). ↑/↓ ile sıra değiştirin; liste ve pin numaraları birlikte değişir.', go('harita', { group: true })],
      ['H3', 'Kabul etti → kart güncellenir', 'Bir durakta “Görüşme gir” › Kabul etti. Kart ve günlük plan güncellenir, harita sıfırlanmaz; randevu saati ayrıca seçilir.', go('harita', { group: true })],
      ['H4', 'Konumsuz müşteri ekle', 'Yeni müşteri ve konumsuz adres ekle; Harita › Konumu eksik listesinde görünür, dükkânın üstünde sahte pin oluşmaz.', () => act.open('customer', { type: 'Kişi', contact: 'bilinmiyor' })],
      ['H5', 'Elle yol/hazırlık boşluğu', 'Randevu formunda boşluk seç; “müsait” saati değişir. Serkan’ın 10:00–11:00 işinden sonra 20 dk boşluk: sonraki uygun 11:20.', () => { this.setState({ scen: false, screen: 'bakim', params: { t: Date.now(), view: 'randevu' } }); act.open('appt', { customerId: 'c4', addressId: 'a5', deviceIds: ['d8'], type: 'bakim', date: db.today, start: '11:00', dur: '30', techId: 't2', buffer: '20' }); }],
      ['H6', '390 px telefonda harita', 'Görünümü 390 yap; Harita/Liste geçişi, alt çekmece ve modal açıkken Kapat/Geri erişilebilir.', () => this.setState({ view: '390', scen: false, screen: 'harita', params: { t: Date.now(), addressId: 'a1' } })]
    ].map(([k, t, d, g]) => ({ k, t, d, go: g }));

    const out = Object.assign(base, {
      adrRatio: mobile ? '4 / 5' : '16 / 9', todayIso: db.today, mainRef: this.mainRef, db, act, bp, mobile, notMobile: !mobile, params: s.params, saving: s.saving, is,
      logoOk: !s.logoFail, logoFail: !!s.logoFail, logoErr: () => this.setState({ logoFail: true }),
      safeTop: this.props.embed ? (this.props.safeTop || 0) : 0, safeBottom: this.props.embed ? (this.props.safeBottom || 0) : 0, navH: 68 + (this.props.embed ? (this.props.safeBottom || 0) : 0), fabBottom: 84 + (this.props.embed ? (this.props.safeBottom || 0) : 0), mFootPad: 12 + (this.props.embed && mobile ? (this.props.safeBottom || 0) : 0),
      sideW: bp === 'tablet' ? 208 : 236, logoW: mobile ? 'auto' : ((bp === 'tablet' ? 208 : 236) - 24 - 12) + 'px', logoChipH: mobile ? 40 : 46, logoImgH: mobile ? 26 : 32, topH: mobile ? 60 : 68, padX: mobile ? 12 : 24, mainPad: mobile ? '16px 12px 96px' : bp === 'tablet' ? '20px 20px 40px' : '24px 32px 48px',
      nav: [navItem('bugun'), navItem('musteriler'), navItem('satis'), navItem('bakim', overdue), navItem('harita'), navItem('depo')].concat(window.GKApi.demo ? [navItem('cagrilar', db.demoSuite?.calls.filter(c=>c.status==='cevapsiz'&&!c.returned).length),navItem('talepler'),navItem('mail')] : []).filter(n=>!technician || ['bugun','bakim'].includes(n.id)),
      nav2: technician ? [] : [navItem('raporlar'), navItem('ayarlar')], mnav: technician ? ['bugun','bakim'].map(id=>navItem(id)) : mnav, more: s.more, closeMore: () => this.setState({ more: false }),
      isTechnician: technician, normalToday: !technician && is.bugun, normalBakim: !technician && is.bakim,
      demoHasCustomer: !!contextCustomerId && !!window.GKApi.demo, demoCall: ()=>window.GKDemoUI?.startCall(contextCustomerId), demoSMS: ()=>window.GKDemoUI?.sms(contextCustomerId, m.woId || m.id),
      moreItems: moreIds.map(id => ({ label: LABEL[id], icon: IC[id], go: go(id) })), fab,
      q: technician ? '' : s.q, onQ: e => !technician && this.setState({ q: e.target.value, sOpen: true, sIdx: 0 }), onQFocus: () => !technician && this.setState({ sOpen: true }),
      onQKey: e => { if (e.key === 'ArrowDown' && flat.length) { e.preventDefault(); this.setState({ sIdx: (sIdx + 1) % flat.length, sOpen: true }); } else if (e.key === 'ArrowUp' && flat.length) { e.preventDefault(); this.setState({ sIdx: (sIdx - 1 + flat.length) % flat.length }); } else if (e.key === 'Enter' && flat[sIdx]) { e.preventDefault(); flat[sIdx].go(); e.target.blur(); } }, closeSearch: () => s.sOpen && this.setState({ sOpen: false }),
      sOpen: !technician && s.sOpen && (!!res || !!sr.hasSug), sr, srMin: mobile ? '0' : '420px', searchPh: mobile ? 'Ara' : 'Müşteri, telefon, seri no, model veya mahalle ara',
      offline: s.offline, toast: s.toast, toastDot: s.toast && s.toast.tone === 'err' ? '#FF6B7D' : '#5CD18E', toastBottom: mobile ? 84 + (this.props.embed ? (this.props.safeBottom || 0) : 0) : 24,
      scen: s.scen, closeScen: () => this.setState({ scen: false }), scenW: mobile ? '100%' : '440px', scenarios,
      toggleOffline: () => this.setState({ offline: !s.offline }), showLoading: () => { this.setState({ scen: false, fakeLoad: true }); setTimeout(() => this.setState({ fakeLoad: false }), 1400); },
      anyModal: !!s.modal, panelRef: this.panelRef, tryClose: this.tryClose, closeNow: this.closeNow, keepEditing: () => this.setState({ askClose: false }), askClose: s.askClose,
      ilceList: ['Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ', 'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir', 'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa', 'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere', 'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'],
      mahList: Array.from(new Set(['Altındağ', 'Atatürk', 'Barbaros', 'Birlik', 'Çamdibi', 'Doğanlar', 'Egemenlik', 'Erzene', 'Evka 3', 'Evka 4', 'Gürpınar', 'Işıklar', 'Kazımdirik', 'Kızılay', 'Koşukavak', 'Mevlana', 'Naldöken', 'Özkanlar', 'Rafetpaşa', 'Yeşilova', 'Yıldırım Beyazıt', 'Zafer', 'Mansuroğlu', 'Manavkuyu', 'Bostanlı'].concat(db.addresses.map(a => a.mah).filter(Boolean)))).sort((a, b) => a.localeCompare(b, 'tr')),
      geo, formError: s.formError, err, fv, fc, on, eb, saveLabel: s.saving ? 'Kaydediliyor…' : 'Kaydet', saveOp: s.saving ? 0.6 : 1,
      mAlign: mobile ? 'flex-end' : 'center', mPad: mobile ? '0' : '24px', mMax: s.modal === 'wo' || s.modal === 'appt' || s.modal === 'address' ? '720px' : '600px', mMaxH: mobile ? 'calc(100% - ' + (12 + (this.props.embed ? (this.props.safeTop || 0) : 0)) + 'px)' : '90%', mRadius: mobile ? '16px 16px 0 0' : '16px', mAnim: mobile ? 'gkSheet .3s cubic-bezier(.2,.8,.2,1)' : 'gkPop .24s cubic-bezier(.2,.8,.2,1)',
      mo: { customer: s.modal === 'customer', address: s.modal === 'address', appt: s.modal === 'appt', wo: s.modal === 'wo', call: s.modal === 'call', install: s.modal === 'install', handoff: s.modal === 'handoff' },
      result: s.result, modalTitle: ''
    });

    if (s.modal === 'handoff') out.modalTitle = 'Devir notu (özet)';

    if (s.modal === 'customer') {
      const dup = m.phone && !m.phoneUnknown && db.customers.find(c => c.id !== m.id && c.phone && c.phone.replace(/\D/g, '') === m.phone.replace(/\D/g, '') && m.phone.replace(/\D/g, '').length >= 7);
      out.modalTitle = m.id ? 'Müşteriyi düzenle' : m.doneId ? 'Müşteri kaydedildi' : 'Yeni müşteri';
      out.cu = {
        products: db.products.map(p=>({id:p.id,label:R.pTitle(p)})), form: !m.doneId, done: !!m.doneId, isFirm: m.type === 'Firma', nameLabel: m.type === 'Firma' ? 'Firma adı' : 'Ad soyad', phoneBg: m.phoneUnknown ? '#F0F1F3' : '#FFFFFF',
        types: ['Kişi', 'Firma'].map(t => Object.assign({ l: t, sel: m.type === t, pick: () => this.setM({ type: t }) }, opt(m.type === t))),
        contacts: [['bilinmiyor', 'Bilinmiyor'], ['izinli', 'İzinli'], ['istemiyor', 'İletişim istemiyor']].map(([k, l]) => Object.assign({ l, sel: m.contact === k, pick: () => this.setM({ contact: k }) }, opt(m.contact === k))),
        phoneModes: [[false, 'Türkiye'], [true, 'Yurt dışı']].map(([k, l]) => Object.assign({ l, sel: !!m.phoneIntl === k, pick: () => !!m.phoneIntl !== k && this.setM({ phoneIntl: k, phone: k ? '+' : '0' }) }, opt(!!m.phoneIntl === k))),
        phonePh: m.phoneIntl ? '+49 151 2345 6789' : '0 5XX XXX XX XX',
        phoneFocus: () => { if (!m.phone) this.setState(st => ({ m: Object.assign({}, st.m, { phone: st.m.phoneIntl ? '+' : '0' }) })); },
        ...(() => { const P = window.GK.P, has = window.GK.P.digits(m.phone).length > (m.phoneIntl ? 0 : 1), st = P.status(m.phone, m.phoneIntl); return { phSt: m.phoneUnknown ? 'Belirtilmedi olarak kaydedilecek' : has ? st.text : (m.phoneIntl ? 'Ülke koduyla girin' : '0 ile başlar · 11 hane'), phStFg: m.phoneUnknown ? '#747B85' : st.ok ? '#1B6B3F' : st.bad ? '#A3001A' : '#4B525B', phHint: m.phoneIntl ? '8–15 rakam, ülke kodu dahil' : 'Cep 0 5XX… · sabit hat 0 232… · 0850', phoneBd: err.phone ? '#C8102E' : (has && st.ok ? '#2E9E5E' : '#CDD2D9'), phInvalid: !!err.phone }; })(),
        dup: !!dup, dupName: dup ? dup.name : '', openDup: dup ? go('musteriler', { customerId: dup.id }) : null,
        doneText: m.doneId ? (m.name + (m.addrDoneId ? ', ' + ((m.addrs || []).length > 1 ? (m.addrs || []).length + ' adres' : ((m.addrs || [])[0] || {}).label + ' adresi') + (m.devDone ? ' ve ' + m.devDone + ' klima' : '') + ' kaydedildi.' : ' kaydedildi.')) : '',
        doneSub: m.addrDoneId ? 'Konum henüz işaretlenmedi. Haritadan pin seçip doğrulayabilir ya da daha sonra yapabilirsiniz.' : 'Adres ve klimaları şimdi ya da daha sonra ekleyebilirsiniz.',
        nextL: m.addrDoneId ? 'Konumu haritada işaretle' : 'Adres ekle',
        next: () => { if (m.addrDoneId) { const a = R.byId(db.addresses, m.addrDoneId); act.open('address', Object.assign({}, a, { lat: a.lat == null ? '' : String(a.lat), lng: a.lng == null ? '' : String(a.lng), after: 'file' })); } else act.open('address', { customerId: m.doneId, label: 'Ev', after: 'file' }); },
        devSection: !m.id, devLocked: !m.withAddr, devOp: m.withAddr ? 1 : 0.5, devBg: m.withAddr ? '#FAFBFC' : '#FFFFFF', devCols: mobile ? 'repeat(2,minmax(0,1fr))' : (m.addrs || []).length > 1 ? 'minmax(0,1.5fr) minmax(0,.9fr) minmax(0,1fr) minmax(0,1fr) 42px' : 'minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr) 42px',
        devCountText: (m.devs || []).length ? (m.devs || []).length + ' cihaz eklenecek' : 'isteğe bağlı', addDevL: (m.devs || []).length ? '+ Bir klima daha ekle' : '+ Klima ekle',
        addrOpts: (m.addrs || []).map((a, i) => ({ id: String(i), name: (i + 1) + '. ' + (a.label || 'Adres') })),
        prodOpts: db.products.map(x => ({ id: x.id, name: R.pTitle(x) + (x.level === 'seri' ? ' (seri düzeyi)' : '') })),
        devRows: (m.devs || []).map((d, i) => { const setD = p => this.setState(st => ({ m: Object.assign({}, st.m, { dirty: true, devs: (st.m.devs || []).map((x, j) => j === i ? Object.assign({}, x, p) : x) }), err: Object.assign({}, st.err, { devs: null }) })); return { variant:d.variant||'',external:!d.productId,externalModel:d.externalModel||'',onExternal:e=>setD({externalModel:e.target.value}),vars:(R.byId(db.products,d.productId)||{}).variants||[],onVariant:e=>setD({variant:e.target.value}),multi: (m.addrs || []).length > 1, addrIdx: String(d.addrIdx || 0), onAddr: e => setD({ addrIdx: Number(e.target.value) }), productId: d.productId || '', room: d.room || '', serialIn: d.serialIn || '', onProduct: e => setD({ productId: e.target.value, variant:'', externalModel:'' }), onRoom: e => setD({ room: e.target.value.slice(0, 40) }), onSerial: e => setD({ serialIn: window.GK.P.serial(e.target.value) }), remove: () => this.setState(st => ({ m: Object.assign({}, st.m, { devs: (st.m.devs || []).filter((x, j) => j !== i) }) })) }; }),
        addDev: () => m.withAddr && this.setState(st => ({ m: Object.assign({}, st.m, { dirty: true, devs: (st.m.devs || []).concat([{ productId: '', room: (st.m.devs || []).length ? '' : 'Salon', serialIn: '' }]) }) })),
        addrOpen: !!m.withAddr && !m.id, addrClosed: !m.withAddr && !m.id,
        openAddr: () => this.setM({ withAddr: true, addrs: [{ label: 'Ev', ilce: '', il: '' }] }),
        canAdd2: !!m.withAddr && (m.addrs || []).length === 1, add2: () => this.setM({ addrs: (m.addrs || []).concat([{ label: 'İş yeri', ilce: '', il: '' }]) }),
        addrBlocks: (m.addrs || []).map((a, i) => {
          const setA = p => this.setState(st => ({ m: Object.assign({}, st.m, { dirty: true, addrs: (st.m.addrs || []).map((x, j) => j === i ? Object.assign({}, x, p) : x) }) }));
          const v = {}, onA = {}, e = {}, ebA = {};
          ['street', 'no', 'building', 'block', 'floor', 'door', 'mah', 'ilce', 'il', 'directions'].forEach(k => { v[k] = a[k] == null ? '' : a[k]; onA[k] = ev => { const raw = ev.target.value, val = SAN[k] ? SAN[k](raw) : raw; setA({ [k]: val }); this.setState(st => ({ err: Object.assign({}, st.err, { ['a' + i + '_' + k]: null }) })); if (k === 'street') this.geoQuery(raw + ' ' + (a.no || ''), i); if (k === 'no' || k === 'ilce' || k === 'mah') { setA({ lat: '', lng: '' }); this.autoLocate(i); } }; e[k] = err['a' + i + '_' + k]; ebA[k] = e[k] ? '#C8102E' : '#CDD2D9'; });
          const g2 = s.geo && s.geo.idx === i ? s.geo : null;
          return { locate: () => this.locate(i), title: i === 0 ? 'Adres' : '2. adres', required: (m.addrs||[]).length===1, removeL: (m.addrs||[]).length===1?'Tam adres zorunlu':'Adresi kaldır', v, on: onA, e, eb: ebA, preview: R.composeLine(a),
            labels: ['Ev', 'İş yeri', 'Yazlık', 'Ofis', 'Diğer'].map(l => Object.assign({ l, sel: (a.label || 'Ev') === l, pick: () => setA({ label: l }) }, opt((a.label || 'Ev') === l))),
            remove: () => { if((m.devs||[]).some(d=>(d.addrIdx||0)===i)){this.toast('Bu adrese bağlı klima satırlarını önce başka adrese taşıyın veya kaldırın.','err');return;}const rest=(m.addrs||[]).filter((x,j)=>j!==i);this.setState(st=>({geo:null,m:Object.assign({},st.m,{dirty:true,addrs:rest,withAddr:rest.length>0,devs:(st.m.devs||[]).map(d=>Object.assign({},d,{addrIdx:(d.addrIdx||0)>i?d.addrIdx-1:(d.addrIdx||0)}))})})); },
            geo: { show: !!(g2 && !g2.picked && (g2.loading || g2.err || g2.none || (g2.items || []).length)), loading: !!(g2 && g2.loading && !(g2.items || []).length), err: g2 && g2.err, none: !!(g2 && g2.none && !g2.loading), picked: g2 && g2.picked,
              items: g2 && !g2.picked ? (g2.items || []).map(x => ({ main: x.main, sub: x.sub, pick: () => { setA({ street: x.road || a.street, no: a.no || x.house || '', mah: x.mah || a.mah, ilce: x.ilce || a.ilce, lat: String(+x.lat.toFixed(6)), lng: String(+x.lng.toFixed(6)), src: 'adres' }); this.setState({ geo: { idx: i, picked: x.main + (x.sub ? ', ' + x.sub.split(',')[0] : '') } }); } })) : [] } };
        }),
        closeAddr: () => this.setState(st => ({ geo: null, m: Object.assign({}, st.m, { withAddr: false, addrs: [], devs: [] }) })),
        labels: ['Ev', 'İş yeri', 'Yazlık', 'Ofis', 'Diğer'].map(l => Object.assign({ l, sel: (m.label || 'Ev') === l, pick: () => this.setM({ label: l }) }, opt((m.label || 'Ev') === l))),
        ...(() => {
          const list = R.dupes(db, Object.assign({}, m, { line: m.addrs && m.addrs[0] ? R.composeLine(m.addrs[0]) : '' })), strong = list.some(x => x.score >= 3);
          const RB = { gecikti: ['#FDECEE', '#A3001A'], yaklasan: ['#FFF1D1', '#7A4A00'] };
          return { hasMatch: list.length > 0, needConfirm: strong, mTitle: strong ? 'Bu müşteri zaten kayıtlı olabilir' : 'Benzer kayıt bulundu, kontrol edin', mBg: strong ? '#FDECEE' : '#FFF8E6', mFg: strong ? '#A3001A' : '#7A4A00', mBd: strong ? '#F3C2C9' : '#F0D38C',
            matches: list.map(x => { const c = x.c, a = R.addrsOf(db, c.id)[0] || db.addresses.find(y => y.customerId === c.id), k = R.lastCall(db, c.id), n = R.devicesOf(db, c.id).length, ini = c.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toLocaleUpperCase('tr');
              return { ini, name: c.name + (c.active === false ? ' (pasif)' : ''), phone: F.phone(c.phone), addr: a ? a.label + ' · ' + a.mah + ', ' + a.ilce : 'Adres yok', meta: R.lifecycle(db, c).label + ' · ' + n + ' cihaz' + (k ? ' · son görüşme ' + F.date(k.date) : '') + (c.flag ? ' · olumsuz deneyim işaretli' : ''),
                level: x.score >= 3 ? 'Büyük olasılıkla aynı' : x.score === 2 ? 'Olası eşleşme' : 'Benzer kayıt', lvFg: x.score >= 3 ? '#A3001A' : '#7A4A00',
                reasons: x.reasons.map(([l, t]) => ({ l, bg: RB[t][0], fg: RB[t][1] })), openL: c.active === false ? 'Pasif kaydı aç' : 'Mevcut müşteriyi aç', open: go('musteriler', { customerId: c.id }), canAdd: c.active !== false && !m.id, addAddr: () => act.open('address', { customerId: c.id, label: m.label || 'Ev', line: m.line || '', mah: m.mah || '', ilce: m.ilce || '', after: 'file' }) }; }) };
        })(),
        save: () => { const strong = R.dupes(db, Object.assign({}, m, { line: m.addrs && m.addrs[0] ? R.composeLine(m.addrs[0]) : '' })).some(x => x.score >= 3); if (strong && !m.dupOk && !m.id) { this.setState({ formError: 'Aynı telefon veya aynı ad ve adresle kayıtlı müşteri var. Mevcut kaydı açın ya da farklı müşteri olduğunu onaylayın.' }); return; } this.submit('saveCustomerFull', m, r => { if (m.id) { this.toast('Müşteri bilgileri güncellendi.'); this.closeNow(); } else { window.GKDemoUI?.customerSaved(r.id); this.setState(st => ({ m: Object.assign({}, st.m, { doneId: r.id, addrDoneId: r.addressId || null, devDone: r.devCount || 0 }) })); } }); },
        addAddr: () => act.open('address', { customerId: m.doneId, label: 'Ev', after: 'file' }),
        openFile: go('musteriler', { customerId: m.doneId })
      };
    }
    if (s.modal === 'address') {
      const c = R.byId(db.customers, m.customerId), lat = parseFloat(String(m.lat).replace(',', '.')), lng = parseFloat(String(m.lng).replace(',', '.')), has = !isNaN(lat) && !isNaN(lng);
      out.modalTitle = m.id ? 'Adresi düzenle' : 'Yeni adres';
      out.adr = {
        cname: c ? c.name : '', labels: ['Ev', 'İş yeri', 'Yazlık', 'Ofis', 'Diğer'].map(l => Object.assign({ l, sel: m.label === l, pick: () => this.setM({ label: l }) }, opt(m.label === l))),
        pins: has ? [{ id: 'x', lat, lng, color: m.verified ? '#2E9E5E' : '#D98A00', hollow: !m.verified, title: 'Seçilen konum' }] : [],
        center: has ? { lat, lng } : { lat: 38.4600, lng: 27.2160 }, zoom: has ? 16 : 13,
        loc: R.locState({ lat: has ? lat : null, verified: !!m.verified }),
        focus: has ? { key: 'p' + lat + ',' + lng, lat, lng, zoom: 18 } : null, preview: R.composeLine(m), locate: () => this.locate(-1),
        onPick: (la, ln) => { this.setM({ lat: String(la), lng: String(ln), verified: false, src: 'harita' }); this.setState({ geo: null }); },
        save: () => this.submit('saveAddress', m, r => { this.toast(m.verified ? 'Adres kaydedildi; konum doğrulandı.' : 'Adres kaydedildi. Konum doğrulanmadı.'); this.closeNow(); if (m.after === 'file') act.go('musteriler', { customerId: m.customerId, tab: 'adresler' }); })
      };
    }
    if (s.modal === 'appt') {
      const c = m.customerId && R.byId(db.customers, m.customerId), devs = m.addressId ? R.devicesAt(db, m.addressId) : [], conf = R.conflicts(db, m), sel = m.deviceIds || [];
      out.modalTitle = m.id ? 'Randevuyu değiştir / ertele' : 'Randevu planla';
      const slots = conf.length ? R.freeSlots(db, m) : [];
      out.ap = {
        customers: db.customers.filter(x => x.active !== false && x.contact !== 'x').map(x => ({ id: x.id, name: x.name })),
        addrs: c ? R.addrsOf(db, c.id).map(a => ({ id: a.id, name: a.label + ' — ' + R.addrLine(a) })) : [],
        noAddr: !m.addressId, noDevs: !!m.addressId && !devs.length,
        devs: devs.map(d => { const on_ = sel.indexOf(d.id) >= 0; return { room: d.room, title: R.model(db, d).title, st: R.status(db, d), checked: on_, bd: on_ ? '#B1001A' : '#E7E9ED', bg: on_ ? '#FFFAFA' : '#FFFFFF', toggle: () => this.setM({ deviceIds: on_ ? sel.filter(x => x !== d.id) : sel.concat([d.id]) }) }; }),
        types: [['bakim', 'Bakım'], ['ariza', 'Arıza'], ['kontrol', 'Kontrol']].map(([k, l]) => Object.assign({ l, sel: m.type === k, pick: () => this.setM({ type: k }) }, opt(m.type === k))),
        techs: R.activeStaff(db), techName: R.staffName(db, m.techId),
        conflict: conf.length > 0, conflicts: conf.map(w => ({ text: w.start + '–' + D.fromMin(D.toMin(w.start) + w.dur) + ' · ' + R.byId(db.customers, w.customerId).name + ' (' + R.T[w.type] + ')' })),
        slots: slots.map(t => ({ t, pick: () => this.setM({ start: t, override: false }) })), noSlots: conf.length > 0 && !slots.length,
        isEdit: !!m.id, off: R.offHours(db, m),
        priceFx: m.price ? R.fxText(db, window.GK.P.num(m.price), m.date || db.today) : 'Örn. bakım için 1.200,00',
        priceKinds: [['kesin', 'Anlaşılan'], ['tahmini', 'Tahmini']].map(([k, l]) => { const sel = (m.priceKind || 'kesin') === k; return { l, sel, bg: sel ? '#FFFFFF' : 'transparent', fg: sel ? '#B1001A' : '#4B525B', sh: sel ? '0 1px 3px rgba(37,43,50,.12)' : 'none', pick: () => this.setM({ priceKind: k }) }; }),
        hasTime: !!m.start, noTime: !m.start, endText: m.start ? D.fromMin(D.toMin(m.start) + Number(m.dur || 60)) : '', freeText: m.start ? D.fromMin(D.toMin(m.start) + Number(m.dur || 60) + Number(m.buffer || 0)) : '',
        onCustomer: e => { const id = e.target.value, a = R.addrsOf(db, id)[0]; this.setM({ customerId: id, addressId: a ? a.id : '', deviceIds: a ? R.devicesAt(db, a.id).filter(d => R.isDue(db, d)).map(d => d.id) : [] }); },
        onAddress: e => { const id = e.target.value; this.setM({ addressId: id, deviceIds: R.devicesAt(db, id).filter(d => R.isDue(db, d)).map(d => d.id) }); },
        save: () => this.submit('saveWO', Object.assign({}, m, { type: m.type || 'bakim', dur: m.dur || 60 }), () => { this.toast((m.id ? 'Randevu güncellendi: ' : 'Randevu planlandı: ') + F.date(m.date) + ' ' + m.start + ' · ' + R.staffName(db, m.techId)); this.closeNow(); })
      };
    }
    if (s.modal === 'wo') {
      const w = R.byId(db.workOrders, m.woId);
      if (w) {
        const c = R.byId(db.customers, w.customerId), a = R.byId(db.addresses, w.addressId), devs = w.deviceIds.map(id => R.byId(db.devices, id)).filter(Boolean), hist = db.history.filter(h => h.woId === w.id);
        const mode = s.result ? 'view' : (m.mode || 'view'), items = m.items || {};
        const sale = w.saleId && R.byId(db.sales, w.saleId), line = sale && sale.lines.find(l => l.id === w.lineId);
        const setItem = (id, p) => this.setM({ items: Object.assign({}, items, { [id]: Object.assign({}, items[id], p) }) });
        out.modalTitle = 'İş emri · ' + R.T[w.type];
        const acts = [];
        if (mode === 'view' && !s.result) {
          if (w.status === 'planlandi') acts.push(this.btn('İptal et', () => this.setM({ mode: 'cancel' }), 'd'), this.btn('Ertele / değiştir', () => act.open('appt', Object.assign({}, w, { dur: String(w.dur), deviceIds: w.deviceIds.slice(), price: w.price != null ? window.GK.P.money(String(w.price).replace('.', ',')) : '' }))), this.btn('İşe başla', () => this.submit('startWO', w.id, () => this.toast('İş emri işlemde.')), 'p', s.saving));
          if (w.status === 'islemde') acts.push(this.btn('Ertele / değiştir', () => act.open('appt', Object.assign({}, w, { dur: String(w.dur), deviceIds: w.deviceIds.slice(), price: w.price != null ? window.GK.P.money(String(w.price).replace('.', ',')) : '' }))));
          if ((w.status === 'islemde' || w.status === 'planlandi') && w.type === 'montaj') acts.push(this.btn('Montaj kaydını aç', () => act.open('install', { saleId: w.saleId, lineId: w.lineId, woId: w.id, date: db.today, by: w.techId }), 'p'));
          else if (w.status === 'islemde') acts.push(this.btn('Tamamla', () => { const it = {}; devs.forEach(d => it[d.id] = { done: false, action: '' }); this.setM({ mode: 'complete', items: it, date: db.today, by: w.techId, fee: w.price != null ? window.GK.P.money(String(w.price).replace('.', ',')) : '', note: '' }); }, 'p'));
          if (w.status === 'planlandi' || w.status === 'islemde') acts.unshift(this.btn('Takvime ekle (.ics)', () => this.ics(w, c, a)));
          acts.unshift(this.btn('Haritada gör', go('harita', { addressId: w.addressId })));
          if (w.status === 'tamamlandi' || w.status === 'iptal') acts.push(this.btn('Kapat', this.closeNow));
        }
        if (mode === 'complete') acts.push(this.btn('Geri', () => this.setState(st => ({ m: Object.assign({}, st.m, { mode: 'view' }), err: {}, formError: null }))), this.btn(s.saving ? 'Kaydediliyor…' : 'İşlemi tamamla', () => this.submit('completeWO', { id: w.id, items: devs.map(d => Object.assign({ deviceId: d.id }, items[d.id])), date: m.date, by: m.by, fee: m.fee, feePaid: m.feePaid, feeMethod: m.feeMethod, note: m.note }, r => {
          const nd = r.notDone;
          const txt = w.type === 'bakim' ? r.doneCount + ' cihazın son bakım tarihi güncellendi.' + (nd.length ? ' ' + nd.length + ' cihaza işlem yapılmadı; önceki tarihleri korundu.' : '') : r.doneCount + ' cihaz için ' + R.T[w.type].toLowerCase() + ' kaydı eklendi. Bakım tarihleri değişmedi.';
          this.setState({ result: { text: txt, rest: nd.length ? () => act.open('appt', { customerId: w.customerId, addressId: w.addressId, deviceIds: nd, type: 'bakim', techId: w.techId, dur: '60' }) : null } });
        }), 'p', s.saving));
        if (mode === 'cancel') acts.push(this.btn('Vazgeç', () => this.setM({ mode: 'view' })), this.btn(s.saving ? 'Kaydediliyor…' : 'Randevuyu iptal et', () => this.submit('cancelWO', { id: w.id, note: m.cancelNote }, () => { this.toast('Randevu iptal edildi.'); this.closeNow(); }), 'd', s.saving));
        if (s.result) acts.push(this.btn('Kapat', this.closeNow));
        out.wo = {
          b: R.woBadge(w), typeLabel: R.T[w.type], when: F.date(w.date) + ' · ' + w.start + '–' + D.fromMin(D.toMin(w.start) + w.dur) + (w.buffer ? ' (+' + w.buffer + ' dk boşluk, kullanıcı tanımlı)' : ''), tech: R.staffName(db, w.techId),
          cName: c.name, phone: F.phone(c.phone), tel: F.tel(c.phone), openCustomer: go('musteriler', { customerId: c.id }),
          addrLabel: a.label.toLocaleUpperCase('tr'), addr: R.addrLine(a) + ', ' + a.mah + ' / ' + a.ilce, mapUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.lat != null && a.verified ? a.lat + ',' + a.lng : R.addrLine(a) + ' ' + a.mah + ' ' + a.ilce + ' İzmir'),
          isMontaj: w.type === 'montaj', saleNo: sale ? sale.no : '', lineText: line ? (R.pTitle(R.byId(db.products, line.productId)) + ' · ' + line.installed + '/' + line.qty + ' adet takıldı') : '',
          viewMode: mode === 'view', completeMode: mode === 'complete', cancelMode: mode === 'cancel', isAriza: w.type === 'ariza', devCount: devs.length,
          devs: devs.map(d => { const h = hist.find(x => x.deviceId === d.id); return { room: d.room, title: R.model(db, d).title, serial: d.serialIn || 'Belirtilmedi', st: R.status(db, d), showSt: !h, outcome: h ? (h.done ? R.badge('guncel', 'İşlem yapıldı' + (h.action ? ': ' + h.action : '')) : R.badge('muted', 'Yapılmadı' + (h.reason ? ' · ' + h.reason : ''))) : null }; }),
          priceText: w.price != null ? F.money(w.price) + (w.priceKind === 'tahmini' ? ' (tahmini)' : ' (anlaşılan)') + (w.status === 'tamamlandi' ? '' : ' · tamamlanınca ücret alanına gelir') : '',
          note: w.note, cancelNote: w.status === 'iptal' ? w.cancelNote : '', log: (w.log || []).map(l => ({ d: F.short(l.date), text: l.text })),
          hasFee: !!String(m.fee || '').trim(), paidNow: m.feePaid === 'evet', feeFx: String(m.fee || '').trim() ? R.fxText(db, Number(String(m.fee).replace(/\./g, '').replace(',', '.')), m.date || db.today) : '',
          fxInfo: w.status === 'tamamlandi' && w.fee != null ? 'Ücret ' + F.money(w.fee) + ' · ' + R.fxText(db, w.fee, w.completedAt, w.fx) + (w.feePaid ? ' · Tahsil edildi' + (w.feeMethod ? ' (' + w.feeMethod + ')' : '') : '') : '',
          unpaid: w.status === 'tamamlandi' && w.fee != null && !w.feePaid, feeText: w.fee != null ? F.money(w.fee) : '',
          collect: () => this.submit('collectFee', { id: w.id, method: m.feeMethod }, () => this.toast('Bakım ücreti tahsil edildi olarak kaydedildi.')),
          doneInfo: w.status === 'tamamlandi' ? 'Tamamlandı: ' + F.date(w.completedAt) + ' · ' + R.staffName(db, w.completedBy) + (w.fee != null ? ' · Ücret ' + F.money(w.fee) : ' · Ücret girilmedi') : '',
          items: devs.map(d => { const it = items[d.id] || {}; return { room: d.room, title: R.model(db, d).title, done: !!it.done, notDone: !it.done, action: it.action || '', reason: it.reason || '', bd: it.done ? '#2E9E5E' : '#E7E9ED', bg: it.done ? '#F4FBF7' : '#FFFFFF', toggle: () => setItem(d.id, { done: !it.done }), onAction: e => setItem(d.id, { action: e.target.value }), onReason: e => setItem(d.id, { reason: e.target.value }) }; }),
          staff: db.staff.map(x => ({ id: x.id, name: x.name + (x.active ? '' : ' (pasif)') })), actions: acts
        };
      }
    }
    if (s.modal === 'call') {
      const c = R.byId(db.customers, m.customerId);
      out.modalTitle = 'Görüşme kaydı';
      out.cl = {
        form: !m.callDone, done: !!m.callDone, accepted: m.result === 'kabul', name: c.name, phone: F.phone(c.phone), tel: F.tel(c.phone), ct: R.contact(c), noContact: c.contact === 'istemiyor',
        results: (() => { const RS = { ulasilamadi: ['muted', 'Açmadı, meşgul veya kapalı'], tekrar_ara: ['yaklasan', 'Başka zaman görüşülecek'], kabul: ['guncel', 'Hizmete / randevuya onay verdi'], istemiyor: ['gecikti', 'Hizmet istemiyor'], bilgi: ['info', 'Bilgi verildi veya alındı'] }; return Object.keys(R.CALLR).map(k => { const b = R.badge(RS[k][0], R.CALLR[k]), sel = m.result === k; return { l: R.CALLR[k], desc: RS[k][1], sel, dot: b.dot, fg: sel ? b.fg : '#252B32', bg: sel ? b.bg : '#FFFFFF', bd: sel ? b.dot : '#E7E9ED', bw: sel ? '2px' : '1px', sh: sel ? '0 6px 16px rgba(37,43,50,.08)' : 'none', pick: () => this.setM({ result: k, noContact: k === 'istemiyor', callback: k === 'tekrar_ara' ? (m.callback || D.addDays(db.today, 1)) : m.callback }) }; }); })(),
        ini: c.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toLocaleUpperCase('tr'), kind: c.phone ? window.GK.P.kind(c.phone) : '', life: R.lifecycle(db, c).label, flagShort: c.flag ? 'Olumsuz deneyim' : '',
        stats: (() => { const due = R.devicesOf(db, c.id).filter(d => R.isDue(db, d)).length, w = db.workOrders.filter(x => x.customerId === c.id && x.date >= db.today && (x.status === 'planlandi' || x.status === 'islemde')).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0], bal = db.sales.filter(x => x.customerId === c.id && x.status === 'onayli').reduce((n, x) => n + R.saleTotals(db, x).balance, 0); return [{ l: 'BAKIMI GELEN', v: due ? due + ' cihaz' : 'Yok', fg: due ? '#A3001A' : '#252B32', bg: due ? '#FDECEE' : '#F5F6F8' }, { l: 'RANDEVU', v: w ? F.short(w.date) + ' ' + w.start : 'Planlı yok', fg: '#252B32', bg: w ? '#E8F0FB' : '#F5F6F8' }, { l: 'AÇIK BAKİYE', v: bal > 0 ? F.money(bal) : 'Yok', fg: bal > 0 ? '#7A4A00' : '#252B32', bg: bal > 0 ? '#FFF1D1' : '#F5F6F8' }]; })(),
        recent: db.calls.filter(k => k.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3).map(k => ({ date: F.date(k.date), res: (k.dir === 'gelen' ? 'Gelen · ' : '') + R.CALLR[k.result], note: [R.callSummary(db, k), k.note].filter(Boolean).length ? ' — ' + [R.callSummary(db, k), k.note].filter(Boolean).join(' · ') : '', dot: R.badge({ ulasilamadi: 'muted', tekrar_ara: 'yaklasan', kabul: 'guncel', istemiyor: 'gecikti', bilgi: 'info' }[k.result]).dot })),
        hasRecent: db.calls.some(k => k.customerId === c.id),
        topics: ['Bakım', 'Arıza', 'Teklif / satış', 'Tahsilat', 'Şikâyet', 'Bilgi'].map(t => Object.assign({ l: t, sel: m.topic === t, pick: () => this.setM(m.topic === t ? { topic: '', det: {} } : Object.assign({ topic: t, det: {} }, t === 'Şikâyet' ? { flagIt: true, flagType: 'sikayet' } : {})) }, opt(m.topic === t))),
        ...(() => {
          const P = window.GK.P, det = m.det || {}, setDet = p => this.setState(st => ({ m: Object.assign({}, st.m, { dirty: true, det: Object.assign({}, st.m.det, p) }) }));
          const cS = (key, list) => list.map(l => Object.assign({ l, sel: det[key] === l, pick: () => setDet({ [key]: det[key] === l ? '' : l }) }, opt(det[key] === l)));
          const cM = (key, list) => list.map(l => { const arr = det[key] || [], on_ = arr.indexOf(l) >= 0; return Object.assign({ l, sel: on_, pick: () => setDet({ [key]: on_ ? arr.filter(x => x !== l) : arr.concat([l]) }) }, opt(on_)); });
          const devChips = R.devicesOf(db, c.id).map(d => { const arr = det.devs || [], on_ = arr.indexOf(d.id) >= 0; return Object.assign({ l: d.room + ' · ' + R.model(db, d).title, sel: on_, pick: () => setDet({ devs: on_ ? arr.filter(x => x !== d.id) : arr.concat([d.id]) }) }, opt(on_)); });
          const F_ = (o) => Object.assign({ span: 'auto', isInput: false, isSelect: false, isChips: false, help: '', type: 'text', im: 'text', min: '', ph: '', value: '' }, o);
          const money = (key, label, help) => F_({ label, isInput: true, im: 'decimal', value: det[key] || '', ph: 'Örn. 1.200,00', on: e => setDet({ [key]: P.money(e.target.value) }), help: det[key] ? R.fxText(db, P.num(det[key]), db.today) : help });
          const text = (key, label, ph, span) => F_({ label, isInput: true, value: det[key] || '', ph, span: span || 'auto', on: e => setDet({ [key]: e.target.value.slice(0, 160) }) });
          const chips = (label, opts, span, help) => F_({ label, isChips: true, opts, span: span || '1 / -1', help: help || '' });
          const due = R.devicesOf(db, c.id).filter(d => R.isDue(db, d)).length, bal = db.sales.filter(x => x.customerId === c.id && x.status === 'onayli').reduce((n, x) => n + R.saleTotals(db, x).balance, 0);
          const DEF = {
            'Bakım': ['BAKIM TALEBİ', [chips('Hangi cihazlar?', devChips, '1 / -1', devChips.length ? (due ? due + ' cihazın bakımı geldi.' : '') : 'Bu müşteride kayıtlı cihaz yok; cihazı müşteri dosyasından ekleyin.'), money('price', 'Söylenen fiyat (₺)', 'Müşteriye söylenen toplam tutar'), chips('Uygun zaman', cS('when', ['Hafta içi sabah', 'Hafta içi öğleden sonra', 'Akşam', 'Hafta sonu']), 'auto')]],
            'Arıza': ['ARIZA BİLDİRİMİ', [chips('Belirti', cM('belirti', ['Soğutmuyor', 'Isıtmıyor', 'Su damlatıyor', 'Ses yapıyor', 'Koku yapıyor', 'Hiç çalışmıyor', 'Hata kodu veriyor'])), chips('Hangi cihaz?', devChips), text('code', 'Hata kodu', 'Örn. E6'), chips('Aciliyet', cS('urgency', ['Normal', 'Acil (bugün)']), 'auto'), money('price', 'Söylenen servis ücreti (₺)', 'İsteğe bağlı')]],
            'Teklif / satış': ['TEKLİF TALEBİ', [F_({ label: 'İlgilendiği model', isSelect: true, value: det.model || '', opts: db.products.map(x => ({ id: x.id, name: R.pTitle(x) + (x.level === 'seri' ? ' (seri)' : '') })), on: e => setDet({ model: e.target.value }) }), F_({ label: 'Adet', isInput: true, im: 'numeric', value: det.qty || '', ph: '1', on: e => setDet({ qty: P.int(e.target.value, 3) }) }), money('price', 'Teklif edilen fiyat (₺)', 'Toplam tutar'), text('room', 'Oda / alan', 'Örn. salon 25 m²'), chips('Keşif için uygun zaman', cS('when', ['Hafta içi', 'Akşam', 'Hafta sonu']))]],
            'Tahsilat': ['TAHSİLAT', [money('promise', 'Söz verilen tutar (₺)', 'Açık bakiye: ' + F.money(bal)), F_({ label: 'Ödeme sözü tarihi', isInput: true, type: 'date', im: 'none', min: db.today, value: det.promiseDate || '', on: e => setDet({ promiseDate: e.target.value }) }), chips('Yöntem', cS('method', ['Nakit', 'Havale / EFT', 'Kredi kartı']))]],
            'Şikâyet': ['ŞİKÂYET', [chips('Konu', cM('konu', ['Montaj', 'Teknisyen davranışı', 'Gecikme', 'Ürün / cihaz', 'Fiyat', 'Temizlik', 'Diğer'])), chips('Önem', cS('severity', ['Düşük', 'Orta', 'Yüksek']), 'auto', 'Olumsuz deneyim işareti aşağıda otomatik açıldı; gerekirse kapatın.')]],
            'Bilgi': ['BİLGİ', [text('question', 'Sorulan / verilen bilgi', 'Örn. garanti süresi soruldu', '1 / -1')]]
          };
          const cur = DEF[m.topic];
          const reqs = m.reqs || [];
          const setReqs = n => this.setState(st => ({ m: Object.assign({}, st.m, { dirty: true, reqs: n }) }));
          return { hasCtx: !!cur, ctxTitle: cur ? cur[0] : '', ctxFields: cur ? cur[1] : [],
            reqs: reqs.map((v, i) => ({ v, on: e => setReqs(reqs.map((x, j) => j === i ? e.target.value.slice(0, 120) : x)), rm: () => setReqs(reqs.filter((x, j) => j !== i)) })),
            reqQuick: ['Yeni klima teklifi istiyor', 'Başka adrese de bakım', 'Taşıma / söküm', 'Fatura bilgisi istedi', 'Yedek parça / filtre'].filter(t => reqs.indexOf(t) < 0).map(t => ({ l: t, add: () => setReqs(reqs.concat([t])) })),
            addReq: () => setReqs(reqs.concat([''])) };
        })(),
        cbChips: [['Yarın', 1], ['3 gün sonra', 3], ['1 hafta sonra', 7], ['1 ay sonra', 30]].map(([l, n]) => { const d = D.addDays(db.today, n); return Object.assign({ l, sel: m.callback === d, pick: () => this.setM({ callback: d }) }, opt(m.callback === d)); }),
        cbText: m.callback ? F.date(m.callback) + ', ' + F.weekday(m.callback) + ' · Bugün ekranındaki “Tekrar aranacaklar” listesine düşer.' : '',
        tpls: ['Bakım hatırlatması yapıldı', 'Fiyat bilgisi verildi', 'Müsait değil, akşam aranacak', 'Telefon kapalı', 'Adres teyit edildi', 'Arıza bildirildi'].map(t => ({ l: t, add: () => this.setM({ note: ((m.note || '').trim() ? (m.note || '').trim().replace(/[.]?$/, '. ') : '') + t + '.' }) })),
        flagTypes: Object.keys(R.FLAGS).map(k => Object.assign({ l: R.FLAGS[k], sel: m.flagType === k, pick: () => this.setM({ flagType: k }) }, opt(m.flagType === k))),
        needCb: m.result === 'tekrar_ara', isNo: m.result === 'istemiyor',
        dirs: [['giden', 'Giden arama'], ['gelen', 'Gelen arama']].map(([k, l]) => { const s2 = (m.dir || 'giden') === k; return { l, sel: s2, sbg: s2 ? '#FFFFFF' : 'transparent', sfg: s2 ? '#B1001A' : '#4B525B', ssh: s2 ? '0 1px 3px rgba(37,43,50,.12)' : 'none', pick: () => this.setM({ dir: k }) }; }),
        flagBd: m.flagIt ? '#F3C2C9' : '#E7E9ED', flagBg: m.flagIt ? '#FFF8F8' : '#FFFFFF', flagged: c.flag ? R.FLAGS[c.flag.type] + ' · ' + c.flag.note : '',
        save: () => this.submit('addCall', m, () => { this.setM({ callDone: true }); if (m.onSaved) m.onSaved(m.result); if (m.result !== 'kabul') { this.toast('Görüşme kaydedildi: ' + R.CALLR[m.result]); this.closeNow(); } }),
        plan: () => { const det = m.det || {}, a = m.addressId || (det.devs && det.devs.length ? (R.byId(db.devices, det.devs[0]) || {}).addressId : null) || (R.addrsOf(db, c.id)[0] || {}).id; act.open('appt', { customerId: c.id, addressId: a, deviceIds: det.devs && det.devs.length ? det.devs.filter(id => (R.byId(db.devices, id) || {}).addressId === a) : a ? R.devicesAt(db, a).filter(d => R.isDue(db, d)).map(d => d.id) : [], type: m.topic === 'Arıza' ? 'ariza' : 'bakim', date: m.day || '', dur: '60', campaignId: m.campaignId, price: det.price || '', note: [R.callSummary(db, { topic: m.topic, det, requests: (m.reqs || []).filter(Boolean) })].filter(Boolean).join('') }); }
      };
    }
    if (s.modal === 'install') {
      const sale = R.byId(db.sales, m.saleId);
      if (sale) {
        const c = R.byId(db.customers, sale.customerId), lines = sale.lines.filter(l => l.installed < l.qty || l.id === m.lineId), l = sale.lines.find(x => x.id === m.lineId) || lines[0];
        if (!m.lineId && l) setTimeout(() => this.setState(st => ({ m: Object.assign({}, st.m, { lineId: l.id }) })), 0);
        out.modalTitle = 'Montaj kaydı';
        out.ins = {
          saleNo: sale.no, cName: c.name, lineText: l ? R.pTitle(R.byId(db.products, l.productId)) + ' · ' + l.installed + ' / ' + l.qty + ' adet takıldı' : '',
          lines: lines.map(x => ({ id: x.id, name: R.pTitle(R.byId(db.products, x.productId)) + ' — bekleyen ' + (x.qty - x.installed) + ' adet' })),
          staff: R.activeStaff(db), depot: l ? R.byId(db.depots, l.depotId).name : '',
          save: () => this.submit('install', m, () => { this.toast('Montaj kaydedildi; cihaz kartı oluşturuldu.'); this.closeNow(); })
        };
      }
    }
    return out;
  }
}

return Component;};
