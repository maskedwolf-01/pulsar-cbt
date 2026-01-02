"use client";
import { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, Clock, Activity, ChevronRight, Play,
  Bell, FileText, Share2, TrendingUp, Search
} from 'lucide-react';

// --- MOCK DATA (This will be replaced by Supabase Data) ---
const EXAM_HISTORY = [
  { code: "CSC 101", score: 88, total: 100, grade: "A", date: "2 mins ago" },
  { code: "GST 101", score: 62, total: 100, grade: "B", date: "Yesterday" },
  { code: "MTH 101", score: 45, total: 100, grade: "D", date: "3 days ago" },
];

const AVAILABLE_COURSES = {
  "100L": [
    { code: "CSC 101", title: "Intro to Computer Science", qCount: 60 },
    { code: "GST 101", title: "Use of English", qCount: 100 },
    { code: "BIO 101", title: "General Biology I", qCount: 80 },
  ],
  "200L": [
    { code: "CSC 201", title: "Structured Programming", qCount: 50 },
    { code: "GNS 202", title: "Peace & Conflict", qCount: 40 },
  ]
};

const PulsarLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10v6"/><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M12 22V7"/><path d="m9 14 2.5 2.5 5-5"/>
  </svg>
);

export default function Dashboard() {
  const [selectedLevel, setSelectedLevel] = useState("100L");

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      
      {/* 1. TOP BAR */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <PulsarLogo className="w-6 h-6 text-primary" />
           <span className="font-bold text-lg tracking-tight">Terminal</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-subtext hover:text-white relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center font-bold text-sm border border-white/20">M</div>
        </div>
      </nav>

      {/* 2. STATS HEADER (Live Data Placeholder) */}
      <header className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-surface border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-subtext text-xs uppercase font-bold tracking-wider">
              <Activity className="w-4 h-4 text-green-500" /> CGPA Projection
            </div>
            <p className="text-2xl font-bold text-white">4.82</p>
          </div>
          <div className="p-4 bg-surface border border-white/10 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-subtext text-xs uppercase font-bold tracking-wider">
              <Clock className="w-4 h-4 text-secondary" /> Total Time
            </div>
            <p className="text-2xl font-bold text-white">12h 45m</p>
          </div>
        </div>
      </header>

      {/* 3. EXAM HISTORY (Results) */}
      <section className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Results</h2>
          <button className="text-xs text-primary font-bold">View All</button>
        </div>
        <div className="space-y-3">
          {EXAM_HISTORY.map((exam, i) => (
            <div key={i} className="p-4 bg-surface border border-white/10 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  exam.grade === 'A' ? 'bg-green-500/10 text-green-500' : 
                  exam.grade === 'B' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {exam.grade}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{exam.code}</h3>
                  <p className="text-xs text-subtext">{exam.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-white">{exam.score}%</p>
                  <p className="text-[10px] text-subtext">Score</p>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-full text-subtext hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. AVAILABLE EXAMS (Categorized) */}
      <section className="px-6 pb-8">
        <h2 className="text-lg font-bold text-white mb-4">Available Exams</h2>
        
        {/* Level Selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {["100L", "200L", "300L", "400L"].map((level) => (
            <button 
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedLevel === level 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface border border-white/10 text-subtext hover:text-white'
              }`}
            >
              {level} Level
            </button>
          ))}
        </div>

        {/* Course List */}
        <div className="space-y-3">
          {AVAILABLE_COURSES[selectedLevel as keyof typeof AVAILABLE_COURSES]?.map((course, i) => (
            <div key={i} className="p-5 bg-gradient-to-r from-surface to-surface/50 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-all">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors"></div>
               
               <div className="flex justify-between items-start mb-2">
                 <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-bold text-subtext border border-white/10">{course.code}</span>
                 <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                   <FileText className="w-3 h-3" /> {course.qCount} Qs
                 </span>
               </div>
               
               <h3 className="text-lg font-bold text-white mb-4">{course.title}</h3>
               
               <Link href="/exam/demo" className="w-full py-3 bg-white text-black font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                 <Play className="w-4 h-4 fill-black" /> Start Exam
               </Link>
            </div>
          )) || (
            <div className="text-center py-8 text-subtext text-sm">No exams uploaded for {selectedLevel} yet.</div>
          )}
        </div>
      </section>

      {/* 5. BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 w-full bg-[#0a0a0f]/90 backdrop-blur-lg border-t border-white/5 h-16 flex items-center justify-around px-6 z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-bold">Results</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-subtext hover:text-white">
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-bold">Browse</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-subtext hover:text-white">
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
         }
        
