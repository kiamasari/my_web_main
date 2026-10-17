"use client";

import { useEffect, useState } from "react";

/**
 * Плавающая панель главной: логотип (наверх), подпись текущего раздела, contact.
 * Подпись «перекатывается» при смене раздела; клик по ней ведёт к следующему разделу.
 */
export function HomeDock({ labels, contactHref }: { labels: Record<string, string>; contactHref: string }) {
  const keys = Object.keys(labels);
  const [active, setActive] = useState(keys[0]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const sections = keys
      .map((k) => document.querySelector<HTMLElement>(`[data-dock="${k}"]`))
      .filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.dock!);
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    const footer = document.getElementById("contact");
    const io2 = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { rootMargin: "0px 0px -40% 0px" });
    if (footer) io2.observe(footer);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const idx = keys.indexOf(active);
  const goNext = () => {
    const last = idx >= keys.length - 1;
    if (last) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const next = document.querySelector<HTMLElement>(`[data-dock="${keys[idx + 1]}"]`);
    next?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className={`h-dock ${hidden ? "is-hidden" : ""}`} aria-label="Навигация по странице">
      <button type="button" className="h-dock__logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Наверх">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M12 1c.5 5.4 2.2 8.5 10.5 11-8.3 2.5-10 5.6-10.5 11-.5-5.4-2.2-8.5-10.5-11C9.8 9.5 11.5 6.4 12 1Z" />
        </svg>
      </button>
      <button type="button" className="h-dock__label" onClick={goNext} aria-label={`Раздел: ${labels[active]}. Перейти дальше`}>
        <span className="h-dock__roll">
          {keys.map((k, i) => (
            <span key={k} data-pos={i === idx ? "cur" : i < idx ? "prev" : "next"}>
              {labels[k]}
            </span>
          ))}
          {/* невидимая самая длинная подпись задаёт ширину */}
          <span className="h-dock__sizer" aria-hidden="true">
            {labels[active]}
          </span>
        </span>
      </button>
      <a className="h-dock__contact font-hand" href={contactHref} target="_blank" rel="noreferrer">
        contact
      </a>
    </nav>
  );
}
