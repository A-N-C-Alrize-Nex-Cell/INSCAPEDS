import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePublications } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";
import LightboxModal from "../components/LightboxModal";
import { getPublicationMetadata } from "../data/publicationMetadata";
import landscapeCover from "../assets/landscape_publication.jpg";

const PUBLICATION_FOLDER_CANDIDATES = [
  "Featured Publication",
  "Featured Publications",
  "Publications",
];

const fallbackPublications = [
  {
    id: "pub-1",
    name: "Picture1.jpg",
    src: "/awards/landscape_publication.jpg",
    thumb: "/awards/landscape_publication.jpg",
    candidates: [landscapeCover, "/awards/landscape_publication.jpg"],
    title: "GLITZ ARCHITECTURE & INTERIORS",
    width: 1200,
    height: 800,
  },
  {
    id: "pub-2",
    name: "Picture2.jpg",
    src: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=600&q=80",
    candidates: ["https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=1200&q=80"],
    title: "APPROBATION",
    width: 1200,
    height: 800,
  },
  {
    id: "pub-3",
    name: "Picture3.jpg",
    src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    candidates: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"],
    title: "JOURNAL OF LANDSCAPE ARCHITECTURE",
    width: 1200,
    height: 800,
  },
  {
    id: "pub-4",
    name: "Picture4.jpg",
    src: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    candidates: ["https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=1200&q=80"],
    title: "THE NEPTUNE GLITZ",
    width: 1200,
    height: 800,
  },
  {
    id: "pub-5",
    name: "Picture5.png",
    src: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
    candidates: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80"],
    title: "CONTEMPORARY PRACTICE",
    width: 1200,
    height: 800,
  },
  {
    id: "pub-6",
    name: "Picture6.png",
    src: "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=1200&q=80",
    thumb: "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=600&q=80",
    candidates: ["https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=1200&q=80"],
    title: "SPATIAL DIALOGUES",
    width: 1200,
    height: 800,
  },
];

export default function PublicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const driveReady = isDriveConfigured();
  const { data: drivePublications, loading } = usePublications();

  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("return_to_section", "featured-publications");
  }, []);

  const publicationsList = driveReady && drivePublications && drivePublications.length > 0
    ? drivePublications
    : fallbackPublications;

  // Resolve active publication by id, folderId, name, or index
  let activeIndex = -1;
  const numericId = parseInt(id, 10);

  if (id) {
    const target = id.toLowerCase();
    activeIndex = publicationsList.findIndex(
      (p) =>
        (p.id && String(p.id).toLowerCase() === target) ||
        (p.folderId && String(p.folderId).toLowerCase() === target) ||
        (p.name && p.name.toLowerCase() === target) ||
        (p.name && p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target) ||
        (p.title && p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === target) ||
        (p.name && p.name.toLowerCase().includes(target))
    );
  }

  if (activeIndex < 0 && !isNaN(numericId) && numericId >= 0 && numericId < publicationsList.length) {
    activeIndex = numericId;
  }

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const currentItem = publicationsList[activeIndex];
  const metadata = getPublicationMetadata(
    currentItem?.name || currentItem?.title || currentItem?.id || id,
    activeIndex
  );

  // Title is ONLY displayed if the client manually adds it in info.txt.
  // Folder names (e.g. "01", "02") are NOT used as title headings on this page.
  const finalTitle = currentItem?.info?.title || (!driveReady ? metadata?.title : "") || "";

  // Only show metadata and description when client provides them in info.txt on Drive
  // (Format and styling are preserved; dummy text is removed until info.txt is dropped)
  const finalMetadata = {
    title: finalTitle,
    publicationName: currentItem?.info?.publication || (!driveReady ? metadata.publicationName : ""),
    issue: currentItem?.info?.issue || (!driveReady ? metadata.issue : ""),
    status: currentItem?.info?.status || (!driveReady ? metadata.status : ""),
    category: currentItem?.info?.category || (!driveReady ? metadata.category : ""),
    description: currentItem?.info?.description || (!driveReady ? metadata.description : ""),
  };

  if (loading && !publicationsList.length) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center text-ink-400">
        Loading publication details…
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
        <h1 className="font-serif text-5xl text-ink-800 mb-6">Publication Not Found</h1>
        <p className="text-ink-600 mb-8">The requested publication could not be found.</p>
        <button onClick={() => navigate("/awards")} className="btn-primary">
          Back to Awards & Publication
        </button>
      </motion.div>
    );
  }

  // Cover image from Drive
  const coverImage = currentItem.src || currentItem.thumb || currentItem.cover?.src;
  const coverCandidates =
    currentItem.srcCandidates || currentItem.cover?.srcCandidates || currentItem.candidates || [coverImage];

  // Gallery images from Drive:
  // When a publication folder contains uploaded images, only display the interior images
  // (uploaded with normal filenames/extensions) in this lower photo gallery grid.
  // Any cover image (e.g. "cover.jpg", "cover.png", or the designated cover) is excluded
  // from this lower gallery so it does not duplicate beneath the top hero banner.
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
      alt: `${finalMetadata.title || finalMetadata.publicationName || "Publication"} - photo ${idx + 1}`,
    }));
  } else if (!currentItem.isFolder && publicationsList.length > 1) {
    galleryItems = publicationsList
      .filter((item) => item.id !== currentItem.id)
      .map((item, idx) => ({
        src: item.src || item.thumb || item.cover?.src,
        candidates: item.srcCandidates || item.cover?.srcCandidates || item.candidates || [item.src || item.thumb],
        width: item.width || 1200,
        height: item.height || 800,
        alt: `${finalMetadata.title || finalMetadata.publicationName || "Publication"} - photo ${idx + 1}`,
      }));
  }

  // Image list for the full Lightbox viewer (gallery photos in sequential order)
  const allImages = galleryItems.map((item, idx) => ({
    src: item.src,
    candidates: item.candidates,
    alt: item.alt || `${finalMetadata.title || finalMetadata.publicationName || "Publication"} - photo ${idx + 1}`,
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
              {finalMetadata.publicationName && (
                <p>
                  <span className="font-bold">Publication</span> : {finalMetadata.publicationName}
                </p>
              )}
              {finalMetadata.issue && (
                <p>
                  <span className="font-bold">Issue / Vol</span> : {finalMetadata.issue}
                </p>
              )}
              {finalMetadata.status && (
                <p>
                  <span className="font-bold">Status</span> : {finalMetadata.status}
                </p>
              )}
              {finalMetadata.category && (
                <p>
                  <span className="font-bold">Category</span> : {finalMetadata.category}
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

