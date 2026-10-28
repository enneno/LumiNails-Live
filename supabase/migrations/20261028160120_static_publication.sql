begin;

create schema if not exists private;
create table private.lumi_publications (
    environment text primary key check (environment in ('test', 'live')),
    content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
    claimed_until timestamptz not null,
    requested_at timestamptz not null default now()
);
alter table private.lumi_publications enable row level security;
revoke all on private.lumi_publications from public, anon, authenticated;

create function public.lumi_claim_publication(p_environment text, p_content_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
    if p_environment not in ('test', 'live') or p_content_hash !~ '^[a-f0-9]{64}$' then
        raise exception 'Invalid publication';
    end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lumi-publication-' || p_environment, 0));
    if exists (select 1 from private.lumi_publications where environment = p_environment
        and content_hash = p_content_hash and claimed_until > now()) then return false; end if;
    insert into private.lumi_publications(environment, content_hash, claimed_until)
    values (p_environment, p_content_hash, now() + interval '15 minutes')
    on conflict (environment) do update set content_hash = excluded.content_hash,
        claimed_until = excluded.claimed_until, requested_at = now();
    return true;
end;
$$;

create function public.lumi_publication_state(p_environment text)
returns jsonb language sql security definer set search_path = '' as $$
    select jsonb_build_object('content_hash', content_hash, 'claimed_until', claimed_until)
    from private.lumi_publications where environment = p_environment;
$$;

create function public.lumi_release_publication(p_environment text, p_content_hash text)
returns void language sql security definer set search_path = '' as $$
    update private.lumi_publications set claimed_until = now()
    where environment = p_environment and content_hash = p_content_hash;
$$;

revoke all on function public.lumi_claim_publication(text,text) from public, anon, authenticated;
revoke all on function public.lumi_publication_state(text) from public, anon, authenticated;
revoke all on function public.lumi_release_publication(text,text) from public, anon, authenticated;
grant execute on function public.lumi_claim_publication(text,text) to service_role;
grant execute on function public.lumi_publication_state(text) to service_role;
grant execute on function public.lumi_release_publication(text,text) to service_role;

-- Both CMS records are saved atomically; a stale editor must reload first.
create function public.save_public_site_content(p_content jsonb, p_expected_updated_at timestamptz)
returns timestamptz language plpgsql security invoker set search_path = '' as $$
declare
    previous_version timestamptz;
    new_version timestamptz := clock_timestamp();
begin
    if public.is_lumi_admin() is not true then raise exception 'Not authorized' using errcode = '42501'; end if;
    if jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 2097152 then
        raise exception 'Invalid content';
    end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lumi-site-content', 0));
    select updated_at into previous_version from public.site_settings where key = 'site_content' for update;
    if previous_version is distinct from p_expected_updated_at then
        raise exception 'CONTENT_VERSION_CONFLICT' using errcode = '40001';
    end if;
    if exists (select 1 from public.site_settings where key = 'site_content' and value = p_content) then
        return previous_version;
    end if;
    insert into public.site_settings(key,value,updated_at) values ('site_content',p_content,new_version)
    on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;
    insert into public.site_settings(key,value,updated_at)
    values ('telefon_lathato',jsonb_build_object('visible',coalesce((p_content #>> '{kapcsolat,telefonLathato}')::boolean,true)),new_version)
    on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at;
    return new_version;
end;
$$;
revoke all on function public.save_public_site_content(jsonb,timestamptz) from public, anon;
grant execute on function public.save_public_site_content(jsonb,timestamptz) to authenticated;

alter table public.services add column editor_version timestamptz not null default clock_timestamp();
create function private.lumi_service_editor_version()
returns trigger language plpgsql set search_path = '' as $$
begin
    if (to_jsonb(new) - 'editor_version') is distinct from (to_jsonb(old) - 'editor_version') then
        new.editor_version := clock_timestamp();
    else
        new.editor_version := old.editor_version;
    end if;
    return new;
end;
$$;
create trigger lumi_service_editor_version before update on public.services
for each row execute function private.lumi_service_editor_version();

create function public.save_public_services(p_items jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare
    item jsonb;
    payload jsonb;
    target_id uuid;
    previous_version timestamptz;
begin
    if public.is_lumi_admin() is not true then raise exception 'Not authorized' using errcode = '42501'; end if;
    if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 500
        or octet_length(p_items::text) > 2097152 then raise exception 'Invalid services'; end if;
    if (select count(*) <> count(distinct value->>'id') from jsonb_array_elements(p_items)) then
        raise exception 'Duplicate service';
    end if;
    perform id from public.services where id in (
        select (value->>'id')::uuid from jsonb_array_elements(p_items)
    ) order by id for update;
    for item in select value from jsonb_array_elements(p_items) loop
        target_id := (item->>'id')::uuid;
        payload := item->'payload';
        select editor_version into previous_version from public.services where id = target_id;
        if not found then raise exception 'Service no longer exists'; end if;
        if previous_version is distinct from (item->>'expected_version')::timestamptz then
            raise exception 'CONTENT_VERSION_CONFLICT' using errcode = '40001';
        end if;
        update public.services set name = payload->>'name', description = coalesce(payload->>'description',''),
            price_text = coalesce(payload->>'price_text',''), price_amount = (payload->>'price_amount')::integer,
            price_unit = coalesce(payload->>'price_unit','Ft'), price_suffix = coalesce(payload->>'price_suffix',''),
            duration_minutes = (payload->>'duration_minutes')::integer, sort_order = (payload->>'sort_order')::integer,
            booking_enabled = (payload->>'booking_enabled')::boolean, active = (payload->>'active')::boolean
        where id = target_id and (to_jsonb(services) - 'editor_version') @> payload is not true;
    end loop;
end;
$$;
revoke all on function public.save_public_services(jsonb) from public, anon;
grant execute on function public.save_public_services(jsonb) to authenticated;

commit;
