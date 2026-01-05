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
    // We tag broadcasts with a special 'type' so we can style them differently if needed
    const formattedBroadcasts = (broadcasts || []).map(b => ({
      id: `b-${b.id}`, // Unique ID for key
      title: b.title,
      message: b.message,
      created_at: b.created_at,
      is_read: false, // Broadcasts are always "new" until read logic is deeper
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
      <nav className="sticky top-0 z-[100] bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between transition-all duration-300">
        <div className="font-bold text-lg text-white tracking-tight">{title}</div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNotifs(true)} className="relative p-2 text-subtext hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0f] animate-pulse"></span>
            )}
          </button>
          
          <Link href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary p-[1px] shadow-lg overflow-hidden">
             <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
               ) : (
                 <span className="text-white text-xs font-bold">{profile?.full_name?.charAt(0) || 'U'}</span>
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
          <div className="relative w-full max-w-md h-full bg-[#050508] border-l border-white/10 shadow-2xl animate-slide-in-right flex flex-col">
            
            {/* Neon Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-secondary"></div>
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white tracking-tight">Transmission Log</h2>
              <button onClick={() => setShowNotifs(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white"><X className="w-5 h-5"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-subtext opacity-50">
                  <Bell className="w-12 h-12 mb-4" />
                  <p className="text-sm">No transmissions received.</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => { if(n.link !== '#') router.push(n.link); }}
                    className={`p-4 rounded-xl border transition-all ${
                      n.type === 'broadcast' 
                      ? 'bg-purple-500/10 border-purple-500/30' 
                      : !n.is_read ? 'bg-primary/5 border-primary/30' : 'bg-surface border-white/5 opacity-70'
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${n.type === 'broadcast' ? 'text-purple-400' : !n.is_read ? 'text-primary' : 'text-subtext'}`}>
                        {n.type === 'broadcast' && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-subtext">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <button onClick={markAllRead} disabled={unreadCount === 0} className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4"/> Mark all as Read
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
            }
    
