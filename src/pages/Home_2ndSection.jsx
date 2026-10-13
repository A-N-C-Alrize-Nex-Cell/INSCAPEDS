import { useEffect, useRef, useState } from 'react';
import { useLenis } from '@studio-freight/react-lenis';

import topImage from '../assets/topimage.png';
import sketchMayapur from '../assets/sketchmayapur.png';
import mayapur from '../assets/mayapur.jpeg';

export default function Home_2ndSection() {
  const sectionRef = useRef(null);
  const image3Ref = useRef(null);
  const image4Ref = useRef(null);
  const crossTextRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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
      className="relative w-full min-h-screen flex flex-col justify-center py-10 bg-white px-4 md:px-6 lg:px-10 box-border overflow-hidden" 
      ref={sectionRef}
    >
      {/* Main Large Image */}
      <div 
        className={`w-full md:w-[70vw] lg:w-[50vw] max-w-[900px] h-[45vh] mx-auto transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-end justify-center ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative w-full h-full flex items-end justify-center group overflow-hidden">
          <img
            src={topImage}
            alt="Luxurious architectural residence surrounded by nature"
            loading="lazy"
            decoding="async"
            className="w-auto h-full max-h-full object-contain transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]"
          />
        </div>
      </div>

      {/* Bottom Grid: Two Images + Cross Text */}
      <div className="relative pb-[20px] md:pb-[40px] mt-2 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-4 md:gap-5 w-full md:w-[65%] max-w-[850px] mx-auto z-10">
          {/* Image 3 — left, narrower */}
          <div 
            className={`overflow-hidden will-change-transform transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
            }`} 
            ref={image3Ref}
          >
            <div className="aspect-[16/9] md:aspect-[2.03/1] border-2 border-[#e0e0e0] box-border relative w-full overflow-hidden group">
              <img
                src={sketchMayapur}
                alt="Sketch of Mayapur design"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]"
              />
            </div>
          </div>

          {/* Image 4 — right, wider */}
          <div 
            className={`overflow-hidden will-change-transform transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] delay-[350ms] ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[60px]'
            }`} 
            ref={image4Ref}
          >
            <div className="aspect-[16/9] md:aspect-[1.94/1] relative w-full overflow-hidden group">
              <img
                src={mayapur}
                alt="Mayapur residence exterior"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-800 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]"
              />
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
