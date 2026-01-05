"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, Trash2, Loader2, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');

  // 1. FETCH FILES ON LOAD
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    setFiles(data || []);
    setLoadingList(false);
  };

  // 2. UPLOAD LOGIC
  const handleUpload = async (e: any) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileName = `${Date.now()}-${file.name}`;
      // Upload to Bucket
      const { error: uploadErr } = await supabase.storage.from('resources').upload(fileName, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);

      // Save to DB
      const { error: dbErr } = await supabase.from('resources').insert({
        title,
        course_code: courseCode,
        file_url: publicUrl,
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      if (dbErr) throw dbErr;
      alert("Uploaded!");
      setTitle(''); setCourseCode('');
      fetchFiles(); // Refresh list
    } catch (err: any) {
      alert("Upload Failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. DELETE LOGIC
  const handleDelete = async (id: number, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      // Delete from DB
      await supabase.from('resources').delete().eq('id', id);
      
      // Attempt to delete from Storage (Optional, clean up if you want)
      const fileName = fileUrl.split('/').pop();
      if (fileName) await supabase.storage.from('resources').remove([fileName]);

      alert("Deleted.");
      fetchFiles();
    } catch (err: any) {
      alert("Delete Failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white font-sans pb-24">
      <h1 className="text-3xl font-bold mb-8 text-purple-500">Command Center</h1>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* LEFT: UPLOAD FORM */}
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

        {/* RIGHT: MANAGE FILES */}
        <div className="bg-gray-900 border border-white/10 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manage Resources</h2>
            <button onClick={fetchFiles}><RefreshCw className="w-4 h-4 text-gray-400 hover:text-white"/></button>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {loadingList ? <div className="text-center p-4"><Loader2 className="animate-spin mx-auto"/></div> : 
             files.length === 0 ? <p className="text-gray-500 text-center">No files uploaded.</p> :
             files.map(file => (
              <div key={file.id} className="p-3 bg-black border border-white/10 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm">{file.title}</div>
                  <div className="text-xs text-gray-500">{file.course_code} • {file.file_size}</div>
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
                                                                        
