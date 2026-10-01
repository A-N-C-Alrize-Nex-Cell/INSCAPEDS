import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Phone, Clock, Check } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  AnimatedText,
} from "../lib/animations";

const projectTypes = [
  "Residential",
  "Commercial",
  "Interiors",
  "Urban / Landscape",
  "Other",
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [isMapInteractive, setIsMapInteractive] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => {
      setStatus("success");
      setForm({ name: "", email: "", phone: "", projectType: "", message: "" });
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
      {/* HEADER */}
      <section className="pt-32 md:pt-44 pb-12 md:pb-16 container-wide">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="section-label mb-6"
        >
          Contact
        </motion.p>
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-ink-800 max-w-4xl leading-[1.1]">
          <AnimatedText text="Start a project" delay={0.3} />
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 max-w-xl text-lg text-ink-600 leading-relaxed"
        >
          Tell us about your site, your brief, and your timeline. We respond to
          every inquiry within three business days.
        </motion.p>
      </section>

      {/* SPLIT LAYOUT */}
      <section className="container-wide pb-24 md:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* FORM */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                />
                <div>
                  <label className="block text-xs uppercase tracking-ultra-wide text-ink-400 mb-3">
                    Project Type
                  </label>
                  <select
                    name="projectType"
                    value={form.projectType}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b border-ink-300/40 py-3 text-ink-800 focus:border-clay-500 focus:outline-none transition-colors"
                  >
                    <option value="" disabled>
                      Select a type
                    </option>
                    {projectTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-ultra-wide text-ink-400 mb-3">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full bg-transparent border-b border-ink-300/40 py-3 text-ink-800 focus:border-clay-500 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={status === "sending" || status === "success"}
                  className="btn-primary disabled:opacity-60"
                >
                  <AnimatePresence mode="wait">
                    {status === "idle" && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-3"
                      >
                        Send message
                      </motion.span>
                    )}
                    {status === "sending" && (
                      <motion.span
                        key="sending"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-3"
                      >
                        Sending...
                      </motion.span>
                    )}
                    {status === "success" && (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-3"
                      >
                        <Check size={18} />
                        Message sent
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </form>

            <AnimatePresence>
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex items-center gap-3 text-clay-600"
                >
                  <Check size={18} />
                  <p className="text-sm">
                    Thank you — we'll be in touch within three business days.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* STUDIO INFO */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className="space-y-8">
              <InfoBlock icon={MapPin} title="Studio">
                <p>218 Mill Street, Suite 4</p>
                <p>Portland, OR 97201</p>
              </InfoBlock>
              <InfoBlock icon={MapPin} title="City Office">
                <p>BA91, BA Block, Sector 1</p>
                <p>Bidhannagar, Kolkata - 700 064</p>
              </InfoBlock>
              <InfoBlock icon={Mail} title="Email">
                <a
                  href="mailto:hello@inscape.studio"
                  className="hover:text-clay-500 transition-colors"
                >
                  hello@inscape.studio
                </a>
              </InfoBlock>
              <InfoBlock icon={Phone} title="Phone">
                <a
                  href="tel:+15035550100"
                  className="hover:text-clay-500 transition-colors"
                >
                  +1 (503) 555-0100
                </a>
              </InfoBlock>
              <InfoBlock icon={Clock} title="Office Hours">
                <p>Monday – Friday</p>
                <p>9:00 – 18:00 PT</p>
              </InfoBlock>
            </div>

          </motion.div>
        </div>
      </section>

      {/* GOOGLE MAP */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden relative group"
        onMouseLeave={() => setIsMapInteractive(false)}
      >
        <div className="absolute inset-0 grayscale invert contrast-[1.2] brightness-75 hue-rotate-180 opacity-90">
          <iframe
            src="https://maps.google.com/maps?q=218%20Mill%20Street,%20Portland,%20OR%2097201&t=&z=14&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
            className={`absolute inset-0 ${!isMapInteractive ? "pointer-events-none" : ""}`}
          ></iframe>
        </div>

        {!isMapInteractive && (
          <div
            className="absolute inset-0 z-10"
            onClick={() => setIsMapInteractive(true)}
          />
        )}
      </motion.div>

      {/* CAREERS / PRESS */}
      <section className="bg-sand-200/50 py-20 md:py-28 grain-overlay">
        <div className="container-wide">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
          >
            <motion.div variants={staggerItem}>
              <p className="section-label mb-4">Careers</p>
              <h3 className="font-serif text-2xl md:text-3xl text-ink-800 mb-4">
                Join the studio
              </h3>
              <p className="text-ink-600 leading-relaxed mb-6">
                We're always looking for thoughtful architects and designers.
                Send your portfolio and a letter to{" "}
                <a
                  href="mailto:careers@inscape.studio"
                  className="text-clay-500 hover:text-clay-600 transition-colors"
                >
                  careers@inscape.studio
                </a>
                .
              </p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <p className="section-label mb-4">Press</p>
              <h3 className="font-serif text-2xl md:text-3xl text-ink-800 mb-4">
                Press inquiries
              </h3>
              <p className="text-ink-600 leading-relaxed mb-6">
                For publications, exhibitions, and speaking requests, contact{" "}
                <a
                  href="mailto:press@inscape.studio"
                  className="text-clay-500 hover:text-clay-600 transition-colors"
                >
                  press@inscape.studio
                </a>
                .
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.article>
  );
}

function Field({ label, name, type = "text", value, onChange, required }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-ultra-wide text-ink-400 mb-3">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-transparent border-b border-ink-300/40 py-3 text-ink-800 focus:border-clay-500 focus:outline-none transition-colors"
      />
    </div>
  );
}

function InfoBlock({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-4">
      <Icon size={20} className="text-clay-500 mt-1 flex-shrink-0" />
      <div>
        <p className="text-xs uppercase tracking-ultra-wide text-ink-400 mb-2">
          {title}
        </p>
        <div className="text-ink-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
