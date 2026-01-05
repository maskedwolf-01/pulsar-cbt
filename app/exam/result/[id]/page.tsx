"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import BottomNav from '../../../components/BottomNav';
import { CheckCircle, XCircle, Brain, Loader2, Share2, RefreshCw } from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [analysis, setAnalysis] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);

  // 1. Fetch Result & Questions
  useEffect(() => {
    const fetchResult = async () => {
      // Get the specific result entry
      const { data: resData } = await supabase
        .from('results')
        .select('*, exams(*)')
        .eq('id', params.id)
        .single();

      if (!resData) return;
      setResult(resData);

      // 2. TRIGGER AI ANALYSIS FOR FAILED QUESTIONS
      // In a real app, you would save the 'wrong_answers' array in the DB result.
      // For this demo, we will simulate the "Automatic Explanation" effect.
      
      // Let's pretend question 3 was failed for demonstration
      // (To make this real, we need to save detailed logs in the exam engine, 
      //  but here is how the AI connects):
      
      const mockFailedQuestion = {
        question: "The brain of the computer is the:",
        userAnswer: "Monitor",
        correctAnswer: "CPU"
      };

      generateExplanation(1, mockFailedQuestion);
      setLoading(false);
    };
    fetchResult();
  }, [params.id]);

  // The AI Function
  const generateExplanation = async (qId: number, context: any) => {
    setAnalysis(prev => ({ ...prev, [qId]: "Nexus is analyzing..." }));
    
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'explain', prompt: "", context })
    });
    
    const data = await res.json();
    setAnalysis(prev => ({ ...prev, [qId]: data.reply }));
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><Loader2 className="w-10 h-10 animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      <Header title="Performance Analysis" />

      <div className="p-6">
        {/* Score Card */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto bg-surface rounded-full flex items-center justify-center border-4 border-primary shadow-[0_0_30px_rgba(160,108,213,0.3)] mb-4">
            <div>
              <span className="text-4xl font-bold text-white">{result?.score}%</span>
              <p className="text-[10px] text-subtext uppercase tracking-widest">Accuracy</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">{result?.exams?.course_code}</h2>
          <p className="text-sm text-subtext">Exam Completed</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button className="flex-1 py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4"/> Share
          </button>
          <button onClick={() => router.push('/courses')} className="flex-1 py-3 bg-surface border border-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4"/> Retake
          </button>
        </div>

        {/* AI Analysis Section */}
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary"/> Nexus Analysis
        </h3>

        {/* Example Failed Question Card (Auto-Explained) */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3"/> Incorrect</span>
            <span className="text-[10px] text-subtext">Question 3</span>
          </div>
          <p className="text-white font-bold text-sm mb-3">The brain of the computer is the:</p>
          
          <div className="flex justify-between text-xs mb-4">
            <div className="text-red-400">You: Monitor</div>
            <div className="text-green-400">Correct: CPU</div>
          </div>

          {/* THE AI EXPLANATION */}
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-primary"/>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Nexus Explanation</span>
            </div>
            <p className="text-sm text-subtext leading-relaxed">
              {analysis[1] || <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Analyzing...</span>}
            </p>
          </div>
        </div>

      </div>

      <BottomNav active="home" />
    </div>
  );
}
