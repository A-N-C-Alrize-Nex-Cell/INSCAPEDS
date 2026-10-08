import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Check, Plus } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  AnimatedText,
} from "../lib/animations";
import { useContactImages } from "../hooks/useDrive";
import ResilientImage from "../components/ResilientImage";

const FALLBACK_CONTACT_IMAGE =
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [isMapInteractive, setIsMapInteractive] = useState(false);

  const { data: driveImages } = useContactImages();
  const featuredImage = driveImages?.[0];
  const featuredImageSrc = featuredImage?.src || FALLBACK_CONTACT_IMAGE;
  const featuredImageCandidates = featuredImage?.srcCandidates;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    }, 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* MAIN SPLIT CONTACT SECTION (FIRST VIEWPORT WINDOW) */}
      <section className="pt-28 md:pt-36 pb-24 md:pb-36 min-h-[calc(100vh-100px)] flex flex-col justify-center w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-start pl-0 pr-4 sm:pr-8 lg:pr-12">

          {/* LEFT COLUMN: RESILIENT IMAGE STYLING */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-6 xl:col-span-6 w-full h-[380px] md:h-[480px] lg:h-[560px] pl-0 ml-0 overflow-hidden"
          >
            <ResilientImage
              src={featuredImageSrc}
              candidates={featuredImageCandidates}
              alt="Studio contact featured image"
              fallbackSrc={FALLBACK_CONTACT_IMAGE}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* RIGHT COLUMN: FREE FORM */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between py-2 px-4 sm:px-6 lg:px-4"
          >
            <div>
              {/* HEADING */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 font-sans mb-3">
                Get in touch
              </h1>

              {/* SUBTITLE */}
              <p className="text-ink-600 text-base sm:text-lg font-sans font-normal mb-8 md:mb-10">
                Contact the Inscape team today!
              </p>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* NAME & EMAIL SIDE-BY-SIDE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                  <div>
                    <label className="block text-xs uppercase tracking-ultra-wide text-ink-500 font-semibold mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Name"
                      className="w-full bg-transparent border-b border-ink-300/60 py-3 text-ink-900 placeholder-ink-400 focus:border-ink-900 focus:outline-none transition-colors text-base font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-ultra-wide text-ink-500 font-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className="w-full bg-transparent border-b border-ink-300/60 py-3 text-ink-900 placeholder-ink-400 focus:border-ink-900 focus:outline-none transition-colors text-base font-sans"
                    />
                  </div>
                </div>

                {/* MESSAGE FIELD */}
                <div>
                  <label className="block text-xs uppercase tracking-ultra-wide text-ink-500 font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Message"
                    className="w-full bg-transparent border-b border-ink-300/60 py-3 text-ink-900 placeholder-ink-400 focus:border-ink-900 focus:outline-none transition-colors resize-none text-base font-sans"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={status === "sending" || status === "success"}
                    className="px-8 py-3.5 bg-[#31682c] hover:bg-[#275323] text-white font-medium text-sm rounded-full inline-flex items-center gap-3 transition-all duration-200 cursor-pointer shadow-md disabled:opacity-60"
                  >
                    <AnimatePresence mode="wait">
                      {status === "idle" && (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2.5"
                        >
                          <span>Submit</span>
                          <span className="w-2 h-2 bg-white rounded-[1px] inline-block" />
                        </motion.span>
                      )}
                      {status === "sending" && (
                        <motion.span
                          key="sending"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2"
                        >
                          <span>Sending...</span>
                        </motion.span>
                      )}
                      {status === "success" && (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="inline-flex items-center gap-2"
                        >
                          <Check size={16} />
                          <span>Submitted</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {status === "success" && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 text-sm text-clay-600 font-sans flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Thank you — we'll be in touch within three business days.</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STUDIO ADDRESS & DETAILS */}
      <section className="container-wide py-16 md:py-20 border-t border-ink-200/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InfoBlock icon={MapPin} title="Studio">
            <p>BA91, BA Block, Sector 1</p>
            <p className="text-ink-500">Bidhannagar, Kolkata - 700 064</p>
          </InfoBlock>
          <InfoBlock icon={Mail} title="Email">
            <a
              href="mailto:hello@inscape.studio"
              className="hover:text-clay-500 transition-colors"
            >
              hello@inscape.studio
            </a>
          </InfoBlock>
          <InfoBlock icon={Clock} title="Office Hours">
            <p>Monday – Friday</p>
            <p className="text-ink-500">9:00 AM – 8:00 PM</p>
          </InfoBlock>
        </div>
      </section>

      {/* GOOGLE MAP */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full h-[400px] md:h-[450px] lg:h-[550px] overflow-hidden relative group border-t border-ink-200/60"
        onMouseLeave={() => setIsMapInteractive(false)}
      >
        <div
          className="absolute inset-0"
          style={{
            filter: "invert(0.9) hue-rotate(180deg) brightness(0.7) saturate(0.9)",
          }}
        >
          <iframe
            src="https://maps.google.com/maps?q=Inscape%20Design%20Studio%20BA%2091%20BA%20Block%20Sector%201%20Bidhannagar%20Kolkata%20West%20Bengal%20700064&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Inscape Design Studio Map"
            className={`absolute inset-0 ${!isMapInteractive ? "pointer-events-none" : ""}`}
          ></iframe>
        </div>

        {!isMapInteractive && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={() => setIsMapInteractive(true)}
          />
        )}
      </motion.div>
    </motion.article>
  );
}

function InfoBlock({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-4 p-6 rounded-xl border border-ink-200/60">
      <Icon size={20} className="text-clay-500 mt-1 flex-shrink-0" />
      <div>
        <p className="text-xs uppercase tracking-ultra-wide font-semibold text-ink-400 mb-2 font-sans">
          {title}
        </p>
        <div className="text-ink-700 text-sm leading-relaxed font-sans">{children}</div>
      </div>
    </div>
  );
}
