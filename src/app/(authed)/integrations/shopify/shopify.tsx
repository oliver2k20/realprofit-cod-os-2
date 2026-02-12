"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Store = { id: string; name: string; shop_domain: string|null; };

export default function ShopifyIntegration() {
  const [store, setStore] = useState<Store|null>(null);
  const [shopDomain, setShopDomain] = useState("");
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [msg, setMsg] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/store", { cache: "no-store" });
    const data = await res.json();
    setStore(data.store);
    setShopDomain(data.store?.shop_domain ?? "");
  }

  useEffect(()=>{ load(); }, []);

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/store", {
        method:"POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ shop_domain: shopDomain, shopify_access_token: token || undefined, shopify_webhook_secret: secret || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Saved ✅");
      setToken(""); setSecret("");
      await load();
    } catch (e:any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function registerWebhooks() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/shopify/register-webhooks", { method:"POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`Webhooks registered ✅ (${data.count} created)`);
    } catch (e:any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-panel/55">
        <CardHeader>
          <CardTitle>Shopify Connection</CardTitle>
          <div className="text-xs text-white/55 mt-1">
            Use a Shopify <b>Custom App</b> token (internal).
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-xs text-white/60 mb-1">Shop domain</div>
            <Input value={shopDomain} onChange={(e)=>setShopDomain(e.target.value)} placeholder="mystore.myshopify.com" />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Admin API access token (only paste when updating)</div>
            <Input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="shpat_..." />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Webhook signing secret (only paste when updating)</div>
            <Input value={secret} onChange={(e)=>setSecret(e.target.value)} placeholder="xxxx" />
          </div>

          {msg && <div className="text-sm text-yellow">{msg}</div>}

          <div className="flex gap-2">
            <Button onClick={save} disabled={busy || !shopDomain}>Save</Button>
            <Button variant="secondary" onClick={registerWebhooks} disabled={busy || !store?.shop_domain}>Register Webhooks</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-panel/55">
        <CardHeader>
          <CardTitle>Webhook URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/75">
          <div>Shopify will send events to:</div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs">
            {typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/shopify` : "YOUR_DOMAIN/api/webhooks/shopify"}
          </div>
          <div className="text-xs text-white/55">
            We register specific topics under that path automatically.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
