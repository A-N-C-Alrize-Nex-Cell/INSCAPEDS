import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { projects as staticProjects } from "../data/content";
import { useProjectDetails } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";

/**
 * Builds gallery rows of up to 4 fixed-width column "slots": up to 3 hold a
 * single landscape photo, and one (where portraits are available) holds a
 * pair of them side by side. Every slot — single or pair — takes the exact
 * same column width, so slots line up vertically across every row rather
 * than each row sizing independently. The pair's slot position shifts row
 * to row (start, then one-in, then two-in, cycling) rather than always
 * sitting in the same spot. Once portraits run out (the common case — most
 * projects have far more landscape than portrait photos), every remaining
 * row fills all 4 slots with landscape photos instead of leaving the one
 * slot a pair would have used empty; unknown orientation (missing
 * width/height) counts as landscape.
 * @returns {Array<Array<{type: "single", item} | {type: "pair", items: [a,b]}>>}
 */
function buildGalleryRows(items) {
  const isPortrait = (item) => item.width && item.height && item.height > item.width;
  const landscapes = items.filter((item) => !isPortrait(item));
  const portraits = items.filter(isPortrait);

  const pairs = [];
  for (let i = 0; i < portraits.length; i += 2) pairs.push(portraits.slice(i, i + 2));

  const rows = [];
  let li = 0;
  let pj = 0;
  const SLOTS_PER_ROW = 4;
  const LANDSCAPES_WITH_PAIR = 3; // a pair fills the 4th slot

  while (li < landscapes.length || pj < pairs.length) {
    const pair = pj < pairs.length ? pairs[pj] : null;
    // No pair left to make room for → landscapes fill every slot in the row,
    // so a run of extra landscapes (more landscapes than portraits) never
    // leaves a slot empty.
    const landscapesThisRow = pair ? LANDSCAPES_WITH_PAIR : SLOTS_PER_ROW;
    const rowLandscapes = landscapes.slice(li, li + landscapesThisRow);
    li += rowLandscapes.length;

    const slots = rowLandscapes.map((item) => ({ type: "single", item }));
    if (pair) {
      const insertAt = rows.length % (slots.length + 1);
      slots.splice(insertAt, 0, { type: "pair", items: pair });
      pj++;
    }

    if (!slots.length) break; // safety: nothing left to place
    rows.push(slots);
  }
  return rows;
}

