import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  scaleIn,
  AnimatedText,
} from "../lib/animations";
import { processSteps, values, awards, team } from "../data/content";
import { useSectionImages, useTeamMembers } from "../hooks/useDrive";
import { isDriveConfigured } from "../lib/drive";
import ResilientImage from "../components/ResilientImage";

const studioImage =
  "https://images.pexels.com/photos/6615107/pexels-photo-6615107.jpeg?auto=compress&cs=tinysrgb&w=1600";
const studioImage2 =
  "https://images.pexels.com/photos/9052536/pexels-photo-9052536.jpeg?auto=compress&cs=tinysrgb&w=1200";
const founderImage =
  "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=800";

const galleryData = [
  { src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", stateA: { top: "10%", left: "5%", width: "25%", height: "25%", rotateX: 10, rotateY: 35, rotateZ: -5, z: -100 } },
  { src: "https://images.pexels.com/photos/9052536/pexels-photo-9052536.jpeg?auto=format&fit=crop&w=800&q=80", stateA: { top: "15%", left: "40%", width: "20%", height: "15%", rotateX: 0, rotateY: 0, rotateZ: 0, z: -200 } },
  { src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", stateA: { top: "10%", left: "65%", width: "25%", height: "25%", rotateX: 10, rotateY: -35, rotateZ: 5, z: -100 } },
  { src: "https://images.pexels.com/photos/6615107/pexels-photo-6615107.jpeg?auto=format&fit=crop&w=800&q=80", stateA: { top: "45%", left: "15%", width: "25%", height: "10%", rotateX: 15, rotateY: 30, rotateZ: 0, z: 0 } },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", hasText: true, stateA: { top: "35%", left: "35%", width: "30%", height: "30%", rotateX: 0, rotateY: 0, rotateZ: 0, z: 100, opacity: 0, scale: 0.8 } },
  { src: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=format&fit=crop&w=800&q=80", stateA: { top: "40%", left: "60%", width: "30%", height: "25%", rotateX: 10, rotateY: -30, rotateZ: 0, z: 0 } },
  { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", stateA: { top: "70%", left: "15%", width: "25%", height: "20%", rotateX: 20, rotateY: 40, rotateZ: 0, z: 50 } },
  { src: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=format&fit=crop&w=800&q=80", stateA: { top: "75%", left: "38%", width: "24%", height: "15%", rotateX: 0, rotateY: 0, rotateZ: 0, z: 100 } },
  { src: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80", stateA: { top: "70%", left: "60%", width: "25%", height: "20%", rotateX: 20, rotateY: -40, rotateZ: 0, z: 50 } }
];

const GalleryImage = ({ data, index, scrollYProgress }) => {
  const row = Math.floor(index / 3);
  const col = index % 3;

  const stateB = {
    top: `${row * 33.333}%`,
    left: `${col * 33.333}%`,
    width: "33.333%",
    height: "33.333%",
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    z: 0,
    opacity: 1,
    scale: 1
  };

  const range = [0, 0.4, 0.8, 1];

  const top = useTransform(scrollYProgress, range, [data.stateA.top, data.stateA.top, stateB.top, stateB.top]);
  const left = useTransform(scrollYProgress, range, [data.stateA.left, data.stateA.left, stateB.left, stateB.left]);
  const width = useTransform(scrollYProgress, range, [data.stateA.width, data.stateA.width, stateB.width, stateB.width]);
  const height = useTransform(scrollYProgress, range, [data.stateA.height, data.stateA.height, stateB.height, stateB.height]);

  const rotateX = useTransform(scrollYProgress, range, [data.stateA.rotateX || 0, data.stateA.rotateX || 0, stateB.rotateX, stateB.rotateX]);
  const rotateY = useTransform(scrollYProgress, range, [data.stateA.rotateY || 0, data.stateA.rotateY || 0, stateB.rotateY, stateB.rotateY]);
  const rotateZ = useTransform(scrollYProgress, range, [data.stateA.rotateZ || 0, data.stateA.rotateZ || 0, stateB.rotateZ, stateB.rotateZ]);
  const z = useTransform(scrollYProgress, range, [data.stateA.z || 0, data.stateA.z || 0, stateB.z, stateB.z]);

  const opacity = useTransform(scrollYProgress, range, [data.stateA.opacity ?? 1, data.stateA.opacity ?? 1, stateB.opacity, stateB.opacity]);
  const scale = useTransform(scrollYProgress, range, [data.stateA.scale ?? 1, data.stateA.scale ?? 1, stateB.scale, stateB.scale]);

  return (
    <motion.div
      style={{ top, left, width, height, rotateX, rotateY, rotateZ, z, opacity, scale }}
      className="absolute overflow-hidden bg-ink-800 border-[1px] border-ink-950 flex items-center justify-center group transform-gpu"
    >
      <img
        src={data.src}
        alt={`Gallery ${index + 1}`}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${data.hasText ? 'grayscale opacity-40' : 'grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105'}`}
      />
      {data.hasText && (
        <p className="relative z-10 font-sans text-sm md:text-2xl lg:text-3xl font-medium text-sand-50 tracking-wide text-center px-4 leading-relaxed group-hover:scale-105 transition-transform duration-700">
          아직 분양 시장은<br className="md:hidden" /> 하지 않습니다
        </p>
      )}
    </motion.div>
  );
};

export default function About() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Live Drive data (only trusted once VITE_DRIVE_API_KEY / ROOT_FOLDER_ID are
  // set — see DRIVE_INTEGRATION.md); each falls back to the stock photo above
  // until its About/<section> Drive folder has an image in it.
  const driveReady = isDriveConfigured();
  const { data: introImages } = useSectionImages("about", "Hero Section");
  const { data: founderImages } = useSectionImages("about", "Hero Section"); // Hero Section for both intro and founder
  const { data: studioImages } = useSectionImages("about", "Studio Values_Section");
  const { data: howWeWorkImages } = useSectionImages("about", "How We Work_Section");
  const { data: driveTeamMembers } = useTeamMembers();

  const introSrc = (driveReady && introImages?.[0]?.src) || studioImage;
  const introCandidates = driveReady && introImages?.[0]?.srcCandidates;
  const founderSrc = (driveReady && founderImages?.[0]?.src) || founderImage;
  const founderCandidates = driveReady && founderImages?.[0]?.srcCandidates;
  const studioSrc = (driveReady && studioImages?.[0]?.src) || studioImage2;
  const studioCandidates = driveReady && studioImages?.[0]?.srcCandidates;
  const howWeWorkSrc = driveReady && howWeWorkImages?.[0]?.src;
  const howWeWorkCandidates = driveReady && howWeWorkImages?.[0]?.srcCandidates;

  // Use Drive team members if available, otherwise fallback to static data
  const displayTeam = (driveReady && driveTeamMembers && driveTeamMembers.length > 0)
    ? driveTeamMembers
    : team;

  console.log("[About] driveReady:", driveReady);
  console.log("[About] driveTeamMembers:", driveTeamMembers);
  console.log("[About] displayTeam:", displayTeam);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* HEADER + INTRO WITH FULL-HEIGHT IMAGE */}
      <section className="pt-32 md:pt-44 pb-24 md:pb-36 container-wide">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:grid-rows-[auto_1fr]">
          {/* Top left: Section label + Title */}
          <motion.div className="md:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="section-label mb-6"
            >
              About Inscape
            </motion.p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-ink-800 max-w-4xl leading-[1.1] mb-16">
              <AnimatedText text="A studio shaped by the places it works in" delay={0.3} />
            </h1>
          </motion.div>

          {/* Top right: Image (row 1) */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="md:col-span-5 md:row-span-2"
          >
            <div className="w-full h-full aspect-[3/4] md:aspect-auto overflow-hidden rounded-sm">
              <ResilientImage
                src={introSrc}
                candidates={introCandidates}
                alt="Inscape studio"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Bottom left: Content paragraphs (row 2) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="md:col-span-7 space-y-6"
          >
            <p className="text-lg md:text-xl leading-relaxed text-ink-700">
              Inscape Design Studio is an exclusive landscape design firm based in Kolkata, India, offering expert amenities in landscape planning, landscape architecture as well as urban scale intervention. We at Inscape always intend to produce a context responsive design that takes into account the association of the users as an intimate part of the space. These designs aim to bridge the gap between the built form and the softscape and merge the stark differences through intelligent interventions.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-ink-700">
              It is through small first-hand considerations that these mediations are hypothesized. Our team of dynamic individuals works meticulously with the client and consider every possibility before settling on the final structure. A close involvement of consultants including expert horticulturists, florists and specialized masons result in the final product being an excellent outcome of passion, dedication and mutual trust, one which enjoys the confidence of the users for a long time.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-ink-700">
              Being a professional group of landscape architects, our workflow involves our clients in the design table as well. We believe that a lack of clear communiqué results in an undignified design, and hence try to include all the patrons of all decision-making points. The end result turns out to be an aesthetic mix of functionality and appearance, one that strikes the perfect balance between the form and the function by delving deeper beyond the visual appearance and solving the minute details with persistent solidarity. Design as we see it is a complex concoction of technical soundness, undying passion, dedication, and the desire to see your design being lived.
            </p>
          </motion.div>
        </div>
      </section>
      {/* MESSAGE FROM OWNER */}
      <section className="bg-ink-900 text-sand-50 py-24 md:py-36 overflow-hidden relative">
        {/* Architectural Texture Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen">
          <img
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop"
            alt="Architecture Texture"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-5"
            >
              <div className="aspect-[3/4] overflow-hidden bg-ink-800 rounded-sm">
                <ResilientImage
                  src={founderSrc}
                  candidates={founderCandidates}
                  alt="Elena Marquez"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-7"
            >
              <p className="section-label mb-8 text-sand-300/80">Message from the Founder</p>
              <div className="space-y-6 mb-8">
                <p className="text-lg md:text-xl leading-relaxed text-sand-50">
                  Ar. Sujoy Das graduated from Jadavpur University, Kolkata, before pursuing Master Degree in Landscape Architecture from School of Planning and Architecture(SPA), New Delhi.
                </p>
                <p className="text-lg md:text-xl leading-relaxed text-sand-50">
                  Ar. Sujoy Das was the winner of the prestigious ISOLA Design excellence National award commendation in Public Landscape Design by <span className="font-semibold">Indian Society of Landscape Architects in 2022</span>.
                </p>
                <p className="text-lg md:text-xl leading-relaxed text-sand-50">
                  He has also National Award winner for excellence in architecture in the Landscape Projects, by <span className="font-semibold">Indian Institute if Architects (IIA) in 2023</span>.
                </p>
              </div>
              <div className="border-t border-sand-300/30 pt-8">
                <p className="text-sm uppercase tracking-widest text-sand-300 font-semibold mb-4">Principal Landscape Architect</p>
                <p className="text-sm leading-relaxed text-sand-200">
                  B.ARCH (JADAVPUR UNIVERSITY),<br />
                  M.L.ARCH (SCHOOL OF PLANNING AND ARCHITECTURE, DELHI)
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="container-wide py-24 md:py-36">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 md:mb-24"
        >
          <p className="section-label mb-6">Our People</p>
          <h2 className="font-serif text-3xl md:text-5xl text-ink-800 max-w-2xl">
            The minds behind the studio
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
        >
          {displayTeam.map((member, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="group cursor-pointer relative aspect-square overflow-hidden bg-ink-100 rounded-sm"
            >
              {member.src ? (
                <ResilientImage
                  src={member.src}
                  candidates={member.srcCandidates}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              ) : (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
              )}

              {/* Dark gradient overlay for text readability, visible only on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Text content, animating in from bottom left */}
              <div className="absolute bottom-0 left-0 p-5 md:p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end">
                <h3 className="font-serif text-lg md:text-xl text-sand-50">{member.name}</h3>
                <p className="text-[10px] md:text-xs text-sand-300 uppercase tracking-widest mt-1">
                  {member.designation || member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* PROCESS TIMELINE */}
      <section className="bg-sand-200/50 py-24 md:py-36 grain-overlay">
        <div className="container-wide">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-16 md:mb-24"
          >
            <p className="section-label mb-6">How We Work</p>
            <h2 className="font-serif text-3xl md:text-5xl text-ink-800 max-w-2xl">
              A six-step journey, from first conversation to handover.
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-ink-300/40 md:-translate-x-1/2" />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-16 md:space-y-24"
            >
              {processSteps.map((step, i) => {
                // Find matching image from Drive for this step (e.g., 1.jpg or 01.jpg for step 01)
                const numInt = parseInt(step.number, 10);
                const stepImage = howWeWorkImages?.find((img) => {
                  const name = (img.name || "").toLowerCase();
                  return (
                    name.startsWith(step.number) ||
                    name.startsWith(`${numInt}.`) ||
                    name.startsWith(`${numInt}_`) ||
                    name.startsWith(`0${numInt}.`) ||
                    name.startsWith(`0${numInt}_`)
                  );
                }) || howWeWorkImages?.[i] || null;

                return (
                  <motion.div
                    key={step.number}
                    variants={staggerItem}
                    className={`relative flex flex-col md:flex-row gap-8 md:gap-12 items-center py-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                      }`}
                  >
                    {/* Text Column (Shifted slightly down) */}
                    <div className="w-full md:w-1/2 md:px-6 flex flex-col justify-center pt-6 md:pt-8">
                      <div className={`${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                        <span className="font-serif text-6xl md:text-7xl text-clay-400/60 block mb-4">
                          {step.number}
                        </span>
                        <h3 className="font-serif text-2xl md:text-3xl text-ink-800 mb-4">
                          {step.title}
                        </h3>
                        <p className="text-ink-600 leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {/* Image Column */}
                    <div className="w-full md:w-1/2 md:px-6 flex items-center justify-center">
                      {stepImage ? (
                        <div className="w-full aspect-[4/3] max-w-xl mx-auto overflow-hidden rounded-sm bg-ink-800 shadow-md group">
                          <ResilientImage
                            src={stepImage.src}
                            candidates={stepImage.srcCandidates}
                            alt={`Step ${step.number} - ${step.title}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      ) : (
                        <div className="hidden md:flex w-full aspect-[4/3] max-w-xl mx-auto rounded-sm border border-dashed border-ink-300/40 bg-sand-100/30 items-center justify-center p-8">
                          <p className="text-xs uppercase tracking-widest text-ink-400 text-center">
                            Step {step.number} Visual
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Timeline Dot (Vertically centered) */}
                    <div className="absolute left-0 md:left-1/2 top-1/2 -translate-y-1/2 md:-translate-x-1/2 w-3.5 h-3.5 rounded-full bg-clay-500 ring-4 ring-sand-200 z-10" />
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="container-wide py-24 md:py-36">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16"
        >
          <p className="section-label mb-6">Studio Values</p>
          <h2 className="font-serif text-3xl md:text-5xl text-ink-800 max-w-2xl">
            What we return to, project after project.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {values.map((value) => (
            <motion.div
              key={value.title}
              variants={staggerItem}
              className="border-t border-ink-200/40 pt-6"
            >
              <h3 className="font-serif text-xl text-ink-800 mb-3">{value.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* STUDIO PHOTO - BENTO GRID */}
      <section className="container-wide pb-24 md:pb-36">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Row 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <ResilientImage
              src={studioSrc}
              candidates={studioCandidates}
              alt="Studio interior"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <img
              src="https://images.pexels.com/photos/9052536/pexels-photo-9052536.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Design process"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <img
              src="https://images.pexels.com/photos/6615107/pexels-photo-6615107.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Sketching"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Row 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <img
              src="https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Team collaboration"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group relative flex items-center justify-center"
          >
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80"
              alt="Architecture"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700 flex items-center justify-center">
              <p className="text-sand-50 text-center font-serif text-xl md:text-2xl">아직 분양 시장은<br />하지 않습니다</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <img
              src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Professional workspace"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Row 3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
              alt="Urban design"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <img
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80"
              alt="Architecture detail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="aspect-[4/3] overflow-hidden rounded-sm group"
          >
            <img
              src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Building design"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </section>

      {/* 3D TO FLAT GALLERY */}
      <section ref={targetRef} className="w-full h-[300vh] bg-ink-950 relative">
        <div className="sticky top-0 w-full h-screen overflow-hidden bg-ink-950" style={{ perspective: 1200 }}>
          {galleryData.map((data, index) => (
            <GalleryImage key={index} data={data} index={index} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide py-24 md:py-36">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <h2 className="font-serif text-3xl md:text-5xl text-ink-800 mb-8">
            Let's start a conversation.
          </h2>
          <Link to="/contact" className="btn-primary">
            Contact the studio
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      </section>
    </motion.article>
  );
}
