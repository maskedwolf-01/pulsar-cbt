"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, ArrowLeft, Search, Calculator, FlaskConical, 
  Cpu, BookOpen, Briefcase, Atom, BarChart3, Leaf, Mountain 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/auth');
      else setLoading(false);
    };
    checkUser();
  }, [router]);

  const courses = [
    {
      id: 'mth101',
      code: 'MTH 101',
      title: 'Elementary Mathematics I',
      icon: <Calculator className="w-6 h-6 text-red-500" />,
      color: 'border-red-500/20 bg-red-500/5 hover:border-red-500',
      text: 'text-red-500',
      desc: 'Algebra, Trigonometry, and Calculus basics.'
    },
    {
      id: 'phy101',
      code: 'PHY 101',
      title: 'General Physics I',
      icon: <Atom className="w-6 h-6 text-yellow-500" />,
      color: 'border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500',
      text: 'text-yellow-500',
      desc: 'Mechanics, Heat, and Properties of Matter.'
    },
    {
      id: 'chm101',
      code: 'CHM 101',
      title: 'General Chemistry I',
      icon: <FlaskConical className="w-6 h-6 text-teal-500" />,
      color: 'border-teal-500/20 bg-teal-500/5 hover:border-teal-500',
      text: 'text-teal-500',
      desc: 'Atomic structure, Stoichiometry, and Bonding.'
    },
    {
      id: 'bio101',
      code: 'BIO 101',
      title: 'Introductory Biology I',
      icon: <Leaf className="w-6 h-6 text-green-500" />,
      color: 'border-green-500/20 bg-green-500/5 hover:border-green-500',
      text: 'text-green-500',
      desc: 'Cell Biology, Genetics, and Evolution.'
    },
    {
      id: 'cos101',
      code: 'COS 101',
      title: 'Introduction to Computing',
      icon: <Cpu className="w-6 h-6 text-blue-500" />,
      color: 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500',
      text: 'text-blue-500',
      desc: 'Computer history, Hardware, Software, and Logic.'
    },
    // ✅ NEW COURSE ADDED: GLY 101
    {
      id: 'gly101',
      code: 'GLY 101',
      title: 'Introduction to Geology',
      icon: <Mountain className="w-6 h-6 text-amber-500" />,
      color: 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500',
      text: 'text-amber-500',
      desc: 'Earth structure, Rocks, Minerals, and Tectonics.'
    },
    {
      id: 'sta111',
      code: 'STA 111',
      title: 'Descriptive Statistics',
      icon: <BarChart3 className="w-6 h-6 text-cyan-500" />,
      color: 'border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500',
      text: 'text-cyan-500',
      desc: 'Data presentation, Measures of central tendency.'
    },
    {
      id: 'gst101',
      code: 'GST 101',
      title: 'Use of English I',
      icon: <BookOpen className="w-6 h-6 text-pink-500" />,
      color: 'border-pink-500/20 bg-pink-500/5 hover:border-pink-500',
      text: 'text-pink-500',
      desc: 'Grammar, Reading comprehension, and Writing.'
    },
    {
      id: 'gst103',
      code: 'GST 103',
      title: 'Use of Library & ICT',
      icon: <BookOpen className="w-6 h-6 text-purple-500" />,
      color: 'border-purple-500/20 bg-purple-500/5 hover:border-purple-500',
      text: 'text-purple-500',
      desc: 'Library skills, Information literacy, and ICT tools.'
    },
    {
      id: 'ent101',
      code: 'ENT 101',
      title: 'Entrepreneurship',
      icon: <Briefcase className="w-6 h-6 text-orange-500" />,
      color: 'border-orange-500/20 bg-orange-500/5 hover:border-orange-500',
      text: 'text-orange-500',
      desc: 'Business ideas, Innovation, and Opportunity.'
    }
  ];

  if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2"/> Loading Courses...</div>;

  const filtered = courses.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
           <div>
             <button onClick={() => router.push('/dashboard')} className="flex items-center text-zinc-400 hover:text-white mb-2 text-sm font-bold transition-colors">
               <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
             </button>
             <h1 className="text-3xl font-bold">Course Catalog</h1>
             <p className="text-zinc-500 text-sm mt-1">Select a course to start your practice exam.</p>
           </div>
           
           <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
             <input 
               type="text" 
               placeholder="Search courses..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-[#111113] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
             />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filtered.map((course) => (
             <Link href={`/exam/${course.id}`} key={course.id} className="group">
               <div className={`h-full p-6 rounded-2xl border transition-all duration-300 ${course.color}`}>
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-3 rounded-xl bg-black/40 border border-white/5`}>
                        {course.icon}
                     </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded-md bg-black/20 ${course.text}`}>3 Units</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1 group-hover:underline decoration-2 underline-offset-4">{course.code}</h3>
                  <p className="text-sm font-medium text-zinc-300 mb-2">{course.title}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{course.desc}</p>
               </div>
             </Link>
           ))}
        </div>

        {filtered.length === 0 && (
           <div className="text-center py-20 text-zinc-500">
              <p>No courses found matching "{search}"</p>
           </div>
        )}

      </div>
    </div>
  );
        }
      
