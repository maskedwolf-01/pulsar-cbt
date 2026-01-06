"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Loader2, CheckCircle, Clock, ChevronRight, ChevronLeft, 
  RefreshCw, Award, Timer, AlertCircle, X, Calculator, 
  Share2, Search, Grid, LogOut, Info 
} from 'lucide-react';

// --- SUPABASE CLIENT ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- CALCULATOR COMPONENT ---
const ExamCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState('0');
  const [evalString, setEvalString] = useState('');
  
  const handlePress = (val: string) => {
    if (val === 'C') { setDisplay('0'); setEvalString(''); return; }
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const res = eval(evalString).toString();
        setDisplay(res.substring(0, 10)); setEvalString(res);
      } catch { setDisplay('Err'); }
      return;
    }
    const newStr = evalString + val;
    setEvalString(newStr);
    setDisplay(newStr);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-zinc-900 border border-zinc-700 p-4 rounded-2xl shadow-2xl w-64 animate-fade-in-up">
      <div className="flex justify-between mb-4">
        <span className="text-xs font-bold text-zinc-500 uppercase">Calculator</span>
        <button onClick={onClose}><X className="w-4 h-4 text-zinc-400"/></button>
      </div>
      <div className="bg-black p-3 rounded-lg text-right text-xl font-mono text-white mb-3 truncate">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
          <button key={btn} onClick={() => handlePress(btn)} 
            className={`p-2 rounded-lg font-bold text-sm ${btn === '=' ? 'bg-purple-600 text-white col-span-2' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function ExamPage() {
  const router = useRouter();
  // STATES
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false); // Review Mode
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 45); 
  
  // UX STATES
  const [showCalculator, setShowCalculator] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [gridPage, setGridPage] = useState(0); // Pagination

  useEffect(() => { fetchAndShuffleQuestions(); }, []);

  // TIMER
  useEffect(() => {
    if (!examStarted || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, submitted]);

  // FETCH & SHUFFLE
  const fetchAndShuffleQuestions = async () => {
    const { data, error } = await supabase.from('questions').select('*').eq('course_code', 'GST 103');
    if (error || !data || data.length === 0) { setLoading(false); return; }

    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 100).map((q, i) => {
      const correctText = q[`option_${q.correct_option.toLowerCase()}`];
      let options = [ { id: 'A', text: q.option_a }, { id: 'B', text: q.option_b }, { id: 'C', text: q.option_c }, { id: 'D', text: q.option_d } ];
      options = options.sort(() => Math.random() - 0.5);
      const newCorrect = ['A', 'B', 'C', 'D'][options.findIndex(o => o.text === correctText)];
      return { ...q, exam_number: i + 1, display_options: options, new_correct_option: newCorrect };
    });
    setQuestions(shuffled); setLoading(false);
  };

  const handleSelect = (label: string) => {
    if (submitted && !isReviewing) return; 
    if (isReviewing) return; 
    setAnswers({ ...answers, [questions[currentIndex].id]: label });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    let calcScore = 0;
    questions.forEach(q => { if (answers[q.id] === q.new_correct_option) calcScore++; });
    setScore(calcScore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await supabase.from('results').insert({
            user_id: user.id, course_code: 'GST 103', score: Math.round((calcScore/questions.length)*100), total_questions: questions.length
        });
    }
  };

  const handleShare = () => {
    const text = `I just scored ${score}/${questions.length} in GST 103 on Pulsar CBT! 🚀 Can you beat me? \nTry it here: https://pulsar-cbt.vercel.app/exam/gst103`;
    navigator.clipboard.writeText(text);
    alert('Result copied to clipboard!'); 
  };

  const confirmExit = () => router.push('/dashboard');

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading Engine...</div>;
  if (questions.length === 0) return <div className="h-screen bg-[#09090b] text-white flex items-center justify-center">No Questions Loaded.</div>;

  // --- START SCREEN (RESTORED INSTRUCTIONS) ---
  if (!examStarted) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl">
        <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-purple-500"/>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">GST 103</h1>
        <p className="text-zinc-500 text-sm mb-8">Use of Library & ICT | 100 Questions</p>
        
        {/* INSTRUCTIONS BOX */}
        <div className="bg-black/40 text-left p-5 rounded-2xl border border-zinc-800 mb-8">
          <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
            <Info className="w-4 h-4"/> Exam Instructions
          </h3>
          <ul className="space-y-4 text-sm text-zinc-300">
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0"/> 
              <span>Answer all questions within the <strong>45-minute</strong> time limit.</span>
            </li>
            <li className="flex gap-3">
              <RefreshCw className="w-5 h-5 text-blue-500 shrink-0"/> 
              <span><strong>Retake Often!</strong> The system shuffles questions and options every time to ensure you master the material.</span>
            </li>
            <li className="flex gap-3">
              <Clock className="w-5 h-5 text-orange-500 shrink-0"/> 
              <span>The timer stops automatically. Good luck!</span>
            </li>
          </ul>
        </div>

        <button onClick={() => setExamStarted(true)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 flex items-center justify-center gap-2 transition-transform active:scale-95">
          Start Exam <ChevronRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  // --- RESULT SCREEN ---
  if (submitted && !isReviewing) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#09090b] text-white p-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="text-center mb-8">
             <h2 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{percentage}%</h2>
             <p className="text-zinc-500 text-sm uppercase tracking-widest">Accuracy Score</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
             <button onClick={() => setIsReviewing(true)} className="py-4 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors">Review Answers</button>
             <button onClick={handleShare} className="py-4 bg-purple-600 rounded-xl font-bold text-sm hover:bg-purple-500 transition-colors flex items-center justify-center gap-2"><Share2 className="w-4 h-4"/> Share Result</button>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black font-bold rounded-xl mb-3 hover:bg-zinc-200 transition-colors">Retake Exam</button>
          <button onClick={() => router.push('/dashboard')} className="w-full py-4 text-zinc-500 font-bold text-sm hover:text-white transition-colors">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // --- EXAM INTERFACE ---
  const currentQ = questions[currentIndex];
  
  // Pagination Logic (20 per page for the grid)
  const gridStart = gridPage * 20;
  const gridEnd = Math.min(gridStart + 20, questions.length);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans p-4 md:p-6 pb-24 relative">
      
      {/* EXIT MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
              <h3 className="text-lg font-bold text-white mb-2">Quit Exam?</h3>
              <p className="text-sm text-zinc-500 mb-6">Your progress will be lost.</p>
              <div className="flex gap-3">
                 <button onClick={() => setShowExitModal(false)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700">Cancel</button>
                 <button onClick={confirmExit} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-500">Quit</button>
              </div>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setShowExitModal(true)} className="p-2 bg-zinc-800/50 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
        <div className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
           {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
        </div>
        <button onClick={() => setShowCalculator(!showCalculator)} className={`p-2 rounded-full transition-colors ${showCalculator ? 'bg-purple-600 text-white' : 'bg-zinc-800/50 text-zinc-400 hover:text-white'}`}><Calculator className="w-5 h-5"/></button>
      </div>

      {showCalculator && <ExamCalculator onClose={() => setShowCalculator(false)} />}

      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_320px] gap-8">
        
        {/* QUESTION CARD */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-3xl shadow-lg relative min-h-[500px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <span className="text-xs font-bold text-zinc-500 tracking-widest">QUESTION {currentIndex + 1}</span>
             {isReviewing && (
                <a href={`https://www.google.com/search?q=${encodeURIComponent(currentQ.question_text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                  <Search className="w-3 h-3"/> Explain with Google
                </a>
             )}
          </div>
          
          <h2 className="text-lg md:text-xl font-medium text-white leading-relaxed mb-8 flex-1">
            {currentQ.question_text}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQ.display_options.map((opt: any, idx: number) => {
              const label = ['A', 'B', 'C', 'D'][idx];
              const isSelected = answers[currentQ.id] === label;
              
              // REVIEW MODE STYLING
              let btnClass = "bg-black/20 border-zinc-800 text-zinc-300 hover:bg-zinc-800";
              if (isReviewing) {
                 if (label === currentQ.new_correct_option) btnClass = "bg-green-500/10 border-green-500 text-green-500"; 
                 else if (isSelected && label !== currentQ.new_correct_option) btnClass = "bg-red-500/10 border-red-500 text-red-500"; 
                 else btnClass = "opacity-50 border-zinc-800"; 
              } else {
                 if (isSelected) btnClass = "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-900/20";
              }

              return (
                <button key={idx} onClick={() => handleSelect(label)} disabled={isReviewing}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${btnClass}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border border-current opacity-80 shrink-0`}>{label}</div>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* NAV BUTTONS */}
          <div className="flex justify-between pt-6 border-t border-zinc-800">
            <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex===0} className="px-6 py-3 rounded-xl bg-zinc-800 disabled:opacity-50 text-sm font-bold flex items-center gap-2 hover:bg-zinc-700 transition-colors"><ChevronLeft className="w-4 h-4"/> Prev</button>
            {currentIndex === questions.length - 1 && !isReviewing ? (
               <button onClick={() => setShowExitModal(true)} className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-green-500 transition-colors shadow-lg shadow-green-900/20" 
                  onMouseDown={() => { if(confirm("Submit Exam?")) handleSubmit(); }}>Submit <CheckCircle className="w-4 h-4"/></button>
            ) : (
               <button onClick={() => setCurrentIndex(p => Math.min(questions.length-1, p+1))} className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors">Next <ChevronRight className="w-4 h-4"/></button>
            )}
          </div>
        </div>

        {/* NAVIGATION GRID (PAGINATED) */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Question Map</h3>
            <div className="flex gap-1 items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
               <button onClick={() => setGridPage(p => Math.max(0, p-1))} disabled={gridPage===0} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30"><ChevronLeft className="w-3 h-3 text-zinc-400"/></button>
               <span className="text-xs text-zinc-300 font-mono w-16 text-center">{gridStart+1}-{gridEnd}</span>
               <button onClick={() => setGridPage(p => (gridEnd < questions.length ? p+1 : p))} disabled={gridEnd >= questions.length} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30"><ChevronRight className="w-3 h-3 text-zinc-400"/></button>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {questions.slice(gridStart, gridEnd).map((q, i) => {
              const actualIndex = gridStart + i;
              const answered = answers[q.id];
              let colorClass = "bg-black/40 border-zinc-800 text-zinc-600 hover:border-zinc-600"; 
              
              if (actualIndex === currentIndex) colorClass = "bg-white text-black border-white ring-2 ring-purple-500";
              else if (isReviewing) {
                 const isCorrect = answers[q.id] === q.new_correct_option;
                 colorClass = isCorrect ? "bg-green-500/20 text-green-500 border-green-500/50" : "bg-red-500/20 text-red-500 border-red-500/50";
              }
              else if (answered) colorClass = "bg-purple-600/20 text-purple-400 border-purple-500/50";

              return (
                <button key={q.id} onClick={() => setCurrentIndex(actualIndex)}
                  className={`h-9 rounded-lg text-xs font-bold border transition-all ${colorClass}`}>
                  {actualIndex + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-zinc-800 flex gap-4 justify-center">
             <div className="flex items-center gap-2 text-xs text-zinc-500"><div className="w-2 h-2 bg-purple-500 rounded-full"></div> Answered</div>
             <div className="flex items-center gap-2 text-xs text-zinc-500"><div className="w-2 h-2 bg-zinc-700 rounded-full"></div> Unanswered</div>
          </div>
        </div>

      </div>
    </div>
  );
        }
      
