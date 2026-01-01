"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-between relative overflow-hidden text-text font-sans">
      
      {/* 1. BACK NAVIGATION */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-subtext hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* 2. LOGIN FORM SECTION */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background Effects */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full opacity-10 blur-[120px]"></div>
        
        <div className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Student Terminal</h1>
            <p className="text-subtext text-sm">Enter your matric number to access the exam.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold text-subtext uppercase tracking-wider mb-2">Email / Matric No</label>
              <input type="email" placeholder="student@fuoye.edu.ng" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-subtext uppercase tracking-wider mb-2">Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"/>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-black font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(160,108,213,0.3)]">
              Initialize Session
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-subtext">
            First time? <span className="text-secondary cursor-pointer hover:underline">Create an account</span>
          </div>
        </div>
      </div>

      {/* 3. CONSISTENT FOOTER */}
      <div className="py-6 border-t border-white/5 bg-black/40 text-center">
        <p className="text-xs text-subtext mb-2">Need help logging in?</p>
        <div className="flex justify-center gap-6 text-xs text-white">
          <a href="mailto:abdulwalimajeed@gmail.com" className="flex items-center gap-2 hover:text-primary"><Mail className="w-3 h-3"/> Support</a>
          <a href="https://wa.me/2349068206698" className="flex items-center gap-2 hover:text-secondary"><Phone className="w-3 h-3"/> WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
