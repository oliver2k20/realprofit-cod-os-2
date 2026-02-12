import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getStoreId() {
  const env = process.env.DEFAULT_STORE_ID;
  if (env) return env;
  const { data } = await supabaseAdmin.from("stores").select("id").limit(1);
  return data?.[0]?.id as string | undefined;
}

export async function GET() {
  const storeId = await getStoreId();
  if (!storeId) return NextResponse.json({ items: [] });
  const { data, error } = await supabaseAdmin.from("blacklist").select("*").eq("store_id", storeId).order("created_at", { ascending: false }).limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const storeId = await getStoreId();
  if (!storeId) return NextResponse.json({ error: "Store not found" }, { status: 400 });

  const body = await req.json();
  const phone = String(body.phone || "").trim();
  if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("blacklist").upsert({
    store_id: storeId,
    phone,
    name: body.name ? String(body.name).slice(0,120) : null,
    reason: body.reason ? String(body.reason).slice(0,240) : null,
    is_active: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
