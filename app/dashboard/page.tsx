"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, BookOpen, Clock, TrendingUp, 
  Activity, Calendar, ChevronRight, User 
} from 'lucide-react';
import BottomNav from '../components/BottomNav'; // Ensure you have this component or remove if not using

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
      // 1. Get User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // 2. Get Results
      const { data: results, error } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (results && results.length > 0) {
        setRecentResults(results);
        
        // Calculate Stats
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

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans pb-24">
      {/* HEADER */}
      <div className="p-6 pt-12 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'Scholar'}</h1>
          <p className="text-zinc-500 text-sm">Let's get back to work.</p>
        </div>
        <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/30">
          <User className="w-5 h-5 text-purple-400"/>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-2">
            <BookOpen className="w-4 h-4 text-blue-500"/> Exams Taken
          </div>
          <div className="text-3xl font-bold text-white">{stats.examsTaken}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase mb-2">
            <TrendingUp className="w-4 h-4 text-green-500"/> Avg. Score
          </div>
          <div className="text-3xl font-bold text-white">{stats.averageScore}%</div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
          <Link href="/courses" className="text-xs text-purple-400 font-bold hover:underline">View Catalog</Link>
        </div>

        <div className="space-y-3">
          {recentResults.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl p-8 text-center">
              <Activity className="w-10 h-10 text-zinc-600 mx-auto mb-3"/>
              <p className="text-zinc-500 text-sm">No exams taken yet.</p>
              <Link href="/courses">
                <button className="mt-4 px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors">
                  Start Practicing
                </button>
              </Link>
            </div>
          ) : (
            recentResults.map((result) => (
              <div key={result.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    result.score >= 70 ? 'bg-green-500/10 text-green-500' : 
                    result.score >= 50 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {result.score}%
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{result.course_code}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3"/> {new Date(result.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors"/>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
    }
            
