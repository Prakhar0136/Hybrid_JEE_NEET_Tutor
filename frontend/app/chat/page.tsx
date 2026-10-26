"use client";
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useRouter } from 'next/navigation';

type Message = { role: 'user' | 'assistant'; content: string; sources?: string[] };
type Session = { _id: string; title: string; updatedAt: string };

export default function Chat() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI Tutor. Ask me any JEE/NEET question.' }
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
      const res = await axios.get('http://localhost:5000/api/chat/sessions', {
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
      const res = await axios.get(`http://localhost:5000/api/chat/sessions/${id}`, {
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
    setMessages([{ role: 'assistant', content: 'Hello! I am your AI Tutor. Ask me any JEE/NEET question.' }]);
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
        'http://localhost:5000/api/chat',
        { query: userMessage.content, sessionId: activeSessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      }]);

      // If this was a new chat, update the active session ID and refresh sidebar
      if (!activeSessionId) {
        setActiveSessionId(res.data.sessionId);
        fetchSessions();
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '**Error:** Connection failed.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="font-bold">Past Chats</h2>
          <button onClick={() => router.push('/dashboard')} className="text-xs text-gray-400 hover:text-white">Dash</button>
        </div>
        <div className="p-4">
          <button
            onClick={startNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2 mb-4 text-sm font-medium"
          >
            + New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map(s => (
            <div
              key={s._id}
              onClick={() => loadSession(s._id)}
              className={`p-3 text-sm cursor-pointer border-b border-gray-800 hover:bg-gray-800 truncate ${activeSessionId === s._id ? 'bg-gray-800 border-l-4 border-blue-500' : ''}`}
            >
              {s.title}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area (Same as Day 4, wrapped in flex-1) */}
      <main className="flex-1 flex flex-col h-full bg-white">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {/* Map over messages array here exactly as shown in Day 4 */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                <div className="prose prose-sm max-w-none">
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
                  ) : (<p className="m-0">{msg.content}</p>)}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-500 flex gap-2 flex-wrap">
                    {msg.sources.map((src, i) => <span key={i} className="bg-gray-200 px-2 rounded">{src}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-500 animate-pulse">Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <footer className="p-4 border-t border-gray-200">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border p-3 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 text-white px-6 py-3 rounded">Send</button>
          </form>
        </footer>
      </main>
    </div>
  );
}