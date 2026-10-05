/** Offline fictional contract only: no persistence, booking or provider behavior. */
export function simulateLead(call_id) {
  if (typeof call_id !== 'string' || !/^test-call-[A-Za-z0-9_-]{1,100}$/.test(call_id)) {
    throw new TypeError('Invalid fictional identifier');
  }
  return { call_id, simulation: true, status: 'simulated_not_persisted' };
}

const instantPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/;
const localPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/;
const failure = reason => ({ valid: false, reason });
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function parseInstant(value) {
  if (typeof value !== 'string') return { reason: 'invalid' };
  if (localPattern.test(value)) return { reason: 'timezone_unverified' };
  const match = instantPattern.exec(value);
  if (!match) return { reason: 'invalid' };
  const [, ys, mos, ds, hs, mis, ss, fraction = '', zone] = match;
  const [year, month, day, hour, minute, second] = [ys, mos, ds, hs, mis, ss].map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1] || hour > 23 || minute > 59 || second > 59) return { reason: 'invalid' };
  if (zone === '-00:00') return { reason: 'timezone_unverified' };
  let offset = 0;
  if (zone !== 'Z') {
    const zh = Number(zone.slice(1, 3));
    const zm = Number(zone.slice(4, 6));
    if (zh > 23 || zm > 59) return { reason: 'invalid' };
    offset = (zh * 60 + zm) * (zone[0] === '+' ? 1 : -1);
  }
  // setUTCFullYear avoids Date.UTC's special interpretation of years 00–99.
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, Number(fraction.padEnd(3, '0')));
  const epoch = date.getTime() - offset * 60000;
  const utcYear = new Date(epoch).getUTCFullYear();
  if (!Number.isSafeInteger(epoch) || utcYear < 1 || utcYear > 9999) return { reason: 'invalid' };
  return { epoch };
}

export function validateAppointment(payload, trusted) {
  if (!object(payload) || !object(trusted)) return failure('invalid');
  if (payload.requestedAt === undefined || payload.requestedAt === null || payload.requestedAt === '') return failure('missing');
  if (payload.appointmentRequested !== true) return failure('intent_not_confirmed');
  const start = parseInstant(payload.requestedAt);
  const now = parseInstant(trusted.now);
  if (now.reason) return failure('invalid');
  if (start.reason) return failure(start.reason);
  const duration = payload.durationMinutes;
  const approved = trusted.approvedDurationMinutes;
  if (!Number.isSafeInteger(duration) || duration <= 0 || !Number.isSafeInteger(approved) || approved <= 0 || duration !== approved) return failure('duration_unapproved');
  if (start.epoch <= now.epoch) return failure('past');
  const delta = duration * 60000;
  const end = start.epoch + delta;
  const endDate = new Date(end);
  if (!Number.isSafeInteger(delta) || !Number.isSafeInteger(end) || end <= start.epoch || !Number.isFinite(endDate.getTime()) || endDate.getUTCFullYear() < 1 || endDate.getUTCFullYear() > 9999) return failure('duration_unapproved');
  return { valid: true, starts_at_utc: new Date(start.epoch).toISOString(), ends_at_utc: endDate.toISOString() };
}
