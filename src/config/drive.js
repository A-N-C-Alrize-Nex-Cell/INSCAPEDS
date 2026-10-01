/**
 * Google Drive integration — configuration.
 *
 * All images on the site are read live from a shared Google Drive folder tree.
 * There is no build step: the browser calls the Drive API v3 directly with a
 * restricted API key, so updating a Drive folder updates the site on the next
 * page load (within `cacheTtlMs`).
 *
 * Folder layout expected in Drive:
 *
 *   <root>/
 *     Home/
 *       01 Hero/            -> images
 *       02 Featured/        -> images
 *       ...
 *     About/
 *       01 Intro/
 *       ...
 *     Projects/                        (special — see below)
 *       Hospitality/
 *         1 Hotel Sonar Bangla, Kolaghat/
 *           01.jpg   (first image, by name, is the cover)
 *           02.jpg
 *         2 Some Resort/
 *       Residential/
 *         1 .../
 *       Public/
 *       ...
 *
 * Section subfolders may be prefixed with a number ("01 Hero") to control
 * order; the code sorts on that number and uses the rest as the label.
 *
 * Project folders MUST be prefixed with a number ("1 Title", "2 Title"). The
 * number sets the order shown when a category is selected; the rest of the
 * folder name is the project title.
 */

export const DRIVE_CONFIG = {
  /** Restricted browser API key. Set VITE_DRIVE_API_KEY in .env (see .env.example). */
  apiKey: import.meta.env.VITE_DRIVE_API_KEY || "",

  /**
   * ID of the shared root folder that contains Home/, About/, Projects/, ...
   * (the long string in the folder's share URL: /folders/<THIS>).
   * Set VITE_DRIVE_ROOT_FOLDER_ID in .env.
   */
  rootFolderId: import.meta.env.VITE_DRIVE_ROOT_FOLDER_ID || "",

  /** How long (ms) a folder listing is cached in the browser before re-fetching. 30 seconds for instant updates. */
  cacheTtlMs: 30 * 1000,

  /** Where listings are cached: "local" (localStorage), "session", or "none". "local" with 30s TTL = instant loads + always fresh. */
  cacheStore: "local",

  /**
   * Logical page key -> folder NAME inside the root folder.
   * Add/rename freely; the key is what the app code refers to.
   */
  pages: {
    home: "Home",
    about: "About Us Page",
    awards: "Awards",
    contact: "Contact",
    // team: "Team",
  },

  /** Name of the folder (inside root) that holds the project categories. */
  projectsFolder: "Projects",

  /**
   * Optional fixed category order / whitelist for the Projects subnavbar.
   * Leave empty to read categories straight from Drive (folder names, natural
   * order). "All" is always added by the app as the first tab.
   */
  projectCategories: [], // e.g. ["Hospitality", "Residential", "Public"]

  /** Pixel width requested from Drive's image CDN for full-size display. */
  imageWidth: 1920,

  /** Direct folder IDs for pages that are shared separately (not under root). */
  directFolders: {
    aboutUsPage: "1iILM2TxtqWsUYb4jQUNEYC6NVAHEk5yn",
  },

  /** Direct folder IDs for pages that are shared separately (not under root). */
  directFolders: {
    homePage: "1nBJqqszzNytGqHX40V2F7EJluEwr1euq",
    aboutUsPage: "1iILM2TxtqWsUYb4jQUNEYC6NVAHEk5yn",
    awardsPage: "1EmWBHMSevumK1tKpggfrSfbm5gPCn5QI",
    contactPage: "1IAEUbA153jQ2_FZ_vrcZZnPL_igWExY7",
  },

  /** Pixel width requested for thumbnails / grid cells. */
  thumbWidth: 640,
};
