import { supabase } from '@/lib/supabase';
import { Reveal } from '@/components/Reveal';

// Paksa Next.js untuk selalu mengambil data terbaru dari database
export const revalidate = 0;

async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error || !data) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data;
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#004d98] via-[#003366] to-[#a50044] py-24 px-6 text-white text-center relative overflow-hidden">
        {/* Dekorasi Aksen Barca */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#dbbb3d]"></div>
        
        <Reveal>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic uppercase">
            Naufal Azra <span className="text-[#dbbb3d]">Maulana</span>
          </h1>
          <p className="text-lg md:text-2xl opacity-90 max-w-2xl mx-auto font-light tracking-wide">
            Informatics Engineering Student & <span className="font-bold text-[#dbbb3d]">Full-stack Developer</span>.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <button className="bg-[#dbbb3d] text-[#004d98] px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-sm">
              My Projects
            </button>
            <button className="border-2 border-white/30 backdrop-blur-md px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all uppercase tracking-widest text-sm">
              Contact Me
            </button>
          </div>
        </Reveal>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto py-20 px-6">
        <Reveal>
          <div className="flex items-center gap-4 mb-16">
            <div className="h-12 w-3 bg-[#a50044] rounded-full"></div>
            <h2 className="text-4xl font-black text-[#004d98] uppercase italic tracking-tight">
              Featured <span className="text-[#dbbb3d]">Projects</span>
            </h2>
          </div>
        </Reveal>
        
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project) => (
              <Reveal key={project.id}>
                <div className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500 hover:-translate-y-3">
                  {/* Image wrapper */}
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src={project.image_url || '/placeholder-img.jpg'} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#004d98]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                       <span className="text-white font-bold text-sm tracking-widest uppercase">View Details →</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#004d98] mb-3 group-hover:text-[#a50044] transition-colors italic uppercase tracking-tighter">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 font-light leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                    
                    {/* Tags / Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack ? (
                        project.tech_stack.map((tech: string) => (
                          <span key={tech} className="text-[10px] font-black px-3 py-1 bg-gray-100 text-gray-600 rounded-lg uppercase tracking-widest">
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-[#004d98] rounded-lg uppercase tracking-widest">
                          Fullstack Project
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-100 rounded-[3rem] border-2 border-dashed border-gray-300">
            <p className="text-gray-400 font-bold italic uppercase tracking-widest">Skuad belum tersedia di lapangan.</p>
          </div>
        )}
      </section>

      {/* Footer Simple */}
      <footer className="py-12 text-center text-gray-400 text-sm font-light">
        © {new Date().getFullYear()} Naufal Azra. Built with Next.js & 💙 for Barca.
      </footer>
    </main>
  );
}