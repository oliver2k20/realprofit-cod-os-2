import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { data: order, error } = await supabaseAdmin.from("orders").select("id,call_attempts").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { error: e2 } = await supabaseAdmin.from("orders").update({
    call_attempts: (order.call_attempts ?? 0) + 1,
    last_call_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", params.id);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
