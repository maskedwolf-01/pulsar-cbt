"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, Trash2, Loader2, RefreshCw, Bell, Send, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('pdf');
  const [files, setFiles] = useState<any[]>([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // PDF State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => { fetchFiles(); }, []);
  useEffect(() => { if(toast) setTimeout(()=>setToast(null), 3000); }, [toast]);

  const fetchFiles = async () => {
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    setFiles(data || []);
  };

  const handleUpload = async (e: any) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      await supabase.storage.from('resources').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);
      await supabase.from('resources').insert({ title, course_code: code, file_url: publicUrl, file_size: '0.5 MB' });
      setToast({msg: "File Uploaded!", type: 'success'}); fetchFiles();
    } catch (e:any) { setToast({msg: e.message, type: 'error'}); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Delete?")) return;
    await supabase.from('resources').delete().eq('id', id);
    fetchFiles();
  };

  const sendBroadcast = async () => {
      if(!notifMsg.trim()) return;
      try {
          await supabase.from('broadcasts').insert({ title: notifTitle || 'Announcement', message: notifMsg });
          setToast({msg: "Broadcast Sent to All Users!", type: 'success'});
          setNotifMsg(''); setNotifTitle('');
      } catch (e:any) { setToast({msg: e.message, type: 'error'}); }
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white font-sans pb-24">
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold mb-8 text-purple-500">Command Center</h1>

      <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('pdf')} className={`px-4 py-2 rounded-full font-bold ${activeTab==='pdf'?'bg-white text-black':'bg-gray-800'}`}>Files</button>
          <button onClick={() => setActiveTab('notif')} className={`px-4 py-2 rounded-full font-bold ${activeTab==='notif'?'bg-white text-black':'bg-gray-800'}`}>Notifications</button>
      </div>

      {activeTab === 'pdf' ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-3xl border border-white/10">
                <h2 className="text-xl font-bold mb-4">Upload</h2>
                <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-black p-3 rounded-xl mb-3 border border-white/10" placeholder="Title"/>
                <input value={code} onChange={e=>setCode(e.target.value)} className="w-full bg-black p-3 rounded-xl mb-3 border border-white/10" placeholder="Code"/>
                <label className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl block text-center cursor-pointer hover:border-purple-500">
                    <input type="file" className="hidden" onChange={handleUpload}/>
                    <span className="text-sm font-bold">Select PDF</span>
                </label>
            </div>
            <div className="bg-gray-900 p-6 rounded-3xl border border-white/10">
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Manage</h2>
                    <button onClick={fetchFiles}><RefreshCw className="w-4 h-4"/></button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {files.map(f => (
                        <div key={f.id} className="flex justify-between p-3 bg-black rounded-xl border border-white/10">
                            <span className="text-sm">{f.title}</span>
                            <button onClick={()=>handleDelete(f.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
      ) : (
          <div className="max-w-xl bg-gray-900 p-8 rounded-3xl border border-white/10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell className="text-purple-500"/> Broadcast Message</h2>
              <input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} className="w-full bg-black p-3 rounded-xl mb-4 border border-white/10" placeholder="Subject"/>
              <textarea value={notifMsg} onChange={e=>setNotifMsg(e.target.value)} className="w-full bg-black p-3 rounded-xl mb-4 border border-white/10 h-32" placeholder="Message to all students..."/>
              <button onClick={sendBroadcast} className="w-full py-4 bg-purple-600 font-bold rounded-xl flex items-center justify-center gap-2">
                  <Send className="w-4 h-4"/> Send Broadcast
              </button>
          </div>
      )}
    </div>
  );
        }
      
