import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!).update(raw).digest("hex");
  if (sig !== req.headers.get("x-paystack-signature")) return NextResponse.json({ ok: false }, { status: 401 });
  const event = JSON.parse(raw);
  if (event.event === "charge.success") await supabaseAdmin().from("payments").update({ status: "success" }).eq("reference", event.data.reference);
  return NextResponse.json({ ok: true });
}
