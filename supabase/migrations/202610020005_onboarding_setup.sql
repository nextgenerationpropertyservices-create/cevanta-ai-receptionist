-- CEV-ONBOARD-SCHEMA-44: persistence foundation only. No application RPC is exposed.
begin;
create schema onboarding_private;
revoke all on schema onboarding_private from public,anon,authenticated;
create table onboarding_private.timezones(name text primary key);
-- Pinned with the shared TypeScript catalog; updating identifiers needs a migration.
insert into onboarding_private.timezones(name) values ('Africa/Abidjan'),
('Africa/Accra'),
('Africa/Addis_Ababa'),
('Africa/Algiers'),
('Africa/Asmera'),
('Africa/Bamako'),
('Africa/Bangui'),
('Africa/Banjul'),
('Africa/Bissau'),
('Africa/Blantyre'),
('Africa/Brazzaville'),
('Africa/Bujumbura'),
('Africa/Cairo'),
('Africa/Casablanca'),
('Africa/Ceuta'),
('Africa/Conakry'),
('Africa/Dakar'),
('Africa/Dar_es_Salaam'),
('Africa/Djibouti'),
('Africa/Douala'),
('Africa/El_Aaiun'),
('Africa/Freetown'),
('Africa/Gaborone'),
('Africa/Harare'),
('Africa/Johannesburg'),
('Africa/Juba'),
('Africa/Kampala'),
('Africa/Khartoum'),
('Africa/Kigali'),
('Africa/Kinshasa'),
('Africa/Lagos'),
('Africa/Libreville'),
('Africa/Lome'),
('Africa/Luanda'),
('Africa/Lubumbashi'),
('Africa/Lusaka'),
('Africa/Malabo'),
('Africa/Maputo'),
('Africa/Maseru'),
('Africa/Mbabane'),
('Africa/Mogadishu'),
('Africa/Monrovia'),
('Africa/Nairobi'),
('Africa/Ndjamena'),
('Africa/Niamey'),
('Africa/Nouakchott'),
('Africa/Ouagadougou'),
('Africa/Porto-Novo'),
('Africa/Sao_Tome'),
('Africa/Tripoli'),
('Africa/Tunis'),
('Africa/Windhoek'),
('America/Adak'),
('America/Anchorage'),
('America/Anguilla'),
('America/Antigua'),
('America/Araguaina'),
('America/Argentina/La_Rioja'),
('America/Argentina/Rio_Gallegos'),
('America/Argentina/Salta'),
('America/Argentina/San_Juan'),
('America/Argentina/San_Luis'),
('America/Argentina/Tucuman'),
('America/Argentina/Ushuaia'),
('America/Aruba'),
('America/Asuncion'),
('America/Bahia'),
('America/Bahia_Banderas'),
('America/Barbados'),
('America/Belem'),
('America/Belize'),
('America/Blanc-Sablon'),
('America/Boa_Vista'),
('America/Bogota'),
('America/Boise'),
('America/Buenos_Aires'),
('America/Cambridge_Bay'),
('America/Campo_Grande'),
('America/Cancun'),
('America/Caracas'),
('America/Catamarca'),
('America/Cayenne'),
('America/Cayman'),
('America/Chicago'),
('America/Chihuahua'),
('America/Ciudad_Juarez'),
('America/Coral_Harbour'),
('America/Cordoba'),
('America/Costa_Rica'),
('America/Coyhaique'),
('America/Creston'),
('America/Cuiaba'),
('America/Curacao'),
('America/Danmarkshavn'),
('America/Dawson'),
('America/Dawson_Creek'),
('America/Denver'),
('America/Detroit'),
('America/Dominica'),
('America/Edmonton'),
('America/Eirunepe'),
('America/El_Salvador'),
('America/Fort_Nelson'),
('America/Fortaleza'),
('America/Glace_Bay'),
('America/Godthab'),
('America/Goose_Bay'),
('America/Grand_Turk'),
('America/Grenada'),
('America/Guadeloupe'),
('America/Guatemala'),
('America/Guayaquil'),
('America/Guyana'),
('America/Halifax'),
('America/Havana'),
('America/Hermosillo'),
('America/Indiana/Knox'),
('America/Indiana/Marengo'),
('America/Indiana/Petersburg'),
('America/Indiana/Tell_City'),
('America/Indiana/Vevay'),
('America/Indiana/Vincennes'),
('America/Indiana/Winamac'),
('America/Indianapolis'),
('America/Inuvik'),
('America/Iqaluit'),
('America/Jamaica'),
('America/Jujuy'),
('America/Juneau'),
('America/Kentucky/Monticello'),
('America/Kralendijk'),
('America/La_Paz'),
('America/Lima'),
('America/Los_Angeles'),
('America/Louisville'),
('America/Lower_Princes'),
('America/Maceio'),
('America/Managua'),
('America/Manaus'),
('America/Marigot'),
('America/Martinique'),
('America/Matamoros'),
('America/Mazatlan'),
('America/Mendoza'),
('America/Menominee'),
('America/Merida'),
('America/Metlakatla'),
('America/Mexico_City'),
('America/Miquelon'),
('America/Moncton'),
('America/Monterrey'),
('America/Montevideo'),
('America/Montserrat'),
('America/Nassau'),
('America/New_York'),
('America/Nome'),
('America/Noronha'),
('America/North_Dakota/Beulah'),
('America/North_Dakota/Center'),
('America/North_Dakota/New_Salem'),
('America/Ojinaga'),
('America/Panama'),
('America/Paramaribo'),
('America/Phoenix'),
('America/Port-au-Prince'),
('America/Port_of_Spain'),
('America/Porto_Velho'),
('America/Puerto_Rico'),
('America/Punta_Arenas'),
('America/Rankin_Inlet'),
('America/Recife'),
('America/Regina'),
('America/Resolute'),
('America/Rio_Branco'),
('America/Santarem'),
('America/Santiago'),
('America/Santo_Domingo'),
('America/Sao_Paulo'),
('America/Scoresbysund'),
('America/Sitka'),
('America/St_Barthelemy'),
('America/St_Johns'),
('America/St_Kitts'),
('America/St_Lucia'),
('America/St_Thomas'),
('America/St_Vincent'),
('America/Swift_Current'),
('America/Tegucigalpa'),
('America/Thule'),
('America/Tijuana'),
('America/Toronto'),
('America/Tortola'),
('America/Vancouver'),
('America/Whitehorse'),
('America/Winnipeg'),
('America/Yakutat'),
('Antarctica/Casey'),
('Antarctica/Davis'),
('Antarctica/DumontDUrville'),
('Antarctica/Macquarie'),
('Antarctica/Mawson'),
('Antarctica/McMurdo'),
('Antarctica/Palmer'),
('Antarctica/Rothera'),
('Antarctica/Syowa'),
('Antarctica/Troll'),
('Antarctica/Vostok'),
('Arctic/Longyearbyen'),
('Asia/Aden'),
('Asia/Almaty'),
('Asia/Amman'),
('Asia/Anadyr'),
('Asia/Aqtau'),
('Asia/Aqtobe'),
('Asia/Ashgabat'),
('Asia/Atyrau'),
('Asia/Baghdad'),
('Asia/Bahrain'),
('Asia/Baku'),
('Asia/Bangkok'),
('Asia/Barnaul'),
('Asia/Beirut'),
('Asia/Bishkek'),
('Asia/Brunei'),
('Asia/Calcutta'),
('Asia/Chita'),
('Asia/Colombo'),
('Asia/Damascus'),
('Asia/Dhaka'),
('Asia/Dili'),
('Asia/Dubai'),
('Asia/Dushanbe'),
('Asia/Famagusta'),
('Asia/Gaza'),
('Asia/Hebron'),
('Asia/Hong_Kong'),
('Asia/Hovd'),
('Asia/Irkutsk'),
('Asia/Jakarta'),
('Asia/Jayapura'),
('Asia/Jerusalem'),
('Asia/Kabul'),
('Asia/Kamchatka'),
('Asia/Karachi'),
('Asia/Katmandu'),
('Asia/Khandyga'),
('Asia/Krasnoyarsk'),
('Asia/Kuala_Lumpur'),
('Asia/Kuching'),
('Asia/Kuwait'),
('Asia/Macau'),
('Asia/Magadan'),
('Asia/Makassar'),
('Asia/Manila'),
('Asia/Muscat'),
('Asia/Nicosia'),
('Asia/Novokuznetsk'),
('Asia/Novosibirsk'),
('Asia/Omsk'),
('Asia/Oral'),
('Asia/Phnom_Penh'),
('Asia/Pontianak'),
('Asia/Pyongyang'),
('Asia/Qatar'),
('Asia/Qostanay'),
('Asia/Qyzylorda'),
('Asia/Rangoon'),
('Asia/Riyadh'),
('Asia/Saigon'),
('Asia/Sakhalin'),
('Asia/Samarkand'),
('Asia/Seoul'),
('Asia/Shanghai'),
('Asia/Singapore'),
('Asia/Srednekolymsk'),
('Asia/Taipei'),
('Asia/Tashkent'),
('Asia/Tbilisi'),
('Asia/Tehran'),
('Asia/Thimphu'),
('Asia/Tokyo'),
('Asia/Tomsk'),
('Asia/Ulaanbaatar'),
('Asia/Urumqi'),
('Asia/Ust-Nera'),
('Asia/Vientiane'),
('Asia/Vladivostok'),
('Asia/Yakutsk'),
('Asia/Yekaterinburg'),
('Asia/Yerevan'),
('Atlantic/Azores'),
('Atlantic/Bermuda'),
('Atlantic/Canary'),
('Atlantic/Cape_Verde'),
('Atlantic/Faeroe'),
('Atlantic/Madeira'),
('Atlantic/Reykjavik'),
('Atlantic/South_Georgia'),
('Atlantic/St_Helena'),
('Atlantic/Stanley'),
('Australia/Adelaide'),
('Australia/Brisbane'),
('Australia/Broken_Hill'),
('Australia/Darwin'),
('Australia/Eucla'),
('Australia/Hobart'),
('Australia/Lindeman'),
('Australia/Lord_Howe'),
('Australia/Melbourne'),
('Australia/Perth'),
('Australia/Sydney'),
('Europe/Amsterdam'),
('Europe/Andorra'),
('Europe/Astrakhan'),
('Europe/Athens'),
('Europe/Belgrade'),
('Europe/Berlin'),
('Europe/Bratislava'),
('Europe/Brussels'),
('Europe/Bucharest'),
('Europe/Budapest'),
('Europe/Busingen'),
('Europe/Chisinau'),
('Europe/Copenhagen'),
('Europe/Dublin'),
('Europe/Gibraltar'),
('Europe/Guernsey'),
('Europe/Helsinki'),
('Europe/Isle_of_Man'),
('Europe/Istanbul'),
('Europe/Jersey'),
('Europe/Kaliningrad'),
('Europe/Kiev'),
('Europe/Kirov'),
('Europe/Lisbon'),
('Europe/Ljubljana'),
('Europe/London'),
('Europe/Luxembourg'),
('Europe/Madrid'),
('Europe/Malta'),
('Europe/Mariehamn'),
('Europe/Minsk'),
('Europe/Monaco'),
('Europe/Moscow'),
('Europe/Oslo'),
('Europe/Paris'),
('Europe/Podgorica'),
('Europe/Prague'),
('Europe/Riga'),
('Europe/Rome'),
('Europe/Samara'),
('Europe/San_Marino'),
('Europe/Sarajevo'),
('Europe/Saratov'),
('Europe/Simferopol'),
('Europe/Skopje'),
('Europe/Sofia'),
('Europe/Stockholm'),
('Europe/Tallinn'),
('Europe/Tirane'),
('Europe/Ulyanovsk'),
('Europe/Vaduz'),
('Europe/Vatican'),
('Europe/Vienna'),
('Europe/Vilnius'),
('Europe/Volgograd'),
('Europe/Warsaw'),
('Europe/Zagreb'),
('Europe/Zurich'),
('Indian/Antananarivo'),
('Indian/Chagos'),
('Indian/Christmas'),
('Indian/Cocos'),
('Indian/Comoro'),
('Indian/Kerguelen'),
('Indian/Mahe'),
('Indian/Maldives'),
('Indian/Mauritius'),
('Indian/Mayotte'),
('Indian/Reunion'),
('Pacific/Apia'),
('Pacific/Auckland'),
('Pacific/Bougainville'),
('Pacific/Chatham'),
('Pacific/Easter'),
('Pacific/Efate'),
('Pacific/Enderbury'),
('Pacific/Fakaofo'),
('Pacific/Fiji'),
('Pacific/Funafuti'),
('Pacific/Galapagos'),
('Pacific/Gambier'),
('Pacific/Guadalcanal'),
('Pacific/Guam'),
('Pacific/Honolulu'),
('Pacific/Kiritimati'),
('Pacific/Kosrae'),
('Pacific/Kwajalein'),
('Pacific/Majuro'),
('Pacific/Marquesas'),
('Pacific/Midway'),
('Pacific/Nauru'),
('Pacific/Niue'),
('Pacific/Norfolk'),
('Pacific/Noumea'),
('Pacific/Pago_Pago'),
('Pacific/Palau'),
('Pacific/Pitcairn'),
('Pacific/Ponape'),
('Pacific/Port_Moresby'),
('Pacific/Rarotonga'),
('Pacific/Saipan'),
('Pacific/Tahiti'),
('Pacific/Tarawa'),
('Pacific/Tongatapu'),
('Pacific/Truk'),
('Pacific/Wake'),
('Pacific/Wallis'),
('UTC');
create function onboarding_private.valid_text(value text, minimum integer, maximum integer)
returns boolean language sql immutable set search_path='' as $$
 select value is not null and value=pg_catalog.btrim(value,E'\t\n\v\f\r ') and pg_catalog.char_length(value) between minimum and maximum;
