import React from 'react';
import {
  ArrowRight,
  Check,
  Headphones,
  MessageCircle,
  Mic2,
  Quote,
  Radio,
  Sliders,
  Star,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AudioPlayer } from '../components/AudioPlayer';
import type { AppRoute } from '../components/Header';
import { SmartImage } from '../components/SmartImage';
import type { StudioDataPayload } from '../types/studio';

interface HomePageProps {
  data: StudioDataPayload;
  onNavigate: (route: AppRoute) => void;
  onOpenQuote: (serviceName?: string) => void;
  onTrackPlay: (demoId: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  data,
  onNavigate,
  onOpenQuote,
  onTrackPlay,
}) => {
  const { settings, services, demos, portfolio, testimonials } = data;
  const featuredServices = services.slice(0, 6);
  const featuredDemos = demos.slice(0, 3);
  const featuredArt = portfolio.find((p) => p.media_type === 'art');
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
    'Olá J.A VOZ! Quero contratar uma produção de áudio profissional.'
  )}`;

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <SmartImage
            src={settings.hero_image}
            alt="Estúdio profissional de gravação J.A VOZ com microfone condensador e mesa de áudio"
            className="w-full h-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/88 to-[#09090B]/45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-[#09090B]/50"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-6"
          >
            <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] text-[#D4AF37] uppercase">
              {settings.brand_name} · {settings.slogan}
            </p>

            <h1
              className="font-display font-extrabold tracking-tight text-zinc-50 leading-[1.06] text-balance"
              style={{ fontSize: 'clamp(2.25rem, 4.4vw, 3.85rem)' }}
            >
              {settings.hero_title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
              {settings.hero_subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => onOpenQuote()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold tracking-wide transition-colors whitespace-nowrap"
              >
                CONTRATAR AGORA
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/servicos')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-zinc-100 text-sm font-semibold transition-colors whitespace-nowrap"
              >
                CONHEÇA NOSSOS SERVIÇOS
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp {settings.whatsapp_display}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STUDIO CAPABILITIES STRIP */}
      <section className="border-b border-white/10 bg-[#0D0D11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
              <Mic2 className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Captação Condensador</h2>
              <p className="text-xs text-zinc-400 mt-1">Cabine tratada com microfones de alta definição vocal.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Masterização de Impacto</h2>
              <p className="text-xs text-zinc-400 mt-1">Pressão sonora calibrada para rádio, loja e paredão.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Entrega Rápida Digital</h2>
              <p className="text-xs text-zinc-400 mt-1">Envio direto em MP3 320kbps e WAV via WhatsApp.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Atendimento Direto</h2>
              <p className="text-xs text-zinc-400 mt-1">{settings.location}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. APRESENTAÇÃO DO ESTÚDIO */}
      <section className="py-18 lg:py-24 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-white/10 bg-[#121216] min-h-[320px]">
            <SmartImage
              src={settings.about_image}
              alt="Mesa de mixagem profissional e monitores do estúdio J.A VOZ"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
                Sobre o Estúdio
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 leading-tight text-balance">
                {settings.about_title}
              </h2>
            </div>

            <p className="text-zinc-300 leading-relaxed">{settings.about_story}</p>

            <ul className="space-y-3 pt-1">
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-1" />
                <span>Edição, trilhas exclusivas e efeitos sonoros sob medida para cada projeto.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-1" />
                <span>Equalização dedicada para sistemas automotivos, eventos ao vivo e publicidade.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-300">
                <Check className="w-4 h-4 text-[#D4AF37] shrink-0 mt-1" />
                <span>Atendimento para todo o Maranhão e envio online para qualquer cidade do Brasil.</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/sobre')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-white/15 hover:border-[#D4AF37]/60 text-zinc-100 text-sm font-semibold transition-colors"
              >
                Conhecer Nossa História
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DESTAQUES DOS PRINCIPAIS SERVIÇOS */}
      <section className="py-18 lg:py-24 border-b border-white/10 bg-[#0B0B0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
                Soluções em Áudio & Divulgação
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 text-balance">
                Serviços profissionais para fazer sua voz e sua marca dominarem o ambiente
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/servicos')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D4AF37] hover:text-[#F0D175] transition-colors whitespace-nowrap shrink-0"
            >
              Ver todos os serviços
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service, index) => (
              <article
                key={service.id}
                className={`group rounded-2xl border border-white/10 bg-[#121216] overflow-hidden flex flex-col transition-colors hover:border-[#D4AF37]/40 ${
                  index === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                <div className={`overflow-hidden bg-[#09090B] ${index === 0 ? 'h-56 sm:h-64' : 'h-48'}`}>
                  <SmartImage
                    src={service.image_url}
                    alt={service.title}
                    fallbackTitle={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                      <span className="font-mono text-[#D4AF37]">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{service.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100">{service.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed mt-2">{service.description}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => onOpenQuote(service.title)}
                      className="text-sm font-semibold text-[#D4AF37] hover:text-[#F0D175] inline-flex items-center gap-1.5 transition-colors"
                    >
                      Solicitar orçamento
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TRABALHOS REALIZADOS / OUÇA NOSSO TRABALHO */}
      <section className="py-18 lg:py-24 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
                Ouça Nosso Trabalho
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 text-balance">
                Trabalhos recentes com padrão de estúdio
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('/demonstracoes')}
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-xs font-bold transition-colors whitespace-nowrap"
              >
                Abrir Sala de Demos
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/portfolio')}
                className="px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-zinc-100 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                Ver Portfólio Completo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 space-y-4">
              {featuredDemos.map((track) => (
                <div
                  key={track.id}
                  className="rounded-2xl border border-white/10 bg-[#121216] p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                        <span className="text-[#D4AF37] font-medium">{track.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{track.duration}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{track.plays_count} reproduções</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-100">{track.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">{track.description}</p>
                  <AudioPlayer
                    src={track.audio_url}
                    title={track.title}
                    durationHint={track.duration}
                    onPlayTrack={() => onTrackPlay(track.id)}
                  />
                </div>
              ))}
            </div>

            {featuredArt && (
              <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#121216] overflow-hidden flex flex-col">
                <div className="h-64 lg:flex-1 bg-[#09090B] overflow-hidden">
                  <SmartImage
                    src={featuredArt.image_url}
                    alt={featuredArt.title}
                    fallbackTitle={featuredArt.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="text-[#D4AF37] font-medium">{featuredArt.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredArt.client_name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-100">{featuredArt.title}</h3>
                  <p className="text-sm text-zinc-400">{featuredArt.description}</p>
                  <button
                    type="button"
                    onClick={() => onNavigate('/portfolio')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] hover:text-[#F0D175] pt-1"
                  >
                    Explorar artes e áudios
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. DEPOIMENTOS DE CLIENTES */}
      <section className="py-18 lg:py-24 border-b border-white/10 bg-[#0B0B0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase mb-2">
              Confiança Comprovada
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 text-balance">
              Quem grava com o J.A VOZ recomenda o resultado
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <blockquote
                key={t.id}
                className="rounded-2xl border border-white/10 bg-[#121216] p-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Quote className="w-6 h-6 text-[#D4AF37]/60" />
                    <div className="flex items-center gap-0.5 text-[#D4AF37]" aria-label={`${t.rating} de 5 estrelas`}>
                      {Array.from({ length: t.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">“{t.quote}”</p>
                </div>

                <footer className="pt-4 border-t border-white/10">
                  <p className="text-sm font-bold text-zinc-100">{t.client_name}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {t.client_role}
                    {t.company ? ` · ${t.company}` : ''}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CALLOUT FINAL DE CONVERSÃO */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#17140D] via-[#121216] to-[#0D0D11] p-8 sm:p-12 text-center space-y-6">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#D4AF37] uppercase">
              {settings.slogan}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 max-w-2xl mx-auto text-balance">
              Pronto para produzir sua vinheta, spot comercial ou chamada oficial?
            </h2>
            <p className="text-zinc-300 max-w-xl mx-auto text-sm sm:text-base">
              Converse diretamente com nossa equipe pelo WhatsApp ou envie seu pedido de orçamento online agora mesmo.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => onOpenQuote()}
                className="px-7 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors whitespace-nowrap"
              >
                SOLICITAR ORÇAMENTO
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                Falar no WhatsApp {settings.whatsapp_display}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
