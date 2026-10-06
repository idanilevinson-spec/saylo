import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/billing/requireAdmin";
import { runBillingAgent } from "@/lib/billing/agent";

// One turn of the back-office billing agent. The admin screen keeps the
// conversation and sends it whole each time — it's a short working session,
// not something worth storing.
const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) }))
    .min(1)
    .max(40),
});

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  try {
    const reply = await runBillingAgent(parsed.data.messages);
    return NextResponse.json(reply);
  } catch (err) {
    console.error("billing agent failed:", err);
    return NextResponse.json({ error: "agent failed" }, { status: 502 });
  }
}
