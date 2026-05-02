import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Rocket, RefreshCw, ArrowRight } from 'lucide-react';
import { createMercadoPagoCheckout } from '../services/mercadoPagoService';
import { useSession, useProfile } from '../store/useAppStore';

const Plans = () => {
  const session = useSession();
  const profile = useProfile();
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (planId) => {
    setLoading(planId);
    try {
      const email = profile.email || session?.user?.email || '';
      if (!email) {
        alert('Por favor, inicia sesión o proporciona un correo.');
        setLoading(null);
        return;
      }
      await createMercadoPagoCheckout(planId, email, session?.token);
    } catch (err) {
      alert(err.message);
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter Autónomo',
      price: '$250.000',
      currency: 'ARS',
      period: 'Pago único',
      icon: Zap,
      features: [
        'Landing Page Optimizada',
        'Asistente de Captación IA',
        'Agenda Automatizada',
        'Instalación en 7 días',
        'Soporte por email',
      ],
      cta: 'Comenzar',
      highlight: false,
    },
    {
      id: 'business',
      name: 'Business Flow',
      price: '$350.000',
      currency: 'ARS',
      period: 'Pago único',
      icon: Rocket,
      features: [
        'Web Multipágina Inteligente',
        'IA de Cualificación de Leads',
        'Integración con CRM y Slack',
        'Analíticas Pro con IA',
        'Instalación en 7 días',
        'Soporte prioritario',
      ],
      cta: 'Adquirir',
      highlight: true,
      badge: 'Recomendado',
    },
    {
      id: 'maintenance',
      name: 'Mantenimiento IA',
      price: '$150.000',
      currency: 'ARS',
      period: '/mes',
      icon: RefreshCw,
      features: [
        'Reentrenamiento semanal de modelos',
        'Optimización de Prompts',
        'Hosting Premium incluido',
        'Actualizaciones de seguridad',
        'Soporte técnico 24/7',
      ],
      cta: 'Suscribirse',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-primary text-xs uppercase tracking-[0.3em] font-bold">
            Planes de Evolución
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            Elige tu <span className="text-primary">Máquina de Ventas</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Desde captación básica hasta sistemas autónomos completos. Sin contratos, sin sorpresas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-panel rounded-3xl p-8 space-y-6 relative ${
                  plan.highlight ? 'border-2 border-primary/30 ring-2 ring-primary/10' : 'border border-white/5'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-surface px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.highlight ? 'bg-primary/20' : 'bg-surface-container-highest'}`}>
                    <Icon className={`w-6 h-6 ${plan.highlight ? 'text-primary' : 'text-on-surface-variant'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest">{plan.period}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-on-surface-variant text-sm uppercase tracking-wider">{plan.currency}</span>
                  {plan.period.includes('mes') && <span className="text-on-surface-variant text-lg">/mes</span>}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-on-surface-variant">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    plan.highlight
                      ? 'btn-primary shadow-[0_4px_20px_rgba(164,230,255,0.3)]'
                      : 'bg-surface-container-highest hover:bg-surface-container-high border border-white/5 hover:border-primary/30'
                  } disabled:opacity-50`}
                >
                  {loading === plan.id ? (
                    'Procesando...'
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center space-y-2">
          <p className="text-sm text-on-surface-variant">
            ¿Necesitas algo personalizado? <a href="/chat" className="text-primary hover:underline">Habla con Oliver</a>
          </p>
          <p className="text-xs text-on-surface-variant/60">
            Pagos en pesos argentinos (ARS). Procesado de forma segura por Mercado Pago.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plans;
