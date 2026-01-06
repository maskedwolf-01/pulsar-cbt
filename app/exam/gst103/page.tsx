"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Search, BookOpen, Clock, ArrowRight, Loader2, Home } from 'lucide-react';

// DIRECT CONNECTION
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CoursesPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      // Fetch exams and ensure we don't crash if table is empty
      const { data, error } = await supabase.from('exams').select('*').eq('is_published', true);
      if (data) setExams(data);
      if (error) console.error(error);
      setLoading(false);
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => 
    e.course_code.toLowerCase().includes(search.toLowerCase()) || 
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans pb-24">
      {/* HEADER */}
      <div className="p-6 pt-12">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Course Catalog</h1>
            <Link href="/dashboard" className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                <Home className="w-5 h-5 text-zinc-400"/>
            </Link>
        </div>
        <p className="text-zinc-500 text-sm">Select an exam to begin practicing.</p>
        
        {/* SEARCH BAR */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500"/>
          <input 
            type="text" 
            placeholder="Search (e.g. GST 103)" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* EXAM LIST */}
      <div className="px-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500"/></div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20"/>
            <p>No exams found.</p>
            <p className="text-xs mt-2 text-zinc-600">Administrator has not published any exams yet.</p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div key={exam.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-4 shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg text-xs font-bold border border-purple-500/20">
                    {exam.course_code}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3"/> {exam.duration_minutes}m
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{exam.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{exam.description}</p>
              </div>

              {/* DYNAMIC LINK GENERATOR */}
              <Link href={`/exam/${exam.course_code.toLowerCase().replace(/\s+/g, '')}`} className="w-full">
                <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                  Start Exam <ArrowRight className="w-4 h-4"/>
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
              }
        
