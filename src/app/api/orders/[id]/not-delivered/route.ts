import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(()=>({}));
  const reason = String(body.reason || "").slice(0,400);

  const { data: order, error: e1 } = await supabaseAdmin.from("orders").select("id,status,shipping_cost").eq("id", params.id).single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  const shipping_loss = Number(order.shipping_cost||0);

  const { error: e2 } = await supabaseAdmin.from("orders").update({
    status: "no_entregado",
    not_delivered_reason: reason || null,
    real_profit: 0,
    shipping_loss,
    updated_at: new Date().toISOString(),
  }).eq("id", params.id);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });

  await supabaseAdmin.from("order_status_history").insert({
    order_id: order.id,
    from_status: order.status,
    to_status: "no_entregado",
    note: reason || null,
  });

  return NextResponse.json({ ok: true });
}
