"use client";
import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, Clock, BookOpen, ChevronRight, Cpu, Leaf, Briefcase, BarChart3, Atom, Calculator, FlaskConical
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState('');

  const courses = [
    {
      id: 'gst103',
      code: 'GST 103',
      title: 'Use of Library & ICT',
      desc: 'Fundamental library skills and ICT concepts. Take this exam often—questions are shuffled every time!',
      icon: <BookOpen className="w-6 h-6 text-purple-400"/>,
      link: '/exam/gst103',
      theme: 'purple'
    },
    {
      id: 'cos101',
      code: 'COS 101',
      title: 'Introduction to Computing',
      desc: 'History of computing, hardware, software, logic, and binary systems. Master the basics of CS.',
      icon: <Cpu className="w-6 h-6 text-blue-400"/>,
      link: '/exam/cos101',
      theme: 'blue'
    },
    {
      id: 'bio101',
      code: 'BIO 101',
      title: 'Introductory Biology',
      desc: 'Cell biology, genetics, ecology, and botany. Master the fundamental concepts of life science.',
      icon: <Leaf className="w-6 h-6 text-green-400"/>,
      link: '/exam/bio101',
      theme: 'green'
    },
    {
      id: 'ent101',
      code: 'ENT 101',
      title: 'Introduction to Entrepreneurship',
      desc: 'Business models, Nigerian ecosystem (SMEDAN, CAC), funding, and innovation. Master the art of business.',
      icon: <Briefcase className="w-6 h-6 text-orange-400"/>,
      link: '/exam/ent101',
      theme: 'orange'
    },
    {
      id: 'gst101',
      code: 'GST 101',
      title: 'Communication in English I',
      desc: 'Master listening, reading, writing skills, grammar, and study techniques for academic success.',
      icon: <BookOpen className="w-6 h-6 text-pink-400"/>,
      link: '/exam/gst101',
      theme: 'pink'
    },
    {
      id: 'sta111',
      code: 'STA 111',
      title: 'Descriptive Statistics',
      desc: 'Data presentation, central tendency, dispersion, probability, and index numbers. Essential for Science/Social Science.',
      icon: <BarChart3 className="w-6 h-6 text-cyan-400"/>,
      link: '/exam/sta111',
      theme: 'cyan'
    },
    {
      id: 'phy101',
      code: 'PHY 101',
      title: 'General Physics I',
      desc: 'Mechanics, Properties of Matter, and Thermal Physics. The foundation of Engineering and Science.',
      icon: <Atom className="w-6 h-6 text-yellow-400"/>,
      link: '/exam/phy101',
      theme: 'yellow'
    },
    {
      id: 'mth101',
      code: 'MTH 101',
      title: 'Elementary Mathematics I',
      desc: 'Algebra, Trigonometry, Calculus intro, and Matrices. The language of science and engineering.',
      icon: <Calculator className="w-6 h-6 text-red-400"/>,
      link: '/exam/mth101',
      theme: 'red'
    },
    {
      id: 'chm101',
      code: 'CHM 101',
      title: 'General Chemistry I',
      desc: 'Atoms, Bonding, States of Matter, and Stoichiometry. The central science explained.',
      icon: <FlaskConical className="w-6 h-6 text-teal-400"/>,
      link: '/exam/chm101',
      theme: 'teal'
    }
  ];

  const filteredCourses = courses.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans pb-24 selection:bg-purple-500/30">
      
      {/* HEADER */}
      <div className="p-6 pt-12 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Catalog</h1>
          <p className="text-zinc-500 text-xs mt-1">Select an exam to begin practicing.</p>
        </div>
        <div className="p-3 bg-zinc-900 rounded-full border border-zinc-800">
            <BookOpen className="w-5 h-5 text-zinc-400"/>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-6 mb-6">
        <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500"/>
            <input 
              type="text" 
              placeholder="Search (e.g. CHM 101)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111113] border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-600 text-sm"
            />
        </div>
      </div>

      {/* COURSE LIST */}
      <div className="px-6 space-y-4">
        {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
                <div key={course.id} className="bg-[#111113] border border-zinc-800 p-5 rounded-3xl relative overflow-hidden group hover:border-zinc-700 transition-all">
                    
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mb-3 ${
                        course.theme === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        course.theme === 'green' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        course.theme === 'orange' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        course.theme === 'pink' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                        course.theme === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        course.theme === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        course.theme === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        course.theme === 'teal' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                        {course.code}
                    </div>

                    <h2 className="text-lg font-bold text-white mb-2">{course.title}</h2>
                    <p className="text-zinc-500 text-xs leading-relaxed mb-6 max-w-[90%]">
                        {course.desc}
                    </p>

                    <Link href={course.link}>
                        <button className={`w-full py-3 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                            course.theme === 'blue' ? 'bg-white hover:bg-blue-50' : 
                            course.theme === 'green' ? 'bg-white hover:bg-green-50' :
                            course.theme === 'orange' ? 'bg-white hover:bg-orange-50' :
                            course.theme === 'pink' ? 'bg-white hover:bg-pink-50' :
                            course.theme === 'cyan' ? 'bg-white hover:bg-cyan-50' :
                            course.theme === 'yellow' ? 'bg-white hover:bg-yellow-50' :
                            course.theme === 'red' ? 'bg-white hover:bg-red-50' :
                            course.theme === 'teal' ? 'bg-white hover:bg-teal-50' :
                            'bg-white hover:bg-purple-50'
                        }`}>
                            Start Exam <ChevronRight className="w-4 h-4"/>
                        </button>
                    </Link>

                    {/* Floating Duration Label - UPDATED TO 25m */}
                    <div className="absolute top-5 right-5 flex items-center gap-1 text-zinc-500 text-[10px] font-bold">
                        <Clock className="w-3 h-3"/> 25m
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-12">
                <p className="text-zinc-500 text-sm">No courses found matching "{searchTerm}"</p>
            </div>
        )}
      </div>

      <BottomNav active="browse" />
    </div>
  );
      }
                                 
