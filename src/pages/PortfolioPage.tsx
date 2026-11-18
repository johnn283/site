import React, { useMemo, useState } from 'react';
import { Expand, Headphones, Image as ImageIcon, X } from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { SmartImage } from '../components/SmartImage';
import type { PortfolioItem, StudioDataPayload } from '../types/studio';

interface PortfolioPageProps {
  data: StudioDataPayload;
  onOpenQuote: (serviceName?: string) => void;
}

const CATEGORIES = [
  'Todos',
  'Vinhetas',
  'Spots Comerciais',
  'Chamadas de Eventos',
  'Locuções',
  'Artes Produzidas',
];

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ data, onOpenQuote }) => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'Todos') return data.portfolio;
    return data.portfolio.filter((item) => item.category === activeCategory);
  }, [data.portfolio, activeCategory]);

  return (
    <div className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/10 pb-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Galeria de Produções
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold text-zinc-100 text-balance">
              Portfólio de áudios e artes produzidas
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Ouça vinhetas, spots comerciais, chamadas e locuções diretamente no navegador ou amplie as artes visuais desenvolvidas pelo estúdio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenQuote()}
            className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors whitespace-nowrap shrink-0"
          >
            Quero Uma Produção Assim
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtrar portfólio por categoria">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(cat)}
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

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#121216] p-12 text-center space-y-2">
            <p className="text-zinc-200 font-semibold">Nenhum trabalho cadastrado nesta categoria ainda.</p>
            <p className="text-sm text-zinc-400">Selecione outra categoria acima ou adicione novos itens no Painel Administrativo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#121216] overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/9] bg-[#09090B] overflow-hidden group">
                  <SmartImage
                    src={item.image_url}
                    alt={item.title}
                    fallbackTitle={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.media_type === 'art' && (
                    <button
                      type="button"
                      onClick={() => setLightboxItem(item)}
                      aria-label={`Ampliar arte ${item.title}`}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09090B]/90 border border-white/20 text-xs font-semibold text-zinc-100">
                        <Expand className="w-4 h-4 text-[#D4AF37]" />
                        Ampliar Arte
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="text-[#D4AF37] font-medium">{item.category}</span>
                      {item.client_name && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{item.client_name}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{item.duration}</span>
                    </div>
                    <h2 className="text-xl font-bold text-zinc-100">{item.title}</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
                  </div>

                  {item.media_type === 'audio' && item.audio_url ? (
                    <AudioPlayer src={item.audio_url} title={item.title} durationHint={item.duration} />
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
                        <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                        Material gráfico profissional
                      </span>
                      <button
                        type="button"
                        onClick={() => setLightboxItem(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-[#F0D175]"
                      >
                        <Expand className="w-3.5 h-3.5" />
                        Visualizar em tela cheia
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Lightbox for Artwork */}
        {lightboxItem && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxItem.title}
          >
            <div className="relative max-w-4xl w-full rounded-2xl border border-white/15 bg-[#121216] overflow-hidden">
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="Fechar visualização"
                className="absolute top-4 right-4 z-10 p-2.5 rounded-xl bg-black/70 text-zinc-100 hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="max-h-[75vh] bg-[#09090B] flex items-center justify-center overflow-hidden">
                <SmartImage
                  src={lightboxItem.image_url}
                  alt={lightboxItem.title}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-[#D4AF37] font-medium">
                    {lightboxItem.category} {lightboxItem.client_name ? `· ${lightboxItem.client_name}` : ''}
                  </p>
                  <h3 className="text-lg font-bold text-zinc-100">{lightboxItem.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const title = lightboxItem.title;
                    setLightboxItem(null);
                    onOpenQuote(`Arte para Evento (${title})`);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-xs font-bold whitespace-nowrap"
                >
                  <Headphones className="w-4 h-4" />
                  Solicitar Arte Parecida
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
