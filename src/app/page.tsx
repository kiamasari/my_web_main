import type { CSSProperties } from "react";
import type { Metadata } from "next";
import "./home.css";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { resolveIn } from "@/lib/media";
import { HomeHero } from "@/components/home/HomeHero";
import { Projects } from "@/components/home/Projects";
import { More } from "@/components/home/More";
import { Services } from "@/components/home/Services";
import { About } from "@/components/home/About";
import { Faq } from "@/components/home/Faq";
import { Contact } from "@/components/home/Contact";
import { HomeDock } from "@/components/home/HomeDock";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: `${site.brand} — дизайнер`,
  description: `${home.statement.strong} ${home.statement.soft}`,
  openGraph: { type: "website", locale: "ru_RU", images: [{ url: home.heroVideo.poster }] },
};

export default function Home() {
  // файлы в /public проверяются при рендере: положил картинку — заглушка сменилась на неё
  const r = (folder: string, item: Parameters<typeof resolveIn>[1]) => resolveIn(folder, item);
  const t = home.theme;
  const vars = {
    "--bg": t.bg,
    "--ink": t.ink,
    "--accent": t.accent,
    "--on-accent": t.onAccent,
  } as CSSProperties;

  return (
    <div className="h-page" style={vars}>
      <style>{`body{background:${t.bg};color:${t.ink}}`}</style>
      <main>
        <HomeHero strong={home.statement.strong} soft={home.statement.soft} video={home.heroVideo} />
        <Projects
          label={home.projects.label}
          heading={home.projects.heading}
          items={home.projects.items.map((p) => ({ ...p, cover: r(p.cover.folder, p.cover) }))}
        />
        <More
          heading={home.more.heading}
          text={home.more.text}
          button={home.more.button}
          tiles={home.more.tiles.map((tile) => r("home", tile))}
        />
        <Services
          label={home.services.label}
          heading={home.services.heading}
          cards={home.services.cards.map((c) => ({ ...c, image: r("home", c.image) }))}
          extra={home.services.extra}
        />
        <About {...home.about} photo={r("home", home.about.photo)} />
        <Faq label={home.faq.label} items={home.faq.items} />
        <Contact {...home.contact} photo={r("home", home.contact.photo)} />
      </main>
      <Footer waves={t.footerWaves} tone="light" />
      <HomeDock labels={home.dockLabels} contactHref={site.contactHref} />
    </div>
  );
}
