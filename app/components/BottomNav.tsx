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
    <div className="fixed bottom-0 w-full bg-[#0a0a0f]/90 backdrop-blur-lg border-t border-white/5 h-16 flex items-center justify-around px-2 z-50">
      {navItems.map((item) => (
        <Link 
          key={item.id} 
          href={item.link} 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${active === item.id ? 'text-primary scale-110' : 'text-subtext hover:text-white'}`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
        </Link>
      ))}
    </div>
  );
     }
            
