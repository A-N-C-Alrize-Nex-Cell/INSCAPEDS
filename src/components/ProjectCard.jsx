import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerItem } from "../lib/animations";
import { useState } from "react";
import ResilientImage from "./ResilientImage";

export default function ProjectCard({ project, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div variants={staggerItem} className="relative">
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
            className={`relative z-20 w-full h-full object-contain grayscale contrast-125 brightness-110 mix-blend-multiply transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Hover Real Image */}
          {project.hoverImage && (
            <div
              className={`absolute inset-0 z-30 transition-opacity duration-500 flex items-center justify-center pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
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
        <div className="mt-3">
          <h3 className="font-sans text-[13px] text-ink-900 font-bold uppercase tracking-wide leading-snug">{project.title}</h3>
        </div>
      </Link>
    </motion.div>
  );
}
