"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  
  // PDF Upload Logic
  const handleUpload = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // 1. Upload File to Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('resources').upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);

      // 3. Save to Database
      const { error: dbError } = await supabase.from('resources').insert({
        title,
        course_code: courseCode,
        file_url: publicUrl,
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      if (dbError) throw dbError;
      alert("PDF Uploaded Successfully!");
      setTitle(''); setCourseCode('');
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 text-white font-sans">
      <h1 className="text-3xl font-bold mb-8 text-primary">Command Center</h1>
      
      {/* PDF UPLOAD CARD */}
      <div className="max-w-xl mx-auto bg-surface border border-white/10 p-8 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/20 rounded-full text-primary"><Upload className="w-6 h-6"/></div>
          <h2 className="text-xl font-bold">Upload Resource (PDF)</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-subtext font-bold mb-2 block">Document Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/30 border border-white/10 p-3 rounded-xl text-white" placeholder="e.g. CSC 101 Lecture Note 1"/>
          </div>
          <div>
            <label className="text-xs text-subtext font-bold mb-2 block">Course Code</label>
            <input value={courseCode} onChange={e => setCourseCode(e.target.value)} className="w-full bg-black/30 border border-white/10 p-3 rounded-xl text-white" placeholder="e.g. CSC 101"/>
          </div>
          
          <div className="pt-4">
            <label className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
              {uploading ? <Loader2 className="animate-spin"/> : <FileText />}
              <span className="text-sm font-bold">{uploading ? "Uploading..." : "Select PDF File"}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading}/>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
    }
      
