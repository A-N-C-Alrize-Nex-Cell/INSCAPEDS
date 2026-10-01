import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AnimatedRoutes from "./components/AnimatedRoutes";
import DriveRefresh from "./components/DriveRefresh";
import { prefetchAllProjects } from "./lib/drive";

import { ReactLenis } from '@studio-freight/react-lenis'

export default function App() {
  useEffect(() => {
    // Start prefetching Drive data in the background (non-blocking)
    // Don't await - let it load in the background
    prefetchAllProjects().catch(err => console.error("[App] prefetch error:", err));
  }, []);

  return (
    <ReactLenis root>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-sand-100">
          <Navbar />
          <main className="flex-1">
            <AnimatedRoutes />
          </main>
          <Footer />
          <DriveRefresh />
        </div>
      </BrowserRouter>
    </ReactLenis>
  );
}
