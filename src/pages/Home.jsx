import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Infinity } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  scaleIn,
  AnimatedText,
} from "../lib/animations";
import { stats } from "../data/content";
import ProjectCard from "../components/ProjectCard";
import Home_2ndSection from "./Home_2ndSection";
import AnimatedCounter from "../components/AnimatedCounter";
import { useProjectsWithDetails, useSectionImages, useClientLogos } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";

import archTower from "../assets/arch_tower.png";
import archMuseum from "../assets/arch_museum.png";
import archPavilion from "../assets/arch_pavilion.png";
import archLibrary from "../assets/arch_library.png";
import archBridge from "../assets/arch_bridge.png";
import joypurContrasted from "../assets/joypur_forest_contrasted.jpeg";
import joypurOriginal from "../assets/joypur_forest.jpg";

import towerRender from "../assets/tower_render.png";
import museumRender from "../assets/museum_render.png";
import pavilionRender from "../assets/pavilion_render.png";
import libraryRender from "../assets/library_render.png";
import bridgeRender from "../assets/bridge_render.png";

const newFeaturedProjects = [
  { id: '1', title: 'Observation Tower', location: 'Metropolis', year: '2027', category: 'Public', image: archTower, hoverImage: towerRender },
  { id: '2', title: 'Joypur Forest Resort', location: 'Joypur', year: '2024', category: 'Hospitality', image: joypurContrasted, hoverImage: joypurOriginal },
  { id: '3', title: 'Curved Museum', location: 'Downtown', year: '2028', category: 'Cultural', image: archMuseum, hoverImage: museumRender },
  { id: '4', title: 'Geometric Pavilion', location: 'Parkside', year: '2025', category: 'Public', image: archPavilion, hoverImage: pavilionRender },
  { id: '5', title: 'Staggered Library', location: 'City Center', year: '2027', category: 'Cultural', image: archLibrary, hoverImage: libraryRender },
  { id: '6', title: 'Pedestrian Bridge', location: 'Riverside', year: '2026', category: 'Infrastructure', image: archBridge, hoverImage: bridgeRender },
];

const publicationImages = [
  "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=400&q=80",
];

