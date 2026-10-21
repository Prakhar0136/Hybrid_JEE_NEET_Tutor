"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const [user, setUser] = useState<{ name: string, email: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = Cookies.get('token');
            try {
                const res = await axios.get('http://localhost:5000/api/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (error) {
                console.error("Failed to fetch user");
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        Cookies.remove('token');
        router.push('/login');
    };

    if (!user) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
            <p className="text-gray-600">Your AI Tutor is ready. Let's crush the exams!</p>
        </div>
    );
}