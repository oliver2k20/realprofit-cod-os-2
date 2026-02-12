import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const is_active = Boolean(body.is_active);

  const { error } = await supabaseAdmin.from("blacklist").update({ is_active }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