export default function Home() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Video autoplay blocked:", e));
    }
  }, []);

  // Live Drive data (only trusted once VITE_DRIVE_API_KEY / ROOT_FOLDER_ID are
  // set — see DRIVE_INTEGRATION.md); the hard-coded arrays above stay as the
  // fallback so the homepage keeps working before Drive is configured.
  const driveReady = isDriveConfigured();
  const { data: driveProjects } = useProjectsWithDetails("All");
  const { data: drivePublications } = useSectionImages("home", "Publications");
  const { data: driveClientLogos } = useClientLogos();

  const featuredProjects = driveReady && driveProjects?.length
    ? driveProjects.slice(0, 6).map((p) => {
        // First gallery image that isn't the cover (cover may be a "DP"-named
        // file anywhere in natural order, not necessarily the first image).
        const hover = p.gallery?.find((img) => img.id !== p.cover?.id) || p.cover;
        return {
          id: p.id,
          title: p.title,
          location: p.location || p.category,
          year: p.year,
          category: p.category,
          // Card-sized tile — use the smaller thumbnail, not the full 1920px image.
          image: p.cover?.thumb || "",
          imageCandidates: p.cover?.thumbCandidates,
          hoverImage: hover?.thumb || "",
          hoverImageCandidates: hover?.thumbCandidates,
        };
      })
    : newFeaturedProjects;

  const marqueePublications = driveReady && drivePublications?.length
    ? drivePublications.map((img) => ({ src: img.thumb, candidates: img.thumbCandidates }))
    : publicationImages.map((src) => ({ src, candidates: [src] }));

  const clientImages = driveReady && driveClientLogos?.length ? driveClientLogos : [];
  
  console.log("[Home] clientImages:", clientImages);
  console.log("[Home] clientImages.length:", clientImages.length);
  console.log("[Home] driveReady:", driveReady);
  console.log("[Home] driveClientLogos:", driveClientLogos);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-ink-900">
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            src="/hero.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/30 via-ink-900/10 to-ink-900/40" />
        </div>

        <div className="relative h-full container-wide flex flex-col justify-end pb-24 md:pb-32">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="section-label text-sand-200 mb-6"
          >
            Landscape Design Studio — Est. 2014
          </motion.p>
          <h1 className="font-serif text-sand-50 text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.15] max-w-sm sm:max-w-lg md:max-w-5xl lg:max-w-6xl xl:max-w-7xl">
            <AnimatedText text="Creating Landscapes That Engage The Senses, Enrich Everyday Life, And Give Meaning To Place." delay={0.3} />
          </h1>
        </div>
      </section>

      {/* NEW 2ND SECTION */}
      <Home_2ndSection />



      {/* FEATURED PROJECTS */}
      <section className="bg-sand-100 pt-12 md:pt-16 pb-24 md:pb-36">
        <div className="container-wide">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-end justify-between mb-0 md:mb-2"
          >
            <div>
              <h2 className="font-sans font-medium text-3xl md:text-5xl text-ink-800">
                Spaces We've Shaped
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden md:inline-flex items-center gap-2 text-sm text-ink-700 hover:text-clay-500 transition-colors link-underline"
            >
              View all
              <ArrowUpRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0 mt-8"
          >
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </motion.div>

          <div className="mt-12 md:hidden">
            <Link to="/projects" className="btn-outline">
              View all projects
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* PUBLICATIONS & STATS BANNER */}
      <section className="flex flex-col justify-center bg-sand-200 grain-overlay relative overflow-hidden py-16 md:py-20 min-h-screen">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col w-full h-full"
        >
          <div className="container-wide mb-8 md:mb-10">
            <div className="flex flex-col items-start">
              <h2 className="font-sans font-medium text-3xl md:text-5xl text-ink-800 mb-3">
                Awards <span style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>&</span> Publications
              </h2>
              <p className="font-sans text-base md:text-lg text-ink-600 max-w-full text-left mb-6">
                Featured in global architectural discourse and leading design publications.
              </p>
            </div>
          </div>

          {/* Marquee container */}
          <div className="relative w-full overflow-hidden group mb-10 md:mb-12">
            <div className="container-wide">
              <div className="flex w-max gap-4 md:gap-6 hover:[animation-play-state:paused] animate-marquee">
                {[...marqueePublications, ...marqueePublications, ...marqueePublications, ...marqueePublications].map((img, idx) => (
                  <div key={idx} className="w-48 md:w-64 h-64 md:h-72 flex-shrink-0 overflow-hidden bg-sand-100">
                    <ResilientImage src={img.src} candidates={img.candidates} alt="Publication" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500 ease-smooth" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STATS STRIP (Moved inside Publications) */}
          <div className="container-wide pt-8 md:pt-10">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="text-center"
                >
                  <p className="font-serif text-4xl md:text-5xl text-ink-800">
                    <AnimatedCounter valueText={stat.value} />
                  </p>
                  <p className="mt-2 text-[10px] md:text-xs uppercase tracking-ultra-wide text-ink-400">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CLIENTS SECTION */}
      <section className="bg-sand-50 overflow-hidden flex flex-col items-center justify-center py-12 md:py-24">
        <div className="container-wide mb-4 md:mb-6 w-full">
          <div className="flex flex-col items-start">
            <h2 className="font-serif text-3xl md:text-5xl text-ink-800 mb-3">
              Our Clients
            </h2>
            <p className="font-sans text-base md:text-lg text-ink-600 max-w-full text-left mb-4 md:mb-6">
              Trusted by leading organizations across diverse sectors.
            </p>
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative w-full max-w-[1400px] overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            backgroundColor: 'transparent'
          }}
        >
          {clientImages.length > 0 ? (
            // Drive-based client logos - 4x loop repeat for continuous seamless scroll on mobile
            <div className="flex w-max hover:[animation-play-state:paused] animate-marquee-slow opacity-80 hover:opacity-100 transition-all duration-500">
              {[...Array(4)].map((_, loopIdx) => (
                <div key={loopIdx} className="flex items-center gap-8 sm:gap-12 md:gap-16 pr-8 sm:pr-12 md:pr-16">
                  {clientImages.map((logo, idx) => (
                    <div key={idx} className="h-12 sm:h-16 md:h-20 w-28 sm:w-36 md:w-44 flex items-center justify-center p-1">
                      <ResilientImage
                        src={logo.src}
                        candidates={logo.srcCandidates}
                        alt={logo.name || "Client logo"}
                        className="max-h-full max-w-full w-auto h-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // Fallback to hardcoded logos
            <div className="flex w-max hover:[animation-play-state:paused] animate-marquee-slow opacity-80 transition-all duration-500">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-12 sm:gap-20 md:gap-32 pr-12 sm:pr-20 md:pr-32">
                  <div className="font-sans font-black text-xl sm:text-2xl md:text-3xl tracking-tighter uppercase cursor-default hover:text-ink-900 transition-colors duration-300">
                    MÜDON
                  </div>
                  <div className="font-sans font-light text-2xl sm:text-3xl md:text-4xl tracking-[0.2em] lowercase cursor-default hover:text-ink-900 transition-colors duration-300">
                    senda
                  </div>
                  <div className="text-ink-800 cursor-default hover:text-black transition-colors duration-300 flex items-center justify-center opacity-80">
                    <Infinity size={40} strokeWidth={1.5} />
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full text-white font-sans font-bold text-lg sm:text-xl cursor-default hover:bg-ink-800 transition-colors duration-300">
                    RO
                  </div>
                  <div className="font-sans font-medium text-2xl sm:text-3xl md:text-4xl tracking-widest lowercase cursor-default hover:text-ink-900 transition-colors duration-300" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    nua
                  </div>
                  <div className="flex flex-col items-center justify-center cursor-default hover:text-ink-900 transition-colors duration-300">
                    <div className="text-2xl text-ink-300 mb-1">🌳</div>
                    <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-ink-400">ZAGALE</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </motion.article>
  );
}
