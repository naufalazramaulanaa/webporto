'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import Swal from 'sweetalert2'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session) {
        const hasBeenWelcomed = sessionStorage.getItem('welcome_shown')
        if (!hasBeenWelcomed) {
          Swal.fire({
            title: '¡Bienvenido!',
            text: 'Berhasil masuk ke sistem, Admin.',
            icon: 'success',
            confirmButtonColor: '#004d98',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-3xl' }
          })
          sessionStorage.setItem('welcome_shown', 'true')
        }
      }

      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('welcome_shown')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    // --- Alert Konfirmasi Logout ---
    const result = await Swal.fire({
      title: 'Ingin Logout?',
      text: "Anda harus login kembali untuk mengelola portofolio.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a50044', // Barca Garnet
      cancelButtonColor: '#004d98',  // Barca Blue
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true, // Membuat tombol "Batal" di kiri agar lebih natural
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl px-6 py-2',
        cancelButton: 'rounded-xl px-6 py-2'
      }
    })

    // Jika user klik "Ya, Keluar"
    if (result.isConfirmed) {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        Swal.fire({
          title: 'Error!',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#a50044'
        })
      } else {
        Swal.fire({
          title: 'Logged Out',
          text: 'Sampai jumpa di pertandingan berikutnya!',
          icon: 'success',
          confirmButtonColor: '#a50044',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-3xl' }
        })
        router.push('/')
        router.refresh()
      }
    }
  }

  return (
    <nav className="flex justify-between items-center p-6 bg-[#004d98] text-white shadow-xl sticky top-0 z-50">
      <Link href="/" className="text-2xl font-black tracking-tighter hover:opacity-90 transition">
        My<span className="text-[#dbbb3d]">Porto</span>
      </Link>

      <div className="flex items-center gap-6 font-bold">
        {user ? (
          <>
            <Link href="/admin" className="hover:text-[#dbbb3d] transition">Dashboard</Link>
            {/* <Link 
              href="/admin/add" 
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition text-sm"
            >
              + New Project
            </Link> */}
            <button 
              onClick={handleLogout}
              className="bg-[#a50044] hover:bg-red-700 px-5 py-2 rounded-xl transition-all active:scale-95 shadow-lg text-sm uppercase tracking-wider"
            >
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link href="/" className="hover:text-[#dbbb3d] transition">Home</Link>
            {/* <Link 
              href="/login" 
              className="bg-[#dbbb3d] text-[#004d98] px-6 py-2 rounded-xl hover:bg-yellow-500 transition-all shadow-lg text-sm uppercase tracking-widest font-black"
            >
              LOGIN
            </Link> */}
          </>
        )}
      </div>
    </nav>
  )
}