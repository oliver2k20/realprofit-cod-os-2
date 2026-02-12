import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED = new Set(["sin_confirmar","llamar_hoy","confirmado","enviado","entregado","no_entregado","cancelado","riesgo","reincidente"]);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const status = String(body.status || "").trim();
  if (!ALLOWED.has(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { data: order, error: e1 } = await supabaseAdmin.from("orders").select("id,status,total_price,cogs,shipping_cost,cpa").eq("id", params.id).single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  // compute profit/loss
  const delivered = status === "entregado";
  const notDelivered = status === "no_entregado";
  const real_profit = delivered ? (Number(order.total_price||0)-Number(order.cogs||0)-Number(order.shipping_cost||0)-Number(order.cpa||0)) : 0;
  const shipping_loss = notDelivered ? Number(order.shipping_cost||0) : 0;

  const patch: any = {
    status,
    updated_at: new Date().toISOString(),
    real_profit,
    shipping_loss,
  };
  if (delivered) patch.delivered_at = new Date().toISOString();

  const { error: e2 } = await supabaseAdmin.from("orders").update(patch).eq("id", params.id);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });

  await supabaseAdmin.from("order_status_history").insert({
    order_id: order.id,
    from_status: order.status,
    to_status: status,
    note: null,
  });

  return NextResponse.json({ ok: true });
}
