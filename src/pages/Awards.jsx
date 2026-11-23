import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Award, BookOpen, PenTool, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import sketch1 from "../assets/sketchmayapur.png";
import sketch2 from "../assets/arch_bridge.png";
import sketch3 from "../assets/arch_pavilion.png";
import {
  fadeUp,
  staggerContainer,
  AnimatedText,
} from "../lib/animations";
import { useSectionImages, usePublications, useAwards } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";
import LightboxModal from "../components/LightboxModal";
import { getPublicationMetadata } from "../data/publicationMetadata";
import { getAwardMetadata } from "../data/awardMetadata";

const staticAwardImages = [
  "/awards/award1.jpg",
  "/awards/award2.jpg",
  "/awards/award3.jpg",
  "/awards/award4.jpg",
  "/awards/award5.jpg",
  "/awards/award6.jpg",
  "/awards/award7.jpg",
  "/awards/award1.jpg",
  "/awards/award9.jpg",
];

const AWARD_FOLDER_CANDIDATES = [
  "Honors And Awards",
  "Honors and Awards",
  "Awards Grid",
  "Awards",
];

const SKETCH_FOLDER_CANDIDATES = [
  "Selected Sketches",
  "Sketches",
];

const PUBLICATION_FOLDER_CANDIDATES = [
  "Featured Publication",
  "Featured Publications",
  "Publications",
];

const fallbackPublications = [
  "/awards/landscape_publication.jpg",
  "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=400&q=80",
];

