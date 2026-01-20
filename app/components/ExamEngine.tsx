"use client";
import { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js"; // Using standard client to be safe with paths
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calculator, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle, X, Grid, Lock, LogOut, Loader2, AlertOctagon, Timer
} from 'lucide-react';

// Initialize Supabase (Safe for components folder)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- 1. CALCULATOR COMPONENT (Your exact code) ---
const SciCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState("");
  const [minimized, setMinimized] = useState(false);
  const btn = (val: string) => setDisplay(p => p + val);
  const clear = () => setDisplay("");
  const calc = () => { try { setDisplay(eval(display.replace(/\^/g, '**')).toString().substring(0, 12)); } catch { setDisplay("Error"); } };

  if (minimized) return <button onClick={() => setMinimized(false)} className="fixed bottom-24 right-4 bg-purple-600 text-white font-bold p-4 rounded-full shadow-2xl z-50 animate-bounce"><Calculator className="w-6 h-6" /></button>;

  return (
    <div className="fixed top-24 left-4 right-4 md:left-auto md:right-10 md:w-72 bg-[#1a1a1a] border border-white/20 rounded-3xl shadow-2xl z-50 animate-fade-in-up overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 flex justify-between items-center border-b border-white/10">
        <span className="text-xs font-bold text-purple-400 tracking-widest">PULSAR FX-991</span>
        <div className="flex gap-3"><button onClick={() => setMinimized(true)} className="text-white/70 hover:text-white font-bold text-lg leading-none">_</button><button onClick={onClose}><X className="w-5 h-5 text-white/70 hover:text-white" /></button></div>
      </div>
      <div className="p-4 bg-black/60 text-right text-2xl font-mono text-green-400 h-20 flex items-center justify-end border-b border-white/10 break-all">{display || "0"}</div>
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#252525]">
        {['sin','cos','tan','log','ln','√','^','('].map(b => (<button key={b} onClick={() => btn(b === '√' ? '√(' : b === '^' ? '**' : b + '(')} className="p-2 text-[10px] font-bold bg-white/5 text-gray-400 rounded hover:bg-white/10">{b}</button>))}
        {['7','8','9','/','4','5','6','*','1','2','3','-','.','0',')','+'].map(b => (<button key={b} onClick={() => b === '=' ? calc() : btn(b)} className={`p-3 text-sm font-bold rounded ${b === '=' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-white'}`}>{b}</button>))}
        <button onClick={clear} className="col-span-2 p-3 bg-red-500/20 text-red-500 font-bold rounded text-xs">AC</button>
        <button onClick={calc} className="col-span-2 p-3 bg-purple-600 text-white font-bold rounded shadow-[0_0_15px_rgba(160,108,213,0.4)]">=</button>
      </div>
    </div>
  );
};

// --- 2. START SCREEN (Your exact code) ---
const StartScreen = ({ examData, onStart }: { examData: any, onStart: () => void }) => (
  <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
    <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse"><Lock className="w-10 h-10 text-purple-500" /></div>
    <h1 className="text-3xl font-bold text-white mb-2">{examData.course_code}</h1>
    <p className="text-gray-400 mb-8">{examData.title}</p>
    <div className="w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-6 text-left space-y-4 mb-8">
      <h3 className="text-white font-bold border-b border-white/10 pb-2 mb-2">Exam Instructions</h3>
      <li className="text-sm text-gray-400">Duration: <span className="text-white">{examData.duration || 40} Minutes</span>.</li>
      <li className="text-sm text-gray-400 text-red-400">Do not refresh the browser.</li>
    </div>
    <div className="flex gap-4 w-full max-w-md">
       <Link href="/dashboard" className="flex-1 py-4 rounded-xl border border-white/10 text-gray-400 font-bold text-center hover:bg-white/5">Cancel</Link>
       <button onClick={onStart} className="flex-[2] py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">Start Exam</button>
    </div>
  </div>
);

