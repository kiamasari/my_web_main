// ─────────────────────────────────────────────────────────────
//  Общие данные сайта: контакты, ссылки, подпись.
//  Всё, что помечено «ЗАГЛУШКА», замени на свои данные.
// ─────────────────────────────────────────────────────────────

export const site = {
  /** Короткое имя / бренд — используется в title, футере и ASCII-логотипе */
  brand: "by.nanava",
  /** Полное имя для метаданных */
  author: "Руслан Нанава",
  /** Адрес сайта без слэша на конце — нужен для og:url и canonical */
  url: "https://by-nanava.vercel.app", // ЗАГЛУШКА — поменяй, если будет другой домен

  /** Ссылки в футере («connect with me:») */
  links: [
    { label: "Telegram", href: "https://t.me/your_username" }, // ЗАГЛУШКА
    { label: "Behance", href: "https://www.behance.net/your_profile" }, // ЗАГЛУШКА
    { label: "PDF", href: "/portfolio.pdf" }, // ЗАГЛУШКА — положи файл в /public/portfolio.pdf
  ],

  /** Кнопка «contact» в плавающей панели снизу */
  contactHref: "https://t.me/your_username", // ЗАГЛУШКА

  email: "hello@example.com", // ЗАГЛУШКА
  location: "Таиланд", // ЗАГЛУШКА — город/страна для футера
  /** Куда ведут «Все кейсы» и стрелка «назад» */
  allCasesHref: "/#projects",
} as const;

export type Site = typeof site;
