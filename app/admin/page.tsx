'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import Swal from 'sweetalert2'

export default function AdminDashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // State untuk Prefill Form
  const [currentId, setCurrentId] = useState('')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const supabase = createSupabaseBrowserClient()

  const fetchProjects = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [supabase])

  // --- LOGIKA PREFILL (Membuka Modal & Isi Data) ---
  const openEditModal = (project: any) => {
    setCurrentId(project.id)
    setTitle(project.title)
    setDesc(project.description)
    setPreviewUrl(project.image_url)
    setFile(null) // Reset file input
    setIsEditModalOpen(true)
  }

  // --- LOGIKA UPDATE ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let finalImageUrl = previewUrl

      // Jika ada gambar baru yang dipilih
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: upErr } = await supabase.storage.from('project-images').upload(fileName, file)
        if (upErr) throw upErr
        const { data } = supabase.storage.from('project-images').getPublicUrl(fileName)
        finalImageUrl = data.publicUrl
      }

      const { error } = await supabase
        .from('projects')
        .update({ title, description: desc, image_url: finalImageUrl })
        .eq('id', currentId)

      if (error) throw error

      await Swal.fire({
        title: 'Updated!',
        text: 'Data pemain telah diperbarui.',
        icon: 'success',
        confirmButtonColor: '#dbbb3d'
      })

      setIsEditModalOpen(false)
      fetchProjects() // Refresh data
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus?',
      text: "Data akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#a50044',
      cancelButtonColor: '#004d98',
      confirmButtonText: 'Ya, Hapus'
    })

    if (result.isConfirmed) {
      await supabase.from('projects').delete().eq('id', id)
      fetchProjects()
      Swal.fire('Deleted', 'Project dihapus.', 'success')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <h1 className="text-4xl font-black text-[#004d98] uppercase italic">Portofolio <span className="text-[#dbbb3d]">Management</span></h1>
          <button onClick={() => window.location.href='/admin/add'} className="bg-[#004d98] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#a50044] transition-all">
            + NEW SIGNING
          </button>
        </div>

        {loading ? <div className="text-center py-20 font-bold text-[#004d98] animate-pulse">Loading Skuad...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 p-4">
                <img src={p.image_url} className="h-40 w-full object-cover rounded-2xl mb-4" alt="" />
                <h3 className="font-bold text-[#004d98] text-lg truncate">{p.title}</h3>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEditModal(p)} className="flex-1 bg-blue-50 text-[#004d98] py-2 rounded-xl font-bold text-sm">EDIT</button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 bg-red-50 text-[#a50044] py-2 rounded-xl font-bold text-sm">DELETE</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL EDIT (PREFILL CONCEPT) --- */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate__animated animate__zoomIn">
              <h2 className="text-2xl font-black text-[#004d98] mb-6 italic uppercase">Edit <span className="text-[#dbbb3d]">Portofolio</span></h2>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <input 
                  type="text" value={title} 
                  className="w-full p-4 border rounded-2xl outline-none focus:border-[#dbbb3d]" 
                  onChange={(e) => setTitle(e.target.value)} required 
                />
                <textarea 
                  value={desc} rows={4}
                  className="w-full p-4 border rounded-2xl outline-none focus:border-[#dbbb3d] resize-none" 
                  onChange={(e) => setDesc(e.target.value)} required 
                />
                <div className="flex items-center gap-4">
                  <img src={previewUrl} className="w-16 h-16 rounded-xl object-cover border" alt="" />
                  <input type="file" className="text-xs" onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { setFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                  }} />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-2xl">BATAL</button>
                  <button type="submit" disabled={uploading} className="flex-[2] py-3 font-black text-white bg-[#004d98] rounded-2xl hover:bg-[#a50044]">
                    {uploading ? 'SAVING...' : 'UPDATE DATA'}
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