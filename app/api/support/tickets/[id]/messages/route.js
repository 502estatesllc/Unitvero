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

async function sendUserEmailIfConfigured({ email, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.UNITVERO_SUPPORT_EMAIL || 'support@unitvero.app';

  if (!apiKey || !email) return;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Unitvero Support <${fromAddress}>`,
        to: [email],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      console.warn('Support reply email failed:', await response.text());
    }
  } catch (error) {
    console.warn('Support reply email error:', error);
  }
}

export async function GET(_request, { params }) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: 'Support is not configured yet.' }, { status: 503 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: 'Please sign in to view support ticket details.' }, { status: 401 });
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (ticketError || !ticket) {
    return Response.json({ error: 'Support ticket not found.' }, { status: 404 });
  }

  const allowed = ticket.user_id === user.id || Boolean((await supabase.from('support_staff').select('id').eq('user_id', user.id).eq('active', true).maybeSingle()).data);
  if (!allowed) {
    return Response.json({ error: 'You do not have access to this ticket.' }, { status: 403 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticket.id)
    .order('created_at', { ascending: true });

  if (messagesError) {
    return Response.json({ error: messagesError.message }, { status: 400 });
  }

  return Response.json({ ticket, messages: messages || [] });
}

export async function POST(request, { params }) {
  const body = await request.json().catch(() => ({}));
  const messageText = String(body.message || '').trim();
  const status = String(body.status || '').trim();

  if (!messageText) {
    return Response.json({ error: 'A message is required.' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: 'Support is not configured yet.' }, { status: 503 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: 'Please sign in to send a message.' }, { status: 401 });
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (ticketError || !ticket) {
    return Response.json({ error: 'Support ticket not found.' }, { status: 404 });
  }

  const staffStatus = await supabase.from('support_staff').select('id').eq('user_id', user.id).eq('active', true).maybeSingle();
  const isStaff = Boolean(staffStatus.data);
  const isOwner = ticket.user_id === user.id;

  if (!isStaff && !isOwner) {
    return Response.json({ error: 'You do not have access to this ticket.' }, { status: 403 });
  }

  const nextStatus = status || ticket.status;
  const messageRole = isStaff ? 'staff' : 'user';

  const adminSupabase = getAdminSupabase();
  const targetSupabase = adminSupabase || supabase;

  if (nextStatus && nextStatus !== ticket.status) {
    await targetSupabase
      .from('support_tickets')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', ticket.id);
  }

  const { data: message, error: insertError } = await targetSupabase
    .from('support_messages')
    .insert({
      ticket_id: ticket.id,
      sender_role: messageRole,
      sender_user_id: user.id,
      sender_email: user.email || ticket.email || null,
      message: messageText,
    })
    .select('*')
    .single();

  if (insertError || !message) {
    return Response.json({ error: insertError?.message || 'Message could not be sent.' }, { status: 400 });
  }

  if (isStaff && ticket.email) {
    await sendUserEmailIfConfigured({
      email: ticket.email,
      subject: `Update on your Unitvero support ticket ${ticket.reference_number}`,
      text: `Unitvero support replied to your ticket.\n\nReference: ${ticket.reference_number}\nStatus: ${nextStatus || ticket.status}\n\nMessage:\n${messageText}`,
    });
  }

  return Response.json({ success: true, ticket: { ...ticket, status: nextStatus }, message });
}
