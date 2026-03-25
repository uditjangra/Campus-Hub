"use client";

import { motion } from "framer-motion";
import { Users, Lightbulb, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: <Users className="text-neon-green" />,
    title: "Subscribe to Community",
    description: "Stay updated with campus activities",
    label: "Always On",
  },
  {
    icon: <Lightbulb className="text-neon-green" />,
    title: "Discover Opportunities",
    description: "Find events, mentors, and collaborations",
    label: "Hot",
  },
  {
    icon: <HeartHandshake className="text-neon-green" />,
    title: "Help & Earn",
    description: "Offer skills or request help",
    label: "Earn Now",
  },
];

export default function FeatureStrip() {
  return (
    <section className="py-20 -mt-10">
      <div className="container mx-auto px-6">
        <div className="glass-card p-1">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 rounded-2xl overflow-hidden">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                className="p-8 flex flex-col items-start gap-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="p-3 bg-neon-green/10 rounded-xl">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neon-green bg-neon-green/10 px-2 py-1 rounded">
                    {feature.label}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
