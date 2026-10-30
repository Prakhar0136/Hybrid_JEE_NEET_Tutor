"use client";
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { API_BASE } from '../config/api';

type Message = { role: 'user' | 'assistant'; content: string; sources?: string[] };
type Session = { _id: string; title: string; updatedAt: string };

export default function Chat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'SYSTEM READY. Ask any JEE/NEET problem, equation, or concept.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    const token = Cookies.get('token');
    try {
      const res = await axios.get(`${API_BASE}/api/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch sessions");
    }
  };

  const loadSession = async (id: string) => {
    const token = Cookies.get('token');
    try {
      const res = await axios.get(`${API_BASE}/api/chat/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveSessionId(id);
      setMessages(res.data.messages);
    } catch (error) {
      alert("Failed to load session.");
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([{ role: 'assistant', content: 'NEW SESSION INITIALIZED. Enter your JEE/NEET query below.' }]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/chat`,
        { query: userMessage.content, sessionId: activeSessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      }]);

      if (!activeSessionId) {
        setActiveSessionId(res.data.sessionId);
        fetchSessions();
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '**Error:** Connection failed. Check server status.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-100 font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Brutalist Sidebar */}
        <aside className="w-72 bg-black text-white flex flex-col border-r-4 border-black">
          <div className="p-4 border-b-2 border-zinc-800 flex justify-between items-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">
              SESSION ARCHIVE
            </span>
            <span className="font-mono text-xs text-zinc-500">[{sessions.length}]</span>
          </div>

          <div className="p-4 border-b-2 border-zinc-800">
            <button
              onClick={startNewChat}
              className="w-full border-2 border-[#7dd3fc] bg-transparent hover:bg-[#7dd3fc] text-[#7dd3fc] hover:text-black font-black py-2.5 px-4 text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <span>+</span> NEW SESSION
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {sessions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">NO SAVED SESSIONS</p>
              </div>
            ) : (
              sessions.map(s => (
                <div
                  key={s._id}
                  onClick={() => loadSession(s._id)}
                  className={`p-3.5 text-xs font-mono cursor-pointer transition-colors truncate flex items-center justify-between ${
                    activeSessionId === s._id
                      ? 'bg-[#7dd3fc] text-black font-bold border-l-4 border-white'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <span className="truncate">{s.title || "Untitled Session"}</span>
                  {activeSessionId === s._id && <span className="text-[10px] uppercase font-black ml-1">●</span>}
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Stream */}
        <main className="flex-1 flex flex-col h-full bg-zinc-50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] border-2 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    msg.role === 'user'
                      ? 'bg-[#7dd3fc] text-black'
                      : 'bg-white text-black'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/20">
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider">
                      {msg.role === 'user' ? 'STUDENT' : 'AI TUTOR CORE'}
                    </span>
                  </div>

                  <div className="font-mono text-sm leading-relaxed overflow-x-auto">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          strong: ({ ...props }) => <strong className="font-black text-black" {...props} />,
                          code: ({ ...props }) => <code className="bg-zinc-200 px-1 py-0.5 text-xs font-mono text-black border border-black/30" {...props} />,
                          ul: ({ ...props }) => <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />,
                          ol: ({ ...props }) => <ol className="list-decimal pl-4 space-y-1 mb-2" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="m-0 font-medium">{msg.content}</p>
                    )}
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t-2 border-dashed border-black/20 flex gap-1.5 flex-wrap items-center">
                      <span className="font-mono text-[10px] font-black uppercase text-zinc-600 mr-1">SOURCES:</span>
                      {msg.sources.map((src, i) => (
                        <span key={i} className="bg-black text-[#7dd3fc] font-mono text-[10px] px-2 py-0.5 border border-black uppercase font-bold">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="border-2 border-black bg-black text-[#7dd3fc] p-3 font-mono text-xs uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="w-2 h-2 bg-[#7dd3fc] animate-ping" />
                  COMPUTING RESPONSE...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Entry */}
          <footer className="p-4 bg-white border-t-4 border-black">
            <form onSubmit={sendMessage} className="flex gap-2 max-w-5xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="TYPE FORMULA, QUESTION, OR TOPIC..."
                className="flex-1 border-2 border-black bg-white p-3.5 font-mono text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:bg-[#f0f9ff] focus:border-black transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="border-2 border-black bg-black text-white hover:bg-[#7dd3fc] hover:text-black disabled:opacity-40 font-black px-8 py-3.5 text-xs uppercase tracking-widest transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                TRANSMIT →
              </button>
            </form>
          </footer>
        </main>
      </div>
    </div>
  );
}
