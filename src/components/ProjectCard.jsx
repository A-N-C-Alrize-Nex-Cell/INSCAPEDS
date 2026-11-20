import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerItem } from "../lib/animations";
import { useState, useEffect, useRef } from "react";
import ResilientImage from "./ResilientImage";

export default function ProjectCard({ project, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileColor, setIsMobileColor] = useState(false);
  const cardRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const isMobileColorRef = useRef(false);
  const timerRef = useRef(null);

  // Mobile dimensions only: when a card crosses through the central focal zone
  // (the red-marked section), automatically reveal the colour image, and then
  // switch back to the black-and-white image after crossing or reveal duration.
  useEffect(() => {
    const handleScroll = () => {
      // Feature applies only to mobile dimensions (< 768px)
      if (typeof window === "undefined" || window.innerWidth >= 768) {
        if (isMobileColorRef.current) {
          isMobileColorRef.current = false;
          setIsMobileColor(false);
        }
        return;
      }

      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const cardCenter = rect.top + rect.height / 2;

      // Central focal band of the screen (the red-marked section, ~34% to 60% of viewport)
      const inCrossingZone = cardCenter >= vh * 0.34 && cardCenter <= vh * 0.60;

      if (inCrossingZone) {
        if (!hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          isMobileColorRef.current = true;
          setIsMobileColor(true);

          // Automatically switch back to the black-and-white image after reveal duration
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            isMobileColorRef.current = false;
            setIsMobileColor(false);
          }, 2200);
        }
      } else {
        // When card leaves / crosses out of the section, reset and switch back to black-and-white
        if (hasTriggeredRef.current) {
          hasTriggeredRef.current = false;
          if (timerRef.current) clearTimeout(timerRef.current);
          if (isMobileColorRef.current) {
            isMobileColorRef.current = false;
            setIsMobileColor(false);
          }
        }
      }
    };

    let rafId = null;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    handleScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const isRevealed = isHovered || isMobileColor;

  return (
    <motion.div ref={cardRef} variants={staggerItem} className="relative">
      <Link
        to={`/projects/${project.id}`}
        className="block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[3/2] px-8 md:px-12 py-4 flex items-center justify-center overflow-hidden bg-sand-100">

          {/* Default Sketch Image */}
          <ResilientImage
            src={project.image}
            candidates={project.imageCandidates}
            alt=""
            loading="lazy"
            className={`relative z-20 w-full h-full object-contain grayscale contrast-125 brightness-110 mix-blend-multiply transition-opacity duration-700 ease-in-out ${isRevealed ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Hover / Mobile Crossing Reveal Real Image */}
          {project.hoverImage && (
            <div
              className={`absolute inset-0 z-30 transition-opacity duration-700 ease-in-out flex items-center justify-center pointer-events-none ${isRevealed ? 'opacity-100' : 'opacity-0'}`}
            >
              <ResilientImage
                src={project.hoverImage}
                candidates={project.hoverImageCandidates}
                alt={`${project.title} Render`}
                className="w-full h-full object-cover shadow-xl"
              />
            </div>
          )}

        </div>
      </Link>
    </motion.div>
  );
}
