"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header'; 
import BottomNav from '../components/BottomNav'; // <--- IMPORTING THE REAL NAV
import { 
  Activity, Clock, FileText, Search, Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(profileData || { full_name: user.user_metadata.full_name || "Scholar" });

      const { data: resultsData } = await supabase.from('results').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setResults(resultsData || []);
      
      setLoading(false);
    };

    getData();
  }, [router]);

  const calculateCGPA = () => {
    if (!results || results.length === 0) return "0.00";
    const total = results.reduce((acc, curr) => acc + curr.score, 0);
    const average = total / results.length;
    return (average / 20).toFixed(2); 
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><Loader2 className="w-8 h-8 animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      
      {/* 1. SMART HEADER */}
      <Header title="Terminal" />

      {/* 2. WELCOME & STATS */}
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-white mb-6">
          Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{profile?.full_name?.split(' ')[0]}</span>
        </h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-5 bg-surface border border-white/10 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full -z-10"></div>
            <div className="flex items-center gap-2 mb-2 text-subtext text-[10px] uppercase font-bold tracking-wider">
              <Activity className="w-3 h-3 text-green-500" /> CGPA Est.
            </div>
            <p className="text-3xl font-bold text-white">{calculateCGPA()}</p>
          </div>
          <div className="p-5 bg-surface border border-white/10 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
             <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -z-10"></div>
             <div className="flex items-center gap-2 mb-2 text-subtext text-[10px] uppercase font-bold tracking-wider">
               <Clock className="w-3 h-3 text-primary" /> Exams Taken
             </div>
             <p className="text-3xl font-bold text-white">{results.length}</p>
          </div>
        </div>
      </header>

      {/* 3. RECENT ACTIVITY */}
      <section className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
        </div>

        {results.length === 0 ? (
          <div className="py-12 px-6 border border-dashed border-white/10 rounded-3xl text-center bg-white/5">
            <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-subtext" />
            </div>
            <h3 className="text-white font-bold mb-2">No Records Found</h3>
            <p className="text-subtext text-xs mb-6 max-w-[200px] mx-auto">You haven't taken any CBT exams yet. Check the course catalog.</p>
            <Link href="/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(160,108,213,0.3)] hover:scale-105 transition-transform">
              <Search className="w-4 h-4" /> Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className="p-4 bg-surface border border-white/10 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${r.score >= 70 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {r.grade || 'F'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{r.course_code}</h3>
                    <p className="text-[10px] text-subtext">Completed on {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{r.score}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW BOTTOM NAV (5 ITEMS) */}
      <BottomNav active="home" />
    </div>
  );
             }
             
