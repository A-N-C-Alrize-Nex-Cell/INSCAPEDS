import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Ruler, ArrowUpRight } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  scaleIn,
  AnimatedText,
} from "../lib/animations";
import { projects as staticProjects, projectCategories as staticCategories } from "../data/content";
import { getProjectMetadata } from "../data/projectMetadata";
import { useProjectCategories, useProjectsWithDetails } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";

export default function Projects() {
  // Active filter lives in the URL (?category=…) rather than plain state so
  // browser back/forward (e.g. after opening a project and returning) lands
  // back on the same filtered tab instead of resetting to "All".
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const [visibleCount, setVisibleCount] = useState(9);

  // Live Drive data (only trusted once VITE_DRIVE_API_KEY / ROOT_FOLDER_ID are set —
  // see DRIVE_INTEGRATION.md). Until then the studio's placeholder content.js data is used.
  const driveReady = isDriveConfigured();
  const { data: driveCategories } = useProjectCategories();
  const { data: driveProjects, loading: driveLoading } = useProjectsWithDetails(activeCategory);

  const projectCategories = driveReady && driveCategories?.length
    ? ["All", ...driveCategories]
    : staticCategories;

  const filtered = useMemo(() => {
    if (driveReady) {
      return (driveProjects || []).map((p) => {
        const meta = getProjectMetadata(p.title) || {};
        return {
          id: p.id,
          title: p.title,
          category: p.category,
          location: p.location || meta.location || "",
          status: p.status || meta.status || (p.year ? `Completed ${p.year}` : "Completed 2022"),
          year: p.year,
          area: p.area || meta.area || "10 Acres",
          // Grid tile — use the smaller thumbnail, not the full 1920px image.
          image: p.cover?.thumb || "",
          imageCandidates: p.cover?.thumbCandidates,
        };
      });
    }
    if (activeCategory === "All") return staticProjects;
    return staticProjects.filter((p) => p.category === activeCategory);
  }, [driveReady, driveProjects, activeCategory]);

  // "All" shows every project at once — no pagination; other tabs still page via "Load more".
  const visibleProjects = activeCategory === "All" ? filtered : filtered.slice(0, visibleCount);
  const hasMore = activeCategory !== "All" && visibleCount < filtered.length;
  const isLoading = driveReady && driveLoading;

  const handleFilter = (cat) => {
    setSearchParams(cat === "All" ? {} : { category: cat });
    setVisibleCount(9);
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* HEADER */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-16 container-wide">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="section-label mb-6"
        >
          Our Work
        </motion.p>
        <h1 className="font-sans font-light text-[6.5vw] md:text-[4.5vw] lg:text-[4vw] xl:text-[3.5rem] text-ink-800 leading-[1.1] tracking-tight">
          <AnimatedText text="Projects Across Scales And Places" delay={0.3} />
        </h1>
      </section>

      {/* FILTERS */}
      <section className="container-wide pb-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-2 md:gap-3"
        >
          {projectCategories.map((cat) => (
            <motion.button
              key={cat}
              variants={staggerItem}
              onClick={() => handleFilter(cat)}
              className={`relative px-4 py-1.5 text-sm transition-all duration-300 ${activeCategory === cat
                  ? "text-sand-50"
                  : "text-ink-600 hover:text-ink-800"
                }`}
            >
              {activeCategory === cat && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-ink-800"
                  transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* GRID */}
      <section className="container-wide pb-24 md:pb-36">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          key={activeCategory}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-4 md:gap-y-10"
        >
          {visibleProjects.map((project, i) => (
            <motion.div key={project.id} variants={staggerItem}>
              <Link
                to={`/projects/${project.id}`}
                className="group block w-full text-left"
              >
                <div className="relative overflow-hidden bg-sand-200 aspect-square">
                  <ResilientImage
                    src={project.image}
                    candidates={project.imageCandidates}
                    alt={project.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-smooth group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink-800/0 group-hover:bg-ink-800/20 transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-end justify-end p-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-smooth">
                    <div className="flex items-center gap-2 text-sand-50">
                      <span className="text-xs uppercase tracking-wide">View project</span>
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                  <h3 className="font-sans text-[13px] text-ink-900 font-bold uppercase tracking-wide leading-snug">{project.title}</h3>
                  <div className="text-left text-[10px] sm:text-[11px] text-ink-500 font-sans space-y-0.5 sm:flex-shrink-0">
                    <p>Status: {project.status || (project.year ? `Completed ${project.year}` : "Completed 2022")}</p>
                    <p>Area: {project.area || project.size || "10 Acres"}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {hasMore && (
          <div className="mt-16 text-center">
            <button onClick={() => setVisibleCount((c) => c + 6)} className="btn-outline">
              Load more projects
            </button>
          </div>
        )}

        {isLoading && filtered.length === 0 && (
          <p className="text-center text-ink-400 py-20">Loading projects…</p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-ink-400 py-20">
            No projects in this category yet.
          </p>
        )}
      </section>

    </motion.article>
  );
}
