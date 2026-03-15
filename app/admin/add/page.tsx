'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import Swal from 'sweetalert2' // Import SweetAlert2

export default function AddProject() {
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile))
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Sesi login berakhir. Silakan login kembali.')
      }

      let imageUrl = ''
      
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { error: upErr } = await supabase.storage
          .from('project-images')
          .upload(fileName, file)

        if (upErr) throw new Error(`Gagal upload gambar: ${upErr.message}`)

        const { data: urlData } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName)
        
        imageUrl = urlData.publicUrl
      }

      const { error: dbError } = await supabase.from('projects').insert([
        { 
          title, 
          description: desc, 
          image_url: imageUrl,
          user_id: user.id 
        }
      ])

      if (dbError) throw dbError

      // --- Notifikasi Sukses SweetAlert2 ---
      await Swal.fire({
        title: '¡GOLAZO!',
        text: 'Project Published! Visca el Barca! 🔵🔴',
        icon: 'success',
        confirmButtonColor: '#004d98',
        iconColor: '#dbbb3d',
        background: '#ffffff',
        customClass: {
          title: 'font-black uppercase tracking-tighter',
          popup: 'rounded-3xl'
        }
      })
      
      router.push('/admin')
      router.refresh()

    } catch (err: any) {
      console.error(err)
      
      // --- Notifikasi Error SweetAlert2 ---
      Swal.fire({
        title: 'Kartu Merah!',
        text: err.message || 'Terjadi kesalahan saat mempublish project.',
        icon: 'error',
        confirmButtonColor: '#a50044',
        customClass: {
          popup: 'rounded-3xl'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#004d98] uppercase tracking-tighter">
            Create New <span className="text-[#dbbb3d]">Project</span>
          </h1>
          <p className="text-gray-500 font-light mt-1">Satu langkah lagi untuk memamerkan mahakaryamu.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Judul Project</label>
            <input 
              type="text" 
              value={title}
              placeholder="Contoh: Portfolio Website Next.js" 
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#dbbb3d] outline-none transition-all" 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Deskripsi</label>
            <textarea 
              placeholder="Ceritakan tentang project ini secara mendalam..." 
              value={desc}
              rows={5} 
              className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#dbbb3d] outline-none transition-all resize-none" 
              onChange={e => setDesc(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Banner Project</label>
            <div className="relative group">
              <div className="border-2 border-dashed border-gray-200 p-8 rounded-2xl text-center bg-gray-50 group-hover:bg-gray-100 group-hover:border-[#dbbb3d] transition-all cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange} 
                  required={!previewUrl} 
                />
                
                {previewUrl ? (
                  <div className="relative h-40 w-full">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="h-full w-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <p className="text-white text-sm font-bold">Ganti Gambar</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Klik untuk upload gambar project</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#004d98] text-white font-black py-4 rounded-2xl hover:bg-[#a50044] shadow-lg hover:shadow-[#a50044]/20 transition-all disabled:opacity-50 active:scale-[0.98] uppercase tracking-widest mt-4"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Publishing...
              </span>
            ) : 'Publish Project'}
          </button>
        </form>
      </div>
    </div>
  )
}