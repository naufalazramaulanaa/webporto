'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import Swal from 'sweetalert2'

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // State Modal & Logika Form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form States (Prefill & Input)
  const [currentId, setCurrentId] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const fetchProjects = async () => {
    setLoadingData(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
    setLoadingData(false)
  }

  useEffect(() => { fetchProjects() }, [supabase])

  // Handler Ganti File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    if (selectedFile) setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  // Buka Modal Tambah
  const openAddModal = () => {
    setEditMode(false)
    setCurrentId('')
    setTitle('')
    setDesc('')
    setFile(null)
    setPreviewUrl(null)
    setIsModalOpen(true)
  }

  // Buka Modal Edit (Prefill)
  const openEditModal = (project: any) => {
    setEditMode(true)
    setCurrentId(project.id)
    setTitle(project.title)
    setDesc(project.description)
    setPreviewUrl(project.image_url)
    setFile(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sesi berakhir. Silakan login kembali.')

      let finalImageUrl = previewUrl

      // Upload gambar jika ada file baru yang dipilih
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const { error: upErr } = await supabase.storage.from('project-images').upload(fileName, file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(fileName)
        finalImageUrl = urlData.publicUrl
      }

      const projectData = { title, description: desc, image_url: finalImageUrl, user_id: user.id }

      if (editMode) {
        const { error } = await supabase.from('projects').update(projectData).eq('id', currentId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('projects').insert([projectData])
        if (error) throw error
      }

      await Swal.fire({
        title: editMode ? 'UPDATED!' : '¡GOLAZO!',
        text: editMode ? 'Data mahakarya telah diperbarui.' : 'Project Published! Visca el Barca! 🔵🔴',
        icon: 'success',
        confirmButtonColor: '#004d98',
        iconColor: '#dbbb3d',
        customClass: { popup: 'rounded-3xl', title: 'font-black uppercase' }
      })

      setIsModalOpen(false)
      fetchProjects()
    } catch (err: any) {
      Swal.fire({ title: 'Kartu Merah!', text: err.message, icon: 'error', confirmButtonColor: '#a50044', customClass: { popup: 'rounded-3xl' } })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Project?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a50044',
      cancelButtonColor: '#004d98',
      confirmButtonText: 'Ya, Hapus',
      customClass: { popup: 'rounded-3xl' }
    })
    if (result.isConfirmed) {
      await supabase.from('projects').delete().eq('id', id)
      fetchProjects()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Dashboard */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#004d98] uppercase italic tracking-tighter">
              Squad <span className="text-[#dbbb3d]">Management</span>
            </h1>
            <p className="text-gray-500 font-light mt-1 text-sm">Kelola daftar mahakarya terbaikmu di sini.</p>
          </div>
          <button onClick={openAddModal} className="bg-[#004d98] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#a50044] transition-all shadow-lg uppercase tracking-widest text-xs">
            + New Project
          </button>
        </div>

        {/* List Projects */}
        {loadingData ? (
          <div className="text-center py-20 font-bold text-[#004d98] animate-pulse italic">Loading Skuad...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 p-4 transition-all hover:shadow-2xl group">
                <div className="h-44 overflow-hidden rounded-2xl mb-4 bg-gray-100">
                  <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                </div>
                <h3 className="font-bold text-[#004d98] text-lg truncate uppercase italic tracking-tighter px-2">{p.title}</h3>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEditModal(p)} className="flex-1 bg-blue-50 text-[#004d98] py-3 rounded-xl font-bold text-xs uppercase hover:bg-[#004d98] hover:text-white transition-all">EDIT</button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 bg-red-50 text-[#a50044] py-3 rounded-xl font-bold text-xs uppercase hover:bg-[#a50044] hover:text-white transition-all">DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL (DESAIN SESUAI REQUEST) --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#001529]/70 backdrop-blur-sm flex items-center justify-center z-[100] p-6 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl p-10 rounded-[2.5rem] shadow-2xl relative animate__animated animate__zoomIn">
              
              {/* Close Button */}
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-8 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>

              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#004d98] uppercase tracking-tighter">
                  {editMode ? 'Update' : 'Create New'} <span className="text-[#dbbb3d]">Project</span>
                </h1>
                <p className="text-gray-500 font-light mt-1">Satu langkah lagi untuk memamerkan mahakaryamu.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 italic">Judul Project</label>
                  <input 
                    type="text" value={title} placeholder="Contoh: Portfolio Website Next.js" 
                    className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#dbbb3d] outline-none transition-all" 
                    onChange={e => setTitle(e.target.value)} required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 italic">Deskripsi</label>
                  <textarea 
                    placeholder="Ceritakan tentang project ini secara mendalam..." 
                    value={desc} rows={4} 
                    className="w-full p-4 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-[#dbbb3d] outline-none transition-all resize-none" 
                    onChange={e => setDesc(e.target.value)} required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1 italic">Banner Project</label>
                  <div className="relative group">
                    <div className="border-2 border-dashed border-gray-200 p-6 rounded-2xl text-center bg-gray-50 group-hover:bg-gray-100 group-hover:border-[#dbbb3d] transition-all cursor-pointer relative overflow-hidden">
                      <input 
                        type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange} required={!previewUrl} 
                      />
                      {previewUrl ? (
                        <div className="relative h-40 w-full">
                          <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                            <p className="text-white text-sm font-bold uppercase tracking-widest">Ganti Gambar</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <div className="mx-auto w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Klik untuk upload gambar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" disabled={submitting} 
                    className="flex-[2] bg-[#004d98] text-white font-black py-4 rounded-2xl hover:bg-[#a50044] shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                  >
                    {submitting ? 'Processing...' : editMode ? 'Update Mahakarya' : 'Publish Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}