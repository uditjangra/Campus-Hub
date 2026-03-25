"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X, User, ExternalLink, Mail, Clock, AlertCircle } from "lucide-react";

const ADMIN_EMAIL = "admin@gmail.com";

export default function AdminPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const q = query(collection(db, "mentor_applications"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [isAuthorized]);

  const handleApprove = async (app: any) => {
    try {
      // 1. Update application status
      await updateDoc(doc(db, "mentor_applications", app.id), {
        status: "approved",
        processedAt: serverTimestamp(),
      });

      // 2. Create mentor record
      await setDoc(doc(db, "mentors", app.userId), {
        name: app.name,
        username: app.username,
        email: app.email,
        bio: app.bio,
        skills: app.skills,
        experience: app.experience,
        linkedin: app.linkedin,
        category: app.category,
        rating: 5.0,
        reviewsCount: 0,
        createdAt: serverTimestamp(),
      });

      // 3. Update user record
      await updateDoc(doc(db, "users", app.userId), {
        isMentor: true,
        skills: app.skills,
        bio: app.bio,
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (app: any) => {
    try {
      await updateDoc(doc(db, "mentor_applications", app.id), {
        status: "rejected",
        processedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || isAuthorized === null) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-neon-green animate-pulse font-bold tracking-widest uppercase">Authorizing...</p></div>;
  }

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Shield size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-bold uppercase mb-2">Access Denied</h1>
        <p className="text-gray-500 max-w-sm mb-8">This section is restricted to administrators only. Your account does not have the required permissions.</p>
        <button onClick={() => router.push("/dashboard")} className="neon-button px-8 py-3">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-tight flex items-center gap-3">
              Admin <span className="text-neon-green italic underline decoration-neon-green/30">Panel</span>
              <Shield size={24} className="text-neon-green" />
            </h1>
            <p className="text-gray-500 text-sm mt-1">Manage mentor applications and campus verification.</p>
          </div>
          <div className="bg-neon-green/10 text-neon-green px-4 py-2 rounded-full text-xs font-bold border border-neon-green/20">
            SYSTEM ONLINE
          </div>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-white/80 border-l-4 border-neon-green pl-4">
            Pending Mentor Applications ({applications.length})
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-6 flex flex-col md:flex-row gap-8 items-start justify-between border-neon-green/5"
                  >
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          <User size={24} className="text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{app.name} (@{app.username})</h3>
                          <p className="text-xs text-neon-green font-bold uppercase tracking-widest">{app.category}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                           <p className="flex items-center gap-2 text-gray-400"><Mail size={14} /> {app.email}</p>
                           <p className="flex items-center gap-2 text-gray-400"><Clock size={14} /> Applied on {app.createdAt?.toDate ? new Intl.DateTimeFormat('en-GB').format(app.createdAt.toDate()) : 'Recently'}</p>
                           {app.linkedin && (
                             <a href={app.linkedin} target="_blank" className="flex items-center gap-2 text-blue-400 hover:underline"><ExternalLink size={14} /> View LinkedIn</a>
                           )}
                        </div>
                        <div className="space-y-2">
                           <p className="text-gray-500 uppercase font-bold text-[10px]">Skills</p>
                           <div className="flex flex-wrap gap-1">
                             {app.skills?.map((s: string) => <span key={s} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px]">{s}</span>)}
                           </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-gray-500 uppercase font-bold text-[10px]">Bio & Experience</p>
                        <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                          {app.experience}
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-3 shrink-0 w-full md:w-auto">
                      <button 
                        onClick={() => handleApprove(app)}
                        className="flex-1 md:w-32 bg-neon-green text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-neon transition-all"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(app)}
                        className="flex-1 md:w-32 bg-white/5 text-red-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all border border-red-500/20"
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-white/5">
                   <AlertCircle size={48} className="text-gray-700 mb-4" />
                   <h3 className="text-xl font-bold uppercase text-gray-500">No Pending Applications</h3>
                   <p className="text-sm text-gray-600">Great work! The queue is empty.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