$$;
create function onboarding_private.valid_email(value text)
returns boolean language sql immutable set search_path='' as $$
 select value is null or (onboarding_private.valid_text(value,1,254)
 and value ~ $mail$^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$mail$
 and length(split_part(value,'@',1))<=64
 and not exists(select 1 from unnest(string_to_array(split_part(value,'@',2),'.')) label where length(label)>63));
$$;
create function onboarding_private.valid_phone(value text)
returns boolean language sql immutable set search_path='' as $$
 select value is null or value ~ '^\+[1-9][0-9]{1,14}$';
$$;
-- Canonical 32-byte unpadded base64url, never a stored plaintext token.
create function onboarding_private.token_bytes(value text)
returns bytea language plpgsql immutable set search_path='' as $$
declare decoded bytea;
begin
 if value is null or value !~ '^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$' then return null; end if;
 decoded:=decode(translate(value,'-_','+/')||'=','base64');
 if octet_length(decoded)<>32 or rtrim(translate(encode(decoded,'base64'),'+/','-_'),'=')<>value then return null; end if;
 return decoded;
exception when invalid_parameter_value then return null;
end; $$;
create function onboarding_private.token_digest(value text)
returns bytea language sql immutable set search_path='' as $$
 select sha256(onboarding_private.token_bytes(value));
