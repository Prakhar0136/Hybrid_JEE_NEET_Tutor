"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

type Question = { _id: string; topic: string; text: string; options: string[] };

export default function TestEngine() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
      const res = await axios.get('http://localhost:5000/api/test/generate', {
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
    // In Day 7, we will send these answers to the backend for scoring
    console.log("Submitting Answers:", answers);
    alert("Test Submitted! (Scoring logic coming in Day 7)");
    router.push('/dashboard');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Test...</div>;
  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header & Timer */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6">
          <h1 className="text-xl font-bold text-gray-800">JEE/NEET Mock Test</h1>
          <div className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
            Time Left: {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-4 border-b pb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{currentQ.topic}</span>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-gray-800">{currentQ.text}</h2>

          <div className="flex flex-col gap-3">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(currentQ._id, idx)}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${answers[currentQ._id] === idx
                  ? 'border-blue-600 bg-blue-50 text-blue-800 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <span className="inline-block w-8 font-semibold">{String.fromCharCode(65 + idx)}.</span> {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button onClick={submitTest} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded">
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
            >
              Next
            </button>
          )}
        </div>

      </div>
    </div>
  );
}