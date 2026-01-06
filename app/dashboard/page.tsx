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
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${session.user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notifs && notifs.length > 0) {
        setNotifications(notifs);
        const newestMessageTime = new Date(notifs[0].created_at).getTime();
        const lastReadTime = localStorage.getItem('pulsar_last_read_timestamp');
        if (!lastReadTime || newestMessageTime > parseInt(lastReadTime)) {
            setHasUnread(true);
        } else {
            setHasUnread(false);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const markAllRead = () => {
    setHasUnread(false);
    if (notifications.length > 0) {
        const newestTime = new Date(notifications[0].created_at).getTime();
        localStorage.setItem('pulsar_last_read_timestamp', (newestTime + 1000).toString());
    } else {
        localStorage.setItem('pulsar_last_read_timestamp', Date.now().toString());
    }
  };

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-purple-500"><Loader2 className="animate-spin"/></div>;

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar';
  const displayImage = profile?.avatar_url || user?.user_metadata?.avatar_url;
    return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-24 relative overflow-x-hidden">
      
      {/* NOTIFICATION PANEL */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-[#09090b] border-l border-zinc-800 transform transition-transform duration-300 z-50 flex flex-col ${showNotifPanel ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-[#09090b] z-10">
            <h3 className="font-bold text-white text-lg">Transmission Log</h3>
            <button onClick={() => setShowNotifPanel(false)} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"><X className="w-5 h-5 text-white"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-500"><Bell className="w-12 h-12 mb-3 opacity-20"/><p>No transmissions received.</p></div>
            ) : (
                notifications.map(n => (
                    <div key={n.id} className="bg-[#111113] border border-zinc-800/60 p-4 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
                        <div className="flex justify-between items-start mb-2 pl-3">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>{n.user_id ? 'Personal' : 'Broadcast'}</span>
                            <span className="text-[10px] text-zinc-600">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white pl-3 mb-1">{n.title}</h4>
                        <p className="text-xs text-zinc-400 pl-3 leading-relaxed">{n.message}</p>
                    </div>
                ))
            )}
        </div>
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
  
