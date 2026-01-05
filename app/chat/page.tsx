"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import {
  Send, Bot, Plus, MessageSquare, Menu, Loader2, Sparkles, Trash2, Edit2, ArrowLeft, User
} from 'lucide-react';

// --- MARKDOWN RENDERER ---
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
      <div key={`table-${key}`} className="my-4 w-full overflow-x-auto rounded-xl border border-zinc-700 bg-black/40 shadow-inner">
        <table className="w-full text-left text-sm border-collapse min-w-[400px]">
          <thead>
            <tr className="bg-zinc-800/50 text-purple-300">
              {headers.map((h, i) => <th key={i} className="p-3 border-b border-zinc-700 font-bold whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-700/30 last:border-0 hover:bg-zinc-800/20">
                {row.map((cell, j) => <td key={j} className="p-3 align-top text-zinc-300" dangerouslySetInnerHTML={{__html: formatBold(cell)}}></td>)}
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
      if (line.startsWith('### ')) renderedContent.push(<h3 key={i} className="text-purple-300 font-bold text-lg mt-4 mb-2">{line.replace('### ', '')}</h3>);
      else if (line.startsWith('## ')) renderedContent.push(<h2 key={i} className="text-purple-400 font-bold text-xl mt-5 mb-3 border-b border-zinc-700 pb-2">{line.replace('## ', '')}</h2>);
      else if (line.startsWith('* ')) renderedContent.push(<div key={i} className="flex gap-2 ml-1 my-1"><span className="text-purple-500 font-bold">•</span><span dangerouslySetInnerHTML={{ __html: formatBold(line.replace('* ', '')) }}></span></div>);
      else if (line === '') renderedContent.push(<div key={i} className="h-2"></div>);
      else renderedContent.push(<p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBold(line) }}></p>);
    }
  }
  if (inTable) renderedContent.push(flushTable(lines.length));
  return <div className="space-y-1">{renderedContent}</div>;
};

const formatBold = (text: string) => text ? text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-300 font-semibold">$1</strong>') : "";

