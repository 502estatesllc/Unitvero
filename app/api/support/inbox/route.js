import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
      removeAll: () => {},
    },
  });
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: 'Support is not configured yet.' }, { status: 503 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: 'Please sign in to access the support inbox.' }, { status: 401 });
  }

  const { data: staffRecord, error: staffError } = await supabase
    .from('support_staff')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();

  if (staffError || !staffRecord) {
    return Response.json({ error: 'Access denied.' }, { status: 403 });
  }

  const adminSupabase = getAdminSupabase();
  if (!adminSupabase) {
    return Response.json({ error: 'Support staff access is not configured on the server.' }, { status: 503 });
  }

  const { data: tickets, error } = await adminSupabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ tickets: tickets || [] });
}