// --- 3. THE ENGINE (Logic + Auto-Submit) ---
export default function ExamEngine({ examId }: { examId: string }) {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  
  // UI Toggles
  const [showCalc, setShowCalc] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Exam Info
      const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
      
      // Fetch Questions
      let { data: qs } = await supabase.from('questions').select('*').eq('exam_id', examId);
      
      // Fallback for Legacy IDs
      if (!qs || qs.length === 0) {
         const { data: qsByCode } = await supabase.from('questions').select('*').eq('course_code', examId); 
         if (qsByCode) qs = qsByCode;
      }

      if (exam) {
        setExamData(exam);
        setTimeLeft((exam.duration || 40) * 60);
      } else {
        setExamData({ title: "Pulsar CBT", course_code: examId, duration: 40 });
        setTimeLeft(40 * 60);
      }

      if (qs) setQuestions(qs);
      setLoading(false);
    };
    fetchData();
  }, [examId]);

  // TIMER & AUTO-SUBMIT (Added this feature for you)
  useEffect(() => {
    if (!started || finished) return;
    
    if (timeLeft <= 0) { 
      handleSubmit(); // <--- This triggers auto-submit when time hits 0
      return; 
    }

    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [started, finished, timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleAttemptSubmit = () => {
    if (Object.keys(answers).length < questions.length) setShowConfirmModal(true);
    else handleSubmit();
  };

  const handleSubmit = () => {
    setShowConfirmModal(false);
    let calcScore = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_option || answers[idx] === q.correct_answer) {
        calcScore++;
      }
    });
    setScore(calcScore);
    setFinished(true);
  };

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>;

  if (questions.length === 0) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center text-white">
      <AlertOctagon className="w-16 h-16 text-gray-500 mb-4" />
      <h1 className="text-2xl font-bold">No Questions Found</h1>
      <p className="text-gray-400 mb-6">Could not load questions for {examId}.</p>
      <Link href="/dashboard" className="px-6 py-3 bg-white/10 rounded-xl font-bold">Go Back</Link>
    </div>
  );

  if (!started) return <StartScreen examData={examData} onStart={() => setStarted(true)} />;

  if (finished) return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111113] border border-zinc-800 rounded-2xl p-8 text-center animate-fade-in-up">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Exam Submitted!</h2>
        <div className="bg-zinc-900 rounded-xl p-6 mb-8 border border-zinc-800">
          <div className="text-5xl font-bold text-white mb-2">{score} / {questions.length}</div>
          <div className="text-purple-400 font-bold">{Math.round((score/questions.length)*100)}% Accuracy</div>
        </div>
        <Link href="/dashboard" className="block w-full py-3 bg-zinc-800 rounded-xl font-bold">Return Home</Link>
      </div>
    </div>
  );

  const q = questions[currentQ];

  return (
    <div className="fixed inset-0 bg-[#09090b] text-white font-sans flex flex-col h-[100dvh] w-screen overflow-hidden">
      <header className="h-16 flex-none bg-[#111113]/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
           <button onClick={() => setShowQuitModal(true)} className="p-2 bg-red-500/10 rounded-lg text-red-500"><LogOut className="w-5 h-5" /></button>
           <span className="font-bold tracking-tight">{examData.course_code}</span>
        </div>
        <div className="flex gap-3">
          <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-black/30 border-white/10 text-white'}`}>
            <Timer className="w-4 h-4"/> {formatTime(timeLeft)}
          </div>
          <button onClick={handleAttemptSubmit} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg">Submit</button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="max-w-2xl mx-auto pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Question {currentQ + 1}</span>
            <span className="text-xs text-gray-500">{Object.keys(answers).length} / {questions.length} Answered</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-6">{q.question_text}</h2>
          <div className="space-y-3">
            {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt: string, idx: number) => {
              if (!opt) return null;
              return (
                <button key={idx} onClick={() => setAnswers(p => ({ ...p, [currentQ]: opt }))} className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${answers[currentQ] === opt ? 'bg-purple-500/10 border-purple-500 text-white' : 'bg-[#111113] border-white/10 text-gray-400 hover:bg-white/5'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${answers[currentQ] === opt ? 'bg-purple-600 border-purple-600 text-white' : 'border-white/20'}`}>{['A','B','C','D'][idx]}</div>
                  <span className="text-sm md:text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="h-auto flex-none bg-[#0a0a0f] border-t border-white/10 p-4 z-40 pb-safe">
        <div className="flex justify-between items-center max-w-2xl mx-auto gap-4">
          <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 text-white disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button>
          <div className="flex gap-3">
             <button onClick={() => setShowCalc(!showCalc)} className={`px-4 py-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 ${showCalc ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}><Calculator className="w-4 h-4" /> Calc</button>
             <button onClick={() => setShowGrid(!showGrid)} className={`px-4 py-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 ${showGrid ? 'bg-purple-600 text-white border-purple-600' : 'border-white/20 text-gray-400'}`}><Grid className="w-4 h-4" /> Map</button>
          </div>
          <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))} className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 text-white shadow-lg"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </footer>

      {showCalc && <SciCalculator onClose={() => setShowCalc(false)} />}
      
      {/* Grid Modal */}
      <div className={`fixed inset-x-0 bottom-0 bg-[#15151a] border-t border-white/20 rounded-t-3xl z-50 transition-transform duration-300 ${showGrid ? 'translate-y-0' : 'translate-y-full'} max-h-[60vh] flex flex-col`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-3xl"><span className="font-bold text-white text-sm">Question Map</span><button onClick={() => setShowGrid(false)}><X className="w-5 h-5 text-white"/></button></div>
        <div className="p-4 grid grid-cols-5 gap-3 overflow-y-auto pb-8">
          {questions.map((_, idx) => (
             <button key={idx} onClick={() => { setCurrentQ(idx); setShowGrid(false); }} className={`h-10 rounded-lg text-xs font-bold ${idx === currentQ ? 'ring-2 ring-white bg-transparent text-white' : answers[idx] ? 'bg-purple-600 text-white' : 'bg-[#111113] border border-white/10 text-gray-500'}`}>{idx + 1}</button>
          ))}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-700 w-full max-w-md rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4 text-amber-500"><AlertTriangle className="w-8 h-8" /><h3 className="text-xl font-bold text-white">Unfinished Exam</h3></div>
             <p className="text-gray-400 mb-8">You have answered {Object.keys(answers).length} of {questions.length}. Submit anyway?</p>
             <div className="flex gap-3"><button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold">Cancel</button><button onClick={handleSubmit} className="flex-1 py-3 bg-red-600 rounded-xl font-bold">Submit</button></div>
          </div>
        </div>
      )}
      
      {showQuitModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
           <div className="w-full max-w-xs bg-[#18181b] border border-white/10 p-6 rounded-2xl text-center">
             <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
             <h3 className="text-white font-bold mb-2">Quit Exam?</h3>
             <p className="text-gray-400 text-xs mb-6">Progress will be lost.</p>
             <div className="flex gap-3"><button onClick={() => setShowQuitModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-white">Cancel</button><button onClick={() => router.push('/dashboard')} className="flex-1 py-3 bg-red-500 rounded-xl font-bold">Quit</button></div>
           </div>
        </div>
      )}
    </div>
  );
  }
                                             
