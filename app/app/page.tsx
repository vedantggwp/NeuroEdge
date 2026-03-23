import { Hero } from "@/components/Hero";
import { SocialProof } from "@/components/SocialProof";
import { WhyCare } from "@/components/WhyCare";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { GsapAnimations } from "@/components/GsapAnimations";

export default function Home() {
  return (
    <>
      <GsapAnimations />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <WhyCare />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
