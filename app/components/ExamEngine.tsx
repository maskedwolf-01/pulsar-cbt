"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  Timer, ChevronLeft, ChevronRight, CheckCircle, 
  AlertTriangle, Loader2 
} from "lucide-react";

// --- SUPABASE CLIENT ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_option: number;
}

type ThemeColor = 'purple' | 'blue' | 'green' | 'red' | 'orange' | 'cyan' | 'pink' | 'emerald' | 'indigo';

interface ExamEngineProps {
  title: string;
  courseCode: string;
  timeLimit: number;
  themeColor?: ThemeColor;
}

export default function ExamEngine({ title, courseCode, timeLimit, themeColor = 'purple' }: ExamEngineProps) {
  const router = useRouter();

  // --- THEME CONFIGURATION ---
  const colors = {
    purple: { text: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500', soft: 'bg-purple-500/10' },
    blue:   { text: 'text-blue-500',   bg: 'bg-blue-500',   border: 'border-blue-500',   soft: 'bg-blue-500/10' },
    green:  { text: 'text-green-500',  bg: 'bg-green-500',  border: 'border-green-500',  soft: 'bg-green-500/10' },
    red:    { text: 'text-red-500',    bg: 'bg-red-500',    border: 'border-red-500',    soft: 'bg-red-500/10' },
    orange: { text: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500', soft: 'bg-orange-500/10' },
    cyan:   { text: 'text-cyan-500',   bg: 'bg-cyan-500',   border: 'border-cyan-500',   soft: 'bg-cyan-500/10' },
    pink:   { text: 'text-pink-500',   bg: 'bg-pink-500',   border: 'border-pink-500',   soft: 'bg-pink-500/10' },
    emerald:{ text: 'text-emerald-500',bg: 'bg-emerald-500',border: 'border-emerald-500',soft: 'bg-emerald-500/10' },
    indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500', border: 'border-indigo-500', soft: 'bg-indigo-500/10' },
  };

  const theme = colors[themeColor];

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [score, setScore] = useState(0);

  // --- 1. FETCH QUESTIONS ---
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions') 
        .select('*')
        .eq('course_code', courseCode); 

      if (!error && data) {
        setQuestions(data);
      } else {
        console.error("Error loading questions:", error);
      }
      setLoading(false);
    };

    fetchQuestions();
  }, [courseCode]);

  // --- 2. TIMER ---
  useEffect(() => {
    if (!started || finished) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- 3. SUBMIT LOGIC ---
  const handleAttemptSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      setShowConfirmModal(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setShowConfirmModal(false);
    let calculatedScore = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_option) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    setFinished(true);
  };

  // --- RENDER: LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <Loader2 className={`w-8 h-8 animate-spin ${theme.text}`} />
        <span className="ml-3 font-bold">Loading Exam Data...</span>
      </div>
    );
  }

  // --- RENDER: RESULT SCREEN ---
  if (finished) {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111113] border border-zinc-800 rounded-2xl p-8 text-center animate-fade-in-up">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${theme.soft}`}>
            <CheckCircle className={`w-10 h-10 ${theme.text}`} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Exam Submitted!</h2>
          <p className="text-zinc-400 mb-8">Performance for {title}</p>
          
          <div className="bg-zinc-900 rounded-xl p-6 mb-8 border border-zinc-800">
            <div className="text-sm text-zinc-500 uppercase font-bold tracking-widest mb-2">Your Score</div>
            <div className="text-5xl font-bold text-white mb-2">{score} / {questions.length}</div>
            <div className={`text-sm font-bold px-3 py-1 rounded-full inline-block ${percentage >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {percentage}% Accuracy
            </div>
          </div>

          <Link href="/dashboard" className="block w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-colors">
             Return Home
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDER: START SCREEN ---
  if (!started) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-[#111113] border border-zinc-800 rounded-3xl p-8 md:p-12 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${theme.soft}`}>
              <Timer className={`w-8 h-8 ${theme.text}`} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Duration</div>
                <div className="text-lg font-bold">{timeLimit} Minutes</div>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Questions</div>
                <div className="text-lg font-bold">{questions.length} Loaded</div>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Format</div>
                <div className="text-lg font-bold">Multiple Choice</div>
              </div>
            </div>

            <button 
              onClick={() => setStarted(true)}
              className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Start Examination
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE EXAM ---
  const question = questions[currentQ];
  
  // Safety check if no questions loaded
  if (!question) return <div className="text-white text-center p-10">Error: No questions found for this course.</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="fixed top-0 w-full bg-[#111113]/90 backdrop-blur-md border-b border-zinc-800 z-50 h-16 flex items-center justify-between px-4 md:px-8">
        <div className="font-bold text-zinc-400 text-sm md:text-base truncate max-w-[150px] md:max-w-none">
          {title}
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold ${timeLeft < 60 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-zinc-800 text-white'}`}>
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>

          <button 
            onClick={handleAttemptSubmit}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Submit
          </button>
        </div>
      </header>

      {/* QUESTION AREA */}
      <main className="flex-1 pt-24 pb-32 px-4 md:px-8 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-end mb-6">
           <span className={`text-sm font-bold uppercase tracking-widest ${theme.text}`}>Question {currentQ + 1} of {questions.length}</span>
           <span className="text-xs text-zinc-500">Select the best option</span>
        </div>

        <div className="text-xl md:text-2xl font-medium leading-relaxed mb-10">
          {question.question_text}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: idx }))}
              className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center gap-4 group ${
                answers[currentQ] === idx 
                  ? `${theme.border} ${theme.soft}` 
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                 answers[currentQ] === idx ? `${theme.bg} ${theme.border} text-white` : "border-zinc-600 text-zinc-500 group-hover:border-zinc-400"
              }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={answers[currentQ] === idx ? "text-white" : "text-zinc-400 group-hover:text-white"}>
                {opt}
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="fixed bottom-0 w-full bg-[#111113] border-t border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="text-sm text-zinc-500 font-bold hidden md:block">
            {Object.keys(answers).length} answered
          </div>

          <button 
            onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentQ === questions.length - 1}
            className="px-6 py-3 bg-white text-black rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 flex items-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-zinc-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-white">Unfinished Exam</h3>
            </div>
            
            <p className="text-zinc-400 leading-relaxed mb-8">
              You have only answered <strong className="text-white">{Object.keys(answers).length}</strong> of <strong className="text-white">{questions.length}</strong> questions.
              <br/><br/>
              Are you sure you want to submit?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
              >
                Keep Working
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
