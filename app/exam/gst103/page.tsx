"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Loader2, CheckCircle, Clock, ChevronRight, ChevronLeft, 
  RefreshCw, Award, AlertCircle, X, Calculator, 
  Share2, Search, Info 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- CALCULATOR ---
const ExamCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState('0');
  const [evalString, setEvalString] = useState('');
  
  const handlePress = (val: string) => {
    if (val === 'C') { setDisplay('0'); setEvalString(''); return; }
    if (val === '=') {
      try {
        const res = eval(evalString).toString(); // Simple eval for calc
        setDisplay(res.substring(0, 10)); setEvalString(res);
      } catch { setDisplay('Err'); }
      return;
    }
    const newStr = evalString + val;
    setEvalString(newStr);
    setDisplay(newStr);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[60] bg-zinc-900 border border-zinc-700 p-4 rounded-2xl shadow-2xl w-64 animate-fade-in-up">
      <div className="flex justify-between mb-4">
        <span className="text-xs font-bold text-zinc-500 uppercase">Calculator</span>
        <button onClick={onClose}><X className="w-4 h-4 text-zinc-400"/></button>
      </div>
      <div className="bg-black p-3 rounded-lg text-right text-xl font-mono text-white mb-3 truncate">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
          <button key={btn} onClick={() => handlePress(btn)} className={`p-2 rounded-lg font-bold text-sm ${btn === '=' ? 'bg-purple-600 text-white col-span-2' : 'bg-zinc-800 text-zinc-300'}`}>{btn}</button>
        ))}
      </div>
    </div>
  );
};

