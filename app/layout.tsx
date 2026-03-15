// app/layout.tsx
import './globals.css'
import Navbar from '@/components/Navbar' // Import Navbar yang baru dibuat

export const metadata = {
  title: 'Naufal Azra | Portfolio',
  description: 'Software Developer Portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar /> {/* Letakkan di atas children */}
        {children}
        
        {/* Footer Sederhana Blaugrana */}
        <footer className="bg-barca-dark text-white/50 py-8 text-center text-sm border-t border-white/5">
          <p>© 2026 Naufal Azra. Built with Next.js & Supabase.</p>
          <p className="text-barca-gold font-bold mt-1 uppercase tracking-widest">Visca el Barca!</p>
        </footer>
      </body>
    </html>
  )
}