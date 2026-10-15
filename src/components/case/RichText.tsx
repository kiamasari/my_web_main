import { Fragment } from "react";

/** Превращает HEX-цвета в тексте (#178EC6) в чипы с образцом цвета */
export function RichText({ text }: { text: string }) {
  const parts = text.replace(/`/g, "").split(/(#[0-9a-fA-F]{6})\b/g);
  return (
    <>
      {parts.map((part, i) =>
        /^#[0-9a-fA-F]{6}$/.test(part) ? (
          <span key={i} className="hex" style={{ ["--c" as string]: part }}>
            <i aria-hidden="true" />
            {part.toUpperCase()}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
