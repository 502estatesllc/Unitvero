import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import crypto from 'crypto';

const ALLOWED_CATEGORIES = new Set(['general', 'account', 'payments', 'maintenance', 'privacy', 'technical']);
const ALLOWED_PRIORITIES = new Set(['low', 'normal', 'high', 'urgent']);
const ALLOWED_SOURCES = new Set(['dashboard', 'support-page', 'tenant-portal']);

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

function buildReferenceNumber() {
  return `UV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function sendEmailIfConfigured({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.UNITVERO_SUPPORT_EMAIL;

  if (!apiKey || !to || !fromAddress) return;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Unitvero Support <${fromAddress}>`,
        to: [to],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      console.warn('Support email notification failed:', await response.text());
    }
  } catch (error) {
    console.warn('Support email notification error:', error);
  }
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: 'Support is not configured yet.' }, { status: 503 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: 'Please sign in to view support tickets.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ tickets: data || [] });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject || '').trim();
  const category = String(body.category || 'general').trim();
  const description = String(body.description || '').trim();

  if (!subject || !description) {
    return Response.json({ error: 'Subject and description are required.' }, { status: 400 });
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return Response.json({ error: 'Unsupported support category.' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    return Response.json({ error: 'Support is not configured yet.' }, { status: 503 });
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return Response.json({ error: 'Please sign in to create a support ticket.' }, { status: 401 });
  }

  const userId = user.id;
  const email = user.email || '';

  const isStaff = Boolean((await supabase.from('support_staff').select('id').eq('user_id', user.id).eq('active', true).maybeSingle()).data);
  const requestedPriority = String(body.priority || 'normal').trim();
  const resolvedPriority = isStaff && ALLOWED_PRIORITIES.has(requestedPriority)
    ? requestedPriority
    : 'normal';
  const resolvedSource = ALLOWED_SOURCES.has(String(body.source || 'support-page').trim())
    ? String(body.source || 'support-page').trim()
    : 'support-page';

  const adminSupabase = getAdminSupabase();
  const targetSupabase = adminSupabase || supabase;

  const boundedAiContext = (() => {
    const raw = body.aiContext;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

    const summary = typeof raw.summary === 'string' ? raw.summary.slice(0, 1200).trim() : '';
    const page = typeof raw.page === 'string' ? raw.page.slice(0, 200).trim() : '';
    const context = {};

    if (summary) context.summary = summary;
    if (page) context.page = page;

    return Object.keys(context).length ? context : null;
  })();

  const ticketPayload = {
    user_id: userId,
    email,
    subject,
    category,
    description,
    status: 'open',
    priority: resolvedPriority,
    source: resolvedSource,
    reference_number: buildReferenceNumber(),
    ai_context: boundedAiContext,
    assigned_to: null,
  };

  const { data: ticket, error } = await targetSupabase
    .from('support_tickets')
    .insert(ticketPayload)
    .select('*')
    .single();

  if (error || !ticket) {
    return Response.json({ error: error?.message || 'Unable to create a support ticket.' }, { status: 400 });
  }

  const initialMessage = boundedAiContext && boundedAiContext.summary
    ? `Escalated from AI support:\n${boundedAiContext.summary}`
    : description;

  await targetSupabase.from('support_messages').insert({
    ticket_id: ticket.id,
    sender_role: 'user',
    sender_user_id: userId,
    sender_email: email || null,
    message: initialMessage,
  });

  const supportAddress = process.env.UNITVERO_SUPPORT_EMAIL;

  if (supportAddress && process.env.RESEND_API_KEY) {
    try {
      await sendEmailIfConfigured({
        to: supportAddress,
        subject: `New support ticket: ${ticket.reference_number}`,
        text: `A new support ticket was created.\n\nReference: ${ticket.reference_number}\nSubject: ${subject}\nCategory: ${category}\nUser: ${email || 'anonymous'}\n\nDescription:\n${description}`,
      });

      if (email) {
        await sendEmailIfConfigured({
          to: email,
          subject: `Unitvero support ticket ${ticket.reference_number}`,
          text: `Your support ticket has been created.\n\nReference: ${ticket.reference_number}\nStatus: Open\n\nWe will reply in the app and by email when staff responds.`,
        });
      }
    } catch (err) {
      console.warn('Support email notification failed:', err);
    }
  }

  return Response.json({
    success: true,
    ticket,
    message: 'Support ticket created.',
  });
}
