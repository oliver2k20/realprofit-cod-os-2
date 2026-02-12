import CallQueue from "./queue";

export default function CallQueuePage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">Call Queue</div>
        <div className="text-sm text-white/60">Focus list: sin_confirmar, llamar_hoy, riesgo.</div>
      </div>
      <CallQueue />
    </div>
  );
}
