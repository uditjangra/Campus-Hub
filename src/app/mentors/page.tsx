"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  onSnapshot, 
  doc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { Search, Star, Award, GraduationCap } from "lucide-react";

const categories = ["All", "Frontend", "Backend", "AI/ML", "Design", "Aptitude"];

export default function MentorsPage() {
  const { user, userData } = useAuth();
  const [mentors, setMentors] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "mentors"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMentors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const toggleMentorStatus = async () => {
    if (!user) return;
    const isMentor = mentors.find(m => m.id === user.uid);
    if (isMentor) {
      await deleteDoc(doc(db, "mentors", user.uid));
    } else {
      await setDoc(doc(db, "mentors", user.uid), {
        name: userData?.displayName,
        username: userData?.username,
        skills: userData?.skills || [],
        bio: userData?.bio || "",
        rating: 5.0,
        reviewsCount: 0,
      });
    }
  };

  const isUserMentor = mentors.find(m => m.id === user?.uid);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-tight">
              Campus <span className="text-neon-green italic">Mentors</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Connect with seniors and experts on campus.</p>
          </div>
          <button 
            onClick={toggleMentorStatus}
            className={`px-8 py-3 rounded-full font-bold transition-all duration-300 border-2 ${
              isUserMentor ? "border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white" : "neon-button"
            }`}
          >
            {isUserMentor ? "Unregister as Mentor" : "Register as Mentor"}
          </button>
        </header>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                placeholder="Search by skill or name..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm outline-none focus:border-neon-green"
              />
           </div>
           <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    filter === cat ? "bg-neon-green text-black" : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <motion.div
              key={mentor.id}
              whileHover={{ y: -5 }}
              className="glass-card p-6 flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-neon-green to-royal-blue p-1">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl font-bold">
                    {mentor.username?.[0] || "U"}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-neon-green p-1.5 rounded-full border-2 border-black">
                  <Award size={14} className="text-black" />
                </div>
              </div>

              <h3 className="text-lg font-bold">{mentor.name}</h3>
              <p className="text-gray-500 text-xs mb-4">@{mentor.username}</p>

              <div className="flex gap-1 mb-6">
                 {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-neon-green fill-neon-green" />)}
              </div>

              <div className="flex flex-wrap gap-1 justify-center mb-6">
                {mentor.skills?.slice(0,3).map((skill: string) => (
                  <span key={skill} className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] uppercase text-gray-400 rounded">
                    {skill}
                  </span>
                ))}
              </div>

              <button className="w-full neon-button py-2 text-sm">
                Request Mentorship
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
