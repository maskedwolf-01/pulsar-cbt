"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Zap, Target, Smartphone, BookOpen, GraduationCap, ArrowRight, 
  CheckCircle, MessageCircle, Phone, Mail, Star, Quote 
} from 'lucide-react';

// --- DATA ---
const REVIEWS = [
  {
    name: "Onipe Joshua",
    dept: "English Education",
    faculty: "Education",
    img: "joshua.jpg",
    quote: "I was drowning in GST 101 notes until I found PULSAR. The 'Rapid Fire' mode didn't just help me memorize; it helped me understand the logic behind Lexis and Structure. I walked into that CBT center feeling like I wrote the exam myself."
  },
  {
    name: "Amuemoje Caleb",
    dept: "Computer Science",
    faculty: "Computing",
    img: "caleb.jpg",
    quote: "As a developer, I'm picky about software. PULSAR is the only platform that matches the actual speed of the FUOYE ICT center. No lag, no glitches. It’s a full simulation. If you want to know exactly how exam day feels, this is it."
  },
  {
    name: "Raji Muzzamil",
    dept: "Geology",
    faculty: "Physical Science",
    img: "raji.jpg",
    quote: "Physics calculations (PHY 101) used to be my nightmare. The step-by-step corrections on this site broke down vectors and motion into simple math I could actually do in my head. I went from fearing the exam to finishing 15 minutes early."
  }
];

// --- COMPONENTS ---

const PulsarLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10v6"/><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M12 22V7"/><path d="m9 14 2.5 2.5 5-5"/>
  </svg>
);

// New "Longitudinal" Vertical Card Design
const ReviewCard = ({ data }: { data: any }) => (
  <div className="min-w-[300px] max-w-[320px] p-8 rounded-[2rem] bg-surface border border-white/10 flex flex-col items-center text-center snap-center relative group hover:border-primary/30 transition-all mx-4">
    
    {/* Avatar bubbling out top */}
    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-primary to-secondary mb-6 shadow-2xl">
      <div className="w-full h-full rounded-full bg-black overflow-hidden">
        <img src={`/${data.img}`} alt={data.name} className="w-full h-full object-cover" />
      </div>
    </div>

    {/* Name & Badge */}
    <h3 className="text-xl font-bold text-white mb-1">{data.name}</h3>
    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-4">{data.dept}</p>

    {/* Stars */}
    <div className="flex gap-1 mb-6">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="w-4 h-4 fill-secondary text-secondary" />
      ))}
    </div>

    {/* Quote */}
    <div className="relative">
      <Quote className="absolute -top-3 -left-2 w-6 h-6 text-white/10" />
      <p className="text-sm leading-relaxed text-subtext italic">
        "{data.quote}"
      </p>
    </div>
  </div>
);

