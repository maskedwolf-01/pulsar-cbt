"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { 
  FileText, Download, Loader2, Book, 
  Search, Clock, FileArchive
} from 'lucide-react';

export default function ResourcesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      setFiles(data || []);
      setLoading(false);
    };
    fetchFiles();
  }, []);

  const filteredFiles = files.filter(file => 
    file.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    file.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans pb-24 overflow-x-hidden selection:bg-indigo-500/30">
      <Header title="The Archive" />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 animate-fade-in">
        
        {/* HERO SECTION */}
        <div className="mb-8 relative overflow-hidden rounded-3xl bg-[#0a0a0c] border border-white/5 p-6 md:p-8 shadow-2xl group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/20 transition-all"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mb-4 shadow-lg">
                <Book className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white font-serif tracking-tight mb-2">Study Materials Vault</h2>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                Access official timetables, exam guides, and curated past questions loaded directly from the database.
              </p>
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
              <input 
                type="text" 
                placeholder="Search archive..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121216] border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* CLOUD ARCHIVE (100% Dynamic from Supabase) */}
        <div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <FileArchive className="w-4 h-4 text-cyan-400" /> Cloud Database
          </h3>
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center bg-[#0a0a0c] rounded-3xl border border-white/5">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4"/>
               <p className="text-zinc-500 text-sm font-medium">Syncing with database...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center bg-[#0a0a0c] rounded-3xl border border-white/5 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-white font-bold text-lg mb-1">No files found</p>
              <p className="text-sm text-zinc-500">The cloud archive is currently empty or no files match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFiles.map((file) => (
                <a 
                  key={file.id} 
                  href={file.file_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-[#0a0a0c] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-cyan-500/30 transition-all shadow-sm hover:shadow-cyan-500/10"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">{file.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-2">
                        <span className="text-zinc-400 font-bold">{file.course_code || "DOC"}</span> • {file.file_size || "PDF"} • <Clock className="w-3 h-3"/> {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl text-zinc-400 group-hover:bg-cyan-600 group-hover:text-white transition-all flex-shrink-0 ml-2">
                    <Download className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

      </main>
      
      <BottomNav active="resources" />
    </div>
  );
}
