"use client";

import { useEffect, useRef } from "react";
import type { ResolvedItem } from "@/lib/media";
import { clamp, docTop, subscribe } from "@/lib/ticker";
import { MediaBox } from "../case/Media";

/**
 * Раскладка коллажа (доли ширины/высоты секции) и скорость параллакса каждой плитки.
 * Верхний ряд уезжает вверх быстрее, нижний — медленнее: при скролле коллаж «раздвигается».
 */
const LAYOUT = [
  // верхняя дуга
  { x: 0.01, y: 0.05, w: 0.15, speed: -110, rot: -5 },
  { x: 0.15, y: -0.02, w: 0.13, speed: -160, rot: 4 },
  { x: 0.3, y: 0.03, w: 0.16, speed: -80, rot: -2 },
  { x: 0.5, y: -0.03, w: 0.13, speed: -140, rot: 3 },
  { x: 0.66, y: 0.04, w: 0.15, speed: -100, rot: -4 },
  { x: 0.83, y: 0.0, w: 0.16, speed: -150, rot: 5 },
  // бока
  { x: -0.02, y: 0.38, w: 0.17, speed: -30, rot: 3 },
  { x: 0.84, y: 0.36, w: 0.17, speed: -40, rot: -3 },
  // нижняя дуга
  { x: 0.02, y: 0.7, w: 0.14, speed: 90, rot: -3 },
  { x: 0.17, y: 0.64, w: 0.17, speed: 130, rot: 4 },
  { x: 0.36, y: 0.72, w: 0.13, speed: 70, rot: -5 },
  { x: 0.51, y: 0.66, w: 0.17, speed: 120, rot: 2 },
  { x: 0.69, y: 0.71, w: 0.14, speed: 80, rot: -2 },
  { x: 0.84, y: 0.66, w: 0.15, speed: 140, rot: 4 },
];

type Props = {
  heading: string;
  text: string;
  button: { label: string; href: string };
  tiles: ResolvedItem[];
};

export function More({ heading, text, button, tiles }: Props) {
  const root = useRef<HTMLElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = root.current!;
    let top = 0,
      h = 1;
    return subscribe({
      measure: () => {
        top = docTop(el);
        h = el.offsetHeight;
      },
      render: ({ y, vh }) => {
        // -1 когда секция внизу экрана, +1 когда ушла вверх
        const k = clamp((y + vh - top) / (vh + h)) * 2 - 1;
        refs.current.forEach((t, i) => {
          if (!t) return;
          const L = LAYOUT[i % LAYOUT.length];
          t.style.transform = `translate3d(0,${(k * L.speed).toFixed(1)}px,0) rotate(${L.rot}deg)`;
        });
      },
    });
  }, []);

  return (
    <section ref={root} className="h-more" aria-label={heading}>
      <div className="h-more__tiles" aria-hidden="true">
        {tiles.map((t, i) => {
          const L = LAYOUT[i % LAYOUT.length];
          return (
            <div
              key={t.file}
              ref={(n) => {
                refs.current[i] = n;
              }}
              className="h-more__tile"
              style={
                {
                  left: `${L.x * 100}%`,
                  top: `${L.y * 100}%`,
                  width: `calc(${L.w * 100}% * var(--k, 1))`,
                  transform: `rotate(${L.rot}deg)`,
                } as React.CSSProperties
              }
            >
              <MediaBox item={t} reveal={false} sizes="240px" />
            </div>
          );
        })}
      </div>
      <div className="h-more__center">
        <h2 className="h-more__title">{heading}</h2>
        <p className="h-more__text">{text}</p>
        <a className="h-btn font-hand" href={button.href} target="_blank" rel="noreferrer">
          {button.label}
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}
