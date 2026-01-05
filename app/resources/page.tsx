"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { FileText, Download, Loader2, Book } from 'lucide-react';

export default function ResourcesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      setFiles(data || []);
      setLoading(false);
    };
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24">
      <Header title="The Archive" />
      
      <div className="px-6 py-6">
        <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-white/10 relative overflow-hidden">
          <Book className="w-8 h-8 text-primary mb-2" />
          <h2 className="text-xl font-bold text-white">Study Materials</h2>
          <p className="text-xs text-subtext mt-1">Curated handouts and past questions for download.</p>
        </div>

        {loading ? (
          <div className="flex justify-center pt-10"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-sm font-bold">Archive is empty.</p>
            <p className="text-xs">Admin hasn't uploaded any PDFs yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {files.map((file) => (
              <a 
                key={file.id} 
                href={file.file_url} 
                target="_blank"
                className="p-4 bg-surface border border-white/10 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{file.title}</h3>
                    <p className="text-[10px] text-subtext">{file.course_code} • {file.file_size}</p>
                  </div>
                </div>
                <button className="p-2 bg-white/5 rounded-full text-white group-hover:bg-primary group-hover:text-black transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </a>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="resources" />
    </div>
  );
      }
          
