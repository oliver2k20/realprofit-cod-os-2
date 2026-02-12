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
      topic: "orders/updated",
      payload_hash: sha256(raw),
      status_code: 401,
      error: "Invalid HMAC",
    });
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  const payload = JSON.parse(raw);
  const shopify_order_id = Number(payload.id);
  const phone = payload.phone || payload.shipping_address?.phone || payload.customer?.phone || null;
  const customer_name = payload.customer ? `${payload.customer.first_name ?? ""} ${payload.customer.last_name ?? ""}`.trim() : (payload.shipping_address?.name ?? "");
  const city = payload.shipping_address?.city || null;
  const address1 = payload.shipping_address?.address1 || null;
  const address2 = payload.shipping_address?.address2 || null;
  const notes = payload.note || null;
  const total_price = Number(payload.total_price || 0);

  // We do NOT overwrite operational status here (it's managed in our app).
  const { data: existing, error } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("store_id", store.id)
    .eq("shopify_order_id", shopify_order_id)
    .single();

  if (!existing?.id || error) {
    // If order doesn't exist, ignore (or you could create it).
    await supabaseAdmin.from("webhook_events").insert({
      store_id: store.id,
      topic: "orders/updated",
      payload_hash: sha256(raw),
      status_code: 200,
      error: "Order not found; ignored",
    });
    return NextResponse.json({ ok: true });
  }

  await supabaseAdmin.from("orders").update({
    customer_name: customer_name || null,
    phone,
    city,
    address1,
    address2,
    notes,
    total_price,
    updated_at: new Date().toISOString(),
  }).eq("id", existing.id);

  await supabaseAdmin.from("webhook_events").insert({
    store_id: store.id,
    topic: "orders/updated",
    payload_hash: sha256(raw),
    status_code: 200,
    error: null,
  });

  return NextResponse.json({ ok: true });
}
