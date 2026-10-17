import type { ResolvedItem } from "@/lib/media";
import { MediaBox } from "../case/Media";

export function Contact({
  caption,
  photo,
  question,
  button,
}: {
  caption: { name: string; role: string };
  photo: ResolvedItem;
  question: string;
  button: { label: string; href: string };
}) {
  return (
    <section id="hello" className="h-contact" data-dock="contact">
      <div className="h-contact__blob" aria-hidden="true" />
      <div className="h-contact__col">
        <div className="reveal">
          <p className="h-contact__caption">
            <b>{caption.name}</b> — {caption.role}
          </p>
          <MediaBox item={photo} reveal={false} sizes="680px" />
        </div>
        <div className="h-contact__ask reveal">
          <p>{question}</p>
          <a className="h-btn h-btn--lg font-hand" href={button.href} target="_blank" rel="noreferrer">
            {button.label}
          </a>
        </div>
      </div>
    </section>
  );
}
