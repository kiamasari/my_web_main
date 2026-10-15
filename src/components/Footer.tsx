"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { AsciiLogo } from "./AsciiLogo";
import { clamp, easeOut, useScrollFrame } from "./case/hooks";

/** Футер: эллипсы поднимаются при доскролле, сверху ссылки, ниже вращающийся ASCII-логотип и контакты */
export function Footer({ waves }: { waves: string[] }) {
  const root = useRef<HTMLElement>(null);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  const logoRef = useRef<HTMLDivElement>(null);

  // Эллипсы выстраиваются «лесенкой» так, чтобы последний (самый тёмный) лёг
  // прямо над логотипом — тогда логотип и контакты всегда на тёмном фоне.
  useScrollFrame(() => {
    const el = root.current;
    const logo = logoRef.current;
    if (!el || !logo) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = easeOut(clamp((vh - r.top) / Math.min(r.height, vh)));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const n = refs.current.length;
    const darkTop = logo.getBoundingClientRect().top - r.top - 48;
    const step = Math.min(90, Math.max(40, darkTop / (n + 1)));
    refs.current.forEach((w, i) => {
      if (!w) return;
      const base = darkTop - (n - 1 - i) * step;
      const lift = reduced ? 0 : (1 - p) * (160 + i * 50);
      w.style.transform = `translate3d(0, ${(base + lift).toFixed(1)}px, 0)`;
    });
  });

  return (
    <footer ref={root} className="footer" id="contact">
      <div className="footer__waves" aria-hidden="true">
        {waves.map((c, i) => (
          <span
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="footer__wave"
            style={{ background: c, transform: "translate3d(0, 100%, 0)" }}
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
