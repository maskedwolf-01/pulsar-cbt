"use client";
import { useState, useEffect } from 'react';
import { 
  Clock, Calculator, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle, X, Grid, Lock, AlertOctagon 
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---
const EXAM_DATA = {
  courseCode: "CSC 101",
  title: "Introduction to Computer Science",
  duration: 20 * 60, // 20 minutes
  questions: [
    { id: 1, text: "The brain of the computer is the:", options: ["Monitor", "Keyboard", "CPU", "Mouse"] },
    { id: 2, text: "Which generation of computers used vacuum tubes?", options: ["First", "Second", "Third", "Fourth"] },
    { id: 3, text: "RAM stands for:", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Real Access Memory"] },
    { id: 4, text: "1 Byte is equal to:", options: ["4 Bits", "8 Bits", "16 Bits", "32 Bits"] },
    { id: 5, text: "Which of these is NOT an Input Device?", options: ["Scanner", "Microphone", "Speaker", "Joystick"] }
  ]
};

// --- COMPONENTS ---

// 1. Calculator Overlay
const SciCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState("");
  const btnClick = (val: string) => setDisplay(prev => prev + val);
  const clear = () => setDisplay("");
  const calculate = () => { try { setDisplay(eval(display).toString()); } catch { setDisplay("Error"); } };

  return (
    <div className="fixed bottom-24 right-4 md:right-10 w-64 bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl z-50 animate-fade-in-up">
      <div className="bg-primary/20 p-2 flex justify-between items-center border-b border-white/10 rounded-t-2xl">
        <span className="text-xs font-bold text-primary">CASIO FX-991</span>
        <button onClick={onClose}><X className="w-4 h-4 text-white" /></button>
      </div>
      <div className="p-4 bg-black/50 text-right text-xl font-mono text-green-400 h-16 border-b border-white/10">{display || "0"}</div>
      <div className="grid grid-cols-4 gap-1 p-2">
        {['7','8','9','/','4','5','6','*','1','2','3','-','.','0','=','+'].map((btn) => (
          <button key={btn} onClick={() => btn === '=' ? calculate() : btnClick(btn)} className={`p-3 text-sm font-bold rounded ${btn === '=' ? 'bg-primary text-white' : 'bg-surface text-white hover:bg-white/10'}`}>{btn}</button>
        ))}
        <button onClick={clear} className="col-span-4 p-2 bg-red-500/20 text-red-500 text-xs font-bold rounded mt-1">CLEAR</button>
      </div>
    </div>
  );
};

// 2. Start Screen Modal
const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-3xl text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Ready to Ascend?</h2>
      <p className="text-subtext text-sm mb-6">You are about to start <span className="text-white font-bold">{EXAM_DATA.courseCode}</span>.</p>
      
      <div className="bg-black/40 rounded-xl p-4 text-left text-xs text-subtext space-y-3 mb-8 border border-white/5">
        <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Ensure stable internet.</p>
        <p className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500"/> Do not refresh the page.</p>
        <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500"/> Timer auto-submits at 00:00.</p>
      </div>

      <button onClick={onStart} className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(160,108,213,0.4)]">
        Start Exam Now
      </button>
    </div>
  </div>
);

// --- MAIN PAGE ---
export default function ExamPage() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DATA.duration);
  const [showCalc, setShowCalc] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Prevent Refresh Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Modern browsers require this
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Timer
  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => setTimeLeft((p) => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [hasStarted]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const currentQ = EXAM_DATA.questions[currentQIndex];

  if (!hasStarted) return <StartScreen onStart={() => setHasStarted(true)} />;

  return (
    <div className="min-h-screen bg-background text-text font-sans flex flex-col h-[100dvh] overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 border-b border-white/10 bg-surface flex items-center justify-between px-4 z-20 shadow-lg">
        <div>
           <h1 className="font-bold text-white text-lg tracking-tight">{EXAM_DATA.courseCode}</h1>
           <p className="text-[10px] text-subtext uppercase tracking-wider hidden md:block">{EXAM_DATA.title}</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full font-mono font-bold text-lg border transition-all ${timeLeft < 300 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-black/30 border-white/10 text-white'}`}>
          <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* MAIN QUESTION AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative pb-32">
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="w-full bg-white/5 h-1 rounded-full mb-8 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${((currentQIndex + 1) / EXAM_DATA.questions.length) * 100}%` }}></div>
            </div>

            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-subtext mb-4 border border-white/10">
                Question {currentQIndex + 1} / {EXAM_DATA.questions.length}
              </span>
              <h2 className="text-2xl font-bold text-white leading-relaxed">{currentQ.text}</h2>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setAnswers(prev => ({ ...prev, [currentQIndex]: opt }))} 
                  className={`w-full p-5 rounded-2xl border text-left flex items-center gap-4 transition-all group ${answers[currentQIndex] === opt ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(160,108,213,0.2)]' : 'bg-surface border-white/10 text-subtext hover:bg-white/5'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${answers[currentQIndex] === opt ? 'bg-primary border-primary text-white' : 'border-white/20 text-white/50 group-hover:border-white/50'}`}>
                    {['A', 'B', 'C', 'D'][idx]}
                  </div>
                  <span className="text-base">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="absolute bottom-0 w-full bg-surface border-t border-white/10 p-4 flex items-center justify-between z-30 backdrop-blur-xl">
           <button onClick={() => setCurrentQIndex(p => Math.max(0, p - 1))} disabled={currentQIndex === 0} className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold disabled:opacity-30 hover:bg-white/5 flex items-center gap-2 text-sm">
             <ChevronLeft className="w-4 h-4"/> Prev
           </button>
           
           <div className="flex gap-4">
              <button onClick={() => setShowCalc(!showCalc)} className={`p-3 rounded-xl border border-white/10 transition-colors ${showCalc ? 'bg-white text-black' : 'text-white hover:bg-white/10'}`}>
                <Calculator className="w-5 h-5" />
              </button>
              {currentQIndex === EXAM_DATA.questions.length - 1 ? (
                 <button onClick={() => setShowSubmitModal(true)} className="px-8 py-3 rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] text-sm flex items-center gap-2">
                   Submit <CheckCircle className="w-4 h-4"/>
                 </button>
              ) : (
                <button onClick={() => setCurrentQIndex(p => Math.min(EXAM_DATA.questions.length - 1, p + 1))} className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 text-sm flex items-center gap-2">
                  Next <ChevronRight className="w-4 h-4"/>
                </button>
              )}
           </div>
        </div>
        
        {/* Floating Calculator */}
        {showCalc && <SciCalculator onClose={() => setShowCalc(false)} />}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-surface border border-white/10 p-6 rounded-3xl text-center">
              <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Submit Exam?</h3>
              <p className="text-subtext text-sm mb-6">You have answered {Object.keys(answers).length} of {EXAM_DATA.questions.length} questions. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl border border-white/10">Cancel</button>
                <button className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)]">Confirm Submit</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
      }
    