// --- CUSTOM MODAL COMPONENT (Pulsar Theme) ---
const PulsarModal = ({ title, message, onConfirm, onCancel, confirmText="Confirm", cancelText="Cancel", isDestructive=false }: any) => (
  <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
     <div className="bg-[#111113] border border-zinc-800 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl scale-100">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-red-500/10' : 'bg-purple-500/10'}`}>
            {isDestructive ? <AlertCircle className="w-6 h-6 text-red-500"/> : <CheckCircle className="w-6 h-6 text-purple-500"/>}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 mb-6">{message}</p>
        <div className="flex gap-3">
           <button onClick={onCancel} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors">{cancelText}</button>
           <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl font-bold text-sm text-white ${isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-purple-600 hover:bg-purple-500'}`}>{confirmText}</button>
        </div>
     </div>
  </div>
);

export default function ExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 45); 
  const [showCalculator, setShowCalculator] = useState(false);
  const [gridPage, setGridPage] = useState(0); 

  // Modal States
  const [modalConfig, setModalConfig] = useState<any>(null); // { title, message, action, type }

  useEffect(() => { fetchAndShuffleQuestions(); }, []);

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

  const triggerSubmit = () => {
    setModalConfig({
        title: "Submit Exam?",
        message: "Are you sure you want to finish? You cannot change your answers after this.",
        isDestructive: false,
        onConfirm: () => { setModalConfig(null); handleSubmit(); }
    });
  };

  const triggerExit = () => {
    setModalConfig({
        title: "Quit Exam?",
        message: "Your progress will be lost completely.",
        isDestructive: true,
        confirmText: "Quit",
        onConfirm: () => { router.push('/dashboard'); }
    });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    let calcScore = 0;
    questions.forEach(q => { if (answers[q.id] === q.new_correct_option) calcScore++; });
    setScore(calcScore);
    
    // SAVE TO DB
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await supabase.from('results').insert({
            user_id: user.id, 
            course_code: 'GST 103', 
            score: Math.round((calcScore/questions.length)*100), 
            total_questions: questions.length
        });
    }
  };

  const handleShare = () => {
    const text = `I just scored ${score}/${questions.length} in GST 103 on Pulsar CBT! 🚀`;
    navigator.clipboard.writeText(text);
    alert('Result copied!'); 
  };

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading...</div>;

  // START SCREEN
  if (!examStarted) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111113] border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl">
        <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6"><Award className="w-10 h-10 text-purple-500"/></div>
        <h1 className="text-2xl font-bold text-white mb-2">GST 103</h1>
        <p className="text-zinc-500 text-sm mb-8">Use of Library & ICT | 100 Questions</p>
        <button onClick={() => setExamStarted(true)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 flex items-center justify-center gap-2">Start Exam <ChevronRight className="w-4 h-4"/></button>
      </div>
    </div>
  );

  // RESULT SCREEN
  if (submitted && !isReviewing) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-[#09090b] text-white p-6 flex items-center justify-center">
        <div className="w-full max-w-lg bg-[#111113] border border-zinc-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="text-center mb-8">
             <h2 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{percentage}%</h2>
             <p className="text-zinc-500 text-sm uppercase tracking-widest">Accuracy Score</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6">
             <button onClick={() => setIsReviewing(true)} className="py-4 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700">Review Answers</button>
             <button onClick={handleShare} className="py-4 bg-purple-600 rounded-xl font-bold text-sm hover:bg-purple-500 flex items-center justify-center gap-2"><Share2 className="w-4 h-4"/> Share</button>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-black font-bold rounded-xl mb-3">Retake Exam</button>
          <button onClick={() => router.push('/dashboard')} className="w-full py-4 text-zinc-500 font-bold text-sm hover:text-white">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // EXAM INTERFACE
  const currentQ = questions[currentIndex];
  const gridStart = gridPage * 20;
  const gridEnd = Math.min(gridStart + 20, questions.length);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans p-4 md:p-6 pb-24 relative">
      
      {/* RENDER MODAL IF ACTIVE */}
      {modalConfig && <PulsarModal {...modalConfig} onCancel={() => setModalConfig(null)} />}

      <div className="flex justify-between items-center mb-6">
        <button onClick={triggerExit} className="p-2 bg-zinc-800/50 rounded-full hover:bg-zinc-800 text-zinc-400"><X className="w-5 h-5"/></button>
        <div className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
           {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
        </div>
        <button onClick={() => setShowCalculator(!showCalculator)} className={`p-2 rounded-full ${showCalculator ? 'bg-purple-600 text-white' : 'bg-zinc-800/50 text-zinc-400'}`}><Calculator className="w-5 h-5"/></button>
      </div>

      {showCalculator && <ExamCalculator onClose={() => setShowCalculator(false)} />}

      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_320px] gap-8">
        <div className="bg-[#111113] border border-zinc-800 p-6 md:p-10 rounded-3xl shadow-lg relative min-h-[500px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <span className="text-xs font-bold text-zinc-500 tracking-widest">QUESTION {currentIndex + 1}</span>
             {isReviewing && (
                <a href={`https://www.google.com/search?q=${encodeURIComponent(currentQ.question_text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline"><Search className="w-3 h-3"/> Explain</a>
             )}
          </div>
          
          <h2 className="text-lg md:text-xl font-medium text-white leading-relaxed mb-8 flex-1">{currentQ.question_text}</h2>

          <div className="space-y-3 mb-8">
            {currentQ.display_options.map((opt: any, idx: number) => {
              const label = ['A', 'B', 'C', 'D'][idx];
              const isSelected = answers[currentQ.id] === label;
              const isCorrectOption = label === currentQ.new_correct_option;
              
              // --- REVIEW MODE COLOR LOGIC ---
              let btnClass = "bg-black/20 border-zinc-800 text-zinc-300 hover:bg-zinc-800";
              
              if (isReviewing) {
                 if (isCorrectOption) {
                     // ALWAYS GREEN for the correct answer
                     btnClass = "bg-green-500/10 border-green-500 text-green-500 font-bold";
                 } else if (isSelected && !isCorrectOption) {
                     // RED if user picked it but it was wrong
                     btnClass = "bg-red-500/10 border-red-500 text-red-500 font-bold";
                 } else {
                     // Dim everything else
                     btnClass = "opacity-40 border-zinc-800";
                 }
              } else {
                 // Normal Exam Mode
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

          <div className="flex justify-between pt-6 border-t border-zinc-800">
            <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex===0} className="px-6 py-3 rounded-xl bg-zinc-800 disabled:opacity-50 text-sm font-bold flex items-center gap-2"><ChevronLeft className="w-4 h-4"/> Prev</button>
            {currentIndex === questions.length - 1 && !isReviewing ? (
               <button onClick={triggerSubmit} className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-green-500">Submit <CheckCircle className="w-4 h-4"/></button>
            ) : (
               <button onClick={() => setCurrentIndex(p => Math.min(questions.length-1, p+1))} className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2">Next <ChevronRight className="w-4 h-4"/></button>
            )}
          </div>
        </div>

        <div className="bg-[#111113] border border-zinc-800 p-6 rounded-3xl h-fit">
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
                 // If not answered but in review, keep dark
                 if(!answers[q.id]) colorClass = "bg-zinc-800/50 border-zinc-800 text-zinc-700";
              }
              else if (answered) colorClass = "bg-purple-600/20 text-purple-400 border-purple-500/50";

              return (
                <button key={q.id} onClick={() => setCurrentIndex(actualIndex)} className={`h-9 rounded-lg text-xs font-bold border transition-all ${colorClass}`}>{actualIndex + 1}</button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
          }
          
