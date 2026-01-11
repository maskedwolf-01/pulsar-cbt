"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Lightbulb, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading Review...</div>;

  // Handle old exams that don't have snapshots
  if (!data.exam_snapshot) {
      return (
          <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500"/>
              </div>
              <h1 className="text-xl font-bold mb-2">Review Not Available</h1>
              <p className="text-zinc-500 max-w-sm mb-6">This exam was taken before the "History Update" and cannot be reviewed question-by-question.</p>
              <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-zinc-800 rounded-xl font-bold text-sm">Back to Dashboard</button>
          </div>
      )
  }

  const questions = data.exam_snapshot.questions || [];
  const answers = data.exam_snapshot.answers || {};
  const currentQ = questions[currentIndex];

  if (!currentQ) return <div className="p-10 text-white">Error loading questions.</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-6 font-sans">
      <button onClick={() => router.push('/dashboard')} className="mb-6 flex items-center text-zinc-400 hover:text-white text-sm font-bold transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
      </button>
      
      <div className="max-w-3xl mx-auto bg-[#111113] border border-zinc-800 p-6 md:p-10 rounded-3xl shadow-2xl relative">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-zinc-800">
           <div>
             <h1 className="text-xl font-bold text-white mb-1">{data.course_code} Review</h1>
             <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Score: {data.score}%</div>
           </div>
           <div className="px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 font-mono text-sm">
             {currentIndex + 1} / {questions.length}
           </div>
        </div>

        <h2 className="text-lg md:text-xl font-medium mb-8 leading-relaxed">{currentQ.question_text}</h2>

        <div className="space-y-3 mb-8">
          {currentQ.display_options.map((opt: any, idx: number) => {
             const label = ['A', 'B', 'C', 'D'][idx];
             const isSelected = answers[currentQ.id] === label;
             // Use snapshot data for accuracy
             const isCorrect = label === currentQ.new_correct_option;
             
             let style = "bg-black/20 border-zinc-800 opacity-50"; 
             if (isCorrect) style = "bg-green-500/10 border-green-500 text-green-500 font-bold opacity-100"; // Always highlight correct
             else if (isSelected && !isCorrect) style = "bg-red-500/10 border-red-500 text-red-500 font-bold opacity-100"; // Highlight wrong user pick

             return (
               <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${style}`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-current text-sm font-bold shrink-0">{label}</div>
                  <span className="text-sm">{opt.text}</span>
                  {isCorrect && <CheckCircle className="ml-auto w-5 h-5 shrink-0"/>}
                  {isSelected && !isCorrect && <XCircle className="ml-auto w-5 h-5 shrink-0"/>}
               </div>
             )
          })}
        </div>

        {/* EXPLANATION BOX */}
        {currentQ.explanation ? (
           <div className="p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl mb-8">
              <div className="text-yellow-500 text-xs font-bold uppercase mb-2 flex items-center gap-2 tracking-widest">
                <Lightbulb className="w-4 h-4"/> Explanation
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{currentQ.explanation}</p>
           </div>
        ) : (
           <div className="mb-8 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
             <p className="text-xs text-zinc-500">No specific explanation available for this question yet.</p>
           </div>
        )}

        <div className="flex justify-between pt-4 border-t border-zinc-800">
           <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex===0} className="px-6 py-3 rounded-xl bg-zinc-800 disabled:opacity-30 font-bold text-sm hover:bg-zinc-700 transition-colors">Prev</button>
           <button onClick={() => setCurrentIndex(p => Math.min(questions.length-1, p+1))} disabled={currentIndex===questions.length-1} className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
                                                                           }
            
