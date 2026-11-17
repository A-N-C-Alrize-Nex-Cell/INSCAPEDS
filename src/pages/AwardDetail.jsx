import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAwards } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";
import LightboxModal from "../components/LightboxModal";
import { getAwardMetadata } from "../data/awardMetadata";

const fallbackAwards = [
  {
    id: "award-1",
    name: "HUDCO Design Awards",
    src: "/awards/award1.jpg",
    thumb: "/awards/award1.jpg",
    candidates: ["/awards/award1.jpg"],
    title: "HUDCO DESIGN AWARDS",
    width: 1200,
    height: 800,
  },
  {
    id: "award-2",
    name: "ISOLA Design Excellence",
    src: "/awards/award2.jpg",
    thumb: "/awards/award2.jpg",
    candidates: ["/awards/award2.jpg"],
    title: "ISOLA DESIGN EXCELLENCE AWARD",
    width: 1200,
    height: 800,
  },
  {
    id: "award-3",
    name: "IIA National Award",
    src: "/awards/award3.jpg",
    thumb: "/awards/award3.jpg",
    candidates: ["/awards/award3.jpg"],
    title: "IIA NATIONAL AWARD FOR EXCELLENCE",
    width: 1200,
    height: 800,
  },
  {
    id: "award-4",
    name: "AIA Honor Award",
    src: "/awards/award4.jpg",
    thumb: "/awards/award4.jpg",
    candidates: ["/awards/award4.jpg"],
    title: "AIA HONOR AWARD",
    width: 1200,
    height: 800,
  },
  {
    id: "award-5",
    name: "Architizer A+ Award",
    src: "/awards/award5.jpg",
    thumb: "/awards/award5.jpg",
    candidates: ["/awards/award5.jpg"],
    title: "ARCHITIZER A+ AWARD",
    width: 1200,
    height: 800,
  },
  {
    id: "award-6",
    name: "Dezeen Award",
    src: "/awards/award6.jpg",
    thumb: "/awards/award6.jpg",
    candidates: ["/awards/award6.jpg"],
    title: "DEZEEN AWARDS",
    width: 1200,
    height: 800,
  },
];

