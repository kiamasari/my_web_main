"use client";

import { useEffect, useRef, useState } from "react";
import type { ResolvedMedia } from "@/lib/media";
import { clamp, docTop, subscribe } from "@/lib/ticker";
import { MediaBox } from "./Media";

const HALF = "(min-width:1024px) 420px, 50vw";

/** Рендерит медиа секции по типу раскладки */
export function MediaLayout({ media }: { media: ResolvedMedia }) {
  switch (media.kind) {
    case "single":
      return <MediaBox item={media.item} />;

    case "construction":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Board>
            <MediaBox item={media.item} contain reveal={false} sizes="(min-width:1024px) 640px, 90vw" />
          </Board>
          {media.extra && <MediaBox item={media.extra} />}
        </div>
      );

    case "grid":
      return (
        <div className="mgrid">
          <MediaBox item={media.wide} />
          <MediaBox item={media.pair[0]} sizes={HALF} />
          <MediaBox item={media.pair[1]} sizes={HALF} />
        </div>
      );

    case "reel":
      return <Reel media={media} />;

    case "overlay":
      return <Overlay media={media} />;

    case "palette":
      return <Palette media={media} />;
  }
}

/* ── доска с направляющими ── */
function Board({ children }: { children: React.ReactNode }) {
  return (
    <div className="board reveal">
      <i className="board__line board__line--h" style={{ top: "30%" }} />
      <i className="board__line board__line--h" style={{ top: "70%" }} />
      <i className="board__line board__line--v" style={{ left: "12%" }} />
      <i className="board__line board__line--v" style={{ right: "12%" }} />
      <span className="board__label" style={{ left: "calc(12% + 8px)", top: "calc(30% - 20px)" }}>
        x-height
      </span>
      <span className="board__label" style={{ right: "calc(12% + 8px)", top: "calc(70% + 6px)" }}>
        baseline
      </span>
      {children}
    </div>
  );
}

/* ── горизонтальная лента с drag-to-scroll ── */
function Reel({ media }: { media: Extract<ResolvedMedia, { kind: "reel" }> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // перетаскивание мышью
    let down = false,
      startX = 0,
      startLeft = 0,
      moved = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) {
        moved = true;
        el.classList.add("is-dragging");
      }
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.classList.remove("is-dragging");
    };
    const onClick = (e: MouseEvent) => {
      if (moved) e.preventDefault();
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(".reel__item");
    el.scrollBy({ left: dir * ((item?.offsetWidth ?? 300) + 16), behavior: "smooth" });
  };

  return (
    <div>
      <div ref={ref} className="reel" onDragStart={(e) => e.preventDefault()}>
        <div className="reel__track">
          {media.items.map((it) => (
            <div key={it.file} className="reel__item">
              <MediaBox item={it} sizes="380px" />
            </div>
          ))}
        </div>
      </div>
      <div className="reel__nav">
        <button type="button" onClick={() => step(-1)} disabled={edges.start} aria-label="Назад">
          <Arrow dir="left" />
        </button>
        <button type="button" onClick={() => step(1)} disabled={edges.end} aria-label="Вперёд">
          <Arrow dir="right" />
        </button>
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ rotate: dir === "left" ? "180deg" : "0deg" }}>
      <path d="M3 9h11M9.5 4.5 14 9l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── основная картинка + летающие карточки с параллаксом ── */
function Overlay({ media }: { media: Extract<ResolvedMedia, { kind: "overlay" }> }) {
  const root = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);

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
        if (!a.current || !b.current) return;
        const k = clamp((y + vh - top) / (vh + h)) * 2 - 1; // -1…1 пока блок проходит экран
        if (Math.abs(k) >= 1 && a.current.dataset.k === String(Math.sign(k))) return;
        a.current.dataset.k = String(Math.sign(k));
        a.current.style.transform = `translate3d(0,${(-k * 48).toFixed(1)}px,0)`;
        b.current.style.transform = `translate3d(0,${(k * 64).toFixed(1)}px,0)`;
      },
    });
  }, []);

  return (
    <div ref={root} className="overlay">
      <MediaBox item={media.base} />
      <div ref={a} className="overlay__float overlay__float--a">
        <MediaBox item={media.floats[0]} sizes="320px" />
      </div>
      <div ref={b} className="overlay__float overlay__float--b">
        <MediaBox item={media.floats[1]} sizes="280px" />
      </div>
    </div>
  );
}

/* ── палитра и шрифтовая пара ── */
function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function readableOn(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#0E3B52" : "#FFFFFF";
}

function Palette({ media }: { media: Extract<ResolvedMedia, { kind: "palette" }> }) {
  return (
    <div className="palette">
      {media.colors.map((c) => (
        <div key={c.hex} className="swatch reveal" style={{ background: c.hex, color: readableOn(c.hex) }}>
          <span className="swatch__name font-hand">{c.name}</span>
          <div>
            <div className="swatch__hex">{c.hex.toUpperCase()}</div>
            <div className="swatch__meta">RGB {hexToRgb(c.hex).join(" ")}</div>
          </div>
        </div>
      ))}
      <div className="specimen reveal">
        <div className="specimen__aa" aria-hidden="true">
          Аа
        </div>
        <div>
          <span className="specimen__phrase font-hand">{media.fonts.phrase}</span>
          <div className="specimen__meta">
            {media.fonts.sans} — крупная типографика и заголовки
            <br />
            {media.fonts.hand} — короткие фразы и метки
          </div>
        </div>
      </div>
      {media.item && <MediaBox item={media.item} />}
    </div>
  );
}
