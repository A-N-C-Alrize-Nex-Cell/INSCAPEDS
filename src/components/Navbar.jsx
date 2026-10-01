import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "../data/content";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  // Project detail pages (/projects/:id) open on a full-bleed hero image,
  // same as Home — so they get the same transparent-header / white-text
  // treatment at the top, settling to the normal solid header on scroll.
  const isProjectDetail = /^\/projects\/[^/]+$/.test(location.pathname);
  const isHomeTop = location.pathname === "/" && !scrolled;
  const isHeroTop = (location.pathname === "/" || isProjectDetail) && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-sand-100/85 backdrop-blur-md border-b border-ink-200/20"
          : "bg-transparent"
          }`}
      >
        <nav className="container-wide flex items-center justify-between py-1">
          <Link
            to="/"
            className="text-[2.25rem] tracking-tight transition-opacity duration-300 hover:opacity-80 flex items-center"
            style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
          >
            <span className="text-black [-webkit-text-stroke:0.25px_white]">in</span>
            <span className="text-[#31682c]">scape</span>
          </Link>

          <ul className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              let linkColor = active ? "text-[#31682c]" : "text-ink-700 hover:text-ink-900";
              if (isHeroTop) {
                linkColor = "text-white hover:text-sand-200";
              }

              const staticUnderline = isHomeTop && link.name === "Home" ? "after:w-1/2 after:bg-white after:left-1/2 after:-translate-x-1/2" : "";

              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`text-base font-medium tracking-wide transition-colors duration-300 link-underline ${staticUnderline} ${linkColor}`}
                  >
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => setMenuOpen(true)}
            className={`md:hidden ${isHeroTop ? "text-white" : "text-ink-800"}`}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-ink-800 md:hidden"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <span
                className="text-[2.25rem] tracking-tight flex items-center"
                style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
              >
                <span className="text-white">in</span>
                <span className="text-[#31682c]">scape</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-sand-50"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
              }}
              className="flex flex-col px-6 mt-10"
            >
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <motion.li
                    key={link.name}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    className="border-b border-sand-50/10 py-6"
                  >
                    <Link
                      to={link.path}
                      className={`font-serif text-3xl transition-colors ${active ? "text-[#31682c]" : "text-sand-50"
                        }`}
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
