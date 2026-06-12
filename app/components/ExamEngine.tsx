"use client";
import { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calculator, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle, X, Grid, Lock, LogOut, 
  Loader2, AlertOctagon, Timer, Lightbulb, XCircle, ArrowRight
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- 1. CALCULATOR COMPONENT ---
const SciCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState("");
  const [minimized, setMinimized] = useState(false);
  const btn = (val: string) => setDisplay(p => p + val);
  const clear = () => setDisplay("");
  const calc = () => { try { setDisplay(eval(display.replace(/\^/g, '**')).toString().substring(0, 12)); } catch { setDisplay("Error"); } };

  if (minimized) return <button onClick={() => setMinimized(false)} className="fixed bottom-24 right-4 bg-indigo-600 text-white font-bold p-4 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] z-50 animate-bounce"><Calculator className="w-6 h-6" /></button>;

  return (
    <div className="fixed top-24 left-4 right-4 md:left-auto md:right-10 md:w-72 bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl z-50 animate-fade-in-up overflow-hidden backdrop-blur-xl">
      <div className="bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 p-3 flex justify-between items-center border-b border-white/5">
        <span className="text-xs font-bold text-indigo-400 tracking-widest">PULSAR FX-991</span>
        <div className="flex gap-3"><button onClick={() => setMinimized(true)} className="text-white/70 hover:text-white font-bold text-lg leading-none">_</button><button onClick={onClose}><X className="w-5 h-5 text-white/70 hover:text-white" /></button></div>
      </div>
      <div className="p-4 bg-black/60 text-right text-2xl font-mono text-emerald-400 h-20 flex items-center justify-end border-b border-white/5 break-all">{display || "0"}</div>
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#121216]">
        {['sin','cos','tan','log','ln','√','^','('].map(b => (<button key={b} onClick={() => btn(b === '√' ? '√(' : b === '^' ? '**' : b + '(')} className="p-2 text-[10px] font-bold bg-white/5 text-gray-400 rounded hover:bg-white/10">{b}</button>))}
        {['7','8','9','/','4','5','6','*','1','2','3','-','.','0',')','+'].map(b => (<button key={b} onClick={() => b === '=' ? calc() : btn(b)} className={`p-3 text-sm font-bold rounded ${b === '=' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white'}`}>{b}</button>))}
        <button onClick={clear} className="col-span-2 p-3 bg-rose-500/10 text-rose-500 font-bold rounded text-xs hover:bg-rose-500/20 transition-colors">AC</button>
        <button onClick={calc} className="col-span-2 p-3 bg-indigo-600 text-white font-bold rounded shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:bg-indigo-500 transition-colors">=</button>
      </div>
    </div>
  );
};

// --- 2. START SCREEN ---
const StartScreen = ({ examData, onStart }: { examData: any, onStart: () => void }) => (
  <div className="fixed inset-0 z-50 bg-[#030305] flex flex-col items-center justify-center p-6 text-center">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.15)]"><Lock className="w-10 h-10 text-indigo-400" /></div>
    <h1 className="text-4xl font-bold text-white mb-2 font-serif tracking-tight">{examData.course_code}</h1>
    <p className="text-zinc-400 mb-8 max-w-sm">{examData.title}</p>
    <div className="w-full max-w-md bg-[#0a0a0c] border border-white/5 rounded-2xl p-6 text-left space-y-4 mb-8 relative z-10 shadow-xl">
      <h3 className="text-white font-bold border-b border-white/5 pb-3 mb-3 flex items-center gap-2"><Timer className="w-4 h-4 text-indigo-400"/> Exam Parameters</h3>
      <li className="text-sm text-zinc-400">Time Limit: <span className="text-white font-bold">{examData.duration || 40} Minutes</span>.</li>
      <li className="text-sm text-zinc-400">Total Questions: <span className="text-white font-bold">Loaded Dynamically</span>.</li>
      <li className="text-sm text-rose-400">Warning: Navigating away will auto-submit.</li>
    </div>
    <div className="flex gap-4 w-full max-w-md relative z-10">
       <Link href="/dashboard" className="flex-1 py-4 rounded-xl border border-white/5 text-zinc-400 font-bold text-center hover:bg-white/5 hover:text-white transition-colors">Cancel</Link>
       <button onClick={onStart} className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">Initialize Engine <ArrowRight className="w-4 h-4"/></button>
    </div>
  </div>
);

