/**
 * Google Drive API v3 — browser client.
 *
 * Reads the shared media folder tree described in src/config/drive.js.
 * Every folder listing is de-duplicated in-flight and cached (localStorage by
 * default) so navigating the site does not re-hit the API.
 *
 * Nothing here needs a backend. It only needs:
 *   - a restricted API key (VITE_DRIVE_API_KEY)
 *   - the root folder ID (VITE_DRIVE_ROOT_FOLDER_ID)
 *   - the media folders shared as "Anyone with the link – Viewer"
 */

import { DRIVE_CONFIG } from "../config/drive";
import { getProjectMetadata } from "../data/projectMetadata";

const API = "https://www.googleapis.com/drive/v3/files";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const CACHE_VERSION = "v4";

/* -------------------------------------------------------------------------- */
/* cache                                                                      */
/* -------------------------------------------------------------------------- */

function backend() {
  if (typeof window === "undefined") return null;
  try {
    if (DRIVE_CONFIG.cacheStore === "session") return window.sessionStorage;
    if (DRIVE_CONFIG.cacheStore === "local") return window.localStorage;
    return null;
  } catch {
    return null;
  }
}

function cacheGet(key) {
  const store = backend();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    // Without this, a cached listing never expires on its own (localStorage
    // persists across reloads) — a refresh after editing Drive would keep
    // showing stale content indefinitely instead of refetching within
    // cacheTtlMs as the config intends.
    if (DRIVE_CONFIG.cacheTtlMs && Date.now() - t > DRIVE_CONFIG.cacheTtlMs) {
      return null;
    }
    return v || null;
  } catch {
    return null;
  }
}

function cacheSet(key, value) {
  const store = backend();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    /* quota / private mode — ignore, we just re-fetch next time */
  }
}

const inflight = new Map();
const inflightText = new Map();

/** Wipe every cached Drive listing across all storage and versions (e.g. for a manual "refresh" control). */
export function clearDriveCache() {
  try {
    inflight.clear();
    inflightText.clear();
    if (typeof window !== "undefined") {
      [window.localStorage, window.sessionStorage].forEach((store) => {
        if (!store) return;
        Object.keys(store)
          .filter((k) => k.startsWith("drive:"))
          .forEach((k) => store.removeItem(k));
      });
      console.log("[drive] All drive cache cleared.");
    }
  } catch (err) {
    console.error("[drive] Error clearing drive cache:", err);
  }
}

if (typeof window !== "undefined") {
  window.clearDriveCache = clearDriveCache;
}

/**
 * List the direct children (files + folders) of a Drive folder.
 * Results are cached; concurrent callers share one request.
 * @returns {Promise<Array>} raw Drive file resources
 */
export async function listChildren(folderId) {
  if (!folderId) return [];
  if (!DRIVE_CONFIG.apiKey) {
    console.warn("[drive] VITE_DRIVE_API_KEY is not set — no images will load.");
    return [];
  }
  if (!DRIVE_CONFIG.rootFolderId) {
    console.warn("[drive] VITE_DRIVE_ROOT_FOLDER_ID is not set — no images will load.");
    return [];
  }

  const cacheKey = `drive:${CACHE_VERSION}:children:${folderId}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    console.debug(`[drive] cache hit for ${folderId}:`, cached.length, "items");
    return cached;
  }
  if (inflight.has(cacheKey)) {
    console.debug(`[drive] request in-flight for ${folderId}`);
    return inflight.get(cacheKey);
  }

  const run = (async () => {
    const files = [];
    let pageToken = "";
    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        key: DRIVE_CONFIG.apiKey,
        fields:
          "nextPageToken, files(id,name,mimeType,thumbnailLink,imageMediaMetadata(width,height,rotation),modifiedTime)",
        orderBy: "name_natural",
        pageSize: "1000",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });
      if (pageToken) params.set("pageToken", pageToken);

      const url = `${API}?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        console.error(
          "[drive] list failed for folder",
          folderId,
          "status:",
          res.status,
          "error:",
          errorText
        );
        break;
      }
      const data = await res.json();
      if (data.error) {
        console.error("[drive] API returned error:", data.error);
        break;
      }
      files.push(...(data.files || []));
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    cacheSet(cacheKey, files);
    return files;
  })();

  inflight.set(cacheKey, run);
  try {
    return await run;
  } finally {
    inflight.delete(cacheKey);
  }
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

export const isFolder = (f) => f?.mimeType === FOLDER_MIME;

/**
 * Image file extensions recognized as a fallback when a file's `mimeType`
 * isn't a proper `image/...` type — some upload paths (certain sync clients,
 * manual re-uploads, some mobile exports) leave Drive reporting a generic
 * type like `application/octet-stream` for a file that's unambiguously an
 * image by its name. Covers common photo formats (incl. HEIC/HEIF from
 * iPhones, AVIF), legacy/web formats (GIF, BMP, TIFF, ICO), vector (SVG),
 * and common RAW camera formats — browsers vary in which of these they can
 * actually render, but this is about *detecting* the file as an image, not
 * guaranteeing every browser can display it.
 */
const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "jpe", "jfif", "png", "gif", "webp", "avif",
  "bmp", "tif", "tiff", "svg", "ico", "heic", "heif",
  "cr2", "cr3", "nef", "arw", "dng", "orf", "rw2", "raf",
]);

const VIDEO_EXTENSIONS = new Set([
  "mp4", "webm", "mov", "m4v", "ogv", "mkv",
]);

function hasImageExtension(name) {
  const m = /\.([a-z0-9]+)$/i.exec(String(name || "").trim());
  return !!m && IMAGE_EXTENSIONS.has(m[1].toLowerCase());
}

function hasVideoExtension(name) {
  const m = /\.([a-z0-9]+)$/i.exec(String(name || "").trim());
  return !!m && VIDEO_EXTENSIONS.has(m[1].toLowerCase());
}

export const isImage = (f) =>
  (typeof f?.mimeType === "string" && f.mimeType.startsWith("image/")) ||
  hasImageExtension(f?.name);

export const isVideo = (f) =>
  (typeof f?.mimeType === "string" && f.mimeType.startsWith("video/")) ||
  hasVideoExtension(f?.name);

/** File names (case-insensitive) checked for per-project text metadata. */
const INFO_FILE_NAMES = ["info.txt", "info.md", "readme.txt"];

/** File names (case-insensitive) checked for publication/award cover metadata. */
export const COVER_FILE_NAMES = ["cover.txt", "cover.txt.txt", "cover.text", "cover.md"];

/** Fetch a small text file's raw content (e.g. a project's info.txt or cover.txt). */
async function fetchFileText(fileId) {
  if (!fileId) return "";
  const cacheKey = `drive:${CACHE_VERSION}:text:${fileId}`;
  const cached = cacheGet(cacheKey);
  if (
    cached !== null &&
    cached !== undefined &&
    !String(cached).trim().startsWith("<!DOCTYPE") &&
    !String(cached).trim().startsWith("<html")
  ) {
    return cached;
  }

  if (inflightText.has(fileId)) {
    return inflightText.get(fileId);
  }

  const p = (async () => {
    // Robust candidate download URLs for public files:
    // 1. Google Drive API files.get endpoint with alt=media (works cleanly with CORS in browser)
    // 2. Direct usercontent CDN fallback
    // 3. Google Drive /uc download endpoint fallback
    const urls = [
      DRIVE_CONFIG.apiKey ? `${API}/${fileId}?alt=media&key=${DRIVE_CONFIG.apiKey}&supportsAllDrives=true` : null,
      `https://drive.usercontent.google.com/download?id=${fileId}&export=download`,
      `https://drive.google.com/uc?export=download&id=${fileId}`,
    ].filter(Boolean);

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) continue;
        const text = await res.text();
        // Ensure we received valid text and not an HTML error / challenge page
        const trimmed = text.trim();
        if (trimmed && !trimmed.startsWith("<!DOCTYPE") && !trimmed.startsWith("<html")) {
          cacheSet(cacheKey, text);
          return text;
        }
      } catch {
        // try next candidate URL
      }
    }
    return "";
  })();

  inflightText.set(fileId, p);
  try {
    return await p;
  } finally {
    inflightText.delete(fileId);
  }
}

/**
 * Parse an info.txt's "Key: value" lines into { location, area, description }.
 * `Description:` (and anything after it, blank lines included) is read to the
 * end of the file so a description can span multiple lines/paragraphs.
 *
 *   Location: Kolaghat, West Bengal
 *   Area: 3.2 Acres
 *   Description: A riverside hospitality project blending ...
 *     ... second paragraph continues here.
 */
export function parseProjectInfo(text) {
  const info = { location: "", area: "", year: "", description: "" };
  if (!text) return info;

  const lines = String(text).split(/\r?\n/);
  const descLines = [];
  let inDescription = false;

  for (const raw of lines) {
    const line = raw.trim();
    const m = !inDescription && line.match(/^(location|area|year|description)\s*:\s*(.*)$/i);
    if (m) {
      const key = m[1].toLowerCase();
      if (key === "description") {
        inDescription = true;
        if (m[2]) descLines.push(m[2]);
      } else {
        info[key] = m[2].trim();
      }
    } else if (inDescription) {
      descLines.push(line);
    }
  }

  info.description = descLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return info;
}

