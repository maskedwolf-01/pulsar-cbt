"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, Trash2, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  
  // Custom Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => { fetchFiles(); }, []);
  useEffect(() => { 
    if(toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); } 
  }, [toast]);

  const fetchFiles = async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    setFiles(data || []);
  };

  const handleUpload = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`; // Sanitize name
      
      const { error: uploadErr } = await supabase.storage.from('resources').upload(fileName, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);

      const { error: dbErr } = await supabase.from('resources').insert({
        title, course_code: courseCode, file_url: publicUrl, file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      if (dbErr) throw dbErr;
      setToast({ msg: "PDF Uploaded Successfully", type: 'success' });
      setTitle(''); setCourseCode(''); fetchFiles();
    } catch (err: any) {
      setToast({ msg: err.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number, fileUrl: string) => {
    try {
      // 1. Delete from DB
      const { error: dbErr } = await supabase.from('resources').delete().eq('id', id);
      if (dbErr) throw dbErr;

      // 2. Delete from Storage (Extract filename correctly)
      const fileName = fileUrl.split('/resources/').pop(); // Fix filename parsing
      if (fileName) await supabase.storage.from('resources').remove([fileName]);

      setToast({ msg: "File Deleted", type: 'success' });
      // Update UI immediately
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      setToast({ msg: "Delete Failed: " + err.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white font-sans pb-24 relative">
      {/* CUSTOM TOAST */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-xl border backdrop-blur-md animate-fade-in ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-purple-500">Command Center</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-gray-900 border border-white/10 p-6 rounded-3xl h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Upload className="text-purple-500"/> Upload PDF</h2>
          <div className="space-y-4">
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl" placeholder="Document Title"/>
            <input value={courseCode} onChange={e => setCourseCode(e.target.value)} className="w-full bg-black border border-white/10 p-3 rounded-xl" placeholder="Course Code"/>
            <label className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-purple-500 transition-colors">
              {uploading ? <Loader2 className="animate-spin"/> : <FileText />}
              <span>{uploading ? "Uploading..." : "Select PDF File"}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading}/>
            </label>
          </div>
        </div>

        {/* Manage Files */}
        <div className="bg-gray-900 border border-white/10 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manage Resources</h2>
            <button onClick={fetchFiles}><RefreshCw className="w-4 h-4 text-gray-400 hover:text-white"/></button>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
             {files.map(file => (
              <div key={file.id} className="p-3 bg-black border border-white/10 rounded-xl flex justify-between items-center group">
                <div>
                  <div className="font-bold text-sm">{file.title}</div>
                  <div className="text-xs text-gray-500">{file.course_code}</div>
                </div>
                <button 
                  onClick={() => handleDelete(file.id, file.file_url)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
                }
        
