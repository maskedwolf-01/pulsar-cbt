"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Loader2, CheckCircle, Clock, ChevronRight, ChevronLeft, 
  RefreshCw, Award, Timer, AlertCircle 
} from 'lucide-react';

// DIRECT CONNECTION
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false); // Start Screen State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(60 * 45); // 45 Minutes

  useEffect(() => {
    fetchAndShuffleQuestions();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!examStarted || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); 
          return 0;
        }
        return prev - 1;
      });
      setTimeTaken(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, submitted]);

  const fetchAndShuffleQuestions = async () => {
    // 1. Fetch questions
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('course_code', 'GST 103');

    if (error || !data || data.length === 0) {
      console.error("No questions found");
      setLoading(false);
      return;
    }

    // 2. Shuffle & Randomize Options
    const shuffledPool = data
      .sort(() => Math.random() - 0.5) 
      .slice(0, 100)                   
      .map((q, index) => {
        const correctText = q[`option_${q.correct_option.toLowerCase()}`]; 
        let options = [
          { id: 'A', text: q.option_a },
          { id: 'B', text: q.option_b },
          { id: 'C', text: q.option_c },
          { id: 'D', text: q.option_d }
        ];
        options = options.sort(() => Math.random() - 0.5);
        const newCorrectOption = ['A', 'B', 'C', 'D'][options.findIndex(o => o.text === correctText)];

        return {
          ...q,
          exam_number: index + 1, 
          display_options: options, 
          new_correct_option: newCorrectOption 
        };
      });

    setQuestions(shuffledPool);
    setLoading(false);
  };

  const handleSelect = (optionLabel: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [questions[currentIndex].id]: optionLabel });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    let calculatedScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.new_correct_option) calculatedScore++;
    });
    setScore(calculatedScore);
    
    // Save Result
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await supabase.from('results').insert({
            user_id: user.id,
            course_code: 'GST 103',
            score: Math.round((calculatedScore / questions.length) * 100),
            total_questions: questions.length
        });
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // --- LOADER ---
  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Preparing Exam Shell...</div>;

  // --- ERROR STATE (If SQL wasn't run) ---
  if (questions.length === 0) return (
    <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-400 text-center p-6">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4"/>
      <h2 className="text-xl font-bold text-white">No Questions Found</h2>
      <p className="max-w-md mt-2">The database is empty. Please run the SQL script to insert the questions.</p>
    </div>
  );

  // --- START SCREEN (Instructions) ---
  if (!examStarted) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl text-center">
        <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-purple-500"/>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">GST 103: Use of Library & ICT</h1>
        <p className="text-zinc-500 text-sm mb-8">100 Level | 100 Questions | 45 Mins</p>
        
        <div className="bg-black/40 text-left p-4 rounded-xl border border-zinc-800 mb-8">
          <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-3">Important Instructions</h3>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> <span>Answer all questions within the time limit.</span></li>
            <li className="flex gap-2"><RefreshCw className="w-4 h-4 text-blue-500 shrink-0"/> <span><strong>Take this exam often!</strong> The system shuffles 200+ questions every time to keep you sharp.</span></li>
            <li className="flex gap-2"><Clock className="w-4 h-4 text-orange-500 shrink-0"/> <span>Timer stops automatically when time is up.</span></li>
          </ul>
        </div>

        <button onClick={() => setExamStarted(true)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
          Start Exam <ChevronRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  // --- RESULT PAGE (Premium Design) ---
  if (submitted) {
    const percentage = Math.round((score / questions.length) * 100);
    const strokeDash = 440 - (440 * percentage) / 100; // For Circle Animation

    return (
      <div className="min-h-screen bg-[#09090b] text-white p-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${percentage >= 50 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-orange-500'}`}></div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">{percentage >= 50 ? 'Excellent Work! 🎉' : 'Keep Practicing! 💪'}</h2>
            <p className="text-zinc-500 text-sm mt-1">You have completed the session.</p>
          </div>

          {/* CIRCULAR SCORE */}
          <div className="relative w-48 h-48 mx-auto mb-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-800" />
              <circle cx="96" cy="96" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray="440" strokeDashoffset={strokeDash}
                className={`transition-all duration-1000 ease-out ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`} 
              />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{percentage}%</span>
              <span className="text-xs text-zinc-500 uppercase font-bold mt-1">Accuracy</span>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-black/30 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 mb-1"><CheckCircle className="w-4 h-4 text-green-500"/> Correct</div>
              <div className="text-xl font-bold text-white">{score} <span className="text-zinc-600 text-sm">/ {questions.length}</span></div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 mb-1"><Timer className="w-4 h-4 text-blue-500"/> Time</div>
              <div className="text-xl font-bold text-white">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</div>
            </div>
          </div>

          <div className="space-y-3">
             <button onClick={() => window.location.reload()} className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-all flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4"/> Retake Exam
            </button>
            <button onClick={() => router.push('/dashboard')} className="w-full py-4 bg-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN EXAM UI ---
  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-white md:text-xl">GST 103</h1>
          <p className="text-xs text-zinc-500 md:text-sm">Time Remaining</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
          <Clock className="w-5 h-5"/> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_300px] gap-8">
        {/* Question Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-3xl shadow-lg relative">
          <div className="absolute top-6 right-6 text-zinc-500 text-xs font-bold tracking-widest">
            QUESTION {currentIndex + 1} OF {questions.length}
          </div>
          
          <h2 className="text-lg md:text-xl font-medium text-white leading-relaxed mt-6 mb-8">
            {currentQ.question_text}
          </h2>

          <div className="space-y-3">
            {currentQ.display_options.map((opt: any, idx: number) => {
              const label = ['A', 'B', 'C', 'D'][idx];
              const isSelected = answers[currentQ.id] === label;
              return (
                <button 
                  key={idx} 
                  onClick={() => handleSelect(label)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                    isSelected 
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-black/20 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border ${
                    isSelected ? 'bg-white text-purple-600 border-white' : 'bg-black border-zinc-700 text-zinc-500 group-hover:border-zinc-500'
                  }`}>
                    {label}
                  </div>
                  <span className={isSelected ? 'text-white' : 'text-zinc-300'}>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-zinc-800">
            <button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4"/> Prev
            </button>

            {currentIndex === questions.length - 1 ? (
              <button 
                onClick={() => { if(confirm('Submit Exam?')) handleSubmit(); }}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all text-sm font-bold"
              >
                Submit <CheckCircle className="w-4 h-4"/>
              </button>
            ) : (
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-bold"
              >
                Next <ChevronRight className="w-4 h-4"/>
              </button>
            )}
          </div>
        </div>

        {/* Question Grid */}
        <div className="hidden md:block bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Progress</h3>
          <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {questions.map((q, i) => (
              <button 
                key={q.id} 
                onClick={() => setCurrentIndex(i)}
                className={`h-10 rounded-lg text-xs font-bold transition-all ${
                  i === currentIndex ? 'bg-white text-black ring-2 ring-purple-500' :
                  answers[q.id] ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 
                  'bg-black/40 text-zinc-600 border border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
         }
    
