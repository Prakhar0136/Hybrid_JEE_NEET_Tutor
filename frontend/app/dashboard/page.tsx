
"use client";

import { useEffect, useState, useCallback, type ComponentPropsWithoutRef } from "react";
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
import Navbar from "../components/Navbar";

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

/* ── Custom markdown component overrides for beautiful rendering ── */
const markdownComponents = {
    h1: (props: ComponentPropsWithoutRef<"h1">) => (
        <h1
            className="mb-4 mt-6 border-b border-indigo-200 pb-2 text-2xl font-extrabold tracking-tight text-indigo-900"
            {...props}
        />
    ),
    h2: (props: ComponentPropsWithoutRef<"h2">) => (
        <h2
            className="mb-3 mt-8 flex items-center gap-2 text-xl font-bold text-indigo-800"
            {...props}
        />
    ),
    h3: (props: ComponentPropsWithoutRef<"h3">) => (
        <h3
            className="mb-2 mt-6 text-lg font-semibold text-indigo-700"
            {...props}
        />
    ),
    p: (props: ComponentPropsWithoutRef<"p">) => (
        <p className="mb-3 leading-relaxed text-gray-700" {...props} />
    ),
    strong: (props: ComponentPropsWithoutRef<"strong">) => (
        <strong className="font-bold text-indigo-900" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<"ul">) => (
        <ul className="mb-4 ml-1 list-none space-y-1.5" {...props} />
    ),
    ol: (props: ComponentPropsWithoutRef<"ol">) => (
        <ol className="mb-4 ml-1 list-none space-y-1.5" {...props} />
    ),
    li: (props: ComponentPropsWithoutRef<"li">) => (
        <li className="flex items-start gap-2 text-gray-700">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
            <span {...props} />
        </li>
    ),
    table: (props: ComponentPropsWithoutRef<"table">) => (
        <div className="my-4 overflow-x-auto rounded-xl border border-indigo-200 shadow-sm">
            <table
                className="min-w-full divide-y divide-indigo-100 text-sm"
                {...props}
            />
        </div>
    ),
    thead: (props: ComponentPropsWithoutRef<"thead">) => (
        <thead className="bg-indigo-600 text-white" {...props} />
    ),
    th: (props: ComponentPropsWithoutRef<"th">) => (
        <th
            className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
            {...props}
        />
    ),
    tbody: (props: ComponentPropsWithoutRef<"tbody">) => (
        <tbody className="divide-y divide-indigo-50 bg-white" {...props} />
    ),
    tr: (props: ComponentPropsWithoutRef<"tr">) => (
        <tr
            className="transition-colors hover:bg-indigo-50/60"
            {...props}
        />
    ),
    td: (props: ComponentPropsWithoutRef<"td">) => (
        <td
            className="whitespace-normal px-4 py-3 text-gray-700"
            {...props}
        />
    ),
    blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
        <blockquote
            className="my-4 rounded-r-lg border-l-4 border-indigo-400 bg-indigo-50 px-4 py-3 italic text-indigo-800"
            {...props}
        />
    ),
    hr: () => <hr className="my-6 border-indigo-200" />,
    code: (props: ComponentPropsWithoutRef<"code">) => (
        <code
            className="rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-800"
            {...props}
        />
    ),
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
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="p-4 sm:p-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                            Your AI Study Dashboard
                        </h1>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => router.push("/chat")}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                💬 Ask AI Tutor
                            </button>
                            <button
                                onClick={() => router.push("/flashcards")}
                                className="rounded-lg border border-indigo-200 bg-white px-5 py-2 font-semibold text-indigo-600 transition hover:bg-indigo-50"
                            >
                                📚 Revision Flashcards
                            </button>
                            <button
                                onClick={() => router.push("/test")}
                                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
                            >
                                Start New Test
                            </button>
                        </div>
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

                {/* Performance Chart — full width */}
                <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
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

                {/* AI Study Tutor — full-width card */}
                <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-md sm:p-8">
                    {/* Header row */}
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-indigo-900">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg text-white shadow-sm">
                                    ✨
                                </span>
                                AI Study Tutor
                            </h2>
                            <p className="mt-1 text-sm text-indigo-600">
                                Get a personalized action plan based on your
                                test performance and weak areas.
                            </p>
                        </div>

                        {studyPlan && (
                            <button
                                onClick={() => {
                                    setStudyPlan(null);
                                    setPlanError(null);
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Regenerate
                            </button>
                        )}
                    </div>

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
                                className="group relative w-full overflow-hidden rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg
                                            className="h-5 w-5 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Analyzing Your Performance…
                                    </span>
                                ) : (
                                    "🚀 Generate My Study Plan"
                                )}
                            </button>
                        </>
                    ) : (
                        <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-inner sm:p-6">
                            <div className="max-h-[70vh] overflow-y-auto pr-2">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={markdownComponents}
                                >
                                    {studyPlan}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}
