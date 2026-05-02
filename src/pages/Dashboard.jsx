import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Zap, 
  ArrowUpRight, 
  Activity,
  Smile,
  Rocket
} from 'lucide-react';
import Avatar from '../components/Avatar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(84);
  const [interactions, setInteractions] = useState(2842);

  // Simple animation for numbers
  useEffect(() => {
    const timer = setInterval(() => {
      setInteractions(prev => prev + Math.floor(Math.random() * 2));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { 
      label: 'Interacciones Demo', 
      value: interactions.toLocaleString(), 
      trend: '+12.4%', 
      icon: MessageSquare, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      label: 'Leads Capturados', 
      value: '158', 
      trend: '+8.1%', 
      icon: Zap, 
      color: 'text-secondary', 
      bg: 'bg-secondary/10' 
    },
  ];

  const leads = [
    { name: 'Jordan M.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKUzgmaBaVQWw22Y4Wl0_AF0ob9Srh90QPPhOACp7HuNcOnrp24KetiEp_SHXoyLxWUVjdf9FT26mt6hfWTTBMhnMxqz2-FW_qT5Jsx9Zols838oc20JTQp7KsxvUPnNNAO6PCmNxp_F-XmuRe0qp6SeWdwwlW7wvdbS7d0wVS0rLuMIguey5qDiINhjXmpA-d4cRpovldmhX0HTzr-0TBfgu1UGTdu-NHaBGDR9XCEM6jkF_Mn91Xezz6B9R90zHEv2tmsUJz92fU' },
    { name: 'Elena R.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU2vg5artwrbCiNSTG0rZbwtUGKQx4RPQyI-jQ6mozZwWP75nkOKefTXAhIdy6RtFvYQwH8jB9bD1TMHN_B8QQZUyYVAR0dX-SioEBCs3DM_l51t_IQ0bcuVVrizuLDNCUGb6t5JOgXduwu88ASj4x7DI131iirlvNvItgXEQoagSM2JJYy3lfD0seveiy6kEFnhptflHrbU229WkUGnPCFXKVFXmT9Cz_dPwnur10tnhrSCzoWNoS6lpMl9p93-UR7XOxWZWFQT5l' },
  ];

  return (
    <div className="p-8 space-y-12">
      {/* Header */}
      <header>
        <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Panel de Control</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Cliente: Agencia Web</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Training Progress Card */}
        <section className="lg:col-span-8 glass-card rounded-[2rem] p-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-2xl font-bold mb-2">Entrenamiento de su IA</h2>
                <p className="text-on-surface-variant text-sm max-w-sm">La red neuronal está procesando los datos del espacio de trabajo para alinearse con la firma semántica única de su marca.</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/10 rounded-full">
                 <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </div>
                <span className="text-primary text-[10px] font-bold tracking-widest uppercase">Aprendizaje Activo</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-6xl font-black text-primary tracking-tighter">{progress}%</span>
                <span className="text-on-surface-variant text-xs font-mono uppercase tracking-[0.2em]">Epoch 42/50</span>
              </div>
              <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { label: 'Densidad de Conocimiento', value: 'Alta' },
                  { label: 'Latencia (ms)', value: '114' },
                  { label: 'Deriva Semántica', value: '0.02%' }
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-surface-container-high rounded-2xl">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 italic">{item.label}</p>
                    <p className="text-xl font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Decorative Glow */}
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        </section>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              onClick={() => navigate(i === 0 ? '/chat' : '/metrics')}
              className="glass-card p-8 rounded-[2rem] group cursor-pointer"
            >
              <div className="flex justify-between items-center mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.bg} ${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-on-surface-variant text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{stat.label}</h3>
              <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Stats Bento */}
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 glass-card rounded-[2rem] p-10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold">Embudo de Conversión</h3>
              <div className="flex gap-6">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Tráfico
                </span>
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <div className="w-2 h-2 rounded-full bg-secondary" /> Leads
                </span>
              </div>
            </div>
            
            {/* Mock Chart Visual */}
            <div className="h-48 flex items-end gap-3 px-4 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-xl" />
              {[60, 45, 90, 65, 80, 100, 70, 50, 85, 60].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 1 }}
                  className={`flex-1 rounded-t-lg ${i % 3 === 0 ? 'bg-primary' : i % 5 === 0 ? 'bg-secondary' : 'bg-surface-container-highest opacity-40'}`}
                />
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-10 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-xl font-bold mb-4">Análisis de Sentimientos</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">El tono de interacción con los clientes se evalúa actualmente como altamente positivo.</p>
            </div>
            
            <div className="mt-8 flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Smile className="w-10 h-10" />
              </div>
              <div>
                <p className="text-3xl font-black">94.2%</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Comentarios Positivos</p>
              </div>
            </div>

            {/* Leads Avatars */}
            <div className="mt-10 flex items-center justify-between">
              <div className="flex -space-x-3">
                {leads.map((lead, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden ring-4 ring-primary/5 shadow-2xl">
                    <Avatar src={lead.avatar} name={lead.name} size={40} />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold shadow-2xl">
                  +12
                </div>
              </div>
              <button 
                onClick={() => navigate('/metrics')}
                className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline underline-offset-8 transition-all"
              >
                Ver CRM
              </button>
            </div>

            {/* Decorative Pulse Ring */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
