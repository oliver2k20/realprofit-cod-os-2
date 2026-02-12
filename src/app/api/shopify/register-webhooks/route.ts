import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { shopifyRequest } from "@/lib/shopify/adminApi";

async function getStore() {
  const env = process.env.DEFAULT_STORE_ID;
  if (env) {
    const { data } = await supabaseAdmin.from("stores").select("*").eq("id", env).single();
    return data;
  }
  const { data } = await supabaseAdmin.from("stores").select("*").order("created_at", { ascending: true }).limit(1);
  return data?.[0];
}

export async function POST() {
  const store = await getStore();
  if (!store?.shop_domain || !store?.shopify_access_token) {
    return NextResponse.json({ error: "Missing shop_domain or access_token. Save them first in Integrations." }, { status: 400 });
  }
  const base = process.env.APP_BASE_URL;
  if (!base) return NextResponse.json({ error: "Missing APP_BASE_URL env var" }, { status: 400 });

  const topics = [
    { topic: "orders/create", address: `${base}/api/webhooks/shopify/orders-create` },
    { topic: "orders/updated", address: `${base}/api/webhooks/shopify/orders-updated` },
    { topic: "orders/cancelled", address: `${base}/api/webhooks/shopify/orders-cancelled` },
  ];

  let created = 0;
  for (const t of topics) {
    try {
      await shopifyRequest<any>(store.shop_domain, store.shopify_access_token, "/webhooks.json", {
        method: "POST",
        body: JSON.stringify({ webhook: { topic: t.topic, address: t.address, format: "json" } }),
      });
      created += 1;
    } catch (e:any) {
      // If already exists, Shopify returns 422; ignore
      const msg = String(e?.message || "");
      if (!msg.includes("422")) {
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }
  }

  return NextResponse.json({ ok: true, count: created });
}
