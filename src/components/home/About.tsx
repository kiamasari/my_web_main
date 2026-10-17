"use client";

import { useEffect, useRef } from "react";
import type { ResolvedItem } from "@/lib/media";
import { clamp, docTop, subscribe } from "@/lib/ticker";
import { MediaBox } from "../case/Media";

type Props = {
  photo: ResolvedItem;
  pains: [string, string][];
  goodNews: string;
  heading: string;
  pills: { text: string; color: string }[];
  button: { label: string; href: string };
};

/**
 * Липкий блок на ~2.7 экрана. Пока он прокручивается, текст под фото меняется по шагам:
 *  0…n-1 — по очереди «загораются» строки-боли,
 *  n     — «хорошая новость»,
 *  n+1   — заголовок и плашки.
 * Шаг пишется в data-step, переходы — на CSS.
 */
export function About({ photo, pains, goodNews, heading, pills, button }: Props) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current!;
    let top = 0,
      range = 1;
    let last = -1;
    const steps = pains.length + 2;
    return subscribe({
      measure: ({ vh }) => {
        top = docTop(el);
        range = Math.max(1, el.offsetHeight - vh);
        last = -1;
      },
      render: ({ y }) => {
        const p = clamp((y - top) / range);
        if (img.current) img.current.style.transform = `scale(${(0.94 + p * 0.06).toFixed(4)})`;
        const step = Math.min(steps - 1, Math.floor(p * steps * 0.999));
        if (step !== last) {
          last = step;
          stage.current?.setAttribute("data-step", String(step));
        }
      },
    });
  }, [pains.length]);

  return (
    <section ref={root} id="about" className="h-about" data-dock="about" style={{ "--steps": pains.length + 2 } as React.CSSProperties}>
      <div className="h-about__sticky">
        <div ref={img} className="h-about__photo">
          <MediaBox item={photo} reveal={false} contain sizes="(min-width:1100px) 1027px, 100vw" />
        </div>
        <a className="h-btn h-btn--lg" href={button.href} target="_blank" rel="noreferrer">
          {button.label}
          <svg width="17" height="17" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <div ref={stage} className="h-about__stage" data-step="0" aria-live="polite">
          <div className="h-about__layer h-about__pains">
            {pains.map(([a, b], i) => (
              <p key={i} className="h-about__pain" style={{ "--n": i } as React.CSSProperties}>
                {a} <b>{b}</b>
              </p>
            ))}
          </div>
          <div className="h-about__layer h-about__news">
            <p>{goodNews}</p>
          </div>
          <div className="h-about__layer h-about__final">
            <h3>{heading}</h3>
            <div className="h-about__pills">
              {pills.map((pl) => (
                <span key={pl.text} style={{ background: pl.color }}>
                  {pl.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
