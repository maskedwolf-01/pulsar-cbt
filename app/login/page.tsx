"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Mail, Lock, Loader2, User, BookOpen, 
  CheckCircle, X, Calculator, Atom, FlaskConical, 
  Cpu, BrainCircuit, Zap, Globe, Activity, Microscope
} from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: fullName, department: dept } }
        });
        if (error) throw error;
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Icons used for the background watermark pattern
  const WatermarkIcons = [Calculator, Atom, FlaskConical, Cpu, BookOpen, BrainCircuit, Zap, Globe, Activity, Microscope];

  return (
    <div className="min-h-[100dvh] bg-[#030305] flex flex-col justify-between relative overflow-hidden text-white font-sans selection:bg-indigo-500/30">
      
      {/* V2.0 WATERMARK BACKGROUND PATTERN */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-[0.02]">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-16 md:gap-24 transform -rotate-12 scale-[1.5] md:scale-125">
          {Array.from({ length: 72 }).map((_, i) => {
            const Icon = WatermarkIcons[i % WatermarkIcons.length];
            return <Icon key={i} className="w-16 h-16 text-white" />;
          })}
        </div>
      </div>

      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full max-h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-[#0a0a0c] border border-white/10 p-8 rounded-3xl text-center relative shadow-2xl animate-fade-in-up">
            <button onClick={() => setShowSuccessModal(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-xl"><X className="w-5 h-5"/></button>
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-serif">Check Your Email</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              We sent a verification link to <span className="text-white font-medium">{email}</span>. Please click it to activate your account.
            </p>
            <button onClick={() => { setShowSuccessModal(false); setIsLogin(true); }} className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-colors shadow-lg">
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-[#0a0a0c]/80 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/5 text-xs font-bold uppercase tracking-wider shadow-md">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>

      {/* MAIN AUTH CARD */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 my-16 md:my-0">
        <div className="w-full max-w-md bg-[#0a0a0c]/80 border border-white/5 p-8 md:p-10 rounded-[2rem] backdrop-blur-2xl shadow-2xl flex flex-col max-h-[90vh]">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight">Student Portal</h1>
            <p className="text-zinc-500 text-sm">Access your practice exams and dashboard.</p>
          </div>
          
          {/* TOGGLE SWITCH */}
          <div className="flex bg-[#121216] p-1.5 rounded-2xl mb-8 border border-white/5 flex-shrink-0 shadow-inner">
            <button 
              onClick={() => { setIsLogin(true); setError(null); }} 
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(null); }} 
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Create Account
            </button>
          </div>
          
          {/* ERROR ALERT */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-start gap-3 flex-shrink-0 animate-fade-in">
               <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
               <span className="leading-relaxed">{error}</span>
            </div>
          )}
          
          {/* FORM */}
          <form className="space-y-4 overflow-y-auto custom-scrollbar pr-2" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#121216] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700" required />
                </div>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input type="text" placeholder="Department (e.g. Computer Science)" value={dept} onChange={(e) => setDept(e.target.value)} className="w-full bg-[#121216] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700" required />
                </div>
              </>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
              <input type="email" placeholder="School or Personal Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#121216] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700" required />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#121216] border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700" required />
            </div>
            
            <button 
              disabled={loading} 
              className="w-full py-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] mt-6 flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:bg-indigo-600"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
