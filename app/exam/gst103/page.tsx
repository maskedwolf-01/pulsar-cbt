"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle, Clock, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ExamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 45); // 45 Minutes

  useEffect(() => {
    fetchAndShuffleQuestions();
    
    // Timer Countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAndShuffleQuestions = async () => {
    // 1. Fetch ALL questions for GST 103
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('course_code', 'GST 103');

    if (error || !data) {
      alert("Error loading exam.");
      return;
    }

    // 2. THE SMART SHUFFLE ENGINE
    const shuffledPool = data
      .sort(() => Math.random() - 0.5) // Randomize the 200
      .slice(0, 100)                   // Take only 100
      .map((q, index) => {
        // Scramble Options A, B, C, D
        const correctText = q[`option_${q.correct_option.toLowerCase()}`]; // Get the actual correct text
        
        let options = [
          { id: 'A', text: q.option_a },
          { id: 'B', text: q.option_b },
          { id: 'C', text: q.option_c },
          { id: 'D', text: q.option_d }
        ];
        
        // Shuffle the options array
        options = options.sort(() => Math.random() - 0.5);

        // Find where the correct answer landed
        const newCorrectOption = ['A', 'B', 'C', 'D'][options.findIndex(o => o.text === correctText)];

        return {
          ...q,
          exam_number: index + 1, // Renumber 1-100
          display_options: options, // The mixed options
          new_correct_option: newCorrectOption // The new correct letter
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
    // Calculate Score
    let calculatedScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.new_correct_option) {
        calculatedScore++;
      }
    });
    setScore(calculatedScore);
    
    // Save Result to DB (Optional - ensure 'results' table exists)
    const { data: { user } } = await supabase.auth.getUser();
    if(user) {
        await supabase.from('results').insert({
            user_id: user.id,
            course_code: 'GST 103',
            score: Math.round((calculatedScore / 100) * 100),
            total_questions: 100
        });
    }
  };

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Setting up your Exam...</div>;

  const currentQ = questions[currentIndex];
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 font-sans p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">GST 103: Use of Library & ICT</h1>
          <p className="text-sm text-zinc-500">Fuoye CBT 100 Level</p>
        </div>
        <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
          <Clock className="w-5 h-5"/> {formatTime(timeLeft)}
        </div>
      </div>

      {submitted ? (
        // RESULT VIEW
        <div className="max-w-2xl mx-auto text-center mt-20 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl shadow-2xl">
            <div className="w-24 h-24 mx-auto bg-purple-600/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-purple-500"/>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Exam Submitted!</h2>
            <p className="text-zinc-400 mb-6">You have successfully completed the test.</p>
            <div className="text-6xl font-bold text-white mb-2">{score}<span className="text-2xl text-zinc-600">/100</span></div>
            <p className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-8">Final Score</p>
            <button onClick={() => router.push('/dashboard')} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        // EXAM VIEW
        <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_300px] gap-8">
          
          {/* Question Area */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-10 rounded-3xl shadow-lg relative">
            <div className="absolute top-6 right-6 text-zinc-500 text-xs font-bold tracking-widest">
              QUESTION {currentQ.exam_number} OF 100
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
                <ChevronLeft className="w-4 h-4"/> Previous
              </button>

              {currentIndex === 99 ? (
                <button 
                  onClick={() => { if(confirm('Submit Exam?')) handleSubmit(); }}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all text-sm font-bold"
                >
                  Submit Exam <CheckCircle className="w-4 h-4"/>
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(99, prev + 1))}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-bold"
                >
                  Next <ChevronRight className="w-4 h-4"/>
                </button>
              )}
            </div>
          </div>

          {/* Number Grid (Desktop) */}
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
      )}
    </div>
  );
    }
        
