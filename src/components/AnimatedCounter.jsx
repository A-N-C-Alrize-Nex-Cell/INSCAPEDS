import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export default function AnimatedCounter({ valueText }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
    duration: 3000,
  });
  const isInView = useInView(ref, { margin: "-50px" });

  const match = valueText.match(/^(\d+[^\sa-zA-Z]*)\s*(.*)$/);
  const counterStr = match && match[1] ? match[1] : valueText;
  const unit = match && match[2] ? match[2] : null;

  const numMatch = counterStr.match(/\d+/);
  const targetValue = numMatch ? parseInt(numMatch[0], 10) : 0;
  const suffix = counterStr.replace(/\d+/g, "");

  useEffect(() => {
    if (isInView) {
      motionValue.set(targetValue);
    } else {
      motionValue.set(0);
    }
  }, [isInView, targetValue, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest) + suffix;
      }
    });
  }, [springValue, suffix]);

  return (
    <>
      <span ref={ref}>0{suffix}</span>
      {unit && <span className="text-[0.65em] md:text-[0.7em] ml-1.5">{unit}</span>}
    </>
  );
}
