-- Lumi Nails: szolgáltatás kapcsolása a kézzel felvett foglalt időkhöz
-- Biztonságosan újrafuttatható; meglévő bejegyzést nem módosít vagy töröl.

alter table public.blocked_times
    add column if not exists service_id uuid;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'blocked_times_service_id_fkey'
            and conrelid = 'public.blocked_times'::regclass
    ) then
        alter table public.blocked_times
            add constraint blocked_times_service_id_fkey
            foreign key (service_id)
            references public.services(id)
            on delete set null;
    end if;
end
$$;

create index if not exists blocked_times_service_id_idx
    on public.blocked_times (service_id)
    where service_id is not null;

comment on column public.blocked_times.service_id is
    'Optional service selected for a manually added occupied time. No customer email workflow is triggered.';
