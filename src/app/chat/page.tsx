"use client";

import { useState, useEffect, useRef } from "react";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Search, Paperclip, MoreVertical, MessageSquare, Plus, Check, X, UserPlus, Info, Clock, Loader2 } from "lucide-react";
import { getDocs } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { doc, setDoc, updateDoc } from "firebase/firestore";

export default function ChatPage() {
  const { user, userData } = useAuth();
  const searchParams = useSearchParams();
  const convIdParam = searchParams.get("convId");
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchUsername, setSearchUsername] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    return () => unsubscribe();
  }, [user]);

  // Handle selected conversation from search params
  useEffect(() => {
    if (convIdParam && conversations.length > 0) {
      const convo = conversations.find(c => c.id === convIdParam);
      if (convo) setSelectedContact(convo);
    }
  }, [convIdParam, conversations]);

  // Fetch messages
  useEffect(() => {
    if (!selectedContact) return;

    const q = query(
      collection(db, "conversations", selectedContact.id, "messages"), 
      orderBy("createdAt", "asc"),
      limit(100)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    return () => unsubscribe();
  }, [selectedContact]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedContact) return;

    const msgText = newMessage;
    setNewMessage("");

    await addDoc(collection(db, "conversations", selectedContact.id, "messages"), {
      text: msgText,
      senderId: user.uid,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "conversations", selectedContact.id), {
      lastMessage: msgText,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const handleSearchUsers = async () => {
    if (!searchUsername.trim()) return;
    setIsSearching(true);
    try {
      const q = query(
         collection(db, "users"), 
         where("username", ">=", searchUsername.toLowerCase()), 
         where("username", "<=", searchUsername.toLowerCase() + "\uf8ff"),
         limit(5)
      );
      const snap = await getDocs(q);
      setSearchResults(snap.docs.map(doc => doc.data()).filter(u => u.uid !== user?.uid));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const startNewConversation = async (otherUser: any) => {
    if (!user) return;
    const convoId = [user.uid, otherUser.uid].sort().join("_");
    const convoRef = doc(db, "conversations", convoId);
    
    const convoData = {
      participants: [user.uid, otherUser.uid],
      participantNames: {
        [user.uid]: userData?.displayName || user.displayName,
        [otherUser.uid]: otherUser.displayName
      },
      participantUsernames: {
        [user.uid]: userData?.username,
        [otherUser.uid]: otherUser.username
      },
      status: "pending",
      initiatorId: user.uid,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    await setDoc(convoRef, convoData, { merge: true });
    setIsNewChatModalOpen(false);
    setSelectedContact({ id: convoId, ...convoData });
  };

  const handleAcceptRequest = async (convoId: string) => {
    await updateDoc(doc(db, "conversations", convoId), {
      status: "active",
      updatedAt: serverTimestamp()
    });
  };

  const handleRejectRequest = async (convoId: string) => {
    await updateDoc(doc(db, "conversations", convoId), {
      status: "rejected",
      updatedAt: serverTimestamp()
    });
    setSelectedContact(null);
  };



  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-160px)] flex glass-card overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold uppercase tracking-tight">Messages</h2>
              <button 
                onClick={() => setIsNewChatModalOpen(true)}
                className="p-2 bg-neon-green/10 text-neon-green rounded-full hover:bg-neon-green/20 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                placeholder="Search chats..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:border-neon-green"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(convo => {
              const otherId = convo.participants.find((id: string) => id !== user?.uid);
              const otherName = convo.participantNames?.[otherId] || "User";
              const otherUsername = convo.participantUsernames?.[otherId] || "user";
              
              return (
                <button
                  key={convo.id}
                  onClick={() => setSelectedContact(convo)}
                  className={`w-full p-4 flex gap-4 items-center hover:bg-white/5 transition-colors text-left relative ${
                    selectedContact?.id === convo.id ? "bg-white/5 border-l-4 border-neon-green" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-green to-royal-blue p-0.5 shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-xs uppercase">
                      {otherName[0]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm truncate">{otherName}</p>
                      <span className="text-[10px] text-gray-500">
                        {convo.updatedAt?.toDate ? new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(convo.updatedAt.toDate()) : ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-2">
                       {convo.status === 'pending' && <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />}
                       {convo.lastMessage || "New request"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black/10">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  {(() => {
                    const otherId = selectedContact.participants?.find((id: string) => id !== user?.uid);
                    const otherName = selectedContact.participantNames?.[otherId] || "User";
                    const otherUsername = selectedContact.participantUsernames?.[otherId] || "user";
                    return (
                      <>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] uppercase">
                          {otherName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{otherName}</p>
                          <p className="text-[10px] text-neon-green">@{otherUsername}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button className="text-gray-500 hover:text-white"><MoreVertical size={20} /></button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedContact.status === "pending" && selectedContact.initiatorId !== user?.uid ? (
                  <div className="glass-card p-8 text-center max-w-md mx-auto my-10 space-y-6 border-neon-green/20">
                     <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto">
                        <UserPlus size={32} className="text-neon-green" />
                     </div>
                     <div>
                        <h4 className="text-lg font-bold uppercase tracking-wide">Message Request</h4>
                        <p className="text-sm text-gray-500 mt-2">
                          @{selectedContact.participantUsernames?.[selectedContact.initiatorId]} wants to start a conversation with you.
                        </p>
                     </div>
                     <div className="flex gap-4 pt-4">
                        <button onClick={() => handleAcceptRequest(selectedContact.id)} className="flex-1 neon-button-filled flex items-center justify-center gap-2 py-3">
                           <Check size={18} /> Accept
                        </button>
                        <button onClick={() => handleRejectRequest(selectedContact.id)} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-red-500 font-bold hover:bg-red-500/10 transition-all">
                           <X size={18} /> Reject
                        </button>
                     </div>
                  </div>
                ) : selectedContact.status === "pending" && selectedContact.initiatorId === user?.uid ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 space-y-4">
                    <Clock size={40} className="text-gray-700" />
                    <p className="text-sm max-w-xs">Your request has been sent. You can chat once they accept it.</p>
                  </div>
                ) : selectedContact.status === "rejected" ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 space-y-4">
                    <X size={40} className="text-gray-700" />
                    <p className="text-sm max-w-xs">This request was declined.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                          msg.senderId === user?.uid 
                            ? "bg-neon-green text-black font-medium rounded-tr-none shadow-neon-sm" 
                            : "bg-white/10 text-white rounded-tl-none border border-white/5"
                        }`}>
                           {msg.text}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/5 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    disabled={selectedContact.status !== "active"}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedContact.status === 'active' ? "Type a message..." : "Waiting for acceptance..."}
                    className="flex-1 bg-white/5 border border-white/10 rounded-full py-2 px-4 text-xs outline-none focus:border-neon-green disabled:opacity-50"
                  />
                  <button 
                    disabled={!newMessage.trim() || selectedContact.status !== "active"}
                    className="p-2 bg-neon-green text-black rounded-full hover:shadow-neon transition-all disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <MessageSquare size={40} className="text-gray-700" />
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase">Your Inbox</h3>
              <p className="text-gray-500 text-sm max-w-xs">Select a contact to start chatting privately with your campus peers.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card max-w-md w-full p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold uppercase tracking-tight">Start Conversation</h3>
                <button onClick={() => setIsNewChatModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    autoFocus
                    placeholder="Enter username (e.g. udit)" 
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-neon-green transition-all"
                  />
                </div>
                <button 
                   onClick={handleSearchUsers}
                   disabled={!searchUsername.trim() || isSearching}
                   className="w-full neon-button py-2 text-xs font-bold disabled:opacity-50"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Search Users"}
                </button>

                <div className="space-y-2 mt-6">
                  {searchResults.map((u) => (
                    <button
                      key={u.uid}
                      onClick={() => startNewConversation(u)}
                      className="w-full p-3 flex items-center justify-between bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center text-[10px] font-bold">
                          {u.displayName[0]}
                        </div>
                        <div>
                           <p className="font-bold text-sm">{u.displayName}</p>
                           <p className="text-[10px] text-gray-500">@{u.username}</p>
                        </div>
                      </div>
                      <Plus size={16} className="text-neon-green opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                  {!isSearching && searchResults.length === 0 && searchUsername.trim() && (
                    <p className="text-center text-xs text-gray-600 py-4">No users found with that username.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
