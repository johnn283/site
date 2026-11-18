import React, { useEffect, useState } from 'react';
import { CheckCircle2, MessageCircle, Send, X } from 'lucide-react';
import type { PricingPlan, ServiceItem, SiteSettings } from '../types/studio';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  plans: PricingPlan[];
  settings: SiteSettings;
  initialService?: string;
  initialPlan?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  services,
  plans,
  settings,
  initialService = '',
  initialPlan = '',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceName, setServiceName] = useState(initialService);
  const [planName, setPlanName] = useState(initialPlan);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setServiceName(initialService);
      setPlanName(initialPlan);
      setSubmitted(false);
      setError('');
    }
  }, [isOpen, initialService, initialPlan]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          service_name: serviceName,
          plan_name: planName,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar solicitação.');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappText = encodeURIComponent(
    `Olá J.A VOZ! Gostaria de solicitar um orçamento.\nNome: ${name || 'Não informado'}\nServiço: ${
      serviceName || planName || 'Produção de Áudio'
    }\nDetalhes: ${message || 'Quero saber valores e prazos.'}`
  );
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${whatsappText}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121216] p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela de orçamento"
          className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 id="quote-modal-title" className="text-2xl font-bold text-zinc-100">
                Solicitação Recebida!
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Seu pedido de orçamento foi registrado no sistema do estúdio J.A VOZ. Para atendimento imediato, você também pode falar direto no WhatsApp.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                Agilizar pelo WhatsApp
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-zinc-200 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 pr-8">
              <p className="text-xs font-medium tracking-wide text-[#D4AF37] mb-1">
                J.A VOZ – ESTÚDIO DE GRAVAÇÕES
              </p>
              <h3 id="quote-modal-title" className="text-2xl font-bold text-zinc-100">
                Solicitar Orçamento
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                Preencha os detalhes do seu projeto e receba retorno rápido com prazos e condições.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="qm-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Seu Nome ou Nome da Empresa *
                </label>
                <input
                  id="qm-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: DJ Lucas / Loja Central"
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="qm-phone" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    id="qm-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(99) 99999-9999"
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="qm-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    E-mail (opcional)
                  </label>
                  <input
                    id="qm-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="qm-service" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Serviço Desejado
                  </label>
                  <select
                    id="qm-service"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="qm-plan" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Plano (opcional)
                  </label>
                  <select
                    id="qm-plan"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="">Orçamento avulso</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="qm-message" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Texto / Ideia da Gravação *
                </label>
                <textarea
                  id="qm-message"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Conte o nome do DJ, loja ou evento, estilo de voz desejado e prazo..."
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Enviando...' : 'Enviar Solicitação'}
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Direto
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
