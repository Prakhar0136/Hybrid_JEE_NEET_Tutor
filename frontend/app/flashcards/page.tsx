"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import { API_BASE } from '../config/api';

type Flashcard = {
  front: string;
  back: string;
};

export default function Flashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/api/ai/flashcards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
    } catch (error) {
      alert("Failed to load flashcards.");
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="border-4 border-black bg-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-mono text-xs font-black uppercase tracking-widest text-[#7dd3fc] flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#7dd3fc] animate-ping" />
            SYNTHESIZING WEAK TOPIC FLASHCARDS...
          </p>
        </div>
      </div>
    </div>
  );

  if (cards.length === 0) return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">ARCHIVE EMPTY</p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">NO FLASHCARDS FOUND</h2>
          <p className="font-mono text-sm text-zinc-600 mb-6">Complete a mock examination to enable targeted AI weakness diagnostics.</p>
          <button
            onClick={() => router.push('/test')}
            className="w-full border-2 border-black bg-black py-3 font-black text-xs uppercase tracking-widest text-white hover:bg-[#7dd3fc] hover:text-black transition-colors"
          >
            START MOCK TEST →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 py-10 px-4 flex flex-col items-center">
        <div className="max-w-2xl w-full">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b-4 border-black pb-4 gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">MODULE // REVISION</p>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">TARGETED FLASHCARDS</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/chat')}
                className="border-2 border-black bg-white px-3.5 py-1.5 font-black text-xs uppercase tracking-widest text-black hover:bg-[#7dd3fc] transition-colors"
              >
                AI CHAT
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="border-2 border-black bg-white px-3.5 py-1.5 font-black text-xs uppercase tracking-widest text-black hover:bg-[#7dd3fc] transition-colors"
              >
                DASHBOARD
              </button>
            </div>
          </div>

          {/* Flashcard Container */}
          <div
            className="relative w-full h-84 cursor-pointer perspective-1000 mb-8"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

              {/* Front of Card */}
              <div className="absolute w-full h-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between p-8 backface-hidden">
                <div className="flex justify-between items-center border-b-2 border-black pb-3">
                  <span className="font-mono text-xs font-black uppercase tracking-widest bg-black text-[#7dd3fc] px-2.5 py-0.5">
                    CARD #{currentIndex + 1} // PROMPT
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-400">CLICK TO FLIP ↵</span>
                </div>

                <div className="my-auto py-4">
                  <h2 className="text-2xl sm:text-3xl font-black text-center text-black tracking-tight leading-snug">
                    {cards[currentIndex].front}
                  </h2>
                </div>

                <div className="text-center border-t-2 border-black/10 pt-3">
                  <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    RECALL THE THEOREM, REACTION OR FORMULA
                  </span>
                </div>
              </div>

              {/* Back of Card */}
              <div className="absolute w-full h-full bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between p-8 backface-hidden rotate-y-180">
                <div className="flex justify-between items-center border-b-2 border-zinc-800 pb-3">
                  <span className="font-mono text-xs font-black uppercase tracking-widest bg-[#7dd3fc] text-black px-2.5 py-0.5">
                    EXPLANATION // SOLUTION
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-400">CLICK TO FLIP ↵</span>
                </div>

                <div className="my-auto py-4">
                  <p className="text-lg sm:text-xl font-mono text-zinc-100 text-center leading-relaxed font-bold">
                    {cards[currentIndex].back}
                  </p>
                </div>

                <div className="text-center border-t-2 border-zinc-800 pt-3">
                  <span className="font-mono text-xs font-bold text-[#7dd3fc] uppercase tracking-widest">
                    CONCEPT MASTERED? ADVANCE TO NEXT
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className="px-6 py-2.5 border-2 border-black bg-white text-black font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:hover:bg-white hover:bg-black hover:text-white transition-colors"
            >
              ← PREV
            </button>
            <div className="font-mono text-sm font-black bg-zinc-100 border-2 border-black px-4 py-1.5">
              {currentIndex + 1} / {cards.length}
            </div>
            <button
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
              className="px-6 py-2.5 border-2 border-black bg-black text-white font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:hover:bg-black hover:bg-[#7dd3fc] hover:text-black transition-colors"
            >
              NEXT →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