$$;
create function onboarding_private.valid_intervals(value jsonb, closed boolean)
returns boolean language plpgsql immutable set search_path='' as $$
declare item jsonb; start_value integer; end_value integer; previous_end integer := -1;
begin
 if value is null or closed is null or jsonb_typeof(value)<>'array' then return false; end if;
 if jsonb_array_length(value)>8 or (closed and jsonb_array_length(value)>0) then return false; end if;
 for item in select entry from jsonb_array_elements(value) entry order by (entry->>'start_minute')::numeric nulls first loop
  if jsonb_typeof(item)<>'object' or not item ?& array['start_minute','end_minute'] or (select count(*) from jsonb_object_keys(item))<>2
   or jsonb_typeof(item->'start_minute')<>'number' or jsonb_typeof(item->'end_minute')<>'number'
   or (item->>'start_minute')::numeric <> trunc((item->>'start_minute')::numeric)
   or (item->>'end_minute')::numeric <> trunc((item->>'end_minute')::numeric) then return false; end if;
  start_value := (item->>'start_minute')::numeric::integer; end_value := (item->>'end_minute')::numeric::integer;
  if start_value<0 or start_value>1439 or end_value<1 or end_value>1440 or start_value>=end_value or start_value<previous_end then return false; end if;
  previous_end:=end_value;
 end loop;
 return true;
