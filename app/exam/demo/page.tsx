"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  Clock, Calculator, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle, X, Grid, Lock, AlertOctagon,
  LogOut, Hash, Menu
} from 'lucide-react';

// --- DATA ---
const EXAM_DATA = {
  courseCode: "CSC 101",
  title: "Introduction to Computer Science",
  duration: 40 * 60, 
  questions: Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    text: i === 0 ? "The brain of the computer is the:" : `Sample Question ${i + 1} for testing navigation logic.`,
    options: ["Monitor", "Keyboard", "CPU", "Mouse"]
  }))
};

// --- COMPONENTS ---

// 1. Scientific Calculator (PULSAR FX-991)
const SciCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState("");
  const btn = (val: string) => setDisplay(p => p + val);
  const clear = () => setDisplay("");
  const calc = () => {
    try {
      // Basic sanitizer to allow math functions
      let expr = display
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/√/g, 'Math.sqrt')
        .replace(/\^/g, '**');
      setDisplay(eval(expr).toString().substring(0, 12));
    } catch { setDisplay("Syntax Error"); }
  };

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-10 md:w-72 bg-[#1a1a1a] border border-white/20 rounded-3xl shadow-2xl z-50 animate-fade-in-up overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-3 flex justify-between items-center border-b border-white/10">
        <span className="text-xs font-bold text-primary tracking-widest">PULSAR FX-991</span>
        <button onClick={onClose}><X className="w-5 h-5 text-white/70 hover:text-white" /></button>
      </div>
      <div className="p-4 bg-black/60 text-right text-2xl font-mono text-green-400 h-20 flex items-center justify-end border-b border-white/10 break-all">
        {display || "0"}
      </div>
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#252525]">
        {/* Scientific Row */}
        {['sin','cos','tan','log','ln','√','^','('].map(b => (
          <button key={b} onClick={() => btn(b === '√' ? '√(' : b === '^' ? '**' : b + '(')} className="p-2 text-[10px] font-bold bg-white/5 text-subtext rounded hover:bg-white/10">{b}</button>
        ))}
        {['7','8','9','/','4','5','6','*','1','2','3','-','.','0',')','+'].map(b => (
           <button key={b} onClick={() => btn(b)} className="p-3 text-sm font-bold bg-surface text-white rounded hover:bg-white/10 shadow-sm">{b}</button>
        ))}
        <button onClick={clear} className="col-span-2 p-3 bg-red-500/20 text-red-500 font-bold rounded text-xs">AC</button>
        <button onClick={calc} className="col-span-2 p-3 bg-primary text-white font-bold rounded shadow-[0_0_15px_rgba(160,108,213,0.4)]">=</button>
      </div>
    </div>
  );
};

