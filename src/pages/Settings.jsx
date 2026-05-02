import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Cpu,
  Bell,
  Shield,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  Check,
  BookOpen,
  UploadCloud,
  Trash2,
  Calendar,
  Link2,
  Link2Off,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  useProfile,
  useSetProfile,
  useAIPreferences,
  useSetAIPreferences,
  useNotificationPrefs,
  useSetNotificationPrefs,
  useAgentInstructions,
  useSetAgentInstructions,
  useSession,
} from '../store/useAppStore';
import {
  getCalendarStatus,
  connectGoogleCalendar,
  disconnectGoogleCalendar,
} from '../services/calendarService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── Section Wrapper ──────────────────────────────────────────────────────────

const Section = ({ icon: Icon, title, desc, isOpen, onToggle, children }) => (
  <div className="glass-card rounded-2xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-5 p-6 hover:bg-white/5 transition-colors group text-left"
      aria-expanded={isOpen}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-on-surface-variant text-sm">{desc}</p>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-on-surface-variant shrink-0"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 pt-2 border-t border-white/5">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const Label = ({ children }) => (
  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-1.5">
    {children}
  </label>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 outline-none focus:ring-2 transition-all ${
      error
        ? 'ring-2 ring-error focus:ring-error'
        : 'ring-1 ring-white/10 focus:ring-primary/60'
    }`}
  />
);

const ErrorMsg = ({ msg }) =>
  msg ? <p className="mt-1.5 text-xs text-error">{msg}</p> : null;

const SaveButton = ({ saved, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
  >
    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
    {saved ? '¡Guardado!' : 'Guardar Cambios'}
  </button>
);

// ─── Section 1: Profile Account ───────────────────────────────────────────────

const ProfileSection = () => {
  const profile = useProfile();
  const setProfile = useSetProfile();

  const [form, setForm] = useState({
    agencyName: profile.agencyName ?? '',
    email: profile.email ?? '',
    avatarUrl: profile.avatarUrl ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (form.email && !isValidEmail(form.email)) {
      errs.email = 'Por favor, ingresa una dirección de email válida.';
    }
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 mt-4">
      <div>
        <Label>Nombre de la Agencia</Label>
        <Input
          type="text"
          placeholder="Mi Agencia"
          value={form.agencyName}
          onChange={handleChange('agencyName')}
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="tu@ejemplo.com"
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
        />
        <ErrorMsg msg={errors.email} />
      </div>

      <div>
        <Label>URL del Avatar</Label>
        <Input
          type="url"
          placeholder="https://ejemplo.com/avatar.png"
          value={form.avatarUrl}
          onChange={handleChange('avatarUrl')}
        />
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
};

// ─── Section 2: AI Model Preferences ─────────────────────────────────────────

const AI_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Groq)' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Groq)' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Groq)' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B (Groq)' },
];

const AIPreferencesSection = () => {
  const aiPreferences = useAIPreferences();
  const setAIPreferences = useSetAIPreferences();

  const [form, setForm] = useState({
    salesModel: aiPreferences.salesModel ?? 'gpt-4o',
    temperature: aiPreferences.temperature ?? 0.7,
    maxTokens: aiPreferences.maxTokens ?? 1024,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = () => {
    setAIPreferences({
      salesModel: form.salesModel,
      temperature: parseFloat(form.temperature),
      maxTokens: parseInt(form.maxTokens, 10),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 mt-4">
      <div>
        <Label>Modelo</Label>
        <select
          value={form.salesModel}
          onChange={handleChange('salesModel')}
          className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-primary/60 transition-all"
        >
          {AI_MODELS.map((m) => (
            <option key={m.value} value={m.value} className="bg-surface-container-high">
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label>Temperatura</Label>
          <span className="text-xs font-mono text-primary">
            {parseFloat(form.temperature).toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={form.temperature}
          onChange={handleChange('temperature')}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
          <span>Preciso (0.0)</span>
          <span>Creativo (1.0)</span>
        </div>
      </div>

      <div>
        <Label>Máximo de Tokens</Label>
        <Input
          type="number"
          min="64"
          max="8192"
          step="64"
          value={form.maxTokens}
          onChange={handleChange('maxTokens')}
        />
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>
    </div>
  );
};

// ─── Section 3: Notifications ─────────────────────────────────────────────────

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && (
        <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
      )}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/60 ${
        checked ? 'bg-primary' : 'bg-surface-container-highest'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

const NotificationsSection = () => {
  const notificationPrefs = useNotificationPrefs();
  const setNotificationPrefs = useSetNotificationPrefs();

  const handleToggle = (field) => (value) => {
    setNotificationPrefs({ [field]: value });
  };

  return (
    <div className="mt-4 divide-y divide-white/5">
      <Toggle
        checked={notificationPrefs.newLead}
        onChange={handleToggle('newLead')}
        label="Nuevo Lead Capturado"
        description="Recibe notificaciones cuando se capture un nuevo lead en SalesChat."
      />
      <Toggle
        checked={notificationPrefs.agentStatusChange}
        onChange={handleToggle('agentStatusChange')}
        label="Cambio de Estado del Agente"
        description="Recibe alertas cuando tu agente IA se conecte o desconecte."
      />
      <Toggle
        checked={notificationPrefs.weeklyEmailSummary}
        onChange={handleToggle('weeklyEmailSummary')}
        label="Resumen Semanal por Email"
        description="Un resumen semanal de las métricas de rendimiento de tu agencia."
      />
    </div>
  );
};

// ─── Section 4: Security & API Keys ──────────────────────────────────────────

const MaskedKeyInput = ({ label, value, onChange, revealed, onReveal, error }) => (
  <div>
    <Label>{label}</Label>
    <div className="relative">
      <Input
        type={revealed ? 'text' : 'password'}
        placeholder={revealed ? 'sk-...' : '••••••••••••••••••••••••'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
      />
      <button
        type="button"
        onClick={onReveal}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label={revealed ? 'Ocultar clave' : 'Mostrar clave'}
      >
        {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    <ErrorMsg msg={error} />
  </div>
);

const SecuritySection = () => {
  const aiPreferences = useAIPreferences();
  const setAIPreferences = useSetAIPreferences();
  const session = useSession();

  const [openaiKey, setOpenaiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [revealOpenai, setRevealOpenai] = useState(false);
  const [revealGroq, setRevealGroq] = useState(false);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  // Google Calendar state
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    getCalendarStatus(session.token).then(({ connected }) => setCalendarConnected(connected));
  }, [session?.token]);

  const handleConnectCalendar = async () => {
    setCalendarLoading(true);
    try {
      const connected = await connectGoogleCalendar(session.token);
      if (connected) {
        setCalendarConnected(true);
      }
    } catch (err) {
      console.error('[calendar] connect error:', err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    setCalendarLoading(true);
    await disconnectGoogleCalendar(session.token);
    setCalendarConnected(false);
    setCalendarLoading(false);
  };

  const handleSave = () => {
    const errs = {};

    if (!openaiKey && !aiPreferences.openaiKey) {
      errs.openaiKey = 'La clave API de OpenAI no puede estar vacía.';
    }
    if (!groqKey && !aiPreferences.groqKey) {
      errs.groqKey = 'La clave API de Groq no puede estar vacía.';
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const updates = {};
    if (openaiKey) updates.openaiKey = openaiKey;
    if (groqKey) updates.groqKey = groqKey;

    if (Object.keys(updates).length > 0) {
      setAIPreferences(updates);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 mt-4">
      <p className="text-xs text-on-surface-variant">
        Las claves API se almacenan localmente en tu navegador y nunca se envían a nuestros servidores.
        Deja un campo en blanco para mantener la clave existente.
      </p>

      <MaskedKeyInput
        label="Clave API de OpenAI"
        value={openaiKey}
        onChange={setOpenaiKey}
        revealed={revealOpenai}
        onReveal={() => setRevealOpenai((v) => !v)}
        error={errors.openaiKey}
      />

      <MaskedKeyInput
        label="Clave API de Groq"
        value={groqKey}
        onChange={setGroqKey}
        revealed={revealGroq}
        onReveal={() => setRevealGroq((v) => !v)}
        error={errors.groqKey}
      />

      {(aiPreferences.openaiKey || aiPreferences.groqKey) && (
        <div className="flex items-center gap-2 text-xs text-primary/80 bg-primary/5 rounded-xl px-4 py-3">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>
            {[
              aiPreferences.openaiKey && 'Clave de OpenAI',
              aiPreferences.groqKey && 'Clave de Groq',
            ]
              .filter(Boolean)
              .join(' y ')}{' '}
            ya configurada. Ingresa un nuevo valor para reemplazar.
          </span>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <SaveButton saved={saved} onClick={handleSave} />
      </div>

      {/* ── Google Calendar Integration ─────────────────────────────────── */}
      <div className="border-t border-white/5 pt-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-on-surface">Google Calendar</span>
        </div>
        <p className="text-xs text-on-surface-variant">
          Conecta tu Google Calendar para que Oliver pueda agendar consultorías directamente desde el chat.
        </p>

        {calendarConnected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-primary/80 bg-primary/5 rounded-xl px-4 py-3">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shrink-0" />
              Google Calendar conectado y activo.
            </div>
            <button
              onClick={handleDisconnectCalendar}
              disabled={calendarLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-error/70 hover:text-error hover:bg-error/10 border border-error/10 hover:border-error/30 transition-all disabled:opacity-40"
            >
              <Link2Off className="w-4 h-4" />
              {calendarLoading ? 'Desconectando...' : 'Desconectar Google Calendar'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectCalendar}
            disabled={calendarLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-surface-container-highest/60 border border-white/5 hover:border-primary/30 hover:text-primary transition-all disabled:opacity-40"
          >
            <Link2 className="w-4 h-4" />
            {calendarLoading ? 'Conectando...' : 'Conectar Google Calendar'}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Document Management Section ─────────────────────────────────────────────

const DocumentManagementSection = () => {
  const [uploadState, setUploadState] = useState('idle');
  const [pdfText, setPdfText] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState('vectorizing');
    setUploadError('');
    setPdfText('');
    setPdfFileName(file.name);

    try {
      const { extractTextFromPDF } = await import('../services/pdfService');
      const text = await extractTextFromPDF(file);
      console.log('Extracted text length:', text.length);
      setPdfText(text);
      setUploadState('done');
    } catch (err) {
      setUploadError(err.message || 'Error al procesar el PDF.');
      setUploadState('error');
    }

    e.target.value = '';
  };

  const handleUploadClick = () => {
    if (uploadState !== 'vectorizing') {
      fileInputRef.current?.click();
    }
  };

  const handleClearDocument = () => {
    setPdfText('');
    setPdfFileName('');
    setUploadState('idle');
    setUploadError('');
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Sube documentos PDF para que la IA pueda responder preguntas basadas en tu contenido. 
        Ideal para manuales, catálogos de productos, o documentación técnica.
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Subir documento PDF"
      />

      {/* Upload Area */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleUploadClick}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-all ${
          uploadState === 'done'
            ? 'border-primary/50 bg-primary/5'
            : uploadState === 'error'
            ? 'border-error/50 bg-error/5'
            : 'border-white/20 hover:bg-surface-container-high'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            uploadState === 'done'
              ? 'bg-primary text-on-primary-fixed'
              : uploadState === 'error'
              ? 'bg-error/20 text-error'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {uploadState === 'done' ? (
            <Check className="w-8 h-8" />
          ) : uploadState === 'error' ? (
            <AlertCircle className="w-8 h-8" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <div>
          <p className="font-bold text-lg mb-2">
            {uploadState === 'idle'
              ? 'Subir Documento PDF'
              : uploadState === 'vectorizing'
              ? 'Procesando...'
              : uploadState === 'done'
              ? `${pdfFileName}`
              : 'Error en la Carga'}
          </p>
          
          {uploadState === 'done' && (
            <p className="text-sm text-on-surface-variant mb-2">
              {pdfText.length.toLocaleString()} caracteres extraídos
            </p>
          )}
          
          {uploadState === 'error' && uploadError && (
            <p className="text-sm text-error mb-2">{uploadError}</p>
          )}
          
          <p className="text-xs text-on-surface-variant">
            {uploadState === 'done'
              ? 'Haz clic para reemplazar documento'
              : 'Arrastra y suelta tu PDF aquí o haz clic para seleccionar'}
          </p>
        </div>
      </motion.div>

      {/* Document Actions */}
      {uploadState === 'done' && (
        <div className="flex gap-3">
          <button
            onClick={handleClearDocument}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-error/20 text-error hover:bg-error/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Documento
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/20">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Documento listo para consultas</span>
          </div>
        </div>
      )}

      <div className="bg-surface-container-highest/30 rounded-xl p-4 border border-white/5">
        <p className="text-xs text-on-surface-variant leading-relaxed">
          <strong>Nota:</strong> Los documentos se procesan localmente y no se almacenan en el servidor. 
          Deberás volver a subirlos en cada sesión. Para almacenamiento permanente, considera actualizar a un plan premium.
        </p>
      </div>
    </div>
  );
};

// ─── Agent Instructions Section ──────────────────────────────────────────────

const AgentInstructionsSection = () => {
  const instructions = useAgentInstructions();
  const setInstructions = useSetAgentInstructions();
  const [draft, setDraft] = useState(instructions);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useState(null);

  const handleSave = () => {
    setInstructions(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setDraft(text);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleClear = () => {
    setDraft('');
    setInstructions('');
  };

  const charCount = draft.length;

  return (
    <div className="space-y-5">
      {/* Description */}
      <p className="text-sm text-on-surface-variant leading-relaxed">
        Escribe o sube un archivo <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">.md</code> o <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">.txt</code> con instrucciones personalizadas para Oliver. Se inyectarán al inicio de cada conversación de ventas.
      </p>

      {/* Upload button */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl bg-surface-container-highest/60 border border-white/5 hover:border-primary/30 transition-all text-sm text-on-surface-variant hover:text-on-surface">
          <UploadCloud className="w-4 h-4" />
          Subir archivo (.md / .txt)
          <input
            type="file"
            accept=".md,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
        {draft && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-error/70 hover:text-error hover:bg-error/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Ejemplo:\n\nEres Oliver, consultor de ventas de [Tu Empresa].\n\nProducto: Plan Pro — $299/mes\nBeneficios clave:\n- Automatización 24/7\n- Integración con CRM\n- Soporte prioritario\n\nObjeciones comunes:\n- "Es muy caro" → Mostrar ROI: recupera la inversión en 2 semanas.\n- "Ya tenemos solución" → Preguntar qué les falta en la actual.`}
          rows={14}
          className="w-full bg-surface-container-highest/40 border border-white/5 focus:border-primary/40 rounded-2xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/30 resize-none outline-none transition-all font-mono leading-relaxed custom-scrollbar"
        />
        <span className="absolute bottom-3 right-4 text-[10px] text-on-surface-variant/40 font-mono">
          {charCount.toLocaleString()} caracteres
        </span>
      </div>

      {/* Save */}
      <SaveButton saved={saved} onClick={handleSave} disabled={draft === instructions} />

      {/* Active indicator */}
      {instructions && (
        <div className="flex items-center gap-2 text-xs text-primary/80">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          Instrucciones activas · {instructions.length.toLocaleString()} caracteres cargados
        </div>
      )}
    </div>
  );
};