export default function AwardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const driveReady = isDriveConfigured();
  const { data: driveAwards, loading } = useAwards();

  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("return_to_section", "honors-and-awards");
  }, []);

  const awardsList = driveReady && driveAwards && driveAwards.length > 0
    ? driveAwards
    : fallbackAwards;

  // Resolve active award by id, folderId, name, or index
  let activeIndex = -1;
  const numericId = parseInt(id, 10);

  if (id) {
    const target = id.toLowerCase();
    activeIndex = awardsList.findIndex(
      (a) =>
        (a.id && String(a.id).toLowerCase() === target) ||
        (a.folderId && String(a.folderId).toLowerCase() === target) ||
        (a.name && a.name.toLowerCase() === target) ||
        (a.name && a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target) ||
        (a.title && a.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target) ||
        (a.name && a.name.toLowerCase().includes(target))
    );
  }

  if (activeIndex < 0 && !isNaN(numericId) && numericId >= 0 && numericId < awardsList.length) {
    activeIndex = numericId;
  }

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const currentItem = awardsList[activeIndex];
  const metadata = getAwardMetadata(
    currentItem?.name || currentItem?.title || currentItem?.id || id,
    activeIndex
  );

  // Title is ONLY displayed if the client manually adds it in info.txt.
  // Folder names (e.g. "01", "HUDCO") are NOT used as title headings on this page.
  const finalTitle = currentItem?.info?.title || (!driveReady ? metadata?.title : "") || "";

  // Only show metadata and description when client provides them in info.txt on Drive
  // (Format and styling are preserved; dummy text is omitted until info.txt is dropped)
  const finalMetadata = {
    title: finalTitle,
    awardName: currentItem?.info?.award || (!driveReady ? metadata.awardName : ""),
    year: currentItem?.info?.year || (!driveReady ? metadata.year : ""),
    project: currentItem?.info?.project || (!driveReady ? metadata.project : ""),
    status: currentItem?.info?.status || (!driveReady ? metadata.status : ""),
    category: currentItem?.info?.category || (!driveReady ? metadata.category : ""),
    description: currentItem?.info?.description || (!driveReady ? metadata.description : ""),
  };

  if (loading && !awardsList.length) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center text-ink-400">
        Loading award details…
      </div>
    );
  }

  if (!currentItem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen pt-32 flex flex-col items-center justify-center text-center container-wide"
      >
        <h1 className="font-serif text-5xl text-ink-800 mb-6">Award Not Found</h1>
        <p className="text-ink-600 mb-8">The requested award could not be found.</p>
        <button onClick={() => navigate("/awards")} className="btn-primary">
          Back to Honors & Awards
        </button>
      </motion.div>
    );
  }

  // Cover image from Drive
  const coverImage = currentItem.src || currentItem.thumb || currentItem.cover?.src;

  // Gallery images from Drive:
  // When an award folder contains uploaded images, only display the interior images
  // (uploaded with normal filenames/extensions) in this lower photo gallery grid.
  // Any cover image (e.g. "cover.jpg", "cover.png", or the designated cover) is excluded
  // from this lower gallery so it does not duplicate beneath the heading/metadata.
  let galleryItems = [];
  if (currentItem.isFolder && currentItem.images && currentItem.images.length > 0) {
    const sourceImages = currentItem.galleryImages || currentItem.images;
    const interiorImages = sourceImages.filter((img) => {
      const name = String(img.name || "").toLowerCase();
      if (/cover/i.test(name)) return false;
      if (currentItem.cover?.id && img.id === currentItem.cover.id) return false;
      if (currentItem.cover?.name && img.name === currentItem.cover.name) return false;
      if (coverImage && (img.src === coverImage || img.thumb === coverImage)) return false;
      return true;
    });

    galleryItems = interiorImages.map((item, idx) => ({
      src: item.src || item.thumb,
      candidates: item.srcCandidates || item.candidates || [item.src || item.thumb],
      width: item.width || 1200,
      height: item.height || 800,
      alt: `${finalMetadata.title || finalMetadata.awardName || "Award"} - photo ${idx + 1}`,
    }));
  } else if (!currentItem.isFolder && awardsList.length > 1) {
    galleryItems = awardsList
      .filter((item) => item.id !== currentItem.id)
      .map((item, idx) => ({
        src: item.src || item.thumb || item.cover?.src,
        candidates: item.srcCandidates || item.cover?.srcCandidates || item.candidates || [item.src || item.thumb],
        width: item.width || 1200,
        height: item.height || 800,
        alt: `${finalMetadata.title || finalMetadata.awardName || "Award"} - photo ${idx + 1}`,
      }));
  }

  // Image list for the full Lightbox viewer (gallery photos in sequential order)
  const allImages = galleryItems.map((item, idx) => ({
    src: item.src,
    candidates: item.candidates,
    alt: item.alt || `${finalMetadata.title || finalMetadata.awardName || "Award"} - photo ${idx + 1}`,
  }));

  const descParagraphs = finalMetadata.description
    ? finalMetadata.description.split(/\n\n+/).filter(Boolean)
    : [];

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="pt-28 md:pt-36 pb-16 overflow-x-clip"
    >
      {/* HEADER & TWO-COLUMN DESCRIPTION SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="container-wide text-left mb-6 md:mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* LEFT COLUMN: TITLE & METADATA */}
          <div className="lg:col-span-4 space-y-2">
            {finalMetadata.title && (
              <h1 className="font-sans font-medium text-2xl sm:text-3xl md:text-4xl text-ink-800 leading-[1.1] mb-2 uppercase">
                {finalMetadata.title}
              </h1>
            )}
            <div className="text-left text-sm sm:text-base text-ink-700 leading-snug space-y-0.5">
              {finalMetadata.awardName && (
                <p>
                  <span className="font-bold">Award</span> : {finalMetadata.awardName}
                </p>
              )}
              {finalMetadata.year && (
                <p>
                  <span className="font-bold">Year</span> : {finalMetadata.year}
                </p>
              )}
              {finalMetadata.project && (
                <p>
                  <span className="font-bold">Project</span> : {finalMetadata.project}
                </p>
              )}
              {finalMetadata.category && (
                <p>
                  <span className="font-bold">Category</span> : {finalMetadata.category}
                </p>
              )}
              {finalMetadata.status && (
                <p>
                  <span className="font-bold">Status</span> : {finalMetadata.status}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: BALANCED DESCRIPTION IN TWO SEPARATE COLUMNS */}
          {descParagraphs.length > 0 && (
            <div className="lg:col-span-8 columns-1 md:columns-2 gap-4 md:gap-6 text-ink-700 text-xs sm:text-[13px] md:text-sm leading-relaxed font-sans tracking-tight pt-0.5 text-justify">
              {descParagraphs.map((para, i) => (
                <p key={i} className="whitespace-pre-line break-inside-avoid mb-3 last:mb-0">
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* PHOTO GALLERY — 4x4 GRID PATTERN */}
      {galleryItems.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px" }}
          className="container-wide mt-4 md:mt-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {galleryItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className="aspect-[3/4] bg-sand-200 overflow-hidden group border border-ink-100 cursor-pointer relative"
              >
                <ResilientImage
                  src={item.src}
                  candidates={item.candidates}
                  alt={item.alt || `${finalMetadata.title} photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </motion.section>
      )}

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
