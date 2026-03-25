"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Award, Briefcase, GraduationCap, Link as LinkIcon, Loader2, CheckCircle2 } from "lucide-react";

export default function MentorApplyPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bio: userData?.bio || "",
    skills: "",
    experience: "",
    linkedin: "",
    category: "Frontend",
  });

  const categories = ["Frontend", "Backend", "AI/ML", "Design", "Aptitude", "Core Fundamentals"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isLoading) return;
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, "mentor_applications"), {
        userId: user.uid,
        name: userData?.displayName || user.displayName,
        username: userData?.username,
        email: user.email,
        bio: formData.bio,
        skills: formData.skills.split(",").map(s => s.trim()).filter(s => s !== ""),
        experience: formData.experience,
        linkedin: formData.linkedin,
        category: formData.category,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
      setTimeout(() => router.push("/mentors"), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-full bg-neon-green/10 flex items-center justify-center mb-6"
          >
            <CheckCircle2 size={40} className="text-neon-green" />
          </motion.div>
          <h2 className="text-3xl font-bold uppercase mb-2">Application Submitted!</h2>
          <p className="text-gray-500 max-w-sm">Your mentor application has been sent to the administrators for review. We will notify you once you are approved.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">
            Apply to be a <span className="text-neon-green italic">Mentor</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Share your knowledge and help build a stronger campus community.</p>
        </header>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Domain/Category</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green appearance-none transition-all"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Skills (comma separated)</label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    placeholder="React, Firebase, UI Design..."
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">LinkedIn / Portfolio URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input 
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin}
                    onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Bio</label>
                <textarea 
                  placeholder="Tell us a bit about your expertise..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-neon-green min-h-[100px] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Past Experience / Projects</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-4 text-white/40" size={18} />
              <textarea 
                placeholder="Mention relevant experience or projects that qualify you to be a mentor..."
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green min-h-[120px] transition-all"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex-1 py-4 text-gray-500 font-bold hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading || !formData.bio || !formData.skills}
              className="flex-[2] neon-button-filled py-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
