
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
import { API_BASE } from "../config/api";

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

/* ── Brutalist markdown components ── */
const markdownComponents = {
    h1: (props: ComponentPropsWithoutRef<"h1">) => (
        <h1 className="mb-3 mt-6 border-b-4 border-black pb-2 text-2xl font-black uppercase tracking-tight text-black" {...props} />
    ),
    h2: (props: ComponentPropsWithoutRef<"h2">) => (
        <h2 className="mb-2 mt-6 text-xl font-black uppercase tracking-tight text-black border-l-4 border-[#7dd3fc] pl-3" {...props} />
    ),
    h3: (props: ComponentPropsWithoutRef<"h3">) => (
        <h3 className="mb-2 mt-4 text-base font-black uppercase tracking-wider text-zinc-700" {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<"p">) => (
        <p className="mb-3 font-mono text-sm leading-relaxed text-zinc-700" {...props} />
    ),
    strong: (props: ComponentPropsWithoutRef<"strong">) => (
        <strong className="font-black text-black" {...props} />
    ),
    ul: (props: ComponentPropsWithoutRef<"ul">) => (
        <ul className="mb-4 space-y-1" {...props} />
    ),
    li: (props: ComponentPropsWithoutRef<"li">) => (
        <li className="flex items-start gap-2 font-mono text-sm text-zinc-700">
            <span className="mt-1 font-black text-[#7dd3fc] shrink-0">▶</span>
            <span {...props} />
        </li>
    ),
    table: (props: ComponentPropsWithoutRef<"table">) => (
        <div className="my-4 overflow-x-auto border-2 border-black">
            <table className="min-w-full text-sm" {...props} />
        </div>
    ),
    thead: (props: ComponentPropsWithoutRef<"thead">) => (
        <thead className="bg-black text-white" {...props} />
    ),
    th: (props: ComponentPropsWithoutRef<"th">) => (
        <th className="px-4 py-3 text-left font-black uppercase tracking-wider text-xs" {...props} />
    ),
    tbody: (props: ComponentPropsWithoutRef<"tbody">) => (
        <tbody className="divide-y-2 divide-zinc-200 bg-white" {...props} />
    ),
    tr: (props: ComponentPropsWithoutRef<"tr">) => (
        <tr className="hover:bg-[#f0f9ff] transition-colors" {...props} />
    ),
    td: (props: ComponentPropsWithoutRef<"td">) => (
        <td className="px-4 py-3 font-mono text-xs text-zinc-700 align-top" {...props} />
    ),
    blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
        <blockquote className="my-4 border-l-4 border-black bg-zinc-100 px-4 py-3 font-mono text-sm italic text-zinc-600" {...props} />
    ),
    hr: () => <hr className="my-6 border-t-2 border-black" />,
    code: (props: ComponentPropsWithoutRef<"code">) => (
        <code className="bg-zinc-900 px-1.5 py-0.5 text-xs font-mono text-[#7dd3fc]" {...props} />
    ),
};

