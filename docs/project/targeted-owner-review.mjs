import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = await PGlite.create();
const tenant = '10000000-0000-4000-8000-000000000001';
const user = '90000000-0000-4000-8000-000000000001';
const second = '90000000-0000-4000-8000-000000000002';
const template = readFileSync('supabase/setup-development-owner-targeted.sql', 'utf8');
const setup = template.replace("target_email constant text := 'REPLACE_WITH_YOUR_SIGN_IN_EMAIL'", "target_email constant text := 'TARGET@example.invalid'");
try {
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; alter default privileges in schema public grant all on tables to anon,authenticated;`);
  await db.exec(readFileSync('supabase/migrations/202610020001_foundation.sql', 'utf8'));
  await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
  async function reset(users) {
    await db.exec('delete from public.memberships; delete from auth.users;');
    if (users) await db.exec(`insert into auth.users values ${users}`);
  }
  async function rows() {
    return (await db.query('select tenant_id,user_id,role from public.memberships order by tenant_id,user_id')).rows;
  }
  async function refuse(label, pattern, sql = setup) {
    const before = await rows();
    await assert.rejects(db.exec(sql), error => pattern.test(error.message));
    await db.exec('rollback');
    assert.deepEqual(await rows(), before, 'failed setup must preserve memberships');
    console.log('PASS ' + label);
  }
  const confirmed = `('${user}','target@example.invalid',now())`;
  const other = `('${second}','other@example.invalid',now())`;
  await reset(`${confirmed},${other}`);
  await db.exec(setup);
  assert.deepEqual(await rows(), [{tenant_id:tenant,user_id:user,role:'owner'}]);
  console.log('PASS multiple accounts selects exact case-insensitive target; no other account or tenant grant');
  await db.exec(setup);
  assert.equal((await rows()).length, 1);
  console.log('PASS repeat is idempotent');
  await reset(other);
  await refuse('absent target refuses', /one matching Auth account/);
  await refuse('placeholder refuses', /Replace the email placeholder/, template);
  await reset(`${confirmed},('${second}','TARGET@example.invalid',now())`);
  await refuse('duplicate normalized target refuses', /one matching Auth account/);
  await reset(`('${user}','target@example.invalid',null),${other}`);
  await refuse('unconfirmed target refuses', /Confirm this Auth account/);
  await reset(`${confirmed},${other}`);
  await db.exec(`insert into public.memberships(tenant_id,user_id,role) values('${tenant}','${user}','viewer')`);
  await refuse('viewer remains viewer; no promotion', /Automatic role promotion/);
  await reset(`${confirmed},${other}`);
  await db.exec(`insert into public.memberships(tenant_id,user_id,role) values('${tenant}','${second}','owner')`);
  await refuse('different existing owner preserved', /different workspace owner/);
  await reset(confirmed);
  await db.exec(`update public.tenants set name='Changed fictional demo' where id='${tenant}'`);
  await refuse('wrong tenant refuses', /fictional Cevanta demo workspace/);
  console.log('PASS nine isolated targeted provisioning scenarios; actual foundation migration and fictional seed');
} finally {
  await db.close();
}
