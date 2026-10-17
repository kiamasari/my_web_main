"use client";

import { useEffect, useRef } from "react";

type Props = {
  strong: string;
  soft: string;
  video: { mp4: string; webm: string; poster: string; alt: string };
};

/**
 * Первый блок: манифест по центру и видео с персонажем.
 * Фон видео доведён до чистого белого (#FFF) ещё при подготовке файла, плюс:
 *  • mix-blend-mode: multiply — белый пиксель видео на белом фоне = фон страницы,
 *    любые остатки шума компрессии растворяются;
 *  • маска с мягкими краями — даже если браузер чуть иначе пересчитает цвета,
 *    граница кадра не видна.
 * Видео ставится на паузу, когда уходит с экрана (экономит батарею и CPU).
 */
export function HomeHero({ strong, soft, video }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section id="top" className="h-hero" data-dock="top">
      <h1 className="h-hero__title">
        <span className="h-hero__strong intro" style={{ "--d": "60ms" } as React.CSSProperties}>
          {strong}
        </span>{" "}
        <span className="h-hero__soft intro" style={{ "--d": "160ms" } as React.CSSProperties}>
          {soft}
        </span>
      </h1>
      <div className="h-hero__stage intro-fade">
        <video
          ref={ref}
          className="h-hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={video.poster}
          aria-label={video.alt}
          disablePictureInPicture
        >
          <source src={video.webm} type="video/webm" />
          <source src={video.mp4} type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
