"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
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
      setPosts(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });
    return () => unsubscribe();
  }, []);

  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

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

  const handleLike = async (postId: string, currentLikes: string[]) => {
    if (!user) return;
    const docRef = doc(db, "posts", postId);
    const isLiked = currentLikes?.includes(user.uid);
    
    try {
      await updateDoc(docRef, {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!commentText.trim() || !user) return;
    const docRef = doc(db, "posts", postId);
    
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: commentText,
        authorId: user.uid,
        authorName: userData?.displayName || user.displayName,
        authorUsername: userData?.username,
        createdAt: serverTimestamp(),
      });
      
      const post = posts.find(p => p.id === postId);
      await updateDoc(docRef, {
        commentsCount: (post?.commentsCount || 0) + 1
      });
      
      setCommentText("");
      setActiveCommentId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = (post: any) => {
    const shareText = `Check out this post on CampusHub: ${post.content}`;
    if (navigator.share) {
      navigator.share({
        title: "CampusHub Post",
        text: shareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText + " " + window.location.href);
      alert("Post link copied to clipboard!");
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
                  <button 
                    onClick={() => handleLike(post.id, post.likes || [])}
                    className={`flex items-center gap-2 text-xs transition-colors group ${
                      post.likes?.includes(user?.uid) ? "text-neon-green" : "text-gray-400 hover:text-neon-green"
                    }`}
                  >
                    <Heart size={18} className={post.likes?.includes(user?.uid) ? "fill-neon-green" : "group-hover:fill-neon-green"} />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button 
                    onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                    className={`flex items-center gap-2 text-xs transition-colors ${
                      activeCommentId === post.id ? "text-neon-green" : "text-gray-400 hover:text-neon-green"
                    }`}
                  >
                    <MessageCircle size={18} />
                    <span>{post.commentsCount || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-neon-green transition-colors ml-auto"
                  >
                    <Share2 size={18} />
                  </button>
                </div>

                <AnimatePresence>
                  {activeCommentId === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 space-y-4 overflow-hidden"
                    >
                      <div className="flex gap-3 pt-2">
                        <input
                          autoFocus
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-neon-green"
                          onKeyPress={(e) => e.key === "Enter" && handleSendComment(post.id)}
                        />
                        <button 
                          onClick={() => handleSendComment(post.id)}
                          disabled={!commentText.trim()}
                          className="text-neon-green p-2 disabled:opacity-50"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
