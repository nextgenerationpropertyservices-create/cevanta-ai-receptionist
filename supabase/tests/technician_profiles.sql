-- CEV-DISPATCH-100A. Fictional embedded technician-profile checks, not live JWT proof.
begin;
insert into auth.users(id,email) values
 ('93000000-0000-4000-8001-000000000001','owner@example.invalid'),
 ('93000000-0000-4000-8001-000000000002','admin@example.invalid'),
 ('93000000-0000-4000-8001-000000000003','dispatcher@example.invalid'),
 ('93000000-0000-4000-8001-000000000004','technician@example.invalid'),
 ('93000000-0000-4000-8001-000000000005','viewer@example.invalid'),
 ('93000000-0000-4000-8001-000000000006','other-technician@example.invalid');
insert into public.memberships(tenant_id,user_id,role) values
 ('10000000-0000-4000-8000-000000000001','93000000-0000-4000-8001-000000000001','owner'),
 ('10000000-0000-4000-8000-000000000001','93000000-0000-4000-8001-000000000002','admin'),
 ('10000000-0000-4000-8000-000000000001','93000000-0000-4000-8001-000000000003','dispatcher'),
 ('10000000-0000-4000-8000-000000000001','93000000-0000-4000-8001-000000000004','technician'),
 ('10000000-0000-4000-8000-000000000001','93000000-0000-4000-8001-000000000005','viewer'),
 ('10000000-0000-4000-8000-000000000002','93000000-0000-4000-8001-000000000006','technician');
set local role authenticated;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8001-000000000001',true);
insert into public.technician_profiles(tenant_id,user_id,skills,service_areas,availability_windows,availability_note)
values('10000000-0000-4000-8000-000000000001','93000000-0000-4000-8001-000000000004',array['no heat'],array['lewiston'],'[{"day":"monday","start":"08:00","end":"16:00"}]','Office-confirmed windows only.');

do $$ begin
 begin update public.technician_profiles set availability_windows='[null]'::jsonb where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Null window accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set availability_windows='[{"day":"monday","start":"bad","end":"16:00"}]'::jsonb where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Bad time accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set availability_windows='[{"day":null,"start":"08:00","end":"16:00"}]'::jsonb where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Null day accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set availability_windows='[{"day":"monday","start":null,"end":"16:00"}]'::jsonb where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Null start accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set availability_windows='[{"day":"monday","start":"08:00","end":null}]'::jsonb where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Null end accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set availability_windows='[{"day":"monday","start":"16:00","end":"08:00"}]'::jsonb where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Reversed window accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set availability_windows='[{"day":"monday","start":"08:00","end":"12:00"},{"day":"monday","start":"13:00","end":"16:00"}]'::jsonb where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Duplicate day accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set service_areas=array[''] where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Blank service area accepted'; exception when check_violation then null; end;
 begin update public.technician_profiles set service_areas=array[repeat('x',61)] where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; raise exception 'Long service area accepted'; exception when check_violation then null; end;
 begin insert into public.technician_profiles(tenant_id,user_id,service_areas,availability_windows) values('10000000-0000-4000-8000-000000000001','93000000-0000-4000-8001-000000000006',array['auburn'],'[]'::jsonb); raise exception 'Foreign tenant technician accepted'; exception when foreign_key_violation or check_violation then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8001-000000000003',true);
do $$ begin begin update public.technician_profiles set service_areas=array['auburn'] where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; if found then raise exception 'Dispatcher profile write accepted'; end if; exception when insufficient_privilege then null; end; end $$;
select set_config('request.jwt.claim.sub','93000000-0000-4000-8001-000000000005',true);
do $$ begin begin update public.technician_profiles set service_areas=array['auburn'] where tenant_id='10000000-0000-4000-8000-000000000001' and user_id='93000000-0000-4000-8001-000000000004'; if found then raise exception 'Viewer profile write accepted'; end if; exception when insufficient_privilege then null; end; end $$;
reset role;
rollback;






