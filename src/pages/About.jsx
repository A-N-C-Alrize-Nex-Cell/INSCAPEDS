import { useState } from "react";
import { motion } from "framer-motion";
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
import LightboxModal from "../components/LightboxModal";

const studioImage =
  "https://images.pexels.com/photos/6615107/pexels-photo-6615107.jpeg?auto=compress&cs=tinysrgb&w=1600";
const founderImage =
  "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=800";

export default function About() {
  // Live Drive data (only trusted once VITE_DRIVE_API_KEY / ROOT_FOLDER_ID are
  // set — see DRIVE_INTEGRATION.md); each falls back to the stock photo above
  // until its About/<section> Drive folder has an image in it.
  const driveReady = isDriveConfigured();
  const { data: introImages } = useSectionImages("about", "Hero Section");
  const { data: founderImages } = useSectionImages("about", "Second Section");
  const { data: howWeWorkImages } = useSectionImages("about", "How We Work_Section");
  const { data: bentoImages } = useSectionImages("about", "Bento Grid_Section");
  const { data: driveTeamMembers } = useTeamMembers();

  const introSrc = (driveReady && introImages?.[0]?.src) || studioImage;
  const introCandidates = driveReady && introImages?.[0]?.srcCandidates;
  const founderSrc = (driveReady && founderImages?.[0]?.src) || founderImage;
  const founderCandidates = driveReady && founderImages?.[0]?.srcCandidates;

  // 5 slots: first 4 fill the small 2x2 photos, the 5th is the large tall
  // photo — numbered 1_.. through 5_.. in the Drive folder to control order.
  const bentoSlots = [0, 1, 2, 3, 4].map((i) => {
    const img = driveReady && bentoImages?.[i];
    return {
      src: img?.src || studioImage,
      candidates: img?.srcCandidates,
    };
  });

  // Use Drive team members if available, otherwise fallback to static data
  const displayTeam = (driveReady && driveTeamMembers && driveTeamMembers.length > 0)
    ? driveTeamMembers
    : team;

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxList, setLightboxList] = useState([]);

  const openLightbox = (list, idx) => {
    setLightboxList(list);
    setLightboxIndex(idx);
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* HEADER + INTRO WITH FULL-HEIGHT IMAGE — this section skips the
          site-wide 1440px container cap and instead uses the same
          responsive side padding directly, with the image column set to
          1fr. That way the image's gap to the text and its gap to the
          viewport's edge are driven by the same padding/gap values and
          stay equal at any screen width, including ultra-wide monitors
          (where a capped container would otherwise leave a huge empty
          margin only past the image, not past the text). */}
      <section className="pt-32 md:pt-44 pb-24 md:pb-36 px-6 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,380px)_1fr] lg:grid-cols-[minmax(0,500px)_1fr] xl:grid-cols-[minmax(0,620px)_1fr] 2xl:grid-cols-[minmax(0,780px)_1fr] gap-y-6 gap-x-6 md:gap-x-10 lg:gap-x-16">
          {/* Top left: Section label + Title */}
          <motion.div className="md:col-start-1 md:row-start-1">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="section-label mb-6"
            >
              About Inscape
            </motion.p>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-ink-800 leading-[1.1]">
              <AnimatedText text="A studio shaped by the places it works in" delay={0.3} />
            </h1>
          </motion.div>

          {/* Top right: Image — stretches to match the full height of the
              text column it sits beside (title + paragraphs), so its top
              and bottom edges align with the text instead of being sized
              off its own aspect ratio. Falls back to a fixed ratio on
              mobile, where it stacks standalone above the text. */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="md:col-start-2 md:row-start-1 md:row-span-2"
          >
            <div
              className="w-full h-full overflow-hidden rounded-sm bg-sand-200 aspect-[3/4] md:aspect-auto"
            >
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
            className="md:col-start-1 md:row-start-2 space-y-6"
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
          {displayTeam.map((member, i) => {
            const teamImagesList = displayTeam.map((m) => ({
              src: m.src || m.image,
              candidates: m.srcCandidates || (m.src || m.image ? [m.src || m.image] : []),
              alt: m.name,
            }));

            return (
              <motion.div
                key={i}
                variants={staggerItem}
                onClick={() => openLightbox(teamImagesList, i)}
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
          );
        })}
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
                // Find matching image from Drive for this step. Matches by
                // numeric value of the filename with its extension stripped
                // (handles "4.jpg", "04.jpg", "4_build.png", or a bare "4"
                // with no extension at all — all resolve to step 04).
                const numInt = parseInt(step.number, 10);
                const stepImage = howWeWorkImages?.find((img) => {
                  const base = (img.name || "").replace(/\.[^.]+$/, "").trim();
                  const baseNum = parseInt(base, 10);
                  return baseNum === numInt;
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

      {/* BENTO GRID — 2x2 small photos on the left, one large tall photo
          on the right. Sourced from the About/Bento Grid_Section Drive
          folder, numbered 1_.. through 5_.. to control which photo lands
          in which slot (5th = the large one). */}
      <section className="container-wide pt-0 pb-24 md:pb-36">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="photo-bento grid grid-cols-2 gap-3 md:gap-4"
        >
          <motion.div
            variants={staggerItem}
            className="photo-bento-a aspect-[4/5] md:aspect-auto overflow-hidden rounded-sm bg-sand-200"
          >
            <ResilientImage
              src={bentoSlots[0].src}
              candidates={bentoSlots[0].candidates}
              alt="Inscape studio"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="photo-bento-b aspect-[4/5] md:aspect-auto overflow-hidden rounded-sm bg-sand-200"
          >
            <ResilientImage
              src={bentoSlots[1].src}
              candidates={bentoSlots[1].candidates}
              alt="Inscape studio"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="photo-bento-c aspect-[4/5] md:aspect-auto overflow-hidden rounded-sm bg-sand-200"
          >
            <ResilientImage
              src={bentoSlots[2].src}
              candidates={bentoSlots[2].candidates}
              alt="Inscape studio"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="photo-bento-d aspect-[4/5] md:aspect-auto overflow-hidden rounded-sm bg-sand-200"
          >
            <ResilientImage
              src={bentoSlots[3].src}
              candidates={bentoSlots[3].candidates}
              alt="Inscape studio"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="photo-bento-e col-span-2 md:col-span-1 aspect-[16/9] md:aspect-auto overflow-hidden rounded-sm bg-sand-200"
          >
            <ResilientImage
              src={bentoSlots[4].src}
              candidates={bentoSlots[4].candidates}
              alt="Inscape studio"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>

        <style>{`
          @media (min-width: 768px) {
            .photo-bento {
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(2, minmax(280px, 1fr));
              grid-template-areas:
                "a b e"
                "c d e";
            }
            .photo-bento-a { grid-area: a; }
            .photo-bento-b { grid-area: b; }
            .photo-bento-c { grid-area: c; }
            .photo-bento-d { grid-area: d; }
            .photo-bento-e { grid-area: e; }
          }
        `}</style>
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

      {/* LIGHTBOX MODAL */}
      <LightboxModal
        isOpen={lightboxIndex !== null}
        images={lightboxList}
        currentIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </motion.article>
  );
}
