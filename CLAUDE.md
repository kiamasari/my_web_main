# by.nanava — портфолио (главная + кейс SPOT)

Личный сайт-портфолио дизайнера Руслана Нанава. Две страницы:
- `/` — главная (структура по референсу auraexe.ru: hero с видео, проекты, коллаж «И ещё…», услуги, липкий блок «обо мне», FAQ, контакт, футер);
- `/work/spot` — кейс SPOT (айдентика и мерч BMX-академии): hero с градиентными волнами, липкий аккордеон слева, медиа справа.

Код писался с нуля, с референса взяты только структура и поведение. Чужие тексты, картинки и шрифты в проект не копировать.

## Команды

```bash
npm install        # зависимости
npm run dev        # dev-сервер на :3000 (Turbopack)
npm run build      # продакшн-сборка + проверка типов — запускать перед каждым коммитом
npm run start      # запуск собранной версии
npm run lint       # tsc --noEmit
```

Node ≥ 20.9. Деплой — Vercel, импорт из GitHub, настройки по умолчанию (Root Directory пустой).

## Стек

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 (почти не используется, стили в обычном CSS).
Библиотек анимации нет — и не добавлять их без причины.

## Структура

```
src/
  app/
    layout.tsx           шрифты (Onest Variable + Shantell Sans из @fontsource), метаданные
    globals.css          токены, стили кейса, футер, заглушки
    home.css             стили главной (префикс h-)
    page.tsx             главная (server component, резолвит картинки)
    work/spot/page.tsx   кейс SPOT
  content/
    site.ts              контакты, ссылки, бренд — общие для всего сайта
    home.ts              ВСЕ тексты/списки/цвета главной (заглушки помечены «ЗАГЛУШКА»)
    cases/spot.ts        тексты, тема и блоки кейса SPOT
    types.ts             типы кейса и раскладок медиа
  lib/
    ticker.ts            общий rAF-цикл скролл-анимаций со сглаживанием (subscribe/measure/render)
    media.ts             поиск картинок в /public по имени (resolveIn / resolveItem / resolveCase)
  components/
    case/                кейс: Hero, CaseBody (аккордеон), MediaLayouts, Media (MediaBox + заглушка)
    home/                главная: HomeHero, Projects, More, Services, About, Faq, Contact, HomeDock
    Footer.tsx           футер с волнами (tone="dark" | "light")
    AsciiLogo.tsx        вращающаяся 3D-надпись из символов
    Dock.tsx             плавающая панель кейса
public/
  home/                  hero.mp4 / hero.webm / hero-poster.jpg + картинки главной
  work/spot/             hero.jpg + картинки кейса
```

## Как устроено (важно при правках)

- **Контент отделён от вёрстки.** Тексты, проекты, услуги, FAQ, цвета — только в `src/content/*`. Компоненты получают данные пропсами.
- **Картинки без правки кода.** `resolveIn(folder, item)` ищет `public/<folder>/<file>.{webp,avif,jpg,jpeg,png,gif,svg,mp4,webm}`. Нет файла — рисуется заглушка с подписью и ожидаемым путём.
- **Скролл-анимации** — только через `subscribe()` из `lib/ticker.ts`: в `measure()` читаем DOM (offsetTop/offsetHeight, вызывается на старте и при ресайзе), в `render()` только пишем `transform`/CSS-переменные. Никаких `getBoundingClientRect` в кадре — это главная причина лагов.
- **Появление блоков** (`.reveal`, `.h-pcard-wrap`) — чистый CSS scroll-driven animations (`animation-timeline: view()`), без JS. В браузерах без поддержки блоки просто видны.
- Анимируем только `transform` и `opacity`. Без `filter: blur` и `backdrop-filter` на анимируемых или больших слоях — мягкие градиенты делаются `radial-gradient`.
- Уважать `prefers-reduced-motion`.
- **Видео в hero главной:** фон доведён до чистого #FFF, петля склеена кроссфейдом, на сайте `mix-blend-mode: multiply` + маска с мягкими краями. Новое видео готовить командой из README (раздел «Главная страница»), иначе будет виден край кадра.
- **Шрифты:** seasonSans и comico (как на референсе) — коммерческие, их файлов в проекте нет; слоты `@font-face` закомментированы в начале `globals.css`. Сейчас работают Onest и Shantell Sans.

## Подводные камни

- `next.config.ts`: `allowedDevOrigins` открывает dev-сервер по IP в локальной сети — без этого Next 16 блокирует JS в dev и анимации «умирают». `agentRules: false` — чтобы `next dev` не генерировал AGENTS.md.
- После изменений проверять обе страницы на 1440 и 390 px, консоль без ошибок, `npm run build` проходит.
- Заглушки в контенте помечены `ЗАГЛУШКА` — `grep -rn ЗАГЛУШКА src/content` покажет всё, что ещё нужно заполнить.

## Стиль общения

Пользователь — дизайнер, пишет по-русски. Отвечать по-русски, коротко, без жаргона; к правкам вёрстки и анимаций относиться внимательно — это главный критерий качества.
