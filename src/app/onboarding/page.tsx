"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, ChevronRight, GraduationCap, Building2, UserCircle, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { userData, updateProfile, uploadProfilePhoto } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    bio: "",
    branch: "",
    year: "",
  });

  const branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Business"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => setStep(2);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Upload photo if selected
      if (fileInputRef.current?.files?.[0]) {
        await uploadProfilePhoto(fileInputRef.current.files[0]);
      }

      // 2. Update profile data
      await updateProfile({
        ...formData,
        completedOnboarding: true,
      });

      // 3. Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main-gradient flex items-center justify-center p-6 bg-grid-pattern">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-xl p-8 sm:p-12"
      >
        <div className="mb-10 text-center">
          <div className="flex justify-center gap-2 mb-6">
            <div className={`h-1 w-12 rounded-full ${step >= 1 ? "bg-neon-green" : "bg-white/10"}`} />
            <div className={`h-1 w-12 rounded-full ${step >= 2 ? "bg-neon-green" : "bg-white/10"}`} />
          </div>
          <h1 className="text-4xl font-display font-bold text-white uppercase tracking-tight">
            Complete your <span className="text-neon-green italic">Profile</span>
          </h1>
          <p className="text-gray-400 mt-2">Let the campus community know who you are.</p>
        </div>

        {step === 1 ? (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center mb-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer group hover:border-neon-green transition-all"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto text-gray-500 group-hover:text-neon-green mb-1" size={24} />
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                onClick={() => setPreviewUrl(null)}
                className="text-[10px] text-gray-500 mt-2 hover:text-white uppercase font-bold"
              >
                Skip photo for now
              </button>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">About You (Bio)</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-4 text-white/40" size={18} />
                    <textarea 
                      placeholder="Share a bit about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green min-h-[120px] transition-all"
                    />
                  </div>
               </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full neon-button-filled py-4 flex items-center justify-center gap-2 group mt-8"
            >
              Next Step
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Branch</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <select 
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green appearance-none transition-all"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Current Year</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-green appearance-none transition-all"
                  >
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-10">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-4 text-gray-500 font-bold hover:text-white transition-colors"
                disabled={isLoading}
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isLoading || !formData.branch || !formData.year}
                className="flex-[2] neon-button-filled py-4 flex items-center justify-center gap-2 disabled:opacity-50 transition-all font-bold"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Finalize Profile"}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
