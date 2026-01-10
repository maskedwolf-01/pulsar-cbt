"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import { 
  Loader2, CheckCircle, XCircle, Clock, ChevronRight, ChevronLeft, 
  Award, AlertCircle, X, Calculator, Share2, Search, Info, Home, RefreshCw, User
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- MODAL COMPONENT ---
const PulsarModal = ({ title, message, onConfirm, onCancel, confirmText="Confirm", cancelText="Cancel", isDestructive=false, singleButton=false }: any) => (
  <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
     <div className="bg-[#111113] border border-zinc-800 p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl scale-100">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDestructive ? 'bg-red-500/10' : 'bg-red-500/10'}`}>
            {isDestructive ? <AlertCircle className="w-6 h-6 text-red-500"/> : <CheckCircle className="w-6 h-6 text-red-500"/>}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-500 mb-6">{message}</p>
        <div className="flex gap-3">
           {!singleButton && (
             <button onClick={onCancel} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-sm hover:bg-zinc-700 text-white transition-colors">{cancelText}</button>
           )}
           <button onClick={onConfirm} className={`flex-1 py-3 rounded-xl font-bold text-sm text-white ${isDestructive ? 'bg-red-600 hover:bg-red-500' : 'bg-red-600 hover:bg-red-500'}`}>{confirmText}</button>
        </div>
     </div>
  </div>
);

// --- CALCULATOR COMPONENT ---
const ExamCalculator = ({ onClose }: { onClose: () => void }) => {
  const [display, setDisplay] = useState('0');
  const handlePress = (val: string) => {
    if (val === 'C') { setDisplay('0'); return; }
    if (val === '=') {
      try {
        // eslint-disable-next-line
        setDisplay(Function('"use strict";return (' + display + ')')().toString().substring(0,10));
      } catch { setDisplay('Err'); }
      return;
    }
    setDisplay(prev => (prev === '0' ? val : prev + val));
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
          <button key={btn} onClick={() => handlePress(btn)} className={`p-2 rounded-lg font-bold text-sm ${btn === '=' ? 'bg-red-600 text-white col-span-2' : 'bg-zinc-800 text-zinc-300'}`}>{btn}</button>
        ))}
      </div>
    </div>
  );
};
                export default function ExamPage() {
  const router = useRouter();
  const resultCardRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(''); 
  const [examStarted, setExamStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 15); // 15 Minutes
  const [timeTaken, setTimeTaken] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [gridPage, setGridPage] = useState(0); 
  const [modalConfig, setModalConfig] = useState<any>(null);

  useEffect(() => { 
    fetchAndShuffleQuestions(); 
    fetchUser(); 
  }, []);

  useEffect(() => {
    if (!examStarted || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(timer); handleSubmit(); return 0; } return p - 1; });
      setTimeTaken(p => p + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, submitted]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUserName(user.user_metadata?.full_name || 'Scholar');
    }
  };

  // --- ROBUST FETCH FUNCTION (PREVENTS 0 SCORE BUG) ---
  const fetchAndShuffleQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('course_code', 'MTH 101'); 

    if (error || !data || data.length === 0) {
      setLoading(false);
      return;
    }

    const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 100).map((q, i) => {
      // 1. Get the text of the correct answer from the DB (safe trim)
      const correctKey = `option_${q.correct_option.toLowerCase().trim()}`;
      const correctText = q[correctKey];

      // 2. Create options array
      let options = [
        { id: 'A', text: q.option_a },
        { id: 'B', text: q.option_b },
        { id: 'C', text: q.option_c },
        { id: 'D', text: q.option_d }
      ];

      // 3. Shuffle options
      options = options.sort(() => Math.random() - 0.5);

      // 4. Find where the correct answer moved to
      // We use a loose check (trim) to ensure matching even if DB has spaces
      const foundIndex = options.findIndex(o => o.text?.trim() === correctText?.trim());
      
      // 5. SAFETY FALLBACK: If index is -1 (not found), default to original correct option.
      const newCorrect = foundIndex !== -1 ? ['A', 'B', 'C', 'D'][foundIndex] : q.correct_option;

      return { 
        ...q, 
        exam_number: i + 1, 
        display_options: options, 
        new_correct_option: newCorrect 
      };
    });

    setQuestions(shuffled);
    setLoading(false);
  };

  const handleSelect = (label: string) => {
    if (submitted) return; 
    setAnswers({ ...answers, [questions[currentIndex].id]: label });
  };

  const triggerSubmit = () => {
    setModalConfig({ title: "Submit Exam?", message: "Cannot change answers after submitting.", onConfirm: () => { setModalConfig(null); handleSubmit(); }, onCancel: () => setModalConfig(null) });
  };

  const triggerExit = () => {
    if (isReviewing || submitted) { router.push('/dashboard'); } 
    else { setModalConfig({ title: "Quit Exam?", message: "Progress will be lost.", isDestructive: true, confirmText: "Quit", onConfirm: () => { router.push('/dashboard'); }, onCancel: () => setModalConfig(null) }); }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    let calcScore = 0;
    // Robust scoring check
    questions.forEach(q => { 
        const userAns = answers[q.id];
        // Ensure both are valid strings before comparing
        if (userAns && q.new_correct_option && userAns === q.new_correct_option) {
            calcScore++; 
        }
    });
    setScore(calcScore);
    
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await supabase.from('results').insert({
            user_id: user.id, 
            course_code: 'MTH 101', 
            score: Math.round((calcScore/questions.length)*100), 
            total_questions: questions.length
        });
    }
  };

  const handleShare = async () => {
    if (!resultCardRef.current) return;
    try {
      const canvas = await html2canvas(resultCardRef.current, { backgroundColor: '#111113', scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share) {
            const file = new File([blob], 'pulsar-result.png', { type: 'image/png' });
            try { await navigator.share({ title: 'Pulsar CBT Result', text: `I scored ${score}/${questions.length} in MTH 101!`, files: [file] }); } catch (err) { console.log(err); }
        } else {
            const link = document.createElement('a'); link.download = 'Pulsar_Result.png'; link.href = canvas.toDataURL(); link.click();
            setModalConfig({ title: "Saved", message: "Image saved to gallery.", singleButton: true, onConfirm: () => setModalConfig(null) });
        }
      }, 'image/png');
    } catch (err) { setModalConfig({ title: "Error", message: "Share failed.", singleButton: true, onConfirm: () => setModalConfig(null) }); }
  };

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading...</div>;

  if (!examStarted) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111113] border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl">
        <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6"><Calculator className="w-10 h-10 text-red-500"/></div>
        <h1 className="text-2xl font-bold text-white mb-2">MTH 101</h1>
        <p className="text-zinc-500 text-sm mb-6">Elementary Mathematics I</p>
        <div className="bg-zinc-900/50 text-left p-5 rounded-xl border border-zinc-800 mb-8">
            <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-3 flex gap-2"><Info className="w-3 h-3"/> Instructions</h3>
            <ul className="text-sm text-zinc-300 space-y-3">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Answer all questions.</li>
                <li className="flex gap-2"><Clock className="w-4 h-4 text-orange-500"/> Time limit: 15 Minutes.</li>
                <li className="flex gap-2"><RefreshCw className="w-4 h-4 text-blue-500"/> Questions are shuffled.</li>
            </ul>
        </div>
        <button onClick={() => setExamStarted(true)} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 flex items-center justify-center gap-2">Start Exam <ChevronRight className="w-4 h-4"/></button>
      </div>
    </div>
  );

  if (submitted && !isReviewing) {
    const percentage = Math.round((score / questions.length) * 100);
    const timeDisplay = `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`;
    return (
      <div className="min-h-screen bg-[#09090b] text-white p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
            <div ref={resultCardRef} className="bg-[#111113] border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full border border-zinc-700 flex items-center justify-center mb-3">
                        <User className="w-8 h-8 text-red-500"/>
                    </div>
                    <h2 className="text-xl font-bold text-white">{userName}</h2>
                </div>
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">{percentage}%</div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 mb-8">MTH 101 Score</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-2"/>
                        <div className="text-lg font-bold text-white">{score}</div>
                        <div className="text-[10px] text-green-400 uppercase font-bold">Correct</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl">
                        <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2"/>
                        <div className="text-lg font-bold text-white">{questions.length - score}</div>
                        <div className="text-[10px] text-red-400 uppercase font-bold">Wrong</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl col-span-2 flex items-center justify-between px-6">
                        <div className="text-left"><div className="text-[10px] text-blue-400 uppercase font-bold mb-1">Time Taken</div><div className="text-lg font-bold text-white">{timeDisplay}</div></div>
                        <Clock className="w-6 h-6 text-blue-500 opacity-50"/>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setIsReviewing(true)} className="py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors">Review Answers</button>
                <button onClick={handleShare} className="py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/20"><Share2 className="w-4 h-4"/> Share Result</button>
            </div>
            <button onClick={() => router.push('/dashboard')} className="w-full py-4 mt-3 text-zinc-500 font-bold text-sm hover:text-white transition-colors">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const gridStart = gridPage * 20;
  const gridEnd = Math.min(gridStart + 20, questions.length);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans p-4 md:p-6 pb-24 relative">
      {modalConfig && <PulsarModal {...modalConfig} />}
      <div className="flex justify-between items-center mb-6">
        <button onClick={triggerExit} className="p-2 bg-zinc-800/50 rounded-full hover:bg-zinc-800 text-zinc-400">{isReviewing ? <Home className="w-5 h-5"/> : <X className="w-5 h-5"/>}</button>
        {isReviewing ? (<div className="px-4 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-red-300 text-xs font-bold uppercase tracking-widest">Review Mode</div>) : (<div className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-red-400'}`}>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>)}
        <button onClick={() => setShowCalculator(!showCalculator)} className={`p-2 rounded-full ${showCalculator ? 'bg-red-600 text-white' : 'bg-zinc-800/50 text-zinc-400'}`}><Calculator className="w-5 h-5"/></button>
      </div>
      {showCalculator && <ExamCalculator onClose={() => setShowCalculator(false)} />}
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_320px] gap-8">
        <div className="bg-[#111113] border border-zinc-800 p-6 md:p-10 rounded-3xl shadow-lg relative min-h-[500px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <span className="text-xs font-bold text-zinc-500 tracking-widest">QUESTION {currentIndex + 1}</span>
             {isReviewing && (<a href={`https://www.google.com/search?q=${encodeURIComponent(currentQ.question_text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline"><Search className="w-3 h-3"/> Explain with Google</a>)}
          </div>
          <h2 className="text-lg md:text-xl font-medium text-white leading-relaxed mb-8 flex-1">{currentQ.question_text}</h2>
          <div className="space-y-3 mb-8">
            {currentQ.display_options.map((opt: any, idx: number) => {
              const label = ['A', 'B', 'C', 'D'][idx];
              const isSelected = answers[currentQ.id] === label;
              const isCorrectOption = label === currentQ.new_correct_option;
              let btnClass = "bg-black/20 border-zinc-800 text-zinc-300 hover:bg-zinc-800";
              if (isReviewing) {
                 if (isCorrectOption) btnClass = "bg-green-500/10 border-green-500 text-green-500 font-bold";
                 else if (isSelected && !isCorrectOption) btnClass = "bg-red-500/10 border-red-500 text-red-500 font-bold opacity-60";
                 else btnClass = "opacity-30 border-zinc-900";
              } else { if (isSelected) btnClass = "bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/20"; }
              return (
                <button key={idx} onClick={() => handleSelect(label)} disabled={isReviewing} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${btnClass}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border border-current opacity-80 shrink-0`}>{label}</div>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between pt-6 border-t border-zinc-800">
            <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex===0} className="px-6 py-3 rounded-xl bg-zinc-800 disabled:opacity-50 text-sm font-bold flex items-center gap-2"><ChevronLeft className="w-4 h-4"/> Prev</button>
            {currentIndex === questions.length - 1 && !isReviewing ? (
               <button onClick={triggerSubmit} className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-green-500 shadow-lg shadow-green-900/20">Submit <CheckCircle className="w-4 h-4"/></button>
            ) : (
               <button onClick={() => setCurrentIndex(p => Math.min(questions.length-1, p+1))} className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 hover:text-black transition-colors">Next <ChevronRight className="w-4 h-4"/></button>
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
              if (actualIndex === currentIndex) colorClass = "bg-white text-black border-white ring-2 ring-red-500";
              else if (isReviewing) {
                 const isCorrect = answers[q.id] === q.new_correct_option;
                 colorClass = isCorrect ? "bg-green-500/20 text-green-500 border-green-500/50" : "bg-red-500/20 text-red-500 border-red-500/50";
                 if (!answers[q.id]) colorClass = "bg-zinc-800 text-zinc-500 border-zinc-700";
              }
              else if (answered) colorClass = "bg-red-600/20 text-red-400 border-red-500/50";
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
          
