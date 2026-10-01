import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Award, BookOpen, PenTool, Image as ImageIcon } from "lucide-react";
import sketch1 from "../assets/sketchmayapur.png";
import sketch2 from "../assets/arch_bridge.png";
import sketch3 from "../assets/arch_pavilion.png";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  AnimatedText,
} from "../lib/animations";
import { awards } from "../data/content";
import { useSectionImages } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";

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

export default function Awards() {
  // Live Drive data (only trusted once VITE_DRIVE_API_KEY / ROOT_FOLDER_ID are
  // set — see DRIVE_INTEGRATION.md); falls back to the bundled placeholder
  // images/sketches until Awards/"Awards Grid" and Awards/"Sketches" have content.
  const driveReady = isDriveConfigured();
  const { data: driveAwardImages } = useSectionImages("awards", "Awards Grid");
  const { data: driveSketches } = useSectionImages("awards", "Sketches");

  const awardImages = driveReady && driveAwardImages?.length
    ? driveAwardImages.map((img) => ({ src: img.thumb, candidates: img.thumbCandidates }))
    : staticAwardImages.map((src) => ({ src, candidates: [src] }));

  const sketches = driveReady && driveSketches?.length
    ? driveSketches.map((img) => ({ src: img.thumb, candidates: img.thumbCandidates }))
    : [sketch1, sketch2, sketch3].map((src) => ({ src, candidates: [src] }));

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* HEADER */}
      <section className="pt-32 md:pt-44 pb-16 md:pb-24 container-wide">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="section-label mb-6"
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
          className="mt-8 max-w-2xl text-lg text-ink-600 leading-relaxed"
        >
          Our work has been recognized globally for its commitment to sustainable design, contextual sensitivity, and architectural excellence.
        </motion.p>
      </section>

      {/* AWARDS LIST */}
      <section className="container-wide pb-24 md:pb-36">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full"
        >
          <div className="flex items-center gap-3 mb-12">
            <Award className="text-clay-500" size={28} />
            <h2 className="font-serif text-3xl text-ink-800">Honors and Awards</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {awardImages.map((img, num) => (
              <div key={num} className="aspect-square bg-sand-200 overflow-hidden group border border-ink-100">
                <ResilientImage
                  src={img.src}
                  candidates={img.candidates}
                  alt={`Award image ${num + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SKETCHES SECTION */}
      <section className="container-wide pb-24 md:pb-36">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="w-full"
        >
          <div className="flex items-center gap-3 mb-12">
            <PenTool className="text-clay-500" size={28} />
            <h2 className="font-serif text-3xl text-ink-800">Selected Sketches</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sketches.map((sk, i) => (
              <div key={i} className="aspect-[4/3] bg-sand-200 overflow-hidden group border border-ink-100">
                <ResilientImage src={sk.src} candidates={sk.candidates} alt="Architectural sketch" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply" />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* PUBLICATIONS SECTION (MOCK DATA) */}
      <section className="bg-sand-200/50 py-24 md:py-36 grain-overlay overflow-hidden">
        <div className="container-wide">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="w-full"
          >
            <div className="flex items-center gap-3 mb-12">
              <BookOpen className="text-clay-500" size={28} />
              <h2 className="font-serif text-3xl text-ink-800">Featured Publications</h2>
            </div>
          </motion.div>
        </div>

        {/* MARQUEE CONTAINER - Edge to edge */}
        <div className="relative w-full group">
          <div className="flex w-max gap-4 md:gap-6 hover:[animation-play-state:paused] animate-marquee pl-4 md:pl-6">
            {Array(4).fill([
              "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
            ]).flat().map((img, idx) => (
              <div key={idx} className="aspect-square w-64 md:w-96 flex-shrink-0 bg-sand-200 overflow-hidden group border border-ink-100">
                <img 
                  src={img} 
                  alt="Featured publication" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-transform duration-700 group-hover:scale-105" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide py-24 md:py-36 text-center">
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
    </motion.article>
  );
}

