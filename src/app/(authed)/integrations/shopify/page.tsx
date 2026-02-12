import ShopifyIntegration from "./shopify";

export default function ShopifyPage() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">Integrations</div>
        <div className="text-sm text-white/60">Connect your Shopify store and register webhooks.</div>
      </div>
      <ShopifyIntegration />
    </div>
  );
}
