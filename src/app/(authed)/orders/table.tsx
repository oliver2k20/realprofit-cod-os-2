"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { money } from "@/lib/utils";

type OrderRow = {
  id: string;
  created_at_shopify: string | null;
  order_number: string | null;
  customer_name: string | null;
  phone: string | null;
  city: string | null;
  status: string;
  total_price: number;
  cogs: number;
  shipping_cost: number;
  cpa: number;
  real_profit: number;
  shipping_loss: number;
};

const STATUS = [
  "sin_confirmar","llamar_hoy","confirmado","enviado","entregado","no_entregado","cancelado","riesgo","reincidente"
];

export default function OrdersTable() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/orders?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    setRows(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows, [rows]);

  async function setOrderStatus(id: string, nextStatus: string) {
    await fetch(`/api/orders/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    await load();
  }

  async function markDelivered(id: string) {
    await fetch(`/api/orders/${id}/delivered`, { method: "POST" });
    await load();
  }

  async function markNotDelivered(id: string) {
    const reason = prompt("Razón (opcional):") ?? "";
    await fetch(`/api/orders/${id}/not-delivered`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    await load();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="w-72">
          <div className="text-xs text-white/60 mb-1">Search</div>
          <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="order #, name, phone..." />
        </div>
        <div className="w-56">
          <div className="text-xs text-white/60 mb-1">Status</div>
          <Select value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="all">All</option>
            {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
      </div>

      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-white/5 text-white/70">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Profit</th>
              <th className="text-right p-3">Loss</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 text-white/70">{r.created_at_shopify ? new Date(r.created_at_shopify).toLocaleString() : "-"}</td>
                <td className="p-3 font-semibold">{r.order_number ?? "-"}</td>
                <td className="p-3">{r.customer_name ?? "-"}</td>
                <td className="p-3 text-white/80">{r.phone ?? "-"}</td>
                <td className="p-3 text-white/70">{r.city ?? "-"}</td>
                <td className="p-3">
                  <span className="rounded-lg border border-white/10 px-2 py-1 bg-white/5">{r.status}</span>
                </td>
                <td className="p-3 text-right">{money(r.total_price)}</td>
                <td className="p-3 text-right">{money(r.real_profit)}</td>
                <td className="p-3 text-right">{money(r.shipping_loss)}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Select value={r.status} onChange={(e)=>setOrderStatus(r.id, e.target.value)} className="w-44">
                      {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                    <Button onClick={()=>markDelivered(r.id)} className="px-3" variant="primary">✅ Delivered</Button>
                    <Button onClick={()=>markNotDelivered(r.id)} className="px-3" variant="danger">❌ Not delivered</Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="p-4 text-white/60" colSpan={10}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
