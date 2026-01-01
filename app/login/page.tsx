import Link from 'next/link';
import Image from 'next/image';
import { 
  Zap, Target, Smartphone, BookOpen, GraduationCap, ArrowRight, 
  CheckCircle, MessageCircle, Phone, Mail, Star, Quote, ChevronLeft 
} from 'lucide-react';

// --- COMPONENTS ---

const PulsarLogo = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10v6"/><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M12 22V7"/><path d="m9 14 2.5 2.5 5-5"/>
  </svg>
);

const TestimonialCard = ({ name, dept, faculty, quote, img }: { name: string, dept: string, faculty: string, quote: string, img: string }) => (
  <div className="min-w-[320px] md:min-w-[400px] p-8 rounded-3xl bg-surface border border-white/10 relative flex-shrink-0 snap-center group hover:border-secondary/30 transition-all flex flex-col items-center text-center">
    {/* Avatar */}
    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-secondary to-primary mb-6 shadow-xl relative overflow-hidden">
      <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
         {/* Fallback to initial if image fails to load, but typically Next/Image is better. Using simple img tag for GitHub simplicity */}
         <img src={`/${img}`} alt={name} className="w-full h-full object-cover" />
      </div>
    </div>

    {/* Name Badge */}
    <div className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-1 rounded-full text-sm font-bold mb-2">
      {name}
    </div>
    <p className="text-xs text-subtext uppercase tracking-widest mb-6">{dept} • {faculty}</p>

    {/* Stars */}
    <div className="flex gap-1 mb-6">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="w-5 h-5 fill-secondary text-secondary" />
      ))}
    </div>

    {/* Quote */}
    <div className="relative">
      <Quote className="absolute -top-4 -left-2 w-6 h-6 text-white/10" />
      <p className="text-sm leading-relaxed text-white/90 italic relative z-10">
        "{quote}"
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

      {/* REVIEWS SLIDER */}
      <section className="py-20 bg-black/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Student Success Stories</h2>
          <p className="text-subtext">Real feedback from scholars who used PULSAR.</p>
        </div>
        
        {/* Slider Container */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-6 no-scrollbar">
          <TestimonialCard 
            name="Onipe Joshua" 
            faculty="Education" 
            dept="English Edu."
            img="joshua.jpg"
            quote="I struggled heavily with the Use of English (GST 101) because the syllabus is so vast. PULSAR's practice questions were almost identical to what I saw in the exam hall. The explanations for the Lexis and Structure section helped me understand the rules, not just memorize answers. I walked out of that exam smiling."
          />
          <TestimonialCard 
            name="Amuemoje Caleb" 
            faculty="Computing" 
            dept="Computer Science"
            img="caleb.jpg"
            quote="As a CS student, I appreciate the tech behind this. Most CBT sites lag, but PULSAR is instant. I used the 'Rapid Fire' mode to drill MTH 101 formulas until they stuck in my head. It's not just a quiz site; it's a full simulation of the ICT center experience."
          />
          <TestimonialCard 
            name="Raji Muzzamil" 
            faculty="Physical Science" 
            dept="Geology"
            img="raji.jpg"
            quote="Physics (PHY 101) calculation questions usually scare me, but the step-by-step solutions on PULSAR broke everything down. I practiced the motion and vectors module repeatedly. By exam day, I could solve those questions in my sleep. Highly recommend for any science student."
          />
        </div>
      </section>

      {/* MEET THE TEAM */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Built By Your Peers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TeamCard 
            name="Majeed Abdulwali Michael"
            role="Founder & Visionary"
            img="founder.jpg"
            isFounder={true}
            desc="A 100-level Computer Science student and active CSC member with a passion for EdTech. Majeed built PULSAR to bridge the gap between hard work and smart preparation, ensuring every FUOYE student has the tools to hit a 5.0 GPA."
          />
          <TeamCard 
            name="Amuemoje Caleb"
            role="Lead Developer"
            img="caleb.jpg"
            desc="The engineering brain behind the platform. Also a Computer Science student, Caleb ensures the site runs with zero latency and perfect uptime. He is responsible for the sleek, responsive interface you are using right now."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050508] pt-16 pb-8 text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
               <PulsarLogo className="w-6 h-6 text-primary" />
               <h4 className="text-xl font-bold text-white">PULSAR</h4>
            </div>
            <p className="text-sm text-subtext leading-relaxed">
              Empowering FUOYE students with cutting-edge technology for academic excellence.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-subtext">
              <li><a href="mailto:abdulwalimajeed@gmail.com" className="hover:text-primary">abdulwalimajeed@gmail.com</a></li>
              <li><a href="tel:09068206698" className="hover:text-secondary">09068206698</a></li>
              <li>
                 <a href="https://wa.me/2349068206698" className="flex items-center justify-center md:justify-start gap-2 hover:text-green-500">
                   <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                 </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6">Legal</h4>
            <ul className="space-y-2 text-sm text-subtext">
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
      
