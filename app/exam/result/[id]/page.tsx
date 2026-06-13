"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import { 
  Loader2, Share2, Home, BrainCircuit, 
  CheckCircle, XCircle, Target, Award, Sparkles, ChevronRight
} from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const resultCardRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [userName, setUserName] = useState('Scholar');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Result
      const { data: resData, error } = await supabase
        .from('results')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !resData) {
        router.push('/dashboard');
        return;
      }
      setResult(resData);

      // 2. Fetch User Profile for the Share Card
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else {
          setUserName(user.user_metadata?.full_name || 'Scholar');
        }
      }
      setLoading(false);
    };
    
    fetchData();
  }, [params.id, router]);

  const handleShare = async () => {
    if (!resultCardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(resultCardRef.current, { 
        backgroundColor: '#030305', 
        scale: 2,
        useCORS: true 
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `${result.course_code}_Result.png`, { type: 'image/png' });
        
        if (navigator.share) {
          try { 
            await navigator.share({ 
              title: 'Pulsar V2 Result', 
              text: `I just scored ${result.score}% in ${result.course_code} on Pulsar CBT!`, 
              files: [file] 
            }); 
          } catch (err) { console.log("Share cancelled", err); }
        } else {
          // Fallback for PC / unsupported browsers
          const link = document.createElement('a'); 
          link.download = `${result.course_code}_Pulsar_Result.png`; 
          link.href = canvas.toDataURL(); 
          link.click();
          alert("Result image downloaded!");
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (err) { 
      console.error(err);
      alert("Failed to generate share image.");
      setIsSharing(false); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin w-10 h-10 text-indigo-500 mb-4" />
        <h2 className="text-xl font-bold font-serif tracking-tight">Compiling Results...</h2>
      </div>
    );
  }

  // Calculate exact correct/wrong based on percentage and total questions
  const correctAnswers = Math.round((result.score / 100) * result.total_questions);
  const wrongAnswers = result.total_questions - correctAnswers;

  // Determine V2 Status Colors
  let statusGlow = "from-indigo-500 to-cyan-500";
  let statusText = "text-indigo-400";
  let remark = "Good Effort";

  if (result.score >= 70) {
    statusGlow = "from-emerald-400 to-teal-500";
    statusText = "text-emerald-400";
    remark = "Outstanding Performance";
  } else if (result.score >= 50) {
    statusGlow = "from-amber-400 to-orange-500";
    statusText = "text-amber-400";
    remark = "Average Score";
  } else {
    statusGlow = "from-rose-500 to-red-500";
    statusText = "text-rose-400";
    remark = "Needs Improvement";
  }

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans p-6 pb-32 flex flex-col items-center justify-center relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background ambient glow based on score */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-gradient-to-br ${statusGlow}`}></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        
        {/* SHAREABLE RESULT CARD (This specific div gets converted to an image) */}
        <div 
          ref={resultCardRef} 
          className="bg-[#0a0a0c] border border-white/10 p-8 rounded-[2rem] text-center shadow-2xl mb-6 relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${statusGlow}`}></div>
          
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-500/20 rounded flex items-center justify-center">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400"/>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Pulsar V2</span>
             </div>
             <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 ${statusText} bg-white/5`}>
               {remark}
             </div>
          </div>

          <h2 className="text-xl font-medium text-zinc-300 mb-1">{userName}</h2>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-white mb-8">{result.course_code} Assessment</h1>

          <div className="relative inline-block mb-10">
            <div className={`absolute inset-0 bg-gradient-to-br ${statusGlow} blur-[30px] opacity-20 rounded-full`}></div>
            <div className={`w-40 h-40 mx-auto bg-[#121216] rounded-full flex flex-col items-center justify-center border-4 relative z-10 shadow-inner`} style={{ borderColor: result.score >= 70 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#e11d48' }}>
              <span className="text-5xl font-black text-white tracking-tighter">{result.score}<span className="text-2xl text-zinc-500">%</span></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#121216] border border-white/5 p-4 rounded-2xl flex flex-col items-center">
               <CheckCircle className="w-5 h-5 text-emerald-400 mb-2"/>
               <span className="text-2xl font-bold text-white">{correctAnswers}</span>
               <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Correct</span>
            </div>
            <div className="bg-[#121216] border border-white/5 p-4 rounded-2xl flex flex-col items-center">
               <XCircle className="w-5 h-5 text-rose-400 mb-2"/>
               <span className="text-2xl font-bold text-white">{wrongAnswers}</span>
               <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Missed</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="space-y-3">
          <button 
            onClick={() => router.push(`/history/${result.id}`)} 
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <Sparkles className="w-5 h-5"/> Step-by-Step Explanations <ChevronRight className="w-4 h-4"/>
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleShare} 
              disabled={isSharing}
              className="py-4 bg-[#121216] border border-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSharing ? <Loader2 className="w-4 h-4 animate-spin"/> : <Share2 className="w-4 h-4"/>} 
              Share
            </button>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="py-4 bg-[#121216] border border-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4"/> Dashboard
            </button>
          </div>
        </div>

      </div>
      
      <BottomNav active="home" />
    </div>
  );
}
