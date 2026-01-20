"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Zap, Target, BookOpen, ArrowRight, CheckCircle, 
  Copy, ExternalLink, Star, Quote, Mail, Phone, Check 
} from 'lucide-react';

// --- DATA CONFIGURATION ---
const EXAM_LINKS = [
  { code: "MTH 101", title: "Elementary Mathematics I", link: "/exam/mth101" },
  { code: "PHY 101", title: "General Physics I", link: "/exam/phy101" },
  { code: "CHM 101", title: "General Chemistry I", link: "/exam/chm101" },
  { code: "BIO 101", title: "Introductory Biology I", link: "/exam/bio101" },
  { code: "STA 111", title: "Descriptive Statistics", link: "/exam/sta111" },
  { code: "GST 101", title: "Use of English", link: "/exam/gst101" },
  { code: "GST 103", title: "Library & ICT", link: "/exam/gst103" },
  { code: "ENT 101", title: "Entrepreneurship", link: "/exam/ent101" },
  { code: "COS 101", title: "Intro to Computing", link: "/exam/cos101" },
  { code: "GLY 101", title: "Intro to Geology", link: "/exam/gly101" },
];

const REVIEWS = [
  {
    name: "Onipe Joshua",
    dept: "English Education",
    img: "joshua.jpg", 
    quote: "I was drowning in GST 101 notes until I found PULSAR. The 'Rapid Fire' mode didn't just help me memorize; it helped me understand the logic."
  },
  {
    name: "Amuemoje Caleb",
    dept: "Computer Science",
    img: "caaleb.jpg", 
    quote: "PULSAR is the only platform that matches the actual speed of the FUOYE ICT center. No lag, no glitches. It’s a full simulation."
  },
  {
    name: "Raji Muzzamil",
    dept: "Geology",
    img: "raji.jpg", 
    quote: "The step-by-step corrections on this site broke down vectors and motion into simple math I could actually do in my head."
  }
];

