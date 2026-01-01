"use client";
import { useState, useEffect } from 'react';
import { 
  Clock, Grid, Calculator, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle, X, Menu 
} from 'lucide-react';
import Link from 'next/link';

// --- MOCK EXAM DATA ---
const EXAM_DATA = {
  courseCode: "MTH 101",
  title: "General Mathematics I",
  duration: 45 * 60, // 45 minutes in seconds
  questions: [
    {
      id: 1,
      text: "If f(x) = 2x² - 3x + 1, find f(-2).",
      options: ["15", "12", "5", "-1"]
    },
    {
      id: 2,
      text: "Evaluate the limit: lim(x→3) (x² - 9) / (x - 3)",
      options: ["0", "3", "6", "Undefined"]
    },
    {
      id: 3,
      text: "Which of the following is a scalar quantity?",
      options: ["Velocity", "Displacement", "Speed", "Acceleration"]
    },
    {
      id: 4,
      text: "The derivative of sin(x) is:",
      options: ["cos(x)", "-cos(x)", "tan(x)", "sec(x)"]
    },
    {
      id: 5,
      text: "Integrate ∫ 3x² dx",
      options: ["x³ + C", "6x + C", "3x³ + C", "x² + C"]
    }
  ]
};

// --- CALCULATOR COMPONENT ---
const SciCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState("");

  const btnClick = (val: string) => setDisplay(prev => prev + val);
  const clear = () => setDisplay("");
  const calculate = () => {
    try {
      // eslint-disable-next-line no-eval
      setDisplay(eval(display).toString());
    } catch {
      setDisplay("Error");
    }
  };

  return (
    <div className="absolute bottom-20 right-6 w-64 bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
      <div className="bg-primary/20 p-2 flex justify-between items-center border-b border-white/10">
        <span className="text-xs font-bold text-primary">CASIO FX-991</span>
        <button onClick={onClose}><X className="w-4 h-4 text-white/50 hover:text-white" /></button>
      </div>
      <div className="p-4 bg-black/50 text-right text-xl font-mono text-green-400 h-16 border-b border-white/10 flex items-center justify-end">
        {display || "0"}
      </div>
      <div className="grid grid-cols-4 gap-1 p-2">
        {['7','8','9','/','4','5','6','*','1','2','3','-','.','0','=','+'].map((btn) => (
          <button 
            key={btn} 
            onClick={() => btn === '=' ? calculate() : btnClick(btn)}
            className={`p-3 text-sm font-bold rounded hover:bg-white/10 ${btn === '=' ? 'bg-primary text-white' : 'bg-surface text-white'}`}
          >
            {btn}
          </button>
        ))}
        <button onClick={clear} className="col-span-4 p-2 bg-red-500/20 text-red-500 text-xs font-bold rounded mt-1">CLEAR</button>
      </div>
    </div>
  );
};

// --- MAIN EXAM PAGE ---
export default function ExamPage() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DATA.duration);
  const [showCalc, setShowCalc] = useState(false);
  const [showGrid, setShowGrid] = useState(false); // Mobile toggle

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) clearInterval(timer);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: option }));
  };

  const currentQ = EXAM_DATA.questions[currentQIndex];
  const isLastQuestion = currentQIndex === EXAM_DATA.questions.length - 1;
  const isUrgent = timeLeft < 300; // Red alert if < 5 mins

  return (
    <div className="min-h-screen bg-background text-text font-sans flex flex-col h-[100dvh]">
      
      {/* 1. EXAM HEADER */}
      <header className="h-16 border-b border-white/10 bg-surface flex items-center justify-between px-4 md:px-6 z-20">
        <div className="flex items-center gap-4">
           {/* Mobile Grid Toggle */}
           <button onClick={() => setShowGrid(!showGrid)} className="md:hidden p-2 bg-white/5 rounded-lg">
             <Grid className="w-5 h-5 text-white" />
           </button>
           <div>
             <h1 className="font-bold text-white text-lg leading-tight">{EXAM_DATA.courseCode}</h1>
             <p className="text-xs text-subtext hidden md:block">{EXAM_DATA.title}</p>
           </div>
        </div>

        {/* TIMER */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg border ${isUrgent ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' : 'bg-black/30 border-white/10 text-white'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* 2. MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR (Question Grid) - Hidden on Mobile unless toggled */}
        <aside className={`absolute md:relative z-10 w-64 h-full bg-background border-r border-white/10 flex flex-col transition-transform duration-300 ${showGrid ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-subtext uppercase tracking-wider mb-2">Navigation</h3>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary"></div> Answered</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-white/10 border border-white/20"></div> Pending</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-2 content-start">
            {EXAM_DATA.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => { setCurrentQIndex(idx); setShowGrid(false); }}
                className={`h-10 w-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                  idx === currentQIndex ? 'ring-2 ring-white' : ''
                } ${
                  answers[idx] ? 'bg-primary text-white' : 'bg-surface border border-white/10 text-subtext hover:bg-white/5'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
          {/* Calculator Toggle in Sidebar */}
          <div className="p-4 border-t border-white/10">
            <button 
              onClick={() => setShowCalc(!showCalc)}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${showCalc ? 'bg-secondary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
              <Calculator className="w-4 h-4" /> 
              {showCalc ? 'Hide Calculator' : 'Show Calculator'}
            </button>
          </div>
        </aside>

        {/* QUESTION AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-3xl mx-auto">
            
            {/* Question Card */}
            <div className="mb-8 animate-fade-in">
              <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs font-bold text-subtext mb-4 border border-white/10">
                Question {currentQIndex + 1} of {EXAM_DATA.questions.length}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                {currentQ.text}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQIndex] === opt;
                const labels = ['A', 'B', 'C', 'D'];
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all group ${
                      isSelected 
                        ? 'bg-primary/20 border-primary text-white' 
                        : 'bg-surface border-white/10 text-subtext hover:border-primary/50 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      isSelected ? 'bg-primary text-white' : 'bg-white/10 group-hover:bg-white/20'
                    }`}>
                      {labels[idx]}
                    </div>
                    <span className="text-lg">{opt}</span>
                    {isSelected && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
              <button 
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-6 py-3 rounded-lg border border-white/10 text-white font-bold disabled:opacity-50 hover:bg-white/5 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {isLastQuestion ? (
                <button 
                  className="px-8 py-3 rounded-lg bg-green-500 text-black font-bold hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center gap-2"
                >
                  Submit Exam <CheckCircle className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                  className="px-6 py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 flex items-center gap-2"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Calculator Overlay */}
          {showCalc && <SciCalculator onClose={() => setShowCalc(false)} />}
          
        </main>
      </div>
    </div>
  );
      }
      
