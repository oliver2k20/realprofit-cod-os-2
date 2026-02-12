import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function ensureStore() {
  const env = process.env.DEFAULT_STORE_ID;
  if (env) {
    const { data } = await supabaseAdmin.from("stores").select("*").eq("id", env).single();
    if (data) return data;
  }
  const { data } = await supabaseAdmin.from("stores").select("*").order("created_at", { ascending: true }).limit(1);
  if (data?.[0]) return data[0];
  const { data: created } = await supabaseAdmin.from("stores").insert({ name: "Main Store" }).select("*").single();
  // also init settings row
  await supabaseAdmin.from("settings").insert({ store_id: created!.id }).select().single();
  return created!;
}

export async function GET() {
  const store = await ensureStore();
  return NextResponse.json({ store });
}

export async function POST(req: Request) {
  const store = await ensureStore();
  const body = await req.json();
  const patch: any = {};
  if (typeof body.shop_domain === "string") patch.shop_domain = body.shop_domain.trim();
  if (typeof body.shopify_access_token === "string") patch.shopify_access_token = body.shopify_access_token.trim();
  if (typeof body.shopify_webhook_secret === "string") patch.shopify_webhook_secret = body.shopify_webhook_secret.trim();

  const { data, error } = await supabaseAdmin.from("stores").update(patch).eq("id", store.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ store: data });
}
