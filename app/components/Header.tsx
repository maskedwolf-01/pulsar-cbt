"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Header({ title = "Terminal" }: { title?: string }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Fetch Profile for Avatar
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    };
    getProfile();
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="font-bold text-lg text-white tracking-tight">{title}</div>
        
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)} className="text-subtext hover:text-white relative p-1">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a0f] animate-pulse"></span>
            </button>

            {/* Notification Panel */}
            {showNotifs && (
              <>
                {/* Click outside to close */}
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowNotifs(false)}></div>
                
                <div className="absolute top-10 right-[-60px] w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                    <h3 className="font-bold text-white text-sm">Notifications</h3>
                    <button onClick={() => setShowNotifs(false)}><X className="w-4 h-4 text-subtext hover:text-white"/></button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {/* Active Notification Links */}
                    <Link href="/courses" onClick={() => setShowNotifs(false)} className="block p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> New Exam</span>
                        <span className="text-[10px] text-subtext">Now</span>
                      </div>
                      <p className="text-sm text-white">CSC 101 is live. Click to practice.</p>
                    </Link>
                    
                    <Link href="/profile" onClick={() => setShowNotifs(false)} className="block p-4 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-primary">System</span>
                        <span className="text-[10px] text-subtext">1h ago</span>
                      </div>
                      <p className="text-sm text-white">Profile incomplete. Update now.</p>
                    </Link>
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
    </>
  );
          }
            
