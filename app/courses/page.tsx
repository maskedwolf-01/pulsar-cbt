"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Calculator, FlaskConical, Cpu, BookOpen, 
  Briefcase, Atom, BarChart3, Leaf, Mountain, 
  ChevronRight, Target, Clock, Loader2, ArrowLeft, Zap, Activity, BrainCircuit
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Added "duration" property (15 or 27) based on the course code
const COURSE_CATALOG = [
  // === FIRST SEMESTER ===
  { id: 'mth101', semester: 1, code: 'MTH 101', title: 'Elementary Mathematics I', unit: 3, duration: 27, type: 'Core', color: "from-rose-500 to-red-500", icon: <Calculator className="w-5 h-5 text-rose-400"/> },
  { id: 'phy101', semester: 1, code: 'PHY 101', title: 'General Physics I', unit: 3, duration: 27, type: 'Core', color: "from-amber-500 to-yellow-500", icon: <Atom className="w-5 h-5 text-amber-400"/> },
  { id: 'chm101', semester: 1, code: 'CHM 101', title: 'General Chemistry I', unit: 3, duration: 15, type: 'Core', color: "from-teal-500 to-emerald-500", icon: <FlaskConical className="w-5 h-5 text-teal-400"/> },
  { id: 'bio101', semester: 1, code: 'BIO 101', title: 'Introductory Biology I', unit: 3, duration: 15, type: 'Core', color: "from-green-500 to-emerald-500", icon: <Leaf className="w-5 h-5 text-green-400"/> },
  { id: 'cos101', semester: 1, code: 'COS 101', title: 'Introduction to Computing', unit: 3, duration: 15, type: 'Core', color: "from-blue-500 to-indigo-500", icon: <Cpu className="w-5 h-5 text-blue-400"/> },
  { id: 'gly101', semester: 1, code: 'GLY 101', title: 'Introduction to Geology', unit: 3, duration: 15, type: 'Core', color: "from-stone-500 to-zinc-500", icon: <Mountain className="w-5 h-5 text-stone-400"/> },
  { id: 'sta111', semester: 1, code: 'STA 111', title: 'Descriptive Statistics', unit: 3, duration: 27, type: 'Core', color: "from-cyan-500 to-blue-500", icon: <BarChart3 className="w-5 h-5 text-cyan-400"/> },
  { id: 'gst101', semester: 1, code: 'GST 101', title: 'Use of English I', unit: 2, duration: 15, type: 'Core', color: "from-pink-500 to-rose-500", icon: <BookOpen className="w-5 h-5 text-pink-400"/> },
  { id: 'gst103', semester: 1, code: 'GST 103', title: 'Use of Library & ICT', unit: 2, duration: 15, type: 'Core', color: "from-purple-500 to-fuchsia-500", icon: <BookOpen className="w-5 h-5 text-purple-400"/> },
  { id: 'ent101', semester: 1, code: 'ENT 101', title: 'Entrepreneurship', unit: 2, duration: 15, type: 'Core', color: "from-orange-500 to-amber-500", icon: <Briefcase className="w-5 h-5 text-orange-400"/> },

  // === SECOND SEMESTER ===
  { id: 'cos102', semester: 2, code: "COS 102", title: "Problem Solving", unit: 3, duration: 15, type: 'Core', color: "from-indigo-500 to-blue-500", icon: <BrainCircuit className="w-5 h-5 text-indigo-400"/> },
  { id: 'mth102', semester: 2, code: "MTH 102", title: "Elementary Mathematics II", unit: 2, duration: 27, type: 'Core', color: "from-cyan-500 to-blue-500", icon: <Calculator className="w-5 h-5 text-cyan-400"/> },
  { id: 'phy102', semester: 2, code: "PHY 102", title: "General Physics II", unit: 2, duration: 27, type: 'Required', color: "from-amber-500 to-orange-500", icon: <Zap className="w-5 h-5 text-amber-400"/> },
  { id: 'chm102', semester: 2, code: "CHM 102", title: "General Chemistry II", unit: 2, duration: 15, type: 'Required', color: "from-emerald-500 to-teal-500", icon: <FlaskConical className="w-5 h-5 text-emerald-400"/> },
  { id: 'bio102', semester: 2, code: "BIO 102", title: "General Biology II", unit: 2, duration: 15, type: 'Required', color: "from-green-500 to-emerald-500", icon: <Leaf className="w-5 h-5 text-green-400"/> },
  { id: 'gly102', semester: 2, code: "GLY 102", title: "Introduction To Geology II", unit: 2, duration: 15, type: 'Core', color: "from-stone-500 to-zinc-500", icon: <Mountain className="w-5 h-5 text-stone-400"/> },
  { id: 'sta112', semester: 2, code: "STA 112", title: "Probability Theory", unit: 2, duration: 27, type: 'Core', color: "from-purple-500 to-pink-500", icon: <Activity className="w-5 h-5 text-purple-400"/> },
  { id: 'gst102', semester: 2, code: "GST 102", title: "Communication In English II", unit: 2, duration: 15, type: 'Core', color: "from-rose-500 to-red-500", icon: <BookOpen className="w-5 h-5 text-rose-400"/> },
  { id: 'gst104', semester: 2, code: "GST 104", title: "Nigeria People And Culture", unit: 2, duration: 15, type: 'Core', color: "from-yellow-500 to-amber-500", icon: <BookOpen className="w-5 h-5 text-yellow-400"/> },
  { id: 'ent102', semester: 2, code: "ENT 102", title: "Evaluation Of Business Concepts", unit: 1, duration: 15, type: 'Core', color: "from-blue-500 to-indigo-500", icon: <Briefcase className="w-5 h-5 text-blue-400"/> },
];

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSemester, setActiveSemester] = useState(2);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/auth');
      else setLoading(false);
    };
    checkUser();
  }, [router]);

  const filteredCourses = COURSE_CATALOG.filter(c => 
    c.semester === activeSemester &&
    (c.code.toLowerCase().includes(search.toLowerCase()) || 
     c.title.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="h-screen bg-[#030305] flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8 text-indigo-500"/></div>;

  return (
    <div className="min-h-screen bg-[#030305] text-white p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-white/5 pb-8">
           <div>
             <button onClick={() => router.push('/dashboard')} className="flex items-center text-zinc-500 hover:text-white mb-4 text-xs font-bold uppercase tracking-widest transition-colors">
               <ArrowLeft className="w-4 h-4 mr-2"/> Return to Dashboard
             </button>
             <h1 className="text-3xl md:text-4xl font-bold font-serif tracking-tight">Available Courses</h1>
             <p className="text-zinc-500 text-sm mt-2">Choose a subject to start your practice test.</p>
           </div>
           
           <div className="w-full md:w-auto flex flex-col gap-4">
             {/* THE SEMESTER SWITCHER */}
             <div className="flex bg-[#0a0a0c] p-1 rounded-xl border border-white/10 w-full md:w-max shadow-inner">
               <button 
                 onClick={() => setActiveSemester(1)} 
                 className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeSemester === 1 ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 1st Semester <span className="hidden sm:inline">Archive</span>
               </button>
               <button 
                 onClick={() => setActiveSemester(2)} 
                 className={`flex-1 md:px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeSemester === 2 ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 2nd Semester
               </button>
             </div>

             <div className="relative w-full md:w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
               <input 
                 type="text" 
                 placeholder="Search by course code or title..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
               />
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {filteredCourses.map((course) => (
             <Link href={`/exam/${course.id}`} key={course.id} className="group">
               <div className="h-full p-6 rounded-3xl bg-[#0a0a0c] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden flex flex-col shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
                  
                  <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${course.color} rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.color} p-[1px] shadow-lg`}>
                        <div className="w-full h-full bg-[#121216] rounded-2xl flex items-center justify-center">
                           {course.icon}
                        </div>
                     </div>
                     <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg border ${
                        course.type === 'Core' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                     }`}>
                        {course.type} • {course.unit} Unit
                     </span>
                  </div>

                  <div className="relative z-10 flex-1">
                     <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">{course.code}</h3>
                     <p className="text-sm font-medium text-zinc-400 line-clamp-2">{course.title}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                     <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                        <div className="flex items-center gap-1.5"><Target className="w-4 h-4 text-indigo-400"/> 60 Qs</div>
                        {/* Dynamically uses the new 15 or 27 min property */}
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400"/> {course.duration} Mins</div>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                     </div>
                  </div>
               </div>
             </Link>
           ))}
        </div>

        {filteredCourses.length === 0 && (
           <div className="text-center py-24 bg-[#0a0a0c] rounded-3xl border border-white/5 mt-4">
              <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">No courses found matching "{search}"</p>
           </div>
        )}

      </div>
    </div>
  );
}
