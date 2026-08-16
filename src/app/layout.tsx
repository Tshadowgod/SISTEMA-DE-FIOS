import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cobros Doña Goyita",
  description: "Control de fiado de la tienda: consulta tu deuda con tu número de carnet.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdf8f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-BO">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