/**
 * Parse an info.txt inside a publication folder into:
 *   { title, publication, issue, status, category, description }
 */
export function parsePublicationInfo(text) {
  const info = {
    title: "",
    publication: "",
    project: "",
    year: "",
    issue: "",
    status: "",
    category: "",
    description: "",
  };
  if (!text) return info;

  const lines = String(text).split(/\r?\n/);
  const descLines = [];
  let inDescription = false;

  for (const raw of lines) {
    const line = raw.trim();
    const m =
      !inDescription &&
      line.match(
        /^(title|publication|publication\s*name|project|project\s*name|publisher|publisher\s*name|year|date|issue|issue\s*\/\s*vol|vol|volume|status|category|description)\s*:\s*(.*)$/i
      );
    if (m) {
      const rawKey = m[1].toLowerCase().replace(/\s+/g, "");
      let key = "description";
      if (rawKey.includes("title")) key = "title";
      else if (rawKey.includes("publication")) key = "publication";
      else if (rawKey.includes("project") || rawKey.includes("publisher")) key = "project";
      else if (rawKey.includes("year") || rawKey.includes("date")) key = "year";
      else if (rawKey.includes("issue") || rawKey.includes("vol")) key = "issue";
      else if (rawKey.includes("status")) key = "status";
      else if (rawKey.includes("category")) key = "category";

      if (key === "description") {
        inDescription = true;
        if (m[2]) descLines.push(m[2]);
      } else {
        info[key] = m[2].trim();
      }
    } else if (inDescription) {
      descLines.push(line);
    }
  }

  info.description = descLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return info;
}

/**
 * Parse an info.txt inside an award / honor folder into:
 *   { title, award, year, project, status, category, description }
 */
export function parseAwardInfo(text) {
  const info = {
    title: "",
    award: "",
    year: "",
    project: "",
    status: "",
    category: "",
    description: "",
  };
  if (!text) return info;

  const lines = String(text).split(/\r?\n/);
  const descLines = [];
  let inDescription = false;

  for (const raw of lines) {
    const line = raw.trim();
    const m =
      !inDescription &&
      line.match(
        /^(title|award|award\s*name|honor|year|project|project\s*name|status|category|description)\s*:\s*(.*)$/i
      );
    if (m) {
      const rawKey = m[1].toLowerCase().replace(/\s+/g, "");
      let key = "description";
      if (rawKey.includes("title")) key = "title";
      else if (rawKey.includes("award") || rawKey.includes("honor")) key = "award";
      else if (rawKey.includes("year")) key = "year";
      else if (rawKey.includes("project")) key = "project";
      else if (rawKey.includes("status")) key = "status";
      else if (rawKey.includes("category")) key = "category";

      if (key === "description") {
        inDescription = true;
        if (m[2]) descLines.push(m[2]);
      } else {
        info[key] = m[2].trim();
      }
    } else if (inDescription) {
      descLines.push(line);
    }
  }

  info.description = descLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return info;
}

/**
 * Parse a cover.txt inside a publication or award folder into:
 *   { title, line2, line3, raw }
 *
 * Implements the 3-point format under the cover image:
 *   - Point 1 (left side): Publication name / Award name / Title
 *   - Point 2 (right side top): Project name / Category / etc.
 *   - Point 3 (right side bottom): Year / Date / etc.
 *
 * Pattern:
 *   Publication name: Happy New Year
 *   Project name: inscape
 *   Year: 2026
 *
 * Format of text file in Drive:
 *   Publication name: Happy New Year
 *   Project name: Inscape
 *   Year: 2026
 *
 * Presentation under image:
 *   - Point 1 (left side): Title (from Publication name / Award name)
 *   - Point 2 (right side top): Clean project name without "Project name:" label (e.g. "Inscape")
 *   - Point 3 (right side bottom): Year (e.g. "Year: 2026")
 */
function formatProjectName(val) {
  if (!val) return "";
  const s = String(val).trim();
  if (!s) return "";
  // If the project word is "inscape" (case-insensitive), display as "Inscape"
  if (s.toLowerCase() === "inscape") return "Inscape";
  // If the word starts with lowercase, capitalize it
  if (/^[a-z]/.test(s)) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s;
}

export function parseCoverInfo(text) {
  if (!text) return null;
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  // Split lines into { key, val, raw }
  const parsed = lines.map((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      return { key, val, raw: line };
    }
    return { key: "", val: line, raw: line };
  });

  // Identify point 1 (left side title) — prioritize publication or award name/title over project name
  let titleEntry = parsed.find((p) =>
    /^(publication\s*name|publication|award\s*name|award|honor|title)$/i.test(p.key)
  );

  if (!titleEntry) {
    titleEntry = parsed.find((p) =>
      /^(name)$/i.test(p.key)
    );
  }

  if (!titleEntry) {
    titleEntry = parsed[0];
  }

  const title = titleEntry.val || titleEntry.raw;

  // Remaining lines for right-side points (point 2 and point 3)
  const otherLines = parsed.filter((p) => p !== titleEntry);

  let projectVal = "";
  let yearVal = "";

  const formattedLines = otherLines.map((entry) => {
    // If line specifies Project name (or previous pattern Publisher name):
    // Display ONLY the clean project name (e.g. "Inscape"), omitting the "Project name:" label prefix
    const projectMatch = entry.raw.match(/^(?:project\s*name|project|publisher\s*name|publisher)\s*:\s*(.*)$/i);
    if (projectMatch || /^(project(\s*name)?|publisher(\s*name)?)$/i.test(entry.key)) {
      const rawVal = projectMatch ? projectMatch[1] : entry.val;
      const clean = formatProjectName(rawVal);
      projectVal = clean;
      return clean;
    }

    const yearMatch = entry.raw.match(/^(?:year|date)\s*:\s*(.*)$/i);
    if (yearMatch || /^(year|date)$/i.test(entry.key)) {
      const rawVal = yearMatch ? yearMatch[1] : entry.val;
      yearVal = rawVal.trim();
      return `Year: ${yearVal}`;
    }

    if (/^\d{4}$/.test(entry.raw.trim())) {
      yearVal = entry.raw.trim();
      return `Year: ${yearVal}`;
    }

    return entry.raw;
  });

  // If both a project and a year are present, ensure line2 is the clean project name and line3 is the Year.
  // If the project specifies Inscape plus an extra subtitle (e.g. "Inscape new lunch program"),
  // split so line2 is "Inscape" and projectSub is "new lunch program" (maintained on its own line).
  let line2 = "";
  let projectSub = "";
  let line3 = "";

  if (projectVal) {
    const inscapeSubMatch = projectVal.match(/^inscape[\s:/\-]+(.+)$/i);
    if (inscapeSubMatch) {
      line2 = "Inscape";
      projectSub = inscapeSubMatch[1].trim();
    } else {
      line2 = projectVal;
    }
  }

  if (yearVal) {
    line3 = `Year: ${yearVal}`;
  } else {
    line3 = formattedLines.find((l) => l !== projectVal && l !== line2 && l !== projectSub) || "";
  }

  if (!line2) {
    line2 = formattedLines[0] || "";
  }
  if (!line3) {
    line3 = formattedLines[1] || "";
  }

  return {
    title: title.trim(),
    line2: line2.trim(),
    projectSub: projectSub ? projectSub.trim() : "",
    line3: line3.trim(),
    publicationName: title.trim(),
    projectName: projectVal,
    project: projectVal,
    year: yearVal,
    raw: text,
  };
}


/**
 * "01 Hero" -> { order: 1, label: "Hero" }; "01_Hero" / "01-Hero" / "01.Hero"
 * -> the same (any run of space/-/_/./) is accepted as the separator, not
 * just a space); "Hero" -> { order: Infinity, label: "Hero" }.
 */
export function parseOrdered(name) {
  const m = String(name).match(/^\s*(\d+)[\s\-._)]+(.*)$/);
  if (m) return { order: parseInt(m[1], 10), label: m[2].trim() || String(name).trim() };
  const only = String(name).match(/^\s*(\d+)\s*$/);
  if (only) return { order: parseInt(only[1], 10), label: String(name).trim() };
  return { order: Number.POSITIVE_INFINITY, label: String(name).trim() };
}

/** True once both Drive env vars are set — pages use this to decide whether to trust live Drive data or fall back to placeholder content. */
export function isDriveConfigured() {
  return Boolean(DRIVE_CONFIG.apiKey && DRIVE_CONFIG.rootFolderId);
}

