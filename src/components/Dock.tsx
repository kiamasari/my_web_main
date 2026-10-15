"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

/** Плавающая панель снизу: «назад» и «contact». Прячется, когда виден футер. */
export function Dock() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("contact");
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), {
      rootMargin: "0px 0px -35% 0px",
    });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <nav className={`dock ${hidden ? "is-hidden" : ""}`} aria-label="Быстрая навигация">
      <a className="dock__back" href={site.allCasesHref} aria-label="Ко всем кейсам">
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M8.5 3.5 2 10l6.5 6.5V12H18V8H8.5V3.5Z" fill="currentColor" />
        </svg>
      </a>
      <a className="dock__contact font-hand" href={site.contactHref} target="_blank" rel="noreferrer">
        contact
      </a>
    </nav>
  );
}
