"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Zap, Target, BookOpen, ArrowRight, CheckCircle, 
  Copy, ExternalLink, Star, Mail, Phone, Check, 
  BrainCircuit, XCircle, Lightbulb, ChevronRight,
  Quote, Laptop, Smartphone // <-- Added the missing icons here!
} from 'lucide-react';
// --- V2.0 DATA CONFIGURATION ---
const EXAM_LINKS = [
  { code: "MTH 102", title: "Calculus & Geometry", link: "/exam/mth102" },
  { code: "PHY 102", title: "General Physics II", link: "/exam/phy102" },
  { code: "CHM 102", title: "General Chemistry II", link: "/exam/chm102" },
  { code: "BIO 102", title: "General Biology II", link: "/exam/bio102" },
  { code: "STA 112", title: "Probability Theory", link: "/exam/sta112" },
  { code: "GST 102", title: "Use of English II", link: "/exam/gst102" },
  { code: "GST 104", title: "Philosophy & Logic", link: "/exam/gst104" },
  { code: "CSC 102", title: "Intro to Computing II", link: "/exam/csc102" },
];

const REVIEWS = [
  {
    name: "Onipe Joshua",
    dept: "English Education",
    img: "joshua.jpg", 
    quote: "Pulsar 1.0 saved my GPA last semester. The new explanation feature in V2 is going to make studying for GST 102 a breeze."
  },
  {
    name: "Amuemoje Caleb",
    dept: "Computer Science",
    img: "caaleb.jpg", 
    quote: "Zero lag on mobile. The way it breaks down physics calculations step-by-step after you fail a question is a game changer."
  },
  {
    name: "Raji Muzzamil",
    dept: "Geology",
    img: "raji.jpg", 
    quote: "It feels like having a personal tutor. You don't just memorize past questions anymore, you actually understand them."
  }
];

const TEAM = [
  {
    name: "Majeed Abdulwali",
    role: "Founder & Visionary",
    img: "founder.jpg",
    desc: "100L Faculty of Computing Governor. Combining technical expertise with academic insight to build tools that actually matter for students."
  },
  {
    name: "Amuemoje Caleb",
    role: "Co-Founder & Lead Dev",
    img: "caaleb.jpg",
    desc: "Software architect ensuring PULSAR runs with military-grade precision, zero downtime, and seamless cross-device compatibility."
  }
];

// --- COMPONENTS ---

const PulsarLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10v6"/><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M12 22V7"/><path d="m9 14 2.5 2.5 5-5"/>
  </svg>
);

