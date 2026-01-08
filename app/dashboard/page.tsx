"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  BookOpen,
  Activity,
  Search,
  Bell,
  CheckCheck,
  FileText,
} from "lucide-react";
import BottomNav from "../components/BottomNav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const [stats, setStats] = useState({ examsTaken: 0, cgpa: 0 });
  const [recentResults, setRecentResults] = useState<any[]>([]);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

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

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData || session.user.user_metadata);

      // Results
      const { data: results } = await supabase
        .from("results")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (results && results.length > 0) {
        setRecentResults(results);

        const total = results.reduce(
          (sum, r) => sum + (r.score || 0),
          0
        );
        const avg = total / results.length;

        setStats({
          examsTaken: results.length,
          cgpa: Number((avg / 20).toFixed(2)),
        });
      }

      // Notifications
      const { data: personal } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id);

      const { data: broadcasts } = await supabase
        .from("broadcasts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      const merged = [
        ...(personal || []),
        ...(broadcasts || []).map((b) => ({
          ...b,
          is_read: false,
          type: "broadcast",
        })),
      ];

      setNotifications(merged);
      setHasUnread(merged.some((n) => !n.is_read));

      setLoading(false);
    };

    fetchDashboard();
  }, [router]);

  /* ---------------- ACTIONS ---------------- */
  const markAllRead = async () => {
    if (!user) return;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
    setHasUnread(false);

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id);
  };

  /* ---------------- LOADING STATE (FIXED) ---------------- */
  if (loading) {
    return (
      <div className="h-screen bg-[#09090b] flex items-center justify-center text-[#7cffd9]">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  const firstName =
    profile?.full_name?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    "Scholar";

  const avatar =
    profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24 relative">

      {/* HEADER */}
      <div className="p-6 pt-12 flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
            Terminal
          </p>
          <h1 className="text-3xl font-bold">
            {greeting},{" "}
            <span className="neon-text">{firstName}</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifPanel(true)}
            className="relative text-zinc-400 hover:text-white"
          >
            <Bell className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          <Link
            href="/profile"
            className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900"
          >
            {avatar ? (
              <img
                src={avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold">
                {firstName[0]}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 px-6 mb-8">
        <Stat label="CGPA EST." value={stats.cgpa.toFixed(2)} />
        <Stat label="EXAMS TAKEN" value={stats.examsTaken} />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="px-6">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>

        {recentResults.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {recentResults.map((r) => (
              <div
                key={r.id}
                className="bg-[#111113] border border-zinc-800 p-4 rounded-2xl flex justify-between"
              >
                <div>
                  <p className="font-bold">{r.course_code}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="font-bold">{r.score}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Stat({ label, value }: any) {
  return (
    <div className="bg-[#111113] border border-zinc-800 p-5 rounded-2xl">
      <div className="text-[10px] uppercase text-zinc-500 font-bold">
        {label}
      </div>
      <div className="text-4xl font-bold mt-2">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#111113] border border-zinc-800 rounded-3xl p-10 text-center">
      <FileText className="mx-auto mb-4 text-zinc-600" />
      <h3 className="font-bold">No Records Found</h3>
      <p className="text-sm text-zinc-500 mt-2 mb-6">
        You haven’t taken any CBT exams yet.
      </p>
      <Link href="/courses">
        <button className="px-6 py-3 bg-[#7cffd9] text-black rounded-xl font-bold">
          Browse Courses
        </button>
      </Link>
    </div>
  );
    }
