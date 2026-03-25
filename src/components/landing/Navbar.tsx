"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] max-w-7xl rounded-2xl border border-white/10 ${
        isScrolled ? "bg-royal-blue/80 backdrop-blur-lg py-3 shadow-glass" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <span className="text-neon-green">Campus</span>Hub
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-neon-green transition-colors">Features</Link>
          <Link href="#community" className="text-sm font-medium hover:text-neon-green transition-colors">Community</Link>
          <Link href="#mentors" className="text-sm font-medium hover:text-neon-green transition-colors">Mentors</Link>
          <Link href="/login">
            <button className="neon-button text-sm py-2 px-6">
              Login / Dashboard
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
