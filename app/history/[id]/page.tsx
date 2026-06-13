"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Lightbulb, CheckCircle, XCircle, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HistoryReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: result, error } = await supabase
        .from('results')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !result) {
        alert("Could not load exam history.");
        router.push('/dashboard');
        return;
      }
      
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center text-white selection:bg-indigo-500/30 overflow-hidden">
        <div className="relative flex flex-col items-center animate-fade-in-up">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px]"></div>
          <div className="w-16 h-16 bg-[#0a0a0c] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl relative z-10">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold font-serif tracking-tight mb-2 relative z-10 text-white">Loading Review</h2>
        </div>
      </div>
    );
  }

  // Handle old exams that don't have snapshots
  if (!data.exam_snapshot) {
      return (
          <div className="min-h-screen bg-[#030305] text-white flex flex-col items-center justify-center p-6 text-center selection:bg-indigo-500/30">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-fade-in-up">
                  <AlertTriangle className="w-10 h-10 text-amber-500"/>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 font-serif tracking-tight animate-fade-in-up">Review Unavailable</h1>
              <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed animate-fade-in-up">This practice exam was taken before the V2.0 upgrade and cannot be reviewed question-by-question.</p>
              <button onClick={() => router.push('/dashboard')} className="px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-sm transition-all shadow-lg animate-fade-in-up">Return to Dashboard</button>
          </div>
      )
  }

  const questions = data.exam_snapshot.questions || [];
  const answers = data.exam_snapshot.answers || {};
  const currentQ = questions[currentIndex];

  if (!currentQ) return <div className="min-h-screen bg-[#030305] p-10 text-white flex items-center justify-center">Error loading questions.</div>;

  // V2 Score Color Logic
  let scoreColor = "text-indigo-400 border-indigo-500/20 bg-indigo-500/10";
  if (data.score >= 70) scoreColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
  else if (data.score >= 50) scoreColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
  else scoreColor = "text-rose-400 border-rose-500/20 bg-rose-500/10";

  return (
    <div className="min-h-screen bg-[#030305] text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="mb-6 flex items-center text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors w-max">
          <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
        </button>
        
        <div className="bg-[#0a0a0c] border border-white/5 p-6 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden animate-fade-in">
          
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-white/5 relative z-10">
             <div>
               <h1 className="text-2xl font-bold text-white mb-2 font-serif tracking-tight">{data.course_code} Review</h1>
               <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg border ${scoreColor}`}>
                 Final Score: {data.score}%
               </div>
             </div>
             <div className="px-4 py-2 bg-[#121216] rounded-xl border border-white/5 text-zinc-400 font-mono text-sm shadow-inner flex items-center gap-2">
               <span className="text-indigo-400 font-bold">Q{currentIndex + 1}</span> / {questions.length}
             </div>
          </div>

          {/* QUESTION */}
          <h2 className="text-lg md:text-xl font-medium mb-8 leading-relaxed text-white relative z-10">
            {currentQ.question_text}
          </h2>

          {/* OPTIONS */}
          <div className="space-y-3 mb-10 relative z-10">
            {currentQ.display_options.map((opt: any, idx: number) => {
               const label = ['A', 'B', 'C', 'D'][idx];
               const isSelected = answers[currentQ.id] === label;
               const isCorrect = label === currentQ.new_correct_option;
               
               let style = "bg-[#121216] border-white/5 opacity-60"; 
               let icon = null;

               if (isCorrect) {
                 style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                 icon = <CheckCircle className="ml-auto w-5 h-5 shrink-0"/>;
               } else if (isSelected && !isCorrect) {
                 style = "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold opacity-100 shadow-[0_0_15px_rgba(225,29,72,0.15)]";
                 icon = <XCircle className="ml-auto w-5 h-5 shrink-0"/>;
               }

               return (
                 <div key={idx} className={`p-4 md:p-5 rounded-2xl border flex items-center gap-4 transition-all ${style}`}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-current text-sm font-bold shrink-0 bg-black/20">
                      {label}
                    </div>
                    <span className="text-sm md:text-base leading-relaxed">{opt.text}</span>
                    {icon}
                 </div>
               )
            })}
          </div>

          {/* EXPLANATION ENGINE BOX */}
          {currentQ.explanation ? (
             <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl mb-8 relative z-10 shadow-inner">
                <div className="text-indigo-400 text-xs font-bold uppercase mb-3 flex items-center gap-2 tracking-widest">
                  <Lightbulb className="w-4 h-4"/> Step-by-Step Breakdown
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{currentQ.explanation}</p>
             </div>
          ) : (
             <div className="mb-8 p-6 bg-[#121216] rounded-3xl border border-white/5 text-center relative z-10">
               <Lightbulb className="w-6 h-6 text-zinc-600 mx-auto mb-2 opacity-50"/>
               <p className="text-sm text-zinc-500">No specific explanation available for this question.</p>
             </div>
          )}

          {/* NAVIGATION */}
          <div className="flex justify-between pt-6 border-t border-white/5 relative z-10">
             <button 
               onClick={() => setCurrentIndex(p => Math.max(0, p-1))} 
               disabled={currentIndex === 0} 
               className="px-6 py-3.5 rounded-xl bg-[#121216] border border-white/5 disabled:opacity-30 font-bold text-sm text-white hover:bg-white/5 transition-all flex items-center gap-2"
             >
               <ChevronLeft className="w-4 h-4"/> Previous
             </button>
             
             <button 
               onClick={() => setCurrentIndex(p => Math.min(questions.length-1, p+1))} 
               disabled={currentIndex === questions.length-1} 
               className="px-6 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg flex items-center gap-2"
             >
               Next <ChevronRight className="w-4 h-4"/>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
