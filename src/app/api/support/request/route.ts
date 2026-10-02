import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { sendSupportRequestNotification } from "@/lib/notifications/resend";
import { clientIp, ownerKey, supportHash, VISITOR_TOKEN_PATTERN } from "@/lib/support/identity";
import { consumeRateLimit, SUPPORT_LIMITS } from "@/lib/support/rateLimit";
import { isValidEmail, normalizePhone } from "@/lib/support/contact";
import { redactSensitiveNumbers } from "@/lib/support/redact";
import { SUPPORT_CHANNELS, SUPPORT_TOPICS } from "@/lib/support/topics";

const Body = z.object({
  conversationId: z.uuid().nullish(),
  visitorToken: z.string().regex(VISITOR_TOKEN_PATTERN),
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().max(254).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  preferredChannel: z.enum(SUPPORT_CHANNELS),
  topic: z.enum(SUPPORT_TOPICS),
  message: z.string().trim().min(1).max(1000),
  pagePath: z.string().max(200).startsWith("/").nullish(),
  consent: z.literal(true),
  // Honeypot: a field real people never see or fill. Bots that fill every
  // input get a normal-looking success and nothing is stored or sent.
  website: z.string().optional().default(""),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const body = parsed.data;

  if (body.website) return NextResponse.json({ reference: "OK" });

  const email = body.email ? body.email.toLowerCase() : null;
  if (email && !isValidEmail(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  const phone = body.phone ? normalizePhone(body.phone) : null;
  if (body.phone && !phone) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  // The channel they picked must be one we can actually use.
  if (body.preferredChannel === "email" ? !email : !phone) {
    return NextResponse.json({ error: "missing_contact" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const limits = [{ hash: supportHash("ip", clientIp(request)), limit: SUPPORT_LIMITS.requestsPerIp }];
  if (user) limits.push({ hash: supportHash("profile", user.id), limit: SUPPORT_LIMITS.requestsPerProfile });
  if (!(await consumeRateLimit(limits, "request"))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Attach the chat only if it's really this caller's — otherwise a guessed
  // id could pull someone else's transcript into our inbox under a new name.
  let conversation: { id: string; handoff_summary: string | null } | null = null;
  if (body.conversationId) {
    const { data } = await supabaseAdmin
      .from("support_conversations")
      .select("id, handoff_summary")
      .eq("id", body.conversationId)
      .eq("owner_key_hash", ownerKey(user?.id ?? null, body.visitorToken))
      .maybeSingle();
    conversation = data;
  }

  const message = redactSensitiveNumbers(body.message).text;
  const { data: saved, error } = await supabaseAdmin
    .from("support_requests")
    .insert({
      conversation_id: conversation?.id ?? null,
      profile_id: user?.id ?? null,
      name: body.name,
      email,
      phone,
      preferred_channel: body.preferredChannel,
      topic: body.topic,
      message,
      page_path: body.pagePath ?? null,
      consented_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !saved) return NextResponse.json({ error: "server_error" }, { status: 500 });

  // The request is safely stored and visible in the admin screen either
  // way; the email is the nudge, so a failed send doesn't fail the request.
  const emailSent = await sendSupportRequestNotification({
    id: saved.id,
    name: body.name,
    email,
    phone,
    preferredChannel: body.preferredChannel,
    topic: body.topic,
    message,
    aiSummary: conversation?.handoff_summary ?? null,
    pagePath: body.pagePath ?? null,
    signedIn: !!user,
    adminUrl: `${new URL(request.url).origin}/admin/support?request=${saved.id}`,
  });
  if (!emailSent) console.error("support request saved but notification email not sent", saved.id);

  return NextResponse.json({ reference: saved.id.slice(0, 8).toUpperCase() });
}
