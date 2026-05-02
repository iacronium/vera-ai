import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  MessageCircle,
  FileText,
  LifeBuoy,
  ChevronDown,
  ExternalLink,
  Users,
  Send,
  Check,
  AlertCircle,
  Code,
} from 'lucide-react';

// ─── Section Wrapper (same accordion pattern as Settings.jsx) ─────────────────

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

const Textarea = ({ error, ...props }) => (
  <textarea
    {...props}
    className={`w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 outline-none focus:ring-2 transition-all resize-none ${
      error
        ? 'ring-2 ring-error focus:ring-error'
        : 'ring-1 ring-white/10 focus:ring-primary/60'
    }`}
  />
);

const ErrorMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1.5 text-xs text-error flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  ) : null;

// ─── Section 1: Documentation ─────────────────────────────────────────────────

const DOC_CATEGORIES = [
  {
    name: 'Getting Started',
    articles: [
      {
        title: 'Quick Start Guide',
        desc: 'Set up your workspace and launch your first AI agent in under 5 minutes.',
      },
      {
        title: 'Understanding the Dashboard',
        desc: 'Learn how to read your metrics, monitor agent status, and interpret lead data.',
      },
      {
        title: 'Configuring Your First Sales Chat',
        desc: 'Customize Oliver\'s persona, tone, and knowledge base for your agency.',
      },
      {
        title: 'Connecting Your API Keys',
        desc: 'Securely add your Groq API key to enable high-speed AI responses.',
      },
    ],
  },
  {
    name: 'API Integration',
    articles: [
      {
        title: 'Authentication & API Keys',
        desc: 'How to generate, rotate, and securely store your API credentials.',
      },
      {
        title: 'Webhooks & Event Callbacks',
        desc: 'Subscribe to lead capture events and agent status changes via webhooks.',
      },
      {
        title: 'Rate Limits & Quotas',
        desc: 'Understand request limits, retry strategies, and quota management.',
      },
      {
        title: 'SDK Reference (JavaScript)',
        desc: 'Official JavaScript SDK for embedding Vera into your own apps.',
      },
    ],
  },
  {
    name: 'Sales Chat',
    articles: [
      {
        title: 'Customizing Oliver\'s System Prompt',
        desc: 'Tailor the AI\'s personality, product knowledge, and conversation style.',
      },
      {
        title: 'Lead Scoring & Intent Detection',
        desc: 'How purchase intent keywords are detected and how scores are calculated.',
      },
      {
        title: 'Exporting Lead Data',
        desc: 'Export captured leads to CSV, CRM integrations, or via the REST API.',
      },
      {
        title: 'Multi-language Support',
        desc: 'Configure Oliver to respond in the visitor\'s language automatically.',
      },
    ],
  },
  {
    name: 'Sandbox',
    articles: [
      {
        title: 'Uploading & Processing PDFs',
        desc: 'Supported file types, size limits, and how text extraction works.',
      },
      {
        title: 'Chatting with Your Documents',
        desc: 'Best practices for asking questions and getting accurate answers from Llama 3.',
      },
      {
        title: 'Using Groq for Fast Inference',
        desc: 'Why we use Groq for Sandbox and how to configure your Groq API key.',
      },
      {
        title: 'Sandbox Session Management',
        desc: 'How sessions are scoped, when context resets, and how to start fresh.',
      },
    ],
  },
];

