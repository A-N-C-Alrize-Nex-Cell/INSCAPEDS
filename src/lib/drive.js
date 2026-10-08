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
const CACHE_VERSION = "v1";

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
    const { v } = JSON.parse(raw);
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

/** Wipe every cached Drive listing (e.g. for a manual "refresh" control). */
export function clearDriveCache() {
  const store = backend();
  if (!store) return;
  try {
    const prefix = `drive:${CACHE_VERSION}:`;
    Object.keys(store)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => store.removeItem(k));
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* low-level: list a folder's direct children                                 */
/* -------------------------------------------------------------------------- */

const inflight = new Map();

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

function hasImageExtension(name) {
  const m = /\.([a-z0-9]+)$/i.exec(String(name || "").trim());
  return !!m && IMAGE_EXTENSIONS.has(m[1].toLowerCase());
}

export const isImage = (f) =>
  (typeof f?.mimeType === "string" && f.mimeType.startsWith("image/")) ||
  hasImageExtension(f?.name);

/** File names (case-insensitive) checked for per-project text metadata. */
const INFO_FILE_NAMES = ["info.txt", "info.md", "readme.txt"];

/** Fetch a small text file's raw content (e.g. a project's info.txt). */
async function fetchFileText(fileId) {
  if (!fileId || !DRIVE_CONFIG.apiKey) return "";
  try {
    const params = new URLSearchParams({
      alt: "media",
      key: DRIVE_CONFIG.apiKey,
      supportsAllDrives: "true",
    });
    const res = await fetch(`${API}/${fileId}?${params.toString()}`);
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
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

/**
 * Cover-picking convention for a project folder: a file literally named
 * "DP" (any extension — "DP.jpg", "dp.png", …, case-insensitive) is used as
 * the cover when present; otherwise the first image in natural name order.
 */
function pickCover(images) {
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
    
    // Background promises for page section images (Awards, Contact, About)
    const pagePrefetches = [
      pageSections("awards").catch(() => []),
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
 * Parse team member file name format: "Name_Designation.ext" or "Name_Designation"
 * Returns { name, designation }
 */
export function parseTeamFileName(filename) {
  const nameWithoutExt = filename.replace(/\.[^.]+$/, "").trim();
  const parts = nameWithoutExt.split("_");
  
  if (parts.length < 2) {
    // No underscore found - use entire filename as name, no designation
    return { name: nameWithoutExt, designation: "" };
  }
  
  // Underscore found - first part is name, rest is designation
  const name = parts[0].trim();
  const designation = parts.slice(1).join(" ").trim();
  
  return { name, designation };
}

/** Get client logos from Home Page/Our Client Section folder */
export async function clientLogos() {
  if (!isDriveConfigured()) return [];
  
  try {
    console.log("[drive] Starting to fetch client logos...");
    
    // Use direct folder ID for Home Page
    const homePageFolderId = DRIVE_CONFIG.directFolders?.homePage;
    if (!homePageFolderId) {
      console.error("[drive] Home Page folder ID not configured in DRIVE_CONFIG");
      return [];
    }
    
    console.log("[drive] Using Home Page folder ID:", homePageFolderId);
    
    // Get Our Client Section subfolder
    const clientFolder = await findChildFolder(homePageFolderId, "Our Client Section");
    console.log("[drive] Our Client Section folder:", clientFolder);
    if (!clientFolder) {
      console.error("[drive] Our Client Section folder not found");
      return [];
    }
    
    // Get all image files in Client folder
    const images = await folderImages(clientFolder.id);
    console.log("[drive] found", images.length, "client logos in Our Client Section", images);
    
    return images;
  } catch (err) {
    console.error("[drive] failed to load client logos:", err);
    return [];
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

