"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsClient() {
  const [cogs, setCogs] = useState("0");
  const [ship, setShip] = useState("0");
  const [cpa, setCpa] = useState("0");
  const [msg, setMsg] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = await res.json();
    setCogs(String(data.settings?.default_cogs ?? 0));
    setShip(String(data.settings?.default_shipping_cost ?? 0));
    setCpa(String(data.settings?.default_cpa ?? 0));
  }
  useEffect(()=>{ load(); }, []);

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method:"POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          default_cogs: Number(cogs||0),
          default_shipping_cost: Number(ship||0),
          default_cpa: Number(cpa||0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg("Saved ✅");
    } catch (e:any) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-xl bg-panel/55">
      <CardHeader>
        <CardTitle>Defaults</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-white/60 mb-1">Default COGS (DOP)</div>
          <Input value={cogs} onChange={(e)=>setCogs(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Default Shipping cost (DOP)</div>
          <Input value={ship} onChange={(e)=>setShip(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Default CPA (DOP)</div>
          <Input value={cpa} onChange={(e)=>setCpa(e.target.value)} />
        </div>
        {msg && <div className="text-sm text-yellow">{msg}</div>}
        <Button onClick={save} disabled={busy}>{busy ? "..." : "Save"}</Button>
      </CardContent>
    </Card>
  );
}
