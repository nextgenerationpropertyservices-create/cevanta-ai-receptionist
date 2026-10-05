-- Fictional fixtures. No user credentials, identities, or membership bypass.
insert into public.tenants(id,name,trade,timezone) values
 ('10000000-0000-4000-8000-000000000001','Cevanta Demo HVAC','HVAC','America/New_York'),
 ('10000000-0000-4000-8000-000000000002','Cevanta Demo Plumbing','Plumbing','America/Chicago');
insert into public.customers(id,tenant_id,name,email,phone,notes) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Example Customer One','customer-one@example.invalid',null,'Fictional demonstration record.'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Example Customer Two','customer-two@example.invalid',null,'Fictional isolation fixture.');
insert into public.contacts(tenant_id,customer_id,name,email) values
 ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Example Contact','contact@example.invalid');
insert into public.service_locations(id,tenant_id,customer_id,label,address_line1,city,state,postal_code) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Demo location','123 Example Street','Example City','NY','00000');
insert into public.equipment(tenant_id,service_location_id,name,type,manufacturer,model) values
 ('10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','Demo heat pump','Heat pump','Fictional Manufacturer','DEMO-1');
