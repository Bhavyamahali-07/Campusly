import React from 'react';
import { useNavigate } from 'react-router-dom';
import IntroAnimation from '../components/ui/scroll-morph-hero';
import { ArrowRight } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();
    
    return (
        <div className="w-full h-screen relative overflow-hidden bg-[#FAFAFA] dark:bg-zinc-950">
            {/* Morph Hero Background/Foreground */}
            <div className="absolute inset-0 z-0">
                <IntroAnimation />
            </div>

            {/* Top Logo */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-3 pointer-events-none">
                <img src="/logo.jpg" alt="Campusly" className="w-12 h-12 object-contain rounded-xl drop-shadow-sm" />
                <span className="text-xl font-bold font-[var(--font-display)] text-gray-900 dark:text-white tracking-tight">Campusly</span>
            </div>

            {/* Call to Action Layer */}
            <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center pointer-events-none">
                <button 
                    onClick={() => navigate('/login')}
                    className="pointer-events-auto px-8 py-3.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full font-semibold shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] hover:scale-105 transition-all flex items-center gap-2"
                >
                    Enter App <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
