import React from 'react';
import { Clock, Instagram, Lock, MapPin, MessageCircle } from 'lucide-react';
import type { SiteSettings } from '../types/studio';
import type { AppRoute } from './Header';
import { StudioLogo } from './StudioLogo';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const nav = (e: React.MouseEvent, route: AppRoute) => {
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <footer className="border-t border-white/10 bg-[#070709] text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <StudioLogo />
            <p className="text-sm font-semibold text-[#D4AF37] tracking-wide">{settings.slogan}</p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Produtora de áudio profissional especializada em vinhetas para DJs e paredões, spots comerciais, chamadas de eventos e artes visuais.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Navegação</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/" onClick={(e) => nav(e, '/')} className="hover:text-[#D4AF37] transition-colors">
                  Página Inicial
                </a>
              </li>
              <li>
                <a href="/sobre" onClick={(e) => nav(e, '/sobre')} className="hover:text-[#D4AF37] transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="/servicos" onClick={(e) => nav(e, '/servicos')} className="hover:text-[#D4AF37] transition-colors">
                  Serviços
                </a>
              </li>
              <li>
                <a href="/portfolio" onClick={(e) => nav(e, '/portfolio')} className="hover:text-[#D4AF37] transition-colors">
                  Portfólio
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Produção & Orçamentos</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/demonstracoes"
                  onClick={(e) => nav(e, '/demonstracoes')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Ouça Nosso Trabalho
                </a>
              </li>
              <li>
                <a href="/planos" onClick={(e) => nav(e, '/planos')} className="hover:text-[#D4AF37] transition-colors">
                  Planos e Orçamentos
                </a>
              </li>
              <li>
                <a href="/contato" onClick={(e) => nav(e, '/contato')} className="hover:text-[#D4AF37] transition-colors">
                  Fale Conosco
                </a>
              </li>
              <li>
                <a
                  href="/admin"
                  onClick={(e) => nav(e, '/admin')}
                  className="inline-flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Painel Administrativo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Atendimento</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{settings.location}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>{settings.business_hours}</span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                    'Olá J.A VOZ! Gostaria de conversar sobre uma gravação.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {settings.whatsapp_display}
                </a>
              </li>
              <li>
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-300 hover:text-[#D4AF37] transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  {settings.instagram_handle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {settings.brand_name}. Todos os direitos reservados.</p>
          <p>{settings.location}</p>
        </div>
      </div>
    </footer>
  );
};