// --- 3. THE ENGINE ---
export default function ExamEngine({ examId }: { examId: string }) {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState(false); // NEW: V2 Review Mode
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
      const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
      let { data: qs } = await supabase.from('questions').select('*').eq('exam_id', examId);
      
      if (!qs || qs.length === 0) {
         const { data: qsByCode } = await supabase.from('questions').select('*').eq('course_code', examId); 
         if (qsByCode) qs = qsByCode;
      }

      if (exam) {
        setExamData(exam);
        setTimeLeft((exam.duration || 40) * 60);
      } else {
        setExamData({ title: "Pulsar Engine", course_code: examId, duration: 40 });
        setTimeLeft(40 * 60);
      }

      if (qs) setQuestions(qs);
      setLoading(false);
    };
    fetchData();
  }, [examId]);

  // TIMER
  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
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
      if (answers[idx] === q.correct_option || answers[idx] === q.correct_answer) calcScore++;
    });
    setScore(calcScore);
    setFinished(true);
  };

  const startReviewMode = () => {
    setReviewMode(true);
    setCurrentQ(0);
  };

  if (loading) return <div className="min-h-screen bg-[#030305] flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;

  if (questions.length === 0) return (
    <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center p-6 text-center text-white">
      <AlertOctagon className="w-16 h-16 text-zinc-600 mb-4" />
      <h1 className="text-2xl font-bold">Database Empty</h1>
      <p className="text-zinc-500 mb-6">No questions found for parameter: {examId}.</p>
      <Link href="/dashboard" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Abort</Link>
    </div>
  );

  if (!started) return <StartScreen examData={examData} onStart={() => setStarted(true)} />;

  // POST-EXAM RESULTS SCREEN
  if (finished && !reviewMode) return (
    <div className="min-h-screen bg-[#030305] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0a0a0c] border border-white/5 rounded-3xl p-8 text-center animate-fade-in-up shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"></div>
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2 font-serif">Assessment Complete</h2>
        <p className="text-zinc-400 text-sm mb-6">Your responses have been processed.</p>
        
        <div className="bg-[#121216] border border-white/5 rounded-2xl p-6 mb-8">
          <div className="text-6xl font-black text-white mb-2">{score} <span className="text-2xl text-zinc-600">/ {questions.length}</span></div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm">
            Accuracy: {Math.round((score/questions.length)*100)}%
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
           <button onClick={startReviewMode} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
             <Lightbulb className="w-5 h-5"/> Review Mistakes
           </button>
           <Link href="/dashboard" className="block w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors">Return to Dashboard</Link>
        </div>
      </div>
    </div>
  );

  const q = questions[currentQ];
  const isCorrectAnswer = (opt: string) => opt === q.correct_option || opt === q.correct_answer;

  return (
    <div className="fixed inset-0 bg-[#030305] text-white font-sans flex flex-col h-[100dvh] w-screen overflow-hidden">
      {/* HEADER */}
      <header className="h-16 flex-none bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
           {!reviewMode && <button onClick={() => setShowQuitModal(true)} className="p-2 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500/20"><LogOut className="w-4 h-4" /></button>}
           <span className="font-bold tracking-tight text-zinc-300">{examData.course_code}</span>
           {reviewMode && <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded ml-2">Review Mode</span>}
        </div>
        <div className="flex gap-3">
          {!reviewMode ? (
            <>
              <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold text-sm flex items-center gap-2 ${timeLeft < 300 ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 animate-pulse' : 'bg-white/5 border-white/10 text-zinc-300'}`}>
                <Timer className="w-4 h-4"/> {formatTime(timeLeft)}
              </div>
              <button onClick={handleAttemptSubmit} className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors">Submit</button>
            </>
          ) : (
             <button onClick={() => setReviewMode(false)} className="px-5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-colors">Exit Review</button>
          )}
        </div>
      </header>

      {/* MAIN QUESTION AREA */}
      <main className="flex-1 overflow-y-auto p-4 pb-40 custom-scrollbar">
        <div className="max-w-3xl mx-auto pt-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Question {currentQ + 1} of {questions.length}</span>
            {!reviewMode && <span className="text-xs text-zinc-500 font-medium">{Object.keys(answers).length} Answered</span>}
          </div>
          
          <h2 className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8">{q.question_text}</h2>
          
          <div className="space-y-3">
            {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt: string, idx: number) => {
              if (!opt) return null;
              
              const isSelected = answers[currentQ] === opt;
              const isCorrect = isCorrectAnswer(opt);
              
              // STYLING LOGIC
              let btnClass = "bg-[#0a0a0c] border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10";
              let badgeClass = "border-white/10 text-zinc-500";
              let icon = null;

              if (reviewMode) {
                if (isSelected && isCorrect) {
                  btnClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-300";
                  badgeClass = "bg-emerald-500 border-emerald-500 text-white";
                  icon = <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />;
                } else if (isSelected && !isCorrect) {
                  btnClass = "bg-rose-500/10 border-rose-500/50 text-rose-300";
                  badgeClass = "bg-rose-500 border-rose-500 text-white";
                  icon = <XCircle className="w-5 h-5 text-rose-400 ml-auto" />;
                } else if (!isSelected && isCorrect) {
                  btnClass = "bg-emerald-500/5 border-emerald-500/30 text-emerald-400/80";
                  badgeClass = "border-emerald-500/50 text-emerald-500";
                  icon = <CheckCircle className="w-5 h-5 text-emerald-500/50 ml-auto" />;
                } else {
                  btnClass = "bg-[#0a0a0c] border-white/5 text-zinc-600 opacity-50";
                }
              } else if (isSelected) {
                btnClass = "bg-indigo-600/10 border-indigo-500 text-white";
                badgeClass = "bg-indigo-600 border-indigo-600 text-white";
              }

              return (
                <button 
                  key={idx} 
                  disabled={reviewMode}
                  onClick={() => setAnswers(p => ({ ...p, [currentQ]: opt }))} 
                  className={`w-full p-4 md:p-5 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${btnClass}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 ${badgeClass}`}>
                    {['A','B','C','D'][idx]}
                  </div>
                  <span className="text-sm md:text-base leading-relaxed">{opt}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* V2 EXPLANATION ENGINE */}
          {reviewMode && (
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-cyan-900/10 border border-indigo-500/20 animate-fade-in-up">
               <div className="flex items-center gap-2 mb-3">
                 <Lightbulb className="w-5 h-5 text-amber-400" />
                 <h4 className="font-bold text-white">Engine Explanation</h4>
               </div>
               <p className="text-zinc-300 text-sm leading-relaxed">
                 {q.explanation || "No step-by-step explanation is currently mapped in the database for this question."}
               </p>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER CONTROLS */}
      <footer className="h-auto flex-none bg-[#050508] border-t border-white/5 p-4 z-40 pb-safe">
        <div className="flex justify-between items-center max-w-3xl mx-auto gap-4">
          <button onClick={() => setCurrentQ(p => Math.max(0, p - 1))} disabled={currentQ === 0} className="w-12 h-12 flex items-center justify-center rounded-xl border border-white/10 text-white hover:bg-white/5 disabled:opacity-30 transition-colors"><ChevronLeft className="w-5 h-5"/></button>
          
          <div className="flex gap-3">
             <button onClick={() => setShowCalc(!showCalc)} className={`px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${showCalc ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}><Calculator className="w-4 h-4" /> <span className="hidden sm:inline">Calc</span></button>
             <button onClick={() => setShowGrid(!showGrid)} className={`px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${showGrid ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'border-white/10 text-zinc-400 hover:bg-white/5'}`}><Grid className="w-4 h-4" /> <span className="hidden sm:inline">Map</span></button>
          </div>

          <button onClick={() => setCurrentQ(p => Math.min(questions.length - 1, p + 1))} disabled={currentQ === questions.length - 1} className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 transition-colors"><ChevronRight className="w-5 h-5"/></button>
        </div>
      </footer>

      {showCalc && <SciCalculator onClose={() => setShowCalc(false)} />}
      
      {/* GRID MODAL */}
      <div className={`fixed inset-x-0 bottom-0 bg-[#0a0a0c] border-t border-white/10 rounded-t-[2rem] z-50 transition-transform duration-300 ${showGrid ? 'translate-y-0 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]' : 'translate-y-full'} max-h-[60vh] flex flex-col`}>
        <div className="p-5 border-b border-white/5 flex justify-between items-center"><span className="font-bold text-white text-sm">Question Map</span><button onClick={() => setShowGrid(false)} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-zinc-400"/></button></div>
        <div className="p-6 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 overflow-y-auto pb-8 custom-scrollbar">
          {questions.map((q, idx) => {
            let gridClass = "bg-[#121216] border border-white/5 text-zinc-500 hover:border-white/20";
            if (reviewMode) {
               const isCorrect = isCorrectAnswer(answers[idx]);
               if (answers[idx] && isCorrect) gridClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
               else if (answers[idx] && !isCorrect) gridClass = "bg-rose-500/20 border-rose-500/50 text-rose-400";
               else gridClass = "bg-zinc-800/50 border-zinc-700 text-zinc-500";
            } else if (answers[idx]) {
               gridClass = "bg-indigo-600 text-white border-indigo-500 shadow-md";
            }
            if (idx === currentQ) gridClass += " ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0c]";
            
            return (
              <button key={idx} onClick={() => { setCurrentQ(idx); setShowGrid(false); }} className={`h-11 rounded-xl text-xs font-bold transition-all ${gridClass}`}>{idx + 1}</button>
            );
          })}
        </div>
      </div>

      {/* WARNING MODALS */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-in-up">
             <div className="flex items-center gap-4 mb-6 text-amber-400">
                <div className="p-3 bg-amber-400/10 rounded-2xl"><AlertTriangle className="w-8 h-8" /></div>
                <h3 className="text-2xl font-bold text-white font-serif">Unfinished Exam</h3>
             </div>
             <p className="text-zinc-400 mb-8 leading-relaxed">You have only answered <strong className="text-white">{Object.keys(answers).length}</strong> out of <strong className="text-white">{questions.length}</strong> questions. Are you sure you want to submit?</p>
             <div className="flex gap-3"><button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-colors">Cancel</button><button onClick={handleSubmit} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white transition-colors">Force Submit</button></div>
          </div>
        </div>
      )}
      
      {showQuitModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-sm bg-[#0a0a0c] border border-white/10 p-8 rounded-3xl text-center shadow-2xl animate-fade-in-up">
             <div className="w-16 h-16 bg-rose-500/10 flex items-center justify-center rounded-full mx-auto mb-6"><LogOut className="w-8 h-8 text-rose-500" /></div>
             <h3 className="text-2xl text-white font-bold mb-2 font-serif">Abort Mission?</h3>
             <p className="text-zinc-400 text-sm mb-8">All current progress and answers will be permanently lost.</p>
             <div className="flex gap-3"><button onClick={() => setShowQuitModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors font-bold">Resume</button><button onClick={() => router.push('/dashboard')} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl font-bold text-white transition-colors">Quit Exam</button></div>
           </div>
        </div>
      )}
    </div>
  );
}
