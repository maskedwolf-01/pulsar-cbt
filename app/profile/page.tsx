"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, BookOpen, LogOut, Save, Loader2, Camera } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [dept, setDept] = useState('');
  const [level, setLevel] = useState('100L');
  const router = useRouter();

  // 1. Fetch User Data on Load
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Try fetching from 'profiles' table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || '');
        setDept(profile.department || '');
        setLevel(profile.level || '100L');
      } else {
        // Fallback: If profile missing, use Auth metadata
        setFullName(user.user_metadata.full_name || '');
        setDept(user.user_metadata.department || '');
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  // 2. Save Changes
  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        email: user.email,
        full_name: fullName, 
        department: dept, 
        level: level 
      });

    if (!error) {
      alert("Profile updated successfully!");
    } else {
      alert("Error updating profile.");
    }
    setSaving(false);
  };

  // 3. Logout Logic
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary"><Loader2 className="w-8 h-8 animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background text-text font-sans p-6 pb-24">
      
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-surface border border-white/10 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <h1 className="text-xl font-bold text-white">My Profile</h1>
      </header>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 relative mb-4">
          <div className="w-full h-full bg-surface rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
            {fullName ? fullName.charAt(0) : <User className="w-10 h-10"/>}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg border-2 border-background">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <p className="text-white font-bold text-lg">{fullName || "Update Your Name"}</p>
        <p className="text-subtext text-sm">{user?.email}</p>
      </div>

      {/* Form Section */}
      <div className="space-y-4 max-w-md mx-auto">
        <div className="p-4 bg-surface border border-white/10 rounded-2xl space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-xs text-subtext uppercase font-bold ml-1 mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-subtext" />
              <input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="text-xs text-subtext uppercase font-bold ml-1 mb-1 block">Department</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-subtext" />
              <input 
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          {/* Level Selector */}
          <div>
            <label className="text-xs text-subtext uppercase font-bold ml-1 mb-1 block">Level</label>
            <div className="grid grid-cols-4 gap-2">
              {['100L', '200L', '300L', '400L'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${level === l ? 'bg-primary text-white' : 'bg-black/30 text-subtext border border-white/10 hover:border-white/30'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5"/> Save Changes</>}
        </button>

        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-5 h-5"/> Log Out
        </button>
      </div>
    </div>
  );
}
  
