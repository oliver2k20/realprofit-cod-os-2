import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getStoreId() {
  const env = process.env.DEFAULT_STORE_ID;
  if (env) return env;
  const { data } = await supabaseAdmin.from("stores").select("id").limit(1);
  return data?.[0]?.id as string | undefined;
}

export async function GET(req: Request) {
  const storeId = await getStoreId();
  if (!storeId) return NextResponse.json({ orders: [] });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status")?.trim();

  let query = supabaseAdmin
    .from("orders")
    .select("id,created_at_shopify,order_number,customer_name,phone,city,status,total_price,cogs,shipping_cost,cpa,real_profit,shipping_loss")
    .eq("store_id", storeId)
    .order("created_at_shopify", { ascending: false })
    .limit(300);

  if (status) query = query.eq("status", status);

  if (q) {
    // simple OR-like filtering via ilike on a concatenated search is not available; do multiple and merge
    // We'll do phone/name/order_number ilike with a fallback:
    query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data ?? [] });
}
