import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyShopifyHmac, sha256 } from "@/lib/shopify/hmac";

async function getStoreByDomain(shopDomain: string) {
  const { data } = await supabaseAdmin.from("stores").select("*").eq("shop_domain", shopDomain).single();
  return data;
}

async function getDefaults(storeId: string) {
  const { data } = await supabaseAdmin.from("settings").select("*").eq("store_id", storeId).single();
  return data ?? { default_cogs: 0, default_shipping_cost: 0, default_cpa: 0 };
}

export async function POST(req: Request) {
  const shopDomain = req.headers.get("x-shopify-shop-domain") || "";
  const hmac = req.headers.get("x-shopify-hmac-sha256");
  const raw = await req.text();

  const store = await getStoreByDomain(shopDomain);
  const secret = store?.shopify_webhook_secret;
  if (!store || !secret) {
    return NextResponse.json({ error: "Store not configured" }, { status: 400 });
  }
  const ok = verifyShopifyHmac(raw, hmac, secret);
  if (!ok) {
    await supabaseAdmin.from("webhook_events").insert({
      store_id: store.id,
      topic: "orders/create",
      payload_hash: sha256(raw),
      status_code: 401,
      error: "Invalid HMAC",
    });
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 401 });
  }

  const payload = JSON.parse(raw);
  const defaults = await getDefaults(store.id);

  // Extract minimal fields
  const shopify_order_id = Number(payload.id);
  const order_number = String(payload.name || payload.order_number || "");
  const created_at_shopify = payload.created_at ? new Date(payload.created_at).toISOString() : null;

  const customer_name = payload.customer ? `${payload.customer.first_name ?? ""} ${payload.customer.last_name ?? ""}`.trim() : (payload.shipping_address?.name ?? "");
  const phone = payload.phone || payload.shipping_address?.phone || payload.customer?.phone || null;
  const city = payload.shipping_address?.city || null;
  const address1 = payload.shipping_address?.address1 || null;
  const address2 = payload.shipping_address?.address2 || null;
  const notes = payload.note || null;
  const total_price = Number(payload.total_price || 0);

  // Reincidente / blacklist check
  let status = "sin_confirmar";
  if (phone) {
    const { data: bl } = await supabaseAdmin.from("blacklist").select("id,is_active").eq("store_id", store.id).eq("phone", phone).single();
    if (bl?.is_active) status = "reincidente";
  }

  // Idempotent upsert
  const { data: existing } = await supabaseAdmin.from("orders")
    .select("id")
    .eq("store_id", store.id)
    .eq("shopify_order_id", shopify_order_id)
    .single();

  const baseRow: any = {
    store_id: store.id,
    shopify_order_id,
    order_number,
    created_at_shopify,
    customer_name: customer_name || null,
    phone,
    city,
    address1,
    address2,
    notes,
    total_price,
    cod: true,
    status,
    cogs: Number(defaults.default_cogs ?? 0),
    shipping_cost: Number(defaults.default_shipping_cost ?? 0),
    cpa: Number(defaults.default_cpa ?? 0),
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await supabaseAdmin.from("orders").update(baseRow).eq("id", existing.id);
  } else {
    await supabaseAdmin.from("orders").insert(baseRow);
  }

  await supabaseAdmin.from("webhook_events").insert({
    store_id: store.id,
    topic: "orders/create",
    payload_hash: sha256(raw),
    status_code: 200,
    error: null,
  });

  return NextResponse.json({ ok: true });
}
