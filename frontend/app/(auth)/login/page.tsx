"use client";
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            // Save token to cookie so Next.js Middleware can read it
            Cookies.set('token', res.data.access_token, { expires: 1 });
            router.push('/dashboard');
        } catch (error) {
            alert("Login failed. Check credentials.");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleLogin} className="p-8 bg-white shadow-md rounded-lg flex flex-col gap-4 w-96">
                <h2 className="text-2xl font-bold text-center">AI Tutor Login</h2>
                <input
                    type="email" placeholder="Email" required className="border p-2 rounded text-black"
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="password" placeholder="Password" required className="border p-2 rounded text-black"
                    onChange={e => setPassword(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded font-semibold">Login</button>
            </form>
        </div>
    );
}