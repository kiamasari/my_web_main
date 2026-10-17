import Link from "next/link";
import type { ResolvedItem } from "@/lib/media";
import { MediaBox } from "../case/Media";

export type ProjectCardData = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  cover: ResolvedItem;
};

/** Сетка избранных проектов: 2 колонки, карточки «падают» на место при скролле (CSS, без JS) */
export function Projects({ label, heading, items }: { label: string; heading: string; items: ProjectCardData[] }) {
  return (
    <section id="projects" className="h-projects" data-dock="projects">
      <h2 className="h-label font-hand">{label}</h2>
      <p className="h-heading">{heading}</p>
      <div className="h-projects__grid">
        {items.map((p, i) => (
          <div key={p.title} className="h-pcard-wrap" style={{ "--i": i } as React.CSSProperties}>
            <Link href={p.href} className="h-pcard" aria-label={`${p.title} — ${p.description}`}>
              <article className="h-pcard__inner">
                <MediaBox item={p.cover} reveal={false} className="h-pcard__media" sizes="(min-width:900px) 640px, 100vw" />
                <div className="h-pcard__shade" aria-hidden="true" />
                <ul className="h-pcard__tags">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="h-pcard__text">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
              </article>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
