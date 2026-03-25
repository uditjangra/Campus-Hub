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
import { Send, User, Search, Paperclip, MoreVertical, MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock contacts for demo
  const contacts = [
    { id: "1", name: "Alex Jordan", username: "alex_jordan", lastMsg: "See you at the library!", time: "10:30 AM" },
    { id: "2", name: "Sarah K", username: "sarah_k", lastMsg: "Thanks for the notes!", time: "Yest" },
    { id: "3", name: "Arjun V", username: "arjun_v", lastMsg: "The PPT looks great.", time: "Mon" },
  ];

  useEffect(() => {
    if (!selectedContact) return;

    // Real-time listener for a generic "global" or "demo" chat room
    // In a real app, this would be query based on conversationId
    const q = query(
      collection(db, "messages"), 
      orderBy("createdAt", "asc"),
      limit(50)
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
    if (!newMessage.trim() || !user) return;

    await addDoc(collection(db, "messages"), {
      text: newMessage,
      senderId: user.uid,
      senderUsername: userData?.username,
      createdAt: serverTimestamp(),
      receiverId: selectedContact.id,
    });
    setNewMessage("");
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-160px)] flex glass-card overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-display font-bold uppercase mb-4 tracking-tight">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                placeholder="Search..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs outline-none focus:border-neon-green"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-4 flex gap-4 items-center hover:bg-white/5 transition-colors text-left ${
                  selectedContact?.id === contact.id ? "bg-white/5 border-l-4 border-neon-green" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-green to-royal-blue p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-xs uppercase">
                    {contact.username[0]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-sm truncate">{contact.name}</p>
                    <span className="text-[10px] text-gray-500">{contact.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{contact.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-black/10">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] uppercase">
                    {selectedContact.username[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{selectedContact.name}</p>
                    <p className="text-[10px] text-neon-green">Active Now</p>
                  </div>
                </div>
                <button className="text-gray-500 hover:text-white"><MoreVertical size={20} /></button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                      msg.senderId === user?.uid 
                        ? "bg-neon-green text-black font-medium rounded-tr-none" 
                        : "bg-white/10 text-white rounded-tl-none border border-white/5"
                    }`}>
                       {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white/5 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full py-2 px-4 text-xs outline-none focus:border-neon-green"
                  />
                  <button 
                    disabled={!newMessage.trim()}
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
    </DashboardLayout>
  );
}
