"use client";

import Image from "next/image";
import type { ResolvedItem } from "@/lib/media";
import { useReveal } from "./hooks";

type Props = {
  item: ResolvedItem;
  /** sizes для next/image */
  sizes?: string;
  className?: string;
  contain?: boolean;
  priority?: boolean;
  reveal?: boolean;
};

/** Картинка / видео / заглушка в контейнере с нужными пропорциями */
export function MediaBox({ item, sizes = "(min-width:1024px) 844px, 100vw", className = "", contain, priority, reveal = true }: Props) {
  const ref = useReveal<HTMLDivElement>(reveal);
  return (
    <div
      ref={ref}
      className={`media ${contain ? "media--contain" : ""} ${reveal ? "reveal" : ""} ${className}`}
      style={{ aspectRatio: item.ratio }}
    >
      {item.type === "image" && item.src && (
        <Image src={item.src} alt={item.alt} fill sizes={sizes} priority={priority} />
      )}
      {item.type === "video" && item.src && (
        <video src={item.src} autoPlay muted loop playsInline preload="metadata" aria-label={item.alt} />
      )}
      {item.type === "placeholder" && <Placeholder item={item} />}
    </div>
  );
}

function Placeholder({ item }: { item: ResolvedItem }) {
  return (
    <div className="ph" role="img" aria-label={`Заглушка: ${item.hint}`}>
      <div className="ph__top">
        <span className="font-hand">заглушка</span>
        <span className="ph__ratio">{item.ratio.replace("/", ":")}</span>
      </div>
      <div>
        <Star />
        <div className="ph__hint" style={{ marginTop: 10 }}>{item.hint}</div>
        <div className="ph__path">{item.expected}</div>
      </div>
    </div>
  );
}

/** Звезда-вспышка, как в айдентике */
export function Star({ className = "ph__star" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0c.6 5.9 2.4 9.3 12 12-9.6 2.7-11.4 6.1-12 12-.6-5.9-2.4-9.3-12-12C9.6 9.3 11.4 5.9 12 0Z"
      />
    </svg>
  );
}
