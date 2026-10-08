/**
 * An <img> that automatically retries a list of fallback URLs when one
 * fails to load.
 *
 * Two real, confirmed causes this guards against:
 *
 * 1. Referer-triggered blocking: by default a cross-origin <img> sends a
 *    `Referer` header identifying this site. Google's Drive image CDN
 *    responds differently (sometimes with a mismatched Content-Type) to
 *    requests referred from some origins — notably `localhost` during dev —
 *    which Chrome's Opaque Response Blocking (ORB) then correctly refuses to
 *    render, surfacing as `net::ERR_BLOCKED_BY_ORB`. `referrerPolicy="no-referrer"`
 *    below (confirmed by direct testing to fix this) avoids it entirely —
 *    there's no need for Drive to see this site's URL to serve a public image.
 * 2. A single Drive URL *shape* can independently be blocked by something on
 *    a visitor's own machine (ad blocker, privacy extension, DNS filter).
 *    That failure is invisible to this app and to Drive itself, so the only
 *    real fix is to have another URL shape ready to try automatically.
 *
 * Pass either a single `src` (behaves like a plain <img>) or a `candidates`
 * array (tried in order, left to right, on each load failure — see
 * `driveImageCandidates` in src/lib/drive.js). Optionally pass `fallbackSrc`
 * — a last-resort image (e.g. a bundled/stock photo) tried only after every
 * candidate has failed, so a visitor sees something intentional instead of
 * an empty box. If that fails too (or none was given), renders an empty
 * placeholder box instead of a permanently broken image icon.
 */
import { useEffect, useState } from "react";

export default function ResilientImage({
  src,
  candidates,
  fallbackSrc,
  alt = "",
  className = "",
  onLoad,
  ...rest
}) {
  const base = candidates?.length ? candidates : src ? [src] : [];
  const list = fallbackSrc ? [...base, fallbackSrc] : base;
  const listKey = list.join("|");
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  // Reset when the image identity actually changes (e.g. navigating between
  // projects), not on every render.
  useEffect(() => {
    setIndex(0);
    setFailed(false);
  }, [listKey]);

  if (!list.length || failed) {
    return <div className={className} role="img" aria-label={alt} {...rest} />;
  }

  return (
    <img
      src={list[index]}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onLoad={onLoad}
      onError={() => {
        if (index < list.length - 1) setIndex((i) => i + 1);
        else setFailed(true);
      }}
      {...rest}
    />
  );
}
