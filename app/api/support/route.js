import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const DEFAULT_SUPPORT_EMAIL = process.env.UNITVERO_SUPPORT_EMAIL || "support@unitvero.app";
const DEFAULT_SUPPORT_MODEL = process.env.OPENAI_SUPPORT_MODEL || "gpt-4o-mini";

function buildUserContext(body = {}) {
  const metadata = [];

  if (body.page) metadata.push(`Page: ${body.page}`);
  if (body.userRole) metadata.push(`Account role: ${body.userRole}`);
  if (body.email) metadata.push(`Email: ${body.email}`);
  if (body.name) metadata.push(`Name: ${body.name}`);

  return metadata.length ? `\n\nContext:\n${metadata.join("\n")}` : "";
}

async function persistSupportThread({ userId, email, message, assistantReply, source }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  try {
    const supabase = createServerClient(url, serviceKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
        removeAll: () => {},
      },
    });

    const ticketRef = `UV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId || null,
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
        sender_user_id: userId || null,
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
      reply: `I’m not connected to the AI support service yet. Please email ${DEFAULT_SUPPORT_EMAIL} with your issue and a screenshot if available.`,
      supportEmail: DEFAULT_SUPPORT_EMAIL,
      fallback: true,
    };
  }

  const model = process.env.OPENAI_SUPPORT_MODEL || DEFAULT_SUPPORT_MODEL;
  const prompt = `You are the Unitvero support assistant. Help users with rental management, payments, maintenance, applications, and account access. Keep answers concise, practical, and human. If the issue needs a human review, tell the user to email ${DEFAULT_SUPPORT_EMAIL}.${buildUserContext({ page, userRole, email })}\n\nUser message:\n${message}`;

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
            "You are the Unitvero support assistant. Be helpful, concise, and grounded in real product workflows. If the request is account-specific or requires legal/privacy review, tell them to contact the support email.",
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
      reply: `I’m unable to reach the AI support assistant right now. Please email ${DEFAULT_SUPPORT_EMAIL} and include the page you were on and what happened.`,
      supportEmail: DEFAULT_SUPPORT_EMAIL,
      fallback: true,
    };
  }

  const data = await response.json();
  const text =
    data?.output_text ||
    data?.output?.flatMap((item) => item?.content || []).map((part) => part?.text || "").join("\n") ||
    "Thanks for reaching out. Please email support if you need a human review.";

  return {
    reply: String(text).trim() || `Please email ${DEFAULT_SUPPORT_EMAIL} for a human response.`,
    supportEmail: DEFAULT_SUPPORT_EMAIL,
    fallback: false,
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "A support message is required." }, { status: 400 });
    }

    const email = String(body.email || "").trim();
    const page = String(body.page || "").trim();
    const userRole = String(body.userRole || "").trim();
    const source = String(body.source || "dashboard").trim() || "dashboard";

    const supportResult = await generateSupportReply({
      message,
      email,
      page,
      userRole,
    });

    const userId = body.userId || null;
    await persistSupportThread({
      userId,
      email,
      message,
      assistantReply: supportResult.reply,
      source,
    });

    return NextResponse.json({
      ...supportResult,
      success: true,
      source,
    });
  } catch (error) {
    console.error("Support route error:", error);
    return NextResponse.json(
      {
        success: false,
        reply: `I’m having trouble with support right now. Please email ${DEFAULT_SUPPORT_EMAIL} for immediate assistance.`,
        supportEmail: DEFAULT_SUPPORT_EMAIL,
        fallback: true,
      },
      { status: 500 }
    );
  }
}
