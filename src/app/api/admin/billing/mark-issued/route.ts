import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/billing/requireAdmin";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

// Records that the receipt for a ledger row was issued by hand in the
// external invoicing system (חשבון מהיר), with its number and, optionally,
// a link to the PDF so the learner can open it from their profile.
const Body = z.object({
  document_id: z.string().uuid(),
  doc_number: z.string().trim().min(1).max(40),
  pdf_url: z
    .string()
    .trim()
    .url()
    .max(1000)
    .refine((u) => u.startsWith("https://"), "https only")
    .nullable()
    .optional(),
});

export async function POST(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "מספר קבלה חסר, או קישור לא תקין (רק https)." }, { status: 400 });
  const { document_id, doc_number, pdf_url } = parsed.data;

  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("billing_documents")
    .update({
      status: "issued",
      issued_via: "external_manual",
      doc_number,
      pdf_url: pdf_url ?? null,
      issued_at: now,
      last_error: null,
      updated_at: now,
    })
    .eq("id", document_id)
    .neq("status", "issued")
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "השורה לא נמצאה, או שכבר סומנה כהופקה." }, { status: 409 });

  await supabaseAdmin.from("admin_audit_log").insert({
    admin_profile_id: adminId,
    action: "billing.mark_issued_external",
    target_type: "billing_document",
    target_id: document_id,
    details: { doc_number, amount_ils: data.amount_ils },
  });

  return NextResponse.json({ document: data });
}
