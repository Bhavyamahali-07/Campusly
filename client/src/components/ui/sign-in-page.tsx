'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export function AuthLayout({ title, subtitle, children, onSubmit }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col md:flex-row font-sans">
      {/* Left Panel - Image Section */}
      <div className="md:flex-1 relative overflow-hidden h-48 md:h-auto">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10 hidden md:block">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
            alt="Brand Asset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-white overflow-y-auto">
        <div className="w-full max-w-md p-8 py-12">
          {/* Mobile Back Button */}
          <button
            onClick={() => navigate('/')}
            className="md:hidden mb-6 flex items-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>

          <div className="mb-8">
            <img src="/logo.jpg" alt="Campusly" className="w-16 h-16 object-contain mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            <div className="text-gray-600">
              {subtitle}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {children}

          </form>
        </div>
      </div>
    </div>
  )
}
