import React from 'react';
import { ArrowRight, Check, MessageCircle, Settings } from 'lucide-react';
import type { AppRoute } from '../components/Header';
import type { StudioDataPayload } from '../types/studio';

interface PlansPageProps {
  data: StudioDataPayload;
  onNavigate: (route: AppRoute) => void;
  onOpenQuote: (serviceName?: string, planName?: string) => void;
}

export const PlansPage: React.FC<PlansPageProps> = ({ data, onNavigate, onOpenQuote }) => {
  const { plans, settings } = data;

  return (
    <div className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Planos & Orçamentos
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-zinc-100 text-balance">
              Pacotes de produção e valores promocionais
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Confira os formatos disponíveis no {settings.brand_name}. Valores promocionais e condições especiais são atualizados diretamente pela administração do estúdio conforme a sua demanda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/admin')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-zinc-300 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
            Atualizar Valores (Admin)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => {
            const isHighlighted = plan.highlighted === 1;
            const whatsappText = encodeURIComponent(
              `Olá J.A VOZ! Gostaria de solicitar orçamento para o plano: ${plan.title}.`
            );
            return (
              <article
                key={plan.id}
                className={`rounded-2xl p-7 sm:p-8 flex flex-col justify-between space-y-8 border transition-colors ${
                  isHighlighted
                    ? 'border-[#D4AF37]/60 bg-gradient-to-b from-[#19150C] to-[#121216]'
                    : 'border-white/10 bg-[#121216]'
                }`}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    {isHighlighted && (
                      <p className="text-xs font-bold tracking-wider text-[#D4AF37] uppercase">
                        Mais Procurado
                      </p>
                    )}
                    <h2 className="text-2xl font-bold text-zinc-100">{plan.title}</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed">{plan.subtitle}</p>
                  </div>

                  <div className="py-4 border-y border-white/10">
                    <p className="text-2xl sm:text-3xl font-extrabold font-display text-[#D4AF37] tabular-nums">
                      {plan.price_text}
                    </p>
                    {plan.billing_note && (
                      <p className="text-xs text-zinc-400 mt-1.5">{plan.billing_note}</p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenQuote('', plan.title)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-colors ${
                      isHighlighted
                        ? 'bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B]'
                        : 'bg-white/10 hover:bg-[#D4AF37] text-zinc-100 hover:text-[#09090B]'
                    }`}
                  >
                    SOLICITAR ORÇAMENTO
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/${settings.whatsapp_number}?text=${whatsappText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar pelo WhatsApp
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Custom Briefing Callout */}
        <div className="rounded-2xl border border-white/10 bg-[#121216] p-7 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-2xl font-bold text-zinc-100">Precisa de um pacote fechado para rádio, loja ou turnê?</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Montamos propostas exclusivas para pacotes mensais de spots, atualizações recorrentes de pendrive e pacotes completos de identidade sonora + artes.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenQuote('Pacote Sob Medida')}
            className="px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors whitespace-nowrap shrink-0"
          >
            SOLICITAR ORÇAMENTO
          </button>
        </div>
      </div>
    </div>
  );
};