// --- DYNAMIC LOADER (Fixed Typo Here) ---
const DynamicLoader = ({ attempt }: { attempt: number }) => {
  const states = ["Analyzing...", "Searching...", "Refining...", "Optimizing..."];
  const [index, setIndex] = useState(0);
  useEffect(() => { const t = setInterval(() => setIndex(prev => (prev + 1) % states.length), 1500); return () => clearInterval(t); }, []);
  
  return (
    <div className="flex items-center gap-3 text-xs text-purple-400 bg-purple-500/5 px-4 py-2 rounded-full border border-purple-500/20 w-fit animate-pulse">
      <Loader2 className="w-3 h-3 animate-spin"/>
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
        const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title: 'New Chat' }).select().single();
        if(data) { setSessions([data, ...sessions]); setSessionId(data.id); setMessages([]); setSidebarOpen(false); }
    }
  };

  const fetchMessages = async (id: string) => {
    const { data } = await supabase.from('chat_history').select('*').eq('session_id', id).order('created_at', { ascending: true });
    setMessages(data ? data.map(d => ({ role: d.role === 'model' ? 'ai' : 'user', text: d.message })) : []);
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

  // --- RETRY LOGIC (Recursive) ---
  const sendRequestWithRetry = async (text: string, currentId: string, attempt = 0): Promise<string | null> => {
    setRetryCount(attempt);
    try {
        const res = await fetch('/api/ai', { 
            method: 'POST', 
            body: JSON.stringify({ prompt: text, type: 'chat' }) 
        });
        
        // 429 = QUOTA HIT
        if (res.status === 429) {
            throw new Error("QUOTA_HIT");
        }

        const data = await res.json();
        if (data.error) throw new Error(data.error); 
        
        return data.reply;

    } catch (error: any) {
        // If quota hit, wait 5 seconds and try again (up to 3 times)
        if (error.message === "QUOTA_HIT" && attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            return sendRequestWithRetry(text, currentId, attempt + 1);
        }
        return null; 
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    let currentId = sessionId;
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!currentId && user) {
      const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title: input.slice(0, 20) }).select().single();
      if(data) { setSessions([data, ...sessions]); setSessionId(data.id); currentId = data.id; }
    }

    const text = input; setInput(''); setLoading(true); setRetryCount(0);
    setMessages(prev => [...prev, { role: 'user', text }]);
    if(user && currentId) await supabase.from('chat_history').insert({ user_id: user.id, session_id: currentId, role: 'user', message: text });

    // Send with Retry
    const reply = await sendRequestWithRetry(text, currentId || '');

    if (reply) {
        setMessages(prev => [...prev, { role: 'ai', text: reply }]);
        if(user && currentId) await supabase.from('chat_history').insert({ user_id: user.id, session_id: currentId, role: 'model', message: reply });
    } else {
        setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Server busy. Please wait 1 minute." }]);
    }
    setLoading(false); setRetryCount(0);
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-[100dvh] bg-[#09090b] text-zinc-200 font-sans overflow-hidden relative">
      
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20"><Trash2 className="w-8 h-8 text-red-500"/></div>
              <h3 className="text-xl font-bold text-white">Delete Chat?</h3>
              <p className="text-sm text-zinc-400 mt-2">This cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="py-3 rounded-xl bg-zinc-800 font-bold text-sm text-white">Cancel</button>
              <button onClick={executeDelete} className="py-3 rounded-xl bg-red-600 font-bold text-sm text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/dashboard" className="p-2 hover:bg-zinc-800 rounded-full"><ArrowLeft className="w-5 h-5"/></Link>
            <button onClick={createSession} className="flex-1 flex items-center gap-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 p-3 rounded-xl text-sm font-bold justify-center transition-colors"><Plus className="w-4 h-4" /> New Chat</button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest pl-2 mb-2">History</div>
            {sessions.map(s => (
              <div key={s.id} onClick={() => { setSessionId(s.id); setSidebarOpen(false); }} className={`group w-full text-left p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all ${sessionId === s.id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/50'}`}>
                {editingId === s.id ? (
                  <input autoFocus className="bg-black border border-zinc-700 rounded px-2 py-1 w-full text-xs text-white" value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => renameSession(s.id)} onKeyDown={e => e.key === 'Enter' && renameSession(s.id)} />
                ) : ( <div className="flex items-center gap-3 truncate w-full"><MessageSquare className={`w-4 h-4 flex-shrink-0 ${sessionId === s.id?'text-purple-400':'text-zinc-600'}`}/><span className="text-sm truncate max-w-[130px]">{s.title}</span></div> )}
                <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-zinc-900 pl-2">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }} className="p-2 hover:bg-zinc-700 rounded-lg"><Edit2 className="w-3.5 h-3.5"/></button>
                  <button onClick={(e) => confirmDelete(s.id, e)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/80 z-40 md:hidden"></div>}

      <div className="flex-1 flex flex-col relative h-full">
        <header className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 z-30 flex-none">
          <div className="flex items-center gap-4"><button onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6"/></button><span className="font-bold text-purple-400">Nexus 1.0</span></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4"><Sparkles className="w-8 h-8 text-purple-500"/></div>
              <h1 className="text-2xl font-bold text-white">Hello, Scholar</h1>
              <p className="text-zinc-500 mt-2">Ready to assist.</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 mb-6 max-w-3xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center mt-1 flex-shrink-0"><Bot className="w-4 h-4 text-purple-400"/></div>}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[95%] md:max-w-[85%] ${msg.role === 'ai' ? 'bg-transparent text-zinc-300' : 'bg-zinc-800 text-white rounded-tr-none'}`}>
                  {msg.role === 'ai' ? <MarkdownRenderer text={msg.text} /> : msg.text}
                </div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mt-1 flex-shrink-0"><User className="w-4 h-4 text-zinc-400"/></div>}
              </div>
            ))
          )}
          
          {loading && <div className="flex gap-4 mb-6 max-w-3xl mx-auto"><div className="w-8 h-8 rounded-full bg-purple-600/10 flex items-center justify-center"><Bot className="w-4 h-4 text-purple-500"/></div><DynamicLoader attempt={retryCount} /></div>}
          
          <div ref={scrollRef}></div>
          <div className="h-24"></div>
        </div>

        <div className="p-4 bg-gradient-to-t from-black via-zinc-950 to-transparent z-20 flex-none pb-8 md:pb-4">
          <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-2 flex items-center shadow-2xl">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Nexus anything..." className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder:text-zinc-600" onKeyDown={(e) => e.key === 'Enter' && handleSend()}/>
            <button onClick={handleSend} disabled={!input.trim() || loading} className={`p-3 rounded-xl transition-all ${input.trim() ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-600'}`}><Send className="w-5 h-5"/></button>
          </div>
        </div>
      </div>
    </div>
  );
    }
    
