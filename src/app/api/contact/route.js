import { NextResponse } from "next/server";

export const runtime = "nodejs";

const LIMITS = {
  name: 100,
  email: 200,
  subject: 200,
  message: 3500,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (character) => HTML_ESCAPES[character]);
}

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validate(payload) {
  const fields = {
    name: normalize(payload?.name),
    email: normalize(payload?.email),
    subject: normalize(payload?.subject),
    message: normalize(payload?.message),
  };

  if (!fields.name || !fields.email || !fields.subject || !fields.message) {
    return { error: "Please complete every field before sending your message." };
  }

  if (!EMAIL_PATTERN.test(fields.email)) {
    return { error: "Please enter a valid email address." };
  }

  if (fields.message.length < 10) {
    return { error: "Please add a little more detail to your message." };
  }

  for (const [field, limit] of Object.entries(LIMITS)) {
    if (fields[field].length > limit) {
      return { error: "One of the fields is too long. Please shorten it and try again." };
    }
  }

  return { fields };
}

function formatReceivedAt() {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date());
}

function buildMessage({ name, email, subject, message }) {
  return [
    "✨ <b>New Portfolio Inquiry</b>",
    "",
    `<b>Name</b>: ${escapeHtml(name)}`,
    `<b>Email</b>: <code>${escapeHtml(email)}</code>`,
    `<b>Subject:</b>\n${escapeHtml(subject)}`,
    "",
    "<b>Message:</b>",
    `<blockquote>${escapeHtml(message)}</blockquote>`,
    "",
    `<i>${escapeHtml(formatReceivedAt())} · Asia/Dhaka</i>`,
  ].join("\n");
}

function buildReplyMarkup({ email, subject }) {
  const gmailUrl =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(email)}` +
    `&su=${encodeURIComponent(`Re: ${subject}`)}`;

  return {
    inline_keyboard: [
      [
        { text: "✉️ Reply via Gmail", url: gmailUrl },
        { text: "📋 Copy email", copy_text: { text: email } },
      ],
    ],
  };
}

async function sendTelegramMessage(token, body) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const result = await response.json().catch(() => null);

    return {
      ok: response.ok && result?.ok === true,
      status: response.status,
      description: result?.description ?? "",
    };
  } catch {
    return {
      ok: false,
      status: 0,
      description: "Network request failed.",
    };
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { fields, error } = validate(payload);

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const token = normalize(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = normalize(process.env.TELEGRAM_CHAT_ID);

  if (!token || !chatId) {
    return NextResponse.json(
      { error: "Contact service is not configured." },
      { status: 503 }
    );
  }

  const baseMessage = {
    chat_id: chatId,
    text: buildMessage(fields),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  };

  let result = await sendTelegramMessage(token, {
    ...baseMessage,
    reply_markup: buildReplyMarkup(fields),
  });

  if (!result.ok && /button|keyboard|reply markup|copy_text/i.test(result.description)) {
    result = await sendTelegramMessage(token, baseMessage);
  }

  if (!result.ok) {
    console.error("Telegram contact notification failed:", result.description || result.status);
    return NextResponse.json(
      { error: "Message could not be delivered right now." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
