"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Header from '../components/Header'; // Using the unified smart header
import { 
  Search, Filter, Play, TrendingUp, User, BookOpen, Loader2 
} from 'lucide-react';

// Reusable Bottom Nav (Mobile)
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
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Real Exams from Supabase
  useEffect(() => {
    const fetchExams = async () => {
      try {
        // Only fetch exams marked as 'is_published' by Admin
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .eq('is_published', true)
          .order('course_code', { ascending: true });
          
        if (error) throw error;
        setExams(data || []);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // 2. Filter Logic (Search + Level)
  const filteredExams = exams.filter(e => {
    const matchesLevel = filter === 'All' || e.level === filter;
    const matchesSearch = 
      e.course_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      
      {/* 1. Smart Header (Notifications & Profile) */}
      <Header title="Course Catalog" />

      {/* 2. Search & Filter Bar (Sticky) */}
      <div className="px-6 py-4 sticky top-16 bg-background/95 backdrop-blur-xl z-40 border-b border-white/5 transition-all">
        
        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-3 w-4 h-4 text-subtext group-focus-within:text-primary transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (e.g. CSC 101)" 
              className="w-full bg-surface border border-white/10 rounded-xl py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-subtext/50" 
            />
          </div>
          <button className="p-2.5 bg-surface border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors active:scale-95">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Level Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['All', '100L', '200L', '300L', '400L', '500L'].map(level => (
            <button 
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filter === level 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-surface border-white/10 text-subtext hover:border-white/30 hover:text-white'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Course List */}
      <div className="px-6 py-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-subtext">Syncing Catalog...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          // Empty State
          <div className="text-center py-20 opacity-50">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <BookOpen className="w-8 h-8 text-subtext" />
            </div>
            <p className="text-white font-bold">No Exams Found</p>
            <p className="text-subtext text-xs mt-1 max-w-[200px] mx-auto">
              {searchQuery 
                ? `No matches for "${searchQuery}"` 
                : `No ${filter} exams have been published yet.`}
            </p>
          </div>
        ) : (
          // Exam Cards
          filteredExams.map((exam) => (
            <div key={exam.id} className="p-5 bg-surface border border-white/10 rounded-2xl group hover:border-primary/50 transition-all relative overflow-hidden">
              
              {/* Decorative Background Blob */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -z-10 group-hover:from-primary/10 transition-colors"></div>

              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-white/5 rounded-md text-[10px] font-bold text-white border border-white/10 tracking-wide font-mono">
                  {exam.course_code}
                </span>
                <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                  {exam.level}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{exam.title}</h3>
              
              <div className="flex items-center gap-3 text-xs text-subtext mb-5">
                 <span className="flex items-center gap-1">
                   <BookOpen className="w-3 h-3 text-secondary"/> 
                   {exam.questions_count || 0} Qs
                 </span>
                 <span className="w-1 h-1 rounded-full bg-white/20"></span>
                 <span>40 Mins</span>
              </div>
              
              {/* Dynamic Link to Real Exam Engine */}
              <Link 
                href={`/exam/${exam.id}`} 
                className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
              >
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
    
