// ureten: codex. Disabled unless authenticated server bootstrap explicitly enables it.
(() => {
  'use strict';
  const config = window.GunayIntegrationConfig;
  if (config?.enabled !== true) return;
  const root = document.createElement('aside'); root.id = 'gk-integrations'; root.setAttribute('aria-label', 'İletişim ve talepler');
  const style = document.createElement('style');
  style.textContent = '#gk-integrations{position:fixed;right:16px;bottom:18px;z-index:10000;max-width:calc(100vw - 32px);font:14px system-ui;color:#252b32}#gk-integrations button{font:inherit;cursor:pointer;border:1px solid #cbd0d5;border-radius:8px;padding:9px 12px;background:white;color:#252b32}#gk-integrations .gki-open{background:#b1001a;color:white;border:0}#gk-integrations section{width:380px;max-width:calc(100vw - 32px);max-height:65vh;overflow:auto;background:white;border:1px solid #ddd;border-radius:14px;padding:16px;box-sizing:border-box;box-shadow:0 8px 40px #0002;margin-bottom:8px}#gk-integrations article{padding:12px 0;border-bottom:1px solid #eee}#gk-integrations h3{font-size:15px;margin:6px 0}#gk-integrations p{margin:6px 0;line-height:1.45;overflow-wrap:anywhere;white-space:pre-line}#gk-integrations .gki-fault{border-left:4px solid #b1001a;padding-left:10px}#gk-integrations small{color:#626973}';
  document.head.append(style);
  const box = document.createElement('section'); box.hidden = true;
  const toggle = document.createElement('button'); toggle.className = 'gki-open'; toggle.textContent = 'İletişim ve talepler'; toggle.setAttribute('aria-expanded', 'false');
  root.append(box, toggle); document.body.append(root);
  let active = true, busy = false, timer = null;
  const seenRinging = new Set(), requestIds = new Map();
  const make = (tag, text) => { const el = document.createElement(tag); el.textContent = text; return el; };
  const post = async (path, data) => {
    const r = await fetch('/api/gk/integrations/' + path, {method: 'POST', credentials: 'same-origin', headers: {'Content-Type': 'application/json', 'X-Gunay-Request': '1'}, body: JSON.stringify(data)});
    const result = await r.json(); if (!r.ok || !result.ok) throw Error(result.error || 'İşlem yapılamadı.'); return result;
  };
  const errorText = code => ({FEATURE_DISABLED: 'Bağlantı henüz açılmadı.', UNAUTHENTICATED: 'Yeniden giriş gerekli.', FORBIDDEN: 'Bu alan için yetkiniz yok.', PROVIDER_NOT_CONNECTED: 'Santral bağlantısı henüz kurulmadı.', CALL_SETUP_REQUIRED: 'Personel telefonu ve şirket hattı tamamlanmalı.'}[code] || 'Bağlantı kurulamadı. Yeniden deneyin.');
  function article(title, text, urgent = false) {
    const el = document.createElement('article'); if (urgent) el.className = 'gki-fault';
    el.append(make('h3', title), make('p', text)); box.append(el); return el;
  }
  async function refresh() {
    if (!active || busy || (box.hidden && config.role === 'technician')) return; busy = true;
    try {
      const path = config.role === 'technician' ? 'my-jobs' : 'overview';
      const response = await fetch('/api/gk/integrations/' + path, {credentials: 'same-origin', cache: 'no-store'});
      const data = await response.json(); if (!response.ok || !data.ok) throw Error(data.error);
      for (const c of data.calls || []) if (c.type === 'ringing' && !seenRinging.has(c.id)) {
        seenRinging.add(c.id); box.hidden = false; toggle.setAttribute('aria-expanded', 'true');
      }
      box.replaceChildren(make('h3', config.role === 'technician' ? 'Bana atanan işler' : 'İletişim ve talepler'));
      box.append(make('small', 'Bağlantı hazırlığı. Gerçek arama ve mesaj gönderimi kapalı.'));
      if (path === 'my-jobs') for (const job of data.jobs) {
        const el = article(job.customer, `${job.date} ${job.start}\n${job.address}`), button = make('button', 'Müşteriyi ara');
        if (!requestIds.has(job.id)) requestIds.set(job.id, crypto.randomUUID());
        const requestId = requestIds.get(job.id);
        button.onclick = async () => {
          button.disabled = true;
          try { await post('call', {workOrderId: job.id, requestId}); el.append(make('p', 'Deneme tamamlandı; gerçek arama yapılmadı.')); }
          catch (e) { el.append(make('p', errorText(e.message))); button.disabled = false; }
        };
        el.append(button);
      } else {
        for (const c of data.calls) {
          const status = c.missed ? 'Cevapsız çağrı' : c.type === 'ringing' ? 'Gelen çağrı' : 'Çağrı';
          const title = c.card ? `${status}: ${c.card.name}` : c.match.status === 'ambiguous' ? `${status}: birden çok müşteri eşleşti` : `${status}: kayıtlı müşteri bulunamadı`;
          const details = c.card ? [...c.card.addresses.map(a => `${a.line}, ${a.ilce}`), ...c.card.devices.map(d => `${d.model} / ${d.room}`), ...c.card.maintenance.map(h => `Bakım: ${h.date} ${h.action || ''}`)] : [c.phone || 'Numara gizli veya geçersiz'];
          if (c.outsideHours === true) details.push('Mesai dışı bildirim taslağı. Gönderilmedi.');
          article(title, details.join('\n'), c.type === 'ringing' || c.missed);
        }
        for (const r of data.requests) article(`${r.label}: ${r.name}`, r.match.status === 'matched' ? 'Kayıtlı müşteri eşleşti.' : r.match.status === 'ambiguous' ? 'Birden fazla eşleşme var. Büro kontrol etmeli.' : 'Yeni müşteri talebi.', r.type === 'ariza');
        for (const m of data.mail) article('Önemli e-posta', m.digestText, m.priority === 'high');
        if (!data.calls.length && !data.requests.length && !data.mail.length) box.append(make('p', 'Henüz kayıt yok.'));
      }
    } catch (e) {
      box.replaceChildren(make('p', errorText(e.message)));
      const retry = make('button', 'Yeniden dene'); retry.onclick = refresh; box.append(retry);
    } finally { busy = false; }
  }
  toggle.onclick = () => { box.hidden = !box.hidden; toggle.setAttribute('aria-expanded', String(!box.hidden)); if (!box.hidden) refresh(); };
  timer = setInterval(refresh, 10000);
  refresh();
  window.addEventListener('pagehide', () => { active = false; clearInterval(timer); }, {once: true});
})();
