import OrdersTable from "./table";

export default function OrdersPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">Orders</div>
        <div className="text-sm text-white/60">Update statuses, mark delivered manually, track losses.</div>
      </div>
      <OrdersTable />
    </div>
  );
}
