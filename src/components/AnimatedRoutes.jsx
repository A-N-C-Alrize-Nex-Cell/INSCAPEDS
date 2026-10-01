import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence } from "framer-motion";
import Home from "../pages/Home";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";

// Lazy load non-critical pages
const About = lazy(() => import("../pages/About"));
const Awards = lazy(() => import("../pages/Awards"));
const Contact = lazy(() => import("../pages/Contact"));

// Loading fallback
const PageLoader = () => <div className="h-screen bg-sand-100" />;

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/awards" element={<Suspense fallback={<PageLoader />}><Awards /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
}
