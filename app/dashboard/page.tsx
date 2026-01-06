"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, BookOpen, Activity, 
  ChevronRight, Search, Bell, TrendingUp
} from 'lucide-react';
import BottomNav from '../components/BottomNav'; // Ensure this path is correct

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

      // Fetch Results
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

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-purple-500"><Loader2 className="animate-spin"/></div>;

  // USER DATA
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar';
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-24 selection:bg-purple-500/30">
      
      {/* HEADER: Matches Your 'Terminal' Screenshot */}
      <div className="p-6 pt-12 flex justify-between items-center">
        <div>
          <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Terminal</div>
          <h1 className="text-3xl font-bold text-white">
            Welcome, <span className="text-purple-500">{firstName}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b]"></span>
            </button>

            {/* PROFILE PICTURE */}
            <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 relative bg-zinc-900">
                {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                ) : (
                    // Fallback Gradient if no image exists
                    <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-blue-600"></div>
                )}
            </Link>
        </div>
      </div>

      {/* STATS CARDS: Exact Structure from Screenshot */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        
        {/* Left Card: Green Accent (Originally CGPA, now Avg Score) */}
        <div className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-32">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="w-3 h-3 text-green-500"/> Avg. Score
          </div>
          <div className="text-4xl font-bold text-white mt-2">
            {stats.averageScore}<span className="text-xl text-zinc-600">.00</span>
          </div>
        </div>

        {/* Right Card: Purple Accent (Exams Taken) */}
        <div className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-wider relative z-10">
            <BookOpen className="w-3 h-3 text-purple-500"/> Exams Taken
          </div>
          <div className="text-4xl font-bold text-white mt-2 relative z-10">
            {stats.examsTaken}
          </div>
          {/* Subtle Book Icon in Background */}
          <BookOpen className="absolute -bottom-2 -right-2 w-16 h-16 text-purple-900/20 z-0"/>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>

        {/* Logic: Show List if data exists, Show "No Records" Card if empty */}
        {recentResults.length === 0 ? (
            // EMPTY STATE: Matches Screenshot
            <div className="bg-[#111113] border border-zinc-800 rounded-3xl p-8 py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800">
                  <Activity className="w-8 h-8 text-zinc-600"/>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">No Records Found</h3>
              <p className="text-zinc-500 text-sm max-w-[250px] mb-8 leading-relaxed">
                You haven't taken any CBT exams yet. Check the course catalog.
              </p>
              
              <Link href="/courses" className="w-full max-w-[220px]">
                <button className="w-full py-4 bg-[#8b5cf6] text-white text-sm font-bold rounded-xl hover:bg-[#7c3aed] transition-all flex items-center justify-center gap-2">
                  <Search className="w-4 h-4"/> Browse Courses
                </button>
              </Link>
            </div>
        ) : (
            // LIST VIEW (If user has taken exams)
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div key={result.id} className="bg-[#111113] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                      result.score >= 70 ? 'bg-green-500/10 text-green-500' : 
                      result.score >= 50 ? 'bg-yellow-500/10 text-yellow-500' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {result.score}%
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{result.course_code}</h3>
                      <p className="text-xs text-zinc-500">{new Date(result.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600"/>
                </div>
              ))}
            </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
                }
        
