import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeatureStrip from "@/components/landing/FeatureStrip";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <FeatureStrip />
      
      {/* Footer Placeholder for visual completeness */}
      <footer className="py-12 border-t border-white/5 bg-black/20 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-2xl font-display font-bold text-white">
            <span className="text-neon-green">Campus</span>Hub
          </p>
          <p className="text-gray-500 text-sm">
            © 2026 CampusHub. Built for the next generation.
          </p>
        </div>
      </footer>
    </main>
  );
}
