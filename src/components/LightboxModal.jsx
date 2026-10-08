import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ResilientImage from "./ResilientImage";

export default function LightboxModal({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onNavigate,
}) {
  const currentImage = images[currentIndex];

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (onNavigate && images.length > 0) {
      const prev = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      onNavigate(prev);
    }
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    if (onNavigate && images.length > 0) {
      const next = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      onNavigate(next);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      document.body.classList.remove("lenis-stopped");
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("lenis-stopped");
    document.body.classList.add("lenis-stopped");

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    const preventScroll = (e) => {
      e.stopPropagation();
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", preventScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", preventScroll, { passive: false, capture: true });

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      document.body.classList.remove("lenis-stopped");
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", preventScroll, { capture: true });
      window.removeEventListener("touchmove", preventScroll, { capture: true });
    };
  }, [isOpen, currentIndex, images]);

  if (!isOpen || !currentImage) return null;

  const src = typeof currentImage === "string" ? currentImage : currentImage.src || currentImage.thumb;
  const candidates = typeof currentImage === "string" ? [currentImage] : currentImage.candidates || currentImage.thumbCandidates || [src];
  const alt = typeof currentImage === "string" ? "Image preview" : currentImage.alt || "Image preview";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[10000] bg-[rgba(0,0,0,0.92)] flex items-center justify-center p-4 md:p-10 select-none"
        onClick={onClose}
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 md:top-8 md:right-8 text-white/80 hover:text-white transition-opacity p-2 z-30 cursor-pointer"
          aria-label="Close Lightbox"
        >
          <X size={28} strokeWidth={1.5} />
        </button>

        {/* Left & Right Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-opacity p-3 z-30 cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft size={40} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-opacity p-3 z-30 cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight size={40} strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Main Image */}
        <div
          className="max-w-6xl max-h-[88vh] relative flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <ResilientImage
            src={src}
            candidates={candidates}
            alt={alt}
            className="max-w-full max-h-[88vh] object-contain shadow-2xl select-none"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
