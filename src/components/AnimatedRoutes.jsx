import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import { useLenis } from "@studio-freight/react-lenis";
import Home from "../pages/Home";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";

// Lazy load non-critical pages
const About = lazy(() => import("../pages/About"));
const Awards = lazy(() => import("../pages/Awards"));
const Contact = lazy(() => import("../pages/Contact"));
const PublicationDetail = lazy(() => import("../pages/PublicationDetail"));
const AwardDetail = lazy(() => import("../pages/AwardDetail"));

// Loading fallback
const PageLoader = () => <div className="h-screen bg-sand-100" />;

export default function AnimatedRoutes() {
  const location = useLocation();
  const lenis = useLenis();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        if (!sessionStorage.getItem("return_to_section")) {
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
          }
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }}
    >
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/awards" element={<Suspense fallback={<PageLoader />}><Awards /></Suspense>} />
        <Route path="/awards/publication/:id" element={<Suspense fallback={<PageLoader />}><PublicationDetail /></Suspense>} />
        <Route path="/publication/:id" element={<Suspense fallback={<PageLoader />}><PublicationDetail /></Suspense>} />
        <Route path="/awards/award/:id" element={<Suspense fallback={<PageLoader />}><AwardDetail /></Suspense>} />
        <Route path="/awards/honor/:id" element={<Suspense fallback={<PageLoader />}><AwardDetail /></Suspense>} />
        <Route path="/award/:id" element={<Suspense fallback={<PageLoader />}><AwardDetail /></Suspense>} />
        <Route path="/honor/:id" element={<Suspense fallback={<PageLoader />}><AwardDetail /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
}
