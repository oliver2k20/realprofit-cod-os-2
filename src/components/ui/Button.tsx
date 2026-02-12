import { cn } from "@/lib/utils";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"danger" }) {
  const { className, variant="primary", ...rest } = props;
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition border";
  const styles = variant === "primary"
    ? "bg-blueglow/20 border-blueglow/30 hover:bg-blueglow/30"
    : variant === "danger"
    ? "bg-red/15 border-red/30 hover:bg-red/25"
    : "bg-white/5 border-white/10 hover:bg-white/10";
  return <button className={cn(base, styles, className)} {...rest} />;
}
