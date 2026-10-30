"use client";

import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

const navLinks = [
    { href: "/dashboard", label: "DASHBOARD" },
    { href: "/chat", label: "AI CHAT" },
    { href: "/flashcards", label: "FLASHCARDS" },
    { href: "/test", label: "MOCK TEST" },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        Cookies.remove("token");
        router.push("/login");
    };

    return (
        <nav className="sticky top-0 z-50 border-b-4 border-black bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-0 sm:px-8">
                {/* Brand */}
                <button
                    onClick={() => router.push("/dashboard")}
                    className="border-r-4 border-black py-4 pr-6 font-black tracking-tighter text-black text-xl uppercase hover:bg-black hover:text-white transition-colors"
                >
                    JEE/NEET<span className="text-[#7dd3fc]">.</span>AI
                </button>

                {/* Nav Links */}
                <div className="flex items-stretch h-full">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <button
                                key={link.href}
                                onClick={() => router.push(link.href)}
                                className={`border-r-2 border-black px-4 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                                    isActive
                                        ? "bg-black text-white"
                                        : "text-black hover:bg-[#7dd3fc] hover:text-black"
                                }`}
                            >
                                {link.label}
                            </button>
                        );
                    })}

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 px-5 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-black"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>
        </nav>
    );
}
