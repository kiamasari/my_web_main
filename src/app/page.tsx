import Link from "next/link";
import { MediaBox } from "@/components/case/Media";
import { spot } from "@/content/cases/spot";
import { site } from "@/content/site";
import { resolveCase } from "@/lib/media";

// Простая главная со списком кейсов — нужна, чтобы работали ссылки «Все кейсы» и «назад».
// Если страница кейса переедет в основной сайт, этот файл можно не переносить.
const caseList = [spot];

export default function Home() {
  const cases = caseList.map(resolveCase);
  return (
    <main className="home">
      <h1 className="home__title">{site.brand}</h1>
      <div id="projects" className="home__grid">
        {cases.map((c) => (
          <Link key={c.slug} href={`/work/${c.slug}`} className="home__card">
            <MediaBox item={c.hero} reveal={false} sizes="(min-width:900px) 600px, 100vw" priority />
            <h2>{c.title}</h2>
            <p>{c.subtitle}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
