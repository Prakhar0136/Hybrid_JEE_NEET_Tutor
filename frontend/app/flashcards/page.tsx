"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

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
      const res = await axios.get('http://localhost:5000/api/ai/flashcards', {
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
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // wait for flip back
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-500">
        AI is generating your targeted flashcards...
      </div>
    </div>
  );
  if (cards.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
        <p>No flashcards generated yet. Take a test to let AI pinpoint topics!</p>
        <button
          onClick={() => router.push('/test')}
          className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 transition"
        >
          Start a Test
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-10 px-4 flex flex-col items-center">
        <div className="max-w-2xl w-full">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Targeted Revision</h1>
            <p className="text-sm text-gray-500 mt-1">Flip through high-yield concepts tailored to your weak areas</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/chat')} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition">
              💬 Chat
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition">
              📊 Dashboard
            </button>
          </div>
        </div>

        {/* Flashcard Container */}
        <div
          className="relative w-full h-80 cursor-pointer perspective-1000 mb-8"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

            {/* Front of Card */}
            <div className="absolute w-full h-full bg-white border-2 border-blue-100 rounded-2xl shadow-lg flex items-center justify-center p-8 backface-hidden">
              <h2 className="text-2xl font-semibold text-center text-gray-800">
                {cards[currentIndex].front}
              </h2>
              <div className="absolute bottom-4 text-gray-400 text-sm">Click to flip</div>
            </div>

            {/* Back of Card */}
            <div className="absolute w-full h-full bg-blue-600 text-white border-2 border-blue-600 rounded-2xl shadow-lg flex items-center justify-center p-8 backface-hidden rotate-y-180">
              <h2 className="text-xl font-medium text-center leading-relaxed">
                {cards[currentIndex].back}
              </h2>
            </div>

          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition"
          >
            Previous
          </button>
          <span className="font-semibold text-gray-500">
            {currentIndex + 1} / {cards.length}
          </span>
          <button
            onClick={nextCard}
            disabled={currentIndex === cards.length - 1}
            className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition"
          >
            Next
          </button>
        </div>

      </div>
      </div>
    </div>
  );
}