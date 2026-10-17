"use client";

import { useState } from "react";

export function Faq({ label, items }: { label: string; items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="h-faq" data-dock="faq">
      <h2 className="h-label font-hand">{label}</h2>
      <div className="h-faq__list">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={it.q} className="reveal">
              <button
                type="button"
                className="h-faq__item"
                aria-expanded={isOpen}
                aria-controls={`faq-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="h-faq__q">
                  {it.q}
                  <i aria-hidden="true" />
                </span>
                <span className="h-faq__a" id={`faq-${i}`} role="region">
                  <span>{it.a}</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