const ReviewCard = ({ data }: { data: any }) => (
  <div className="w-[85vw] md:w-[450px] flex-shrink-0 snap-center p-4">
    <div className="h-full p-8 rounded-2xl bg-[#0a0a0c] border border-white/5 flex flex-col relative group hover:border-indigo-500/30 transition-all duration-300 shadow-xl">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Quote className="w-12 h-12 text-indigo-500" />
      </div>
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg flex-shrink-0 relative overflow-hidden">
           <img 
             src={`/${data.img}`} 
             alt={data.name} 
             className="w-full h-full rounded-full object-cover border-2 border-[#0a0a0c] bg-zinc-800"
             onError={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
           />
           <div className="hidden absolute inset-0 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">
             {data.name[0]}
           </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-wide">{data.name}</h3>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-1">{data.dept}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-4 relative z-10">
        {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/>)}
      </div>
      <p className="text-sm leading-relaxed text-zinc-400 relative z-10">"{data.quote}"</p>
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const scrollTo = scrollLeft + clientWidth >= scrollWidth - 10 ? 0 : scrollLeft + clientWidth;
        sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(`https://pulsar-cbt.vercel.app${text}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
      
      {/* V2 ANNOUNCEMENT BANNER */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 py-2.5 px-4 text-center relative z-50">
        <p className="text-xs md:text-sm font-medium text-white flex items-center justify-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">New</span>
          Welcome to Semester 2. Step-by-step answer explanations are now live!
        </p>
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 w-full z-40 backdrop-blur-xl border-b border-white/5 bg-[#030305]/80 supports-[backdrop-filter]:bg-[#030305]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <PulsarLogo className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-serif">PULSAR<span className="text-indigo-500">.</span></span>
          </div>
          <div className="flex gap-4 items-center">
             <Link href="/login" className="hidden md:flex text-zinc-400 hover:text-white text-sm font-medium transition-colors">
               Sign In
             </Link>
             <Link href="/login" className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-white/5">
               Student Portal <ChevronRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] -z-10 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left animate-fade-in z-10 pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              FUOYE Semester 2 Syllabus
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white font-serif leading-[1.05]">
              Don't Just Practice. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Understand.</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed">
              The V2.0 upgrade is here. Experience zero-lag CBT simulations with an intelligent engine that breaks down every failed question step-by-step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.02]">
                Start Second Semester Drill <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#links" className="px-8 py-4 bg-zinc-900/80 backdrop-blur-md border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center hover:scale-[1.02]">
                Course Catalog
              </Link>
            </div>
          </div>

          {/* V2 Feature Abstract Graphic - Shows Explanation Engine */}
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square bg-[#0a0a0c]/80 rounded-3xl border border-white/5 p-4 backdrop-blur-md hidden md:flex shadow-2xl flex-col justify-center items-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5"></div>
             
             {/* Mock UI Box */}
             <div className="w-[90%] bg-[#121216] border border-white/10 rounded-2xl p-6 relative z-10 shadow-2xl transform rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">Q4</div>
                  <div className="h-4 w-3/4 bg-zinc-800 rounded-full"></div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {/* Wrong Answer */}
                  <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <XCircle className="w-5 h-5 text-rose-500" />
                       <div className="h-3 w-48 bg-rose-500/20 rounded-full"></div>
                    </div>
                    <span className="text-xs font-bold text-rose-500">Your Answer</span>
                  </div>
                  {/* Correct Answer */}
                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <CheckCircle className="w-5 h-5 text-emerald-500" />
                       <div className="h-3 w-40 bg-emerald-500/20 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Explanation Box Teaser */}
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                  <Lightbulb className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Step-by-Step Breakdown</div>
                    <div className="h-2 w-full bg-indigo-500/20 rounded-full"></div>
                    <div className="h-2 w-5/6 bg-indigo-500/20 rounded-full"></div>
                    <div className="h-2 w-4/6 bg-indigo-500/20 rounded-full"></div>
                  </div>
                </div>
             </div>
             
             {/* Floating Elements */}
             <div className="absolute top-10 right-10 w-24 p-3 bg-zinc-900 border border-white/10 rounded-xl shadow-xl animate-bounce-slow flex flex-col items-center gap-2">
                <Target className="w-6 h-6 text-emerald-400"/>
                <div className="text-xs text-zinc-400">Accuracy</div>
                <div className="text-lg font-bold text-white">85%</div>
             </div>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS PORTAL */}
      <section id="links" className="py-24 bg-[#050508] relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/5 pb-8">
             <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white font-serif mb-3">Second Semester Portal</h2>
                <p className="text-zinc-400 text-sm md:text-base">Direct links to 100 Level courses. Optimized for Mobile & PC.</p>
             </div>
             <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-500 bg-[#0a0a0c] px-4 py-2.5 rounded-xl border border-white/5 shadow-inner">
                <Laptop className="w-4 h-4"/> / <Smartphone className="w-4 h-4"/> Responsive Setup
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {EXAM_LINKS.map((exam) => (
              <div key={exam.code} className="group p-5 bg-[#0a0a0c] border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-900/10 rounded-2xl transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-indigo-500/10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#121216] border border-white/5 flex items-center justify-center font-bold text-sm text-zinc-400 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-cyan-500 group-hover:border-transparent transition-all">
                       {exam.code.split(' ')[1]}
                    </div>
                    <div>
                       <div className="font-bold text-white group-hover:text-indigo-300 transition-colors">{exam.code}</div>
                       <div className="text-xs text-zinc-500 mt-0.5">{exam.title}</div>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy(exam.link, exam.code)}
                      className="p-2.5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white transition-all"
                      title="Copy Link"
                    >
                       {copiedId === exam.code ? <Check className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
                    </button>
                    <Link href={exam.link} className="p-2.5 bg-white/5 hover:bg-white hover:text-black rounded-xl text-zinc-400 transition-all hidden md:block">
                       <ExternalLink className="w-4 h-4"/>
                    </Link>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* V2 FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-[#0a0a0c] border border-white/5 hover:border-white/10 transition-all group shadow-lg">
            <div className="w-14 h-14 mb-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center">
               <BrainCircuit className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">The Explanation Engine</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Stop guessing. When you fail a question, V2 breaks down the theory or formula step-by-step so you never miss it again.</p>
          </div>
          <div className="p-8 rounded-3xl bg-[#0a0a0c] border border-white/5 hover:border-white/10 transition-all group shadow-lg">
            <div className="w-14 h-14 mb-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-center justify-center">
               <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Cross-Platform Speed</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Built for mobile studying. The UI scales perfectly to your phone, maintaining zero latency between questions.</p>
          </div>
          <div className="p-8 rounded-3xl bg-[#0a0a0c] border border-white/5 hover:border-white/10 transition-all group shadow-lg">
            <div className="w-14 h-14 mb-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center">
               <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Targeted Analytics</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Track your win rate across different courses. Identify your weak topics before you step into the ICT center.</p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 bg-[#050508] border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
           <div>
             <h2 className="text-3xl font-bold text-white font-serif mb-2">Student Testimonials</h2>
             <p className="text-zinc-500 text-sm">Join hundreds of FUOYE students securing their GPAs.</p>
           </div>
        </div>
        <div 
          ref={sliderRef}
          className="flex overflow-x-auto snap-x snap-mandatory pb-12 no-scrollbar px-6 md:px-[max(calc((100vw-1280px)/2),1.5rem)]"
          style={{ scrollBehavior: 'smooth' }}
        >
          {REVIEWS.map((review, i) => (
            <ReviewCard key={i} data={review} />
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-white font-serif mb-4">Engineered in Oye-Ekiti</h2>
           <p className="text-zinc-500">Built by students who understand the academic pressure.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM.map((member, i) => (
             <div key={i} className="p-6 rounded-3xl bg-[#0a0a0c] border border-white/5 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 hover:bg-white/[0.02] transition-colors group">
                <div className="w-24 h-24 rounded-2xl flex-shrink-0 border-2 border-white/10 overflow-hidden group-hover:border-indigo-500 transition-colors">
                    <img 
                      src={`/${member.img}`} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                    <div className="hidden w-full h-full bg-[#121216] flex items-center justify-center font-bold text-white text-2xl">
                      {member.name[0]}
                    </div>
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white">{member.name}</h3>
                   <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 mt-1">{member.role}</p>
                   <p className="text-sm text-zinc-400 leading-relaxed">{member.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-20 pb-10 bg-[#030305] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <div className="flex justify-center items-center gap-3 mb-8">
              <PulsarLogo className="w-7 h-7 text-zinc-600" />
              <span className="text-3xl font-bold text-zinc-700 font-serif">PULSAR</span>
           </div>
           
           <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 text-sm text-zinc-500 mb-12">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="#links" className="hover:text-white transition-colors">Course Catalog</Link>
              <a href="mailto:abdulwalimajeed@gmail.com" className="hover:text-white transition-colors flex items-center justify-center gap-2">
                 <Mail className="w-4 h-4"/> abdulwalimajeed@gmail.com
              </a>
              <a href="tel:09068206698" className="hover:text-white transition-colors flex items-center justify-center gap-2">
                 <Phone className="w-4 h-4"/> 09068206698
              </a>
           </div>

           <div className="text-xs text-zinc-700 border-t border-white/5 pt-8">
              © {new Date().getFullYear()} Pulsar CBT. V2.0 Built by Majeed & Caleb.
           </div>
        </div>
      </footer>
    </div>
  );
}
