import { Hero } from "@/components/Hero";
import { SocialProof } from "@/components/SocialProof";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main id="main-content">
        <Hero />
        <SocialProof />
      </main>
      <Footer />
    </>
  );
}
