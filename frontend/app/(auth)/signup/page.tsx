"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { API_BASE } from '../../config/api';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_BASE}/api/auth/signup`, { name, email, password });
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left accent panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12">
                <div>
                    <p className="text-[#7dd3fc] font-black text-xs uppercase tracking-[0.3em]">JEE / NEET</p>
                    <h1 className="mt-4 text-6xl font-black text-white uppercase leading-none tracking-tighter">
                        YOUR<br />RANK.<br /><span className="text-[#7dd3fc]">YOUR</span><br />FUTURE.
                    </h1>
                </div>
                <div className="border-t-2 border-zinc-700 pt-6">
                    <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">Join thousands preparing</p>
                    <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">with AI-powered tools</p>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
                <div className="w-full max-w-sm">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="inline-block border-4 border-black bg-black px-3 py-1 mb-4">
                            <span className="font-black text-xs uppercase tracking-widest text-[#7dd3fc]">New account</span>
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">CREATE<br />ACCOUNT</h2>
                        <p className="mt-2 font-mono text-sm text-zinc-500 uppercase tracking-wider">Begin your prep journey</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 border-l-4 border-red-600 bg-red-50 px-4 py-3 flex items-center justify-between">
                            <p className="font-mono text-sm text-red-600 uppercase">{error}</p>
                            {error.toLowerCase().includes("already exists") && (
                                <Link href="/login" className="font-black text-xs text-black underline ml-3 shrink-0 uppercase">
                                    Sign In →
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                            <label className="block font-black text-xs uppercase tracking-widest text-black mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                required
                                className="w-full border-2 border-black bg-white px-4 py-3 font-mono text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-[#7dd3fc] focus:bg-[#f0f9ff] transition-colors"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block font-black text-xs uppercase tracking-widest text-black mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="student@example.com"
                                required
                                className="w-full border-2 border-black bg-white px-4 py-3 font-mono text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-[#7dd3fc] focus:bg-[#f0f9ff] transition-colors"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block font-black text-xs uppercase tracking-widest text-black mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full border-2 border-black bg-white px-4 py-3 font-mono text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:border-[#7dd3fc] focus:bg-[#f0f9ff] transition-colors"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full border-4 border-black bg-black py-4 font-black text-sm uppercase tracking-widest text-white transition-colors hover:bg-[#7dd3fc] hover:text-black disabled:opacity-50"
                        >
                            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
                        </button>
                    </form>

                    {/* Switch */}
                    <div className="mt-8 border-t-2 border-black pt-6">
                        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-black text-black underline hover:text-[#0284c7]">
                                SIGN IN
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
