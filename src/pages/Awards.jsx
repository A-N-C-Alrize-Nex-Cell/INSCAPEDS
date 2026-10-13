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
import { useSectionImages } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";
import LightboxModal from "../components/LightboxModal";

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
  "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
];

export default function Awards() {
  const driveReady = isDriveConfigured();
  const { data: driveAwardImages } = useSectionImages("awards", AWARD_FOLDER_CANDIDATES);
  const { data: driveSketches } = useSectionImages("awards", SKETCH_FOLDER_CANDIDATES);
  const { data: drivePublications } = useSectionImages("awards", PUBLICATION_FOLDER_CANDIDATES);

  const awardImages = driveReady
    ? (driveAwardImages || []).map((img) => ({
        src: img.src,
        thumb: img.thumb,
        candidates: img.srcCandidates,
        thumbCandidates: img.thumbCandidates,
        alt: img.alt || "Award Image",
      }))
    : staticAwardImages.map((src, idx) => ({
        src,
        thumb: src,
        candidates: [src],
        thumbCandidates: [src],
        alt: `Award image ${idx + 1}`,
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
    ? (drivePublications || []).map((img) => ({
        src: img.src,
        thumb: img.thumb,
        candidates: img.srcCandidates,
        thumbCandidates: img.thumbCandidates,
        alt: img.alt || "Featured Publication",
      }))
    : fallbackPublications.map((src, idx) => ({
        src,
        thumb: src,
        candidates: [src],
        thumbCandidates: [src],
        alt: `Featured publication ${idx + 1}`,
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

  const marqueeList = Array(4).fill(publications).flat();

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
      <section className="container-wide pb-16 md:pb-24">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {awardImages.map((img, num) => (
              <div
                key={num}
                onClick={() => openLightbox(awardImages, num)}
                className="aspect-square bg-sand-200 overflow-hidden group border border-ink-100 cursor-pointer relative"
              >
                <ResilientImage
                  src={img.thumb || img.src}
                  candidates={img.thumbCandidates || img.candidates}
                  alt={img.alt || `Award image ${num + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* PUBLICATIONS SECTION */}
      <section className="bg-sand-200/50 py-16 md:py-24 grain-overlay overflow-hidden mb-16 md:mb-24">
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
          </motion.div>
        </div>

        {/* MARQUEE CONTAINER - Edge to edge */}
        <div className="relative w-full group">
          <div className="flex w-max gap-4 md:gap-6 hover:[animation-play-state:paused] animate-marquee pl-4 md:pl-6">
            {marqueeList.map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(publications, idx % publications.length)}
                className="aspect-square w-64 md:w-96 flex-shrink-0 bg-sand-200 overflow-hidden group border border-ink-100 cursor-pointer"
              >
                <ResilientImage
                  src={img.thumb || img.src}
                  candidates={img.thumbCandidates || img.candidates}
                  alt={img.alt || "Featured publication"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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


