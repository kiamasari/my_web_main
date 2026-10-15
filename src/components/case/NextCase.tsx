import Link from "next/link";
import type { CaseLink } from "@/content/types";
import { site } from "@/content/site";

export function NextCase({ prev, next }: { prev?: CaseLink; next?: CaseLink }) {
  return (
    <section className="nextcase" aria-label="Другие кейсы">
      {next && (
        <>
          <p className="nextcase__label font-hand">next case</p>
          <Link className="nextcase__link" href={next.href}>
            {next.title}
            <span aria-hidden="true">→</span>
          </Link>
        </>
      )}
      <div className="nextcase__row">
        {prev && (
          <Link className="pill" href={prev.href}>
            <span aria-hidden="true">←</span> {prev.title}
          </Link>
        )}
        <Link className="pill" href={site.allCasesHref}>
          Все кейсы
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
