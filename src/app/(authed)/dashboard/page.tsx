import { Card, CardHeader, CardContent, CardTitle, CardValue } from "@/components/ui/Card";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { money } from "@/lib/utils";

async function getStoreId() {
  const env = process.env.DEFAULT_STORE_ID;
  if (env) return env;
  const { data } = await supabaseAdmin.from("stores").select("id").limit(1);
  if (data?.[0]?.id) return data[0].id as string;
  const { data: created } = await supabaseAdmin.from("stores").insert({ name: "Main Store" }).select("id").single();
  return created!.id as string;
}

export default async function DashboardPage() {
  const storeId = await getStoreId();

  const since = new Date();
  since.setHours(0,0,0,0);

  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("status,total_price,real_profit,shipping_loss,created_at_shopify")
    .eq("store_id", storeId)
    .gte("created_at_shopify", since.toISOString());

  const total = orders?.length ?? 0;
  const by = (s: string) => orders?.filter(o => o.status === s).length ?? 0;

  const delivered = by("entregado");
  const shipped = by("enviado");
  const confirmed = by("confirmado");
  const pendingCalls = by("sin_confirmar") + by("llamar_hoy") + by("riesgo");
  const cancelled = by("cancelado");
  const notDelivered = by("no_entregado");

  const revenueDelivered = (orders ?? []).filter(o => o.status === "entregado").reduce((a,o)=>a+Number(o.total_price||0),0);
  const aov = delivered ? revenueDelivered / delivered : 0;

  const profitToday = (orders ?? []).reduce((a,o)=>a+Number(o.real_profit||0),0);
  const shippingLosses = (orders ?? []).reduce((a,o)=>a+Number(o.shipping_loss||0),0);

  const confirmationRate = total ? confirmed / total : 0;
  const deliveryRate = (shipped+delivered+notDelivered) ? delivered / (shipped+delivered+notDelivered) : (total? delivered/total:0);

  const cards = [
    { title: "Total Orders (Today)", value: total.toString() },
    { title: "Pending Calls", value: pendingCalls.toString() },
    { title: "Confirmed", value: confirmed.toString() },
    { title: "Shipped", value: shipped.toString() },
    { title: "Delivered", value: delivered.toString() },
    { title: "Cancelled", value: cancelled.toString() },
    { title: "Confirmation Rate", value: `${Math.round(confirmationRate*100)}%` },
    { title: "Delivery Rate", value: `${Math.round(deliveryRate*100)}%` },
    { title: "AOV (Delivered)", value: money(aov) },
    { title: "Real Profit Today", value: money(profitToday) },
    { title: "Shipping Losses", value: money(shippingLosses) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-bold">Dashboard</div>
        <div className="text-sm text-white/60">Today snapshot (based on created_at_shopify)</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.title} className="bg-panel/50">
            <CardHeader>
              <CardTitle>{c.title}</CardTitle>
              <CardValue className="mt-2">{c.value}</CardValue>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
