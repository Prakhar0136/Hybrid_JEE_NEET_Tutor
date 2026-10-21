"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
            // 1. Create the user
            await axios.post('http://localhost:5000/api/auth/signup', { name, email, password });

            // 2. Redirect to login on success
            alert("Account created successfully! Please log in.");
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSignup} className="p-8 bg-white shadow-md rounded-lg flex flex-col gap-4 w-96">
                <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>

                {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    required
                    className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    required
                    className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <p className="text-sm text-center text-gray-600 mt-2">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
                </p>
            </form>
        </div>
    );
}