export default function Dashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [studyPlan, setStudyPlan] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);
    const router = useRouter();

    const fetchAnalytics = useCallback(async () => {
        const token = Cookies.get("token");
        if (!token) { router.push("/login"); return; }
        try {
            setError(null);
            const res = await axios.get(`${API_BASE}/api/test/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(res.data);
        } catch (err: any) {
            if (err.response?.status === 401) { Cookies.remove("token"); router.push("/login"); return; }
            setError(err.response?.data?.message || "Failed to load analytics. Check backend is running.");
        }
    }, [router]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    const generateAIPlan = async () => {
        const token = Cookies.get("token");
        if (!token) { router.push("/login"); return; }
        setIsGenerating(true);
        setPlanError(null);
        try {
            const res = await axios.get(`${API_BASE}/api/ai/study-plan`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.data?.plan) throw new Error("The server returned an empty study plan.");
            setStudyPlan(res.data.plan);
        } catch (err: any) {
            setPlanError(err.response?.data?.message || err.message || "Failed to generate AI plan. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!data && !error) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="border-4 border-black bg-black px-8 py-4">
                    <p className="font-black uppercase tracking-widest text-[#7dd3fc] text-sm">LOADING DASHBOARD...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-6 bg-white p-6 text-center">
                <div className="border-l-4 border-red-600 bg-red-50 px-6 py-4 text-left">
                    <p className="font-mono text-sm font-bold text-red-600 uppercase">{error}</p>
                </div>
                <button onClick={fetchAnalytics} className="border-4 border-black bg-black px-6 py-3 font-black text-sm uppercase tracking-widest text-white hover:bg-[#7dd3fc] hover:text-black transition-colors">
                    RETRY
                </button>
            </div>
        );
    }

    if (!data) return null;

    const chartData = data.recentSubmissions.map((sub, idx) => ({
        name: `T${idx + 1}`,
        score: sub.totalQuestions > 0 ? Math.round((sub.score / sub.totalQuestions) * 100) : 0,
    }));

    return (
        <div className="min-h-screen bg-zinc-100">
            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">

                {/* Page Title */}
                <div className="mb-8 border-b-4 border-black pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 mb-1">Overview</p>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">
                            STUDY<br className="sm:hidden" /> DASHBOARD
                        </h1>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => router.push("/chat")}
                            className="border-2 border-black bg-white px-4 py-2 font-black text-xs uppercase tracking-widest text-black hover:bg-[#7dd3fc] transition-colors">
                            AI CHAT
                        </button>
                        <button onClick={() => router.push("/flashcards")}
                            className="border-2 border-black bg-white px-4 py-2 font-black text-xs uppercase tracking-widest text-black hover:bg-[#7dd3fc] transition-colors">
                            FLASHCARDS
                        </button>
                        <button onClick={() => router.push("/test")}
                            className="border-4 border-black bg-black px-5 py-2 font-black text-xs uppercase tracking-widest text-white hover:bg-red-600 transition-colors">
                            START TEST →
                        </button>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="mb-6 grid grid-cols-1 gap-0 sm:grid-cols-3 border-2 border-black">
                    {/* Total Tests */}
                    <div className="border-b-2 sm:border-b-0 sm:border-r-2 border-black bg-white p-6">
                        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-3">TOTAL TESTS TAKEN</p>
                        <p className="text-6xl font-black text-black leading-none">{data.metrics.totalTests}</p>
                    </div>

                    {/* Average Accuracy */}
                    <div className="border-b-2 sm:border-b-0 sm:border-r-2 border-black bg-[#7dd3fc] p-6">
                        <p className="font-mono text-xs uppercase tracking-widest text-black/60 mb-3">AVERAGE ACCURACY</p>
                        <p className="text-6xl font-black text-black leading-none">{data.metrics.averageScore}<span className="text-3xl">%</span></p>
                    </div>

                    {/* Weak Topics */}
                    <div className="bg-black p-6">
                        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-3">NEEDS IMPROVEMENT</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {data.metrics.topWeakTopics.length > 0 ? (
                                data.metrics.topWeakTopics.map((topic) => (
                                    <span key={topic} className="border-2 border-red-500 bg-red-600 px-2 py-1 font-mono text-xs font-black uppercase text-white">
                                        {topic}
                                    </span>
                                ))
                            ) : (
                                <span className="font-mono text-xs text-zinc-500 uppercase">Take tests to identify weak areas</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="mb-6 border-2 border-black bg-white">
                    <div className="border-b-2 border-black px-6 py-3 flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#7dd3fc] border border-black"></div>
                        <p className="font-black text-xs uppercase tracking-widest text-black">PERFORMANCE TREND</p>
                    </div>
                    <div className="h-64 w-full p-4">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                                    <XAxis dataKey="name" stroke="#000" fontSize={11} tickLine={false} fontWeight={900} />
                                    <YAxis stroke="#000" fontSize={11} tickLine={false} domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`} fontWeight={900} />
                                    <Tooltip
                                        formatter={(value) => [`${Number(value).toFixed(0)}%`, "Accuracy"]}
                                        contentStyle={{ border: "2px solid black", borderRadius: 0, fontFamily: "monospace", fontWeight: 900, fontSize: 12 }}
                                    />
                                    <Line type="linear" dataKey="score" stroke="#000" strokeWidth={3}
                                        dot={{ r: 5, fill: "#7dd3fc", stroke: "#000", strokeWidth: 2 }}
                                        activeDot={{ r: 7, fill: "#000" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Complete your first test to see your progress chart.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Study Tutor */}
                <div className="border-2 border-black bg-white">
                    {/* Header */}
                    <div className="border-b-2 border-black px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-0.5">AI-POWERED</p>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">STUDY PLAN GENERATOR</h2>
                        </div>
                        {studyPlan && (
                            <button
                                onClick={() => { setStudyPlan(null); setPlanError(null); }}
                                className="border-2 border-zinc-600 px-4 py-2 font-black text-xs uppercase tracking-widest text-zinc-400 hover:border-white hover:text-white transition-colors self-start sm:self-auto"
                            >
                                ↺ REGENERATE
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        {!studyPlan ? (
                            <div>
                                <p className="font-mono text-sm text-zinc-500 uppercase tracking-wider mb-6">
                                    Get a personalized 3-day action plan based on your test performance and weak areas.
                                </p>
                                {planError && (
                                    <div className="mb-4 border-l-4 border-red-600 bg-red-50 px-4 py-3">
                                        <p className="font-mono text-sm text-red-600 uppercase">{planError}</p>
                                    </div>
                                )}
                                <button
                                    onClick={generateAIPlan}
                                    disabled={isGenerating}
                                    className="w-full border-4 border-black bg-black py-5 font-black text-sm uppercase tracking-widest text-white transition-colors hover:bg-[#7dd3fc] hover:text-black disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                                            ANALYZING PERFORMANCE...
                                        </>
                                    ) : (
                                        "GENERATE MY STUDY PLAN →"
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="max-h-[75vh] overflow-y-auto pr-1">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {studyPlan}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
