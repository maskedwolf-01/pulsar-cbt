"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import { 
  XCircle, Brain, Loader2, RefreshCw, Sparkles, ArrowRight 
} from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [analysis, setAnalysis] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      // 1. GET RESULT
      const { data: resData } = await supabase
        .from('results')
        .select('*, exams(*)')
        .eq('id', params.id)
        .single();

      if (!resData) return;
      setResult(resData);

      // 2. SIMULATE A WRONG ANSWER (For Demo)
      // In a real app, you would fetch 'wrong_answers' table here.
      // We create a fake one so you can see the AI work immediately.
      const mockFailedQuestion = {
        id: 1,
        question: "What is the brain of the computer?",
        userAnswer: "Monitor",
        correctAnswer: "CPU"
      };

      // 3. ASK AI TO EXPLAIN
      explainQuestion(mockFailedQuestion);
      setLoading(false);
    };
    fetchResult();
  }, [params.id]);

  const explainQuestion = async (q: any) => {
    setAnalysis(prev => ({ ...prev, [q.id]: "Nexus is analyzing..." }));
    
    try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              type: 'explain', 
              context: { 
                  question: q.question, 
                  userAnswer: q.userAnswer, 
                  correctAnswer: q.correctAnswer 
              } 
          })
        });
        const data = await res.json();
        setAnalysis(prev => ({ ...prev, [q.id]: data.reply }));
    } catch (e) {
        setAnalysis(prev => ({ ...prev, [q.id]: "Could not analyze." }));
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500"/></div>;

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans pb-24">
      <Header title="Analysis" />

      <div className="p-6">
        {/* SCORE CIRCLE */}
        <div className="text-center mb-8 relative">
           <div className="w-32 h-32 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center border-4 border-purple-600 shadow-2xl mb-4 relative z-10">
             <div><span className="text-4xl font-bold">{result?.score}%</span></div>
           </div>
           <h2 className="text-xl font-bold">{result?.exams?.course_code || "Exam"}</h2>
        </div>

        {/* AI FEEDBACK CARD */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3"/> Missed Question</span>
          </div>
          <p className="text-white font-bold text-sm mb-4">What is the brain of the computer?</p>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                <span className="block text-[10px] text-red-400 font-bold mb-1">YOU SAID</span>
                <span>Monitor</span>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs">
                <span className="block text-[10px] text-green-400 font-bold mb-1">CORRECT</span>
                <span>CPU</span>
            </div>
          </div>

          {/* AI EXPLANATION */}
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-purple-500"/>
              <span className="text-[10px] font-bold text-purple-500 uppercase">Nexus Explanation</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {analysis[1] || "Analyzing..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button onClick={() => router.push('/dashboard')} className="py-4 bg-[#1a1a1a] text-white font-bold rounded-xl">Home</button>
          <button onClick={() => window.location.reload()} className="py-4 bg-white text-black font-bold rounded-xl">Retry</button>
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
            }
                
