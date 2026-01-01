"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, User, Lock, BookOpen } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    // h-[100dvh] ensures it fits mobile screens perfectly without scrolling
    <div className="h-[100dvh] bg-background flex flex-col justify-between relative overflow-hidden text-text font-sans">
      
      {/* 1. TOP BAR */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-subtext hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 text-xs font-bold">
          <ArrowLeft className="w-3 h-3" /> HOME
        </Link>
      </div>

      {/* 2. MAIN CARD SECTION */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background Glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-primary rounded-full opacity-10 blur-[100px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-secondary rounded-full opacity-10 blur-[100px]"></div>
        
        <div className="w-full max-w-md bg-surface border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl z-10 flex flex-col max-h-[80vh]">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Student Terminal</h1>
            <p className="text-subtext text-xs">Access the FUOYE preparation engine.</p>
          </div>

          {/* TOGGLE SWITCH */}
          <div className="flex bg-black/40 p-1 rounded-xl mb-6 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-subtext hover:text-white'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white/10 text-white shadow-lg' : 'text-subtext hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          {/* FORM AREA (Scrollable if needed) */}
          <form className="space-y-4 overflow-y-auto pr-2 custom-scrollbar" onSubmit={(e) => e.preventDefault()}>
            
            {/* Signup Fields (Only show if !isLogin) */}
            {!isLogin && (
              <div className="space-y-4 animate-fade-in">
                 <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-subtext" />
                  <input type="text" placeholder="Full Name" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-secondary transition-all placeholder:text-white/20"/>
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-subtext" />
                  <input type="text" placeholder="Department (e.g. CSC)" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-secondary transition-all placeholder:text-white/20"/>
                </div>
              </div>
            )}

            {/* Common Fields */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-subtext" />
              <input type="email" placeholder="Email Address" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"/>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-subtext" />
              <input type="password" placeholder="Password" className="w-full bg-black/30 border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"/>
            </div>

            <button className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-black font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(160,108,213,0.3)] mt-2">
              {isLogin ? 'Initialize Session' : 'Create Account'}
            </button>
          </form>

        </div>
      </div>

      {/* 3. STICKY FOOTER */}
      <div className="py-4 border-t border-white/5 bg-black/40 text-center backdrop-blur-md">
        <p className="text-[10px] text-subtext mb-2 uppercase tracking-widest">Having Trouble?</p>
        <div className="flex justify-center gap-6 text-xs text-white">
          <a href="mailto:abdulwalimajeed@gmail.com" className="flex items-center gap-1.5 hover:text-primary"><Mail className="w-3 h-3"/> Support</a>
          <a href="https://wa.me/2349068206698" className="flex items-center gap-1.5 hover:text-secondary"><Phone className="w-3 h-3"/> WhatsApp</a>
        </div>
      </div>
    </div>
  );
      }
        
