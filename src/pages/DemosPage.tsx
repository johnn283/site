import React, { useMemo, useState } from 'react';
import { Headphones, MessageCircle } from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { SmartImage } from '../components/SmartImage';
import type { StudioDataPayload } from '../types/studio';

interface DemosPageProps {
  data: StudioDataPayload;
  onTrackPlay: (demoId: number) => void;
  onOpenQuote: (serviceName?: string) => void;
}

export const DemosPage: React.FC<DemosPageProps> = ({ data, onTrackPlay, onOpenQuote }) => {
  const { demos, settings } = data;
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(demos.map((d) => d.category).filter(Boolean)));
    return ['Todas', ...unique];
  }, [demos]);

  const filteredDemos = useMemo(() => {
    if (selectedCategory === 'Todas') return demos;
    return demos.filter((d) => d.category === selectedCategory);
  }, [demos, selectedCategory]);

  return (
    <div className="py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Sala de Audição · {settings.brand_name}
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-zinc-100 text-balance">
              OUÇA NOSSO TRABALHO
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Dê o play e confira a clareza vocal, o peso dos graves e o acabamento profissional de nossas produções. Novos áudios podem ser enviados a qualquer momento pelo Painel Administrativo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenQuote('Produção Personalizada (Demo)')}
              className="px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors whitespace-nowrap"
            >
              CONTRATAR AGORA
            </button>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtrar demonstrações">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#D4AF37] text-[#09090B]'
                    : 'bg-[#121216] border border-white/10 text-zinc-300 hover:text-zinc-100 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Audio Tracks List */}
        {filteredDemos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#121216] p-12 text-center space-y-2">
            <Headphones className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
            <p className="font-semibold text-zinc-200">Nenhuma faixa de áudio encontrada nesta categoria.</p>
            <p className="text-sm text-zinc-400">Envie novas faixas no Painel Administrativo ou escolha outra categoria.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredDemos.map((track, idx) => (
              <article
                key={track.id}
                className="rounded-2xl border border-white/10 bg-[#121216] p-5 sm:p-6 flex flex-col md:flex-row gap-5 items-stretch"
              >
                <div className="w-full md:w-44 aspect-[4/3] md:aspect-auto md:h-36 rounded-xl overflow-hidden bg-[#09090B] border border-white/10 shrink-0">
                  <SmartImage
                    src={track.cover_url}
                    alt={track.title}
                    fallbackTitle={track.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <span className="font-mono text-[#D4AF37]">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#D4AF37] font-medium">{track.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{track.duration}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{track.plays_count} plays</span>
                      </div>
                      <h2 className="text-xl font-bold text-zinc-100">{track.title}</h2>
                      <p className="text-sm text-zinc-400 leading-relaxed">{track.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenQuote(track.title)}
                      className="self-start shrink-0 px-3.5 py-2 rounded-lg border border-white/15 hover:border-[#D4AF37]/60 text-xs font-semibold text-zinc-200 hover:text-[#D4AF37] transition-colors whitespace-nowrap"
                    >
                      Quero neste estilo
                    </button>
                  </div>

                  <AudioPlayer
                    src={track.audio_url}
                    title={track.title}
                    durationHint={track.duration}
                    onPlayTrack={() => onTrackPlay(track.id)}
                  />
                </div>
              </article>
            ))}
          </div>
        )}

        {/* WhatsApp direct CTA */}
        <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Precisa de uma demonstração personalizada do seu texto?</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Envie seu roteiro ou nome do DJ pelo WhatsApp e receba orientação de estilo e prazo.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
              'Olá J.A VOZ! Ouvi as demonstrações no site e quero gravar meu projeto.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
