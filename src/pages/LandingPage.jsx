import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import AIPulse from '../components/AIPulse';
import IntegratedChat from '../components/IntegratedChat';
import { createMercadoPagoCheckout } from '../services/mercadoPagoService';
import { useSession, useProfile } from '../store/useAppStore';

const LandingPage = () => {
  const session = useSession();
  const profile = useProfile();
  const [leads, setLeads] = useState(150);
  const [ticketValue, setTicketValue] = useState(1200);
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    setLoading(planId);
    
    // Solicitar email si no está logueado
    let email = profile.email || session?.user?.email || '';
    
    if (!email) {
      email = prompt('Por favor, ingresa tu email para continuar con el pago:');
      if (!email) {
        setLoading(null);
        return;
      }
      // Validar email básico
      if (!email.includes('@')) {
        alert('Por favor, ingresa un email válido.');
        setLoading(null);
        return;
      }
    }

    try {
      await createMercadoPagoCheckout(planId, email, session?.token);
    } catch (err) {
      alert(err.message);
      setLoading(null);
    }
  };

  // ROI Logic
  const humanLossRate = 0.60; // 60% lead loss due to delay
  const iaEfficiency = 0.90; // IA captures 90% of potentially lost leads
  
  const monthlyRevenueTotal = leads * ticketValue;
  const potentialLoss = Math.round(monthlyRevenueTotal * humanLossRate);
  const iaRecovery = Math.round(potentialLoss * iaEfficiency);

  return (
    <div className="relative min-h-screen bg-surface overflow-x-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Nav Overlay (Unique for Landing) */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="/vera-logo.png" alt="Vera" className="h-8" />
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#platform" className="text-primary font-semibold border-b-2 border-primary pb-1">Platform</a>
          <a href="#cases" className="text-on-surface-variant hover:text-primary transition-colors">Case Studies</a>
          <a href="#pricing" className="text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
          <a href="#docs" className="text-on-surface-variant hover:text-primary transition-colors">Documentation</a>
        </div>
        <Link to="/dashboard" className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-95 transition-transform flex items-center justify-center">
          Get Started
        </Link>
      </nav>

      <main className="pt-20 relative z-10">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 text-center relative bg-white">
          {/* Content */}
          <div className="relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-cyan-200 mb-8"
            >
              <AIPulse className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">Sistemas Autónomos Activos</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] max-w-5xl mb-8"
            >
              <span className="text-gray-900">Tu Web Debería Estar</span>
              <br/>
              <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent italic">
                Vendiendo Mientras Duermes.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed mb-12"
            >
              Creamos Webs Autónomas que captan, cualifican y agendan clientes por ti. Sin sueldos, sin descansos.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                to="/chat" 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-5 rounded-xl text-lg font-bold flex items-center gap-2 group hover:scale-105 transition-transform shadow-lg shadow-cyan-500/25 justify-center"
              >
                Probar Demo IA (Gratis)
                <Play className="w-5 h-5 fill-current" />
              </Link>
              <a 
                href="#cases" 
                className="px-10 py-5 rounded-xl border-2 border-gray-300 text-gray-700 hover:border-cyan-500 hover:text-cyan-600 transition-all font-semibold text-lg flex items-center justify-center bg-white/50 backdrop-blur-sm"
              >
                Ver Casos de Éxito
              </a>
            </motion.div>
          </div>
        </section>

        {/* Integrated Chat Section */}
        <IntegratedChat />

        {/* ROI Calculator Section */}
        <section id="platform" className="py-32 px-6 bg-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 text-[10px] font-bold uppercase tracking-widest">
                  <TrendingUp className="w-3 h-3" />
                  Efficiency Calculator
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                  Calcula el Coste del <br/>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Silencio Humano</span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                  Las empresas pierden el 60% de sus leads por no responder en los primeros 5 minutos. Nuestra IA responde en milisegundos, 24/7.
                </p>

                <div className="space-y-10 pt-8">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                      <span className="text-gray-400">Leads Mensuales</span>
                      <span className="text-cyan-400">{leads}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="1000" 
                      value={leads}
                      onChange={(e) => setLeads(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-full appearance-none accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                      <span className="text-gray-400">Ticket Promedio ($)</span>
                      <span className="text-cyan-400">${ticketValue.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="10000" 
                      step="100"
                      value={ticketValue}
                      onChange={(e) => setTicketValue(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-full appearance-none accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <motion.div 
                  layout
                  className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-3xl border-l-4 border-l-red-500 relative overflow-hidden border border-gray-700"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertCircle className="w-20 h-20 text-red-400" />
                  </div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Dinero perdido por lentitud</h3>
                  <div className="text-5xl font-black text-red-400 mb-2">${potentialLoss.toLocaleString()}</div>
                  <p className="text-sm text-gray-400">Basado en un ratio de respuesta humano {">"} 4 horas.</p>
                </motion.div>

                <motion.div 
                  layout
                  className="bg-gray-800/50 backdrop-blur-xl p-8 rounded-3xl border-l-4 border-l-cyan-500 relative overflow-hidden border border-gray-700"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 className="w-20 h-20 text-cyan-400" />
                  </div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Facturación Recuperada por IA</h3>
                  <div className="text-5xl font-black text-cyan-400 mb-2">${iaRecovery.toLocaleString()}</div>
                  <p className="text-sm text-gray-400">Nuestra IA cierra leads mientras tú descansas.</p>
                </motion.div>

                <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-center">
                  <p className="font-bold text-cyan-400 flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Estás dejando el 90% de tu facturación potencial sobre la mesa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Selection */}
        <section id="pricing" className="py-32 px-6 bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="max-w-6xl mx-auto text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-gray-900">
              Planes de <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent italic">Evolución</span>
            </h2>
            <p className="text-gray-700 text-lg">Inversiones diseñadas para que la web trabaje para ti, no al revés.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Simple Card Mapping */}
            {[
              { id: 'starter', title: 'Starter Autónomo', price: '250.000', type: 'pago único', items: ['Landing Page Optimizado', 'Asistente de Captación IA', 'Agenda Automatizada'] },
              { id: 'business', title: 'Business Flow', price: '350.000', type: 'pago único', items: ['Web Multipágina Inteligente', 'IA de Cualificación de Leads', 'Integración CRM & Slack', 'Analíticas Pro IA'], featured: true },
              { id: 'maintenance', title: 'Mantenimiento IA', price: '150.000', type: 'mes', items: ['Reentrenamiento Semanal', 'Optimización de Prompts', 'Hosting Premium Incluido'] }
            ].map((plan, i) => (
              <div 
                key={i} 
                className={`bg-white/80 backdrop-blur-sm p-10 rounded-[2rem] flex flex-col gap-8 transition-transform hover:-translate-y-2 border ${plan.featured ? 'border-cyan-300 shadow-[0_0_50px_rgba(6,182,212,0.15)] scale-105 z-10' : 'border-gray-200'}`}
              >
                {plan.featured && (
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full w-fit">Recomendado</div>
                )}
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.title}</h3>
                  <div className="text-5xl font-black flex items-baseline gap-1 text-gray-900">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-600">/{plan.type}</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-1">
                  {plan.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${plan.featured ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105' : 'border-2 border-gray-300 text-gray-700 hover:border-cyan-500 hover:text-cyan-600 bg-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading === plan.id ? 'Procesando...' : (plan.featured ? 'Dominar Mercado' : 'Seleccionar Plan')}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section id="cases" className="py-32 px-6 bg-slate-900">
          <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-xl rounded-[3rem] p-16 text-center space-y-8 relative overflow-hidden border border-gray-700">
             <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-cyan-500/20 blur-[100px] pointer-events-none" />
             <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
               ¿Listo para encender el <br/>
               <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent italic">Piloto Automático?</span>
             </h2>
             <p className="text-gray-300 text-xl max-w-2xl mx-auto">
               Instalamos tu sistema en menos de 7 días. Empieza a agendar hoy mismo.
             </p>
             <div className="pt-8 flex justify-center">
               <Link to="/chat" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-12 py-6 rounded-2xl text-xl hover:scale-105 flex items-center justify-center font-bold transition-transform shadow-lg shadow-cyan-500/25">
                 RESERVAR CONSULTORÍA GRATUITA
               </Link>
             </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-8 border-t border-white/5 bg-surface-dim">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img src="/vera-logo.png" alt="Vera" className="h-6" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">© 2026 Vera. No boundaries, only intelligence.</p>
          </div>
          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
