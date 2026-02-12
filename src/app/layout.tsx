import "./../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RealProfit COD OS",
  description: "COD operations + profit dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