// [url, width, height] — width/height match what's actually requested from
// picsum.photos, so the placeholder gallery demonstrates the same
// landscape/portrait justified layout real Drive photos get.
const fallbackGalleryRows = [
  [
    ["https://picsum.photos/id/1018/1600/1000", 1600, 1000],
    ["https://picsum.photos/id/1015/1000/1500", 1000, 1500],
    ["https://picsum.photos/id/1019/1600/1000", 1600, 1000],
  ],
  [
    ["https://picsum.photos/id/1024/1000/1500", 1000, 1500],
    ["https://picsum.photos/id/1039/1600/1000", 1600, 1000],
    ["https://picsum.photos/id/1043/1000/1500", 1000, 1500],
  ],
];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const driveReady = isDriveConfigured();
  const { data: driveProject, loading: driveLoading } = useProjectDetails(id);

  // Static fallback — used until VITE_DRIVE_API_KEY / ROOT_FOLDER_ID are set
  // (see DRIVE_INTEGRATION.md), or if the id doesn't match a Drive project.
  const staticProject =
    staticProjects.find((p) => p.id === id) ||
    staticProjects.find((p) => p.title.toLowerCase().replace(/\s+/g, "-") === id);

  const project = driveReady && driveProject
    ? {
        id: driveProject.id,
        title: driveProject.title,
        location: driveProject.location,
        area: driveProject.area,
        description: driveProject.description || staticProject?.description || "",
        image: driveProject.cover?.src || staticProject?.image || "",
        imageCandidates: driveProject.cover?.srcCandidates,
        // Exclude the cover by id (not just position 0) — the cover may be a
        // "DP"-named file anywhere in natural order, not necessarily first.
        gallery: (driveProject.gallery || [])
          .filter((img) => img.id !== driveProject.cover?.id)
          .map((img) => ({
            src: img.src,
            candidates: img.srcCandidates,
            width: img.width,
            height: img.height,
          })),
      }
    : staticProject
    ? {
        id: staticProject.id,
        title: staticProject.title,
        location: staticProject.location,
        area: staticProject.size,
        description: staticProject.description,
        image: staticProject.image,
        gallery: null, // falls back to the placeholder gallery below
      }
    : null;

  if (driveReady && driveLoading && !driveProject) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center text-ink-400">
        Loading project…
      </div>
    );
  }

  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen pt-32 flex flex-col items-center justify-center text-center container-wide"
      >
        <h1 className="font-serif text-5xl text-ink-800 mb-6">Project Not Found</h1>
        <p className="text-ink-600 mb-8">The project you are looking for does not exist.</p>
        <button onClick={() => navigate("/projects")} className="btn-primary">
          Back to Projects
        </button>
      </motion.div>
    );
  }

  // Justified-style gallery: every photo shares the same row height, but keeps
  // its own true width (derived from its real aspect ratio — no cropping), so
  // a landscape photo sits wide and a portrait sits narrow. Photos are first
  // arranged so portraits group into pairs, then explicitly split into rows
  // (~4 image-widths each, at most 2 portraits per row) rather than left to
  // the browser's automatic wrapping. Falls back to the placeholder photos
  // (each carrying its own known aspect ratio) when Drive has no extra
  // gallery images yet.
  const galleryRows = buildGalleryRows(
    project.gallery && project.gallery.length
      ? project.gallery
      : fallbackGalleryRows.flat().map(([src, width, height]) => ({ src, candidates: [src], width, height }))
  );

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pb-24 overflow-x-clip"
    >
      {/* HERO IMAGE — sits flush at the top so the transparent header overlays it, same as Home */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full aspect-[4/3] md:aspect-[21/9] max-h-[62vh] md:max-h-[66vh] overflow-hidden mb-3 md:mb-4"
      >
        <ResilientImage
          src={project.image}
          candidates={project.imageCandidates}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        {/* Keeps the header's white nav text legible over whatever's in the top of the photo */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-900/40 to-transparent pointer-events-none" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-none text-right pl-6 pr-3 md:pr-4 lg:pr-6 mb-6 md:mb-8"
      >
        <div className="inline-block text-right max-w-2xl">
          <h1 className="font-serif text-xl sm:text-2xl md:text-4xl lg:text-5xl text-ink-800 leading-[1.1] mb-1 md:mb-1.5">
            {project.title}
          </h1>
          <div className="text-right text-base md:text-lg text-ink-700 leading-relaxed">
            {project.location && (
              <p><span className="font-bold">Location</span> : {project.location}</p>
            )}
            {project.area && (
              <p><span className="font-bold">Area</span> : {project.area}</p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mt-5 md:mt-6 text-right"
          >
            <h3 className="font-serif text-3xl md:text-4xl text-ink-800 mb-3">
              About the Project
            </h3>
            <p className="text-lg md:text-xl leading-relaxed text-ink-700">
              {project.description}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* PHOTO GALLERY — fixed-width columns (4 per row) so slots line up
          across every row; a landscape photo fills its column, a portrait
          pair splits one column in half — at most 2 portraits per row,
          positioned wherever they fall in the arranged order (see
          buildGalleryRows). */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="container-wide mt-16 md:mt-24 space-y-3"
      >
        {galleryRows.map((row, r) => (
          <div key={r} className="flex justify-start gap-3">
            {row.map((slot, i) =>
              slot.type === "pair" ? (
                <div
                  key={i}
                  className="h-56 sm:h-64 md:h-72 shrink-0 grow-0 flex gap-1 bg-sand-200 overflow-hidden"
                  style={{ width: "calc((100% - 36px) / 4)" }}
                >
                  {slot.items.map((item, j) => (
                    <ResilientImage
                      key={j}
                      src={item.src}
                      candidates={item.candidates}
                      alt=""
                      loading="lazy"
                      className="flex-1 h-full min-w-0 object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div
                  key={i}
                  className="h-56 sm:h-64 md:h-72 shrink-0 grow-0 bg-sand-200 overflow-hidden"
                  style={{ width: "calc((100% - 36px) / 4)" }}
                >
                  <ResilientImage
                    src={slot.item.src}
                    candidates={slot.item.candidates}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}
          </div>
        ))}
      </motion.section>
    </motion.article>
  );
}
