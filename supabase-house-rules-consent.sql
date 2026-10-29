-- Local release source. No existing booking, content or profile is rewritten.
-- Consent and the original booking/cancellation operation share one transaction.
begin;

create unique index if not exists booking_rules_consent_version_unique
on public.booking_events(booking_id,event_type,(metadata->>'version'))
where event_type in('house_rules_accepted','cancellation_rules_accepted');

create or replace function private.lumi_check_rules_consent(p_accepted boolean,p_version text)
returns void language plpgsql immutable set search_path='' as $$
begin
  if p_accepted is distinct from true or p_version is distinct from '2026-10-29-v1' then
    raise exception 'Fogadd el az aktuális házirendet vagy lemondási feltételeket. Szükség esetén frissítsd az oldalt.' using errcode='22023';
  end if;
end;
$$;
revoke all on function private.lumi_check_rules_consent(boolean,text) from public,anon,authenticated,service_role;

create or replace function private.lumi_record_rules_consent(p_booking_id uuid,p_scope text,p_version text,p_channel text)
returns void language plpgsql security definer set search_path='' as $$
begin
  insert into public.booking_events(booking_id,event_type,channel,status,title,message,metadata)
  values(p_booking_id,case when p_scope='booking' then 'house_rules_accepted' else 'cancellation_rules_accepted' end,
    p_channel,'info',case when p_scope='booking' then 'Házirend elfogadva' else 'Lemondási feltételek elfogadva' end,
    'A vendég az aktuális feltételeket külön jelölőnégyzettel elfogadta.',jsonb_build_object('version',p_version,'scope',p_scope))
  on conflict do nothing;
end;
$$;
revoke all on function private.lumi_record_rules_consent(uuid,text,text,text) from public,anon,authenticated,service_role;

create or replace function public.create_booking_with_rules(
  p_request_key uuid,p_service_id uuid,p_customer_name text,p_customer_phone text,p_customer_email text,p_note text,p_starts_at timestamptz,
  p_coupon_id uuid default null,p_coupon_code text default null,p_customer_user_id uuid default null,
  p_rules_accepted boolean default false,p_rules_version text default ''
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_booking_id uuid;
begin
  perform private.lumi_check_rules_consent(p_rules_accepted,p_rules_version);
  if p_customer_user_id is null then
    v_booking_id:=public.create_booking_idempotent(p_request_key,p_service_id,p_customer_name,p_customer_phone,p_customer_email,p_note,p_starts_at,p_coupon_id,p_coupon_code);
  else
    v_booking_id:=public.create_booking_idempotent_for_user(p_request_key,p_service_id,p_customer_name,p_customer_phone,p_customer_email,p_note,p_starts_at,p_customer_user_id,p_coupon_id,p_coupon_code);
  end if;
  perform private.lumi_record_rules_consent(v_booking_id,'booking',p_rules_version,'booking');
  return v_booking_id;
end;
$$;
revoke all on function public.create_booking_with_rules(uuid,uuid,text,text,text,text,timestamptz,uuid,text,uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.create_booking_with_rules(uuid,uuid,text,text,text,text,timestamptz,uuid,text,uuid,boolean,text) to service_role;

create or replace function public.cancel_my_booking_with_rules(p_booking_id uuid,p_note text default '',p_rules_accepted boolean default false,p_rules_version text default '')
returns table(success boolean,result text,message text) language plpgsql security definer set search_path='' as $$
declare v record;
begin
  perform private.lumi_check_rules_consent(p_rules_accepted,p_rules_version);
  -- The original function still checks verified authentication and booking ownership.
  select * into v from public.cancel_my_booking(p_booking_id,p_note);
  if v.success then perform private.lumi_record_rules_consent(p_booking_id,'cancellation',p_rules_version,'customer_account');end if;
  return query select v.success,v.result,v.message;
end;
$$;
revoke all on function public.cancel_my_booking_with_rules(uuid,text,boolean,text) from public,anon,authenticated;
grant execute on function public.cancel_my_booking_with_rules(uuid,text,boolean,text) to authenticated;
-- An authenticated guest must not bypass the checkbox through the former public entrypoint.
revoke all on function public.cancel_my_booking(uuid,text) from public,anon,authenticated;

create or replace function public.cancel_booking_verified_with_rules(p_reference text,p_contact text,p_note text default '',p_rules_accepted boolean default false,p_rules_version text default '')
returns table(success boolean,result text,message text) language plpgsql security definer set search_path='' as $$
declare v record;v_booking_id uuid;
begin
  perform private.lumi_check_rules_consent(p_rules_accepted,p_rules_version);
  -- Keep the existing two-identifier verification, cancellation window and e-mail queue behavior.
  select * into v from public.cancel_booking_by_verified_contact(p_reference,p_contact,p_note);
  if v.success then
    select b.id into strict v_booking_id from public.bookings b
    where (upper(replace(b.public_reference,'-',''))=upper(regexp_replace(trim(coalesce(p_reference,'')),'[^a-zA-Z0-9]','','g'))
      or upper(replace(coalesce(b.legacy_public_reference,''),'-',''))=upper(regexp_replace(trim(coalesce(p_reference,'')),'[^a-zA-Z0-9]','','g')))
      and private.lumi_booking_contact_matches(b.customer_email,b.customer_phone,p_contact)
    limit 1;
    perform private.lumi_record_rules_consent(v_booking_id,'cancellation',p_rules_version,'self_service');
  end if;
  return query select v.success,v.result,v.message;
end;
$$;
revoke all on function public.cancel_booking_verified_with_rules(text,text,text,boolean,text) from public,anon,authenticated;
grant execute on function public.cancel_booking_verified_with_rules(text,text,text,boolean,text) to service_role;

commit;
