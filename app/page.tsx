import Link from 'next/link';
import { 
  Zap, 
  Target, 
  Smartphone, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle,
  Menu,
  Atom,
  Calculator,
  Microscope
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg border-b border-white/5 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(160,108,213,0.3)]">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">PULSAR</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-subtext">
            <a href="#courses" className="hover:text-white transition-colors flex items-center gap-2">
              Courses
            </a>
            <a href="#features" className="hover:text-white transition-colors">Why Pulsar?</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <Link href="/login" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white transition-all flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Student Login
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-bold tracking-widest text-secondary bg-secondary/10 border border-secondary/20 rounded-full uppercase">
            <CheckCircle className="w-3 h-3" />
            #1 CBT Platform for FUOYE
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white leading-tight">
            Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">5.0 GP</span> <br/>
            With Precision.
          </h1>
          <p className="text-lg text-subtext mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the exact FUOYE exam environment with our high-performance CBT engine. No lag, just results.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="group w-full md:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_30px_rgba(160,108,213,0.4)] hover:shadow-[0_0_50px_rgba(160,108,213,0.6)] hover:scale-105 transition-all flex items-center justify-center gap-2">
              Start Practice Free 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#courses" className="w-full md:w-auto px-8 py-4 bg-surface border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-all text-center">
              Browse Catalogue
            </a>
          </div>
        </div>
      </section>

      {/* 3. FEATURES */}
      <section id="features" className="py-20 border-y border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-primary/20 transition-colors">
            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Zero Lag Interface</h3>
            <p className="text-subtext text-sm leading-relaxed">Built for speed. Our engine is faster than the actual university servers, ensuring your time is spent answering, not waiting.</p>
          </div>
          <div className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-green-500/20 transition-colors">
            <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-6 border border-green-500/20">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Precision Grading</h3>
            <p className="text-subtext text-sm leading-relaxed">Instant corrections with detailed explanations. We don't just tell you you're wrong; we tell you why.</p>
          </div>
          <div className="p-8 rounded-2xl bg-surface border border-white/5 hover:border-purple-500/20 transition-colors">
            <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Mobile Optimized</h3>
            <p className="text-subtext text-sm leading-relaxed">Practice on the go. Whether you're in the shuttle or the library, PULSAR works perfectly on your phone.</p>
          </div>
        </div>
      </section>

      {/* 4. COURSE CATALOG */}
      <section id="courses" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-white flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Supported Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 bg-surface border border-white/10 rounded-2xl hover:border-primary/50 transition-all group cursor-pointer hover:shadow-2xl hover:shadow-primary/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">General Studies</h3>
                <BookOpen className="w-5 h-5 text-subtext group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-subtext mb-6">Essential GSTs for all levels.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">GST 101</span>
                <span className="tag">GST 103</span>
                <span className="tag">ENT 101</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-surface border border-white/10 rounded-2xl hover:border-secondary/50 transition-all group cursor-pointer hover:shadow-2xl hover:shadow-secondary/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-secondary transition-colors">Science & Tech</h3>
                <Microscope className="w-6 h-6 text-subtext group-hover:text-secondary transition-colors" />
              </div>
              <p className="text-sm text-subtext mb-6">Physics, Chemistry, and Biology.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">BIO 101</span>
                <span className="tag">CHM 101</span>
                <span className="tag">PHY 101</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-surface border border-white/10 rounded-2xl hover:border-accent/50 transition-all group cursor-pointer hover:shadow-2xl hover:shadow-accent/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">Calculus & Logic</h3>
                <Calculator className="w-6 h-6 text-subtext group-hover:text-accent transition-colors" />
              </div>
              <p className="text-sm text-subtext mb-6">Mathematics and Computer Science.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">MTH 101</span>
                <span className="tag">CSC 101</span>
                <span className="tag">STA 111</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer id="contact" className="border-t border-white/10 bg-black/40 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <h4 className="text-xl font-bold text-white">PULSAR</h4>
            </div>
            <p className="text-subtext text-sm leading-relaxed max-w-sm">
              The ultimate academic weapon for FUOYE students. 
              We bridge the gap between preparation and excellence.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Contact</h4>
            <ul className="space-y-3 text-sm text-subtext">
              <li className="hover:text-primary cursor-pointer transition-colors">Geniuslabeducational@gmail.com</li>
              <li className="hover:text-primary cursor-pointer transition-colors">+234 812 426 9495</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-subtext">
              <li className="hover:text-white cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer transition-colors">Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-white/20 pt-8 border-t border-white/5">
          © 2025 PULSAR CBT. Built for Excellence.
        </div>
      </footer>
    </div>
  );
          }
          
