import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight, Infinity as InfinityIcon } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  scaleIn,
} from "../lib/animations";
import { stats } from "../data/content";
import ProjectCard from "../components/ProjectCard";
import Home_2ndSection from "./Home_2ndSection";
import AnimatedCounter from "../components/AnimatedCounter";
import { useProjectsWithDetails, useSectionImages, useSectionProjectCovers, useClientLogos, useHeroVideo } from "../hooks/useDrive";
import { isDriveConfigured, matchProjectByLabel } from "../lib/drive";
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

// Alternative fallback video in code file (used only if Drive video is unavailable)
const ALTERNATIVE_HERO_VIDEO = "/hero.mp4";

export default function Home() {
  const videoRef = useRef(null);
  const { data: driveHeroVideo, loading: isHeroVideoLoading } = useHeroVideo();
  const [videoSrc, setVideoSrc] = useState(() => driveHeroVideo?.src || null);
  const [videoPoster, setVideoPoster] = useState(() => driveHeroVideo?.poster || null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (driveHeroVideo?.src) {
      setVideoSrc(driveHeroVideo.src);
    } else if (!isHeroVideoLoading && driveHeroVideo === null) {
      setVideoSrc(ALTERNATIVE_HERO_VIDEO);
    }
    if (driveHeroVideo?.poster) {
      setVideoPoster(driveHeroVideo.poster);
    }
  }, [driveHeroVideo, isHeroVideoLoading]);

  const handleVideoError = () => {
    if (driveHeroVideo?.downloadSrc && videoSrc === driveHeroVideo.src) {
      setVideoSrc(driveHeroVideo.downloadSrc);
    } else if (videoSrc !== ALTERNATIVE_HERO_VIDEO) {
      setVideoSrc(ALTERNATIVE_HERO_VIDEO);
    }
  };

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.load();
      videoRef.current.play().catch((e) => console.log("Video autoplay blocked:", e));
    }
  }, [videoSrc]);

  // Mobile touch swipe & drag for marquee publications
  const marqueeTrackRef = useRef(null);
  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTranslateX: 0,
    isSwiping: false,
    intentDetermined: false,
    halfWidth: 0,
  });

  useEffect(() => {
    const track = marqueeTrackRef.current;
    if (!track) return;

    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const computed = window.getComputedStyle(track);
      const matrix = new DOMMatrixReadOnly(computed.transform);
      const currentX = matrix.m41 || 0;
      const halfWidth = track.scrollWidth / 2 || 1;

      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTranslateX: currentX,
        isSwiping: false,
        intentDetermined: false,
        halfWidth,
      };

      track.style.animationPlayState = "paused";
    };

    const onTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - touchState.current.startX;
      const dy = touch.clientY - touchState.current.startY;

      if (!touchState.current.intentDetermined) {
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          touchState.current.intentDetermined = true;
          touchState.current.isSwiping = Math.abs(dx) > Math.abs(dy);
          if (touchState.current.isSwiping) {
            track.style.animation = "none";
          }
        }
      }

      if (touchState.current.isSwiping) {
        if (e.cancelable) e.preventDefault();

        let newX = touchState.current.startTranslateX + dx;
        const halfWidth = touchState.current.halfWidth;

        if (halfWidth > 0) {
          while (newX > 0) newX -= halfWidth;
          while (newX < -halfWidth) newX += halfWidth;
        }

        track.style.transform = `translateX(${newX}px)`;
      }
    };

    const onTouchEnd = () => {
      if (touchState.current.isSwiping) {
        const computed = window.getComputedStyle(track);
        const matrix = new DOMMatrixReadOnly(computed.transform);
        const currentX = matrix.m41 || 0;
        const halfWidth = touchState.current.halfWidth || (track.scrollWidth / 2);

        let progress = 0;
        if (halfWidth > 0) {
          let normalizedX = currentX % halfWidth;
          if (normalizedX > 0) normalizedX -= halfWidth;
          progress = Math.abs(normalizedX) / halfWidth;
        }

        const duration = 40;
        const delay = -(progress * duration);

        track.style.animation = `marquee ${duration}s linear infinite`;
        track.style.animationDelay = `${delay}s`;
        track.style.animationPlayState = "running";
        track.style.transform = "";
      } else {
        track.style.animationPlayState = "running";
      }

      touchState.current.isSwiping = false;
      touchState.current.intentDetermined = false;
    };

    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchmove", onTouchMove, { passive: false });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchmove", onTouchMove);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  // Live Drive data (only trusted once VITE_DRIVE_API_KEY / ROOT_FOLDER_ID are
  // set — see DRIVE_INTEGRATION.md); the hard-coded arrays above stay as the
  // fallback so the homepage keeps working before Drive is configured.
  const driveReady = isDriveConfigured();
  const { data: driveProjects, loading: isProjectsLoading } = useProjectsWithDetails("All");
  const { data: drivePublications, loading: isPubsLoading } = useSectionImages("home", "Awards and Publication");
  const { data: driveClientLogos } = useClientLogos();
  // Selected Work(3rd Section) holds one project subfolder per featured
  // card (e.g. "01_HSB Joypur") — each subfolder's cover image is matched
  // back to the real project by name (fuzzy, since the two are typed by
  // hand in different places) so the card still links to that project's
  // real detail page.
  const { data: driveSelectedWork, loading: isSelectedWorkLoading } = useSectionProjectCovers("home", "Selected Work(3rd Section)");

  const featuredProjects = (() => {
    if (!driveReady) return newFeaturedProjects;

    if (driveSelectedWork?.length) {
      return driveSelectedWork.map((slot) => {
        const match = driveProjects?.length ? matchProjectByLabel(driveProjects, slot.label) : null;
        const hover = match?.gallery?.find((img) => img.id !== match.cover?.id) || match?.cover;
        return {
          id: match?.id,
          title: match?.title || slot.label,
          location: match?.location || match?.category || "",
          year: match?.year,
          category: match?.category,
          // Each Selected Work subfolder carries both states directly: the
          // "Monochrome"-named file for the default sketch-styled view, and
          // the plain one for the hover reveal. Falls back to the matched
          // project's own gallery only if a subfolder is missing one.
          image: slot.image?.thumb || match?.cover?.thumb || "",
          imageCandidates: slot.image?.thumbCandidates || match?.cover?.thumbCandidates,
          hoverImage: slot.hoverImage?.thumb || hover?.thumb || "",
          hoverImageCandidates: slot.hoverImage?.thumbCandidates || hover?.thumbCandidates,
        };
      }).filter((p) => p.id); // drop slots that couldn't be matched to a real project (would otherwise link nowhere)
    }

    if (driveProjects?.length) {
      return driveProjects.slice(0, 6).map((p) => {
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
      });
    }

    // Only fall back to bundled mocks if Drive is finished loading with 0 results
    if (!isSelectedWorkLoading && !isProjectsLoading) {
      return newFeaturedProjects;
    }

    // While Drive data is loading, return empty list so mock sketches do NOT flash
    return [];
  })();

  // Interleave Publication (P_n) and Award (A_n) images P_1, A_1, P_2, A_2, …
  // instead of Drive's plain alphabetical order (which would group all A_*
  // before all P_*).
  const marqueePublications = (() => {
    if (!driveReady) {
      return publicationImages.map((src) => ({ src, candidates: [src] }));
    }
    if (!drivePublications?.length) {
      // Only fall back to stock photos if Drive finished loading and has 0 images
      if (!isPubsLoading && drivePublications !== null) {
        return publicationImages.map((src) => ({ src, candidates: [src] }));
      }
      // While loading, return empty list so stock Unsplash photos do NOT flash
      return [];
    }
    const parse = (name) => {
      const m = String(name || "").match(/^([pa])_?(\d+)/i);
      return m ? { type: m[1].toUpperCase(), num: parseInt(m[2], 10) } : null;
    };
    const pubs = [];
    const awards = [];
    const rest = [];
    for (const img of drivePublications) {
      const parsed = parse(img.name);
      if (parsed?.type === "P") pubs.push({ ...parsed, img });
      else if (parsed?.type === "A") awards.push({ ...parsed, img });
      else rest.push(img);
    }
    pubs.sort((a, b) => a.num - b.num);
    awards.sort((a, b) => a.num - b.num);
    const interleaved = [];
    const max = Math.max(pubs.length, awards.length);
    for (let i = 0; i < max; i++) {
      if (pubs[i]) interleaved.push(pubs[i].img);
      if (awards[i]) interleaved.push(awards[i].img);
    }
    return [...interleaved, ...rest].map((img) => ({ src: img.thumb, candidates: img.thumbCandidates }));
  })();

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
          {/* Instant first-frame poster: renders within ~200ms from Google CDN so no black screen appears while the video stream buffers */}
          {videoPoster && (
            <img
              src={videoPoster}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              loading="eager"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out z-[1] ${
                isVideoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            />
          )}

          <video
            key={videoSrc || "hero-drive-video"}
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={videoPoster || undefined}
            onLoadedData={() => setIsVideoLoaded(true)}
            onPlaying={() => setIsVideoLoaded(true)}
            className="h-full w-full object-cover"
            src={videoSrc || undefined}
            onError={handleVideoError}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/30 via-ink-900/10 to-ink-900/40 z-[2]" />
        </div>

        <div className="relative h-full container-wide flex flex-col justify-end pb-12 sm:pb-16 md:pb-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center gap-3 text-sand-200 cursor-pointer select-none w-fit"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ArrowDown size={20} />
            </motion.div>
            <span className="text-xs uppercase tracking-ultra-wide">Scroll</span>
          </motion.div>
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
            {driveReady && (isSelectedWorkLoading || isProjectsLoading) && (!featuredProjects || featuredProjects.length === 0) ? (
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="mb-12 animate-pulse">
                  <div className="aspect-[16/10] bg-sand-300/40 rounded-sm mb-4 border border-sand-300/30" />
                  <div className="h-6 w-2/3 bg-sand-300/40 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-sand-300/30 rounded" />
                </div>
              ))
            ) : (
              featuredProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))
            )}
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
          <div className="relative w-full overflow-hidden group mb-10 md:mb-12 select-none" style={{ touchAction: "pan-y" }}>
            <div className="container-wide">
              {driveReady && (isPubsLoading || drivePublications === null) && marqueePublications.length === 0 ? (
                <div className="flex w-max gap-4 md:gap-6 animate-pulse">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="w-48 md:w-64 h-64 md:h-72 flex-shrink-0 bg-sand-300/40 rounded-sm border border-sand-300/30" />
                  ))}
                </div>
              ) : marqueePublications.length > 0 ? (
                <div
                  ref={marqueeTrackRef}
                  className="flex w-max gap-4 md:gap-6 hover:[animation-play-state:paused] animate-marquee cursor-grab active:cursor-grabbing select-none"
                  style={{ touchAction: "pan-y" }}
                >
                  {[...marqueePublications, ...marqueePublications, ...marqueePublications, ...marqueePublications].map((img, idx) => (
                    <div key={idx} className="w-48 md:w-64 h-64 md:h-72 flex-shrink-0 overflow-hidden pointer-events-none select-none">
                      <ResilientImage
                        src={img.src}
                        candidates={img.candidates}
                        alt="Publication"
                        className="w-full h-full object-contain transition-all duration-500 ease-smooth pointer-events-none"
                        loading="lazy"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
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
            <div className="flex w-max hover:[animation-play-state:paused] animate-marquee-slow transition-all duration-500">
              {[...Array(4)].map((_, loopIdx) => (
                <div key={loopIdx} className="flex items-center gap-3 sm:gap-5 md:gap-6 pr-3 sm:pr-5 md:pr-6">
                  {clientImages.map((logo, idx) => (
                    <div key={idx} className="h-12 sm:h-16 md:h-20 w-24 sm:w-28 md:w-32 flex items-center justify-center p-1 flex-shrink-0">
                      <ResilientImage
                        src={logo.src}
                        candidates={logo.srcCandidates}
                        alt={logo.name || "Client logo"}
                        className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // Fallback to hardcoded logos
            <div className="flex w-max hover:[animation-play-state:paused] animate-marquee-slow transition-all duration-500">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 sm:gap-10 md:gap-12 pr-6 sm:pr-10 md:pr-12">
                  <div className="font-sans font-black text-xl sm:text-2xl md:text-3xl tracking-tighter uppercase cursor-default hover:text-ink-900 transition-colors duration-300">
                    MÜDON
                  </div>
                  <div className="font-sans font-light text-2xl sm:text-3xl md:text-4xl tracking-[0.2em] lowercase cursor-default hover:text-ink-900 transition-colors duration-300">
                    senda
                  </div>
                  <div className="text-ink-800 cursor-default hover:text-black transition-colors duration-300 flex items-center justify-center opacity-80">
                    <InfinityIcon size={40} strokeWidth={1.5} />
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