// ─── Main Settings Page ───────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'profile',
    icon: User,
    title: 'Cuenta del Perfil',
    desc: 'Gestiona la identidad y credenciales de tu agencia.',
    Component: ProfileSection,
  },
  {
    id: 'ai',
    icon: Cpu,
    title: 'Preferencias del Modelo IA',
    desc: 'Configura LLMs por defecto y niveles de creatividad.',
    Component: AIPreferencesSection,
  },
  {
    id: 'documents',
    icon: FileText,
    title: 'Gestión de Documentos',
    desc: 'Sube PDFs para que la IA responda basándose en tu contenido.',
    Component: DocumentManagementSection,
  },
  {
    id: 'agent-instructions',
    icon: BookOpen,
    title: 'Instrucciones del Agente',
    desc: 'Personaliza el comportamiento y guión de ventas de Oliver.',
    Component: AgentInstructionsSection,
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notificaciones',
    desc: 'Configura alertas para captura de leads y estado del agente.',
    Component: NotificationsSection,
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Seguridad y Claves API',
    desc: 'Asegura tu espacio de trabajo e integraciones externas.',
    Component: SecuritySection,
  },
];

const Settings = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (id) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <header>
        <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
          Configuración del Sistema
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Configuración</h1>
      </header>

      {/* Accordion sections */}
      <div className="grid gap-4">
        {SECTIONS.map(({ id, icon, title, desc, Component }) => (
          <Section
            key={id}
            icon={icon}
            title={title}
            desc={desc}
            isOpen={openSection === id}
            onToggle={() => toggle(id)}
          >
            <Component />
          </Section>
        ))}
      </div>
    </div>
  );
};

export default Settings;
