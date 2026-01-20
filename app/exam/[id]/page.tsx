"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase'; 
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link'; // <--- THIS WAS MISSING
import { 
  Clock, Calculator, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle, X, Grid, Lock, LogOut, Loader2, AlertOctagon 
} from 'lucide-react';

// --- COMPONENTS ---

const SciCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState("");
  const [minimized, setMinimized] = useState(false);

  const btn = (val: string) => setDisplay(p => p + val);
  const clear = () => setDisplay("");
  const calc = () => { try { setDisplay(eval(display.replace(/\^/g, '**')).toString().substring(0, 12)); } catch { setDisplay("Error"); } };

  if (minimized) {
    return (
      <button 
        onClick={() => setMinimized(false)}
        className="fixed bottom-24 right-4 bg-primary text-black font-bold p-4 rounded-full shadow-2xl z-50 animate-bounce"
      >
        <Calculator className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed top-24 left-4 right-4 md:left-auto md:right-10 md:w-72 bg-[#1a1a1a] border border-white/20 rounded-3xl shadow-2xl z-50 animate-fade-in-up overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-3 flex justify-between items-center border-b border-white/10">
        <span className="text-xs font-bold text-primary tracking-widest">PULSAR FX-991</span>
        <div className="flex gap-3">
          <button onClick={() => setMinimized(true)} className="text-white/70 hover:text-white font-bold text-lg leading-none">_</button>
          <button onClick={onClose}><X className="w-5 h-5 text-white/70 hover:text-white" /></button>
        </div>
      </div>
      <div className="p-4 bg-black/60 text-right text-2xl font-mono text-green-400 h-20 flex items-center justify-end border-b border-white/10 break-all">
        {display || "0"}
      </div>
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#252525]">
        {['sin','cos','tan','log','ln','√','^','('].map(b => (
          <button key={b} onClick={() => btn(b === '√' ? '√(' : b === '^' ? '**' : b + '(')} className="p-2 text-[10px] font-bold bg-white/5 text-subtext rounded hover:bg-white/10">{b}</button>
        ))}
        {['7','8','9','/','4','5','6','*','1','2','3','-','.','0',')','+'].map(b => (
           <button key={b} onClick={() => b === '=' ? calc() : btn(b)} className={`p-3 text-sm font-bold rounded ${b === '=' ? 'bg-primary text-white' : 'bg-surface text-white'}`}>{b}</button>
        ))}
        <button onClick={clear} className="col-span-2 p-3 bg-red-500/20 text-red-500 font-bold rounded text-xs">AC</button>
        <button onClick={calc} className="col-span-2 p-3 bg-primary text-white font-bold rounded shadow-[0_0_15px_rgba(160,108,213,0.4)]">=</button>
      </div>
    </div>
  );
};

const StartScreen = ({ examData, onStart }: { examData: any, onStart: () => void }) => (
  <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center">
    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
      <Lock className="w-10 h-10 text-primary" />
    </div>
    <h1 className="text-3xl font-bold text-white mb-2">{examData.course_code}</h1>
    <p className="text-subtext mb-8">{examData.title}</p>
    
    <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 text-left space-y-4 mb-8">
      <h3 className="text-white font-bold border-b border-white/10 pb-2 mb-2">Exam Instructions</h3>
      <li className="text-sm text-subtext">Duration: <span className="text-white">40 Minutes</span>.</li>
      <li className="text-sm text-subtext">Total Questions: <span className="text-white">{examData.questions_count || 'N/A'}</span>.</li>
      <li className="text-sm text-subtext">Use the <span className="text-primary">Question Grid</span> to jump between questions.</li>
      <li className="text-sm text-subtext text-red-400">Do not refresh the browser or you will lose progress.</li>
    </div>

    <div className="flex gap-4 w-full max-w-md">
       <Link href="/courses" className="flex-1 py-4 rounded-xl border border-white/10 text-subtext font-bold text-center hover:bg-white/5">Cancel</Link>
       <button onClick={onStart} className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Start Exam</button>
    </div>
  </div>
);

// --- MAIN PAGE ---
export default function DynamicExamPage() {
  const params = useParams(); // Gets the ID from URL
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(40 * 60); // Default 40 mins
  const [showCalc, setShowCalc] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  // 1. FETCH REAL DATA
  useEffect(() => {
    const fetchExam = async () => {
      if (!params.id) return;

      // Get Exam Details
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*')
        .eq('id', params.id)
        .single();

      if (examError || !exam) {
        // Handle error gracefully or redirect
        router.push('/courses');
        return;
      }
      setExamData(exam);

      // Get Questions
      const { data: qs, error: qsError } = await supabase
        .from('questions') 
        .select('*')
        .eq('exam_id', params.id);

      if (qs && qs.length > 0) {
        setQuestions(qs);
      } else {
        setQuestions([]); // Empty state
      }
      
      setLoading(false);
    };
    fetchExam();
  }, [params.id, router]);

  // Timer Logic
  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => setTimeLeft((p) => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [hasStarted]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // LOADING STATE
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><Loader2 className="w-10 h-10 animate-spin"/></div>;

  // EMPTY STATE (Real Data Check)
  if (questions.length === 0) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 border border-white/10">
        <AlertOctagon className="w-10 h-10 text-subtext" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">{examData?.course_code}</h1>
      <p className="text-white font-bold text-lg mb-2">No Questions Uploaded Yet</p>
      <p className="text-subtext max-w-md mb-8">The administrator has created this exam shell but has not uploaded the question bank yet.</p>
      <Link href="/courses" className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20">Return to Catalog</Link>
    </div>
  );

  // START SCREEN
  if (!hasStarted) return <StartScreen examData={examData} onStart={() => setHasStarted(true)} />;

  // EXAM INTERFACE
  const currentQ = questions[currentQIndex];

  return (
    <div className="fixed inset-0 bg-background text-text font-sans flex flex-col h-[100dvh] w-screen overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 flex-none bg-surface/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
           <button onClick={() => setShowQuitModal(true)} className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500/20"><LogOut className="w-5 h-5" /></button>
           <span className="font-bold text-white tracking-tight">{examData.course_code}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold ${timeLeft < 300 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-black/30 border-white/10 text-white'}`}>
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* QUESTION AREA */}
      <main className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="max-w-2xl mx-auto pt-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Question {currentQIndex + 1}</span>
              <span className="text-xs text-subtext">{Object.keys(answers).length} / {questions.length} Answered</span>
            </div>
            {/* Displaying Real Question Text */}
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">{currentQ.question_text}</h2>
          </div>

          <div className="space-y-3">
            {/* Displaying Real Options */}
            {[currentQ.option_a, currentQ.option_b, currentQ.option_c, currentQ.option_d].map((opt, idx) => (
              <button 
                key={idx} 
                onClick={() => setAnswers(prev => ({ ...prev, [currentQIndex]: opt }))} 
                className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all active:scale-[0.98] ${answers[currentQIndex] === opt ? 'bg-primary/10 border-primary text-white' : 'bg-surface border-white/10 text-subtext hover:bg-white/5'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${answers[currentQIndex] === opt ? 'bg-primary border-primary text-white' : 'border-white/20'}`}>
                  {['A', 'B', 'C', 'D'][idx]}
                </div>
                <span className="text-sm md:text-base">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-auto flex-none bg-[#0a0a0f] border-t border-white/10 p-4 z-40 pb-safe">
        <div className="flex justify-between items-center max-w-2xl mx-auto gap-4">
          <button 
            onClick={() => setCurrentQIndex(p => Math.max(0, p - 1))} 
            disabled={currentQIndex === 0}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5"/>
          </button>

          <div className="flex gap-3">
             <button onClick={() => setShowCalc(!showCalc)} className={`px-4 py-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 ${showCalc ? 'bg-white text-black border-white' : 'border-white/20 text-subtext'}`}>
               <Calculator className="w-4 h-4" /> Calc
             </button>
             <button onClick={() => setShowGrid(!showGrid)} className={`px-4 py-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 ${showGrid ? 'bg-primary text-white border-primary' : 'border-white/20 text-subtext'}`}>
               <Grid className="w-4 h-4" /> Map
             </button>
          </div>

          <button 
            onClick={() => setCurrentQIndex(p => Math.min(questions.length - 1, p + 1))} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20"
          >
            <ChevronRight className="w-5 h-5"/>
          </button>
        </div>
      </footer>

      {/* OVERLAYS */}
      {showCalc && <SciCalculator onClose={() => setShowCalc(false)} />}

      <div className={`fixed inset-x-0 bottom-0 bg-[#15151a] border-t border-white/20 rounded-t-3xl z-50 transition-transform duration-300 ease-out transform ${showGrid ? 'translate-y-0' : 'translate-y-full'} max-h-[60vh] flex flex-col`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-3xl">
          <span className="font-bold text-white text-sm">Question Map</span>
          <button onClick={() => setShowGrid(false)}><X className="w-5 h-5 text-white"/></button>
        </div>
        <div className="p-4 grid grid-cols-5 gap-3 overflow-y-auto pb-8">
          {questions.map((q, idx) => (
             <button 
               key={idx} 
               onClick={() => { setCurrentQIndex(idx); setShowGrid(false); }}
               className={`h-10 rounded-lg text-xs font-bold ${
                 idx === currentQIndex ? 'ring-2 ring-white bg-transparent text-white' : 
                 answers[idx] ? 'bg-primary text-white' : 'bg-surface border border-white/10 text-subtext'
               }`}
             >
               {idx + 1}
             </button>
          ))}
        </div>
      </div>

      {showQuitModal && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="w-full max-w-xs bg-surface border border-white/10 p-6 rounded-2xl text-center">
             <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
             <h3 className="text-white font-bold mb-2">Quit Exam?</h3>
             <p className="text-subtext text-xs mb-6">Your progress will be lost.</p>
             <div className="flex gap-3">
               <button onClick={() => setShowQuitModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-white text-sm">Cancel</button>
               <button onClick={() => router.push('/courses')} className="flex-1 py-3 bg-red-500 rounded-xl text-white text-sm font-bold">Quit</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
      }
             
