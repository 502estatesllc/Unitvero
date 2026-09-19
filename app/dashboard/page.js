-- ============================================================
-- UNITVERO SECURE CONVERSATION CREATION FIX
-- ============================================================

create or replace function public.unitvero_start_conversation(
  p_tenancy_id uuid,
  p_subject text default 'Tenant conversation'
)
returns public.conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenancy public.tenancies%rowtype;
  v_landlord_id uuid;
  v_existing public.conversations%rowtype;
  v_new public.conversations%rowtype;
begin

  -- Must be signed in
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  -- Load tenancy
  select *
  into v_tenancy
  from public.tenancies
  where id = p_tenancy_id
  limit 1;

  if not found then
    raise exception 'Tenancy not found';
  end if;

  -- Only the connected tenant can use this function
  if v_tenancy.tenant_id is distinct from auth.uid() then
    raise exception 'You do not have access to this tenancy';
  end if;

  -- Get the real landlord from the property
  select landlord_id
  into v_landlord_id
  from public.properties
  where id = v_tenancy.property_id
  limit 1;

  if v_landlord_id is null then
    raise exception 'Landlord could not be found';
  end if;

  -- Return existing conversation instead of creating duplicates
  select *
  into v_existing
  from public.conversations
  where tenancy_id = v_tenancy.id
    and landlord_id = v_landlord_id
  order by created_at asc
  limit 1;

  if found then
    return v_existing;
  end if;

  -- Create conversation using trusted database values
  insert into public.conversations (
    landlord_id,
    property_id,
    tenancy_id,
    subject,
    created_at,
    updated_at
  )
  values (
    v_landlord_id,
    v_tenancy.property_id,
    v_tenancy.id,
    coalesce(nullif(trim(p_subject), ''), 'Tenant conversation'),
    now(),
    now()
  )
  returning *
  into v_new;

  return v_new;

end;
$$;


revoke all
on function public.unitvero_start_conversation(uuid, text)
from public;

grant execute
on function public.unitvero_start_conversation(uuid, text)
to authenticated;


-- Verify function exists
select
  routine_name,
  routine_type,
  'UNITVERO MESSAGING RPC READY' as result
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'unitvero_start_conversation';
