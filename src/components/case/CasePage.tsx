import type { CSSProperties } from "react";
import type { ResolvedCase } from "@/lib/media";
import { Dock } from "../Dock";
import { Footer } from "../Footer";
import { CaseBody } from "./CaseBody";
import { Hero } from "./Hero";
import { NextCase } from "./NextCase";

/** Шаблон страницы кейса. Любой новый кейс = новый объект в src/content/cases + маршрут. */
export function CasePage({ data }: { data: ResolvedCase }) {
  const t = data.theme;
  const vars = {
    "--bg": t.bg,
    "--accent": t.accent,
    "--on-accent": t.onAccent,
    "--hero-bg": t.heroBg,
    "--ink": t.ink,
  } as CSSProperties;

  return (
    <div style={{ ...vars, background: "var(--bg)" }}>
      {/* фон body в цвет кейса, чтобы не мигал при overscroll */}
      <style>{`body{background:${t.bg}}`}</style>
      <main>
        <Hero title={data.title} subtitle={data.subtitle} tags={data.tags} hero={data.hero} waves={t.heroWaves} />
        <CaseBody sections={data.sections} />
        <NextCase prev={data.prev} next={data.next} />
      </main>
      <Footer waves={t.footerWaves} />
      <Dock />
    </div>
  );
}
