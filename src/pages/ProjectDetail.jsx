import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { projects as staticProjects } from "../data/content";
import { useProjectDetails } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";
import LightboxModal from "../components/LightboxModal";

/**
 * Builds gallery rows of up to 4 fixed-width column "slots": up to 3 hold a
 * single landscape photo, and one (where portraits are available) holds a
 * pair of them side by side.
 */
function buildGalleryRows(items) {
  const isPortrait = (item) => item.width && item.height && item.height > item.width;
  const landscapes = items.filter((item) => !isPortrait(item));
  const portraits = items.filter(isPortrait);

  const pairs = [];
  for (let i = 0; i < portraits.length; i += 2) {
    if (i + 1 < portraits.length) {
      pairs.push(portraits.slice(i, i + 2));
    } else {
      // Single leftover portrait acts as a normal single item in landscapes pool
      landscapes.push(portraits[i]);
    }
  }

  const rows = [];
  let li = 0;
  let pj = 0;
  const SLOTS_PER_ROW = 4;
  const LANDSCAPES_WITH_PAIR = 3;

  while (li < landscapes.length || pj < pairs.length) {
    const pair = pj < pairs.length ? pairs[pj] : null;

    const landscapesThisRow = pair ? LANDSCAPES_WITH_PAIR : SLOTS_PER_ROW;
    const rowLandscapes = landscapes.slice(li, li + landscapesThisRow);
    li += rowLandscapes.length;

    const slots = rowLandscapes.map((item) => ({ type: "single", item }));

    if (pair) {
      // Row 1 (index 0) -> 3rd column (index 2)
      // Row 2 (index 1) -> 2nd column (index 1)
      // Row 3 (index 2) -> 3rd column (index 2), etc.
      const targetPos = (rows.length % 2 === 0) ? 2 : 1;
      const insertAt = Math.min(targetPos, slots.length);
      slots.splice(insertAt, 0, { type: "pair", items: pair });
      pj++;
    }

    if (!slots.length) break;
    rows.push(slots);
  }

  return rows;
}

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

