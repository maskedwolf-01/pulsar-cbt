"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import {
  Send, Bot, Plus, MessageSquare, Menu, Loader2, Sparkles, Trash2, Edit2, ArrowLeft, User, Cpu
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

// --- V2.0 MARKDOWN RENDERER ---
const MarkdownRenderer = ({ text }: { text: string }) => {
  const lines = text.split('\n');
  const renderedContent = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = (key: number) => {
    if (tableBuffer.length === 0) return null;
    const headers = tableBuffer[0].split('|').filter(c => c.trim()).map(c => c.trim());
    const rows = tableBuffer.slice(2).map(row => row.split('|').filter(c => c.trim()).map(c => c.trim()));

    return (
      <div key={`table-${key}`} className="my-4 w-full overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0c] shadow-inner">
        <table className="w-full text-left text-sm border-collapse min-w-[400px]">
          <thead>
            <tr className="bg-white/5 text-indigo-300">
              {headers.map((h, i) => <th key={i} className="p-3 border-b border-white/10 font-bold whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                {row.map((cell, j) => <td key={j} className="p-3 align-top text-zinc-300 break-words" dangerouslySetInnerHTML={{__html: formatBold(cell)}}></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      inTable = true; tableBuffer.push(line);
    } else {
      if (inTable) { renderedContent.push(flushTable(i)); tableBuffer = []; inTable = false; }
      
      // HEADERS
      if (line.startsWith('### ')) renderedContent.push(<h3 key={i} className="text-indigo-300 font-bold text-lg mt-4 mb-2 break-words">{line.replace('### ', '')}</h3>);
      else if (line.startsWith('## ')) renderedContent.push(<h2 key={i} className="text-indigo-400 font-bold text-xl mt-5 mb-3 border-b border-white/10 pb-2 break-words">{line.replace('## ', '')}</h2>);
      
      // LISTS
      else if (line.startsWith('* ')) renderedContent.push(<div key={i} className="flex gap-2 ml-1 my-1"><span className="text-indigo-500 font-bold">•</span><span className="break-words text-zinc-300" dangerouslySetInnerHTML={{ __html: formatBold(line.replace('* ', '')) }}></span></div>);
      else if (line.startsWith('- ')) renderedContent.push(<div key={i} className="flex gap-2 ml-1 my-1"><span className="text-indigo-500 font-bold">•</span><span className="break-words text-zinc-300" dangerouslySetInnerHTML={{ __html: formatBold(line.replace('- ', '')) }}></span></div>);
      
      // STANDARD TEXT
      else if (line === '') renderedContent.push(<div key={i} className="h-2"></div>);
      else renderedContent.push(<p key={i} className="leading-relaxed break-words whitespace-pre-wrap text-zinc-300" dangerouslySetInnerHTML={{ __html: formatBold(line) }}></p>);
    }
  }
  if (inTable) renderedContent.push(flushTable(lines.length));
  return <div className="space-y-1 w-full">{renderedContent}</div>;
};

const formatBold = (text: string) => text ? text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>') : "";

// --- V2.0 DYNAMIC LOADER ---
const DynamicLoader = ({ attempt }: { attempt: number }) => {
  const states = ["Analyzing...", "Searching Database...", "Refining Answer...", "Optimizing..."];
  const [index, setIndex] = useState(0);
  useEffect(() => { const t = setInterval(() => setIndex(prev => (prev + 1) % states.length), 1500); return () => clearInterval(t); }, []);
  
  return (
    <div className="flex items-center gap-3 text-xs text-indigo-400 bg-indigo-500/10 px-4 py-2.5 rounded-full border border-indigo-500/20 w-fit shadow-inner">
      <Loader2 className="w-3.5 h-3.5 animate-spin"/>
      <span className="uppercase tracking-widest font-bold">
        {attempt > 0 ? `High Traffic... Retrying (${attempt}/3)` : states[index]}
      </span>
    </div>
  );
};

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0); 
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchSessions(); }, []);
  useEffect(() => { if(sessionId) fetchMessages(sessionId); }, [sessionId]);

  const fetchSessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data } = await supabase.from('chat_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        setSessions(data || []);
    }
  };

  const createSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title: 'New Conversation' }).select().single();
        if(data) { setSessions([data, ...sessions]); setSessionId(data.id); setMessages([]); setSidebarOpen(false); }
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase.from('chat_history').select('*').eq('session_id', id).order('created_at', { ascending: true });
    setMessages(data ? data.map(d => ({ role: d.role === 'model' ? 'ai' : 'user', text: d.message })) : []);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const renameSession = async (id: string) => {
    if (!editTitle.trim()) return;
    await supabase.from('chat_sessions').update({ title: editTitle }).eq('id', id);
    setSessions(sessions.map(s => s.id === id ? { ...s, title: editTitle } : s));
    setEditingId(null);
  };

  const confirmDelete = (id: string, e: any) => { e.stopPropagation(); setChatToDelete(id); setShowDeleteModal(true); };
  const executeDelete = async () => {
    if (chatToDelete) {
        await supabase.from('chat_sessions').delete().eq('id', chatToDelete);
        setSessions(sessions.filter(s => s.id !== chatToDelete));
        if (sessionId === chatToDelete) { setSessionId(null); setMessages([]); }
        setShowDeleteModal(false);
    }
  };

  // --- RETRY LOGIC (Points to the new Groq /api/chat route) ---
  const sendRequestWithRetry = async (text: string, currentHistory: any[], currentId: string, attempt = 0): Promise<string | null> => {
    setRetryCount(attempt);
    try {
        const res = await fetch('/api/chat', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: currentHistory }) 
        });
        
        if (res.status === 429) throw new Error("QUOTA_HIT");
        const data = await res.json();
        if (data.error) throw new Error(data.error); 
        return data.reply;

    } catch (error: any) {
        // Wait 8 Seconds if Quota Hit
        if (error.message === "QUOTA_HIT" && attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 8000));
            return sendRequestWithRetry(text, currentHistory, currentId, attempt + 1);
        }
        return null; 
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    let currentId = sessionId;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!currentId && user) {
      const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title: input.slice(0, 25) }).select().single();
      if(data) { setSessions([data, ...sessions]); setSessionId(data.id); currentId = data.id; }
    }

    const text = input; 
    setInput(''); 
    setLoading(true); 
    setRetryCount(0);
    
    // Format history for the new API
    const historyForAPI = messages.map(m => ({ role: m.role, content: m.text }));
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    if(user && currentId) await supabase.from('chat_history').insert({ user_id: user.id, session_id: currentId, role: 'user', message: text });

    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    const reply = await sendRequestWithRetry(text, historyForAPI, currentId || '');

    if (reply) {
        setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        if(user && currentId) await supabase.from('chat_history').insert({ user_id: user.id, session_id: currentId, role: 'model', message: reply });
    } else {
        setMessages(prev => [...prev, { role: 'ai', text: "⚠️ The AI server is currently busy. Please wait a moment and try again." }]);
    }
    setLoading(false); 
    setRetryCount(0);
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div className="flex h-[100dvh] bg-[#030305] text-white font-sans overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* V2 DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0a0c] border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in-up">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20"><Trash2 className="w-8 h-8 text-rose-500"/></div>
              <h3 className="text-2xl font-bold text-white font-serif tracking-tight">Delete Chat?</h3>
              <p className="text-sm text-zinc-400 mt-2">This conversation will be permanently removed.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm text-white transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-sm text-white transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)]">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR (HISTORY) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0c] border-r border-white/5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-4 md:p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/dashboard" className="p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4"/></Link>
            <button onClick={createSession} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pl-2 mb-3">Chat History</div>
            {sessions.map(s => (
              <div key={s.id} onClick={() => { setSessionId(s.id); setSidebarOpen(false); }} className={`group w-full text-left p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all border ${sessionId === s.id ? 'bg-[#121216] border-white/10 shadow-inner' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                {editingId === s.id ? (
                  <input autoFocus className="bg-[#030305] border border-indigo-500/50 rounded-lg px-3 py-1.5 w-full text-sm text-white focus:outline-none" value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => renameSession(s.id)} onKeyDown={e => e.key === 'Enter' && renameSession(s.id)} />
                ) : ( 
                  <div className="flex items-center gap-3 truncate w-full">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${sessionId === s.id ? 'text-indigo-400' : 'text-zinc-600'}`}/>
                    <span className={`text-sm truncate max-w-[130px] ${sessionId === s.id ? 'text-white font-medium' : 'text-zinc-400'}`}>{s.title}</span>
                  </div> 
                )}
                <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity pl-2">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                  <button onClick={(e) => confirmDelete(s.id, e)} className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in"></div>}

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative h-full bg-[#030305]">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 z-30 flex-none">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="text-zinc-400 hover:text-white"><Menu className="w-6 h-6"/></button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-center">
                 <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-bold text-white font-serif tracking-tight">Nexus AI Tutor</span>
            </div>
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-80 relative z-10 animate-fade-in-up">
              <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <Sparkles className="w-10 h-10 text-indigo-400"/>
              </div>
              <h1 className="text-3xl font-bold text-white font-serif tracking-tight">Hello, Scholar.</h1>
              <p className="text-zinc-500 mt-2 text-center max-w-sm leading-relaxed">I am your AI study assistant. Ask me to explain a concept or solve a problem.</p>
            </div>
          ) : (
            <div className="space-y-6 relative z-10 max-w-3xl mx-auto w-full">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#121216] border border-white/10 flex items-center justify-center mt-1 flex-shrink-0 shadow-lg">
                      <Cpu className="w-4 h-4 md:w-5 md:h-5 text-indigo-400"/>
                    </div>
                  )}
                  
                  <div className={`p-4 md:p-5 rounded-3xl text-sm md:text-base leading-relaxed shadow-lg max-w-[90%] md:max-w-[85%] break-words ${
                    msg.role === 'ai' 
                    ? 'bg-[#0a0a0c] border border-white/5 text-zinc-300 rounded-tl-sm' 
                    : 'bg-indigo-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  }`}>
                    {msg.role === 'ai' ? <MarkdownRenderer text={msg.text} /> : msg.text}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#121216] border border-white/10 flex items-center justify-center mt-1 flex-shrink-0 shadow-lg">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-zinc-400"/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {loading && (
            <div className="flex gap-4 mt-6 max-w-3xl mx-auto w-full relative z-10">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#121216] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Cpu className="w-4 h-4 md:w-5 md:h-5 text-indigo-400"/>
              </div>
              <DynamicLoader attempt={retryCount} />
            </div>
          )}
          
          <div ref={scrollRef} className="h-4"></div>
          {/* Extra padding on mobile to clear the bottom input and nav */}
          <div className="h-32 md:h-24"></div> 
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-[72px] md:bottom-0 left-0 w-full bg-gradient-to-t from-[#030305] via-[#030305]/95 to-transparent z-40 p-4 pt-10">
          <div className="max-w-3xl mx-auto relative">
            <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl relative z-10">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask Nexus anything..." 
                className="flex-1 bg-transparent border-none text-white px-4 py-3 text-sm focus:outline-none placeholder:text-zinc-600" 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || loading} 
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
                  input.trim() && !loading 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                  : 'bg-[#121216] text-zinc-600'
                }`}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5"/>}
              </button>
            </div>
            <div className="text-center mt-2 pb-2 md:pb-4 hidden md:block">
               <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Powered by Llama 3</span>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Required so bottom nav displays on mobile below the chat input */}
      <BottomNav active="chat" />
    </div>
  );
}
