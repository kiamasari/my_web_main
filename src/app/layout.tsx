import type { Metadata, Viewport } from "next";
import "@fontsource-variable/onest/wght.css";
import "@fontsource/shantell-sans/cyrillic-600.css";
import "@fontsource/shantell-sans/latin-600.css";
import "./globals.css";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.brand, template: `%s · ${site.brand}` },
  description: `${site.author} — коммуникационный дизайн: айдентика, сайты, мерч.`,
};

export const viewport: Viewport = {
  themeColor: "#178EC6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
