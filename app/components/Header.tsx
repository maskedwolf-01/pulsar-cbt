"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, CheckCircle, ChevronRight, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header({ title = "Terminal" }: { title?: string }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Fetch Data
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        // Notifications
        fetchNotifications(user.id);
      }
    };
    getData();
  }, []);

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setNotifs(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Optimistic UI Update (Instant feedback)
      setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      // DB Update
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    }
  };

  const deleteNotif = async (id: number, e: any) => {
    e.stopPropagation(); // Prevent triggering the link
    setNotifs(prev => prev.filter(n => n.id !== id)); // Instant UI remove
    await supabase.from('notifications').delete().eq('id', id);
  };

  return (
    <>
      {/* HEADER BAR */}
      <nav className="sticky top-0 z-[100] bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between transition-all duration-300">
        <div className="font-bold text-lg text-white tracking-tight animate-fade-in">{title}</div>
        
        <div className="flex items-center gap-4">
          {/* Bell Icon */}
          <button 
            onClick={() => setShowNotifs(true)} 
            className="relative p-2 rounded-full hover:bg-white/5 transition-colors active:scale-95"
          >
            <Bell className={`w-6 h-6 transition-colors ${unreadCount > 0 ? 'text-white' : 'text-subtext'}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0f] animate-pulse"></span>
            )}
          </button>

          {/* Profile Picture */}
          <Link href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary p-[1px] shadow-lg active:scale-95 transition-transform">
             <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
               {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </div>
               )}
             </div>
          </Link>
        </div>
      </nav>

      {/* FULL SCREEN NOTIFICATION OVERLAY */}
      {showNotifs && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          {/* Backdrop (Click to close) */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowNotifs(false)}
          ></div>

          {/* Slide-in Panel */}
          <div className="relative w-full max-w-md h-full bg-[#121216] border-l border-white/10 shadow-2xl animate-slide-in-right flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface/50">
              <div>
                <h2 className="text-xl font-bold text-white">Inbox</h2>
                <p className="text-xs text-subtext mt-1">You have {unreadCount} new messages</p>
              </div>
              <button onClick={() => setShowNotifs(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {notifs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-subtext opacity-50">
                  <Bell className="w-12 h-12 mb-4" />
                  <p>All caught up!</p>
                </div>
              ) : (
                notifs.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => { router.push(n.link || '#'); setShowNotifs(false); }}
                    className={`relative group p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${!n.is_read ? 'bg-white/[0.03] border-primary/30' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(160,108,213,0.5)]"></div>}
                        <span className={`text-sm font-bold ${!n.is_read ? 'text-white' : 'text-subtext'}`}>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-subtext/50">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm text-subtext leading-relaxed pr-8">{n.message}</p>
                    
                    {/* Delete Action */}
                    <button 
                      onClick={(e) => deleteNotif(n.id, e)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-subtext hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/5 bg-surface/50">
              <button 
                onClick={markAllRead} 
                disabled={unreadCount === 0}
                className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle className="w-4 h-4"/> Mark all as read
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
      }
                                                          
