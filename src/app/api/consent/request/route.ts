import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/serverClient";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { guardianEmail } = (await request.json()) as { guardianEmail?: string };
  if (!guardianEmail?.trim()) {
    return NextResponse.json({ error: "missing guardianEmail" }, { status: 400 });
  }

  const { data: link, error } = await supabase
    .from("guardian_links")
    .insert({ minor_profile_id: user.id, guardian_email: guardianEmail.trim() })
    .select()
    .single();
  if (error || !link) {
    return NextResponse.json({ error: "failed to create consent request" }, { status: 500 });
  }

  await supabase.from("profiles").update({ parental_consent_status: "pending" }).eq("id", user.id);

  return NextResponse.json({ consentToken: link.consent_token });
}