function balanceTwoColumns(paragraphs) {
  if (!paragraphs || paragraphs.length === 0) return [];
  if (paragraphs.length === 2) {
    const p1 = paragraphs[0];
    const p2 = paragraphs[1];
    // Rebalance sentence-by-sentence so both columns have nearly identical length
    if (Math.abs(p1.length - p2.length) > 60) {
      const allSentences = `${p1} ${p2}`.match(/[^.!?]+[.!?]+/g) || [`${p1} ${p2}`];
      const totalLen = allSentences.reduce((acc, s) => acc + s.length, 0);
      let col1 = "";
      let col2 = "";
      let currentLen = 0;
      const targetMid = totalLen / 2;

      for (const sentence of allSentences) {
        const trimmed = sentence.trim();
        if (!col1 || currentLen + trimmed.length <= targetMid + 30) {
          col1 += (col1 ? " " : "") + trimmed;
          currentLen += trimmed.length;
        } else {
          col2 += (col2 ? " " : "") + trimmed;
        }
      }
      return [col1, col2];
    }
  }
  return paragraphs;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const driveReady = isDriveConfigured();
  const { data: driveProject, loading: driveLoading } = useProjectDetails(id);

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const staticProject =
    staticProjects.find((p) => p.id === id) ||
    staticProjects.find((p) => p.title.toLowerCase().replace(/\s+/g, "-") === id);

  const project = driveReady && driveProject
    ? {
        id: driveProject.id,
        title: driveProject.title,
        location: driveProject.location,
        status: driveProject.status || (driveProject.year ? `Completed ${driveProject.year}` : "Completed 2022"),
        area: driveProject.area,
        description: driveProject.description || staticProject?.description || "",
        image: driveProject.cover?.src || staticProject?.image || "",
        imageCandidates: driveProject.cover?.srcCandidates,
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
        status: staticProject.status || (staticProject.year ? `Completed ${staticProject.year}` : "Completed 2022"),
        area: staticProject.size || staticProject.area,
        description: staticProject.description,
        image: staticProject.image,
        gallery: null,
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

  const galleryItems = project.gallery && project.gallery.length
    ? project.gallery
    : fallbackGalleryRows.flat().map(([src, width, height]) => ({ src, candidates: [src], width, height }));

  const galleryRows = buildGalleryRows(galleryItems);

  // Flattened list of all project images for the Lightbox (Cover + Gallery)
  const allImages = [
    { src: project.image, candidates: project.imageCandidates || [project.image], alt: project.title },
    ...galleryItems.map((item, idx) => ({
      src: item.src,
      candidates: item.candidates || [item.src],
      alt: `${project.title} gallery photo ${idx + 1}`,
    })),
  ];

  const descParagraphs = project?.description ? project.description.split(/\n\n+/).filter(Boolean) : [];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pb-16 overflow-x-clip"
    >
      {/* HERO IMAGE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => setLightboxIndex(0)}
        className="relative w-full aspect-[4/3] md:aspect-[21/9] max-h-[55vh] md:max-h-[58vh] overflow-hidden mb-4 md:mb-6 cursor-pointer group"
      >
        <ResilientImage
          src={project.image}
          candidates={project.imageCandidates}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-900/40 to-transparent pointer-events-none" />
      </motion.div>

      {/* HEADER & TWO-COLUMN DESCRIPTION SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="container-wide text-left mb-6 md:mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN: TITLE & METADATA */}
          <div className="lg:col-span-4 space-y-2">
            <h1 className="font-sans font-medium text-2xl sm:text-3xl md:text-4xl text-ink-800 leading-[1.1] mb-2">
              {project.title}
            </h1>
            <div className="text-left text-sm sm:text-base text-ink-700 leading-snug space-y-0.5">
              {project.location && (
                <p><span className="font-bold">Location</span> : {project.location}</p>
              )}
              {project.status && (
                <p><span className="font-bold">Status</span> : {project.status}</p>
              )}
              {project.area && (
                <p><span className="font-bold">Area</span> : {project.area}</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: BALANCED DESCRIPTION IN TWO SEPARATE COLUMNS */}
          {descParagraphs.length > 0 && (
            <div className="lg:col-span-8 columns-1 md:columns-2 gap-4 md:gap-6 text-ink-700 text-xs sm:text-[13px] md:text-sm leading-relaxed font-sans tracking-tight pt-0.5 text-justify">
              {descParagraphs.map((para, i) => (
                <p key={i} className="whitespace-pre-line break-inside-avoid mb-3 last:mb-0">{para}</p>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* PHOTO GALLERY */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px" }}
        className="container-wide mt-4 md:mt-6 space-y-3"
      >
        {galleryRows.map((row, r) => {
          let runningIndex = 1 + row.reduce((acc, _, idx) => {
            if (idx === 0) return 0;
            const prevSlot = row[idx - 1];
            return acc + (prevSlot.type === "pair" ? 2 : 1);
          }, 0);

          return (
            <div key={r} className="flex justify-start gap-3">
              {row.map((slot, i) => {
                if (slot.type === "pair") {
                  const firstIdx = allImages.findIndex((img) => img.src === slot.items[0]?.src);
                  const secondIdx = allImages.findIndex((img) => img.src === slot.items[1]?.src);
                  return (
                    <div
                      key={i}
                      className="h-56 sm:h-64 md:h-72 shrink-0 grow-0 flex gap-1 bg-sand-200 overflow-hidden"
                      style={{ width: "calc((100% - 36px) / 4)" }}
                    >
                      {slot.items.map((item, j) => {
                        const targetIdx = j === 0 ? firstIdx : secondIdx;
                        return (
                          <div
                            key={j}
                            onClick={() => setLightboxIndex(targetIdx >= 0 ? targetIdx : 0)}
                            className="flex-1 h-full min-w-0 overflow-hidden cursor-pointer group"
                          >
                            <ResilientImage
                              src={item.src}
                              candidates={item.candidates}
                              alt=""
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                const targetIdx = allImages.findIndex((img) => img.src === slot.item?.src);
                return (
                  <div
                    key={i}
                    onClick={() => setLightboxIndex(targetIdx >= 0 ? targetIdx : 0)}
                    className="h-56 sm:h-64 md:h-72 shrink-0 grow-0 bg-sand-200 overflow-hidden cursor-pointer group"
                    style={{ width: "calc((100% - 36px) / 4)" }}
                  >
                    <ResilientImage
                      src={slot.item.src}
                      candidates={slot.item.candidates}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </motion.section>

      {/* LIGHTBOX MODAL */}
      <LightboxModal
        isOpen={lightboxIndex !== null}
        images={allImages}
        currentIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </motion.article>
  );
}

