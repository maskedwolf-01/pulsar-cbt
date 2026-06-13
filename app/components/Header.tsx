"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, X, CheckCircle, Zap, LayoutDashboard, 
  BookOpen, FileArchive, Cpu 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Header({ title = "Dashboard" }: { title?: string }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Get Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);
        
        // 2. Get Notifications
        fetchNotifications(user.id);
      }
    };
    getData();
  }, []);

  const fetchNotifications = async (userId: string) => {
    // A. Fetch Personal Notifications
    const { data: personal } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // B. Fetch Global Broadcasts (Announcements)
    const { data: broadcasts } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // C. Merge Them
    const formattedBroadcasts = (broadcasts || []).map(b => ({
      id: `b-${b.id}`,
      title: b.title,
      message: b.message,
      created_at: b.created_at,
      is_read: false, 
      link: '#',
      type: 'broadcast' 
    }));

    const allNotifs = [...(personal || []), ...formattedBroadcasts];
    
    // Sort by Date (Newest First)
    allNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotifs(allNotifs);
    setUnreadCount(allNotifs.filter(n => !n.is_read).length);
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Optimistic Update
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      // DB Update (Only for personal notifs)
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    }
  };

  // Desktop Navigation Links
  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Courses", href: "/courses", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Resources", href: "/resources", icon: <FileArchive className="w-4 h-4" /> },
    { name: "AI Tutor", href: "/chat", icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-[100] bg-[#030305]/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-6 h-16 md:h-20 flex items-center justify-between transition-all duration-300">
        
        {/* Mobile Title OR Desktop Logo */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden md:flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-serif">PULSAR<span className="text-indigo-500">.</span></span>
          </Link>
          <div className="md:hidden font-bold text-lg text-white tracking-tight font-serif">{title}</div>
        </div>
        
        {/* Desktop Central Navigation */}
        <div className="hidden md:flex items-center gap-2 bg-[#0a0a0c] p-1.5 rounded-2xl border border-white/5 shadow-inner">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Profile & Notifications */}
        <div className="flex items-center gap-4 md:gap-5">
          <button onClick={() => setShowNotifs(true)} className="relative p-2 text-zinc-400 hover:text-white
