// ureten: codex. Server-side contracts; no credentials, timers or network side effects.
export class IntegrationError extends Error {
  constructor(code, status = 422) { super(code); this.code = code; this.status = status; }
}
export function requireValue(condition, code, status = 422) {
  if (!condition) throw new IntegrationError(code, status);
}
export function bounded(value, max = 200, required = true) {
  requireValue(typeof value === 'string' || (!required && value == null), 'INVALID_TEXT');
  const text = (value || '').trim();
  requireValue(text.length <= max && (!required || text.length > 0), 'INVALID_TEXT');
  return text;
}
export function iso(value) {
  requireValue(typeof value === 'string' && /T.*(?:Z|[+-]\d\d:\d\d)$/.test(value), 'TIMEZONE_REQUIRED');
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  requireValue(parts, 'INVALID_TIME');
  const [, year, month, day] = parts.map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  requireValue(month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1], 'INVALID_TIME');
  const date = new Date(value);
  requireValue(Number.isFinite(date.getTime()), 'INVALID_TIME');
  return date.toISOString();
}
export async function hash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
const flagNames = ['telephony', 'sms', 'specto', 'outlook', 'staffAccounts'];
export function featureFlags(env = {}) {
  return Object.freeze(Object.fromEntries(flagNames.map(k => [k, env[`GUNAY_${k.toUpperCase()}`] === 'true'])));
}
export function enabled(flags, name) {
  requireValue(flags?.[name] === true, 'FEATURE_DISABLED', 404);
}
export function principal(user, workspace) {
  requireValue(user?.active === true && user.workspace === workspace && typeof user.id === 'string' && user.id.length > 0, 'UNAUTHENTICATED', 401);
  requireValue(['admin', 'office', 'technician'].includes(user.role), 'FORBIDDEN', 403);
  return user;
}
export function office(user, workspace) {
  principal(user, workspace);
  requireValue(['admin', 'office'].includes(user.role), 'FORBIDDEN', 403);
}
export function canWork(user, workOrder) {
  return !!workOrder && workOrder.status !== 'iptal' && (['admin', 'office'].includes(user.role) ||
    (user.role === 'technician' && !!user.staffId && workOrder.techId === user.staffId));
}
export function normalizePhone(value) {
  if (typeof value !== 'string' || !/^[+\d\s().-]+$/.test(value.trim())) return null;
  let s = value.trim().replace(/[\s().-]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (/^0[23458]\d{9}$/.test(s)) s = '+90' + s.slice(1);
  else if (/^[23458]\d{9}$/.test(s)) s = '+90' + s;
  else if (/^90[23458]\d{9}$/.test(s)) s = '+' + s;
  if (!/^\+[1-9]\d{7,14}$/.test(s)) return null;
  if (s.startsWith('+90') && !/^\+90[23458]\d{9}$/.test(s)) return null;
  return s;
}
export function matchCustomer(db, phone) {
  const e164 = normalizePhone(phone);
  if (!e164) return {status: 'invalid', customerId: null, candidates: []};
  const candidates = db.customers.filter(c => c.active !== false &&
    [c.phone, ...(c.phones || []).map(p => typeof p === 'string' ? p : p.number)].some(p => normalizePhone(p) === e164)).map(c => c.id);
  return {status: candidates.length === 1 ? 'matched' : candidates.length ? 'ambiguous' : 'new', customerId: candidates.length === 1 ? candidates[0] : null, candidates};
}
export function customerCard(db, customerId) {
  const customer = db.customers.find(c => c.id === customerId && c.active !== false);
  if (!customer) return null;
  // Explicit projection, never send the entire CRM state through this API.
  return {
    id: customer.id, name: customer.name,
    addresses: db.addresses.filter(a => a.customerId === customerId && a.active !== false).map(a => ({id: a.id, line: a.line, mah: a.mah, ilce: a.ilce, city: a.city})),
    devices: db.devices.filter(d => d.customerId === customerId && d.active !== false).map(d => ({id: d.id, addressId: d.addressId, room: d.room, model: d.externalModel || db.products.find(p => p.id === d.productId)?.code || '', interval: d.interval ?? null})),
    maintenance: db.history.filter(h => db.devices.some(d => d.id === h.deviceId && d.customerId === customerId)).map(h => ({deviceId: h.deviceId, date: h.date, action: h.action, type: h.type})).slice(-20)
  };
}
export function outsideHours(timestamp, schedule) {
  if (!schedule) return null; // Hours have not been supplied by the business.
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date(iso(timestamp))).map(p => [p.type, p.value]));
  if (schedule.holidays?.includes(`${parts.year}-${parts.month}-${parts.day}`)) return true;
  const windows = schedule.week?.[parts.weekday];
  if (!Array.isArray(windows)) return null;
  const minute = Number(parts.hour) * 60 + Number(parts.minute);
  return !windows.some(([start, end]) => {
    requireValue(/^([01]\d|2[0-3]):[0-5]\d$/.test(start) && /^(?:([01]\d|2[0-3]):[0-5]\d|24:00)$/.test(end), 'INVALID_SCHEDULE');
    const toMinute = s => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
    requireValue(toMinute(start) < toMinute(end), 'SPLIT_OVERNIGHT_SCHEDULE');
    return minute >= toMinute(start) && minute < toMinute(end);
  });
}
