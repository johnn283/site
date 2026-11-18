import React, { useCallback, useEffect, useState } from 'react';
import { Footer } from './components/Footer';
import { Header, type AppRoute } from './components/Header';
import { QuoteModal } from './components/QuoteModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { ContactPage } from './pages/ContactPage';
import { DemosPage } from './pages/DemosPage';
import { HomePage } from './pages/HomePage';
import { PlansPage } from './pages/PlansPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ServicesPage } from './pages/ServicesPage';
import type { StudioDataPayload } from './types/studio';

const VALID_ROUTES: AppRoute[] = [
  '/',
  '/sobre',
  '/servicos',
  '/portfolio',
  '/demonstracoes',
  '/planos',
  '/contato',
  '/admin',
];

function resolveRouteFromPath(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return VALID_ROUTES.includes(clean as AppRoute) ? (clean as AppRoute) : '/';
}

const ROUTE_TITLES: Record<AppRoute, string> = {
  '/': 'J.A VOZ – Estúdio de Gravações | Sua Voz em Outro Nível',
  '/sobre': 'Sobre Nós | J.A VOZ – Estúdio de Gravações',
  '/servicos': 'Serviços de Áudio e Artes | J.A VOZ – Estúdio de Gravações',
  '/portfolio': 'Portfólio de Produções | J.A VOZ – Estúdio de Gravações',
  '/demonstracoes': 'Ouça Nosso Trabalho | J.A VOZ – Estúdio de Gravações',
  '/planos': 'Planos e Orçamentos | J.A VOZ – Estúdio de Gravações',
  '/contato': 'Contato e WhatsApp | J.A VOZ – Estúdio de Gravações',
  '/admin': 'Painel Administrativo | J.A VOZ – Estúdio de Gravações',
};

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => resolveRouteFromPath(window.location.pathname));
  const [data, setData] = useState<StudioDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteInitialService, setQuoteInitialService] = useState('');
  const [quoteInitialPlan, setQuoteInitialPlan] = useState('');

  const fetchStudioData = useCallback(async () => {
    try {
      const res = await fetch('/api/studio');
      if (!res.ok) throw new Error('Falha ao carregar dados do estúdio.');
      const payload = (await res.json()) as StudioDataPayload;
      setData(payload);
      setLoadError('');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudioData();
  }, [fetchStudioData]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(resolveRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.title = ROUTE_TITLES[route];
  }, [route]);

  const navigate = useCallback((nextRoute: AppRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openQuoteModal = useCallback((serviceName = '', planName = '') => {
    setQuoteInitialService(serviceName);
    setQuoteInitialPlan(planName);
    setQuoteModalOpen(true);
  }, []);

  const handleTrackPlay = useCallback(async (demoId: number) => {
    try {
      await fetch(`/api/demos/${demoId}/play`, { method: 'POST' });
      setData((prev) =>
        prev
          ? {
              ...prev,
              demos: prev.demos.map((d) =>
                d.id === demoId ? { ...d, plays_count: d.plays_count + 1 } : d
              ),
            }
          : prev
      );
    } catch {
      // non-blocking play counter
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-zinc-400">Carregando J.A VOZ – Estúdio de Gravações...</p>
        </div>
      </div>
    );
  }

  if (!data || loadError) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-white/10 bg-[#121216] p-8 text-center space-y-4">
          <h1 className="text-xl font-bold text-zinc-100">Erro ao conectar ao servidor</h1>
          <p className="text-sm text-zinc-400">{loadError || 'Não foi possível carregar o estúdio.'}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchStudioData();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#09090B] text-sm font-bold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col">
      <Header
        currentRoute={route}
        onNavigate={navigate}
        onOpenQuote={() => openQuoteModal()}
      />

      <main className="flex-1">
        {route === '/' && (
          <HomePage
            data={data}
            onNavigate={navigate}
            onOpenQuote={(svc) => openQuoteModal(svc)}
            onTrackPlay={handleTrackPlay}
          />
        )}
        {route === '/sobre' && (
          <AboutPage
            data={data}
            onNavigate={navigate}
            onOpenQuote={() => openQuoteModal()}
          />
        )}
        {route === '/servicos' && (
          <ServicesPage
            data={data}
            onNavigate={navigate}
            onOpenQuote={(svc) => openQuoteModal(svc)}
          />
        )}
        {route === '/portfolio' && (
          <PortfolioPage
            data={data}
            onOpenQuote={(svc) => openQuoteModal(svc)}
          />
        )}
        {route === '/demonstracoes' && (
          <DemosPage
            data={data}
            onTrackPlay={handleTrackPlay}
            onOpenQuote={(svc) => openQuoteModal(svc)}
          />
        )}
        {route === '/planos' && (
          <PlansPage
            data={data}
            onNavigate={navigate}
            onOpenQuote={(svc, plan) => openQuoteModal(svc, plan)}
          />
        )}
        {route === '/contato' && <ContactPage data={data} />}
        {route === '/admin' && <AdminPage data={data} onRefresh={fetchStudioData} />}
      </main>

      <Footer settings={data.settings} onNavigate={navigate} />

      <WhatsAppFloatingButton settings={data.settings} />

      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        services={data.services}
        plans={data.plans}
        settings={data.settings}
        initialService={quoteInitialService}
        initialPlan={quoteInitialPlan}
      />
    </div>
  );
}
