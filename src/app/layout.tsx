import type { Metadata, Viewport } from "next";
import "./globals.css";

const DESCRIPCION = "Control de fiado de la tienda: consulta tu deuda con tu número de carnet.";

/**
 * Dirección pública del sitio, necesaria para que la vista previa del enlace
 * (WhatsApp, Facebook) apunte al logo y no a localhost. En Vercel sale sola.
 */
const SITIO =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: "Tienda Doña Goyita",
  description: DESCRIPCION,
  // Para que al compartir el enlace por WhatsApp salga el logo de la tienda.
  // Next toma la imagen de src/app/opengraph-image.png automáticamente.
  openGraph: {
    title: "Tienda Doña Goyita",
    description: DESCRIPCION,
    type: "website",
    locale: "es_BO",
  },
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
