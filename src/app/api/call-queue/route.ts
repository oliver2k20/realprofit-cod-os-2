import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: storeRow } = await supabaseAdmin.from("stores").select("id").limit(1);
  const storeId = process.env.DEFAULT_STORE_ID || storeRow?.[0]?.id;
  if (!storeId) return NextResponse.json({ orders: [] });

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id,customer_name,phone,city,status,call_attempts,order_number,created_at_shopify")
    .eq("store_id", storeId)
    .in("status", ["sin_confirmar","llamar_hoy","riesgo"])
    .order("created_at_shopify", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data ?? [] });
}