export default function Awards() {
  const driveReady = isDriveConfigured();
  const { data: driveAwards, loading: isAwardsLoading } = useAwards();
  const { data: driveSketches, loading: isSketchesLoading } = useSectionImages("awards", SKETCH_FOLDER_CANDIDATES);
  const { data: drivePublications, loading: isPublicationsLoading } = usePublications();

  useEffect(() => {
    const returnTarget = sessionStorage.getItem("return_to_section");
    if (returnTarget) {
      sessionStorage.removeItem("return_to_section");
      const el = document.getElementById(returnTarget);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } else if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, []);

  const awardList = driveReady
    ? (driveAwards || []).map((award, idx) => {
      const meta = getAwardMetadata(award.name || award.title || award.id, idx);
      const resolvedTitle =
        award.coverInfo?.title ||
        award.info?.title ||
        award.title ||
        award.name ||
        meta?.title ||
        `Award ${idx + 1}`;

      return {
        id: award.id || award.folderId || `award-${idx}`,
        name: award.name || `Award ${idx + 1}`,
        title: resolvedTitle,
        src: award.src || award.cover?.src,
        thumb: award.thumb || award.cover?.thumb,
        candidates: award.srcCandidates || award.cover?.srcCandidates || [award.src],
        thumbCandidates: award.thumbCandidates || award.cover?.thumbCandidates || [award.thumb],
        alt: award.alt || resolvedTitle || "Honors and Awards",
        coverInfo: award.coverInfo || null,
      };
    })
    : staticAwardImages.map((src, idx) => ({
      id: `award-${idx}`,
      name: `Award ${idx + 1}`,
      title: `Award ${idx + 1}`,
      src,
      thumb: src,
      candidates: [src],
      thumbCandidates: [src],
      alt: `Award image ${idx + 1}`,
      coverInfo: null,
    }));

  const sketches = driveReady
    ? (driveSketches || []).map((img) => ({
      src: img.src,
      thumb: img.thumb,
      candidates: img.srcCandidates,
      thumbCandidates: img.thumbCandidates,
      alt: img.alt || "Architectural sketch",
    }))
    : [sketch1, sketch2, sketch3].map((src) => ({
      src,
      thumb: src,
      candidates: [src],
      thumbCandidates: [src],
      alt: "Architectural sketch",
    }));

  const publications = driveReady
    ? (drivePublications || []).map((pub, idx) => {
      const meta = getPublicationMetadata(pub.name || pub.title || pub.id, idx);
      const resolvedTitle =
        pub.coverInfo?.title ||
        pub.info?.title ||
        pub.title ||
        pub.name ||
        meta?.title ||
        `Publication ${idx + 1}`;

      return {
        id: pub.id || pub.folderId || `pub-${idx}`,
        name: pub.name || `Publication ${idx + 1}`,
        title: resolvedTitle,
        src: pub.src || pub.cover?.src,
        thumb: pub.thumb || pub.cover?.thumb,
        candidates: pub.srcCandidates || pub.cover?.srcCandidates || [pub.src],
        thumbCandidates: pub.thumbCandidates || pub.cover?.thumbCandidates || [pub.thumb],
        alt: pub.alt || resolvedTitle || "Featured Publication",
        coverInfo: pub.coverInfo || null,
      };
    })
    : fallbackPublications.map((src, idx) => ({
      id: `pub-${idx}`,
      name: `Publication ${idx + 1}`,
      title: `Publication ${idx + 1}`,
      src,
      thumb: src,
      candidates: [src],
      thumbCandidates: [src],
      alt: `Featured publication ${idx + 1}`,
      coverInfo: null,
    }));

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxList, setLightboxList] = useState([]);

  const openLightbox = (list, index) => {
    setLightboxList(list);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* HEADER */}
      <section className="pt-28 md:pt-40 pb-6 md:pb-8 container-wide">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="section-label mb-4"
        >
          Recognition
        </motion.p>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-ink-800 max-w-4xl leading-[1.1]">
          <AnimatedText text="Awards & Publication" delay={0.3} />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 text-base md:text-lg text-ink-600 leading-relaxed max-w-none whitespace-normal lg:whitespace-nowrap overflow-x-auto"
        >
          Our work has been recognized globally for its commitment to sustainable design, contextual sensitivity, and architectural excellence.
        </motion.p>
      </section>

      {/* AWARDS LIST */}
      <section id="honors-and-awards" className="container-wide pb-16 md:pb-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full"
        >
          <div className="flex items-center gap-3 mb-8">
            <Award className="text-clay-500" size={26} />
            <h2 className="font-serif text-2xl md:text-3xl text-ink-800">Honors and Awards</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
            {driveReady && isAwardsLoading && (!driveAwards || driveAwards.length === 0) ? (
              [0, 1, 2, 3].map((num) => (
                <div key={num} className="animate-pulse">
                  <div className="aspect-square bg-sand-200/80 rounded border border-ink-100/50 mb-3" />
                  <div className="h-4 w-3/4 bg-sand-300/50 rounded mb-1.5" />
                  <div className="h-3 w-1/2 bg-sand-300/40 rounded" />
                </div>
              ))
            ) : (
              awardList.map((item, num) => {
                const linkTarget = item.id || num;
                const hasCoverInfo = Boolean(
                  item.coverInfo &&
                  (item.coverInfo.title || item.coverInfo.line2 || item.coverInfo.line3)
                );
                return (
                  <Link
                    key={num}
                    to={`/awards/award/${linkTarget}`}
                    className="group block w-full text-left cursor-pointer"
                  >
                    <div className="aspect-square bg-sand-200 overflow-hidden border border-ink-100 relative">
                      <ResilientImage
                        src={item.thumb || item.src}
                        candidates={item.thumbCandidates || item.candidates}
                        alt={item.alt || item.title || `Award image ${num + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    {hasCoverInfo && (
                      <div className="mt-3 flex items-start justify-between gap-2.5 sm:gap-3">
                        {item.coverInfo.title && (
                          <h3 className="flex-1 min-w-0 font-sans text-[13px] text-ink-900 font-bold uppercase tracking-wide leading-snug break-words">
                            {item.coverInfo.title}
                          </h3>
                        )}
                        {(item.coverInfo.line2 || item.coverInfo.line3) && (
                          <div className="min-w-0 text-left text-[10px] sm:text-[11px] font-sans space-y-0.5 sm:mr-2 md:sm:mr-3 flex-shrink-0">
                            {(() => {
                              const text = item.coverInfo.line2 || "";
                              const match = text.match(/^inscape[\s:/-]+(.+)$/i);
                              if (match) {
                                return (
                                  <>
                                    <p className="font-bold text-ink-900 tracking-wide leading-snug whitespace-nowrap">
                                      Inscape
                                    </p>
                                    <p className="font-bold text-ink-900 tracking-wide leading-snug whitespace-nowrap">
                                      {match[1].trim()}
                                    </p>
                                  </>
                                );
                              }
                              return (
                                text && (
                                  <p className="font-bold text-ink-900 tracking-wide leading-snug whitespace-nowrap">
                                    {text}
                                  </p>
                                )
                              );
                            })()}
                            {item.coverInfo.line3 && (
                              <p className="text-ink-500 leading-snug whitespace-nowrap">
                                {item.coverInfo.line3}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>
      </section>

      {/* PUBLICATIONS SECTION */}
      <section id="featured-publications" className="bg-sand-200/50 py-16 md:py-24 grain-overlay overflow-hidden mb-16 md:mb-24">
        <div className="container-wide">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="w-full"
          >
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="text-clay-500" size={26} />
              <h2 className="font-serif text-2xl md:text-3xl text-ink-800">Featured Publications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
              {driveReady && isPublicationsLoading && (!drivePublications || drivePublications.length === 0) ? (
                [0, 1, 2, 3].map((num) => (
                  <div key={num} className="animate-pulse">
                    <div className="aspect-[3/4] bg-sand-200/80 rounded border border-ink-100/50 mb-3" />
                    <div className="h-4 w-3/4 bg-sand-300/50 rounded mb-1.5" />
                    <div className="h-3 w-1/2 bg-sand-300/40 rounded" />
                  </div>
                ))
              ) : (
                publications.map((item, idx) => {
                  const linkTarget = item.id || idx;
                  const hasCoverInfo = Boolean(
                    item.coverInfo &&
                    (item.coverInfo.title || item.coverInfo.line2 || item.coverInfo.line3)
                  );
                  return (
                    <Link
                      key={idx}
                      to={`/awards/publication/${linkTarget}`}
                      className="group block w-full text-left cursor-pointer"
                    >
                      <div className="aspect-[3/4] bg-sand-200 overflow-hidden border border-ink-100 relative">
                        <ResilientImage
                          src={item.thumb || item.src}
                          candidates={item.thumbCandidates || item.candidates}
                          alt={item.alt || item.title || "Featured publication"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      {hasCoverInfo && (
                        <div className="mt-3 flex items-start justify-between gap-2.5 sm:gap-3">
                          {item.coverInfo.title && (
                            <h3 className="flex-1 min-w-0 font-sans text-[13px] text-ink-900 font-bold uppercase tracking-wide leading-snug break-words">
                              {item.coverInfo.title}
                            </h3>
                          )}
                          {(item.coverInfo.line2 || item.coverInfo.line3) && (
                            <div className="min-w-0 text-left text-[10px] sm:text-[11px] font-sans space-y-0.5 sm:mr-2 md:sm:mr-3 flex-shrink-0">
                              {(() => {
                                const text = item.coverInfo.line2 || "";
                                const match = text.match(/^inscape[\s:/-]+(.+)$/i);
                                if (match) {
                                  return (
                                    <>
                                      <p className="font-bold text-ink-900 tracking-wide leading-snug whitespace-nowrap">
                                        Inscape
                                      </p>
                                      <p className="font-bold text-ink-900 tracking-wide leading-snug whitespace-nowrap">
                                        {match[1].trim()}
                                      </p>
                                    </>
                                  );
                                }
                                return (
                                  text && (
                                    <p className="font-bold text-ink-900 tracking-wide leading-snug whitespace-nowrap">
                                      {text}
                                    </p>
                                  )
                                );
                              })()}
                              {item.coverInfo.line3 && (
                                <p className="text-ink-500 leading-snug whitespace-nowrap">
                                  {item.coverInfo.line3}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SKETCHES SECTION */}
      <section className="container-wide pb-16 md:pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full"
        >
          <div className="flex items-center gap-3 mb-8">
            <PenTool className="text-clay-500" size={26} />
            <h2 className="font-serif text-2xl md:text-3xl text-ink-800">Selected Sketches</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {sketches.map((sk, i) => (
              <div
                key={i}
                onClick={() => openLightbox(sketches, i)}
                className="aspect-[4/3] bg-sand-200 overflow-hidden group border border-ink-100 cursor-pointer relative"
              >
                <ResilientImage
                  src={sk.thumb || sk.src}
                  candidates={sk.thumbCandidates || sk.candidates}
                  alt={sk.alt || "Architectural sketch"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container-wide py-16 md:py-24 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 className="font-serif text-3xl md:text-5xl text-ink-800 mb-8">
            Want to work with us?
          </h2>
          <Link to="/contact" className="btn-primary">
            Get in touch
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* LIGHTBOX MODAL */}
      <LightboxModal
        isOpen={lightboxIndex !== null}
        images={lightboxList}
        currentIndex={lightboxIndex ?? 0}
        onClose={closeLightbox}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </motion.article>
  );
}


