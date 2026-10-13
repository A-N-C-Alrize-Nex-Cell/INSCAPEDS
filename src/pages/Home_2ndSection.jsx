import { useEffect, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';

import topImage from '../assets/topimage.png';
import sketchMayapur from '../assets/sketchmayapur.png';
import mayapur from '../assets/mayapur.jpeg';
import { useCollageImages } from '../hooks/useDrive';
import { isDriveConfigured } from '../lib/drive';
import ResilientImage from '../components/ResilientImage';

// Fallback photos used per collage slot until the Drive folder has its own —
// cycled through so every slot always shows something.
const COLLAGE_FALLBACKS = [topImage, sketchMayapur, mayapur];

export default function Home_2ndSection() {
  const sectionRef = useRef(null);
  const image3Ref = useRef(null);
  const image4Ref = useRef(null);
  const crossTextRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const driveReady = isDriveConfigured();
  const { data: collageImages } = useCollageImages();
  // 8 slots laid out as a staggered cross: 1 (left) + 2 + 2 (center, tallest) + 2 + 1 (right)
  const collageSlots = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const img = driveReady && collageImages?.[i];
    return {
      src: img?.src || COLLAGE_FALLBACKS[i % COLLAGE_FALLBACKS.length],
      candidates: img?.srcCandidates,
    };
  });

  const bounds = useRef({ top: 0, height: 0 });

  useEffect(() => {
    // 1. Setup Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // 2. Cache bounds for parallax scroll performance
    const updateBounds = () => {
      if (sectionRef.current) {
        bounds.current.top = sectionRef.current.getBoundingClientRect().top + window.scrollY;
        bounds.current.height = sectionRef.current.getBoundingClientRect().height;
      }
    };
    
    setTimeout(updateBounds, 100);
    window.addEventListener('resize', updateBounds);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  useLenis(({ scroll }) => {
    if (!bounds.current.height) return;

    const windowHeight = window.innerHeight;
    const sectionTop = bounds.current.top - scroll;

    // Calculate scroll progress within the section
    const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight + bounds.current.height)));

    if (image3Ref.current) {
      const translateY = (1 - progress) * 12 - 2;
      image3Ref.current.style.transform = `translateY(${translateY}%)`;
    }

    if (image4Ref.current) {
      const translateY = -(progress * 8) + 4;
      image4Ref.current.style.transform = `translateY(${translateY}%)`;
    }

    if (crossTextRef.current) {
      const translateY = (1 - progress) * 80 - 10;
      crossTextRef.current.style.transform = `translateY(${translateY}%)`;
    }
  });

  return (
    <section 
      className="relative w-full flex flex-col justify-center py-20 md:py-28 bg-white px-4 md:px-6 lg:px-10 box-border overflow-hidden"
      ref={sectionRef}
    >
      {/* Bottom: Staggered Photo Collage + Cross Text */}
      <div className="relative pb-[20px] md:pb-[40px] flex flex-col items-center">
        {/* Mobile / tablet: simple 2-col masonry of all 8 photos */}
        <div className="grid grid-cols-2 md:hidden gap-3 w-full max-w-[520px] mx-auto z-10">
          {collageSlots.map((slot, i) => (
            <div
              key={i}
              className={`overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[40px]'
              } ${i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'}`}
              style={{ transitionDelay: `${150 + i * 80}ms` }}
            >
              <ResilientImage
                src={slot.src}
                candidates={slot.candidates}
                alt="Inscape design detail"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Desktop: 5-column staggered cross, center tallest */}
        <div className="hidden md:flex items-start justify-center gap-4 lg:gap-5 w-full max-w-[1100px] mx-auto z-10">
          {/* Col 1 */}
          <div
            className={`flex-1 mt-24 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
            }`}
          >
            <div className="aspect-[3/4] overflow-hidden group">
              <ResilientImage src={collageSlots[0].src} candidates={collageSlots[0].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
            </div>
          </div>

          {/* Col 2 */}
          <div
            className={`flex-1 mt-8 flex flex-col gap-4 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
            }`}
          >
            <div className="aspect-[4/5] overflow-hidden group">
              <ResilientImage src={collageSlots[1].src} candidates={collageSlots[1].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
            </div>
            <div className="aspect-[3/4] overflow-hidden group">
              <ResilientImage src={collageSlots[2].src} candidates={collageSlots[2].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
            </div>
          </div>

          {/* Col 3 — center, tallest */}
          <div className="flex-[1.15] flex flex-col gap-4">
            <div
              className={`overflow-hidden will-change-transform transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
              }`}
              ref={image3Ref}
            >
              <div className="aspect-[16/10] border-2 border-[#e0e0e0] box-border overflow-hidden group">
                <ResilientImage src={collageSlots[3].src} candidates={collageSlots[3].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
              </div>
            </div>
            <div
              className={`overflow-hidden will-change-transform transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-[350ms] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
              }`}
              ref={image4Ref}
            >
              <div className="aspect-[2/3] overflow-hidden group">
                <ResilientImage src={collageSlots[4].src} candidates={collageSlots[4].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
              </div>
            </div>
          </div>

          {/* Col 4 */}
          <div
            className={`flex-1 mt-8 flex flex-col gap-4 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-[350ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
            }`}
          >
            <div className="aspect-[3/4] overflow-hidden group">
              <ResilientImage src={collageSlots[5].src} candidates={collageSlots[5].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
            </div>
            <div className="aspect-[4/3] overflow-hidden group">
              <ResilientImage src={collageSlots[6].src} candidates={collageSlots[6].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
            </div>
          </div>

          {/* Col 5 */}
          <div
            className={`flex-1 mt-24 overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
            }`}
          >
            <div className="aspect-[3/4] overflow-hidden group">
              <ResilientImage src={collageSlots[7].src} candidates={collageSlots[7].candidates} alt="Inscape design detail" className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
            </div>
          </div>
        </div>

        {/* Cross Text Block */}
        <div 
          className="relative w-full max-w-full md:max-w-[480px] lg:max-w-[600px] mx-auto pt-8 md:pt-[40px] lg:pt-[50px] will-change-transform transition-transform duration-100 linear" 
          ref={crossTextRef}
        >
          <div className="flex items-start justify-center gap-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              className={`shrink-0 mt-1 fill-[#1a1a1a] transition-all duration-600 ease-[cubic-bezier(0.25,1,0.5,1)] delay-500 ${
                isVisible ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
              }`}
            >
              <path d="M7.5 15V8.5H1C0.723858 8.5 0.5 8.27614 0.5 8C0.5 7.72386 0.723858 7.5 1 7.5H7.5V1C7.5 0.723858 7.72386 0.5 8 0.5C8.27614 0.5 8.5 0.723858 8.5 1V7.5H15C15.2761 7.5 15.5 7.72386 15.5 8C15.5 8.27614 15.2761 8.5 15 8.5H8.5V15C8.5 15.2761 8.27614 15.5 8 15.5C7.72386 15.5 7.5 15.2761 7.5 15Z" />
            </svg>
            <p 
              className={`font-mono text-[14px] lg:text-[clamp(14px,1.4vw,18px)] leading-[1.8] text-[#1a1a1a] tracking-[0.5px] m-0 transition-all duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
            >
              At Inscape Design Studio, we are deeply committed to creating green, sustainable landscapes that celebrate nature. Our designs prioritize native planting, ecological balance, and climate resilience, ensuring every space we craft contributes positively to the environment while enriching human experience and fostering a deep connection with the natural world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
