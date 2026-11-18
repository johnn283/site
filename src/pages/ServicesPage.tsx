import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import type { AppRoute } from '../components/Header';
import { SmartImage } from '../components/SmartImage';
import type { StudioDataPayload } from '../types/studio';

interface ServicesPageProps {
  data: StudioDataPayload;
  onNavigate: (route: AppRoute) => void;
  onOpenQuote: (serviceName?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ data, onNavigate, onOpenQuote }) => {
  const { services, settings } = data;

  return (
    <div className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Catálogo de Serviços
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-zinc-100 text-balance">
              Produções sob medida para DJs, empresas e grandes eventos
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Do roteiro à masterização final, cada serviço do {settings.brand_name} é pensado para entregar máxima presença sonora e impacto visual.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/demonstracoes')}
              className="px-5 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-zinc-100 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Ouça Exemplos Reais
            </button>
            <button
              type="button"
              onClick={() => onOpenQuote()}
              className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors whitespace-nowrap"
            >
              SOLICITAR ORÇAMENTO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <article
              key={service.id}
              className="group rounded-2xl border border-white/10 bg-[#121216] overflow-hidden flex flex-col hover:border-[#D4AF37]/45 transition-colors"
            >
              <div className="aspect-[4/3] bg-[#09090B] overflow-hidden">
                <SmartImage
                  src={service.image_url}
                  alt={service.title}
                  fallbackTitle={service.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono text-[#D4AF37] font-semibold">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{service.category}</span>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-100">{service.title}</h2>
                  <p className="text-sm text-zinc-400 leading-relaxed">{service.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenQuote(service.title)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D4AF37] hover:text-[#F0D175] transition-colors"
                  >
                    Contratar serviço
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                      `Olá J.A VOZ! Tenho interesse no serviço: ${service.title}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Conversar sobre ${service.title} no WhatsApp`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
