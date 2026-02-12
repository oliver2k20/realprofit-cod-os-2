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
  if (!storeId) return NextResponse.json({ settings: null });
  const { data } = await supabaseAdmin.from("settings").select("*").eq("store_id", storeId).single();
  return NextResponse.json({ settings: data });
}

export async function POST(req: Request) {
  const storeId = await getStoreId();
  if (!storeId) return NextResponse.json({ error: "Store not found" }, { status: 400 });

  const body = await req.json();
  const patch = {
    default_cogs: Number(body.default_cogs ?? 0),
    default_shipping_cost: Number(body.default_shipping_cost ?? 0),
    default_cpa: Number(body.default_cpa ?? 0),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabaseAdmin.from("settings").upsert({ store_id: storeId, ...patch }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ settings: data });
}
