"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full opacity-10 blur-[120px]"></div>

      <div className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-2xl backdrop-blur-xl shadow-2xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Identify Yourself</h1>
          <p className="text-subtext text-sm">Enter your matric number to access the terminal.</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-bold text-subtext uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="student@fuoye.edu.ng" 
              className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-subtext uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button 
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-black font-bold text-lg rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(160,108,213,0.3)]"
          >
            Initialize Session
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-subtext text-sm">
            New Student? <Link href="/signup" className="text-secondary hover:underline">Register Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
        }
            
