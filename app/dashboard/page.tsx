"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, BookOpen, Activity, 
  Search, Bell, X, CheckCheck, FileText
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // LIVE DATA STATES (No Placeholders)
  const [stats, setStats] = useState({ examsTaken: 0, cgpa: 0.00 });
  const [recentResults, setRecentResults] = useState<any[]>([]);
  
  // NOTIFICATIONS
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) { router.push('/login'); return; }
      setUser(session.user);

      // 1. GET PROFILE
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData || session.user.user_metadata);

      // 2. GET LIVE EXAM RESULTS
      // This fetches REAL data from the 'results' table
      const { data: results, error: resultError } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (results && results.length > 0) {
        setRecentResults(results);
        // Calculate Stats Dynamically
        const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const avg = totalScore / results.length;
        setStats({
          examsTaken: results.length,
          cgpa: Number((avg / 20).toFixed(2)) 
        });
      }

      // 3. GET NOTIFICATIONS (Synced Logic)
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
    
    

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-purple-500"><Loader2 className="animate-spin"/></div>;

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar';
  const displayImage = profile?.avatar_url || user?.user_metadata?.avatar_url;
    return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-24 relative overflow-x-hidden">
      

        <div className="p-4 border-t border-zinc-800 bg-[#09090b]">
            <button onClick={markAllRead} className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"><CheckCheck className="w-4 h-4"/> Mark all as Read</button>
        </div>
      </div>
      {showNotifPanel && <div onClick={() => setShowNotifPanel(false)} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"></div>}

      {/* DASHBOARD HEADER */}
      <div className="p-6 pt-12 flex justify-between items-center">
        <div>
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Terminal</div>
          <h1 className="text-3xl font-bold text-white">Welcome, <span className="text-purple-500">{firstName}</span></h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={() => setShowNotifPanel(true)} className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                {hasUnread && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#09090b] animate-pulse"></span>}
            </button>
            <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 relative bg-zinc-900 group">
                {displayImage ? (<img src={displayImage} alt="Profile" className="w-full h-full object-cover"/>) : (<div className="w-full h-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold">{firstName[0]}</div>)}
            </Link>
        </div>
      </div>

      {/* STATS CARDS (LIVE DATA) */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <div className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-32">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider"><Activity className="w-3 h-3 text-green-500"/> CGPA EST.</div>
          <div className="text-4xl font-bold text-white mt-2">{stats.cgpa.toFixed(2)}</div>
        </div>
        <div className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-32">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider"><BookOpen className="w-3 h-3 text-purple-500"/> EXAMS TAKEN</div>
          <div className="text-4xl font-bold text-white mt-2">{stats.examsTaken}</div>
        </div>
      </div>

      {/* RECENT ACTIVITY (LIVE DATA) */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
        {recentResults.length === 0 ? (
            <div className="bg-[#111113] border border-zinc-800 rounded-3xl p-8 py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800"><FileText className="w-8 h-8 text-zinc-600"/></div>
              <h3 className="text-white font-bold text-lg mb-2">No Records Found</h3>
              <p className="text-zinc-500 text-sm max-w-[250px] mb-8 leading-relaxed">You haven't taken any CBT exams yet. Check the course catalog.</p>
              <Link href="/courses" className="w-full max-w-[220px]">
                <button className="w-full py-4 bg-[#8b5cf6] text-white text-sm font-bold rounded-xl hover:bg-[#7c3aed] transition-all flex items-center justify-center gap-2"><Search className="w-4 h-4"/> Browse Courses</button>
              </Link>
            </div>
        ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="bg-[#111113] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${result.score >= 70 ? 'bg-green-500/10 text-green-500' : result.score >= 50 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>{result.score}%</div>
                    <div><h3 className="font-bold text-white">{result.course_code}</h3><p className="text-xs text-zinc-500">{new Date(result.created_at).toLocaleDateString()}</p></div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
  
