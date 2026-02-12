"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/call-queue", label: "Call Queue" },
  { href: "/blacklist", label: "Blacklist" },
  { href: "/integrations/shopify", label: "Integrations" },
  { href: "/logs", label: "Logs" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-panel2/60 backdrop-blur px-3 py-4">
      <div className="px-3 pb-4">
        <div className="text-lg font-bold">RealProfit <span className="text-blueglow">COD</span></div>
        <div className="text-xs text-white/60">Operations OS</div>
      </div>
      <nav className="space-y-1">
        {items.map((it) => {
          const active = path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm border border-transparent hover:bg-white/5 hover:border-white/10",
                active && "bg-blueglow/15 border-blueglow/25"
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 px-3 text-xs text-white/50">
        Single-user internal build
      </div>
    </aside>
  );
}
