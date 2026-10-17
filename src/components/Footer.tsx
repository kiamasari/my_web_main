"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import { AsciiLogo } from "./AsciiLogo";
import { clamp, docTop, easeOut, subscribe } from "@/lib/ticker";

/**
 * Футер: мягкие эллипсы-градиенты поднимаются при доскролле и уводят фон из цвета бренда
 * в тёмный. Последний (тёмный) слой ложится прямо над логотипом, поэтому
 * ASCII-логотип и контакты всегда на тёмном.
 */
export function Footer({ waves, tone = "dark" }: { waves: string[]; tone?: "dark" | "light" }) {
  const root = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const el = root.current!;
    const logo = logoRef.current!;
    let top = 0,
      h = 1,
      darkTop = 0;
    let last = -1;
    return subscribe({
      measure: () => {
        top = docTop(el);
        h = el.offsetHeight;
        darkTop = docTop(logo) - top - 40;
        last = -1;
      },
      render: ({ y, vh }) => {
        // 0 — футер только показался снизу, 1 — докрутили до конца
        const p = easeOut(clamp((y + vh - top) / Math.min(h, vh)));
        if (p === last) return;
        last = p;
        const n = refs.current.length;
        const step = Math.max(36, Math.min(110, darkTop / (n + 0.5)));
        refs.current.forEach((w, i) => {
          if (!w) return;
          const base = darkTop - (n - 1 - i) * step;
          const lift = (1 - p) * (220 + i * 60);
          w.style.transform = `translate3d(0,${(base + lift).toFixed(1)}px,0)`;
        });
      },
    });
  }, []);

  return (
    <footer ref={root} className={`footer ${tone === "light" ? "footer--light" : ""}`} id="contact">
      <div className="footer__waves" aria-hidden="true">
        {waves.map((c, i) => (
          <span
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="footer__wave"
            style={{ "--c": c, transform: "translate3d(0,100%,0)", zIndex: i + 1 } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="footer__inner">
        <p className="footer__lead font-hand">connect with me:</p>
        <div className="footer__links">
          {site.links.map((l) => (
            <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {l.label}
            </a>
          ))}
        </div>

        <div ref={logoRef} className="footer__logo">
          <AsciiLogo text={site.brand} className="footer__ascii" />
        </div>

        <div className="footer__meta">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span>{site.location}</span>
          <span>
            {site.brand} © {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
