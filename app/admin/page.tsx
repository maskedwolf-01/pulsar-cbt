"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FileText, Trash2, Loader2, RefreshCw, Bell, 
  Send, CheckCircle, XCircle, ShieldAlert, UploadCloud, Database
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('pdf');
  const [files, setFiles] = useState<any[]>([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Loading States for better UX
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PDF State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => { fetchFiles(); }, []);
  useEffect(() => { if(toast) setTimeout(()=>setToast(null), 3000); }, [toast]);

  const fetchFiles = async () => {
    setIsRefreshing(true);
    const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
    setFiles(data || []);
    setIsRefreshing(false);
  };

  const handleUpload = async (e: any) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      setIsUploading(true);
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      
      await supabase.storage.from('resources').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(fileName);
      
      await supabase.from('resources').insert({ 
        title, 
        course_code: code || 'DOC', 
        file_url: publicUrl, 
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB` // Automatically calculate real size
      });
      
      setToast({msg: "File Successfully Injected into Database!", type: 'success'}); 
      fetchFiles();
      setTitle(''); 
      setCode('');
    } catch (e:any) { 
      setToast({msg: e.message, type: 'error'}); 
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("WARNING: This will permanently delete the file from the database. Proceed?")) return;
    await supabase.from('resources').delete().eq('id', id);
    setToast({msg: "File purged from database.", type: 'success'});
    fetchFiles();
  };

  const sendBroadcast = async () => {
      if(!notifMsg.trim()) return;
      setIsSending(true);
      try {
          await supabase.from('broadcasts').insert({ title: notifTitle || 'System Announcement', message: notifMsg });
          setToast({msg: "Global Broadcast Sent to All Terminals!", type: 'success'});
          setNotifMsg(''); 
          setNotifTitle('');
      } catch (e:any) { 
          setToast({msg: e.message, type: 'error'}); 
      } finally {
          setIsSending(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#030305] p-6 text-white font-sans pb-24 selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* V2.0 TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-fade-in-up ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/10 border-rose-500/50 text-rose-400'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
          <span className="font-bold text-sm tracking-wide">{toast.msg}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-10 mt-4">
           <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
             <ShieldAlert className="w-8 h-8 text-indigo-400" />
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">Pulsar Nexus</h1>
           <p className="text-zinc-500 text-sm mt-2 font-mono uppercase tracking-widest">Admin Terminal Active</p>
        </div>

        {/* V2.0 TAB SWITCHER */}
        <div className="flex bg-[#0a0a0c] p-1.5 rounded-2xl border border-white/10 w-full md:w-max shadow-inner mb-12 mx-auto">
          <button 
            onClick={() => setActiveTab('pdf')} 
            className={`flex-1 md:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'pdf' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
          >
            <Database className="w-4 h-4"/> Cloud Resources
          </button>
          <button 
            onClick={() => setActiveTab('notif')} 
            className={`flex-1 md:px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'notif' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/25' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
          >
            <Bell className="w-4 h-4"/> Transmissions
          </button>
        </div>

        {activeTab === 'pdf' ? (
          <div className="grid lg:grid-cols-5 gap-8">
            
            {/* UPLOAD PANEL */}
            <div className="lg:col-span-2 bg-[#0a0a0c] p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden h-max">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/3"></div>
              
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10"><UploadCloud className="w-5 h-5 text-indigo-400"/> Upload Protocol</h2>
              
              <div className="space-y-4 relative z-10">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Document Title</label>
                  <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-[#121216] p-4 rounded-xl mt-1 border border-white/5 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-zinc-700 text-sm" placeholder="e.g. PHY 102 Past Questions 2024"/>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Course Code</label>
                  <input value={code} onChange={e=>setCode(e.target.value)} className="w-full bg-[#121216] p-4 rounded-xl mt-1 border border-white/5 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder-zinc-700 text-sm" placeholder="e.g. PHY 102"/>
                </div>
                
                <div className="pt-2">
                  <label className={`w-full p-8 border-2 border-dashed rounded-2xl block text-center cursor-pointer transition-all ${isUploading ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'}`}>
                    <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading}/>
                    <div className="flex flex-col items-center justify-center gap-2">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          <span className="text-sm font-bold text-indigo-400">Encrypting & Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-8 h-8 text-zinc-500" />
                          <span className="text-sm font-bold text-zinc-300">Click to Select PDF/DOC</span>
                          <span className="text-xs text-zinc-600">File will be synced to Supabase</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* MANAGE PANEL */}
            <div className="lg:col-span-3 bg-[#0a0a0c] p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Database className="w-5 h-5 text-emerald-400"/> Database Index</h2>
                <button onClick={fetchFiles} disabled={isRefreshing} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 text-zinc-400 hover:text-white">
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}/>
                </button>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {files.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600 font-medium text-sm">No files currently in the database.</div>
                ) : (
                  files.map(f => (
                    <div key={f.id} className="flex justify-between items-center p-4 bg-[#121216] rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                      <div className="flex items-center gap-3 overflow-hidden pr-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-zinc-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-white truncate">{f.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{f.course_code || 'DOC'}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{new Date(f.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={()=>handleDelete(f.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        ) : (
          /* BROADCAST PANEL */
          <div className="max-w-2xl mx-auto bg-[#0a0a0c] p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 font-serif">
              <div className="p-2 bg-cyan-500/10 rounded-xl"><Bell className="w-6 h-6 text-cyan-400"/></div> 
              Global Broadcast
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Transmission Subject</label>
                <input value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} className="w-full bg-[#121216] p-4 rounded-xl mt-1 border border-white/5 focus:outline-none focus:border-cyan-500/50 transition-colors text-white placeholder-zinc-700" placeholder="e.g. Server Maintenance Notice"/>
              </div>
              
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Transmission Payload</label>
                <textarea value={notifMsg} onChange={e=>setNotifMsg(e.target.value)} className="w-full bg-[#121216] p-4 rounded-xl mt-1 border border-white/5 focus:outline-none focus:border-cyan-500/50 transition-colors text-white placeholder-zinc-700 h-40 resize-none custom-scrollbar" placeholder="Enter message to blast to all student terminals..."/>
              </div>
              
              <button 
                onClick={sendBroadcast} 
                disabled={isSending || !notifMsg.trim()}
                className="w-full py-4 mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] text-white"
              >
                {isSending ? (
                   <><Loader2 className="w-5 h-5 animate-spin"/> Transmitting...</>
                ) : (
                   <><Send className="w-5 h-5"/> Initiate Broadcast</>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
