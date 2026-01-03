"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { Search, Filter, Play, TrendingUp, User, BookOpen } from 'lucide-react';

// Bottom Nav (Repeated for consistency)
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

export default function CoursesPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchExams = async () => {
      // Fetch only published exams
      const { data } = await supabase.from('exams').select('*').eq('is_published', true);
      setExams(data || []);
      setLoading(false);
    };
    fetchExams();
  }, []);

  const filteredExams = filter === 'All' ? exams : exams.filter(e => e.level === filter);

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      
      {/* Header */}
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-background/95 backdrop-blur-xl z-40 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white mb-4">Course Catalog</h1>
        
        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-subtext" />
            <input placeholder="Search course code..." className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <button className="p-2.5 bg-surface border border-white/10 rounded-xl text-white hover:bg-white/10"><Filter className="w-5 h-5" /></button>
        </div>

        {/* Level Tags */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['All', '100L', '200L', '300L'].map(level => (
            <button 
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === level ? 'bg-primary text-white' : 'bg-surface border border-white/10 text-subtext'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <p className="text-center text-subtext text-sm mt-10">Loading catalog...</p>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-subtext/50" />
            </div>
            <p className="text-white font-bold">No Exams Found</p>
            <p className="text-subtext text-xs mt-1">Admin has not published any {filter} exams yet.</p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div key={exam.id} className="p-5 bg-surface border border-white/10 rounded-2xl group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-subtext border border-white/10">{exam.course_code}</span>
                <span className="text-[10px] text-primary font-bold">{exam.level}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{exam.title}</h3>
              <p className="text-xs text-subtext mb-4">{exam.questions_count} Questions • 45 Mins</p>
              
              <Link href="/exam/demo" className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200">
                <Play className="w-4 h-4 fill-black" /> Start Practice
              </Link>
            </div>
          ))
        )}
      </div>

      <BottomNav active="courses" />
    </div>
  );
                                                                         }
      
