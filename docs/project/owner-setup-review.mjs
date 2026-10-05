import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = await PGlite.create();
const tenant = '10000000-0000-4000-8000-000000000001';
const user = '90000000-0000-4000-8000-000000000001';
const second = '90000000-0000-4000-8000-000000000002';
const setup = readFileSync('supabase/setup-development-owner.sql', 'utf8');
try {
 await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated; grant execute on function auth.uid() to anon,authenticated; alter default privileges in schema public grant all on tables to anon,authenticated;`);
 await db.exec(readFileSync('supabase/migrations/202610020001_foundation.sql', 'utf8'));
 await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
 async function reset(users) { await db.exec('delete from public.memberships; delete from auth.users;'); if (users) await db.exec(`insert into auth.users values ${users}`); }
 async function count() { return (await db.query('select count(*)::int as n from public.memberships')).rows[0].n; }
 async function refuse(label, pattern) { let failed = false; try { await db.exec(setup); } catch (error) { failed = true; assert.match(error.message, pattern); await db.exec('rollback'); } assert.ok(failed, label); console.log('PASS ' + label); }
 await reset(`('${user}',now())`); await db.exec(setup);
 assert.deepEqual((await db.query('select tenant_id,user_id,role from public.memberships')).rows, [{tenant_id: tenant,user_id: user,role:'owner'}]); console.log('PASS sole confirmed user only demo A owner; no demo B membership');
 await db.exec(setup); assert.equal(await count(),1); console.log('PASS repeat no duplicate');
 await reset(''); await refuse('zero users refuses',/exactly one Auth user/); assert.equal(await count(),0);
 await reset(`('${user}',now()),('${second}',now())`); await refuse('two users refuses',/exactly one Auth user/); assert.equal(await count(),0);
 await reset(`('${user}',null)`); await refuse('unconfirmed refuses',/Confirm the Auth user/); assert.equal(await count(),0);
 await reset(`('${user}',now())`); await db.exec(`insert into public.memberships(tenant_id,user_id,role) values('${tenant}','${user}','viewer')`); await refuse('nonowner refuses no promotion',/Automatic role promotion/); assert.equal((await db.query('select role from public.memberships')).rows[0].role,'viewer'); assert.equal(await count(),1);
 await reset(`('${user}',now())`); await db.exec(`update public.tenants set name='Changed demo' where id='${tenant}'`); await refuse('wrong tenant name refuses',/fictional Cevanta demo/); assert.equal(await count(),0);
 console.log('PASS seven isolated provisioning scenarios; actual foundation migration and fictional seed');
} finally { await db.close(); }
