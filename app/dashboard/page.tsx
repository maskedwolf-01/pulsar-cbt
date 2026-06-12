"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Target, Activity, BrainCircuit, ChevronRight, 
  Clock, Zap, CheckCircle2, AlertTriangle, BookOpen, Loader2, FileText
} from "lucide-react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SEMESTER_2_COURSES = [
  { code: "MTH 102", name: "Calculus & Geometry", icon: <CalculatorIcon />, color: "from-cyan-500 to-blue-500", shadow: "shadow-cyan-500/20" },
  { code: "PHY 102", name: "General Physics II", icon: <Zap className="w-5 h-5 text-amber-400"/>, color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" },
  { code: "COS 102", name: "Problem Solving", icon: <BrainCircuit className="w-5 h-5 text-indigo-400"/>, color: "from-indigo-500 to-blue-500", shadow: "shadow-indigo-500/20" },
  { code: "ENT 102", name: "Evaluation of Business", icon: <BookOpen className="w-5 h-5 text-rose-400"/>, color: "from-rose-500 to-pink-500", shadow: "shadow-rose-500/20" },
];

function CalculatorIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Welcome");
  const [analytics, setAnalytics] = useState({
    examsTaken: 0,
    accuracy: 0,
    cgpa: 0,
    strongest: "N/A",
    weakest: "N/A"
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("Up late");
    else if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData || session.user.user_metadata);

      const { data: results } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (results && results.length > 0) {
        setRecentResults(results);

        const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
        const avg = totalScore / results.length;
        
        let highest = results[0];
        let lowest = results[0];
        results.forEach(r => {
          if ((r.score || 0) > (highest.score || 0)) highest = r;
          if ((r.score || 0) < (lowest.score || 0)) lowest = r;
        });

        setAnalytics({
          examsTaken: results.length,
          accuracy: Number(avg.toFixed(1)),
          cgpa: Number((avg / 20).toFixed(2)),
          strongest: highest.course_code,
          weakest: lowest.course_code
        });
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Scholar";

  return (
    <div className="min-h-screen bg-[#030305] text-white overflow-x-hidden pb-24 font-sans selection:bg-indigo-500/30">
      
      {/* Friendly Header Title */}
      <Header title="Student Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 animate-fade-in">
        
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight font-serif">
            {greeting}, {firstName}.
          </h1>
          <p className="text-zinc-500 text-sm">Ready to practice for your second-semester exams?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          
          <div className="md:col-span-2 p-6 rounded-3xl bg-[#0a0a0c] border border-white/5 relative overflow-hidden shadow-xl group hover:border-indigo-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/20 transition-all"></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Average Score</h2>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-black text-white tracking-tighter">{analytics.accuracy}</span>
                  <span className="text-xl text-zinc-500 font-bold">%</span>
                </div>
                <p className="text-xs text-indigo-400 font-medium mt-2 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Estimated CGPA: {analytics.cgpa.toFixed(2)}
                </p>
              </div>
              
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
              <div className="p-4 rounded-2xl bg-[#121216] border border-white/5">
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-bold">Best Subject</div>
                <div className="font-bold text-emerald-400 text-lg">{analytics.strongest}</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#121216] border border-white/5">
                <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider font-bold">Needs Work</div>
                <div className="font-bold text-rose-400 text-lg">{analytics.weakest}</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-cyan-900/10 border border-indigo-500/20 flex flex-col justify-center relative overflow-hidden">
            <Activity className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">Practice Progress</h3>
            <div className="text-4xl font-black text-white mb-6">{analytics.examsTaken} <span className="text-sm font-normal text-indigo-200/70">Exams taken</span></div>
            <Link href="/courses" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl text-center transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              Take a Practice Exam
            </Link>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-serif">Quick Start</h2>
            <Link href="/courses" className="text-sm text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {SEMESTER_2_COURSES.map((course) => (
              <Link 
                key={course.code} 
                href={`/exam/${course.code.toLowerCase().replace(' ', '')}`}
                className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-300"
              >
                <div className="h-full bg-[#0a0a0c] rounded-[1.3rem] p-5 flex flex-col items-center text-center justify-center border border-white/5 group-hover:bg-[#121216] transition-colors">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.color} p-[1px] mb-4 shadow-lg ${course.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-[#0a0a0c] rounded-2xl flex items-center justify-center">
                      {course.icon}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm md:text-base mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all">{course.code}</h3>
                  <p className="text-[10px] md:text-xs text-zinc-500 font-medium line-clamp-1">{course.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4 font-serif">Recent Results</h2>
          
          {recentResults.length === 0 ? (
            <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-10 text-center flex flex-col items-center shadow-lg">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                 <FileText className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="font-bold text-white text-lg">No Practice History</h3>
              <p className="text-sm text-zinc-500 mt-2 mb-6 max-w-xs">
                You haven’t taken any practice exams yet. Your scores will appear right here.
              </p>
              <Link href="/courses">
                <button className="px-8 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-sm transition-colors shadow-lg">
                  Browse Courses
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.slice(0, 5).map((r) => {
                let statusColor = "text-indigo-400";
                let statusBg = "bg-indigo-500/10 border-indigo-500/20";
                let icon = <Zap className="w-5 h-5 text-indigo-400"/>;

                if (r.score >= 70) {
                  statusColor = "text-emerald-400";
                  statusBg = "bg-emerald-500/10 border-emerald-500/20";
                  icon = <CheckCircle2 className="w-5 h-5 text-emerald-400"/>;
                } else if (r.score >= 50) {
                  statusColor = "text-amber-400";
                  statusBg = "bg-amber-500/10 border-amber-500/20";
                  icon = <AlertTriangle className="w-5 h-5 text-amber-400"/>;
                } else if (r.score < 50) {
                  statusColor = "text-rose-400";
                  statusBg = "bg-rose-500/10 border-rose-500/20";
                  icon = <AlertTriangle className="w-5 h-5 text-rose-400"/>;
                }

                return (
                  <Link href={`/history/${r.id}`} key={r.id} className="block group">
                    <div className="p-4 md:p-5 rounded-2xl bg-[#0a0a0c] border border-white/5 hover:border-white/10 flex items-center justify-between transition-all shadow-sm hover:shadow-md">
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 ${statusBg}`}>
                          {icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm md:text-base group-hover:text-indigo-300 transition-colors">
                            {r.course_code}
                          </h4>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 font-mono">
                            <Clock className="w-3 h-3"/> 
                            {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex items-center gap-5">
                        <div className={`text-xl md:text-2xl font-black ${statusColor}`}>
                          {r.score}%
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors hidden sm:flex">
                          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                        </div>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </main>

      <BottomNav active="home" />
    </div>
  );
}
