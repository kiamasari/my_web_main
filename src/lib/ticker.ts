"use client";

/**
 * Один общий rAF-цикл для всех скролл-анимаций страницы.
 *
 *  • Скролл сглаживается (lerp), поэтому анимации идут плавно даже от «ступенчатого»
 *    колеса мыши — без подмены нативного скролла (как делает Lenis), так что
 *    sticky, якоря и тачпады работают как обычно.
 *  • Подписчики только ПИШУТ стили. Все измерения DOM (offsetTop и т.п.)
 *    делаются заранее в measure() — на старте и при ресайзе, — поэтому в кадре
 *    нет принудительных перерасчётов layout (главная причина лагов).
 *  • Цикл засыпает, когда скролл остановился.
 */

export type Frame = {
  /** сглаженный scrollY */
  y: number;
  /** реальный scrollY */
  rawY: number;
  vw: number;
  vh: number;
};

type Sub = {
  measure?: (f: Frame) => void;
  render: (f: Frame) => void;
};

const LERP = 0.16;
const subs = new Set<Sub>();
let raf = 0;
let started = false;
let reduced = false;
const frame: Frame = { y: 0, rawY: 0, vw: 0, vh: 0 };

function readViewport() {
  frame.vw = document.documentElement.clientWidth;
  frame.vh = window.innerHeight;
  frame.rawY = window.scrollY;
}

function measureAll() {
  readViewport();
  subs.forEach((s) => s.measure?.(frame));
}

function loop() {
  raf = 0;
  frame.rawY = window.scrollY;
  const d = frame.rawY - frame.y;
  frame.y = reduced || Math.abs(d) < 0.25 ? frame.rawY : frame.y + d * LERP;
  subs.forEach((s) => s.render(frame));
  if (frame.y !== frame.rawY) raf = requestAnimationFrame(loop);
}

export function kick() {
  if (!raf) raf = requestAnimationFrame(loop);
}

function start() {
  if (started) return;
  started = true;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced = mq.matches;
  mq.addEventListener("change", () => (reduced = mq.matches));
  readViewport();
  frame.y = frame.rawY;
  window.addEventListener("scroll", kick, { passive: true });
  let t = 0;
  const onResize = () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      measureAll();
      kick();
    }, 60);
  };
  window.addEventListener("resize", onResize);
  // высота страницы меняется (картинки, шрифты) — пересчитываем позиции
  new ResizeObserver(onResize).observe(document.body);
  document.fonts?.ready.then(onResize);
}

/** Подписка. Возвращает функцию отписки. */
export function subscribe(sub: Sub) {
  start();
  subs.add(sub);
  readViewport();
  sub.measure?.(frame);
  sub.render(frame);
  return () => {
    subs.delete(sub);
  };
}

/** Абсолютная позиция элемента относительно документа (без учёта transform) */
export function docTop(el: HTMLElement) {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