const TeamCard = ({ name, role, desc, img, isFounder }: { name: string, role: string, desc: string, img: string, isFounder?: boolean }) => (
  <div className={`p-6 rounded-2xl border ${isFounder ? 'bg-primary/5 border-primary/30' : 'bg-surface border-white/10'} flex flex-col md:flex-row items-center gap-6`}>
    <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white/10">
      <img src={`/${img}`} alt={name} className="w-full h-full object-cover" />
    </div>
    <div className="text-center md:text-left">
      <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
      <p className={`text-sm font-bold mb-3 uppercase tracking-wider ${isFounder ? 'text-primary' : 'text-secondary'}`}>{role}</p>
      <p className="text-sm text-subtext leading-relaxed">{desc}</p>
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null);

  // Slow Auto-Scroll Logic (8 Seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        // If at end, scroll back to start, else scroll one card width
        const scrollAmount = scrollLeft + clientWidth >= scrollWidth - 10 ? -scrollWidth : 320; 
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 8000); // 8 Seconds Speed
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary selection:text-white overflow-x-hidden scroll-smooth">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-background/90">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg">
              <PulsarLogo className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">PULSAR</span>
          </div>
          <Link href="/login" className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all flex items-center gap-2">
            Student Login
          </Link>
        </div>
      </nav>

      {/* 1. HERO SECTION (RESTORED) */}
      <section className="relative pt-40 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 rounded-full uppercase animate-pulse">
            <CheckCircle className="w-3 h-3" /> OFFICIAL FUOYE PREP ENGINE
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 text-white leading-tight">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">5.0 GP</span> <br/>
            With Precision.
          </h1>
          <p className="text-lg text-subtext mb-10 max-w-2xl mx-auto leading-relaxed">
            Don't just read. <span className="text-white font-bold">Simulate.</span> Experience the exact FUOYE CBT environment. Speed drills, instant corrections, and analytics designed to make you unstoppable.
          </p>
          <div className="flex flex-col md:flex-row gap-5 justify-center items-center">
            <Link href="/login" className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-primary to-purple-700 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(160,108,213,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3 text-lg">
              Start Free Drill 
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#catalogue" className="w-full md:w-auto px-10 py-4 bg-surface border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all text-center text-lg flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5"/> Explore Catalogue
            </a>
          </div>
        </div>
      </section>

      {/* 2. TRUST BADGES (RESTORED) */}
      <section className="py-8 border-y border-white/5 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-sm text-subtext uppercase tracking-widest font-bold">Curriculum Aligned With:</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            <span className="text-xl font-bold text-white">OXFORD</span>
            <span className="text-xl font-bold text-white">CAMBRIDGE</span>
            <span className="text-xl font-bold text-white">NUC NIGERIA</span>
            <span className="text-xl font-bold text-white">BYTECODE</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID (RESTORED) */}
      <section className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-surface border border-white/10 hover:border-primary/40 transition-all">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Zero-Lag Engine</h3>
            <p className="text-subtext leading-relaxed">Faster than the actual university servers. No loading screens, just answers.</p>
          </div>
          <div className="p-8 rounded-3xl bg-surface border border-white/10 hover:border-secondary/40 transition-all">
            <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Surgical Precision</h3>
            <p className="text-subtext leading-relaxed">Instant marking with detailed explanations. We pinpoint exactly why you missed a question.</p>
          </div>
          <div className="p-8 rounded-3xl bg-surface border border-white/10 hover:border-accent/40 transition-all">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Mobile Optimized</h3>
            <p className="text-subtext leading-relaxed">Revision in the shuttle? PULSAR works perfectly on your phone.</p>
          </div>
        </div>
      </section>

      {/* 4. REVIEWS SLIDER (FIXED: SLOW + MANUAL + TALL CARDS) */}
      <section className="py-24 border-y border-white/5 bg-gradient-to-b from-black/40 to-black/0">
        <div className="max-w-7xl mx-auto mb-12 text-center px-6">
          <h2 className="text-3xl font-bold text-white mb-4">Success Stories</h2>
          <p className="text-subtext">Swipe to see how your seniors cleared their papers.</p>
        </div>
        
        {/* Scroll Container: Snap-x allows manual swiping, no-scrollbar hides the bar */}
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory pb-12 px-6 no-scrollbar items-stretch"
          style={{ scrollBehavior: 'smooth' }}
        >
          {REVIEWS.map((review, i) => (
            <ReviewCard key={i} data={review} />
          ))}
        </div>
      </section>

      {/* 5. MEET THE TEAM */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Brains Behind The Code</h2>
        <p className="text-subtext text-center mb-12 max-w-2xl mx-auto">
          From HealthPad Africa to the Faculty of Computing Portal, we build ecosystems.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TeamCard 
            name="Majeed Abdulwali Michael"
            role="Founder & Visionary"
            img="founder.jpg"
            isFounder={true}
            desc="100L Computer Science student and Founder of HealthPad Africa. Majeed combines technical expertise with academic insight to build tools that matter. He leads the vision for PULSAR."
          />
          <TeamCard 
            name="Amuemoje Caleb"
            role="Co-Founder & Lead Dev"
            img="caleb.jpg"
            desc="Co-founder of HealthPad Africa and a brilliant software architect. Caleb ensures PULSAR runs with military-grade precision. His code powers the Faculty of Computing website."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050508] pt-16 pb-8 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <PulsarLogo className="w-6 h-6 text-primary" />
               <h4 className="text-xl font-bold text-white">PULSAR</h4>
            </div>
            <p className="text-sm text-subtext leading-relaxed max-w-sm mx-auto md:mx-0">
              The premier academic acceleration platform designed exclusively for FUOYE students.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="mailto:abdulwalimajeed@gmail.com" className="hover:text-primary flex items-center justify-center md:justify-start gap-2"><Mail className="w-4 h-4"/> abdulwalimajeed@gmail.com</a></li>
              <li><a href="tel:09068206698" className="hover:text-secondary flex items-center justify-center md:justify-start gap-2"><Phone className="w-4 h-4"/> 09068206698</a></li>
              <li><a href="https://wa.me/2349068206698" className="flex items-center justify-center md:justify-start gap-2 hover:text-green-500"><MessageCircle className="w-4 h-4" /> Chat on WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Links</h4>
            <ul className="space-y-2 text-sm text-subtext">
               <li><Link href="/login" className="hover:text-white">Student Terminal</Link></li>
               <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-white/20 pt-8 border-t border-white/5">
          © 2025 PULSAR CBT. All rights reserved.
        </div>
      </footer>
    </div>
  );
      }
    
