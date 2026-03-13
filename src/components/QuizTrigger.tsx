"use client";

import { useState } from "react";
import QuizFunnel from "./QuizFunnel";

export default function QuizTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="mt-2 px-8 py-4 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg flex items-center gap-2 w-max"
            >
                <span>Diagnóstico Gratuito + PDF</span>
                <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                </svg>
            </button>

            <QuizFunnel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