exception when invalid_text_representation or numeric_value_out_of_range then return false;
end; $$;
-- Must receive normalized explicit inputs, with numeric fields rebuilt as SQL integers.
create function onboarding_private.canonical_json(value jsonb)
returns text language plpgsql immutable set search_path='' as $$
declare result text;
begin
 case jsonb_typeof(value)
 when 'object' then
  if exists(select 1 from jsonb_object_keys(value) key where key !~ '^[a-z_]+$') then raise exception 'Unsupported canonical key' using errcode='22023'; end if;
  select '{'||coalesce(string_agg(to_jsonb(key)::text||':'||onboarding_private.canonical_json(val),',' order by key collate "C"),'')||'}' into result from jsonb_each(value) as fields(key,val);
 when 'array' then select '['||coalesce(string_agg(onboarding_private.canonical_json(val),',' order by ordinal),'')||']' into result from jsonb_array_elements(value) with ordinality as items(val,ordinal);
 else result := value::text;
 end case;
 return result;
end; $$;
create table public.tenant_setup_state (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), flow_version text not null default 'onboarding-v1' check(flow_version='onboarding-v1'), config_revision integer not null check(config_revision between 1 and 2147483647), unique(tenant_id), check(version=config_revision)
);
create table public.tenant_business_profiles (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), business_contact_name text not null check(onboarding_private.valid_text(business_contact_name,0,160)), business_email text check(onboarding_private.valid_email(business_email)), business_phone text check(onboarding_private.valid_phone(business_phone)), unique(tenant_id)
);
create table public.tenant_services (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), name text not null check(onboarding_private.valid_text(name,0,120)), description text not null check(onboarding_private.valid_text(description,0,2000)), enabled boolean not null, position integer not null check(position between 0 and 9999)
);
create table public.tenant_hours_days (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), weekday integer not null check(weekday between 0 and 6), closed boolean not null, intervals jsonb not null check(onboarding_private.valid_intervals(intervals,closed)), unique(tenant_id,weekday)
);
create table public.tenant_hours_exceptions (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), local_date date not null check(local_date between date '0001-01-01' and date '9999-12-31'), closed boolean not null, intervals jsonb not null check(onboarding_private.valid_intervals(intervals,closed)), active boolean not null, unique(tenant_id,local_date)
);
create table public.tenant_booking_preferences (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), mode text not null default 'request_only' check(mode='request_only'), lead_time_minutes integer check(lead_time_minutes between 0 and 525600), buffer_before_minutes integer check(buffer_before_minutes between 0 and 1440), buffer_after_minutes integer check(buffer_after_minutes between 0 and 1440), horizon_days integer check(horizon_days between 1 and 730), notes text not null check(onboarding_private.valid_text(notes,0,2000)), acknowledged boolean not null, unique(tenant_id)
);
create table public.tenant_escalation_contacts (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), label text not null check(onboarding_private.valid_text(label,0,120)), contact_name text not null check(onboarding_private.valid_text(contact_name,0,160)), email text check(onboarding_private.valid_email(email)), phone text check(onboarding_private.valid_phone(phone)), enabled boolean not null, position integer not null check(position between 0 and 9999)
);
create table public.tenant_setup_resume (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), user_id uuid not null, flow_version text not null default 'onboarding-v1' check(flow_version='onboarding-v1'), step_id text not null check(step_id in ('access','profile','services','hours','booking','escalation','integrations','review')), unique(tenant_id,user_id)
);

