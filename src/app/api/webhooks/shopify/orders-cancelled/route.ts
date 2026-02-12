import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyShopifyHmac, sha256 } from "@/lib/shopify/hmac";

async function getStoreByDomain(shopDomain: string) {
  const { data } = await supabaseAdmin.from("stores").select("*").eq("shop_domain", shopDomain).single();
  return data;
}

export async function POST(req: Request) {
  const shopDomain = req.headers.get("x-shopify-shop-domain") || "";
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const raw = await req.text();

  const store = await getStoreByDomain(shopDomain);
  const secret = store?.shopify_webhook_secret;
  if (!store || !secret) return NextResponse.json({ error: "Store not configured" }, { status: 400 });

  if (!verifyShopifyHmac(raw, hmac, secret)) {
    await supabaseAdmin.from("webhook_events").insert({
      store_id: store.id,
      topic: "orders/cancelled",
      payload_hash: sha256(raw),
      status_code: 401,
      error: "Invalid HMAC",
    });
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  const payload = JSON.parse(raw);
  const shopify_order_id = Number(payload.id);

  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id,status")
    .eq("store_id", store.id)
    .eq("shopify_order_id", shopify_order_id)
    .single();

  if (existing?.id) {
    await supabaseAdmin.from("orders").update({
      status: "cancelado",
      updated_at: new Date().toISOString(),
      real_profit: 0,
      shipping_loss: 0,
    }).eq("id", existing.id);

    await supabaseAdmin.from("order_status_history").insert({
      order_id: existing.id,
      from_status: existing.status,
      to_status: "cancelado",
      note: "Cancelled in Shopify",
    });
  }

  await supabaseAdmin.from("webhook_events").insert({
    store_id: store.id,
    topic: "orders/cancelled",
    payload_hash: sha256(raw),
    status_code: 200,
    error: null,
  });

  return NextResponse.json({ ok: true });
}
