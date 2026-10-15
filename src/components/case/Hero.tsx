"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ResolvedItem } from "@/lib/media";
import { clamp, docTop, easeInOut, easeInOutQuad, lerp, subscribe } from "@/lib/ticker";
import { MediaBox } from "./Media";

type Props = {
  title: string;
  subtitle: string;
  tags: string[];
  hero: ResolvedItem;
  waves: string[];
};

/** Где лежат верхние края «волн» в начале (доля высоты экрана) — они сразу дают мягкий градиент */
const WAVE_START = [0.26, 0.42, 0.52, 0.66, 0.76];

/**
 * Hero на 2 экрана.
 *  • Фон: мягкие эллипсы-градиенты выглядывают снизу и по мере скролла заливают экран цветом бренда.
 *  • Обложка: из карточки 16:9 под заголовком вырастает во весь экран.
 *    Ширина и высота анимируются раздельно через scale(x, y) с обратным масштабом картинки —
 *    это только transform, без пересчёта layout и перерисовки.
 */
export function Hero({ title, subtitle, tags, hero, waves }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const waveRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current!;
    const sticky = stickyRef.current!;
    const card = cardRef.current!;
    const media = mediaRef.current!;
    const text = textRef.current!;
    let top = 0,
      range = 1,
      textBottom = 0;
    let last = -1;

    return subscribe({
      measure: (f) => {
        top = docTop(root);
        range = Math.max(1, root.offsetHeight - f.vh);
        textBottom = text.offsetTop + text.offsetHeight;
        last = -1;
      },
      render: ({ y, vw, vh }) => {
        const p = clamp((y - top) / range);
        if (p === last) return;
        last = p;

        // ── волны ──
        waveRefs.current.forEach((el, i) => {
          if (!el) return;
          const k = easeInOutQuad(clamp((p - i * 0.045) / 0.62));
          const start = (WAVE_START[i] ?? 0.3 + i * 0.12) * vh;
          const end = -0.45 * vh + i * 0.04 * vh;
          el.style.transform = `translate3d(0,${lerp(start, end, k).toFixed(1)}px,0)`;
        });

        // ── фон и цвет текста ──
        sticky.style.setProperty("--bgk", clamp((p - 0.28) / 0.3).toFixed(3));
        sticky.style.setProperty("--t", clamp((p - 0.16) / 0.2).toFixed(3));

        // ── обложка ──
        const gutter = vw < 640 ? 16 : 24;
        const w0 = Math.min(1100, vw - gutter * 2);
        const h0 = (w0 * 9) / 16;
        const y0 = Math.max(textBottom + 36, vh * 0.6);
        const c = easeInOut(clamp((p - 0.04) / 0.84));
        const W = lerp(w0, vw, c);
        const H = lerp(h0, vh, c);
        const sx = W / vw;
        const sy = H / vh;
        const ty = lerp(y0, 0, c);
        const r = 22 * (1 - clamp((c - 0.82) / 0.18));
        card.style.transform = `translate3d(0,${ty.toFixed(1)}px,0) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;
        // эллиптический радиус компенсирует неравномерный scale — углы остаются круглыми
        card.style.borderRadius = `${(r / sx).toFixed(2)}px / ${(r / sy).toFixed(2)}px`;
        // картинка: снимаем искажение и масштабируем «cover» под видимый размер карточки
        const m = Math.max(sx, sy);
        media.style.transform = `scale(${(m / sx).toFixed(4)},${(m / sy).toFixed(4)})`;
      },
    });
  }, []);

  return (
    <section ref={rootRef} className="hero" aria-label={title}>
      <div ref={stickyRef} className="hero__sticky">
        <div className="hero__waves" aria-hidden="true">
          {waves.map((color, i) => (
            <span
              key={i}
              ref={(el) => {
                waveRefs.current[i] = el;
              }}
              className="hero__wave"
              style={
                {
                  "--c": color,
                  transform: `translate3d(0,${(WAVE_START[i] ?? 0.5) * 100}svh,0)`,
                  zIndex: i + 1,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div ref={textRef} className="hero__text">
          <h1 className="hero__title intro" style={{ "--d": "0ms" } as React.CSSProperties}>
            {title}
          </h1>
          <p className="hero__subtitle intro" style={{ "--d": "90ms" } as React.CSSProperties}>
            {subtitle}
          </p>
          <ul className="hero__tags intro" style={{ "--d": "180ms" } as React.CSSProperties}>
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="hero__card-wrap intro-card">
          <div ref={cardRef} className="hero__card">
            <div ref={mediaRef} className="hero__media">
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
      </div>
    </section>
  );
}
