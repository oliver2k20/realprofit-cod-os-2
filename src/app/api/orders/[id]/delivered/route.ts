import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { data: order, error: e1 } = await supabaseAdmin.from("orders").select("id,status,total_price,cogs,shipping_cost,cpa").eq("id", params.id).single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  const real_profit = Number(order.total_price||0)-Number(order.cogs||0)-Number(order.shipping_cost||0)-Number(order.cpa||0);

  const { error: e2 } = await supabaseAdmin.from("orders").update({
    status: "entregado",
    delivered_at: new Date().toISOString(),
    real_profit,
    shipping_loss: 0,
    updated_at: new Date().toISOString(),
  }).eq("id", params.id);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });

  await supabaseAdmin.from("order_status_history").insert({
    order_id: order.id,
    from_status: order.status,
    to_status: "entregado",
    note: null,
  });

  return NextResponse.json({ ok: true });
}
