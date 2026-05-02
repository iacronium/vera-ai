import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Download } from 'lucide-react';
import { getPaymentByExternalReference } from '../services/mercadoPagoService';

const Success = () => {
  const [searchParams] = useSearchParams();
  const externalReference = searchParams.get('order_id') || searchParams.get('external_reference');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!externalReference) {
      setError('No se encontró el ID de pago.');
      setLoading(false);
      return;
    }

    getPaymentByExternalReference(externalReference)
      .then((data) => {
        setPayment(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [externalReference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <div className="glass-panel rounded-3xl p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-on-surface-variant">{error}</p>
          <Link to="/plans" className="btn-primary px-6 py-3 rounded-xl inline-block">
            Volver a Planes
          </Link>
        </div>
      </div>
    );
  }

  const planNames = {
    starter: 'Plan Starter Autónomo',
    business: 'Plan Business Flow',
    maintenance: 'Mantenimiento IA',
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-3xl p-12 max-w-2xl w-full space-y-8 border border-primary/10"
      >
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter">¡Pago Exitoso!</h1>
          <p className="text-on-surface-variant text-lg">
            Tu orden ha sido confirmada. Recibirás un correo con los detalles.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-surface-container-low rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">Pago #{payment.id}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              payment.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-surface-container-highest text-on-surface-variant'
            }`}>
              {payment.status === 'approved' ? 'Aprobado' : payment.status === 'pending' ? 'Pendiente' : 'Procesando'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Plan</span>
              <span className="font-semibold">{planNames[payment.plan_id] || payment.plan_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Monto</span>
              <span className="font-semibold">
                ${payment.amount.toLocaleString('es-AR')} ARS
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Email</span>
              <span className="font-semibold text-sm">{payment.user_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Fecha</span>
              <span className="font-semibold text-sm">{new Date(payment.paid_at || payment.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Próximos pasos</p>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              Recibirás un correo de confirmación con los detalles de tu compra.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              Comenzaremos la instalación de tu sistema autónomo en menos de 7 días.
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link to="/dashboard" className="flex-1 btn-primary py-3 rounded-xl text-center flex items-center justify-center gap-2">
            Ir al Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="flex-1 py-3 rounded-xl border border-white/5 hover:border-primary/30 transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Descargar Recibo
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;
