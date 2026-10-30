"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE } from '../config/api';

type Question = { _id: string; topic: string; text: string; options: string[] };

export default function TestEngine() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState('');
  const router = useRouter();

  useEffect(() => {
    setSubmissionId(uuidv4());
    fetchTest();
  }, []);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    if (timeLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, questions]);

  const fetchTest = async () => {
    const token = Cookies.get('token');
    if (!token) {
      alert("Please log in to take the mock test.");
      router.push('/login');
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/test/generate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.data || res.data.length === 0) {
        alert("No questions available in the question bank.");
        router.push('/dashboard');
        return;
      }
      setQuestions(res.data);
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading test:", error);
      const msg = error.response?.data?.message || "Failed to load test. Please make sure the backend server is running.";
      alert(msg);
      router.push('/dashboard');
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitTest = async () => {
    const token = Cookies.get('token');
    const finalSubmissionId = submissionId || uuidv4();
    try {
      await axios.post(`${API_BASE}/api/test/submit`, {
        submissionId: finalSubmissionId,
        answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Test Submitted Successfully!");
      router.push('/dashboard');
    } catch (error) {
      alert("Failed to submit test.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center font-sans">
        <div className="border-4 border-black bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-mono text-xs font-black uppercase tracking-widest text-[#7dd3fc] flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#7dd3fc] animate-ping" />
            GENERATING EXAM SUITE...
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isSelected = (optIdx: number) => answers[currentQ._id] === optIdx;

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Top Bar / Timer Header */}
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to abort this examination? Progress will be lost.")) {
                  router.push('/dashboard');
                }
              }}
              className="border-2 border-black bg-white px-3 py-1.5 font-black text-xs uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
            >
              ← ABORT TEST
            </button>
            <div className="hidden sm:block border-l-2 border-black h-6" />
            <span className="font-mono text-xs font-black uppercase tracking-wider text-zinc-600">
              MOCK EXAMINATION ENGINE
            </span>
          </div>

          <div className={`border-2 border-black px-4 py-1.5 font-mono text-sm font-black flex items-center gap-2 ${
            timeLeft < 60 ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-[#7dd3fc]'
          }`}>
            <span>TIME REMAINING:</span>
            <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Question Panel */}
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 mb-6">
          <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-6">
            <span className="font-mono text-xs font-black uppercase tracking-widest text-zinc-500">
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <span className="border-2 border-black bg-[#7dd3fc] text-black font-mono text-xs font-black uppercase px-2.5 py-0.5">
              {currentQ.topic}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-black leading-snug mb-8 tracking-tight">
            {currentQ.text}
          </h2>

          <div className="flex flex-col gap-3">
            {currentQ.options.map((opt, idx) => {
              const active = isSelected(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(currentQ._id, idx)}
                  className={`w-full text-left p-4 border-2 border-black font-mono text-sm transition-all flex items-start gap-3 ${
                    active
                      ? 'bg-black text-[#7dd3fc] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-[#f0f9ff] hover:translate-x-1'
                  }`}
                >
                  <span className={`inline-block font-black text-xs px-2 py-0.5 border ${
                    active ? 'border-[#7dd3fc] text-[#7dd3fc]' : 'border-black text-black'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 font-semibold leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation & Submit Controls */}
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="px-6 py-2.5 border-2 border-black bg-white text-black font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:hover:bg-white hover:bg-black hover:text-white transition-colors"
          >
            ← PREV
          </button>

          <div className="font-mono text-xs font-black uppercase text-zinc-600 hidden sm:block">
            {Object.keys(answers).length} OF {questions.length} ATTEMPTED
          </div>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={submitTest}
              className="px-6 py-2.5 border-2 border-black bg-red-600 hover:bg-black text-white font-black text-xs uppercase tracking-widest transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              FINALIZE & SUBMIT ✓
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="px-6 py-2.5 border-2 border-black bg-black text-white hover:bg-[#7dd3fc] hover:text-black font-black text-xs uppercase tracking-widest transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              NEXT →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
