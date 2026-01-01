"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Zap, Target, Smartphone, BookOpen, GraduationCap, ArrowRight, 
  CheckCircle, MessageCircle, Phone, Mail, Star, Quote 
} from 'lucide-react';

// --- DATA: REVIEWS & TEAM ---
const REVIEWS = [
  {
    name: "Onipe Joshua",
    dept: "English Education",
    faculty: "Education",
    img: "joshua.jpg",
    quote: "I was drowning in GST 101 notes until I found PULSAR. The 'Rapid Fire' mode didn't just help me memorize; it helped me understand the logic behind Lexis and Structure. I walked into that CBT center feeling like I wrote the exam myself. Cleared with an A!"
  },
  {
    name: "Amuemoje Caleb",
    dept: "Computer Science",
    faculty: "Computing",
    img: "caleb.jpg",
    quote: "As a developer, I'm picky about software. PULSAR is the only platform that matches the actual speed of the FUOYE ICT center. No lag, no glitches. It’s a full simulation. If you want to know exactly how exam day feels before it happens, this is it."
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

const AutoSlideReviews = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 6000); // Changes every 6 seconds
    return () => clearInterval(timer);
  }, []);

  const active = REVIEWS[index];

  return (
    <div className="relative w-full max-w-4xl mx-auto min-h-[400px] flex items-center justify-center">
      <div className="w-full p-8 md:p-12 rounded-3xl bg-surface border border-white/10 relative flex flex-col items-center text-center transition-all duration-700 ease-in-out transform">
        
        {/* Animated Avatar */}
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-secondary to-primary mb-6 shadow-xl relative overflow-hidden">
           <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
             <img src={`/${active.img}`} alt={active.name} className="w-full h-full object-cover" />
           </div>
        </div>

        {/* Name Badge */}
        <div className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1 rounded-full text-sm font-bold mb-2 animate-fade-in">
          {active.name}
        </div>
        <p className="text-xs text-subtext uppercase tracking-widest mb-6">{active.dept} • {active.faculty}</p>

        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 fill-secondary text-secondary" />
          ))}
        </div>

        {/* Quote */}
        <div className="relative max-w-2xl">
          <Quote className="absolute -top-6 -left-6 w-8 h-8 text-white/10" />
          <p className="text-base md:text-lg leading-relaxed text-white/90 italic relative z-10 transition-opacity duration-500">
            "{active.quote}"
          </p>
          <Quote className="absolute -bottom-6 -right-6 w-8 h-8 text-white/10 rotate-180" />
        </div>

        {/* Dots Indicator */}
        <div className="flex gap-2 mt-8">
          {REVIEWS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-primary' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const TeamCard = ({ name, role, desc, img, isFounder }: { name: string, role: string, desc: string, img: string, isFounder?: boolean }) => (
  <div className={`p-6 rounded-2xl border ${isFounder ? 'bg-primary/5 border-primary/30' : 'bg-surface border-white/10'} flex flex-col md:flex-row items-center gap-6 group hover:border-primary/50 transition-all`}>
    <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:scale-105 transition-transform duration-500">
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

      {/* HERO */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 rounded-full uppercase animate-pulse">
          <CheckCircle className="w-3 h-3" /> FUOYE 100L First Semester
        </div>
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 text-white">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Frequency</span>
        </h1>
        <p className="text-lg text-subtext mb-10 max-w-xl mx-auto">
          The official 100 Level CBT preparation engine. Built by FUOYE students, for FUOYE students.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(160,108,213,0.4)]">
            Start Practice Free 🚀
          </Link>
        </div>
      </section>

      {/* AUTO-SLIDING REVIEWS */}
      <section className="py-24 bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Student Success Stories</h2>
          <p className="text-subtext">Real feedback from scholars who transformed their GPAs.</p>
        </div>
        <AutoSlideReviews />
      </section>

      {/* MEET THE TEAM */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-4">Brains Behind The Code</h2>
        <p className="text-subtext text-center mb-12 max-w-2xl mx-auto">
          We don't just build websites; we build ecosystems. From HealthPad Africa to the Faculty of Computing Portal.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TeamCard 
            name="Majeed Abdulwali Michael"
            role="Founder & Visionary"
            img="founder.jpg"
            isFounder={true}
            desc="100L Computer Science student and Founder of HealthPad Africa. Majeed combines technical expertise with academic insight to build tools that matter. He leads the vision for PULSAR and the upcoming Faculty of Computing portal."
          />
          <TeamCard 
            name="Amuemoje Caleb"
            role="Co-Founder & Lead Dev"
            img="caleb.jpg"
            desc="Co-founder of HealthPad Africa and a brilliant software architect. Caleb ensures PULSAR runs with military-grade precision. His code powers the Faculty of Computing website and ensures your exam simulation is glitch-free."
          />
        </div>
      </section>

      {/* FOOTER (Restored Grid Layout) */}
      <footer className="border-t border-white/10 bg-[#050508] pt-16 pb-8 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <PulsarLogo className="w-6 h-6 text-primary" />
               <h4 className="text-xl font-bold text-white">PULSAR</h4>
            </div>
            <p className="text-sm text-subtext leading-relaxed max-w-sm mx-auto md:mx-0">
              The premier academic acceleration platform designed exclusively for FUOYE students. Bridging the gap between preparation and excellence.
            </p>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h4 className="font-bold text-white mb-6">Direct Contact</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="mailto:abdulwalimajeed@gmail.com" className="hover:text-primary flex items-center justify-center md:justify-start gap-2"><Mail className="w-4 h-4"/> abdulwalimajeed@gmail.com</a></li>
              <li><a href="tel:09068206698" className="hover:text-secondary flex items-center justify-center md:justify-start gap-2"><Phone className="w-4 h-4"/> 09068206698</a></li>
              <li>
                 <a href="https://wa.me/2349068206698" className="flex items-center justify-center md:justify-start gap-2 hover:text-green-500">
                   <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                 </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div>
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-2 text-sm text-subtext">
               <li><Link href="/login" className="hover:text-white">Student Terminal</Link></li>
               <li>Terms of Service</li>
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
