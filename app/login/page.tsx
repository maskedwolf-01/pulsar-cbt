import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-lg border-b border-white/5 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
            <span className="text-xl font-bold tracking-tight">PULSAR</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-subtext">
            <a href="#courses" className="hover:text-white transition-colors">Courses</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <Link href="/login" className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-medium transition-all">
            Student Login
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Glow Effects */}
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider text-secondary bg-secondary/10 border border-secondary/20 rounded-full">
            FUOYE 100 LEVEL • FIRST SEMESTER
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-subtext">
            Master Your Frequency. <br/> Ace Your Exams.
          </h1>
          <p className="text-lg text-subtext mb-10 max-w-2xl mx-auto leading-relaxed">
            The most advanced CBT practice platform for Federal University Oye Ekiti. 
            Speed drills, instant corrections, and performance analytics for GSTs and Sciences.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/login" className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_30px_rgba(160,108,213,0.4)] hover:shadow-[0_0_50px_rgba(160,108,213,0.6)] hover:scale-105 transition-all">
              Start Practicing Free 🚀
            </Link>
            <a href="#courses" className="px-8 py-4 bg-surface border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-all">
              View All Courses
            </a>
          </div>
        </div>
      </section>

      {/* 3. COURSE CATALOG GRID */}
      <section id="courses" className="py-24 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Available Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* GST Card */}
            <div className="p-6 bg-surface border border-white/5 rounded-2xl hover:border-primary/50 transition-colors group">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">📚</div>
              <h3 className="text-xl font-bold mb-2">General Studies</h3>
              <p className="text-sm text-subtext mb-4">Compulsory for all departments.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">GST 101</span>
                <span className="tag">GST 103</span>
                <span className="tag">ENT 101</span>
              </div>
            </div>

            {/* Science Card */}
            <div className="p-6 bg-surface border border-white/5 rounded-2xl hover:border-secondary/50 transition-colors group">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">🧬</div>
              <h3 className="text-xl font-bold mb-2">Basic Sciences</h3>
              <p className="text-sm text-subtext mb-4">Core requirements for Science/Engineering.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">BIO 101</span>
                <span className="tag">CHM 101</span>
                <span className="tag">PHY 101</span>
                <span className="tag">MTH 101</span>
              </div>
            </div>

            {/* Departmental Card */}
            <div className="p-6 bg-surface border border-white/5 rounded-2xl hover:border-accent/50 transition-colors group">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">💻</div>
              <h3 className="text-xl font-bold mb-2">Departmental</h3>
              <p className="text-sm text-subtext mb-4">Specific faculty requirements.</p>
              <div className="flex flex-wrap gap-2">
                <span className="tag">CSC 101</span>
                <span className="tag">ELS 101</span>
                <span className="tag">TMA 103</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER & CONTACT */}
      <footer id="contact" className="border-t border-white/10 bg-black/40 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h4 className="text-2xl font-bold mb-4">PULSAR</h4>
            <p className="text-subtext text-sm leading-relaxed">
              Empowering FUOYE students with cutting-edge technology for academic excellence. 
              We don't just teach; we upgrade your learning frequency.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm text-subtext">
              <li className="flex items-center gap-3">
                <span className="text-primary">📧</span> Geniuslabeducational@gmail.com
              </li>
              <li className="flex items-center gap-3">
                <span className="text-secondary">📱</span> +234 812 426 9495
              </li>
              <li className="flex items-center gap-3">
                <span className="text-accent">📍</span> Federal University Oye Ekiti, Nigeria
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-subtext">
              <li><Link href="/login" className="hover:text-primary transition-colors">Login / Sign Up</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tutorial Services</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-white/20 border-t border-white/5 pt-8">
          © 2025 PULSAR CBT. All rights reserved.
        </div>
      </footer>
    </div>
  );
      }
          
