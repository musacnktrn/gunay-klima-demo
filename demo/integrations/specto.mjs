// ureten: codex. Canonical import, not an assertion about the customer's Specto tenant API.
import {bounded, iso, normalizePhone, matchCustomer, requireValue} from './core.mjs';
const fold = s => String(s).toLocaleLowerCase('tr-TR').replaceAll('ı', 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const types = new Map([['kesif', 'kesif'], ['fiyat teklifi', 'teklif'], ['teklif', 'teklif'], ['ariza', 'ariza'], ['bakim', 'bakim']]);
export const requestLabels = Object.freeze({kesif: 'Keşif', teklif: 'Fiyat teklifi', ariza: 'Arıza', bakim: 'Bakım'});
export function normalizeSpecto(row, db, mapping = {externalId: 'externalId', type: 'type', name: 'name', phone: 'phone', createdAt: 'createdAt'}) {
  requireValue(row && typeof row === 'object' && !Array.isArray(row), 'INVALID_SPECTO_ROW');
  const get = key => Object.hasOwn(row, mapping[key]) ? row[mapping[key]] : undefined;
  const type = types.get(fold(get('type')));
  requireValue(type, 'UNKNOWN_REQUEST_TYPE');
  const phone = normalizePhone(get('phone'));
  requireValue(phone, 'INVALID_PHONE');
  return {source: 'specto', externalId: bounded(get('externalId'), 160), type, label: requestLabels[type], priority: type === 'ariza' ? 100 : 50, name: bounded(get('name'), 160), phone, createdAt: iso(get('createdAt')), match: matchCustomer(db, phone), status: 'new'};
}
export function parseDelimited(text, delimiter = ',') {
  requireValue(typeof text === 'string' && text.length <= 1024 * 1024 && [',', ';', '\t'].includes(delimiter), 'IMPORT_LIMIT');
  const rows = []; let row = [], field = '', quoted = false, closed = false;
  const push = () => { row.push(field); field = ''; closed = false; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === '"') { requireValue(!field && !closed, 'INVALID_CSV'); quoted = true; }
    else if (c === delimiter) push();
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; push(); if (row.some(Boolean)) rows.push(row); row = []; }
    else { requireValue(!closed, 'INVALID_CSV'); field += c; }
  }
  requireValue(!quoted, 'INVALID_CSV'); push(); if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift() || []; if (headers.length) headers[0] = headers[0].replace(/^\uFEFF/, '');
  requireValue(headers.length > 0 && headers.every(Boolean) && new Set(headers).size === headers.length && rows.length <= 100, 'INVALID_IMPORT_HEADERS_OR_SIZE');
  return rows.map(values => { requireValue(values.length === headers.length, 'INVALID_CSV_COLUMNS'); return Object.fromEntries(headers.map((h, i) => [h, values[i]])); });
}
export function spectoEmailFields(message, {allowedSenders = [], verifiedSender = false} = {}) {
  // Header text alone is not sender authentication. The mailbox ingestion layer supplies this fact.
  requireValue(verifiedSender && allowedSenders.map(s => s.toLowerCase()).includes(String(message.from).toLowerCase()), 'SPECTO_SENDER_NOT_VERIFIED', 403);
  const text = bounded(message.text, 10000), fields = Object.create(null);
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(Talep No|Talep Türü|Ad Soyad|Telefon|Tarih):\s*(.+)$/);
    if (m) { requireValue(!fields[m[1]], 'AMBIGUOUS_EMAIL_FIELDS'); fields[m[1]] = m[2].trim(); }
  }
  return {externalId: fields['Talep No'], type: fields['Talep Türü'], name: fields['Ad Soyad'], phone: fields.Telefon, createdAt: fields.Tarih};
}
