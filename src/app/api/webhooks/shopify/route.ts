import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "Shopify webhook base is alive." });
}
