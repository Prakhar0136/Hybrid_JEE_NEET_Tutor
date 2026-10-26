"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get('token');
            if (!token) {
                router.push('/login');
                return;
            }
            try {
                const res = await axios.get(`${API_BASE}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch user", error);
                Cookies.remove('token');
                router.push('/login');
            }
        };
        fetchUser();
    }, [router]);

    const handleLogout = () => {
        Cookies.remove('token');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                        JT
                    </div>
                    <span className="font-semibold text-slate-800">JEE/NEET Tutor</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 hidden sm:inline">{user.email}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Greeting Hero */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-md mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
                    <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                        Your personalized AI tutor is ready to help you crack JEE and NEET with NCERT-grounded explanations, formula breakdowns, and practice.
                    </p>
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* AI Chat Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4 font-semibold">
                                💬
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-1">NCERT AI Tutor</h2>
                            <p className="text-sm text-slate-600 mb-6">
                                Ask doubt questions, physics derivations, organic reaction mechanisms, and biology concepts with step-by-step LaTeX math.
                            </p>
                        </div>
                        <Link
                            href="/chat"
                            className="w-full text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors shadow-xs"
                        >
                            Open Chat Tutor →
                        </Link>
                    </div>

                    {/* Flashcards Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 font-semibold">
                                📇
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-1">Revision Flashcards</h2>
                            <p className="text-sm text-slate-600 mb-6">
                                Quick spaced-repetition cards covering high-yield formulas, physical constants, and definitions.
                            </p>
                        </div>
                        <Link
                            href="/flashcards"
                            className="w-full text-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-xl text-sm transition-colors"
                        >
                            Review Flashcards →
                        </Link>
                    </div>

                    {/* Mock Test Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-4 font-semibold">
                                📝
                            </div>
                            <h2 className="text-lg font-bold text-slate-800 mb-1">Practice Test</h2>
                            <p className="text-sm text-slate-600 mb-6">
                                Attempt chapter-wise timed quizzes and get instant RAG-based diagnostic evaluations.
                            </p>
                        </div>
                        <Link
                            href="/test"
                            className="w-full text-center py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-xl text-sm transition-colors"
                        >
                            Start Practice Test →
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}