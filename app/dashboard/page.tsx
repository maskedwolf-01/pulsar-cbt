"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, BookOpen, TrendingUp, 
  Activity, Calendar, ChevronRight, User, Search
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
  const [stats, setStats] = useState({ examsTaken: 0, averageScore: 0 });
  const [recentResults, setRecentResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) { router.push('/login'); return; }
      setUser(session.user);

      const { data: results } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (results && results.length > 0) {
        setRecentResults(results);
        const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
        setStats({
          examsTaken: results.length,
          averageScore: Math.round(totalScore / results.length)
        });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-purple-500"><Loader2 className="animate-spin"/></div>;

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 font-sans pb-24">
      
      {/* HEADER: Matches your 'Terminal' Screenshot */}
      <div className="p-6 pt-12 flex justify-between items-center">
        <div>
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Terminal</div>
          <h1 className="text-3xl font-bold text-white">
            Welcome, <span className="text-purple-500">{userName}</span>
          </h1>
        </div>
        
        {/* PROFILE PICTURE - Links to /profile */}
        <Link href="/profile" className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:border-purple-500 transition-all">
                {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    // This placeholder matches the 'glitch' vibe better than a plain icon
                    <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-black flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-400"/>
                    </div>
                )}
            </div>
            {/* Notification Dot */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#050505] rounded-full"></div>
        </Link>
      </div>

      {/* STATS CARDS: Darker 'Pulsar' Theme */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <div className="bg-[#111113] border border-zinc-800/60 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-4">
            <TrendingUp className="w-3 h-3 text-green-500"/> Avg. Score
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">{stats.averageScore}<span className="text-lg text-zinc-600">%</span></div>
        </div>
        <div className="bg-[#111113] border border-zinc-800/60 p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-4">
            <BookOpen className="w-3 h-3 text-purple-500"/> Exams Taken
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">{stats.examsTaken}</div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>

        <div className="space-y-3">
          {recentResults.length === 0 ? (
            // EMPTY STATE: Matches your original large dark card
            <div className="bg-[#111113] border border-zinc-800/60 rounded-3xl p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
              <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-4 border border-zinc-800">
                  <Activity className="w-6 h-6 text-zinc-600"/>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">No Records Found</h3>
              <p className="text-zinc-500 text-xs max-w-[200px] mb-6">You haven't taken any CBT exams yet. Check the course catalog.</p>
              
              {/* PURPLE BUTTON RESTORED */}
              <Link href="/courses">
                <button className="px-8 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-500 transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20">
                  <Search className="w-4 h-4"/> Browse Courses
                </button>
              </Link>
            </div>
          ) : (
            // RESULT LIST ITEM
            recentResults.map((result) => (
              <div key={result.id} className="bg-[#111113] border border-zinc-800/60 p-4 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border border-white/5 ${
                    result.score >= 70 ? 'bg-green-900/20 text-green-400' : 
                    result.score >= 50 ? 'bg-yellow-900/20 text-yellow-400' : 
                    'bg-red-900/20 text-red-400'
                  }`}>
                    {result.score}%
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{result.course_code}</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1 flex items-center gap-2">
                      <span>{new Date(result.created_at).toLocaleDateString()}</span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      <span>{result.total_questions} Qs</span>
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-zinc-800 transition-all">
                    <ChevronRight className="w-4 h-4"/>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
      }
      
