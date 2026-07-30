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
import HomeSwitch from "@/components/astres/HomeSwitch";

/**
 * The home is capability-gated (HomeSwitch): capable desktop browsers get the
 * astres solar system; crawlers, small screens and WebGL-less browsers keep
 * the classic single-page assembly below — five acts over one persistent
 * WebGL backdrop: noise → signal (Hero) → systems (Work) → human (About/Now)
 * → door (Contact). The fixed canvas sits at z-0; content scrolls at z-10.
 */
export default function Home() {
  return (
    <HomeSwitch>
    <SmoothScroll>
      <HeroCanvas />
      <Header />
      <SectionHUD />
      <main className="relative z-10">
        <Hero />
        <Marquee />
        {/* scrim: near-solid from Work all the way through Contact —
            readability beats the sunrise shot */}
        <div
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(7,4,3,0.88) 4%, rgba(7,4,3,0.88) 100%)",
          }}
        >
          <Work />
          <About />
          <Now />
          <Contact />
        </div>
      </main>
    </SmoothScroll>
    </HomeSwitch>
  );
}
