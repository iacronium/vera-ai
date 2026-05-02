import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  MessageSquare,
  TrendingUp,
  Clock,
  Smile,
  Meh,
  Frown,
  Calendar,
  Activity,
} from 'lucide-react';
import { useMetrics } from '../store/useAppStore';

// ─── Date Range Options ───────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: 'Últimos 7 días', value: 7 },
  { label: 'Últimos 30 días', value: 30 },
  { label: 'Últimos 90 días', value: 90 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Filter MetricPoint[] to only include entries within the last `days` days.
 * Since history is session-only and may be empty, we return the raw metrics
 * for the stat cards and only filter the history array for charts.
 */
function filterHistory(history, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return history.filter((point) => new Date(point.date) >= cutoff);
}

/**
 * Derive a scale factor (0–1) based on the selected date range so that
 * the displayed aggregate metrics feel proportional even when history is empty.
 * 7 days → full value, 30 days → 30/7 multiplier (capped), 90 days → 90/7.
 * We keep it simple: show raw store values for all ranges since history is
 * session-only and there's no real historical data to aggregate.
 */
function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color, bg, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4 }}
    className="glass-card rounded-2xl p-7 flex flex-col gap-4 cursor-default"
  >
    <div className="flex items-center justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      {sub && (
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${bg} ${color}`}>
          {sub}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="text-4xl font-black tracking-tighter">{value}</p>
    </div>
  </motion.div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const SentimentBar = ({ label, value, total, color, icon: Icon, delay = 0 }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <Icon className="w-4 h-4" style={{ color }} />
          {label}
        </span>
        <span className="font-mono text-on-surface-variant text-xs">
          {value} <span className="text-on-surface-variant/50">({pct}%)</span>
        </span>
      </div>
      <div className="h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
};

// ─── Mini History Chart ───────────────────────────────────────────────────────

const MiniChart = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-on-surface-variant text-sm">
        No hay datos históricos para este período
      </div>
    );
  }

  const maxVal = Math.max(...history.map((p) => p.interactions), 1);

  return (
    <div className="h-32 flex items-end gap-1.5 px-1">
      {history.map((point, i) => {
        const heightPct = (point.interactions / maxVal) * 100;
        return (
          <motion.div
            key={point.date}
            title={`${point.date}: ${point.interactions} interacciones`}
            initial={{ height: 0 }}
            animate={{ height: `${heightPct}%` }}
            transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-primary/40 min-h-[2px]"
          />
        );
      })}
    </div>
  );
};

// ─── MetricsPage ──────────────────────────────────────────────────────────────

const MetricsPage = () => {
  const metrics = useMetrics();
  const [selectedRange, setSelectedRange] = useState(30);

  const filteredHistory = filterHistory(metrics.history, selectedRange);

  const { positive, neutral, negative } = metrics.sentimentDistribution;
  const totalSentiment = positive + neutral + negative;

  const conversionPct = (metrics.conversionRate * 100).toFixed(1);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
            Analíticas
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
            <LineChart className="w-9 h-9 text-primary" />
            Métricas
          </h1>
        </div>

        {/* Date Range Selector */}
        <div
          className="flex items-center gap-1 glass-card rounded-2xl p-1.5"
          role="group"
          aria-label="Selector de rango de fechas"
        >
          <Calendar className="w-4 h-4 text-on-surface-variant ml-2 shrink-0" />
          {DATE_RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSelectedRange(value)}
              aria-pressed={selectedRange === value}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                selectedRange === value
                  ? 'bg-primary text-on-primary shadow-lg'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Stat Cards ── */}
      <section aria-label="Métricas clave">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={MessageSquare}
            label="Interacciones Totales"
            value={metrics.totalInteractions.toLocaleString()}
            color="text-primary"
            bg="bg-primary/10"
            delay={0}
          />
          <StatCard
            icon={TrendingUp}
            label="Tasa de Conversión"
            value={`${conversionPct}%`}
            sub={metrics.conversionRate > 0 ? 'Activo' : 'Sin datos'}
            color="text-secondary"
            bg="bg-secondary/10"
            delay={0.08}
          />
          <StatCard
            icon={Clock}
            label="Tiempo Promedio de Sesión"
            value={formatDuration(metrics.avgSessionTime)}
            color="text-tertiary"
            bg="bg-tertiary/10"
            delay={0.16}
          />
          <StatCard
            icon={Smile}
            label="Sentimiento Positivo"
            value={totalSentiment > 0 ? `${Math.round((positive / totalSentiment) * 100)}%` : '—'}
            sub={totalSentiment > 0 ? 'Sentimiento' : 'Sin datos'}
            color="text-primary"
            bg="bg-primary/10"
            delay={0.24}
          />
        </div>
      </section>

      {/* ── Bottom Grid: Sentiment + History ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sentiment Distribution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-card rounded-2xl p-8 space-y-6"
          aria-label="Distribución de sentimientos"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Distribución de Sentimientos</h2>
              <p className="text-on-surface-variant text-xs">
                Basado en {totalSentiment} interacción{totalSentiment !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <SentimentBar
              label="Positivo"
              value={positive}
              total={totalSentiment}
              color="#a4e6ff"
              icon={Smile}
              delay={0.35}
            />
            <SentimentBar
              label="Neutral"
              value={neutral}
              total={totalSentiment}
              color="#bbc9cf"
              icon={Meh}
              delay={0.45}
            />
            <SentimentBar
              label="Negativo"
              value={negative}
              total={totalSentiment}
              color="#ffb4ab"
              icon={Frown}
              delay={0.55}
            />
          </div>

          {totalSentiment === 0 && (
            <p className="text-center text-on-surface-variant text-sm py-4">
              Los datos de sentimiento aparecerán después de que se registren las interacciones.
            </p>
          )}
        </motion.section>

        {/* Interaction History Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.38 }}
          className="glass-card rounded-2xl p-8 space-y-6"
          aria-label="Historial de interacciones"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Historial de Interacciones</h2>
                <p className="text-on-surface-variant text-xs">
                  {DATE_RANGES.find((r) => r.value === selectedRange)?.label}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {filteredHistory.length} punto{filteredHistory.length !== 1 ? 's' : ''} de datos
            </span>
          </div>

          <MiniChart history={filteredHistory} />

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
            {[
              { label: 'Interacciones', value: metrics.totalInteractions.toLocaleString() },
              { label: 'Conversión', value: `${conversionPct}%` },
              { label: 'Tiempo Prom.', value: formatDuration(metrics.avgSessionTime) },
            ].map((item) => (
              <div key={item.label} className="bg-surface-container-high rounded-xl p-4 text-center">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                <p className="text-lg font-black">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MetricsPage;
