import Blacklist from "./table";

export default function BlacklistPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">Blacklist</div>
        <div className="text-sm text-white/60">Block repeat offenders by phone.</div>
      </div>
      <Blacklist />
    </div>
  );
}
