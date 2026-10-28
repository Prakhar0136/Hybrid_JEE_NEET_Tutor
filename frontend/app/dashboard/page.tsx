"use client";
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type AnalyticsData = {
    metrics: {
        totalTests: number;
        averageScore: string;
        topWeakTopics: string[];
    };
    recentSubmissions: { createdAt: string; score: number; totalQuestions: number }[];
};

export default function Dashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchAnalytics = useCallback(async () => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            setError(null);
            const res = await axios.get('http://localhost:5000/api/test/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err: any) {
            console.error('Failed to fetch analytics:', err);
            if (err.response?.status === 401) {
                Cookies.remove('token');
                router.push('/login');
                return;
            }
            setError(err.response?.data?.message || 'Failed to load analytics. Please check that the backend is running.');
        }
    }, [router]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return <div className="flex h-screen items-center justify-center">Loading Dashboard...</div>;

    // Format chart data
    const chartData = data.recentSubmissions.map((sub, idx) => ({
        name: `Test ${idx + 1}`,
        score: sub.totalQuestions > 0 ? (sub.score / sub.totalQuestions) * 100 : 0
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your AI Study Dashboard</h1>
                    <button
                        onClick={() => router.push('/test')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                    >
                        Start New Test
                    </button>
                </div>

                {/* Top Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Tests Taken</h3>
                        <p className="text-4xl font-bold text-blue-600">{data.metrics.totalTests}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Average Accuracy</h3>
                        <p className="text-4xl font-bold text-green-600">{data.metrics.averageScore}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Needs Improvement</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {data.metrics.topWeakTopics.length > 0 ? (
                                data.metrics.topWeakTopics.map(topic => (
                                    <span key={topic} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                        {topic}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">Take tests to identify weak areas</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Trend</h2>
                    <div className="h-80 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#6B7280" fontSize={12} tickLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                Complete your first test to see your progress chart.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
