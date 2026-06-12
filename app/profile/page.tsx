"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';
import { 
  ArrowLeft, User, BookOpen, LogOut, Save, 
  Loader2, Camera, CheckCircle, AlertTriangle, X
} from 'lucide-react';

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border animate-fade-in-up ${
    type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400'
  }`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
    <span className="font-bold text-sm tracking-wide">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-2"><X className="w-4 h-4"/></button>
  </div>
);

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('');
  const [level, setLevel] = useState('100L');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setFullName(profile.full_name || '');
        setDept(profile.department || '');
        setLevel(profile.level || '100L');
        setAvatarUrl(profile.avatar_url || null);
      } else {
        setFullName(user.user_metadata?.full_name || '');
        setDept(user.user_metadata?.department || '');
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleAvatarUpload = async (event: any) => {
    try {
      setSaving(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: publicUrl });
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      setToast({ msg: "Profile picture successfully updated!", type: 'success' });
    } catch (error: any) {
      setToast({ msg: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({ 
        id: user.id, email: user.email, full_name: fullName, department: dept, level: level, updated_at: new Date()
      });
    if (!error) {
      setToast({ msg: "Profile settings saved securely.", type: 'success' });
    } else {
      setToast({ msg: "Failed to save profile.", type: 'error' });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#030305] flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-indigo-500"/></div>;

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans pb-24 relative selection:bg-indigo-500/30 overflow-x-hidden">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* HEADER SECTION */}
      <header className="px-6 pt-6 pb-4 flex items-center justify-between z-20 relative max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2.5 bg-[#0a0a0c] border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white font-serif tracking-tight">Account Settings</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-4 animate-fade-in">
        
        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center mb-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-[2px] relative mb-5 shadow-[0_0_30px_rgba(99,102,241,0.2)] group">
            <div className="w-full h-full bg-[#121216] rounded-[1.4rem] flex items-center justify-center text-4xl font-bold text-zinc-400 overflow-hidden relative">
              {avatarUrl ? ( 
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> 
              ) : ( 
                fullName ? fullName.charAt(0).toUpperCase() : <User className="w-12 h-12"/> 
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-3 -right-3 p-3 bg-indigo-600 text-white rounded-xl shadow-lg border-4 border-[#030305] hover:bg-indigo-500 hover:scale-105 transition-all active:scale-95">
              <Camera className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </div>
          <h2 className="text-white font-bold text-2xl tracking-tight">{fullName || "Student"}</h2>
          <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* PROFILE FORM */}
        <div className="space-y-6">
          <div className="p-6 md:p-8 bg-[#0a0a0c] border border-white/5 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
            
            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold ml-1 mb-2 block tracking-wider">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#121216] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700" placeholder="Enter your full name" />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold ml-1 mb-2 block tracking-wider">Department</label>
              <div className="relative group">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                <input value={dept} onChange={(e) => setDept(e.target.value)} className="w-full bg-[#121216] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700" placeholder="e.g. Computer Science" />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase font-bold ml-1 mb-3 block tracking-wider">Academic Level</label>
              <div className="grid grid-cols-4 gap-2">
                {['100L', '200L', '300L', '400L'].map((l) => (
                  <button 
                    key={l} 
                    onClick={() => setLevel(l)} 
                    className={`py-3 rounded-xl text-xs font-bold transition-all duration-300 ${level === l ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-[#121216] text-zinc-500 border border-white/5 hover:border-white/20 hover:text-white'}`}
                  > 
                    {l} 
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleUpdate} disabled={saving} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-70">
            {saving ? <><Loader2 className="w-5 h-5 animate-spin text-black"/> Saving changes...</> : <><Save className="w-5 h-5"/> Save Profile Settings</>}
          </button>
          
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors">
            <LogOut className="w-5 h-5"/> Sign Out
          </button>
        </div>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-[#0a0a0c] border border-white/10 p-8 rounded-3xl text-center shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-serif tracking-tight">Sign Out?</h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">You will need to sign in again to access your dashboard and practice exams.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white font-bold transition-colors">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-colors">Log Out</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="profile" />
    </div>
  );
}
