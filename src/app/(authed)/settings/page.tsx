import SettingsClient from "./settings";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">Settings</div>
        <div className="text-sm text-white/60">Defaults used when orders arrive from Shopify.</div>
      </div>
      <SettingsClient />
    </div>
  );
}
