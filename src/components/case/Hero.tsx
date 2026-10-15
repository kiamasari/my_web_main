"use client";

import Image from "next/image";
import { useRef } from "react";
import type { ResolvedItem } from "@/lib/media";
import { clamp, easeInOut, usePrefersReducedMotion, useScrollFrame } from "./hooks";
import { MediaBox } from "./Media";

type Props = {
  title: string;
  subtitle: string;
  tags: string[];
  hero: ResolvedItem;
  waves: string[];
};

/**
 * Hero на 2 экрана: снизу поднимаются эллипсы и перекрашивают фон в цвет бренда,
 * а карточка с обложкой вырастает до полного экрана.
 */
export function Hero({ title, subtitle, tags, hero, waves }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const waveRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useScrollFrame(() => {
    const root = rootRef.current;
    const sticky = stickyRef.current;
    const card = cardRef.current;
    const inner = innerRef.current;
    const text = textRef.current;
    if (!root || !sticky || !card || !inner || !text || reduced) return;

    const vh = window.innerHeight;
    const vw = document.documentElement.clientWidth;
    const rect = root.getBoundingClientRect();
    const p = clamp(-rect.top / (rect.height - vh));
    sticky.style.setProperty("--p", p.toFixed(4));

    // Эллипсы: в покое выглядывают снизу размытым свечением, потом по очереди накрывают экран
    const n = waveRefs.current.length;
    waveRefs.current.forEach((el, i) => {
      if (!el) return;
      const local = easeInOut(clamp((p - i * 0.05) / 0.38));
      const startY = vh * (0.86 + i * 0.05);
      const endY = -vh * 0.3;
      const y = startY + (endY - startY) * local;
      const blur = (1 - local) * 48;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      el.style.setProperty("--blur", `${blur.toFixed(1)}px`);
      el.style.zIndex = String(i + 1);
      if (i === n - 1) el.style.opacity = String(clamp(local * 3));
    });

    // Перекраска текста, когда волны дошли до него
    sticky.style.setProperty("--t", clamp((p - 0.12) / 0.18).toFixed(3));

    // Карточка: из блока под текстом → во весь экран
    const textBottom = text.offsetTop + text.offsetHeight;
    const gutter = vw < 640 ? 16 : 24;
    const maxW = Math.min(1232, vw - gutter * 2);
    const s0 = maxW / vw;
    const y0 = Math.max(textBottom + 40, vh * 0.55);
    const c = easeInOut(clamp((p - 0.1) / 0.85));
    const s = s0 + (1 - s0) * c;
    const y = y0 * (1 - c);
    card.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
    // радиус визуально постоянный (компенсируем scale), в конце уходит в 0
    const r = (22 * (1 - clamp((c - 0.85) / 0.15))) / s;
    inner.style.borderRadius = `${r.toFixed(2)}px`;
  }, [reduced]);

  return (
    <section ref={rootRef} className={`hero ${reduced ? "hero--static" : ""}`} aria-label={title}>
      <div ref={stickyRef} className="hero__sticky">
        <div className="hero__waves" aria-hidden="true">
          {waves.map((color, i) => (
            <span
              key={i}
              ref={(el) => {
                waveRefs.current[i] = el;
              }}
              className="hero__wave"
              style={{ background: color, transform: "translate3d(0,100svh,0)" }}
            />
          ))}
        </div>

        <div ref={textRef} className="hero__text">
          <h1 className="hero__title">{title}</h1>
          <p className="hero__subtitle">{subtitle}</p>
          <ul className="hero__tags">
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div ref={cardRef} className="hero__card" style={{ transform: "translate3d(0,60svh,0) scale(.85)" }}>
          <div ref={innerRef} className="hero__card-inner" style={{ borderRadius: 22 }}>
            {hero.type === "image" && hero.src ? (
              <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" />
            ) : hero.type === "video" && hero.src ? (
              <video src={hero.src} autoPlay muted loop playsInline aria-label={hero.alt} />
            ) : (
              <MediaBox item={{ ...hero, ratio: "auto" }} reveal={false} className="media--fill" />
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
