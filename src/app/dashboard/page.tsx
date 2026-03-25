"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

export default function FeedPage() {
  const { user, userData } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await addDoc(collection(db, "posts"), {
        content: newPost,
        authorId: user?.uid,
        authorName: userData?.displayName || user?.displayName,
        authorUsername: userData?.username,
        authorPhoto: userData?.photoURL || user?.photoURL,
        createdAt: serverTimestamp(),
        likes: [],
        commentsCount: 0,
      });
      setNewPost("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold uppercase tracking-tight">
            Campus <span className="text-neon-green italic">Feed</span>
          </h1>
          <div className="flex gap-2">
            <span className="text-[10px] bg-neon-green/10 text-neon-green px-2 py-1 rounded-full font-bold uppercase">Latest</span>
            <span className="text-[10px] bg-white/5 text-gray-500 px-2 py-1 rounded-full font-bold uppercase">Popular</span>
          </div>
        </header>

        {/* Create Post */}
        <div className="glass-card p-6">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-green to-royal-blue p-0.5 shrink-0">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-xs">
                  {userData?.username?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's happening on campus?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-neon-green min-h-[100px] resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isPosting || !newPost.trim()}
                className="neon-button-filled py-2 px-6 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Send size={16} />
                Post
              </button>
            </div>
          </form>
        </div>

        {/* Post List */}
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs ring-1 ring-white/20">
                      {post.authorUsername?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{post.authorName}</p>
                      <p className="text-xs text-gray-500">@{post.authorUsername} • {post.createdAt?.toDate ? new Intl.DateTimeFormat('en-GB').format(post.createdAt.toDate()) : 'Recent'}</p>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-gray-200">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-neon-green transition-colors group">
                    <Heart size={18} className="group-hover:fill-neon-green" />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-neon-green transition-colors">
                    <MessageCircle size={18} />
                    <span>{post.commentsCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-xs text-gray-400 hover:text-neon-green transition-colors ml-auto">
                    <Share2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
