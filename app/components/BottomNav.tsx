"use client";
import Link from 'next/link';
import { TrendingUp, Search, FileText, Cpu, User } from 'lucide-react';

export default function BottomNav({ active }: { active: string }) {
  const navItems = [
    { id: 'home', label: 'Results', icon: TrendingUp, link: '/dashboard' },
    { id: 'courses', label: 'Browse', icon: Search, link: '/courses' },
    { id: 'resources', label: 'PDFs', icon: FileText, link: '/resources' },
    { id: 'chat', label: 'Nexus', icon: Cpu, link: '/chat' },
    { id: 'profile', label: 'Profile', icon: User, link: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-[#030305]/90 backdrop-blur-xl border-t border-white/5 h-[72px] pb-safe flex items-center justify-around px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:hidden">
      {navItems.map((item) => {
        const isActive = active === item.id;
        return (
          <Link 
            key={item.id} 
            href={item.link} 
            className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 w-16 ${
              isActive 
                ? 'text-indigo-400 bg-indigo-500/10' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            {/* Active Indicator Dot */}
            {isActive && (
              <span className="absolute -top-1 w-8 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
            )}
            <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
