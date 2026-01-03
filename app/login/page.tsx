"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, Loader2, User, BookOpen, CheckCircle, X } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // New State
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
        setShowSuccessModal(true); // Show styled modal instead of alert
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col justify-between relative overflow-hidden text-text font-sans">
      
      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-surface border border-white/10 p-8 rounded-3xl text-center relative">
            <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-subtext hover:text-white"><X className="w-5 h-5"/></button>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-subtext text-sm mb-6">
              We sent a verification link to <span className="text-white">{email}</span>. Please click it to activate your account.
            </p>
            <button onClick={() => setIsLogin(true)} className="w-full py-3 bg-white text-black font-bold rounded-xl">
              Back to Login
            </button>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-subtext hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-xs font-bold">
          <ArrowLeft className="w-3 h-3" /> HOME
        </Link>
      </div>

      {/* MAIN CARD */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md bg-surface border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl z-10 flex flex-col max-h-[85vh]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Student Terminal</h1>
            <p className="text-subtext text-xs">Access the FUOYE preparation engine.</p>
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5 flex-shrink-0">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-subtext hover:text-white'}`}>Login</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-subtext hover:text-white'}`}>Sign Up</button>
          </div>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs text-center flex-shrink-0">{error}</div>}
          <form className="space-y-4 overflow-y-auto custom-scrollbar pr-2" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div className="relative"><User className="absolute left-4 top-3.5 w-4 h-4 text-subtext" /><input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-secondary transition-all" required /></div>
                <div className="relative"><BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-subtext" /><input type="text" placeholder="Department" value={dept} onChange={(e) => setDept(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-secondary transition-all" required /></div>
              </>
            )}
            <div className="relative"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-subtext" /><input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-primary transition-all" required /></div>
            <div className="relative"><Lock className="absolute left-4 top-3.5 w-4 h-4 text-subtext" /><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-primary transition-all" required /></div>
            <button disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-black font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(160,108,213,0.3)] mt-4 flex justify-center items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Initialize Session' : 'Create Account')}</button>
          </form>
        </div>
      </div>
    </div>
  );
          }
      
