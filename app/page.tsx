import { supabase } from '@/lib/supabase';
import { Reveal } from '@/components/Reveal';

async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-barca-blue via-barca-dark to-barca-garnet py-20 px-6 text-white text-center">
        <Reveal>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            Naufal Azra <span className="text-barca-gold">Maulana</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto font-light">
            Informatics Engineering Student & Full-stack Developer.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="bg-barca-gold text-barca-blue px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-lg">
              My Projects
            </button>
            <button className="border border-white/30 backdrop-blur-md px-8 py-3 rounded-full hover:bg-white/10 transition">
              Contact Me
            </button>
          </div>
        </Reveal>
      </section>

      {/* Projects Grid */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <Reveal>
          <h2 className="text-3xl font-bold mb-12 border-l-8 border-barca-garnet pl-4 text-barca-blue">
            Featured Projects
          </h2>
        </Reveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Reveal key={project.id}>
              <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border-b-4 border-transparent hover:border-barca-gold transition-all duration-300">
                <div className="h-48 bg-gray-200 relative">
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-barca-blue mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack?.map((tech: string) => (
                      <span key={tech} className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-barca-blue rounded border border-blue-100">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}