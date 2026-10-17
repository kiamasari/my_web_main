import fs from "node:fs";
import path from "node:path";
import type { CaseStudy, Media, MediaItem } from "@/content/types";

const IMAGE_EXT = ["webp", "avif", "jpg", "jpeg", "png", "gif", "svg"];
const VIDEO_EXT = ["mp4", "webm"];

export type ResolvedItem = MediaItem & {
  /** Публичный путь к найденному файлу или null, если файла нет */
  src: string | null;
  type: "image" | "video" | "placeholder";
  /** Куда класть файл — показывается в заглушке */
  expected: string;
};

export type ResolvedMedia =
  | { kind: "single"; item: ResolvedItem }
  | { kind: "construction"; item: ResolvedItem; extra?: ResolvedItem }
  | { kind: "grid"; wide: ResolvedItem; pair: [ResolvedItem, ResolvedItem] }
  | { kind: "reel"; items: ResolvedItem[] }
  | { kind: "overlay"; base: ResolvedItem; floats: [ResolvedItem, ResolvedItem] }
  | {
      kind: "palette";
      colors: { name: string; hex: string }[];
      fonts: { sans: string; hand: string; phrase: string };
      item?: ResolvedItem;
    };

/** Ищет файл в /public/<folder>/ с любым поддерживаемым расширением (на сервере) */
export function resolveIn(folder: string, item: MediaItem): ResolvedItem {
  const dir = path.join(process.cwd(), "public", folder);
  for (const ext of [...IMAGE_EXT, ...VIDEO_EXT]) {
    const file = `${item.file}.${ext}`;
    if (fs.existsSync(path.join(dir, file))) {
      return {
        ...item,
        src: `/${folder}/${file}`,
        type: VIDEO_EXT.includes(ext) ? "video" : "image",
        expected: `public/${folder}/${file}`,
      };
    }
  }
  return {
    ...item,
    src: null,
    type: "placeholder",
    expected: `public/${folder}/${item.file}.webp`,
  };
}

/** Ищет файл в /public/work/<slug>/ */
export function resolveItem(slug: string, item: MediaItem): ResolvedItem {
  return resolveIn(`work/${slug}`, item);
}

function resolveMedia(slug: string, m: Media): ResolvedMedia {
  const r = (i: MediaItem) => resolveItem(slug, i);
  switch (m.kind) {
    case "single":
      return { kind: "single", item: r(m.item) };
    case "construction":
      return { kind: "construction", item: r(m.item), extra: m.extra && r(m.extra) };
    case "grid":
      return { kind: "grid", wide: r(m.wide), pair: [r(m.pair[0]), r(m.pair[1])] };
    case "reel":
      return { kind: "reel", items: m.items.map(r) };
    case "overlay":
      return { kind: "overlay", base: r(m.base), floats: [r(m.floats[0]), r(m.floats[1])] };
    case "palette":
      return { ...m, item: m.item && r(m.item) };
  }
}

export type ResolvedSection = Omit<CaseStudy["sections"][number], "media"> & {
  media: ResolvedMedia;
};

export function resolveCase(c: CaseStudy) {
  return {
    ...c,
    hero: resolveItem(c.slug, c.hero),
    sections: c.sections.map((s) => ({ ...s, media: resolveMedia(c.slug, s.media) })),
  };
}

export type ResolvedCase = ReturnType<typeof resolveCase>;
