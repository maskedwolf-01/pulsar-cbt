"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header'; // Ensure app/components/Header.tsx exists
import { 
  Activity, Clock, FileText, TrendingUp, Search, User, Loader2 
} from 'lucide-react';

// Mobile Bottom Navigation
const BottomNav = ({ active }: { active: string }) => (
  <div className="fixed bottom-0 w-full bg-[#0a0a0f]/90 backdrop-blur-lg border-t border-white/5 h-16 flex items-center justify-around px-6 z-50">
    <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${active === 'home' ? 'text-primary' : 'text-subtext hover:text-white'}`}>
      <TrendingUp className="w-5 h-5" />
      <span className="text-[10px] font-bold">Results</span>
    </Link>
    <Link href="/courses" className={`flex flex-col items-center gap-1 ${active === 'courses' ? 'text-primary' : 'text-subtext hover:text-white'}`}>
      <Search className="w-5 h-5" />
      <span className="text-[10px] font-bold">Browse</span>
    </Link>
    <Link href="/profile" className={`flex flex-col items-center gap-1 ${active === 'profile' ? 'text-primary' : 'text-subtext hover:text-white'}`}>
      <User className="w-5 h-5" />
      <span className="text-[10px] font-bold">Profile</span>
    </Link>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      // 1. Check Login Status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. Fetch Profile Data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Fallback to Auth Metadata if profile row doesn't exist yet
      setProfile(profileData || { full_name: user.user_metadata.full_name || "Scholar" });

      // 3. Fetch Exam History
      const { data: resultsData } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setResults(resultsData || []);
      setLoading(false);
    };

    getData();
  }, [router]);

  // Logic: Calculate CGPA from average scores (Mock conversion: 100% = 5.0)
  const calculateCGPA = () => {
    if (!results || results.length === 0) return "0.00";
    const total = results.reduce((acc, curr) => acc + curr.score, 0);
    const average = total / results.length;
    return (average / 20).toFixed(2); 
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><Loader2 className="w-8 h-8 animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      
      {/* 1. SMART HEADER (Notifications + Profile) */}
      <Header title="Terminal" />

      {/* 2. WELCOME SECTION */}
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

      {/* 3. RECENT ACTIVITY LIST */}
      <section className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Activity</h2>
        </div>

        {results.length === 0 ? (
          // Empty State
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
          // Result List
          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className="p-4 bg-surface border border-white/10 rounded-2xl flex justify-between items-center group hover:border-primary/50 transition-colors">
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

      <BottomNav active="home" />
    </div>
  );
        }
             
