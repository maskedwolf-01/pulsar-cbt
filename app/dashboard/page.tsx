"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, BookOpen, TrendingUp, 
  Activity, Calendar, ChevronRight, User, Settings
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

// DIRECT CONNECTION
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  // Default stats to 0
  const [stats, setStats] = useState({ examsTaken: 0, averageScore: 0 });
  const [recentResults, setRecentResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get User Session & Metadata
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) { 
        router.push('/login'); 
        return; 
      }
      setUser(session.user);

      // 2. Get Results for this user
      const { data: results, error: resultsError } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!resultsError && results && results.length > 0) {
        setRecentResults(results);
        
        // Calculate Stats
        const totalScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0);
        setStats({
          examsTaken: results.length,
          averageScore: Math.round(totalScore / results.length)
        });
      }
      // If no results, stats remain at default 0

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-purple-500"><Loader2 className="animate-spin"/></div>;

  // Get user details safely
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar';
  const userAvatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans pb-24">
      
      {/* HEADER - Restored Profile Link & Image */}
      <div className="p-6 pt-12 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Hi, {userName}</h1>
          <p className="text-zinc-500 text-sm mt-1">Ready to continue learning?</p>
        </div>
        
        {/* Make this clickable to go to settings/profile */}
        <Link href="/settings" className="relative group">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-purple-500 transition-all bg-zinc-900 flex items-center justify-center">
                {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-6 h-6 text-zinc-500"/>
                )}
            </div>
            {/* Optional small settings icon indicator */}
            <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-1 border border-zinc-800">
                <Settings className="w-3 h-3 text-zinc-400"/>
            </div>
        </Link>
      </div>

      {/* STATS CARDS (Kept as requested) */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8 animate-fade-in-up">
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-3">
            <BookOpen className="w-4 h-4 text-blue-400"/> Exams Taken
          </div>
          <div className="text-3xl font-bold text-white">{stats.examsTaken}</div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-3">
            <TrendingUp className="w-4 h-4 text-green-400"/> Avg. Score
          </div>
          <div className="text-3xl font-bold text-white">{stats.averageScore}%</div>
        </div>
      </div>

      {/* RECENT ACTIVITY LIST */}
      <div className="px-6 animate-fade-in-up delay-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
          <Link href="/courses" className="text-xs text-purple-400 font-bold hover:underline">View Catalog</Link>
        </div>

        <div className="space-y-3">
          {recentResults.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-800/50 border-dashed rounded-2xl p-8 text-center">
              <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3 opacity-50"/>
              <p className="text-zinc-500 text-sm">No exams taken yet.</p>
              <Link href="/courses">
                <button className="mt-4 px-6 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                  Start Practicing
                </button>
              </Link>
            </div>
          ) : (
            recentResults.map((result) => (
              <div key={result.id} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Score Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
                    result.score >= 70 ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30' : 
                    result.score >= 50 ? 'bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/30' : 
                    'bg-red-500/10 text-red-400 ring-1 ring-red-500/30'
                  }`}>
                    {result.score}%
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{result.course_code}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3"/> {new Date(result.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      <span className="text-zinc-700">•</span>
                      <span>{result.total_questions} Qs</span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors"/>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
