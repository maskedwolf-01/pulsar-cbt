"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, Plus, BookOpen, Loader2, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState<'pdf' | 'exam'>('pdf');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // PDF State
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfCode, setPdfCode] = useState('');

  // Exam State
  const [examCode, setExamCode] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examLevel, setExamLevel] = useState('100L');
  const [examDuration, setExamDuration] = useState(40);

  // 1. UPLOAD PDF
  const handlePdfUpload = async (e: any) => {
    try {
      setLoading(true); setStatus('');
      const file = e.target.files[0];
      if (!file) return;

      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('resources').upload(fileName, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);

      const { error: dbErr } = await supabase.from('resources').insert({
        title: pdfTitle,
        course_code: pdfCode,
        file_url: publicUrl,
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      });

      if (dbErr) throw dbErr;
      setStatus('PDF Uploaded Successfully!');
      setPdfTitle(''); setPdfCode('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. CREATE EXAM SHELL
  const handleCreateExam = async () => {
    try {
      setLoading(true); setStatus('');
      
      const { error } = await supabase.from('exams').insert({
        course_code: examCode,
        title: examTitle,
        level: examLevel,
        duration: examDuration,
        is_published: true // Live immediately
      });

      if (error) throw error;
      setStatus(`Exam ${examCode} Created! Now you need to upload questions.`);
      setExamCode(''); setExamTitle('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white font-sans pb-24">
      <h1 className="text-3xl font-bold mb-8 text-purple-500">Command Center</h1>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('pdf')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'pdf' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>Upload PDF</button>
        <button onClick={() => setActiveTab('exam')} className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'exam' ? 'bg-white text-black' : 'bg-gray-800 text-gray-400'}`}>Create Exam</button>
      </div>

      {status && <div className="p-4 mb-6 bg-green-500/20 border border-green-500 rounded-xl text-green-400 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {status}</div>}

      {/* PDF PANEL */}
      {activeTab === 'pdf' && (
        <div className="max-w-xl bg-gray-900 border border-white/10 p-8 rounded-3xl animate-fade-in">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Upload className="text-purple-500"/> Upload Resource</h2>
          <div className="space-y-4">
            <input value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl" placeholder="Document Title (e.g. GST 101 Notes)"/>
            <input value={pdfCode} onChange={e => setPdfCode(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl" placeholder="Course Code (e.g. GST 101)"/>
            <label className="w-full p-6 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-purple-500 transition-colors">
              {loading ? <Loader2 className="animate-spin"/> : <FileText />}
              <span>{loading ? "Uploading..." : "Select PDF File"}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} disabled={loading}/>
            </label>
          </div>
        </div>
      )}

      {/* EXAM PANEL */}
      {activeTab === 'exam' && (
        <div className="max-w-xl bg-gray-900 border border-white/10 p-8 rounded-3xl animate-fade-in">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="text-purple-500"/> Create New Exam</h2>
          <div className="space-y-4">
            <input value={examCode} onChange={e => setExamCode(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl" placeholder="Course Code (e.g. MTH 101)"/>
            <input value={examTitle} onChange={e => setExamTitle(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl" placeholder="Exam Title (e.g. General Math I)"/>
            
            <div className="grid grid-cols-2 gap-4">
              <select value={examLevel} onChange={e => setExamLevel(e.target.value)} className="bg-black border border-white/10 p-4 rounded-xl text-white">
                <option value="100L">100 Level</option>
                <option value="200L">200 Level</option>
              </select>
              <input type="number" value={examDuration} onChange={e => setExamDuration(Number(e.target.value))} className="bg-black border border-white/10 p-4 rounded-xl" placeholder="Mins"/>
            </div>

            <button onClick={handleCreateExam} disabled={loading} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg">
              {loading ? "Creating..." : "Create Exam Shell"}
            </button>
            <p className="text-xs text-gray-500 text-center">Note: Questions must be uploaded separately via Database for now.</p>
          </div>
        </div>
      )}
    </div>
  );
        }
        
