"use client";

import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/chat", label: "AI Chat", icon: "💬" },
    { href: "/flashcards", label: "Flashcards", icon: "📚" },
    { href: "/test", label: "Take Test", icon: "📝" },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
                {/* Brand */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="text-lg font-extrabold tracking-tight text-gray-900 transition hover:text-blue-600"
                >
                    🎓 JEE/NEET Tutor
                </button>

                {/* Nav Links */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <button
                                key={link.href}
                                onClick={() => router.push(link.href)}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                    isActive
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                <span className="mr-1.5 hidden sm:inline">
                                    {link.icon}
                                </span>
                                {link.label}
                            </button>
                        );
                    })}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="ml-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

