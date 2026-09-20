import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

const DEFAULT_SUPPORT_EMAIL = process.env.UNITVERO_SUPPORT_EMAIL || "";
const DEFAULT_SUPPORT_MODEL = process.env.OPENAI_SUPPORT_MODEL || "gpt-4o-mini";
const MAX_MESSAGE_LENGTH = 2500;
const MAX_AI_PROMPT_LENGTH = 12000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const RATE_LIMIT_BUCKETS = new Map();

function sanitizeText(value, maxLength = 500) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, maxLength);
}

function buildUserContext({ page } = {}) {
  const metadata = [];

  if (page) metadata.push(`Page: ${sanitizeText(page, 200)}`);

  return metadata.length ? `\n\nContext:\n${metadata.join("\n")}` : "";
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  return "local-client";
}

function checkRateLimit(request, userId) {
  const key = userId || getClientIp(request);
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKETS.get(key) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + RATE_LIMIT_WINDOW_MS - now) / 1000)),
    };
  }

  recent.push(now);
  RATE_LIMIT_BUCKETS.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

function getAuthSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
      removeAll: () => {},
    },
  });
}

async function persistSupportThread({ userId, email, message, assistantReply, source }) {
  if (!userId) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  try {
    const supabase = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const ticketRef = `UV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        email: email || null,
        subject: source === "support-page" ? "Support request" : "Help request",
        category: "general",
        description: message,
        reference_number: ticketRef,
        status: "open",
        priority: "normal",
        source,
        ai_context: { summary: message },
      })
      .select("*")
      .single();

    if (ticketError || !ticket) {
      return null;
    }

    await supabase.from("support_messages").insert([
      {
        ticket_id: ticket.id,
        sender_role: "user",
        sender_user_id: userId,
        sender_email: email || null,
        message,
      },
      {
        ticket_id: ticket.id,
        sender_role: "ai",
        sender_user_id: null,
        sender_email: null,
        message: assistantReply,
      },
    ]);

    return ticket;
  } catch (error) {
    console.error("Support persistence failed:", error);
    return null;
  }
}

async function generateSupportReply({ message, email, page, userRole }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      reply: `I’m not connected to the AI support service yet. If you need a human review, use the representative ticket flow instead.`,
      supportEmail: DEFAULT_SUPPORT_EMAIL || null,
      fallback: true,
    };
  }

  const model = process.env.OPENAI_SUPPORT_MODEL || DEFAULT_SUPPORT_MODEL;
  const safePage = sanitizeText(page, 200);
  const safeEmail = sanitizeText(email, 200);
  const prompt = `You are the Unitvero support assistant. Help users with rental management, payments, maintenance, applications, and account access. Keep answers concise, practical, and human. If the issue needs a human review, tell the user to open a representative ticket or contact support by the configured support email.${buildUserContext({ page: safePage })}\n\nUser message:\n${message}`;

  if (prompt.length > MAX_AI_PROMPT_LENGTH) {
    throw new Error("Support request exceeds the allowed size.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "You are the Unitvero support assistant. Be helpful, concise, and grounded in real product workflows. If the request is account-specific or requires legal/privacy review, tell them to open a representative ticket or use the configured support email.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.35,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI support request failed:", response.status, errorText);

    return {
      reply: "I’m unable to reach the AI support assistant right now. Please use the representative ticket flow for help.",
      supportEmail: DEFAULT_SUPPORT_EMAIL || null,
      fallback: true,
    };
  }

  const data = await response.json();
  const text =
    data?.output_text ||
    data?.output?.flatMap((item) => item?.content || []).map((part) => part?.text || "").join("\n") ||
    "Thanks for reaching out. Please use the representative ticket flow if you need a human review.";

  return {
    reply: String(text).trim() || "Please use the representative ticket flow for a human response.",
    supportEmail: DEFAULT_SUPPORT_EMAIL || null,
    fallback: false,
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawMessage = typeof body.message === "string" ? body.message : "";

    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Support message exceeds the ${MAX_MESSAGE_LENGTH}-character limit.` }, { status: 400 });
    }

    const message = sanitizeText(rawMessage, MAX_MESSAGE_LENGTH);

    if (!message) {
      return NextResponse.json({ error: "A support message is required." }, { status: 400 });
    }

    const page = sanitizeText(body.page, 200);
    const source = sanitizeText(body.source || "dashboard", 100) || "dashboard";

    const rateLimit = checkRateLimit(request, null);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many support requests. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const supabase = getAuthSupabase();
    const { data: { user }, error: userError } = supabase ? await supabase.auth.getUser() : { data: { user: null }, error: null };
    const email = user?.email ? sanitizeText(user.email, 200) : "";
    const userId = user?.id || null;

    const supportResult = await generateSupportReply({
      message,
      email,
      page,
      userRole: "",
    });

    if (userId) {
      await persistSupportThread({
        userId,
        email,
        message,
        assistantReply: supportResult.reply,
        source,
      });
    }

    const responsePayload = {
      ...supportResult,
      supportEmail: supportResult.supportEmail || DEFAULT_SUPPORT_EMAIL || null,
      success: true,
      source,
    };

    if (!supportResult.supportEmail && DEFAULT_SUPPORT_EMAIL) {
      responsePayload.supportEmail = DEFAULT_SUPPORT_EMAIL;
    }

    if (userError) {
      console.warn("Support route auth warning:", userError.message);
    }

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Support route error:", error);
    return NextResponse.json(
      {
        success: false,
        reply: "I’m having trouble with support right now. Please use the representative ticket flow for assistance.",
        supportEmail: DEFAULT_SUPPORT_EMAIL || null,
        fallback: true,
      },
      { status: 500 }
    );
  }
}
