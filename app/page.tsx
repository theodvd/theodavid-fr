import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import HeroCanvas from "@/components/three/HeroCanvas";
import SectionHUD from "@/components/SectionHUD";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Work from "@/components/Work";
import About from "@/components/About";
import Now from "@/components/Now";
import Contact from "@/components/Contact";

/**
 * Single-page assembly — five acts over one persistent WebGL backdrop:
 * noise → signal (Hero) → systems (Work) → human (About/Now) → door (Contact).
 * The fixed canvas sits at z-0; all content scrolls above it at z-10.
 */
export default function Home() {
  return (
    <SmoothScroll>
      <HeroCanvas />
      <Header />
      <SectionHUD />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        {/* scrim: near-solid through the reading sections, feathered edges */}
        <div
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(7,4,3,0.88) 4%, rgba(7,4,3,0.88) 96%, transparent 100%)",
          }}
        >
          <Work />
          <About />
          <Now />
        </div>
        <Contact />
      </main>
    </SmoothScroll>
  );
}
