import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { StudioLogo } from './StudioLogo';

export type AppRoute =
  | '/'
  | '/sobre'
  | '/servicos'
  | '/portfolio'
  | '/demonstracoes'
  | '/planos'
  | '/contato'
  | '/admin';

interface HeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onOpenQuote: () => void;
}

const DESKTOP_LINKS: Array<{ route: AppRoute; label: string }> = [
  { route: '/sobre', label: 'Sobre' },
  { route: '/servicos', label: 'Serviços' },
  { route: '/portfolio', label: 'Portfólio' },
  { route: '/demonstracoes', label: 'Demos' },
  { route: '/planos', label: 'Planos' },
  { route: '/contato', label: 'Contato' },
];

const MOBILE_LINKS: Array<{ route: AppRoute; label: string }> = [
  { route: '/', label: 'Início' },
  { route: '/sobre', label: 'Sobre Nós' },
  { route: '/servicos', label: 'Serviços' },
  { route: '/portfolio', label: 'Portfólio' },
  { route: '/demonstracoes', label: 'Ouça Nosso Trabalho' },
  { route: '/planos', label: 'Planos e Orçamentos' },
  { route: '/contato', label: 'Contato' },
  { route: '/admin', label: 'Painel Administrativo' },
];

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, onOpenQuote }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (route: AppRoute) => {
    onNavigate(route);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg whitespace-nowrap shrink-0"
        >
          <StudioLogo />
        </a>

        {/* Zone 2: Clean single-line text navigation */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-7">
          {DESKTOP_LINKS.map((item) => {
            const active = currentRoute === item.route;
            return (
              <a
                key={item.route}
                href={item.route}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.route);
                }}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active ? 'text-[#D4AF37]' : 'text-zinc-300 hover:text-zinc-100'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#D4AF37] rounded-full"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action + mobile drawer trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenQuote}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-xs font-bold tracking-wide transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            CONTRATAR AGORA
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden p-2.5 rounded-lg border border-white/10 text-zinc-200 hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#0D0D11] px-4 py-4 space-y-1">
          {MOBILE_LINKS.map((item) => {
            const active = currentRoute === item.route;
            return (
              <a
                key={item.route}
                href={item.route}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.route);
                }}
                className={`block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-zinc-100'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <div className="pt-3">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenQuote();
              }}
              className="w-full py-3 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors"
            >
              CONTRATAR AGORA
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