-- Historic actors intentionally have no Auth cascade. They are derived by future guarded commands.
create table onboarding_private.invitations (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants(id),
 version integer not null default 1 check(version between 1 and 2147483647),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 created_by uuid, updated_by uuid, unique(tenant_id,id), recipient_user_id uuid not null, recipient_email text not null
 check(onboarding_private.valid_email(recipient_email) and recipient_email=lower(recipient_email)),
 intended_role public.app_role not null, token_digest bytea not null unique check(octet_length(token_digest)=32),
 status text not null default 'pending' check(status in ('pending','accepted','revoked')),
 expires_at timestamptz not null check(isfinite(expires_at) and expires_at>created_at),
 creation_request_id uuid not null, accepted_by uuid, accepted_at timestamptz, revoked_by uuid, revoked_at timestamptz,
 delivery_status text not null default 'not_requested' check(delivery_status='not_requested'),
 unique(tenant_id,creation_request_id),
 check((accepted_by is null)=(accepted_at is null)), check((revoked_by is null)=(revoked_at is null)),
 check(accepted_by is null or accepted_by=recipient_user_id),
 check(accepted_at is null or (isfinite(accepted_at) and accepted_at>=created_at)),
 check(revoked_at is null or (isfinite(revoked_at) and revoked_at>=created_at and (accepted_at is null or revoked_at>=accepted_at))),
 check((status='pending' and accepted_at is null and revoked_at is null) or
       (status='accepted' and accepted_at is not null and revoked_at is null) or
       (status='revoked' and revoked_at is not null))
);
create index onboarding_invite_recipient_idx on onboarding_private.invitations(tenant_id,recipient_user_id,status);
create index onboarding_invite_expiry_idx on onboarding_private.invitations(tenant_id,status,expires_at);
create table onboarding_private.receipts (
 tenant_id uuid not null references public.tenants(id), actor_user_id uuid not null,
 contract_version text not null default 'onboarding-v1' check(contract_version='onboarding-v1'),
 command text not null check(command in ('save_business_profile','replace_services','replace_weekly_hours','upsert_hours_exception','remove_hours_exception','save_booking_preferences','replace_escalation_contacts','save_resume_step','invite_accept')),
 request_id uuid not null, input_digest bytea not null check(octet_length(input_digest)=32),
 result_id uuid, target_date date check(target_date between date '0001-01-01' and date '9999-12-31'),
 result_version integer check(result_version between 1 and 2147483647),
 config_revision integer check(config_revision between 0 and 2147483647),
 intended_role public.app_role, accepted_at timestamptz, created_at timestamptz not null default now(),
 primary key(tenant_id,actor_user_id,command,request_id),
 foreign key(tenant_id,result_id) references public.tenant_hours_exceptions(tenant_id,id),
 check(
  (command='invite_accept' and result_id is null and target_date is null and result_version is null and config_revision is null and intended_role is not null and accepted_at is not null and isfinite(accepted_at))
  or (command in ('upsert_hours_exception','remove_hours_exception') and target_date is not null and result_version is not null and config_revision is not null and config_revision=result_version and intended_role is null and accepted_at is null and (command<>'upsert_hours_exception' or result_id is not null))
  or (command not in ('invite_accept','upsert_hours_exception','remove_hours_exception') and result_id is null and target_date is null and result_version is not null and config_revision is not null and intended_role is null and accepted_at is null and (command='save_resume_step' or config_revision=result_version))
 ),
 invitation_id uuid,
 foreign key(tenant_id,invitation_id) references onboarding_private.invitations(tenant_id,id),
 resume_id uuid,
 foreign key(tenant_id,resume_id) references public.tenant_setup_resume(tenant_id,id),
 check((command='invite_accept')=(invitation_id is not null)),
 check((command='save_resume_step')=(resume_id is not null))
);
-- No evidence policy/checker is approved. No evidence table or writer is invented here.
-- A singleton reservation explicitly records the blocked policy, never verified status.
create table onboarding_private.readiness_policy (
 tenant_id uuid primary key references public.tenants(id),
 policy_state text not null default 'not_evaluated' check(policy_state='not_evaluated'),
 reason text not null default 'setup_policy_pending' check(reason='setup_policy_pending')
);
create index onboarding_services_order_idx on public.tenant_services(tenant_id,enabled,position,id);
create index onboarding_escalation_order_idx on public.tenant_escalation_contacts(tenant_id,enabled,position,id);
create index onboarding_resume_user_idx on public.tenant_setup_resume(user_id,tenant_id);

