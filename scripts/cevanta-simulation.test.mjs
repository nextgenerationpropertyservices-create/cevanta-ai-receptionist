import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateLead, validateAppointment } from './cevanta-simulation.mjs';

const payload = { requestedAt: '2026-10-04T10:00:00Z', appointmentRequested: true, durationMinutes: 30 };
const trusted = { now: '2026-10-03T10:00:00Z', approvedDurationMinutes: 30 };
const check = (changes = {}, config = {}) => validateAppointment({ ...payload, ...changes }, { ...trusted, ...config });
const reject = (result, reason) => assert.deepEqual(result, { valid: false, reason });

test('fictional lead exact output, repeat and boundaries', () => {
  const expected = { call_id: 'test-call-abc', simulation: true, status: 'simulated_not_persisted' };
  assert.deepEqual(simulateLead('test-call-abc'), expected);
  assert.deepEqual(simulateLead('test-call-abc'), expected);
  assert.equal(simulateLead(`test-call-${'a'.repeat(100)}`).simulation, true);
  for (const input of [null, 3, {}, new String('test-call-a'), 'call_real', 'test-call-', `test-call-${'a'.repeat(101)}`, 'test-call-a\n', 'test-call-é', ' test-call-a']) {
    assert.throws(() => simulateLead(input), { name: 'TypeError', message: 'Invalid fictional identifier' });
  }
});
test('offset and fractional normalization with deterministic UTC outputs', () => {
  assert.deepEqual(check({ requestedAt: '2026-10-04T12:00:00.12+02:00' }), { valid: true, starts_at_utc: '2026-10-04T10:00:00.120Z', ends_at_utc: '2026-10-04T10:30:00.120Z' });
  assert.deepEqual(check({ requestedAt: '2026-10-04T05:00:00-05:00' }), check());
  assert.deepEqual(check(), check());
  assert.equal(check({ requestedAt: '2026-10-04T10:00:00+00:00' }).valid, true);
});
test('real calendar components, strict lexical format and unknown timezone', () => {
  for (const value of ['2026-02-29T10:00:00Z', '1900-02-29T10:00:00Z', '2026-04-31T10:00:00Z', '2026-00-01T10:00:00Z', '2026-13-01T10:00:00Z', '2026-10-00T10:00:00Z', '2026-10-04T24:00:00Z', '2026-10-04T10:60:00Z', '2026-10-04T10:00:60Z', '2026-10-04t10:00:00z', '2026-10-04T10:00:00.1234Z', '2026-10-04T10:00:00+24:00', '2026-10-04T10:00:00+01:60', '0000-01-01T00:00:00Z', '2026-10-04T10:00:00Z ', 7]) reject(check({ requestedAt: value }), 'invalid');
  for (const value of ['2026-10-04T10:00:00', '2026-10-04T10:00:00-00:00']) reject(check({ requestedAt: value }), 'timezone_unverified');
  assert.equal(check({ requestedAt: '2028-02-29T10:00:00Z' }).valid, true);
  assert.equal(check({ requestedAt: '2000-02-29T10:00:00Z' }, { now: '1999-01-01T00:00:00Z' }).valid, true);
});
test('trusted instant and intent fail closed, payload overrides have no authority', () => {
  for (const value of [undefined, '', null]) reject(check({ requestedAt: value }), 'missing');
  for (const value of [undefined, 'true', 1, false, new Boolean(true)]) reject(check({ appointmentRequested: value }), 'intent_not_confirmed');
  for (const value of [undefined, '', 'now', '2026-10-03T10:00:00', '2026-02-30T10:00:00Z']) reject(check({}, { now: value }), 'invalid');
  reject(check({ requestedAt: trusted.now }), 'past');
  reject(check({ requestedAt: '2026-10-03T11:00:00+02:00', now: '1900-01-01T00:00:00Z' }), 'past');
  assert.equal(check({ requestedAt: '2026-10-03T10:00:00.001Z' }).valid, true);
  for (const value of [null, [], 3, 'payload']) { reject(validateAppointment(value, trusted), 'invalid'); reject(validateAppointment(payload, value), 'invalid'); }
});
test('duration policy requires exact supplied safe positive integers', () => {
  for (const value of [undefined, null, 0, -1, 30.5, '30', Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, 60]) reject(check({ durationMinutes: value }), 'duration_unapproved');
  for (const value of [undefined, 0, '30', 60]) reject(check({}, { approvedDurationMinutes: value }), 'duration_unapproved');
  reject(check({ durationMinutes: Number.MAX_SAFE_INTEGER }, { approvedDurationMinutes: Number.MAX_SAFE_INTEGER }), 'duration_unapproved');
  reject(check({ requestedAt: '9999-12-31T23:59:00Z' }), 'duration_unapproved');
});
test('years 0001–0099 and offset range boundaries normalize without century rollover', () => {
  assert.deepEqual(check({ requestedAt: '0001-01-02T00:00:00Z' }, { now: '0001-01-01T00:00:00Z' }), { valid: true, starts_at_utc: '0001-01-02T00:00:00.000Z', ends_at_utc: '0001-01-02T00:30:00.000Z' });
  assert.equal(check({ requestedAt: '0099-01-02T00:00:00Z' }, { now: '0099-01-01T00:00:00Z' }).starts_at_utc, '0099-01-02T00:00:00.000Z');
  reject(check({ requestedAt: '0001-01-01T00:00:00+01:00' }), 'invalid');
  reject(check({ requestedAt: '9999-12-31T23:59:00-01:00' }), 'invalid');
  assert.equal(check({ requestedAt: '2026-10-05T00:00:00+23:59' }).valid, true);
});
