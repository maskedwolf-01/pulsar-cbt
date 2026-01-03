"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Header({ title = "Terminal" }: { title?: string }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch Profile & Notifications
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Get Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profileData);

        // 2. Get Real Notifications
        const { data: notifData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (notifData) {
          setNotifs(notifData);
          setUnreadCount(notifData.filter(n => !n.is_read).length);
        }
      }
    };
    getData();
  }, []);

  // Mark as Read Logic
  const markRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      setUnreadCount(0);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
      <div className="font-bold text-lg text-white tracking-tight">{title}</div>
      
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markRead(); }} 
            className="text-subtext hover:text-white relative p-2"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0f] animate-pulse"></span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowNotifs(false)}></div>
              <div className="absolute top-12 right-0 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                  <h3 className="font-bold text-white text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifs(false)}><X className="w-4 h-4 text-subtext hover:text-white"/></button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="p-6 text-center text-subtext">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No new notifications</p>
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <Link 
                        key={n.id} 
                        href={n.link || '#'} 
                        className={`block p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-white/[0.02]' : ''}`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs font-bold flex items-center gap-1 ${!n.is_read ? 'text-primary' : 'text-subtext'}`}>
                            {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-subtext">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-white/80">{n.message}</p>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Circle */}
        <Link href="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-sm border border-white/20 text-white shadow-lg overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.charAt(0) || 'U'
            )}
        </Link>
      </div>
    </nav>
  );
          }
      