create function onboarding_private.guard_identity()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.id<>old.id or new.tenant_id<>old.tenant_id or new.created_at<>old.created_at or new.created_by is distinct from old.created_by then raise exception 'Immutable onboarding identity' using errcode='23514'; end if;
 if TG_TABLE_NAME='tenant_hours_days' and (to_jsonb(new)->'weekday')<>(to_jsonb(old)->'weekday') then raise exception 'Immutable weekday' using errcode='23514'; end if;
 if TG_TABLE_NAME='tenant_hours_exceptions' and (to_jsonb(new)->'local_date')<>(to_jsonb(old)->'local_date') then raise exception 'Immutable local date' using errcode='23514'; end if;
 if TG_TABLE_NAME='tenant_setup_resume' and (to_jsonb(new)->'user_id')<>(to_jsonb(old)->'user_id') then raise exception 'Immutable resume actor' using errcode='23514'; end if;
 return new;
end; $$;
create function onboarding_private.guard_invitation()
returns trigger language plpgsql set search_path='' as $$
begin
 if TG_OP='DELETE' then raise exception 'Invitation history retained' using errcode='23514'; end if;
 if TG_OP='INSERT' then
  if new.status<>'pending' then raise exception 'Provision pending invitation' using errcode='23514'; end if;
  -- Cooperative membership lock protocol. Unreviewed Auth/admin cascades remain excluded.
  perform pg_advisory_xact_lock(hashtextextended('membership-v1:'||new.tenant_id::text||':'||new.recipient_user_id::text,0));
  if exists(select 1 from onboarding_private.invitations i where i.tenant_id=new.tenant_id and i.recipient_user_id=new.recipient_user_id and i.status='pending' and i.intended_role<>new.intended_role) then raise exception 'Conflicting pending invitation role' using errcode='23514'; end if;
 else
  if (new.id,new.tenant_id,new.recipient_user_id,new.recipient_email,new.intended_role,new.token_digest,new.expires_at,new.creation_request_id,new.created_at,new.created_by)
     is distinct from (old.id,old.tenant_id,old.recipient_user_id,old.recipient_email,old.intended_role,old.token_digest,old.expires_at,old.creation_request_id,old.created_at,old.created_by)
     or (old.accepted_at is not null and (new.accepted_at,new.accepted_by) is distinct from (old.accepted_at,old.accepted_by))
     or old.status='revoked' or (old.status='accepted' and new.status not in ('accepted','revoked'))
     or new.version<>old.version+1 then raise exception 'Invalid invitation transition' using errcode='23514'; end if;
 end if;
 return new;
