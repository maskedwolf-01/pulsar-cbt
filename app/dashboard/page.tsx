"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Added ChevronRight for the clickable indicator
import { Loader2, BookOpen, Activity, FileText, ChevronRight } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Data States
  const [stats, setStats] = useState({ examsTaken: 0, cgpa: 0 });
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [greeting, setGreeting] = useState("Welcome");

  /* ---------------- DYNAMIC GREETING ---------------- */
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("Up late");
    else if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session?.user) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      // 1. Get Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData || session.user.user_metadata);

      // 2. Get Results
      const { data: results } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (results && results.length > 0) {
        setRecentResults(results);

        // Calculate Stats
        const total = results.reduce((sum, r) => sum + (r.score || 0), 0);
        const avg = total / results.length;

        setStats({
          examsTaken: results.length,
          cgpa: Number((avg / 20).toFixed(2)),
        });
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [router]);

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-[#7cffd9]">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Scholar";

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24 font-sans">
      
      {/* 1. REUSED HEADER (Kept your logic) */}
      <Header title={`${greeting}, ${firstName}`} />

      {/* 2. STATS CARDS (Kept your logic) */}
      <div className="grid grid-cols-2 gap-4 px-6 my-6">
        <div className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl">
          <div className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2">
            <Activity className="w-3 h-3 text-[#7cffd9]" /> CGPA EST.
          </div>
          <div className="text-4xl font-bold mt-2 text-white">{stats.cgpa.toFixed(2)}</div>
        </div>
        <div className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl">
          <div className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2">
            <BookOpen className="w-3 h-3 text-purple-500" /> EXAMS TAKEN
          </div>
          <div className="text-4xl font-bold mt-2 text-white">{stats.examsTaken}</div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY (UPDATED to be Clickable) */}
      <div className="px-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>

        {recentResults.length === 0 ? (
          <div className="bg-[#111113] border border-zinc-800 rounded-3xl p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
               <FileText className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="font-bold text-white">No Records Found</h3>
            <p className="text-xs text-zinc-500 mt-2 mb-6 max-w-[200px]">
              You haven’t taken any CBT exams yet. Results will appear here.
            </p>
            <Link href="/courses">
              <button className="px-6 py-3 bg-[#7cffd9] hover:bg-[#6beec9] text-black rounded-xl font-bold text-sm transition-colors">
                Browse Courses
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentResults.map((r) => {
              // COLOR LOGIC (Kept your exact color logic)
              let colorClasses = "bg-red-500 bg-opacity-10 text-red-500 border-red-500 border-opacity-20";
              if (r.score >= 70) {
                colorClasses = "bg-green-500 bg-opacity-10 text-green-500 border-green-500 border-opacity-20";
              } else if (r.score >= 50) {
                colorClasses = "bg-yellow-500 bg-opacity-10 text-yellow-500 border-yellow-500 border-opacity-20";
              }

              return (
                // WRAPPED IN LINK TO MAKE IT CLICKABLE
                <Link href={`/history/${r.id}`} key={r.id} className="block group">
                  <div className="bg-[#111113] border border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:border-zinc-600 transition-colors">
                    
                    <div className="flex items-center gap-4">
                        {/* Score Box (Left Side) */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm border ${colorClasses}`}>
                        {r.score}%
                        </div>
                        
                        {/* Details */}
                        <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-[#7cffd9] transition-colors">{r.course_code}</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">
                            {new Date(r.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                            })}
                        </p>
                        </div>
                    </div>

                    {/* Added Chevron for better UX */}
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors"/>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
  
