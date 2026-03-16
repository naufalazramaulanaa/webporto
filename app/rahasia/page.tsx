'use client'
import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email, 
    password 
  });

  if (error) {
    alert(error.message);
  } else if (data.session) {
    // Gunakan ini untuk memaksa browser pindah ke halaman admin
    window.location.href = '/admin';
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* 1. Gambar Background Skuad (Penuh & Buram) */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/barca.webp" // <-- Ganti dengan nama file gambarmu di folder public
          alt="FC Barcelona Squad 2026"
          fill // Membuat gambar memenuhi container
          quality={100}
          priority // Prioritaskan loading gambar ini
          className="object-cover object-center blur-sm scale-110" // Efek buram & sedikit zoom agar pinggirannya rapi
        />
        {/* Overlay Gelap agar Teks Form Jelas */}
        <div className="absolute inset-0 bg-barca-dark/70 z-10" />
      </div>

      {/* 2. Kartu Form Login (High Contrast) */}
      <div className="relative z-20 bg-white/90 backdrop-blur-md w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/20 animate-reveal">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-barca-blue tracking-tighter">
            ADMIN <span className="text-barca-gold">LOGIN</span>
          </h2>
          <p className="text-gray-600 mt-1">Visca el Barca! Masuk untuk mengelola project.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-barca-dark">Email Address</label>
            <input 
              type="email" 
              placeholder="naufal@example.com"
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full mt-1.5 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-barca-gold outline-none transition" 
              required 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-barca-dark">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full mt-1.5 p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-barca-gold outline-none transition" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-barca-blue text-white font-bold py-4 rounded-xl hover:bg-barca-garnet transition-colors mt-6 shadow-lg active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}