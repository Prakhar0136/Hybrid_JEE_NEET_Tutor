"use client";
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useRouter } from 'next/navigation';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const STORAGE_KEY = 'jee_neet_ai_chat_history';

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hello! I am your **NCERT-grounded JEE/NEET AI Tutor**.\n\nAsk me any concept, formula, or problem in Physics, Chemistry, or Biology!'
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (err) {
      console.warn("Failed to restore chat history from localStorage", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save chat history whenever messages update
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.warn("Failed to save chat history", err);
      }
    }
  }, [messages, isLoaded]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Adjust textarea height automatically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear your current conversation?")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmedInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setLoading(true);

    try {
      // Send last 6 messages as conversation context
      const historyContext = updatedMessages
        .slice(-7, -1)
        .map(msg => ({ role: msg.role, content: msg.content }));

      const res = await axios.post(
        `${API_BASE}/api/chat`,
        { 
          query: trimmedInput,
          history: historyContext
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMessage: Message = {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        Cookies.remove('token');
        router.push('/login');
        return;
      }
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **Error:** Failed to connect to the tutor service. Please check your network or try again shortly.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-xs">
            AI
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-slate-800 leading-tight">JEE/NEET AI Tutor</h1>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              NCERT-Grounded RAG Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Start a new conversation"
          >
            Clear Chat
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Dashboard →
          </button>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 max-w-4xl w-full mx-auto flex flex-col gap-5">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="markdown-body space-y-2 text-sm sm:text-base">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="m-0 text-sm sm:text-base whitespace-pre-wrap">{msg.content}</p>
              )}

              {/* Source Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-slate-500">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    NCERT References:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-600 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-2.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              Searching NCERT & generating explanation...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-3 sm:p-4">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-end gap-2.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a JEE/NEET question... (Shift+Enter for new line)"
            className="flex-1 resize-none max-h-40 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base shadow-2xs leading-normal"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-11 sm:h-12 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm sm:text-base flex items-center justify-center transition-colors shadow-xs"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </footer>
    </div>
  );
}