end; $$;
create trigger onboarding_invitation_transition before insert or update or delete on onboarding_private.invitations for each row execute function onboarding_private.guard_invitation();
create function onboarding_private.retain_history()
returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Onboarding history retained' using errcode='23514'; end; $$;
create trigger onboarding_receipt_immutable before update or delete on onboarding_private.receipts for each row execute function onboarding_private.retain_history();
create function onboarding_private.guard_receipt_target()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.invitation_id is not null and not exists(select 1 from onboarding_private.invitations i where i.tenant_id=new.tenant_id and i.id=new.invitation_id and i.status='accepted' and i.accepted_by=new.actor_user_id and i.intended_role=new.intended_role and i.accepted_at=new.accepted_at) then raise exception 'Invalid receipt invitation binding' using errcode='23514'; end if;
 if new.result_id is not null and not exists(select 1 from public.tenant_hours_exceptions e where e.tenant_id=new.tenant_id and e.id=new.result_id and e.local_date=new.target_date) then raise exception 'Invalid receipt exception binding' using errcode='23514'; end if;
 if new.resume_id is not null and not exists(select 1 from public.tenant_setup_resume r where r.tenant_id=new.tenant_id and r.id=new.resume_id and r.user_id=new.actor_user_id) then raise exception 'Invalid receipt resume binding' using errcode='23514'; end if;
 return new;
