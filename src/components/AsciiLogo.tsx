"use client";

import { useEffect, useRef } from "react";

type Props = {
  text: string;
  /** Секунд на полный оборот */
  period?: number;
  className?: string;
};

/**
 * Объёмная надпись, отрендеренная ASCII-символами: лицевые грани — «#», боковые — «-».
 * Трассировка лучей по экструдированной растровой маске текста, с перспективой.
 * Подстраивается под размер контейнера и ставится на паузу, когда не видна.
 */
export function AsciiLogo({ text, period = 5.6, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const pre = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const box = wrap.current!;
    const out = pre.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DEPTH = 12, LS = 0.5, HS = 0.82, CAMERA = 6, LINE = 1.36;
    let mask = new Uint8Array(0), MW = 0, MH = 0, cols = 0, rows = 0, depth = 0;
    let raf = 0, visible = true, start = 0;

    const family = getComputedStyle(document.body).fontFamily;

    function buildMask(fontPx: number) {
      const c = document.createElement("canvas");
      const g = c.getContext("2d", { willReadFrequently: true })!;
      const font = `800 ${fontPx}px ${family}`;
      g.font = font;
      const ls = fontPx * LS;
      const chars = [...text];
      const widths = chars.map((ch) => g.measureText(ch).width * HS);
      const w = Math.ceil(widths.reduce((a, b) => a + b, 0) + ls * (chars.length - 1)) + 4;
      const h = Math.ceil(fontPx * 1.35) + 4;
      c.width = w;
      c.height = h;
      g.font = font;
      let x = 2;
      const base = Math.round(fontPx) + 2;
      chars.forEach((ch, i) => {
        g.save();
        g.translate(x, base);
        g.scale(HS, 1);
        g.fillText(ch, 0, 0);
        g.restore();
        x += widths[i] + ls;
      });
      const d = g.getImageData(0, 0, w, h).data;
      let top = h, bottom = -1, left = w, right = -1;
      const raw = new Uint8Array(w * h);
      for (let y = 0; y < h; y++)
        for (let xx = 0; xx < w; xx++) {
          const on = d[(y * w + xx) * 4 + 3] > 110 ? 1 : 0;
          raw[y * w + xx] = on;
          if (on) {
            if (y < top) top = y;
            if (y > bottom) bottom = y;
            if (xx < left) left = xx;
            if (xx > right) right = xx;
          }
        }
      MW = right - left + 1;
      MH = bottom - top + 1;
      mask = new Uint8Array(MW * MH);
      for (let y = 0; y < MH; y++)
        for (let xx = 0; xx < MW; xx++) mask[y * MW + xx] = raw[(y + top) * w + xx + left];
    }

    function layout() {
      const bw = box.clientWidth, bh = box.clientHeight;
      const charPx = Math.max(5, Math.min(12, bw / 90));
      out.style.fontSize = charPx + "px";
      out.style.lineHeight = String(LINE);
      const probe = document.createElement("span");
      probe.textContent = "M".repeat(50);
      out.appendChild(probe);
      const cw = probe.getBoundingClientRect().width / 50;
      probe.remove();
      cols = Math.floor(bw / cw);
      rows = Math.floor(bh / (charPx * LINE));
      buildMask(22);
      const fontPx = Math.max(8, Math.round((22 * cols * 0.86) / MW));
      buildMask(fontPx);
      depth = (DEPTH * MW) / 185;
    }

    function render(angle: number) {
      const hW = MW / 2, hH = MH / 2, hD = depth / 2, D = CAMERA * hW;
      const cs = Math.cos(angle), sn = Math.sin(angle), step = 0.45;
      const cx0 = (cols - 1) / 2, cy0 = (rows - 1) / 2;
      const lines: string[] = [];
      for (let r = 0; r < rows; r++) {
        let line = "";
        const sy = r - cy0;
        for (let c = 0; c < cols; c++) {
          const sx = c - cx0;
          const ox = -D * sn, dx = sx * cs + D * sn, oz = -D * cs, dz = -sx * sn + D * cs;
          let t0 = 0, t1 = 4;
          if (Math.abs(dx) > 1e-9) {
            let a = (-hW - ox) / dx, b = (hW - ox) / dx;
            if (a > b) [a, b] = [b, a];
            t0 = Math.max(t0, a);
            t1 = Math.min(t1, b);
          } else if (Math.abs(ox) > hW) { line += " "; continue; }
          if (Math.abs(dz) > 1e-9) {
            let a = (-hD - oz) / dz, b = (hD - oz) / dz;
            if (a > b) [a, b] = [b, a];
            t0 = Math.max(t0, a);
            t1 = Math.min(t1, b);
          } else if (Math.abs(oz) > hD) { line += " "; continue; }
          if (t0 >= t1) { line += " "; continue; }
          const v0 = sy * t0 + hH, v1 = sy * t1 + hH;
          if ((v0 < 0 && v1 < 0) || (v0 >= MH && v1 >= MH)) { line += " "; continue; }
          const dt = step / (Math.hypot(dx, dz, sy) || 1);
          let ch = " ", tp = t0;
          for (let t = t0 + 1e-6; t <= t1; t += dt) {
            const u = (ox + dx * t + hW) | 0, v = Math.floor(sy * t + hH);
            if (v >= 0 && v < MH && u >= 0 && u < MW && mask[v * MW + u]) {
              let lo = tp, hi = t;
              for (let k = 0; k < 6; k++) {
                const m = (lo + hi) / 2;
                const uu = (ox + dx * m + hW) | 0, vv = Math.floor(sy * m + hH);
                const ins = Math.abs(oz + dz * m) <= hD && vv >= 0 && vv < MH && uu >= 0 && uu < MW && mask[vv * MW + uu];
                if (ins) hi = m; else lo = m;
              }
              ch = hD - Math.abs(oz + dz * hi) < step * 0.9 ? "#" : "-";
              break;
            }
            tp = t;
          }
          line += ch;
        }
        lines.push(line);
      }
      out.textContent = lines.join("\n");
    }

    const angleAt = (t: number) => ((t - 2.63) / period) * Math.PI * 2;

    // 30 кадров в секунду достаточно для ASCII и вдвое дешевле
    let lastDraw = 0;
    function tick(now: number) {
      if (!start) start = now;
      if (now - lastDraw >= 33) {
        lastDraw = now;
        render(angleAt((now - start) / 1000));
      }
      raf = visible ? requestAnimationFrame(tick) : 0;
    }

    let cancelled = false;
    const boot = () => {
      if (cancelled) return;
      layout();
      if (reduced) render(angleAt(2.3));
      else raf = requestAnimationFrame(tick);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(boot);

    const ro = new ResizeObserver(() => {
      if (!MW) return;
      layout();
      if (reduced) render(angleAt(2.3));
    });
    ro.observe(box);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      if (visible && !raf && !reduced && MW) raf = requestAnimationFrame(tick);
    });
    io.observe(box);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [text, period]);

  return (
    <div ref={wrap} className={className} role="img" aria-label={text} style={{ display: "grid", placeItems: "center" }}>
      <pre
        ref={pre}
        aria-hidden="true"
        style={{
          margin: 0,
          fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          whiteSpace: "pre",
          userSelect: "none",
          fontVariantLigatures: "none",
          color: "currentColor",
        }}
      />
    </div>
  );
}