// 2. Start Screen (Detailed)
const StartScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center">
    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
      <Lock className="w-10 h-10 text-primary" />
    </div>
    <h1 className="text-3xl font-bold text-white mb-2">{EXAM_DATA.courseCode}</h1>
    <p className="text-subtext mb-8">{EXAM_DATA.title}</p>
    
    <div className="w-full max-w-md bg-surface border border-white/10 rounded-2xl p-6 text-left space-y-4 mb-8">
      <h3 className="text-white font-bold border-b border-white/10 pb-2 mb-2">Exam Instructions</h3>
      <li className="text-sm text-subtext">Duration: <span className="text-white">40 Minutes</span>.</li>
      <li className="text-sm text-subtext">Total Questions: <span className="text-white">40</span>.</li>
      <li className="text-sm text-subtext">Use the <span className="text-primary">Question Grid</span> to jump between questions.</li>
      <li className="text-sm text-subtext text-red-400">Do not refresh the browser or you will lose progress.</li>
      <li className="text-sm text-subtext">Calculator is available for calculations.</li>
    </div>

    <div className="flex gap-4 w-full max-w-md">
       <button className="flex-1 py-4 rounded-xl border border-white/10 text-subtext font-bold">Cancel</button>
       <button onClick={onStart} className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">Start Exam</button>
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
  const [showGrid, setShowGrid] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    const timer = setInterval(() => setTimeLeft((p) => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [hasStarted]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const currentQ = EXAM_DATA.questions[currentQIndex];

  if (!hasStarted) return <StartScreen onStart={() => setHasStarted(true)} />;

  return (
    <div className="fixed inset-0 bg-background text-text font-sans flex flex-col h-[100dvh] w-screen overflow-hidden">
      
      {/* 1. HEADER (Fixed) */}
      <header className="h-16 flex-none bg-surface/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
           <button onClick={() => setShowQuitModal(true)} className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500/20"><LogOut className="w-5 h-5" /></button>
           <span className="font-bold text-white tracking-tight">{EXAM_DATA.courseCode}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-lg border font-mono font-bold ${timeLeft < 300 ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-black/30 border-white/10 text-white'}`}>
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* 2. SCROLLABLE CONTENT (Middle) */}
      <main className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="max-w-2xl mx-auto pt-4">
          
          {/* Question Text */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Question {currentQIndex + 1}</span>
              <span className="text-xs text-subtext">{Object.keys(answers).length} / {EXAM_DATA.questions.length} Answered</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">{currentQ.text}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => (
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

      {/* 3. FOOTER (Fixed) */}
      <footer className="h-auto flex-none bg-[#0a0a0f] border-t border-white/10 p-4 z-40 pb-safe">
        <div className="flex justify-between items-center max-w-2xl mx-auto gap-4">
          <button 
            onClick={() => setCurrentQIndex(p => Math.max(0, p - 1))} 
            disabled={currentQIndex === 0}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-white/10 text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5"/>
          </button>

          {/* Center Tools */}
          <div className="flex gap-3">
             <button onClick={() => setShowCalc(!showCalc)} className={`px-4 py-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 ${showCalc ? 'bg-white text-black border-white' : 'border-white/20 text-subtext'}`}>
               <Calculator className="w-4 h-4" /> Calc
             </button>
             <button onClick={() => setShowGrid(!showGrid)} className={`px-4 py-2 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 ${showGrid ? 'bg-primary text-white border-primary' : 'border-white/20 text-subtext'}`}>
               <Grid className="w-4 h-4" /> Map
             </button>
          </div>

          <button 
            onClick={() => setCurrentQIndex(p => Math.min(EXAM_DATA.questions.length - 1, p + 1))} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20"
          >
            <ChevronRight className="w-5 h-5"/>
          </button>
        </div>
      </footer>

      {/* 4. OVERLAYS */}
      
      {/* Calculator */}
      {showCalc && <SciCalculator onClose={() => setShowCalc(false)} />}

      {/* Navigation Grid (Bottom Sheet) */}
      <div className={`fixed inset-x-0 bottom-0 bg-[#15151a] border-t border-white/20 rounded-t-3xl z-50 transition-transform duration-300 ease-out transform ${showGrid ? 'translate-y-0' : 'translate-y-full'} max-h-[60vh] flex flex-col`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-3xl">
          <span className="font-bold text-white text-sm">Question Map</span>
          <button onClick={() => setShowGrid(false)}><X className="w-5 h-5 text-white"/></button>
        </div>
        <div className="p-4 grid grid-cols-5 gap-3 overflow-y-auto pb-8">
          {EXAM_DATA.questions.map((q, idx) => (
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

      {/* Quit Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="w-full max-w-xs bg-surface border border-white/10 p-6 rounded-2xl text-center">
             <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
             <h3 className="text-white font-bold mb-2">Quit Exam?</h3>
             <p className="text-subtext text-xs mb-6">Your progress will be lost.</p>
             <div className="flex gap-3">
               <button onClick={() => setShowQuitModal(false)} className="flex-1 py-3 border border-white/10 rounded-xl text-white text-sm">Cancel</button>
               <button onClick={() => window.location.href = '/dashboard'} className="flex-1 py-3 bg-red-500 rounded-xl text-white text-sm font-bold">Quit</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
        }
                 
