import type { ResolvedItem } from "@/lib/media";
import { MediaBox } from "../case/Media";

const NUM = ["➊", "➋", "➌", "➍", "➎", "➏", "➐", "➑", "➒", "➓"];

type Card = { title: string; image: ResolvedItem; text: string; list: string[] };

export function Services({
  label,
  heading,
  cards,
  extra,
}: {
  label: string;
  heading: string;
  cards: Card[];
  extra: { title: string; list: string[] };
}) {
  return (
    <section id="services" className="h-services" data-dock="services">
      <h2 className="h-label font-hand">{label}</h2>
      <p className="h-heading h-heading--wide">{heading}</p>
      <div className="h-services__grid">
        {cards.map((c) => (
          <div key={c.title} className="h-scard reveal">
            <h3 className="h-scard__title">{c.title}</h3>
            <MediaBox item={c.image} reveal={false} className="h-scard__img" sizes="370px" />
            <p className="h-scard__text">{c.text}</p>
            <ul className="h-numlist">
              {c.list.map((li, i) => (
                <li key={li}>
                  <span aria-hidden="true">{NUM[i]}</span>
                  {li}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="h-sextra reveal">
          <h3 className="h-sextra__title">{extra.title}</h3>
          <ul className="h-numlist h-numlist--3">
            {extra.list.map((li, i) => (
              <li key={li}>
                <span aria-hidden="true">{NUM[i]}</span>
                {li}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
