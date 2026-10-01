/**
 * Renders a DriveImage (from src/lib/drive.js `toImage`).
 *
 * - reserves space from the image's real dimensions (no layout shift)
 * - lazy-loads and fades in
 * - `fit="contain"` shows the whole image (letterboxed) — use for mixed
 *   portrait/landscape sets that must not be cropped
 * - `fit="cover"` fills the box (may crop)
 */

import { useState } from "react";

export default function DriveImage({
  image,
  fit = "cover",
  className = "",
  imgClassName = "",
  sizes,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);

  if (!image?.src) {
    return <div className={`bg-sand-200 ${className}`} {...rest} />;
  }

  const ratio =
    image.width && image.height ? `${image.width} / ${image.height}` : undefined;

  return (
    <div
      className={`overflow-hidden bg-sand-200 ${className}`}
      style={ratio && !className.includes("aspect-") ? { aspectRatio: ratio } : undefined}
      {...rest}
    >
      <img
        src={image.src}
        alt={image.alt || ""}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        width={image.width || undefined}
        height={image.height || undefined}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full transition-opacity duration-700 ${
          fit === "contain" ? "object-contain" : "object-cover"
        } ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
      />
    </div>
  );
}
