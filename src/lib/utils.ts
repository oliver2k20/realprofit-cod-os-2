import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function money(n: number | string | null | undefined) {
  const v = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(isFinite(v) ? v : 0);
}

export function pct(n: number) {
  return `${(n * 100).toFixed(0)}%`;
}