const DocumentationSection = () => (
  <div className="mt-4 space-y-6">
    {DOC_CATEGORIES.map((category) => (
      <div key={category.name}>
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-primary mb-3">
          {category.name}
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {category.articles.map((article) => (
            <a
              key={article.title}
              href="#"
              className="group block bg-surface-container-high rounded-xl p-4 hover:bg-surface-container-highest transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {article.desc}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </div>
              <span className="inline-block mt-2 text-[10px] font-bold text-primary/70 group-hover:text-primary transition-colors">
                Read More →
              </span>
            </a>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── Section 2: Community Discord ─────────────────────────────────────────────

const DISCORD_URL = 'https://discord.gg/synthesized-ether';
const ACTIVE_MEMBERS = '2,847 members';

const DiscordSection = () => (
  <div className="mt-4 space-y-5">
    <div className="flex items-center gap-4 bg-surface-container-high rounded-xl p-5">
      <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 flex items-center justify-center shrink-0">
        <MessageCircle className="w-6 h-6 text-[#5865F2]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Vera Community</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-bold">{ACTIVE_MEMBERS}</span>
          <span className="text-xs text-on-surface-variant">active right now</span>
        </div>
      </div>
    </div>

    <div className="space-y-2 text-sm text-on-surface-variant">
      <p>Connect with other agency owners, share workflows, and get help from the community.</p>
      <ul className="space-y-1 list-disc list-inside text-xs">
        <li>Share prompts and system configurations</li>
        <li>Get early access to new features</li>
        <li>Weekly live Q&amp;A sessions with the engineering team</li>
        <li>Dedicated channels for Sales Chat, Sandbox, and API integrations</li>
      </ul>
    </div>

    <a
      href={DISCORD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
    >
      <MessageCircle className="w-4 h-4" />
      Join Discord
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  </div>
);

// ─── Section 3: API Reference ─────────────────────────────────────────────────

const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/chat',
    description: 'Send a message to the AI sales agent and receive a response.',
    params: [
      { name: 'messages', type: 'array', required: true, desc: 'Conversation history as [{role, content}]' },
      { name: 'model', type: 'string', required: false, desc: 'AI model to use (default: llama3-70b-8192)' },
      { name: 'temperature', type: 'number', required: false, desc: 'Creativity level 0.0–1.0 (default: 0.7)' },
      { name: 'max_tokens', type: 'number', required: false, desc: 'Maximum response length (default: 1024)' },
    ],
    example: `{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "llama3-70b-8192",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hi! I'd be happy to help you explore our AI solutions."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 18,
    "total_tokens": 60
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/sandbox/upload',
    description: 'Upload a PDF document for text extraction and AI-powered Q&A.',
    params: [
      { name: 'file', type: 'File (multipart)', required: true, desc: 'PDF file to upload (max 10 MB)' },
      { name: 'session_id', type: 'string', required: false, desc: 'Session identifier to scope the document context' },
    ],
    example: `{
  "session_id": "sess_xyz789",
  "filename": "product-catalog.pdf",
  "pages": 12,
  "characters": 18432,
  "status": "ready",
  "message": "Document processed successfully. You can now ask questions."
}`,
  },
  {
    method: 'GET',
    path: '/api/leads',
    description: 'Retrieve all captured leads from SalesChat sessions.',
    params: [
      { name: 'limit', type: 'number', required: false, desc: 'Maximum number of leads to return (default: 50)' },
      { name: 'offset', type: 'number', required: false, desc: 'Pagination offset (default: 0)' },
      { name: 'intent', type: 'string', required: false, desc: 'Filter by intent level: low | medium | high' },
    ],
    example: `{
  "total": 142,
  "leads": [
    {
      "id": "lead_001",
      "name": "Jordan M.",
      "company": "Acme Corp",
      "intent": "high",
      "capturedAt": "2024-06-15T14:32:00Z",
      "sessionId": "sess_abc123"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}`,
  },
];

const METHOD_COLORS = {
  GET: 'text-emerald-400 bg-emerald-400/10',
  POST: 'text-blue-400 bg-blue-400/10',
  PUT: 'text-amber-400 bg-amber-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
};

const APIReferenceSection = () => {
  const [openEndpoint, setOpenEndpoint] = useState(null);

  return (
    <div className="mt-4 space-y-3">
      {API_ENDPOINTS.map((endpoint) => {
        const key = endpoint.path;
        const isOpen = openEndpoint === key;
        return (
          <div key={key} className="bg-surface-container-high rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenEndpoint(isOpen ? null : key)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              aria-expanded={isOpen}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                  METHOD_COLORS[endpoint.method] ?? 'text-on-surface-variant bg-white/10'
                }`}
              >
                {endpoint.method}
              </span>
              <code className="text-sm font-mono text-on-surface flex-1">{endpoint.path}</code>
              <ChevronDown
                className={`w-4 h-4 text-on-surface-variant transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="ep-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-4">
                    <p className="text-sm text-on-surface-variant">{endpoint.description}</p>

                    {/* Parameters */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">
                        Parameters
                      </p>
                      <div className="space-y-1.5">
                        {endpoint.params.map((param) => (
                          <div
                            key={param.name}
                            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs"
                          >
                            <code className="font-mono text-primary">{param.name}</code>
                            <span className="text-on-surface-variant/60">{param.type}</span>
                            {param.required && (
                              <span className="text-[10px] font-bold text-error/80 uppercase">required</span>
                            )}
                            <span className="text-on-surface-variant">— {param.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example Response */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="w-3.5 h-3.5 text-on-surface-variant" />
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                          Example Response
                        </p>
                      </div>
                      <pre className="bg-surface-container rounded-xl p-4 text-xs font-mono text-on-surface overflow-x-auto leading-relaxed">
                        <code>{endpoint.example}</code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// ─── Section 4: Direct Support (Ticket Form) ─────────────────────────────────

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

/**
 * Validates the support ticket form fields.
 * Returns an object with field-level error messages.
 * An empty object means the form is valid.
 *
 * @param {{ subject: string, description: string }} fields
 * @returns {{ subject?: string, description?: string }}
 */
export function validateTicketFields({ subject, description }) {
  const errors = {};
  if (!subject || subject.trim() === '') {
    errors.subject = 'Subject is required.';
  }
  if (!description || description.trim() === '') {
    errors.description = 'Description is required.';
  }
  return errors;
}

const DirectSupportSection = () => {
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Medium' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateTicketFields(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    // Simulate async ticket submission (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const ticketNumber = `#TKT-${String(Math.floor(100000 + Math.random() * 900000))}`;
    setTicket(ticketNumber);
    setSubmitting(false);
  };

  const handleReset = () => {
    setForm({ subject: '', description: '', priority: 'Medium' });
    setErrors({});
    setTicket(null);
  };

  if (ticket) {
    return (
      <div className="mt-4 flex flex-col items-center gap-4 py-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="font-bold text-lg">Ticket Submitted!</p>
          <p className="text-on-surface-variant text-sm mt-1">
            Our engineering team will get back to you within 24 hours.
          </p>
        </div>
        <div className="bg-surface-container-high rounded-xl px-6 py-3 font-mono text-primary font-bold text-lg">
          {ticket}
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-on-surface-variant hover:text-on-surface transition-colors underline underline-offset-2"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-5">
      <div>
        <Label>Subject *</Label>
        <Input
          type="text"
          placeholder="Brief summary of your issue"
          value={form.subject}
          onChange={handleChange('subject')}
          error={errors.subject}
          aria-describedby={errors.subject ? 'subject-error' : undefined}
        />
        {errors.subject && (
          <p id="subject-error" className="mt-1.5 text-xs text-error flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors.subject}
          </p>
        )}
      </div>

      <div>
        <Label>Description *</Label>
        <Textarea
          rows={4}
          placeholder="Describe the problem in detail — steps to reproduce, expected vs actual behavior, etc."
          value={form.description}
          onChange={handleChange('description')}
          error={errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="mt-1.5 text-xs text-error flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <Label>Priority</Label>
        <select
          value={form.priority}
          onChange={handleChange('priority')}
          className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-primary/60 transition-all"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p} className="bg-surface-container-high">
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
        >
          {submitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Ticket
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// ─── Main Help Page ───────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: 'documentation',
    icon: Book,
    title: 'Documentation',
    desc: 'Comprehensive guides organized by category to master our AI tools.',
    Component: DocumentationSection,
  },
  {
    id: 'discord',
    icon: MessageCircle,
    title: 'Community Discord',
    desc: `Join ${ACTIVE_MEMBERS} of agency owners, share insights, and get community support.`,
    Component: DiscordSection,
  },
  {
    id: 'api',
    icon: FileText,
    title: 'API Reference',
    desc: 'Technical endpoint docs with parameters and example responses for custom integrations.',
    Component: APIReferenceSection,
  },
  {
    id: 'support',
    icon: LifeBuoy,
    title: 'Direct Support',
    desc: 'Open a ticket with our human engineering team — we respond within 24 hours.',
    Component: DirectSupportSection,
  },
];

const Help = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggle = (id) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-10">
      {/* Header */}
      <header>
        <p className="text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
          Support Center
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">How can we help?</h1>
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

export default Help;
