import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/serverClient";
import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { ownerKey, VISITOR_TOKEN_PATTERN } from "@/lib/support/identity";

const Body = z.object({
  messageId: z.uuid(),
  visitorToken: z.string().regex(VISITOR_TOKEN_PATTERN),
  rating: z.union([z.literal(1), z.literal(-1), z.null()]),
});

// Thumbs up / down on one of the assistant's answers. Only the person the
// conversation belongs to can rate it.
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { messageId, visitorToken, rating } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: message } = await supabaseAdmin
    .from("support_messages")
    .select("id, role, support_conversations!inner(owner_key_hash)")
    .eq("id", messageId)
    .maybeSingle();
  const owner = (message?.support_conversations as unknown as { owner_key_hash: string } | null)?.owner_key_hash;
  if (!message || message.role !== "assistant" || owner !== ownerKey(user?.id ?? null, visitorToken)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await supabaseAdmin.from("support_messages").update({ rating }).eq("id", messageId);
  return NextResponse.json({ ok: true });
}
