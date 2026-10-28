
"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AnalyticsData = {
    metrics: {
        totalTests: number;
        averageScore: string;
        topWeakTopics: string[];
    };
    recentSubmissions: {
        createdAt: string;
        score: number;
        totalQuestions: number;
    }[];
};

export default function Dashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [studyPlan, setStudyPlan] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);

    const router = useRouter();

    // Fetch dashboard analytics
    const fetchAnalytics = useCallback(async () => {
        const token = Cookies.get("token");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            setError(null);

            const res = await axios.get(
                "http://localhost:5000/api/test/analytics",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setData(res.data);
        } catch (err: any) {
            console.error("Failed to fetch analytics:", err);

            if (err.response?.status === 401) {
                Cookies.remove("token");
                router.push("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load analytics. Please check that the backend is running."
            );
        }
    }, [router]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Generate a personalized AI study plan
    const generateAIPlan = async () => {
        const token = Cookies.get("token");

        if (!token) {
            router.push("/login");
            return;
        }

        setIsGenerating(true);
        setPlanError(null);

        try {
            const res = await axios.get(
                "http://localhost:5000/api/ai/study-plan",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.data?.plan) {
                throw new Error("The server returned an empty study plan.");
            }

            setStudyPlan(res.data.plan);
        } catch (err: any) {
            console.error("Failed to generate AI study plan:", err);

            setPlanError(
                err.response?.data?.message ||
                err.message ||
                "Failed to generate AI plan. Please try again."
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // Loading state
    if (!data && !error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                Loading Dashboard...
            </div>
        );
    }

    // Analytics error state
    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
                <p className="font-medium text-red-600">{error}</p>

                <button
                    onClick={fetchAnalytics}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return null;

    // Prepare chart data
    const chartData = data.recentSubmissions.map((sub, idx) => ({
        name: `Test ${idx + 1}`,
        score:
            sub.totalQuestions > 0
                ? (sub.score / sub.totalQuestions) * 100
                : 0,
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                        Your AI Study Dashboard
                    </h1>

                    <button
                        onClick={() => router.push("/test")}
                        className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
                    >
                        Start New Test
                    </button>
                </div>

                {/* Top Metric Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Total Tests */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Total Tests Taken
                        </h3>

                        <p className="text-4xl font-bold text-blue-600">
                            {data.metrics.totalTests}
                        </p>
                    </div>

                    {/* Average Accuracy */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Average Accuracy
                        </h3>

                        <p className="text-4xl font-bold text-green-600">
                            {data.metrics.averageScore}%
                        </p>
                    </div>

                    {/* Weak Topics */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                            Needs Improvement
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {data.metrics.topWeakTopics.length > 0 ? (
                                data.metrics.topWeakTopics.map((topic) => (
                                    <span
                                        key={topic}
                                        className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
                                    >
                                        {topic}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">
                                    Take tests to identify weak areas
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart + AI Study Plan */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Performance Chart */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                        <h2 className="mb-6 text-xl font-bold text-gray-800">
                            Performance Trend
                        </h2>

                        <div className="h-80 w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <LineChart
                                        data={chartData}
                                        margin={{
                                            top: 5,
                                            right: 20,
                                            bottom: 5,
                                            left: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#E5E7EB"
                                        />

                                        <XAxis
                                            dataKey="name"
                                            stroke="#6B7280"
                                            fontSize={12}
                                            tickLine={false}
                                        />

                                        <YAxis
                                            stroke="#6B7280"
                                            fontSize={12}
                                            tickLine={false}
                                            domain={[0, 100]}
                                            tickFormatter={(value) =>
                                                `${value}%`
                                            }
                                        />

                                        <Tooltip
                                            formatter={(value) => [
                                                `${Number(value).toFixed(1)}%`,
                                                "Accuracy",
                                            ]}
                                            contentStyle={{
                                                borderRadius: "8px",
                                                border: "none",
                                                boxShadow:
                                                    "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            }}
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            name="Accuracy"
                                            stroke="#2563EB"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4,
                                                fill: "#2563EB",
                                            }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-center text-gray-400">
                                    Complete your first test to see your
                                    progress chart.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Gemini AI Tutor */}
                    <div className="flex flex-col rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-sm lg:col-span-3">
                        <h2 className="mb-2 text-xl font-bold text-indigo-900">
                            ✨ AI Study Tutor
                        </h2>

                        <p className="mb-6 text-sm text-indigo-700">
                            Get a personalized action plan based on your test
                            performance and weak areas.
                        </p>

                        {!studyPlan ? (
                            <>
                                {planError && (
                                    <div
                                        role="alert"
                                        className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                    >
                                        {planError}
                                    </div>
                                )}

                                <button
                                    onClick={generateAIPlan}
                                    disabled={isGenerating}
                                    className="mt-auto w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isGenerating
                                        ? "Analyzing Performance..."
                                        : "Generate My Study Plan"}
                                </button>
                            </>
                        ) : (
                            <div className="flex-1">
                                <div className="max-h-[500px] overflow-y-auto pr-2">
                                    <div className="prose prose-sm prose-indigo max-w-none break-words">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {studyPlan}
                                        </ReactMarkdown>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setStudyPlan(null);
                                        setPlanError(null);
                                    }}
                                    className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
                                >
                                    Clear Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
