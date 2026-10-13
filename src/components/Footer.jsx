import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { navLinks } from "../data/content";

export default function Footer() {
  return (
    <footer className="bg-ink-800 text-sand-100 grain-overlay">
      <div className="container-wide pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <Link 
              to="/" 
              className="text-[2.25rem] tracking-tight transition-opacity duration-300 hover:opacity-80 flex items-center h-10"
              style={{ fontFamily: '"Arial Black", Arial, sans-serif' }}
            >
              <span className="text-black [-webkit-text-stroke:0.25px_white]">in</span>
              <span className="text-[#31682c]">scape</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sand-300">
              Inscape Design Studio is an exclusive landscape design firm based in Kolkata, India, offering expert amenities in landscape planning, landscape architecture as well as urban scale intervention.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-widest text-sand-400 mb-2 h-10 flex items-center">
              Navigate
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-sand-200 hover:text-sand-50 transition-colors link-underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-widest text-sand-400 mb-2 h-10 flex items-center">
              City Office
            </h4>
            <address className="not-italic text-sm text-sand-200 leading-relaxed space-y-2">
              <p>BA91, BA Block, Sector 1</p>
              <p>Bidhannagar, Kolkata - 700 064</p>
            </address>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs uppercase tracking-widest text-sand-400 mb-2 h-10 flex items-center">
              Get in Touch
            </h4>
            <p className="text-sm leading-relaxed text-sand-300">
              Have a question or project in mind? Drop us a message or email—we'd love to connect!
            </p>
            <div className="flex items-center gap-4 mt-8">
              <a
                href="https://www.instagram.com/inscape__design__studio/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-sand-300 hover:text-sand-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/IDS07/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-sand-300 hover:text-sand-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="text-sand-300 hover:text-sand-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.249-.129.597-.129.946v5.421h-3.554s.05-8.805 0-9.728h3.554v1.375c.427-.659 1.191-1.592 2.897-1.592 2.117 0 3.704 1.385 3.704 4.362v5.583zM5.337 9.432c-1.144 0-1.915-.761-1.915-1.713 0-.951.77-1.714 1.96-1.714 1.188 0 1.914.763 1.939 1.714 0 .952-.751 1.713-1.984 1.713zm1.946 11.02H3.387V9.724h3.896v10.728zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="hairline bg-sand-50/10 my-12" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-sand-400">
            © {new Date().getFullYear()} Inscape Architecture Studio. All rights reserved.
          </p>
          <a
            href="mailto:info.inscapeds@gmail.com"
            className="text-xs text-sand-300 hover:text-sand-50 transition-colors inline-flex items-center gap-1"
          >
            Start a project
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
