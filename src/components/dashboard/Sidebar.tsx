"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  HeartHandshake, 
  UserCircle, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils"; // I'll create this utility

const menuItems = [
  { name: "Feed", href: "/dashboard", icon: LayoutDashboard },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Requests", href: "/requests", icon: HeartHandshake },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 z-40">
      <Link href="/" className="text-2xl font-display font-bold text-white mb-10 px-2">
        <span className="text-neon-green">C</span>H
      </Link>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-neon-green text-black font-bold shadow-neon" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className="text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
