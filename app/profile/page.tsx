"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, User, BookOpen, LogOut, Save, 
  Loader2, Camera, Bell, X, CheckCircle, AlertTriangle 
} from 'lucide-react';

// --- COMPONENTS ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-fade-in ${
    type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'
  }`}>
    {type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertTriangle className="w-5 h-5"/>}
    <span className="font-bold text-sm">{message}</span>
    <button onClick={onClose}><X className="w-4 h-4 opacity-50 hover:opacity-100"/></button>
  </div>
);

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Data State
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('');
  const [level, setLevel] = useState('100L');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // UI State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch Data
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      if (profile) {
        setFullName(profile.full_name || '');
        setDept(profile.department || '');
        setLevel(profile.level || '100L');
        setAvatarUrl(profile.avatar_url || null);
      } else {
        setFullName(user.user_metadata.full_name || '');
        setDept(user.user_metadata.department || '');
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  // Image Upload
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

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, avatar_url: publicUrl });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setToast({ msg: "Profile picture updated!", type: 'success' });
      
    } catch (error: any) {
      setToast({ msg: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Text Update
  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email,
        full_name: fullName, 
        department: dept, 
        level: level,
        updated_at: new Date()
      });

    if (!error) {
      setToast({ msg: "Profile details saved.", type: 'success' });
    } else {
      setToast({ msg: "Failed to save profile.", type: 'error' });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><Loader2 className="w-8 h-8 animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background text-text font-sans p-6 pb-24 relative">
      
      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="flex items-center justify-between mb-8 z-20 relative">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-surface border border-white/10 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </div>
      </header>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary p-1 relative mb-4 shadow-2xl">
          <div className="w-full h-full bg-surface rounded-full flex items-center justify-center text-4xl font-bold text-white overflow-hidden relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              fullName ? fullName.charAt(0).toUpperCase() : <User className="w-10 h-10"/>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg border-4 border-background hover:scale-110 transition-transform active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarUpload}
          />
        </div>
        <h2 className="text-white font-bold text-xl">{fullName || "Student"}</h2>
        <p className="text-subtext text-sm flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-md mx-auto">
        <div className="p-6 bg-surface border border-white/10 rounded-3xl space-y-5">
          
          <div>
            <label className="text-[10px] text-subtext uppercase font-bold ml-1 mb-2 block tracking-widest">Display Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-subtext group-focus-within:text-primary transition-colors" />
              <input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white text-sm focus:border-primary focus:outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-subtext uppercase font-bold ml-1 mb-2 block tracking-widest">Department</label>
            <div className="relative group">
              <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-subtext group-focus-within:text-primary transition-colors" />
              <input 
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white text-sm focus:border-primary focus:outline-none transition-all"
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-subtext uppercase font-bold ml-1 mb-2 block tracking-widest">Academic Level</label>
            <div className="grid grid-cols-4 gap-2">
              {['100L', '200L', '300L', '400L'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${level === l ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-black/30 text-subtext border border-white/10 hover:border-white/30'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5"/> Save Profile</>}
        </button>

        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 bg-red-500/5 text-red-500 border border-red-500/20 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5"/> Log Out
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-sm bg-surface border border-white/10 p-6 rounded-3xl text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Sign Out?</h3>
            <p className="text-subtext text-sm mb-6">You will need to sign in again to access your dashboard.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold">Cancel</button>
              <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/20">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }
        
