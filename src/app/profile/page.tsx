"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { User, Mail, GraduationCap, Globe, Save } from "lucide-react";

export default function ProfilePage() {
  const { userData, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || "",
    bio: userData?.bio || "",
    branch: userData?.branch || "",
    year: userData?.year || "",
    skills: userData?.skills?.join(", ") || "",
  });

  const handleUpdate = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        ...formData,
        skills: formData.skills.split(",").map((s: string) => s.trim()).filter((s: string) => s !== ""),
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">
            User <span className="text-neon-green italic">Profile</span>
          </h1>
          <button 
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            className="neon-button py-2 px-6 flex items-center gap-2 text-sm"
          >
            {isEditing ? <Save size={18} /> : null}
            {isEditing ? "Save Profile" : "Edit Profile"}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass-card p-8 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-neon-green to-royal-blue p-1 mb-6">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold uppercase">
                  {userData?.username?.[0] || "U"}
                </div>
              </div>
              <h2 className="text-2xl font-bold">{userData?.displayName}</h2>
              <p className="text-neon-green font-mono text-sm tracking-widest">@{userData?.username}</p>
              
              <div className="mt-6 flex gap-4">
                 <div className="text-center">
                   <p className="text-xl font-bold">12</p>
                   <p className="text-[10px] uppercase text-gray-500">Posts</p>
                 </div>
                 <div className="text-center border-x border-white/10 px-4">
                   <p className="text-xl font-bold">48</p>
                   <p className="text-[10px] uppercase text-gray-500">Helpful</p>
                 </div>
                 <div className="text-center">
                   <p className="text-xl font-bold">5</p>
                   <p className="text-[10px] uppercase text-gray-500">Mentee</p>
                 </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail size={16} className="text-neon-green" />
                {user?.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <GraduationCap size={16} className="text-neon-green" />
                {userData?.branch || "Branch not set"} • {userData?.year || "Year not set"}
              </div>
            </div>
          </div>

          {/* Right Column: Bio & Skills */}
          <div className="md:col-span-2 space-y-6">
             <div className="glass-card p-8">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <User size={18} className="text-neon-green" />
                  Biography
                </h3>
                {isEditing ? (
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-neon-green min-h-[120px]"
                  />
                ) : (
                  <p className="text-gray-300 leading-relaxed italic">
                    {userData?.bio || "No bio added yet. Tell us about yourself!"}
                  </p>
                )}
             </div>

             <div className="glass-card p-8">
                <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Globe size={18} className="text-neon-green" />
                  Skills & Interests
                </h3>
                {isEditing ? (
                  <input 
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="React, Design, Python..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-neon-green"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userData?.skills?.length > 0 ? userData.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-bold rounded-full uppercase">
                        {skill}
                      </span>
                    )) : <p className="text-gray-500 text-sm">No skills listed.</p>}
                  </div>
                )}
             </div>

             {isEditing && (
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500">Branch</label>
                    <input 
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-neon-green"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-gray-500">Year</label>
                    <input 
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-neon-green"
                    />
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
