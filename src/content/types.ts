// Типы данных кейса. Кейс = обычный объект, страница собирается из него автоматически.

/** Один медиа-файл. Файл ищется в /public/work/<slug>/<file>.{webp,avif,jpg,jpeg,png,gif,mp4,webm}.
 *  Если файла нет — на его месте рисуется аккуратная заглушка с подсказкой. */
export type MediaItem = {
  /** Имя файла без расширения, например "longsleeve-back" */
  file: string;
  /** alt-текст / подпись для скринридеров */
  alt: string;
  /** Что должно быть на картинке — показывается в заглушке */
  hint: string;
  /** Пропорции блока, CSS aspect-ratio: "16/9", "1/1", "4/5"… */
  ratio: string;
};

/** Варианты раскладки медиа справа от текста */
export type Media =
  /** Одна большая картинка */
  | { kind: "single"; item: MediaItem }
  /** Доска с направляющими (для логотипа) + опционально ещё одна картинка под ней */
  | { kind: "construction"; item: MediaItem; extra?: MediaItem }
  /** Широкая картинка сверху + две под ней */
  | { kind: "grid"; wide: MediaItem; pair: [MediaItem, MediaItem] }
  /** Горизонтальная лента (постеры, ролики), вылезает за правый край */
  | { kind: "reel"; items: MediaItem[] }
  /** Основная картинка + две «летающие» карточки с параллаксом */
  | { kind: "overlay"; base: MediaItem; floats: [MediaItem, MediaItem] }
  /** Палитра + шрифтовая пара + картинка */
  | {
      kind: "palette";
      colors: { name: string; hex: string }[];
      fonts: { sans: string; hand: string; phrase: string };
      item?: MediaItem;
    };

export type CaseSection = {
  /** id для якоря (#logo) */
  id: string;
  /** Маленькая рукописная метка */
  label: string;
  title: string;
  /** Текст. HEX-цвета вида #178EC6 автоматически превращаются в «чипы» с образцом цвета */
  text: string;
  media: Media;
};

export type CaseTheme = {
  /** Фон страницы после hero */
  bg: string;
  /** Акцент: метки, стрелки, кнопка contact */
  accent: string;
  /** Цвет текста на акценте */
  onAccent: string;
  /** Светлый фон в начале hero */
  heroBg: string;
  /** Цвет заголовка на светлом фоне */
  ink: string;
  /** Цвета эллипсов-«волн» в hero (снизу вверх). Последний должен совпадать с bg */
  heroWaves: string[];
  /** Цвета эллипсов в футере. Последний — самый тёмный, на нём контакты */
  footerWaves: string[];
};

export type CaseLink = { title: string; href: string };

export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  tags: string[];
  /** Короткое описание для <meta description> */
  description: string;
  hero: MediaItem;
  theme: CaseTheme;
  sections: CaseSection[];
  prev?: CaseLink;
  next?: CaseLink;
};
