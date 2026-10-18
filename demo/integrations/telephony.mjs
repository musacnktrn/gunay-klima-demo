// ureten: codex. Provider request blueprints are inert; only MockProvider dispatches.
import {bounded, iso, normalizePhone, requireValue, IntegrationError} from './core.mjs';
const tr = value => { const p = normalizePhone(value); requireValue(p?.startsWith('+90'), 'TR_PHONE_REQUIRED'); return p.slice(1); };
const boolean = v => v === true || v === 'true' || v === 1 || v === '1' ? true : v === false || v === 'false' || v === 0 || v === '0' ? false : null;
export function callEvent(provider, payload, receivedAt) {
  iso(receivedAt);
  let callId, type, phone, direction, answered, occurredAt;
  if (provider === 'verimor') {
    callId = payload.call_uuid; type = ({ringing: 'ringing', answer: 'answered', hangup: 'ended', user_hangup: 'ended'})[payload.event_type];
    direction = payload.direction;
    phone = direction === 'inbound' ? payload.caller_id_number : payload.destination_number;
    answered = type === 'answered' ? true : boolean(payload.answered);
    // Provider timestamps may lack an offset. Keep receipt time instead of guessing.
    const stamp = type === 'ended' ? payload.end_stamp : type === 'answered' ? payload.answer_stamp : payload.start_stamp;
    occurredAt = stamp && /T.*(?:Z|[+-]\d\d:\d\d)$/.test(stamp) ? iso(stamp) : receivedAt;
  } else if (provider === 'netgsm') {
    callId = payload.unique_id;
    type = ({Inbound_call: 'ringing', Outbound_call: 'ringing', Answer: 'answered', Hangup: 'ended'})[payload.scenario];
    direction = payload.scenario === 'Inbound_call' ? 'inbound' : payload.scenario === 'Outbound_call' ? 'outbound' : null;
    phone = payload.customer_num;
    answered = type === 'answered' ? true : type === 'ended' && payload.talktime != null && /^\d+$/.test(String(payload.talktime)) ? Number(payload.talktime) > 0 : null;
    occurredAt = /^\d{13}$/.test(String(payload.timestamp)) ? new Date(Number(payload.timestamp)).toISOString() : receivedAt;
  } else if (provider === 'mock') {
    ({callId, type, phone, direction, answered} = payload); occurredAt = payload.occurredAt || receivedAt;
    answered = boolean(answered);
  } else throw new IntegrationError('UNKNOWN_PROVIDER');
  requireValue(['ringing', 'answered', 'ended'].includes(type), 'UNSUPPORTED_CALL_EVENT');
  requireValue(direction == null || ['inbound', 'outbound', 'internal'].includes(direction), 'INVALID_DIRECTION');
  return {provider, callId: bounded(callId, 200), type, phone: normalizePhone(phone), direction: direction || null, answered, occurredAt: iso(occurredAt)};
}
function callInput(input) {
  requireValue(input.recordingEnabled !== true, 'RECORDING_PROHIBITED', 403);
  const callerId = tr(input.callerId);
  requireValue(/^90232\d{7}$/.test(callerId), 'AUTHORIZED_0232_REQUIRED');
  return {source: tr(input.source), destination: tr(input.destination), callerId};
}
export class VerimorAdapter {
  name = 'verimor'; live = false;
  planCall(input) {
    const p = callInput(input);
    return {method: 'POST', url: 'https://api.bulutsantralim.com/bridge', auth: 'query:key supplied only by future server transport', contentType: 'application/x-www-form-urlencoded', body: {source: p.source, destination: p.destination, caller_id: p.callerId, timeout: 29, recording_enabled: false}};
  }
  planSms(input) {
    return {method: 'POST', url: 'https://sms.verimor.com.tr/v2/send.json', auth: 'body:username,password supplied only by future server transport', body: {source_addr: bounded(input.sender, 11), datacoding: 1, is_commercial: input.commercial === true, iys_recipient_type: 'BIREYSEL', custom_id: bounded(input.requestId, 50), messages: [{dest: tr(input.to), msg: bounded(input.text, 900)}], ...(input.commercial ? {add_ret: true} : {})}};
  }
  async dispatch() { throw new IntegrationError('PROVIDER_NOT_CONNECTED', 503); }
}
export class NetgsmAdapter {
  name = 'netgsm'; live = false;
  planCall(input) {
    const p = callInput(input);
    // Official SDK operation is documented. Do not invent an HTTP path or recording flag.
    return {operation: 'cagribagla', transport: 'official Netgsm Netsantral SDK', needsConfirmation: ['recording disabled on account', 'authorized 0232 trunk', 'HTTP transport and webhook authentication'], body: {caller: p.source.slice(2), called: p.destination.slice(2), trunk: p.callerId.slice(2), ring_timeout: '20', crm_id: bounded(input.requestId, 50), wait_response: '0', originate_order: 'if'}};
  }
  planSms(input) {
    return {method: 'POST', url: 'https://api.netgsm.com.tr/sms/rest/v2/send', auth: 'HTTP Basic supplied only by future server transport', body: {msgheader: bounded(input.sender, 11), encoding: 'TR', iysfilter: input.commercial ? '11' : '0', messages: [{no: tr(input.to).slice(2), msg: bounded(input.text, 900)}]}};
  }
  async dispatch() { throw new IntegrationError('PROVIDER_NOT_CONNECTED', 503); }
}
export class MockProvider {
  name = 'mock'; live = false; invocations = [];
  async dispatch(kind, request) {
    this.invocations.push({kind, requestId: request.requestId});
    return {status: 'simulated', providerId: `mock-${request.requestId}`, delivered: false};
  }
}
export function smsTemplate(template, data = {}) {
  const b = v => bounded(v, 70);
  const templates = {
    appointment_reminder: () => `Günay Klima: ${b(data.date)} ${b(data.time)} randevunuzu hatırlatırız. Değişiklik için ${b(data.officePhone)}.`,
    appointment_created: () => `Günay Klima: Randevunuz ${b(data.date)} ${b(data.time)} için kaydedildi. İletişim: ${b(data.officePhone)}.`,
    maintenance_due: () => `Günay Klima: Kayıtlarımızdaki ${b(data.device)} için bakım zamanı geldi. Randevu için ${b(data.officePhone)}.`,
    technician_on_way: () => `Günay Klima: Servis ekibimiz randevunuz için yola çıktı. İletişim: ${b(data.officePhone)}.`,
    service_completed: () => `Günay Klima: Servis işleminiz tamamlandı. İletişim: ${b(data.officePhone)}.`,
    missed_call: () => `Günay Klima: Cevapsız çağrı var. Arayan: ${b(data.caller)}. Panelden kontrol ediniz.`,
    outside_hours: () => `Günay Klima: Mesai dışında çağrı var. Arayan: ${b(data.caller)}. Panelden kontrol ediniz.`
  };
  requireValue(Object.hasOwn(templates, template), 'UNKNOWN_TEMPLATE');
  const text = templates[template]();
  // Maintenance is conservatively treated as commercial until its real context is approved.
  return {template, text, commercial: template === 'maintenance_due', approvalRequired: true};
}
