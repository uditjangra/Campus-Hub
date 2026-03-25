"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Clock, Filter, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setDoc, doc } from "firebase/firestore";

export default function RequestsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({ title: "", description: "", category: "Notes" });

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.description) return;

    await addDoc(collection(db, "requests"), {
      ...newRequest,
      authorId: user?.uid,
      authorUsername: userData?.username,
      createdAt: serverTimestamp(),
      status: "open",
    });
    setIsModalOpen(false);
    setNewRequest({ title: "", description: "", category: "Notes" });
  };

  const handleAcceptRequest = async (req: any) => {
    if (!user || user.uid === req.authorId) return;
    setAcceptingId(req.id);
    
    try {
      const convoId = [user.uid, req.authorId].sort().join("_");
      const convoRef = doc(db, "conversations", convoId);
      
      const convoData = {
        participants: [user.uid, req.authorId],
        participantNames: {
          [user.uid]: userData?.displayName || user.displayName,
          [req.authorId]: req.authorUsername
        },
        status: "active", // Help requests skip the "pending" state because it's an explicit response
        lastMessage: `I'd like to help with your request: ${req.title}`,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: "help_request",
        requestId: req.id
      };

      await setDoc(convoRef, convoData, { merge: true });
      
      // Add first automated message
      await addDoc(collection(db, "conversations", convoId, "messages"), {
        text: convoData.lastMessage,
        senderId: user.uid,
        createdAt: serverTimestamp(),
      });

      router.push(`/chat?convId=${convoId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-tight">
              Help <span className="text-neon-green italic">Requests</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Found something you can help with? Chat and earn points.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="neon-button-filled flex items-center gap-2"
          >
            <Plus size={20} />
            New Request
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase bg-neon-green/10 text-neon-green px-2 py-1 rounded">
                      {req.category}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock size={12} />
                      {req.createdAt?.toDate ? "Recently" : "Just now"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{req.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                    {req.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 italic">Requested by @{req.authorUsername}</p>
                  <button 
                    onClick={() => handleAcceptRequest(req)}
                    disabled={acceptingId === req.id || user?.uid === req.authorId}
                    className="flex items-center gap-2 text-neon-green text-sm font-bold hover:underline disabled:opacity-50"
                  >
                    {acceptingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                    Accept & Chat
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Simplistic Modal Alternative for Demo */}
        {isModalOpen && (
           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card max-w-lg w-full p-8"
              >
                 <h2 className="text-2xl font-bold mb-6">Create Help Request</h2>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Title</label>
                      <input 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-neon-green outline-none" 
                        placeholder="e.g. Need DBMS notes"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      />
                    </div>
                    <div>
                    <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Category</label>
                      <select 
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-neon-green outline-none"
                        value={newRequest.category}
                        onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                      >
                        <option>Notes</option>
                        <option>Assignment</option>
                        <option>Coding</option>
                        <option>Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Description</label>
                      <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-neon-green outline-none min-h-[100px]"
                        placeholder="Provide details about your request..."
                        value={newRequest.description}
                        onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                       <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
                       <button type="submit" className="flex-1 neon-button-filled">Post Request</button>
                    </div>
                 </form>
              </motion.div>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
}
