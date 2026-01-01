"use client";
import Link from 'next/link';
import { 
  Zap, BookOpen, Clock, Activity, ChevronRight, Play,
  LogOut, User, Settings, Bell
} from 'lucide-react';

// --- MOCK DATA (Will be replaced by Supabase data later) ---
const RECENT_ACTIVITY = [
  { course: "GST 101", type: "Rapid Drill", score: "85%", time: "2 hours ago" },
  { course: "MTH 101", type: "Full Mock Exam", score: "72%", time: "Yesterday" },
];

const MY_COURSES = [
  { code: "GST 101", title: "Use of English", progress: 65, color: "primary" },
  { code: "MTH 101", title: "General Mathematics I", progress: 30, color: "secondary" },
  { code: "BIO 101", title: "General Biology I", progress: 0, color: "accent" },
];

// --- COMPONENTS ---
const PulsarLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10v6"/><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M12 22V7"/><path d="m9 14 2.5 2.5 5-5"/>
  </svg>
);

// --- DASHBOARD PAGE ---
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-text font-sans pb-20">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <PulsarLogo className="w-6 h-6 text-primary" />
           <span className="font-bold text-lg tracking-tight">Terminal</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-subtext hover:text-white relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-sm border border-white/20">
            M
          </div>
        </div>
      </nav>

      {/* 2. WELCOME HEADER */}
      <header className="px-6 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Majeed.</h1>
        <p className="text-subtext flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500" /> Your frequency is stable. Ready for ascent.
        </p>
      </header>

      {/* 3. QUICK STATS */}
      <section className="px-6 mb-8 grid grid-cols-2 gap-4">
        <div className="p-5 bg-surface border border-white/10 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -z-10"></div>
          <Zap className="w-6 h-6 text-primary mb-3" />
          <h3 className="text-2xl font-bold text-white">85%</h3>
          <p className="text-xs text-subtext uppercase tracking-wider">Average Score</p>
        </div>
        <div className="p-5 bg-surface border border-white/10 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-bl-full -z-10"></div>
          <Clock className="w-6 h-6 text-secondary mb-3" />
          <h3 className="text-2xl font-bold text-white">12h</h3>
          <p className="text-xs text-subtext uppercase tracking-wider">Practice Time</p>
        </div>
      </section>

      {/* 4. MAIN ACTION BUTTON */}
      <section className="px-6 mb-8">
        <button className="w-full py-4 bg-gradient-to-r from-primary to-purple-700 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(160,108,213,0.3)] flex items-center justify-center gap-3 text-lg group relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          <Play className="w-6 h-6 fill-white relative z-10" />
          <span className="relative z-10">Start New Session</span>
        </button>
      </section>

      {/* 5. MY COURSES */}
      <section className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">My Courses</h2>
        </div>
        <div className="space-y-4">
          {MY_COURSES.map((course, i) => (
            <div key={i} className="p-5 bg-surface border border-white/10 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-${course.color}/10 flex items-center justify-center text-${course.color}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h3 className="font-bold text-white">{course.code}</h3>
                  <span className="text-xs text-subtext">{course.progress}%</span>
                </div>
                <p className="text-sm text-subtext mb-3">{course.title}</p>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                  <div className={`h-full bg-${course.color} rounded-full`} style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-subtext group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>
      </section>

      {/* 6. BOTTOM NAV BAR (Mobile) */}
      <div className="fixed bottom-0 w-full bg-background/90 backdrop-blur-xl border-t border-white/5 h-16 flex items-center justify-around px-6 z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-bold">Dash</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-subtext hover:text-white">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold">Courses</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-subtext hover:text-white">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
    }
            