export function slug(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Rewrite a Drive `thumbnailLink` (…=s220) to a chosen pixel width. Kept for reference/back-compat — `driveThumbnailUrl` below is what's actually used, see its comment for why. */
export function sizedImage(thumbnailLink, width = DRIVE_CONFIG.imageWidth) {
  if (!thumbnailLink) return "";
  return thumbnailLink.replace(/=[-\w]+$/, `=w${width}`);
}

/** Last-resort direct URL (no CDN resizing, less reliable for big files). */
export function fileUrl(id) {
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

/**
 * Stable, hotlink-friendly thumbnail URL built from a file's id, at a given
 * pixel width. This is used instead of the API's `thumbnailLink` field
 * because `thumbnailLink` is a short-lived signed URL meant for immediate
 * use — this app fetches a folder's listing once and caches it (up to 5
 * min, see DRIVE_CONFIG.cacheTtlMs) before the <img> actually renders, so a
 * signed link can go stale before it's used, causing images to intermittently
 * fail to load. This endpoint instead generates the thumbnail fresh from the
 * stable file id on every request, so it keeps working regardless of when
 * it's rendered.
 */
export function driveThumbnailUrl(id, width = DRIVE_CONFIG.imageWidth) {
  if (!id) return "";
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

/**
 * Every URL pattern this app knows for reaching the same Drive image,
 * ordered from most to least preferred, for use with a fallback-on-error
 * <img> (see ResilientImage). This exists because some browser ad
 * blockers / privacy extensions / DNS-level filters block specific Google
 * image-CDN URL shapes — confirmed in practice — so a single hard-coded URL
 * can leave a visitor with a permanently broken image for a reason nothing
 * on this app's or Drive's side can detect or fix. Trying a differently
 * shaped URL from a different Google host is often enough to get past it.
 */
export function driveImageCandidates(id, width = DRIVE_CONFIG.imageWidth) {
  if (!id) return [];
  return [
    driveThumbnailUrl(id, width),
    `https://lh3.googleusercontent.com/d/${id}=w${width}`,
    fileUrl(id),
  ];
}

/**
 * @typedef {Object} DriveImage
 * @property {string} id
 * @property {string} name
 * @property {string} src              primary URL (Drive CDN, resized to imageWidth)
 * @property {string[]} srcCandidates  same image, alternate URL shapes to retry on load failure — see `driveImageCandidates`
 * @property {string} thumb            primary thumbnail URL (resized to thumbWidth)
 * @property {string[]} thumbCandidates
 * @property {number|null} width
 * @property {number|null} height
 * @property {string} alt
 */

/** @returns {DriveImage} */
export function toImage(f, opts = {}) {
  const width = opts.width ?? DRIVE_CONFIG.imageWidth;
  const thumbWidth = opts.thumbWidth ?? DRIVE_CONFIG.thumbWidth;
  const meta = f.imageMediaMetadata || {};
  const srcCandidates = driveImageCandidates(f.id, width);
  const thumbCandidates = driveImageCandidates(f.id, thumbWidth);
  // Drive's width/height are the raw pixel grid, before any EXIF rotation is
  // applied — a phone photo shot in portrait can still report landscape
  // dimensions here. `rotation` (90° steps clockwise) is how Drive exposes
  // that: 1 or 3 means what's actually displayed (and what the browser
  // renders) is rotated 90°, so width/height must be swapped to get the
  // true, visible aspect ratio — otherwise layouts that size a box from
  // these dimensions (e.g. the project gallery) get portrait photos wrong.
  const rotated = meta.rotation === 1 || meta.rotation === 3;
  const displayWidth = rotated ? meta.height : meta.width;
  const displayHeight = rotated ? meta.width : meta.height;
  return {
    id: f.id,
    name: f.name,
    src: srcCandidates[0] || "",
    srcCandidates,
    thumb: thumbCandidates[0] || "",
    thumbCandidates,
    width: displayWidth || null,
    height: displayHeight || null,
    alt: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim(),
  };
}

async function findChildFolder(parentId, name) {
  if (!parentId || !name) return null;
  const kids = await listChildren(parentId);
  const target = name.trim().toLowerCase();
  return kids.find((f) => isFolder(f) && f.name.trim().toLowerCase() === target) || null;
}

/** All images directly inside a folder, in Drive's natural name order. */
export async function folderImages(folderId, opts) {
  if (!folderId) return [];
  const kids = await listChildren(folderId);
  return kids.filter(isImage).map((f) => toImage(f, opts));
}

/* -------------------------------------------------------------------------- */
/* pages (Home / About / Awards / …)                                          */
/* -------------------------------------------------------------------------- */

export async function pageFolderId(pageKey) {
  if (DRIVE_CONFIG.directFolders) {
    if (DRIVE_CONFIG.directFolders[pageKey]) {
      return DRIVE_CONFIG.directFolders[pageKey];
    }
    const alias = pageKey === "about" ? "aboutUsPage" : `${pageKey}Page`;
    if (DRIVE_CONFIG.directFolders[alias]) {
      return DRIVE_CONFIG.directFolders[alias];
    }
  }

  const folderName = DRIVE_CONFIG.pages[pageKey];
  if (!folderName) return null;
  const folder = await findChildFolder(DRIVE_CONFIG.rootFolderId, folderName);
  return folder?.id || null;
}

/** Images for one named section subfolder of a page ("Hero", "01 Hero", …). Accepts a string or array of candidate names. */
export async function sectionImages(pageKey, sectionName, opts) {
  const pid = await pageFolderId(pageKey);
  if (!pid) return [];
  const names = Array.isArray(sectionName) ? sectionName : [sectionName];
  const kids = await listChildren(pid);

  for (const name of names) {
    const target = String(name).trim().toLowerCase();
    const match = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (match) {
      return folderImages(match.id, opts);
    }
  }
  return [];
}

/**
 * A section whose own children are project subfolders rather than flat
 * images — e.g. Home/"Selected Work(3rd Section)"/"01_HSB Joypur"/*.jpg.
 * Each subfolder holds exactly two images: one with "Monochrome" in its
 * filename (the stylized default state) and one without (the real photo,
 * for the hover reveal). Returns one pair per subfolder, ordered by
 * numeric prefix, each tagged with the subfolder's label (number prefix
 * stripped) so callers can match it back to a real project by title.
 * @returns {Promise<Array<{ label: string, image: DriveImage | null, hoverImage: DriveImage | null }>>}
 */
export async function sectionProjectCovers(pageKey, sectionName, opts) {
  const pid = await pageFolderId(pageKey);
  if (!pid) return [];
  const names = Array.isArray(sectionName) ? sectionName : [sectionName];
  const kids = await listChildren(pid);

  let sectionFolder = null;
  for (const name of names) {
    const target = String(name).trim().toLowerCase();
    sectionFolder = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (sectionFolder) break;
  }
  if (!sectionFolder) return [];

  const projectFolders = (await listChildren(sectionFolder.id)).filter(isFolder);
  const ordered = projectFolders
    .map((f) => ({ folder: f, ...parseOrdered(f.name) }))
    .sort((a, b) => a.order - b.order);

  return Promise.all(
    ordered.map(async ({ folder, label }) => {
      const images = await folderImages(folder.id, opts);
      const monochrome = images.find((img) => /monochrome/i.test(img.name));
      const coverImg = monochrome || pickCover(images);
      // Whichever image isn't the cover, so hover always shows something
      // different even when neither file is named "Monochrome".
      const real = images.find((img) => img !== coverImg) || coverImg;
      return { label, image: coverImg, hoverImage: real };
    })
  );
}

/** Synchronously retrieve cached section project covers if available. */
export function getCachedSectionProjectCovers(pageKey, sectionName, opts) {
  const pid = getCachedPageFolderId(pageKey);
  if (!pid) return null;
  const names = Array.isArray(sectionName) ? sectionName : [sectionName];
  const kids = getCachedChildren(pid);
  if (!kids) return null;

  let sectionFolder = null;
  for (const name of names) {
    const target = String(name).trim().toLowerCase();
    sectionFolder = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (sectionFolder) break;
  }
  if (!sectionFolder) return null;

  const projectFolders = (getCachedChildren(sectionFolder.id) || []).filter(isFolder);
  if (!projectFolders.length) return null;

  const ordered = projectFolders
    .map((f) => ({ folder: f, ...parseOrdered(f.name) }))
    .sort((a, b) => a.order - b.order);

  const results = [];
  for (const { folder, label } of ordered) {
    const rawFiles = getCachedChildren(folder.id);
    if (!rawFiles) return null;
    const images = rawFiles.filter(isImage).map((f) => toImage(f, opts));
    const monochrome = images.find((img) => /monochrome/i.test(img.name));
    const coverImg = monochrome || pickCover(images);
    const real = images.find((img) => img !== coverImg) || coverImg;
    results.push({ label, image: coverImg, hoverImage: real });
  }
  return results.length ? results : null;
}

/**
 * Every section subfolder of a page, ordered by numeric prefix.
 * @returns {Promise<Array<{ name: string, key: string, order: number, images: DriveImage[] }>>}
 */
export async function pageSections(pageKey, opts) {
  const pid = await pageFolderId(pageKey);
  if (!pid) return [];
  const kids = await listChildren(pid);
  const folders = kids.filter(isFolder);
  const sections = await Promise.all(
    folders.map(async (f) => {
      const { order, label } = parseOrdered(f.name);
      return {
        name: f.name,
        label,
        key: slug(label),
        order,
        images: await folderImages(f.id, opts),
      };
    })
  );
  return sections.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
}

/* -------------------------------------------------------------------------- */
/* publications (folder-per-publication or flat files)                        */
/* -------------------------------------------------------------------------- */

export const PUBLICATION_SECTION_NAMES = [
  "Featured Publication",
  "Featured Publications",
  "Publications",
];

/** Explicitly allowed image extensions for the Publication section: .jpg, .jpeg, .png, .webp */
export const PUBLICATION_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function isPublicationImage(f) {
  if (!f) return false;
  const name = String(f.name || "").trim();
  const m = /\.([a-z0-9]+)$/i.exec(name);
  if (m && PUBLICATION_IMAGE_EXTENSIONS.has(m[1].toLowerCase())) {
    return true;
  }
  if (typeof f.mimeType === "string") {
    const mime = f.mimeType.toLowerCase();
    if (
      mime === "image/jpeg" ||
      mime === "image/jpg" ||
      mime === "image/png" ||
      mime === "image/webp"
    ) {
      return true;
    }
  }
  return false;
}

/**
 * List publications from Awards -> Featured Publication.
 *
 * Supports two structures seamlessly:
 *  1. Folder-per-Publication (preferred): Each subfolder is a publication.
 *     - Its cover photo (01_cover.jpg or first image) shows on the main page.
 *     - All photos inside the folder show in the 4x4 gallery on its dedicated page.
 *     - info.txt inside the folder supplies editorial metadata.
 *  2. Flat files: Each image in Featured Publication is treated as a publication.
 *
 * Exclusively accepts: .jpg, .jpeg, .png, .webp
 */
export async function getPublications(opts = {}) {
  const cacheKey = `drive:${CACHE_VERSION}:full_publications:${JSON.stringify(opts || {})}`;
  const cached = cacheGet(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const pid = await pageFolderId("awards");
  if (!pid) return [];
  const kids = await listChildren(pid);

  let pubFolder = null;
  for (const name of PUBLICATION_SECTION_NAMES) {
    const target = String(name).trim().toLowerCase();
    pubFolder = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (pubFolder) break;
  }
  if (!pubFolder) return [];

  const pubChildren = await listChildren(pubFolder.id);
  const subFolders = pubChildren.filter(isFolder);

  if (subFolders.length > 0) {
    const orderedFolders = subFolders
      .map((f) => {
        const { order, label } = parseOrdered(f.name);
        return {
          folder: f,
          order,
          label: label || f.name,
        };
      })
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

    const publications = await Promise.all(
      orderedFolders.map(async ({ folder, order, label }) => {
        const innerKids = await listChildren(folder.id);
        const images = innerKids.filter(isPublicationImage).map((img) => toImage(img, opts));

        const infoFile = innerKids.find(
          (f) => !isFolder(f) && INFO_FILE_NAMES.includes(f.name.toLowerCase())
        );
        const coverTextFile = innerKids.find(
          (f) => !isFolder(f) && COVER_FILE_NAMES.includes(f.name.trim().toLowerCase())
        );

        // Fetch text files in parallel
        const [infoText, coverText] = await Promise.all([
          infoFile ? fetchFileText(infoFile.id) : Promise.resolve(""),
          coverTextFile ? fetchFileText(coverTextFile.id) : Promise.resolve(""),
        ]);
        const info = infoText ? parsePublicationInfo(infoText) : null;
        const coverInfo = coverText ? parseCoverInfo(coverText) : null;

        const cover = images.find((img) => /cover/i.test(img.name)) || images[0] || null;
        const galleryImages = images.filter((img) => {
          if (/cover/i.test(img.name)) return false;
          if (cover && img.id === cover.id) return false;
          return true;
        });

        return {
          id: folder.id,
          folderId: folder.id,
          name: folder.name,
          title: coverInfo?.title || info?.title || label,
          order,
          cover,
          images,
          galleryImages,
          src: cover?.src || "",
          thumb: cover?.thumb || "",
          srcCandidates: cover?.srcCandidates || [],
          thumbCandidates: cover?.thumbCandidates || [],
          alt: label,
          info,
          coverInfo,
          isFolder: true,
        };
      })
    );

    const result = publications.filter((p) => p.cover || p.images.length > 0);
    if (result.length > 0) {
      cacheSet(cacheKey, result);
    }
    return result;
  } else {
    // Flat files directly in "Featured Publication"
    const images = pubChildren.filter(isPublicationImage).map((f) => toImage(f, opts));
    const result = await Promise.all(
      images.map(async (img, idx) => {
        const base = img.name.replace(/\.[^.]+$/, "").trim().toLowerCase();
        const coverTextFile = pubChildren.find(
          (f) =>
            !isFolder(f) &&
            (f.name.trim().toLowerCase() === `${base}.cover.txt` ||
             f.name.trim().toLowerCase() === `${base}.txt` ||
             COVER_FILE_NAMES.includes(f.name.trim().toLowerCase()))
        );
        let coverInfo = null;
        if (coverTextFile) {
          const text = await fetchFileText(coverTextFile.id);
          coverInfo = parseCoverInfo(text);
        }

        return {
          id: img.id,
          folderId: null,
          name: img.name,
          title: coverInfo?.title || img.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          order: idx + 1,
          cover: img,
          images: [img],
          src: img.src,
          thumb: img.thumb,
          srcCandidates: img.srcCandidates,
          thumbCandidates: img.thumbCandidates,
          alt: img.alt || img.name,
          info: null,
          coverInfo,
          isFolder: false,
        };
      })
    );
    if (result.length > 0) {
      cacheSet(cacheKey, result);
    }
    return result;
  }
}

/** Synchronous cached lookup for publications. */
export function getCachedPublications(opts) {
  const cacheKey = `drive:${CACHE_VERSION}:full_publications:${JSON.stringify(opts || {})}`;
  const cached = cacheGet(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const pid = getCachedPageFolderId("awards");
  if (!pid) return null;
  const kids = getCachedChildren(pid);
  if (!kids) return null;

  let pubFolder = null;
  for (const name of PUBLICATION_SECTION_NAMES) {
    const target = String(name).trim().toLowerCase();
    pubFolder = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (pubFolder) break;
  }
  if (!pubFolder) return null;

  const pubChildren = getCachedChildren(pubFolder.id);
  if (!pubChildren) return null;

  const subFolders = pubChildren.filter(isFolder);
  if (subFolders.length > 0) {
    const orderedFolders = subFolders
      .map((f) => {
        const { order, label } = parseOrdered(f.name);
        return { folder: f, order, label: label || f.name };
      })
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

    const list = [];
    for (const { folder, order, label } of orderedFolders) {
      const innerKids = getCachedChildren(folder.id);
      const images = innerKids ? innerKids.filter(isPublicationImage).map((img) => toImage(img, opts)) : [];
      const cover = images.find((img) => /cover/i.test(img.name)) || images[0] || null;
      const galleryImages = images.filter((img) => {
        if (/cover/i.test(img.name)) return false;
        if (cover && img.id === cover.id) return false;
        return true;
      });

      const infoFile = innerKids
        ? innerKids.find((f) => !isFolder(f) && INFO_FILE_NAMES.includes(f.name.toLowerCase()))
        : null;
      let info = null;
      if (infoFile) {
        const cachedText = cacheGet(`drive:${CACHE_VERSION}:text:${infoFile.id}`);
        if (cachedText) {
          info = parsePublicationInfo(cachedText);
        }
      }

      const coverTextFile = innerKids
        ? innerKids.find((f) => !isFolder(f) && COVER_FILE_NAMES.includes(f.name.trim().toLowerCase()))
        : null;
      let coverInfo = null;
      if (coverTextFile) {
        const cachedText = cacheGet(`drive:${CACHE_VERSION}:text:${coverTextFile.id}`);
        if (cachedText) {
          coverInfo = parseCoverInfo(cachedText);
        }
      }

      list.push({
        id: folder.id,
        folderId: folder.id,
        name: folder.name,
        title: coverInfo?.title || info?.title || label,
        order,
        cover,
        images,
        galleryImages,
        src: cover?.src || "",
        thumb: cover?.thumb || "",
        srcCandidates: cover?.srcCandidates || [],
        thumbCandidates: cover?.thumbCandidates || [],
        alt: label,
        info,
        coverInfo,
        isFolder: true,
      });
    }
    return list;
  } else {
    const images = pubChildren.filter(isPublicationImage).map((f) => toImage(f, opts));
    return images.map((img, idx) => {
      const base = img.name.replace(/\.[^.]+$/, "").trim().toLowerCase();
      const coverTextFile = pubChildren.find(
        (f) =>
          !isFolder(f) &&
          (f.name.trim().toLowerCase() === `${base}.cover.txt` ||
           f.name.trim().toLowerCase() === `${base}.txt` ||
           COVER_FILE_NAMES.includes(f.name.trim().toLowerCase()))
      );
      let coverInfo = null;
      if (coverTextFile) {
        const cachedText = cacheGet(`drive:${CACHE_VERSION}:text:${coverTextFile.id}`);
        if (cachedText) {
          coverInfo = parseCoverInfo(cachedText);
        }
      }

      return {
        id: img.id,
        folderId: null,
        name: img.name,
        title: coverInfo?.title || img.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        order: idx + 1,
        cover: img,
        images: [img],
        src: img.src,
        thumb: img.thumb,
        srcCandidates: img.srcCandidates,
        thumbCandidates: img.thumbCandidates,
        alt: img.alt || img.name,
        info: null,
        coverInfo,
        isFolder: false,
      };
    });
  }
}

/* -------------------------------------------------------------------------- */
/* honors and awards (folder-per-award or flat files)                         */
/* -------------------------------------------------------------------------- */

export const AWARD_SECTION_NAMES = [
  "Honors And Awards",
  "Honors and Awards",
  "Awards Grid",
  "Awards",
];

/** Explicitly allowed image extensions for the Award section: .jpg, .jpeg, .png, .webp */
export const AWARD_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function isAwardImage(f) {
  if (!f) return false;
  const name = String(f.name || "").trim();
  const m = /\.([a-z0-9]+)$/i.exec(name);
  if (m && AWARD_IMAGE_EXTENSIONS.has(m[1].toLowerCase())) {
    return true;
  }
  if (typeof f.mimeType === "string") {
    const mime = f.mimeType.toLowerCase();
    if (
      mime === "image/jpeg" ||
      mime === "image/jpg" ||
      mime === "image/png" ||
      mime === "image/webp"
    ) {
      return true;
    }
  }
  return false;
}

/**
 * List honors and awards from Awards -> Honors And Awards.
 *
 * Supports two structures seamlessly (matching the Publication pattern):
 *  1. Folder-per-Award (preferred): Each subfolder is an award (e.g. 01, 02, or Year 2024, 2023).
 *     - Its cover photo (cover.jpg or first image) shows on the main awards page grid.
 *     - Inner photos inside the folder show in the gallery on its dedicated page.
 *     - info.txt inside the folder supplies editorial metadata (title, award, year, project, description).
 *  2. Flat files: Each image in Honors And Awards is treated as an award.
 *
 * Exclusively accepts: .jpg, .jpeg, .png, .webp
 */
export async function getAwards(opts = {}) {
  const cacheKey = `drive:${CACHE_VERSION}:full_awards:${JSON.stringify(opts || {})}`;
  const cached = cacheGet(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const pid = await pageFolderId("awards");
  if (!pid) return [];
  const kids = await listChildren(pid);

  let awardFolder = null;
  for (const name of AWARD_SECTION_NAMES) {
    const target = String(name).trim().toLowerCase();
    awardFolder = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (awardFolder) break;
  }
  if (!awardFolder) return [];

  const awardChildren = await listChildren(awardFolder.id);
  const subFolders = awardChildren.filter(isFolder);

  if (subFolders.length > 0) {
    const orderedFolders = subFolders
      .map((f) => {
        const { order, label } = parseOrdered(f.name);
        return {
          folder: f,
          order,
          label: label || f.name,
        };
      })
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

    const awards = await Promise.all(
      orderedFolders.map(async ({ folder, order, label }) => {
        const innerKids = await listChildren(folder.id);
        const images = innerKids.filter(isAwardImage).map((img) => toImage(img, opts));

        const infoFile = innerKids.find(
          (f) => !isFolder(f) && INFO_FILE_NAMES.includes(f.name.toLowerCase())
        );
        const coverTextFile = innerKids.find(
          (f) => !isFolder(f) && COVER_FILE_NAMES.includes(f.name.trim().toLowerCase())
        );

        // Fetch text files in parallel
        const [infoText, coverText] = await Promise.all([
          infoFile ? fetchFileText(infoFile.id) : Promise.resolve(""),
          coverTextFile ? fetchFileText(coverTextFile.id) : Promise.resolve(""),
        ]);
        const info = infoText ? parseAwardInfo(infoText) : null;
        const coverInfo = coverText ? parseCoverInfo(coverText) : null;

        const cover = images.find((img) => /cover/i.test(img.name)) || images[0] || null;
        const galleryImages = images.filter((img) => {
          if (/cover/i.test(img.name)) return false;
          if (cover && img.id === cover.id) return false;
          return true;
        });

        return {
          id: folder.id,
          folderId: folder.id,
          name: folder.name,
          title: coverInfo?.title || info?.title || label,
          order,
          cover,
          images,
          galleryImages,
          src: cover?.src || "",
          thumb: cover?.thumb || "",
          srcCandidates: cover?.srcCandidates || [],
          thumbCandidates: cover?.thumbCandidates || [],
          alt: label,
          info,
          coverInfo,
          isFolder: true,
        };
      })
    );

    const result = awards.filter((a) => a.cover || a.images.length > 0);
    if (result.length > 0) {
      cacheSet(cacheKey, result);
    }
    return result;
  } else {
    // Flat files directly in "Honors And Awards"
    const images = awardChildren.filter(isAwardImage).map((f) => toImage(f, opts));
    const result = await Promise.all(
      images.map(async (img, idx) => {
        const base = img.name.replace(/\.[^.]+$/, "").trim().toLowerCase();
        const coverTextFile = awardChildren.find(
          (f) =>
            !isFolder(f) &&
            (f.name.trim().toLowerCase() === `${base}.cover.txt` ||
             f.name.trim().toLowerCase() === `${base}.txt` ||
             COVER_FILE_NAMES.includes(f.name.trim().toLowerCase()))
        );
        let coverInfo = null;
        if (coverTextFile) {
          const text = await fetchFileText(coverTextFile.id);
          coverInfo = parseCoverInfo(text);
        }

        return {
          id: img.id,
          folderId: null,
          name: img.name,
          title: coverInfo?.title || img.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          order: idx + 1,
          cover: img,
          images: [img],
          galleryImages: [],
          src: img.src,
          thumb: img.thumb,
          srcCandidates: img.srcCandidates,
          thumbCandidates: img.thumbCandidates,
          alt: img.alt || img.name,
          info: null,
          coverInfo,
          isFolder: false,
        };
      })
    );
    if (result.length > 0) {
      cacheSet(cacheKey, result);
    }
    return result;
  }
}

/** Synchronous cached lookup for awards. */
export function getCachedAwards(opts) {
  const cacheKey = `drive:${CACHE_VERSION}:full_awards:${JSON.stringify(opts || {})}`;
  const cached = cacheGet(cacheKey);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const pid = getCachedPageFolderId("awards");
  if (!pid) return null;
  const kids = getCachedChildren(pid);
  if (!kids) return null;

  let awardFolder = null;
  for (const name of AWARD_SECTION_NAMES) {
    const target = String(name).trim().toLowerCase();
    awardFolder = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (awardFolder) break;
  }
  if (!awardFolder) return null;

  const awardChildren = getCachedChildren(awardFolder.id);
  if (!awardChildren) return null;

  const subFolders = awardChildren.filter(isFolder);
  if (subFolders.length > 0) {
    const orderedFolders = subFolders
      .map((f) => {
        const { order, label } = parseOrdered(f.name);
        return { folder: f, order, label: label || f.name };
      })
      .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

    const list = [];
    for (const { folder, order, label } of orderedFolders) {
      const innerKids = getCachedChildren(folder.id);
      const images = innerKids ? innerKids.filter(isAwardImage).map((img) => toImage(img, opts)) : [];
      const cover = images.find((img) => /cover/i.test(img.name)) || images[0] || null;
      const galleryImages = images.filter((img) => {
        if (/cover/i.test(img.name)) return false;
        if (cover && img.id === cover.id) return false;
        return true;
      });

      const infoFile = innerKids
        ? innerKids.find((f) => !isFolder(f) && INFO_FILE_NAMES.includes(f.name.toLowerCase()))
        : null;
      let info = null;
      if (infoFile) {
        const cachedText = cacheGet(`drive:${CACHE_VERSION}:text:${infoFile.id}`);
        if (cachedText) {
          info = parseAwardInfo(cachedText);
        }
      }

      const coverTextFile = innerKids
        ? innerKids.find((f) => !isFolder(f) && COVER_FILE_NAMES.includes(f.name.trim().toLowerCase()))
        : null;
      let coverInfo = null;
      if (coverTextFile) {
        const cachedText = cacheGet(`drive:${CACHE_VERSION}:text:${coverTextFile.id}`);
        if (cachedText) {
          coverInfo = parseCoverInfo(cachedText);
        }
      }

      list.push({
        id: folder.id,
        folderId: folder.id,
        name: folder.name,
        title: coverInfo?.title || info?.title || label,
        order,
        cover,
        images,
        galleryImages,
        src: cover?.src || "",
        thumb: cover?.thumb || "",
        srcCandidates: cover?.srcCandidates || [],
        thumbCandidates: cover?.thumbCandidates || [],
        alt: label,
        info,
        coverInfo,
        isFolder: true,
      });
    }
    return list;
  } else {
    const images = awardChildren.filter(isAwardImage).map((f) => toImage(f, opts));
    return images.map((img, idx) => {
      const base = img.name.replace(/\.[^.]+$/, "").trim().toLowerCase();
      const coverTextFile = awardChildren.find(
        (f) =>
          !isFolder(f) &&
          (f.name.trim().toLowerCase() === `${base}.cover.txt` ||
           f.name.trim().toLowerCase() === `${base}.txt` ||
           COVER_FILE_NAMES.includes(f.name.trim().toLowerCase()))
      );
      let coverInfo = null;
      if (coverTextFile) {
        const cachedText = cacheGet(`drive:${CACHE_VERSION}:text:${coverTextFile.id}`);
        if (cachedText) {
          coverInfo = parseCoverInfo(cachedText);
        }
      }

      return {
        id: img.id,
        folderId: null,
        name: img.name,
        title: coverInfo?.title || img.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        order: idx + 1,
        cover: img,
        images: [img],
        galleryImages: [],
        src: img.src,
        thumb: img.thumb,
        srcCandidates: img.srcCandidates,
        thumbCandidates: img.thumbCandidates,
        alt: img.alt || img.name,
        info: null,
        coverInfo,
        isFolder: false,
      };
    });
  }
}

/* -------------------------------------------------------------------------- */
/* projects (special)                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Resolve the "Projects" folder: normally the child of root named
 * `DRIVE_CONFIG.projectsFolder` ("Projects"). If root has no such child,
 * fall back to treating the root folder itself as the projects root — lets
 * `VITE_DRIVE_ROOT_FOLDER_ID` point directly at a shared Projects folder
 * before Home/About/Awards exist alongside it. Once a real "Projects" child
 * is added under root, that takes over automatically.
 */
async function projectsRootId() {
  // First try to find a "Projects" folder in the root
  const f = await findChildFolder(DRIVE_CONFIG.rootFolderId, DRIVE_CONFIG.projectsFolder);
  if (f?.id) {
    console.debug("[drive] found Projects folder:", f.id);
    return f.id;
  }
  // Fall back to root folder itself
  console.debug("[drive] Projects folder not found, using root as projects root");
  return DRIVE_CONFIG.rootFolderId || null;
}

/**
 * Find a category folder by its display name, matching either the raw
 * folder name ("Hospitality") or its numeric-prefix-stripped label
 * ("01_Hospitality" -> "Hospitality") — mirrors the fallback `sectionImages`
 * already does for page sections.
 */
async function findCategoryFolder(rid, category) {
  const kids = await listChildren(rid);
  const target = category.trim().toLowerCase();
  return (
    kids.find((f) => isFolder(f) && f.name.trim().toLowerCase() === target) ||
    kids.find((f) => isFolder(f) && parseOrdered(f.name).label.toLowerCase() === target) ||
    null
  );
}

/** Category names for the Projects subnavbar (not including the synthetic "All"). Numeric folder prefixes ("01_Hospitality") are stripped for display. */
export async function projectCategories() {
  const rid = await projectsRootId();
  if (!rid) return [];
  const kids = await listChildren(rid);
  const fromDrive = kids.filter(isFolder).map((f) => parseOrdered(f.name).label);

  if (DRIVE_CONFIG.projectCategories.length) {
    return DRIVE_CONFIG.projectCategories.filter((c) =>
      fromDrive.some((k) => k.toLowerCase() === c.toLowerCase())
    );
  }
  return fromDrive;
}

/**
 * @typedef {Object} DriveProject
 * @property {string} id        stable slug, e.g. "hospitality-1"
 * @property {string} folderId
 * @property {number|null} number
 * @property {string} title     folder name minus the leading number
 * @property {string} category
 */

/** @returns {Promise<DriveProject[]>} projects in one category, ordered by number. */
export async function categoryProjects(category) {
  const rid = await projectsRootId();
  if (!rid) return [];
  const catFolder = await findCategoryFolder(rid, category);
  if (!catFolder) return [];

  const kids = await listChildren(catFolder.id);
  const projects = kids
    .filter(isFolder)
    .map((f) => {
      const { order, label } = parseOrdered(f.name);
      const number = Number.isFinite(order) ? order : null;
      return {
        id: `${slug(category)}-${number ?? slug(label)}`,
        folderId: f.id,
        number,
        title: label,
        category,
      };
    })
    .sort(
      (a, b) =>
        (a.number ?? Number.POSITIVE_INFINITY) - (b.number ?? Number.POSITIVE_INFINITY) ||
        a.title.localeCompare(b.title)
    );
  return projects;
}

/** Every project across every category (for the "All" tab), grouped by category order. */
export async function allProjects() {
  const cats = await projectCategories();
  const lists = await Promise.all(cats.map((c) => categoryProjects(c)));
  return lists.flat();
}

export async function findProject(id) {
  const all = await allProjects();
  return all.find((p) => p.id === id) || null;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const significantWords = (s) => String(s || "").toUpperCase().match(/[A-Z]{3,}/g) || [];

/**
 * Match a free-text label (e.g. a curated-section subfolder name like
 * "Sonku Park") against a list of real projects by their `title`, tolerant
 * of typos (word-level edit distance) — real content is hand-typed in two
 * different places and rarely spelled identically. Exact shared words score
 * higher than fuzzy ones; returns null if nothing scores above zero.
 */
export function matchProjectByLabel(projects, label) {
  const labelWords = significantWords(label);
  let best = null;
  let bestScore = 0;
  for (const p of projects) {
    const titleWords = significantWords(p.title);
    const usedTitleWords = new Set();
    let score = 0;
    for (const lw of labelWords) {
      if (titleWords.includes(lw)) {
        score += 2;
        usedTitleWords.add(lw);
        continue;
      }
      let nearest = null;
      let nearestDist = Infinity;
      for (const tw of titleWords) {
        if (usedTitleWords.has(tw)) continue;
        const d = levenshtein(lw, tw);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = tw;
        }
      }
      const threshold = Math.max(2, Math.floor(Math.max(lw.length, nearest?.length || 0) * 0.3));
      if (nearest && nearestDist <= threshold) {
        score += 1;
        usedTitleWords.add(nearest);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore > 0 ? best : null;
}

/**
 * Cover-picking convention for a project folder: a file literally named
 * "DP" (any extension — "DP.jpg", "dp.png", …, case-insensitive) is used as
 * the cover when present; otherwise the first image in natural name order.
 */
export function pickCover(images) {
  // `images` is already an array of DriveImage objects (from toImage()) — every
  // element IS an image by construction (the mimeType filtering already
  // happened upstream, and toImage() doesn't carry mimeType forward), so no
  // further mimeType check belongs here.
  const dp = images.find((img) => {
    const nameWithoutExt = img.name.replace(/\.[^.]+$/, "").trim();
    return /^dp$/i.test(nameWithoutExt);
  });
  if (dp) {
    console.debug("[drive] using DP as cover:", dp.name);
    return dp;
  }

  const firstImage = images[0];
  if (firstImage) {
    console.debug("[drive] using first image as cover:", firstImage.name);
  }
  return firstImage || null;
}

/** Cover image + full gallery for a project folder. */
export async function projectImages(folderId) {
  const images = await folderImages(folderId, { width: DRIVE_CONFIG.imageWidth });
  return {
    cover: pickCover(images),
    gallery: images,
  };
}

/**
 * Everything `projectImages` returns, plus text metadata (location / area /
 * year / description) read from an optional info.txt (or info.md /
 * readme.txt) placed alongside the images in the same project folder — see
 * `parseProjectInfo`. Missing file -> empty strings, so callers don't need
 * to special-case it. Kept separate from `projectImages` so existing callers
 * of that function are unaffected.
 */
export async function projectDetails(folderId, titleHint = "") {
  const kids = await listChildren(folderId);
  const images = kids.filter(isImage).map((f) => toImage(f, { width: DRIVE_CONFIG.imageWidth }));
  const infoFile = kids.find(
    (f) => !isFolder(f) && INFO_FILE_NAMES.includes(f.name.trim().toLowerCase())
  );
  const info = parseProjectInfo(infoFile ? await fetchFileText(infoFile.id) : "");
  const meta = getProjectMetadata(titleHint) || {};

  return {
    cover: pickCover(images),
    gallery: images,
    location: info.location || meta.location || "",
    area: info.area || meta.area || "",
    status: info.status || meta.status || (info.year ? `Completed ${info.year}` : "Completed 2022"),
    year: info.year || meta.status?.match(/\d{4}/)?.[0] || "2022",
    description: info.description || meta.description || "",
  };
}


/**
 * Prefetch all project data into cache for instant page loads.
 * Call this on app startup or route navigation to "warm up" the cache.
 * Uses concurrent requests to minimize total time.
 */
export async function prefetchAllProjects() {
  if (!isDriveConfigured()) return;
  
  try {
    console.debug("[drive] prefetching all pages and projects...");
    const start = performance.now();
    
    // Background promises for page data (Hero Video, Awards, Publications, Contact, About)
    const pagePrefetches = [
      heroVideo().catch(() => null),
      getAwards().catch(() => []),
      getPublications().catch(() => []),
      sectionImages("awards", ["Selected Sketches", "Sketches"]).catch(() => []),
      pageSections("about").catch(() => []),
      contactImages().catch(() => []),
    ];

    // Fetch categories first
    const categories = await projectCategories();
    console.debug("[drive] prefetch: got", categories.length, "categories");
    
    // Fetch all projects concurrently
    const projectsByCategory = await Promise.all(
      categories.map(cat => categoryProjects(cat))
    );
    
    // Fetch details for all projects concurrently
    const allProjs = projectsByCategory.flat();
    console.debug("[drive] prefetch: got", allProjs.length, "projects total");
    
    const results = await Promise.all([
      ...pagePrefetches,
      ...allProjs.slice(0, 12).map(p => projectImages(p.folderId)) // Prefetch first 12 projects
    ]);

    // Preload image URLs into browser memory cache for instant rendering
    const imageUrls = results
      .flat()
      .filter(Boolean)
      .map(item => item.src || item.cover?.src)
      .filter(Boolean);

    imageUrls.slice(0, 30).forEach(url => {
      const img = new Image();
      img.src = url;
    });
    
    const elapsed = performance.now() - start;
    console.debug(`[drive] prefetch complete in ${elapsed.toFixed(0)}ms`);
  } catch (err) {
    console.error("[drive] prefetch failed:", err);
  }
}

/** Synchronously retrieve cached folder children if available. */
export function getCachedChildren(folderId) {
  if (!folderId) return null;
  const cacheKey = `drive:${CACHE_VERSION}:children:${folderId}`;
  return cacheGet(cacheKey);
}

/** Synchronously resolve page folder ID from config or cache. */
export function getCachedPageFolderId(pageKey) {
  if (DRIVE_CONFIG.directFolders) {
    if (DRIVE_CONFIG.directFolders[pageKey]) return DRIVE_CONFIG.directFolders[pageKey];
    const alias = pageKey === "about" ? "aboutUsPage" : `${pageKey}Page`;
    if (DRIVE_CONFIG.directFolders[alias]) return DRIVE_CONFIG.directFolders[alias];
  }
  const folderName = DRIVE_CONFIG.pages[pageKey];
  if (!folderName || !DRIVE_CONFIG.rootFolderId) return null;
  const rootKids = getCachedChildren(DRIVE_CONFIG.rootFolderId);
  if (!rootKids) return null;
  const target = folderName.trim().toLowerCase();
  const found = rootKids.find((f) => isFolder(f) && f.name.trim().toLowerCase() === target);
  return found?.id || null;
}

/** Synchronously retrieve cached section images if available in localStorage. */
export function getCachedSectionImages(pageKey, sectionName, opts) {
  const pid = getCachedPageFolderId(pageKey);
  if (!pid) return null;
  const kids = getCachedChildren(pid);
  if (!kids) return null;

  const names = Array.isArray(sectionName) ? sectionName : [sectionName];
  for (const name of names) {
    const target = String(name).trim().toLowerCase();
    const match = kids.find(
      (f) =>
        isFolder(f) &&
        (f.name.trim().toLowerCase() === target || parseOrdered(f.name).label.toLowerCase() === target)
    );
    if (match) {
      const secKids = getCachedChildren(match.id);
      if (secKids) {
        return secKids.filter(isImage).map((f) => toImage(f, opts));
      }
    }
  }
  return null;
}

/** Synchronously retrieve cached team members if available. */
export function getCachedTeamMembers() {
  const aboutUsFolderId = DRIVE_CONFIG.directFolders?.aboutUsPage;
  if (!aboutUsFolderId) return null;
  const kids = getCachedChildren(aboutUsFolderId);
  if (!kids) return null;
  const peopleFolder = kids.find(
    (f) => isFolder(f) && f.name.trim().toLowerCase() === "our people_section"
  );
  if (!peopleFolder) return null;
  const images = getCachedChildren(peopleFolder.id);
  if (!images) return null;
  return images.filter(isImage).map((f) => {
    const img = toImage(f);
    const { name, designation } = parseTeamFileName(img.name);
    return {
      name,
      designation,
      src: img.src,
      srcCandidates: img.srcCandidates,
      imageMetadata: { width: img.width, height: img.height },
    };
  });
}

/** Synchronously retrieve cached client logos if available. */
export function getCachedClientLogos() {
  const homePageFolderId = DRIVE_CONFIG.directFolders?.homePage;
  if (!homePageFolderId) return null;
  const kids = getCachedChildren(homePageFolderId);
  if (!kids) return null;
  const clientFolder = kids.find(
    (f) => isFolder(f) && f.name.trim().toLowerCase() === "our client section"
  );
  if (!clientFolder) return null;
  const images = getCachedChildren(clientFolder.id);
  if (!images) return null;
  return images.filter(isImage).map((f) => toImage(f));
}

/** Synchronously retrieve cached collage images if available. */
export function getCachedCollageImages() {
  const homePageFolderId = DRIVE_CONFIG.directFolders?.homePage;
  if (!homePageFolderId) return null;
  const kids = getCachedChildren(homePageFolderId);
  if (!kids) return null;
  const possibleNames = ["Collage Section", "Collage Section(2nd Sec...", "Collage", "2nd Section"];
  let collageFolder = null;
  for (const name of possibleNames) {
    collageFolder = kids.find(
      (f) => isFolder(f) && f.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (collageFolder) break;
  }
  if (!collageFolder) return null;
  let images = getCachedChildren(collageFolder.id);
  if (!images) return null;
  images = images.filter(isImage).map((f) => toImage(f));
  // Sort by numeric filename
  images.sort((a, b) => {
    const aNum = parseInt(a.name.match(/^\d+/)?.[0] || "999");
    const bNum = parseInt(b.name.match(/^\d+/)?.[0] || "999");
    return aNum - bNum;
  });
  return images;
}

/** Synchronously retrieve cached hero video if available. */
export function getCachedHeroVideo() {
  const cacheKey = `drive:${CACHE_VERSION}:heroVideo`;
  const cached = cacheGet(cacheKey);
  if (cached && cached.src) {
    return cached;
  }

  const homePageFolderId = DRIVE_CONFIG.directFolders?.homePage;
  if (!homePageFolderId) return null;
  const kids = getCachedChildren(homePageFolderId);
  if (!kids) return null;
  const heroFolder = kids.find((f) => isFolder(f) && /hero/i.test(f.name));
  if (!heroFolder) return null;
  const files = getCachedChildren(heroFolder.id);
  if (!files) return null;
  const videoFile = files.find(isVideo);
  if (!videoFile) return null;
  const poster = videoFile.thumbnailLink
    ? videoFile.thumbnailLink.replace(/=s\d+.*$/, "=s1920")
    : null;
  const res = {
    id: videoFile.id,
    name: videoFile.name,
    src: `https://www.googleapis.com/drive/v3/files/${videoFile.id}?alt=media&key=${DRIVE_CONFIG.apiKey}`,
    apiSrc: `https://www.googleapis.com/drive/v3/files/${videoFile.id}?alt=media&key=${DRIVE_CONFIG.apiKey}`,
    downloadSrc: `https://drive.usercontent.google.com/download?id=${videoFile.id}&export=download&confirm=t`,
    previewSrc: `https://drive.google.com/file/d/${videoFile.id}/preview`,
    poster,
  };
  cacheSet(cacheKey, res);
  return res;
}

/**
 * Get cached data synchronously if available, otherwise undefined.
 * Used for optimistic rendering of cached project data.
 */
export function getCachedProjects(category) {
  if (!DRIVE_CONFIG.cacheStore) return undefined;
  
  const store = backend();
  if (!store) return undefined;
  
  try {
    const cached = store.getItem(`drive:${CACHE_VERSION}:projectCategories`);
    if (cached) {
      const { t, v } = JSON.parse(cached);
      if (DRIVE_CONFIG.cacheTtlMs && Date.now() - t > DRIVE_CONFIG.cacheTtlMs) {
        return undefined;
      }
      return v;
    }
  } catch {
    return undefined;
  }
}



/**
 * Parse team member file name format: "Number_Name_Designation.ext" (the
 * leading number is just a Drive sort-order prefix and is never shown) or,
 * without a number, "Name_Designation.ext". Returns { name, designation }
 */
export function parseTeamFileName(filename) {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "").trim();
  const parts = nameWithoutExt.split("_").map((p) => p.trim()).filter(Boolean);

  // Drop a leading pure-number ordering prefix, e.g. "1_Sujoy Das_Principal Architect"
  if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
    parts.shift();
  }

  if (parts.length < 2) {
    // No designation part found - use whatever's left as the name
    return { name: parts[0] || nameWithoutExt, designation: "" };
  }

  // First remaining part is the name, the rest is the designation
  const name = parts[0];
  const designation = parts.slice(1).join(" ");

  return { name, designation };
}

/** Get client logos from Home Page/Our Client Section folder */
export async function clientLogos() {
  if (!isDriveConfigured()) {
    console.warn("[drive] Drive not configured for clientLogos");
    return [];
  }
  
  try {
    console.log("[drive] Starting to fetch client logos...");
    
    // Use direct folder ID for Home Page
    const homePageFolderId = DRIVE_CONFIG.directFolders?.homePage;
    if (!homePageFolderId) {
      console.error("[drive] Home Page folder ID not configured in DRIVE_CONFIG");
      return [];
    }
    
    console.log("[drive] Using Home Page folder ID:", homePageFolderId);
    
    // Get Our Client Section subfolder - try multiple possible names
    const possibleNames = ["Our Client Section", "Our Clients", "Clients", "Client Logos"];
    let clientFolder = null;
    
    for (const name of possibleNames) {
      clientFolder = await findChildFolder(homePageFolderId, name);
      if (clientFolder) {
        console.log(`[drive] Found client folder with name: "${name}"`, clientFolder);
        break;
      }
    }
    
    if (!clientFolder) {
      console.error("[drive] Client folder not found with any of the expected names:", possibleNames);
      return [];
    }
    
    // Get all image files in Client folder
    const images = await folderImages(clientFolder.id, { width: DRIVE_CONFIG.thumbWidth });
    console.log("[drive] found", images.length, "client logos in", clientFolder.name, images);
    
    return images;
  } catch (err) {
    console.error("[drive] failed to load client logos:", err);
    return [];
  }
}

/** Get collage section images from Home Page/Collage Section folder, sorted by numeric filename */
export async function collageImages() {
  if (!isDriveConfigured()) {
    console.warn("[drive] Drive not configured for collageImages");
    return [];
  }
  
  try {
    console.log("[drive] Starting to fetch collage images...");
    
    // Use direct folder ID for Home Page
    const homePageFolderId = DRIVE_CONFIG.directFolders?.homePage;
    if (!homePageFolderId) {
      console.error("[drive] Home Page folder ID not configured in DRIVE_CONFIG");
      return [];
    }
    
    console.log("[drive] Using Home Page folder ID:", homePageFolderId);
    
    // Get Collage Section subfolder - try multiple possible names
    const possibleNames = ["Collage Section", "Collage Section(2nd Sec...", "Collage", "2nd Section"];
    let collageFolder = null;
    
    // First, list all children to see what folders exist
    const homeChildren = await listChildren(homePageFolderId);
    console.log("[drive] Home Page children:", homeChildren.filter(isFolder).map(f => f.name));
    
    // Try exact name matches first
    for (const name of possibleNames) {
      collageFolder = homeChildren.find(
        (f) => isFolder(f) && f.name.trim().toLowerCase() === name.toLowerCase()
      );
      if (collageFolder) {
        console.log(`[drive] Found collage folder with exact name: "${name}"`);
        break;
      }
    }
    
    // If not found, try partial match - any folder containing "collage"
    if (!collageFolder) {
      collageFolder = homeChildren.find(
        (f) => isFolder(f) && f.name.toLowerCase().includes("collage")
      );
      if (collageFolder) {
        console.log(`[drive] Found collage folder by partial match: "${collageFolder.name}"`);
      }
    }
    
    if (!collageFolder) {
      console.error("[drive] Collage folder not found. Available folders:", homeChildren.filter(isFolder).map(f => f.name));
      return [];
    }
    
    // Get all image files in Collage folder
    let images = await folderImages(collageFolder.id, { width: DRIVE_CONFIG.thumbWidth });
    
    // Sort images by numeric filename prefix (01.jpg, 03.jpg, 04.jpg, etc.)
    images.sort((a, b) => {
      const aNum = parseInt(a.name.match(/^\d+/)?.[0] || "999");
      const bNum = parseInt(b.name.match(/^\d+/)?.[0] || "999");
      return aNum - bNum;
    });
    
    console.log("[drive] found", images.length, "collage images in", collageFolder.name, "sorted order:", images.map(i => i.name));
    
    return images;
  } catch (err) {
    console.error("[drive] failed to load collage images:", err);
    return [];
  }
}

/**
 * Get hero section video from Home Page/Hero Section folder.
 */
export async function heroVideo() {
  if (!isDriveConfigured()) return null;

  const cacheKey = `drive:${CACHE_VERSION}:heroVideo`;
  const cached = cacheGet(cacheKey);
  if (cached && cached.src) {
    return cached;
  }

  try {
    const homePageFolderId = DRIVE_CONFIG.directFolders?.homePage;
    if (!homePageFolderId) return null;

    const homeChildren = await listChildren(homePageFolderId);
    const heroFolder = homeChildren.find(
      (f) => isFolder(f) && /hero/i.test(f.name)
    );
    if (!heroFolder) {
      console.log("[drive] Hero Section folder not found in Home Page");
      return null;
    }

    const files = await listChildren(heroFolder.id);
    const videoFile = files.find(isVideo);
    if (!videoFile) {
      console.log("[drive] No video file found in Hero Section folder");
      return null;
    }

    const poster = videoFile.thumbnailLink
      ? videoFile.thumbnailLink.replace(/=s\d+.*$/, "=s1920")
      : null;

    console.log("[drive] found hero video file:", videoFile.name, videoFile.id);
    const videoObj = {
      id: videoFile.id,
      name: videoFile.name,
      src: `https://www.googleapis.com/drive/v3/files/${videoFile.id}?alt=media&key=${DRIVE_CONFIG.apiKey}`,
      apiSrc: `https://www.googleapis.com/drive/v3/files/${videoFile.id}?alt=media&key=${DRIVE_CONFIG.apiKey}`,
      downloadSrc: `https://drive.usercontent.google.com/download?id=${videoFile.id}&export=download&confirm=t`,
      previewSrc: `https://drive.google.com/file/d/${videoFile.id}/preview`,
      poster,
    };
    cacheSet(cacheKey, videoObj);
    return videoObj;
  } catch (err) {
    console.error("[drive] failed to load hero video:", err);
    return null;
  }
}

/**
 * Get team member images from About/People folder
 * Returns array of { name, designation, src, srcCandidates, imageMetadata }
 */
export async function teamMemberImages() {
  if (!isDriveConfigured()) {
    console.log("[drive] Drive not configured");
    return [];
  }
  
  try {
    console.log("[drive] Starting to fetch team members...");
    
    // Use direct folder ID for About Us Page (it's a separate shared folder)
    const aboutUsFolderId = DRIVE_CONFIG.directFolders?.aboutUsPage;
    if (!aboutUsFolderId) {
      console.error("[drive] About Us Page folder ID not configured in DRIVE_CONFIG");
      return [];
    }
    
    console.log("[drive] Using About Us Page folder ID:", aboutUsFolderId);
    
    // Get Our People_Section subfolder
    const peopleFolder = await findChildFolder(aboutUsFolderId, "Our People_Section");
    console.log("[drive] Our People_Section folder:", peopleFolder);
    if (!peopleFolder) {
      console.error("[drive] Our People_Section folder not found");
      return [];
    }
    
    // Get all image files in People folder
    const images = await folderImages(peopleFolder.id);
    console.log("[drive] found", images.length, "images in Our People_Section", images);
    
    // Parse filename format and attach metadata
    const teamMembers = images.map((img) => {
      const { name, designation } = parseTeamFileName(img.name);
      console.log("[drive] parsed team member:", { filename: img.name, name, designation, src: img.src });
      return {
        name,
        designation,
        src: img.src,
        srcCandidates: img.srcCandidates,
        imageMetadata: {
          width: img.width,
          height: img.height,
        },
      };
    });
    
    console.log("[drive] loaded", teamMembers.length, "team members from People folder");
    return teamMembers;
  } catch (err) {
    console.error("[drive] failed to load team members:", err);
    return [];
  }
}

/** Get images from Contact folder */
export async function contactImages() {
  if (!isDriveConfigured()) return [];
  try {
    const contactFolderId = DRIVE_CONFIG.directFolders?.contactPage;
    if (!contactFolderId) return [];
    return await folderImages(contactFolderId);
  } catch (err) {
    console.error("[drive] failed to load contact images:", err);
    return [];
  }
}

/** Synchronously retrieve cached contact page images if available. */
export function getCachedContactImages() {
  const contactFolderId = DRIVE_CONFIG.directFolders?.contactPage;
  if (!contactFolderId) return null;
  const images = getCachedChildren(contactFolderId);
  if (!images) return null;
  return images.filter(isImage).map((f) => toImage(f));
}