const TEAM = [
  {
    name: "Majeed Abdulwali",
    role: "Founder & Visionary",
    img: "founder.jpg",
    desc: "100L Faculty of Computing Governor and also a Computer Science student combining technical expertise with academic insight to build tools that matter."
  },
  {
    name: "Amuemoje Caleb",
    role: "Co-Founder & Lead Dev",
    img: "caaleb.jpg",
    desc: "A brilliant software architect ensuring PULSAR runs with military-grade precision and zero downtime."
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
    <div className="h-full p-8 rounded-2xl bg-[#111113] border border-zinc-800 flex flex-col relative group hover:border-purple-500/30 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg flex-shrink-0 relative overflow-hidden">
           {/* CRASH FIX: Handles missing images gracefully */}
           <img 
             src={`/${data.img}`} 
             alt={data.name} 
             className="w-full h-full rounded-full object-cover border-2 border-[#111113] bg-zinc-800"
             onError={(e) => { e.currentTarget.style.opacity = '0'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
           />
           <div className="hidden absolute inset-0 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-white">
             {data.name[0]}
           </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{data.name}</h3>
          <p className="text-xs text-purple-400 font-bold uppercase tracking-widest">{data.dept}</p>
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500"/>)}
      </div>
      <p className="text-sm leading-relaxed text-zinc-400 italic">"{data.quote}"</p>
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll Reviews
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
    <div className="min-h-screen bg-[#050508] text-white font-sans selection:bg-purple-500/30 selection:text-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-[#050508]/80 supports-[backdrop-filter]:bg-[#050508]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
              <PulsarLogo className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-serif">PULSAR</span>
          </div>
          <div className="flex gap-4">
             <Link href="/login" className="hidden md:flex px-5 py-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
               Login
             </Link>
             <Link href="/login" className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-full text-sm font-bold transition-all flex items-center gap-2">
               Student Portal
             </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden border-b border-white/5">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/4"></div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded-full uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Official FUOYE Prep
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white font-serif leading-[1.1]">
              Academic <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">Excellence</span> <br/>
              Engineered.
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed">
              The premier CBT simulation platform for Federal University Oye-Ekiti. Precision timing, detailed analytics, and the exact 100-level syllabus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Start Drill <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#links" className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center">
                Quick Access
              </Link>
            </div>
          </div>

          {/* Abstract Graphic */}
          <div className="relative h-[450px] w-full bg-zinc-900/30 rounded-3xl border border-white/5 p-4 backdrop-blur-sm hidden md:block shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl"></div>
             {/* UI Representation */}
             <div className="h-full w-full border border-white/5 rounded-2xl bg-[#09090b] p-8 relative overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-10">
                   <div className="h-3 w-32 bg-zinc-800 rounded-full"></div>
                   <div className="h-8 w-24 bg-purple-500/10 rounded-lg border border-purple-500/30 flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                      <div className="w-8 h-2 bg-purple-500/50 rounded-full"></div>
                   </div>
                </div>
                <div className="space-y-4 mb-12">
                   <div className="h-4 w-3/4 bg-zinc-700 rounded-full"></div>
                   <div className="h-4 w-1/2 bg-zinc-800 rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {[1,2,3,4].map(i => (
                      <div key={i} className={`h-14 rounded-xl border flex items-center px-4 ${i===2 ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 bg-zinc-900/50'}`}>
                         <div className={`w-4 h-4 rounded-full border ${i===2 ? 'border-purple-500 bg-purple-500' : 'border-zinc-600'}`}></div>
                      </div>
                   ))}
                </div>
                <div className="absolute bottom-8 right-8 w-48 p-4 bg-zinc-800 rounded-xl border border-zinc-700 shadow-2xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black font-bold"><CheckCircle className="w-6 h-6"/></div>
                   <div>
                      <div className="text-xs text-zinc-400 uppercase font-bold">Score</div>
                      <div className="text-lg font-bold text-white">92%</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
         {/* QUICK ACCESS PORTAL */}
      <section id="links" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/5 pb-8">
             <div>
                <h2 className="text-3xl font-bold text-white font-serif mb-2">Quick Access Portal</h2>
                <p className="text-zinc-400">Direct links to all 100 Level First Semester Exams. Copy & Share.</p>
             </div>
             <div className="hidden md:block text-xs font-mono text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-lg border border-zinc-800">
                pulsar-cbt.vercel.app/exam/[code]
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAM_LINKS.map((exam) => (
              <div key={exam.code} className="group p-5 bg-[#111113] border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900/50 rounded-2xl transition-all flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-400 group-hover:text-white group-hover:bg-purple-600 group-hover:border-purple-500 transition-all">
                       {exam.code.split(' ')[0][0]}
                    </div>
                    <div>
                       <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{exam.code}</div>
                       <div className="text-xs text-zinc-500">{exam.title}</div>
                    </div>
                 </div>
                 <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* FIXED: No alert popup. Icon changes to checkmark. */}
                    <button 
                      onClick={() => handleCopy(exam.link, exam.code)}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all min-w-[36px]"
                      title="Copy Link"
                    >
                       {copiedId === exam.code ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>}
                    </button>
                    <Link href={exam.link} className="p-2 bg-zinc-800 hover:bg-white hover:text-black rounded-lg text-zinc-400 transition-all">
                       <ExternalLink className="w-4 h-4"/>
                    </Link>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-[#111113] border border-zinc-800 hover:border-zinc-700 transition-all group">
            <div className="h-40 w-full mb-8 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
               <Zap className="w-16 h-16 text-purple-500/80 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Zero-Lag Architecture</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Built on the Edge. No loading screens between questions. Just pure speed to match the real exam interface.</p>
          </div>
          <div className="p-8 rounded-3xl bg-[#111113] border border-zinc-800 hover:border-zinc-700 transition-all group">
            <div className="h-40 w-full mb-8 bg-gradient-to-br from-green-900/10 to-emerald-900/10 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
               <Target className="w-16 h-16 text-emerald-500/80 drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Precision Grading</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Instant marking with deep explanations. We don't just tell you you're wrong; we tell you why.</p>
          </div>
          <div className="p-8 rounded-3xl bg-[#111113] border border-zinc-800 hover:border-zinc-700 transition-all group">
            <div className="h-40 w-full mb-8 bg-gradient-to-br from-orange-900/10 to-red-900/10 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
               <BookOpen className="w-16 h-16 text-orange-500/80 drop-shadow-[0_0_25px_rgba(249,115,22,0.4)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Full Syllabus Coverage</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Questions curated from 5 years of FUOYE past records, covering every topic in the 100L curriculum.</p>
          </div>
        </div>
      </section>

      {/* 4. REVIEWS */}
      <section className="py-24 bg-[#0a0a0f] border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex items-center justify-between">
           <h2 className="text-3xl font-bold text-white font-serif">Success Stories</h2>
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

      {/* 5. TEAM */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-white font-serif mb-4">Built By Students, For Students</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TEAM.map((member, i) => (
             <div key={i} className="p-6 rounded-2xl bg-[#111113] border border-zinc-800 flex items-start gap-6 hover:bg-zinc-900/50 transition-colors group">
                <div className="w-24 h-24 rounded-xl flex-shrink-0 border-2 border-zinc-700 overflow-hidden group-hover:border-purple-500 transition-colors">
                    {/* CRASH FIX: Handles missing images gracefully */}
                    <img 
                      src={`/${member.img}`} 
                      alt={member.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                    <div className="hidden w-full h-full bg-zinc-800 flex items-center justify-center font-bold text-white">
                      {member.name[0]}
                    </div>
                </div>
                <div>
                   <h3 className="text-xl font-bold text-white">{member.name}</h3>
                   <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">{member.role}</p>
                   <p className="text-sm text-zinc-400 leading-relaxed">{member.desc}</p>
                </div>
             </div>
          ))}
        </div>
      </section>

      {/* 6. SEO BLOCK */}
      <section className="py-20 bg-zinc-900/30 border-y border-white/5">
         <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-2xl font-serif text-white mb-6">Our Mission</h2>
            <div className="text-lg text-zinc-400 leading-relaxed space-y-4">
               <p>
                  Pulsar CBT is dedicated to democratizing academic success for <strong>Federal University Oye-Ekiti (FUOYE)</strong> students. 
                  We understand the pressure of <strong>100 Level exams</strong>.
               </p>
               <p>
                  That is why we built the definitive <strong>FUOYE Past Questions</strong> database. 
                  Whether you are studying for <span className="text-white">MTH 101, GST 101, PHY 101, or BIO 101</span>, 
                  our platform provides the realistic <strong>CBT practice</strong> environment you need to secure your GPA.
               </p>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="pt-20 pb-10 bg-[#050508] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <div className="flex justify-center items-center gap-3 mb-8">
              <PulsarLogo className="w-6 h-6 text-zinc-600" />
              <span className="text-2xl font-bold text-zinc-700 font-serif">PULSAR</span>
           </div>
           
           <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12 text-sm text-zinc-500 mb-12">
              <Link href="/login" className="hover:text-white transition-colors">Student Terminal</Link>
              <Link href="/courses" className="hover:text-white transition-colors">Course Catalog</Link>
              <a href="mailto:abdulwalimajeed@gmail.com" className="hover:text-white transition-colors flex items-center justify-center gap-2">
                 <Mail className="w-4 h-4"/> abdulwalimajeed@gmail.com
              </a>
              <a href="tel:09068206698" className="hover:text-white transition-colors flex items-center justify-center gap-2">
                 <Phone className="w-4 h-4"/> 09068206698
              </a>
           </div>

           <div className="text-xs text-zinc-800 border-t border-zinc-900 pt-8">
              © 2025 Pulsar CBT. Engineered in Oye-Ekiti.
           </div>
        </div>
      </footer>
    </div>
  );
            }
                         
