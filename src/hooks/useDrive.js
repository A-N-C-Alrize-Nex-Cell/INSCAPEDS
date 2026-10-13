/**
 * React hooks over src/lib/drive.js.
 *
 * Every hook returns { loading, error, data } and re-runs when its inputs
 * change. Caching lives in the drive layer (src/lib/drive.js's own
 * cache, controlled by DRIVE_CONFIG.cacheStore) — deliberately not
 * duplicated here, so there's exactly one place that decides whether/how
 * long data is cached.
 */

import { useEffect, useState } from "react";
import * as drive from "../lib/drive";

export function useAsync(factory, deps, syncGetter) {
  const serializedDeps = JSON.stringify(deps || []);
  const [state, setState] = useState(() => {
    let initialData = null;
    if (typeof syncGetter === "function") {
      try {
        initialData = syncGetter();
      } catch {
        initialData = null;
      }
    }
    return {
      loading: initialData === null,
      error: null,
      data: initialData,
    };
  });

  useEffect(() => {
    let alive = true;
    setState((s) => (s.data !== null ? s : { ...s, loading: true, error: null }));

    Promise.resolve()
      .then(factory)
      .then((data) => {
        if (alive) setState({ loading: false, error: null, data });
      })
      .catch((error) => {
        if (alive) setState({ loading: false, error, data: null });
        console.error("[useDrive]", error);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedDeps]);

  return state;
}

/* --- pages ---------------------------------------------------------------- */

/** Images for one section subfolder of a page. */
export function useSectionImages(pageKey, sectionName, opts) {
  return useAsync(
    () => drive.sectionImages(pageKey, sectionName, opts),
    [pageKey, sectionName, JSON.stringify(opts || null)],
    () => drive.getCachedSectionImages(pageKey, sectionName, opts)
  );
}

/** One cover image per project subfolder inside a section, ordered by numeric prefix. */
export function useSectionProjectCovers(pageKey, sectionName, opts) {
  return useAsync(
    () => drive.sectionProjectCovers(pageKey, sectionName, opts),
    [pageKey, sectionName, JSON.stringify(opts || null)]
  );
}

/** All section subfolders of a page, ordered by numeric prefix. */
export function usePageSections(pageKey, opts) {
  return useAsync(
    () => drive.pageSections(pageKey, opts),
    [pageKey, JSON.stringify(opts || null)]
  );
}

/* --- projects ------------------------------------------------------------- */

/** Category names for the subnavbar (the app prepends "All"). */
export function useProjectCategories() {
  return useAsync(() => drive.projectCategories(), []);
}

/**
 * Projects for the selected subnavbar tab.
 * Pass "All" (or a falsy value) for every project; otherwise a category name.
 */
export function useProjects(category) {
  return useAsync(
    () =>
      !category || category === "All"
        ? drive.allProjects()
        : drive.categoryProjects(category),
    [category]
  );
}

/**
 * Projects for the selected tab, each already carrying its cover image,
 * gallery, and info.txt metadata (location / area / year / description) via
 * `drive.projectDetails`. Heavier than `useProjects` (one extra Drive call
 * per project, cached) — use it wherever a grid needs to render covers, e.g.
 * the Projects page and Home's Featured Projects section.
 */
export function useProjectsWithDetails(category) {
  return useAsync(async () => {
    const list =
      !category || category === "All"
        ? await drive.allProjects()
        : await drive.categoryProjects(category);
    return Promise.all(
      list.map(async (p) => ({ ...p, ...(await drive.projectDetails(p.folderId, p.title)) }))
    );
  }, [category]);
}

/** One project (by stable id, e.g. "hospitality-1") plus its images. */
export function useProject(id) {
  return useAsync(async () => {
    const project = await drive.findProject(id);
    if (!project) return null;
    const { cover, gallery } = await drive.projectImages(project.folderId);
    return { ...project, cover, gallery };
  }, [id]);
}

/** Same as `useProject`, but also includes info.txt metadata (location / area / year / description). */
export function useProjectDetails(id) {
  return useAsync(async () => {
    const project = await drive.findProject(id);
    if (!project) return null;
    const details = await drive.projectDetails(project.folderId, project.title);
    return { ...project, ...details };
  }, [id]);
}

/* --- team members --------------------------------------------------------- */

/** Team member images from About/People folder with parsed names and designations. */
export function useTeamMembers() {
  return useAsync(
    () => drive.teamMemberImages(),
    [],
    () => drive.getCachedTeamMembers()
  );
}

/* --- clients -------------------------------------------------------------- */

/** Client logos from Home/Client folder. */
export function useClientLogos() {
  const state = useAsync(
    () => drive.clientLogos(),
    [],
    () => drive.getCachedClientLogos()
  );
  console.log("[useClientLogos] returning state:", state);
  return state;
}

/** Collage section images from Home/Collage Section folder, sorted by numeric filename. */
export function useCollageImages() {
  return useAsync(
    () => drive.collageImages(),
    [],
    () => drive.getCachedCollageImages()
  );
}

/* --- contact -------------------------------------------------------------- */

/** Contact page images from Contact folder. */
export function useContactImages() {
  return useAsync(
    () => drive.contactImages(),
    [],
    () => drive.getCachedContactImages()
  );
}

