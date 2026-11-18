import React from 'react';
import { Award, CheckCircle2, MapPin, Mic2, ShieldCheck } from 'lucide-react';
import type { AppRoute } from '../components/Header';
import { SmartImage } from '../components/SmartImage';
import type { StudioDataPayload } from '../types/studio';

interface AboutPageProps {
  data: StudioDataPayload;
  onNavigate: (route: AppRoute) => void;
  onOpenQuote: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ data, onNavigate, onOpenQuote }) => {
  const { settings, photos } = data;

  return (
    <div className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Header & Split Story */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
                Sobre Nós · {settings.brand_name}
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold text-zinc-100 leading-tight text-balance">
                {settings.about_title}
              </h1>
            </div>
            <p className="text-zinc-300 leading-relaxed text-base">{settings.about_story}</p>
            <div className="flex items-center gap-2.5 text-sm text-zinc-300 pt-1">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Sediado em {settings.location} · Atendimento presencial e online</span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenQuote}
                className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors"
              >
                CONTRATAR AGORA
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/demonstracoes')}
                className="px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5 text-zinc-100 text-sm font-semibold transition-colors"
              >
                Ouvir Demonstrações
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-white/10 bg-[#121216] min-h-[340px]">
            <SmartImage
              src={settings.about_image}
              alt="Estrutura e equipamentos do estúdio J.A VOZ"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Pillars: Mission, Quality, Trust */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#121216] p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Nossa Missão</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{settings.about_mission}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121216] p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Qualidade Sonora</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">{settings.about_commitment}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#121216] p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Padrão Profissional</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Fluxo de produção completo da criação do roteiro à masterização final, garantindo áudio livre de ruídos e com volume competitivo.
            </p>
          </div>
        </section>

        {/* Studio Structure & Photos */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
                Estrutura & Equipamentos
              </p>
              <h2 className="text-3xl font-bold text-zinc-100">Conheça nosso ambiente de gravação</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Captação tratada · Monitoração de referência</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <figure
                key={photo.id}
                className="rounded-2xl border border-white/10 bg-[#121216] overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-[#09090B] overflow-hidden">
                  <SmartImage
                    src={photo.image_url}
                    alt={photo.title}
                    fallbackTitle={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="p-4 space-y-1">
                  <p className="text-xs text-[#D4AF37] font-medium">{photo.category}</p>
                  <h3 className="text-sm font-bold text-zinc-100">{photo.title}</h3>
                  {photo.caption && <p className="text-xs text-zinc-400 leading-relaxed">{photo.caption}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
