"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav'; // <--- IMPORTING THE REAL NAV
import { 
  Search, Filter, Play, BookOpen, Loader2 
} from 'lucide-react';

export default function CoursesPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      const { data, error } = await supabase.from('exams').select('*').eq('is_published', true);
      if (!error) setExams(data || []);
      setLoading(false);
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => {
    const matchesLevel = filter === 'All' || e.level === filter;
    const matchesSearch = e.course_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      <Header title="Course Catalog" />

      <div className="px-6 py-4 sticky top-16 bg-background/95 backdrop-blur-xl z-40 border-b border-white/5">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-subtext" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (e.g. CSC 101)" 
              className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-subtext/50" 
            />
          </div>
          <button className="p-2.5 bg-surface border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', '100L', '200L', '300L', '400L'].map(level => (
            <button 
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === level ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface border border-white/10 text-subtext hover:text-white'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <BookOpen className="w-8 h-8 text-subtext" />
            </div>
            <p className="text-white font-bold">No Exams Found</p>
            <p className="text-subtext text-xs mt-1">
              {searchQuery ? `No results for "${searchQuery}"` : `No ${filter} exams published yet.`}
            </p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div key={exam.id} className="p-5 bg-surface border border-white/10 rounded-2xl group hover:border-primary/50 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -z-10 group-hover:from-primary/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-white/5 rounded-md text-[10px] font-bold text-white border border-white/10 tracking-wide">{exam.course_code}</span>
                <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-full">{exam.level}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{exam.title}</h3>
              <div className="flex items-center gap-3 text-xs text-subtext mb-5">
                 <span className="flex items-center gap-1"><BookOpen className="w-3 h-3"/> {exam.questions_count} Qs</span>
                 <span className="w-1 h-1 rounded-full bg-white/20"></span>
                 <span>45 Mins</span>
              </div>
              <Link href={`/exam/${exam.id}`} className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95">
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
                                                       
