"use client";

import { useEffect, useRef, useState } from "react";
import type { ResolvedSection } from "@/lib/media";
import { clamp, docTop, subscribe } from "@/lib/ticker";
import { MediaLayout } from "./MediaLayouts";
import { RichText } from "./RichText";

/**
 * Тело кейса: слева залипающий аккордеон (раскрыт пункт активной секции),
 * справа медиа секций. На мобилке аккордеона нет — над каждой секцией текстовая карточка.
 */
export function CaseBody({ sections }: { sections: ResolvedSection[] }) {
  const [active, setActive] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const progressRefs = useRef<(HTMLElement | null)[]>([]);

  // Активная секция — та, что пересекает середину экрана
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = sectionRefs.current.indexOf(e.target as HTMLElement);
            if (i >= 0) setActive(i);
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sectionRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [sections.length]);

  // Полоска прогресса в активной карточке (позиции секций кешируются, в кадре только запись стилей)
  const activeRef = useRef(0);
  activeRef.current = active;
  useEffect(() => {
    let tops: number[] = [];
    let heights: number[] = [];
    return subscribe({
      measure: () => {
        tops = sectionRefs.current.map((el) => (el ? docTop(el) : 0));
        heights = sectionRefs.current.map((el) => el?.offsetHeight ?? 1);
      },
      render: ({ y, vh }) => {
        const i = activeRef.current;
        const bar = progressRefs.current[i];
        if (!bar) return;
        bar.style.setProperty("--sp", clamp((y + vh / 2 - tops[i]) / heights[i]).toFixed(3));
      },
    });
  }, [sections.length]);

  const go = (i: number) => {
    const el = sectionRefs.current[i];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${sections[i].id}`);
  };

  return (
    <section className="case" aria-label="Кейс">
      <div className="case__grid">
        <aside className="case__aside" aria-label="Разделы кейса">
          <nav>
            <ul className="toc">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="toc__btn"
                    aria-current={i === active}
                    aria-controls={s.id}
                    onClick={() => go(i)}
                  >
                    <span className="toc__label font-hand">{s.label}</span>
                    <span className="toc__body">
                      <span>
                        <span className="toc__title">{s.title}</span>
                        <span className="toc__text">
                          <RichText text={s.text} />
                        </span>
                      </span>
                    </span>
                    <span className="toc__progress" aria-hidden="true">
                      <i
                        ref={(el) => {
                          progressRefs.current[i] = el;
                        }}
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="case__content">
          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              aria-labelledby={`${s.id}-title`}
              style={{ scrollMarginTop: 96 }}
            >
              <div className="textcard">
                <p className="textcard__label font-hand">{s.label}</p>
                <h2 id={`${s.id}-title`} className="textcard__title">
                  {s.title}
                </h2>
                <p className="textcard__text">
                  <RichText text={s.text} />
                </p>
              </div>
              <MediaLayout media={s.media} />
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
