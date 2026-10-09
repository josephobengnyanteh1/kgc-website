import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
const KINDS = ["tithe", "offering", "donation", "project", "birthday"];
export async function POST(req: Request) {
  const { email, amount, kind, branch, note, userId } = await req.json();
  const major = Number(amount);
  if (!email || !(major > 0) || !KINDS.includes(kind)) return NextResponse.json({ error: "Enter an email, a positive amount and a giving type." }, { status: 400 });
  const db = supabaseAdmin();
  const { data: b } = await db.from("branches").select("id,currency").eq("slug", branch).single();
  if (!b) return NextResponse.json({ error: "Unknown branch." }, { status: 400 });
  const reference = `kgc_${randomUUID()}`;
  const amount_minor = Math.round(major * 100);
  await db.from("payments").insert({ branch_id: b.id, user_id: userId ?? null, kind, note, amount_minor, currency: b.currency, reference });
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, amount: amount_minor, currency: b.currency, reference, callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${branch}?paid=1` }),
  });
  const json = await res.json();
  if (!json.status) return NextResponse.json({ error: "Paystack could not start this payment." }, { status: 502 });
  return NextResponse.json({ url: json.data.authorization_url });
}
