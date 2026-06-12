"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header({ title = "Terminal" }: { title?: string }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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

  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-[100] bg-[#030305]/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between transition-all duration-300">
        <div className="font-bold text-xl text-white tracking-tight font-serif">{title}</div>
        
        <div className="flex items-center gap-5">
          <button onClick={() => setShowNotifs(true)} className="relative p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#030305] animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
            )}
          </button>
          
          <Link href="/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 p-[2px] shadow-lg shadow-indigo-500/20 overflow-hidden hover:scale-105 transition-transform">
             <div className="w-full h-full rounded-full bg-[#121216] flex items-center justify-center overflow-hidden">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
               ) : (
                 <span className="text-white text-sm font-bold">{profile?.full_name?.charAt(0) || 'U'}</span>
               )}
             </div>
          </Link>
        </div>
      </nav>

      {/* PULSAR NOTIFICATION PANEL */}
      {showNotifs && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowNotifs(false)}></div>
          
          {/* Panel */}
          <div className="relative w-full max-w-md h-full bg-[#0a0a0c] border-l border-white/10 shadow-2xl animate-slide-in-right flex flex-col">
            
            {/* V2 Neon Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white tracking-tight font-serif">Transmission Log</h2>
              <button onClick={() => setShowNotifs(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {notifs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                  <Bell className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-sm font-medium">No transmissions received.</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => { if(n.link !== '#') router.push(n.link); }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      n.type === 'broadcast' 
                      ? 'bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/50' 
                      : !n.is_read 
                        ? 'bg-white/5 border-white/20 hover:bg-white/10' 
                        : 'bg-transparent border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${n.type === 'broadcast' ? 'text-indigo-400' : !n.is_read ? 'text-white' : 'text-zinc-500'}`}>
                        {n.type === 'broadcast' && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-[#030305]">
              <button 
                onClick={markAllRead} 
                disabled={unreadCount === 0} 
                className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <CheckCircle className="w-4 h-4"/> Mark all as Read
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
