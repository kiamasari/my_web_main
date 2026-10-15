import type { Metadata } from "next";
import { CasePage } from "@/components/case/CasePage";
import { spot } from "@/content/cases/spot";
import { resolveCase, resolveItem } from "@/lib/media";
import { site } from "@/content/site";

const hero = resolveItem(spot.slug, spot.hero);

export const metadata: Metadata = {
  title: `${spot.title} — кейс`,
  description: spot.description,
  alternates: { canonical: `/work/${spot.slug}` },
  openGraph: {
    type: "article",
    locale: "ru_RU",
    title: `${spot.title} — кейс ${site.brand}`,
    description: spot.description,
    url: `/work/${spot.slug}`,
    images: hero.src ? [{ url: hero.src, width: 1920, height: 1080 }] : undefined,
  },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  // файлы в /public/work/spot проверяются при каждом рендере (в dev — при обновлении страницы)
  return <CasePage data={resolveCase(spot)} />;
}