end; $$;
create trigger onboarding_receipt_target before insert on onboarding_private.receipts for each row execute function onboarding_private.guard_receipt_target();

create function onboarding_private.guard_exception_limit()
returns trigger language plpgsql set search_path='' as $$
begin
 perform 1 from public.tenants where id=new.tenant_id for update;
 if (select count(*) from public.tenant_hours_exceptions where tenant_id=new.tenant_id)>=366 then raise exception 'Exception date limit' using errcode='23514'; end if;
 return new;
end; $$;
create trigger onboarding_exception_limit before insert on public.tenant_hours_exceptions for each row execute function onboarding_private.guard_exception_limit();

-- Internal command primitive: caller already authorizes membership BEFORE tenant locks.
-- Do not call twice when a profile command also changes authoritative tenant fields.
create function onboarding_private.advance_revision(target uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare current_revision integer;
begin
 perform 1 from public.tenants where id=target for update;
 if not found then raise exception 'Unknown tenant' using errcode='23503'; end if;
 select config_revision into current_revision from public.tenant_setup_state where tenant_id=target for update;
 if not found then
  insert into public.tenant_setup_state(tenant_id,config_revision,version,created_by,updated_by) values(target,1,1,auth.uid(),auth.uid()); return 1;
 end if;
 if current_revision=2147483647 then raise exception 'Onboarding revision exhausted' using errcode='22003'; end if;
 update public.tenant_setup_state set config_revision=current_revision+1,version=current_revision+1,updated_by=auth.uid() where tenant_id=target;
 return current_revision+1;
end; $$;
alter function onboarding_private.advance_revision(uuid) owner to postgres;
create function onboarding_private.tenant_settings_changed()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not onboarding_private.valid_text(new.name,1,160) or not onboarding_private.valid_text(new.trade,1,80)
 or not exists(select 1 from onboarding_private.timezones where name=new.timezone) then raise exception 'Invalid authoritative setup fields' using errcode='23514'; end if;
 perform onboarding_private.advance_revision(new.id);
 return new;
end; $$;
alter function onboarding_private.tenant_settings_changed() owner to postgres;
create trigger onboarding_settings_revision after update of name,trade,timezone on public.tenants
 for each row when ((old.name,old.trade,old.timezone) is distinct from (new.name,new.trade,new.timezone))
 execute function onboarding_private.tenant_settings_changed();

do $$
declare relation text;
begin
 foreach relation in array array['tenant_setup_state','tenant_business_profiles','tenant_services','tenant_hours_days','tenant_hours_exceptions','tenant_booking_preferences','tenant_escalation_contacts','tenant_setup_resume'] loop
  execute format('alter table public.%I enable row level security',relation);
  execute format('revoke all on public.%I from public,anon,authenticated',relation);
  -- No policies or client table privileges. Future guarded definer projections only.
  execute format('create trigger onboarding_identity before update on public.%I for each row execute function onboarding_private.guard_identity()',relation);
  execute format('create trigger onboarding_retained before delete on public.%I for each row execute function onboarding_private.retain_history()',relation);
  execute format('create trigger onboarding_touch before update on public.%I for each row execute function public.touch_updated_at()',relation);
  execute format('create trigger onboarding_audit after insert or update on public.%I for each row execute function public.record_audit_event()',relation);
 end loop;
 foreach relation in array array['timezones','invitations','receipts','readiness_policy'] loop
  execute format('alter table onboarding_private.%I enable row level security',relation);
  execute format('revoke all on onboarding_private.%I from public,anon,authenticated',relation);
 end loop;
end; $$;
revoke all on all functions in schema onboarding_private from public,anon,authenticated;
-- Do not change project-wide default privileges or existing module grants.
commit;
