import Link from 'next/link';
import { 
  Zap, Target, Smartphone, BookOpen, GraduationCap, ArrowRight, 
  CheckCircle, MessageCircle, Phone, Mail, Star, Quote 
} from 'lucide-react';

// --- 1. Custom Logo Component ---
const PulsarLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10v6"/><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M12 22V7"/><path d="m9 14 2.5 2.5 5-5"/>
  </svg>
);

// --- 2. Testimonial Card Component ---
const TestimonialCard = ({ name, dept, level, quote }: { name: string, dept: string, level: string, quote: string }) => (
  <div className="min-w-[300px] md:min-w-[400px] p-6 md:p-8 rounded-2xl bg-surface border border-white/10 relative flex-shrink-0 snap-center group hover:border-primary/30 transition-all">
    <Quote className="absolute top-6 right-6 w-8 h-8 text-white/10 group-hover:text-primary/20 transition-colors" />
    <div className="flex items-center gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="w-4 h-4 fill-accent text-accent" />
      ))}
    </div>
    <p className="text-sm leading-relaxed text-white mb-6 italic">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
        {name.charAt(0)}
      </div>
      <div>
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-xs text-subtext">{dept} • {level} Level</p>
      </div>
    </div>
  </div>
);

// --- 3. MAIN PAGE COMPONENT ---
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary selection:text-white overflow-x-hidden scroll-smooth">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-background/90">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(160,108,213,0.4)]">
              <PulsarLogo className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">PULSAR</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-subtext">
            <a href="#features" className="hover:text-white transition-colors">Why Us</a>
            <a href="#courses" className="hover:text-white transition-colors">Courses</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <Link href="/login" className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-white transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
            <GraduationCap className="w-4 h-4" />
            Login Terminal
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest text-secondary bg-secondary/10 border border-secondary/20 rounded-full uppercase animate-pulse">
            <CheckCircle className="w-3 h-3" />
            Official FUOYE Prep Engine
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 text-white leading-tight">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-secondary drop-shadow-[0_0_10px_rgba(160,108,213,0.4)]">5.0 GP</span> <br/>
            With Precision.
          </h1>
          <p className="text-lg md:text-xl text-subtext mb-12 max-w-2xl mx-auto leading-relaxed">
            Don't just read. <span className="text-white font-bold">Simulate.</span> Experience the exact FUOYE CBT environment. Speed drills, instant corrections, and analytics designed to make you unstoppable.
          </p>
          <div className="flex flex-col md:flex-row gap-5 justify-center items-center">
            <Link href="/login" className="group w-full md:w-auto px-10 py-4 bg-gradient-to-r from-primary to-purple-700 text-white font-bold rounded-xl shadow-[0_0_40px_rgba(160,108,213,0.5)] hover:shadow-[0_0_60px_rgba(160,108,213,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-3 text-lg">
              Start Free Drill 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#courses" className="w-full md:w-auto px-10 py-4 bg-surface border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all text-center text-lg flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5"/> Explore Catalogue
            </a>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS */}
      <section className="py-8 border-y border-white/5 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <p className="text-sm text-subtext uppercase tracking-widest font-bold">Curriculum Aligned With Standards From:</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="text-xl font-serif font-bold text-white">OXFORD</div>
            <div className="text-xl font-serif font-bold text-white">CAMBRIDGE</div>
            <div className="text-xl font-bold text-white flex items-center gap-1"><span className="text-green-500">NUC</span> NIGERIA</div>
            <div className="text-xl font-bold text-white flex items-center gap-1"><span className="text-blue-500">NACOS</span> NATIONAL</div>
            <div className="text-xl font-mono font-bold text-white">BYTECODE</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-black/20 relative">
         <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-surface border border-white/10 hover:border-primary/40 transition-all group">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(160,108,213,0.2)]">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Zero-Lag Engine</h3>
            <p className="text-subtext leading-relaxed">Our servers are optimized for speed. We are faster than the actual university servers. No loading screens, just answers.</p>
          </div>
          <div className="p-8 rounded-2xl bg-surface border border-white/10 hover:border-secondary/40 transition-all group">
            <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(0,245,212,0.2)]">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Surgical Precision</h3>
            <p className="text-subtext leading-relaxed">Instant marking with detailed explanations. We pinpoint exactly why you missed a question so you never miss it again.</p>
          </div>
          <div className="p-8 rounded-2xl bg-surface border border-white/10 hover:border-accent/40 transition-all group">
            <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(255,137,6,0.2)]">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Anywhere Access</h3>
            <p className="text-subtext leading-relaxed">Revision in the shuttle? In the long queue? PULSAR is perfectly optimized for mobile. Your study doesn't stop.</p>
          </div>
        </div>
      </section>

      {/* COURSE CATALOG */}
      <section id="courses" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-bold text-white mb-4">Supported 100L Courses</h2>
             <p className="text-subtext">Comprehensive databases for First Semester.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-surface border border-white/10 rounded-2xl hover:border-primary/50 transition-all group cursor-pointer hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden">
              <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors mb-2">General Studies</h3>
              <p className="text-sm text-subtext mb-8">Compulsory university-wide courses.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">GST 101</span><span className="tag">GST 103</span><span className="tag">ENT 101</span>
              </div>
            </div>
            <div className="p-8 bg-surface border border-white/10 rounded-2xl hover:border-secondary/50 transition-all group cursor-pointer hover:shadow-2xl hover:shadow-secondary/10 relative overflow-hidden">
              <h3 className="text-2xl font-bold text-white group-hover:text-secondary transition-colors mb-2">Science Cores</h3>
              <p className="text-sm text-subtext mb-8">Foundation for Science & Engineering.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">BIO 101</span><span className="tag">CHM 101</span><span className="tag">PHY 101</span>
              </div>
            </div>
            <div className="p-8 bg-surface border border-white/10 rounded-2xl hover:border-accent/50 transition-all group cursor-pointer hover:shadow-2xl hover:shadow-accent/10 relative overflow-hidden">
              <h3 className="text-2xl font-bold text-white group-hover:text-accent transition-colors mb-2">Math & Computational</h3>
              <p className="text-sm text-subtext mb-8">Logical and analytical foundations.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">MTH 101</span><span className="tag">CSC 101</span><span className="tag">STA 111</span>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* SLIDING TESTIMONIALS */}
      <section id="reviews" className="py-24 bg-black/30 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Hear From The Scholars</h2>
          <p className="text-subtext">Real feedback from FUOYE students who crushed their exams.</p>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-6 no-scrollbar">
          <TestimonialCard 
            name="Adebayo T." dept="Computer Science" level="200L"
            quote="Honestly, the speed of this platform is insane. The actual GST exam felt slow compared to my practice on PULSAR. I cleared MTH 101 because of the rapid-fire drills here."
          />
          <TestimonialCard 
            name="Chidinma O." dept="Microbiology" level="100L"
            quote="I was so scared of BIO 101 until I found this site. The explanations for the corrections are better than my textbook. It teaches you the concept. Got a 4.8 GPA!"
          />
           <TestimonialCard 
            name="Emmanuel K." dept="Mechatronics" level="300L"
            quote="I wish this existed when I was in 100 level. The interface is exactly like the one in the ICT center, so on exam day, I wasn't nervous at all. Best preparation tool."
          />
           <TestimonialCard 
            name="Zainab A." dept="Economics" level="100L"
            quote="PULSAR changed the game for my GSTs. The questions are very accurate to past questions, and the mobile view is perfect for studying on the bus to campus."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="border-t border-white/10 bg-[#050508] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center text-white">
                <PulsarLogo className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-2xl font-extrabold text-white tracking-tight">PULSAR</h4>
            </div>
            <p className="text-subtext leading-relaxed max-w-md mb-8">
              The premier academic acceleration platform designed exclusively for FUOYE students. We bridge the critical gap between preparation and excellence through advanced simulation technology.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg text-white mb-6">Direct Contact</h4>
            <ul className="space-y-5">
              <li>
                <a href="mailto:abdulwalimajeed@gmail.com" className="group flex items-center gap-3 text-subtext hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-4 h-4 text-primary"/>
                  </div>
                  abdulwalimajeed@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+2349068206698" className="group flex items-center gap-3 text-subtext hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <Phone className="w-4 h-4 text-secondary"/>
                  </div>
                  09068206698
                </a>
              </li>
              <li>
                <a href="https://wa.me/2349068206698?text=Hello%20PULSAR%2C%20I%20want%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 text-subtext hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="w-4 h-4 text-green-500"/>
                  </div>
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg text-white mb-6">Platform</h4>
            <ul className="space-y-3 text-sm text-subtext">
              <li><Link href="/login" className="hover:text-primary transition-colors">Student Terminal</Link></li>
              <li><a href="#courses" className="hover:text-primary transition-colors">Course Database</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tutorial Services</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-subtext/50 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2025 PULSAR CBT. All rights reserved.</p>
          <p>Built with precision for FUOYE.</p>
        </div>
      </footer>
    </div>
  );
    }
                           
