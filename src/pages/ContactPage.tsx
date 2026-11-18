import React, { useState } from 'react';
import { CheckCircle2, Clock, Instagram, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import type { StudioDataPayload } from '../types/studio';

interface ContactPageProps {
  data: StudioDataPayload;
}

export const ContactPage: React.FC<ContactPageProps> = ({ data }) => {
  const { settings, services } = data;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const whatsappDirectUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
    'Olá J.A VOZ – Estúdio de Gravações! Gostaria de conversar com a equipe.'
  )}`;

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
          service_name: serviceName || 'Contato Geral',
          plan_name: '',
          message,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Erro ao enviar mensagem.');
      }
      setSent(true);
      setName('');
      setPhone('');
      setEmail('');
      setServiceName('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-2xl space-y-3 border-b border-white/10 pb-8">
          <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
            Atendimento & Localização
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-zinc-100 text-balance">
            Fale diretamente com o estúdio
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Envie seu roteiro, tire dúvidas sobre prazos ou converse agora pelo WhatsApp com o {settings.brand_name}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">WhatsApp Oficial</h2>
                  <p className="text-base font-semibold text-emerald-400 mt-0.5 tabular-nums">
                    {settings.whatsapp_display}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">Resposta rápida para pedidos e envio de áudios.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">Instagram</h2>
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#D4AF37] hover:underline mt-0.5 inline-block"
                  >
                    {settings.instagram_handle}
                  </a>
                  <p className="text-xs text-zinc-400 mt-1">Bastidores de gravação e novos lançamentos.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">Localização</h2>
                  <p className="text-sm text-zinc-200 mt-0.5">{settings.location}</p>
                  <p className="text-xs text-zinc-400 mt-1">Atendimento local e entrega digital para todo o Brasil.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">Horários de Atendimento</h2>
                  <p className="text-sm text-zinc-200 mt-0.5">{settings.business_hours}</p>
                </div>
              </div>

              {settings.email && (
                <div className="flex items-start gap-3.5 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-100">E-mail</h2>
                    <p className="text-sm text-zinc-200 mt-0.5">{settings.email}</p>
                  </div>
                </div>
              )}
            </div>

            <a
              href={whatsappDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Conversar Diretamente pelo WhatsApp
            </a>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#121216] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Enviar Mensagem ou Pedido</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Preencha os campos abaixo. Nossa equipe recebe sua solicitação em tempo real no painel do estúdio.
            </p>

            {sent ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-zinc-100">Mensagem enviada com sucesso!</h3>
                  <p className="text-sm text-zinc-300">
                    Obrigado por entrar em contato com o {settings.brand_name}. Responderemos o mais breve possível.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-zinc-200 hover:bg-white/5"
                  >
                    Enviar Outra Mensagem
                  </button>
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Abrir WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c-name" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      id="c-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="c-phone" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      id="c-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(99) 98126-3139"
                      className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c-email" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      E-mail (opcional)
                    </label>
                    <input
                      id="c-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="c-service" className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Assunto / Serviço
                    </label>
                    <select
                      id="c-service"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-3 text-sm text-zinc-100 focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="c-message" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Mensagem / Briefing *
                  </label>
                  <textarea
                    id="c-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva aqui os detalhes do seu pedido, texto para locução ou dúvida..."
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
