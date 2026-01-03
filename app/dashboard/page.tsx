"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Clock, Activity, Play, Bell, FileText, Share2, TrendingUp, Search, User, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]); // To be populated from DB later
  const router = useRouter();

  // Fetch Live Data
  useEffect(() => {
    const getData = async () => {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. Fetch Profile (Name, Dept)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || { full_name: "Student" });

      // 3. Fetch Exam Results
      const { data: resultsData } = await supabase.from('results').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setResults(resultsData || []);
      
      setLoading(false);
    };

    getData();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><Loader2 className="w-8 h-8 animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="font-bold text-lg text-white">Terminal</div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-sm border border-white/20">
          {profile?.full_name?.charAt(0) || 'U'}
        </div>
      </nav>

      {/* STATS */}
      <header className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white mb-6">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-surface border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-subtext text-xs uppercase font-bold tracking-wider"><Activity className="w-4 h-4 text-green-500" /> CGPA Est.</div>
            <p className="text-2xl font-bold text-white">{results.length > 0 ? "4.5" : "0.0"}</p>
          </div>
          <div className="p-4 bg-surface border border-white/10 rounded-xl">
             <div className="flex items-center gap-2 mb-2 text-subtext text-xs uppercase font-bold tracking-wider"><Clock className="w-4 h-4 text-secondary" /> Exams Taken</div>
             <p className="text-2xl font-bold text-white">{results.length}</p>
          </div>
        </div>
      </header>

      {/* RESULTS (Dynamic State) */}
      <section className="px-6 py-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
        {results.length === 0 ? (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center">
            <p className="text-subtext text-sm mb-4">No exams taken yet. Start your journey!</p>
            <Link href="/exam/demo" className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-white text-sm font-bold border border-white/10">
              <Play className="w-4 h-4" /> Try Demo Exam
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className="p-4 bg-surface border border-white/10 rounded-xl flex justify-between items-center">
                <div><h3 className="font-bold text-white">{r.course_code}</h3><p className="text-xs text-subtext">Completed</p></div>
                <div className="text-primary font-bold">{r.score}%</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
      }
      
