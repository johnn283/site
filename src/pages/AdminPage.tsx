import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  FileAudio,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  Lock,
  LogOut,
  MessageCircle,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { SmartImage } from '../components/SmartImage';
import type { PricingPlan, QuoteRequest, ServiceItem, SiteSettings, StudioDataPayload } from '../types/studio';

interface AdminPageProps {
  data: StudioDataPayload;
  onRefresh: () => Promise<void>;
}

type AdminTab =
  | 'texts'
  | 'services'
  | 'plans'
  | 'demos'
  | 'portfolio'
  | 'photos'
  | 'testimonials'
  | 'quotes'
  | 'security';

const TOKEN_STORAGE_KEY = 'javoz_admin_token';

export const AdminPage: React.FC<AdminPageProps> = ({ data, onRefresh }) => {
  const [token, setToken] = useState<string>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [authChecking, setAuthChecking] = useState<boolean>(!!sessionStorage.getItem(TOKEN_STORAGE_KEY));
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('quotes');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Quotes state
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(data.settings);

  // New Service state
  const [svcTitle, setSvcTitle] = useState('');
  const [svcCategory, setSvcCategory] = useState('Áudio');
  const [svcDesc, setSvcDesc] = useState('');
  const [svcImg, setSvcImg] = useState('');

  // New Plan state
  const [planTitle, setPlanTitle] = useState('');
  const [planSub, setPlanSub] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planNote, setPlanNote] = useState('');
  const [planFeatures, setPlanFeatures] = useState('');
  const [planHighlight, setPlanHighlight] = useState(false);

  // New Demo Track state
  const [demoTitle, setDemoTitle] = useState('');
  const [demoCat, setDemoCat] = useState('Vinhetas');
  const [demoDesc, setDemoDesc] = useState('');
  const [demoDur, setDemoDur] = useState('00:15');
  const [demoAudioUrl, setDemoAudioUrl] = useState('');
  const [demoCoverUrl, setDemoCoverUrl] = useState('');

  // New Portfolio Item state
  const [portTitle, setPortTitle] = useState('');
  const [portCat, setPortCat] = useState('Vinhetas');
  const [portClient, setPortClient] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portDur, setPortDur] = useState('00:15');
  const [portMediaType, setPortMediaType] = useState<'audio' | 'art'>('audio');
  const [portAudioUrl, setPortAudioUrl] = useState('');
  const [portImageUrl, setPortImageUrl] = useState('');

  // New Photo state
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCat, setPhotoCat] = useState('Estúdio');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // New Testimonial state
  const [testName, setTestName] = useState('');
  const [testRole, setTestRole] = useState('');
  const [testCompany, setTestCompany] = useState('');
  const [testQuote, setTestQuote] = useState('');
  const [testRating, setTestRating] = useState(5);

  // Change password state
  const [currPwd, setCurrPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setSettingsForm(data.settings);
  }, [data.settings]);

  const notify = (type: 'ok' | 'err', text: string) => {
    setFeedback({ type, text });
    window.setTimeout(() => setFeedback(null), 4500);
  };

  const authHeaders = useCallback(
    (isJson = true): HeadersInit => {
      const h: Record<string, string> = { Authorization: `Bearer ${token}` };
      if (isJson) h['Content-Type'] = 'application/json';
      return h;
    },
    [token]
  );

  const fetchQuotes = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/quotes', { headers: authHeaders(false) });
      if (res.ok) {
        const list = (await res.json()) as QuoteRequest[];
        setQuotes(list);
      }
    } catch {
      // ignore transient error
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (!token) {
      setAuthChecking(false);
      return;
    }
    fetch('/api/admin/session', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken('');
        } else {
          fetchQuotes();
        }
      })
      .finally(() => setAuthChecking(false));
  }, [token, fetchQuotes]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha na autenticação.');
      sessionStorage.setItem(TOKEN_STORAGE_KEY, json.token);
      setToken(json.token);
      setPasswordInput('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Senha inválida.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
  };

  const uploadFile = async (file: File, kind: 'audio' | 'image'): Promise<string | null> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const endpoint = kind === 'audio' ? '/api/admin/upload-audio' : '/api/admin/upload-image';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: authHeaders(false),
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Falha ao enviar arquivo.');
      notify('ok', `Arquivo "${file.name}" enviado com sucesso.`);
      return json.url as string;
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro no upload.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) throw new Error('Erro ao salvar configurações.');
      await onRefresh();
      notify('ok', 'Textos e informações de contato atualizados!');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao salvar.');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: svcTitle,
          category: svcCategory,
          description: svcDesc,
          image_url: svcImg,
        }),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar serviço.');
      setSvcTitle('');
      setSvcDesc('');
      setSvcImg('');
      await onRefresh();
      notify('ok', 'Serviço adicionado ao site.');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao criar serviço.');
    }
  };

  const handleDeleteService = async (id: number) => {
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await onRefresh();
    notify('ok', 'Serviço removido.');
  };

  const handleUpdateService = async (svc: ServiceItem) => {
    const res = await fetch(`/api/admin/services/${svc.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(svc),
    });
    if (res.ok) {
      await onRefresh();
      notify('ok', `Serviço "${svc.title}" atualizado.`);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: planTitle,
          subtitle: planSub,
          price_text: planPrice,
          billing_note: planNote,
          features: planFeatures
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean),
          highlighted: planHighlight,
        }),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar plano.');
      setPlanTitle('');
      setPlanSub('');
      setPlanPrice('');
      setPlanNote('');
      setPlanFeatures('');
      setPlanHighlight(false);
      await onRefresh();
      notify('ok', 'Plano cadastrado com sucesso.');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao criar plano.');
    }
  };

  const handleUpdatePlan = async (plan: PricingPlan) => {
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(plan),
    });
    if (res.ok) {
      await onRefresh();
      notify('ok', `Plano "${plan.title}" atualizado.`);
    }
  };

  const handleDeletePlan = async (id: number) => {
    await fetch(`/api/admin/plans/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await onRefresh();
    notify('ok', 'Plano removido.');
  };

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/demos', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: demoTitle,
          category: demoCat,
          description: demoDesc,
          duration: demoDur,
          audio_url: demoAudioUrl,
          cover_url: demoCoverUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao adicionar áudio.');
      setDemoTitle('');
      setDemoDesc('');
      setDemoAudioUrl('');
      setDemoCoverUrl('');
      await onRefresh();
      notify('ok', 'Áudio publicado na página Ouça Nosso Trabalho!');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao publicar áudio.');
    }
  };

  const handleDeleteDemo = async (id: number) => {
    await fetch(`/api/admin/demos/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await onRefresh();
    notify('ok', 'Áudio removido.');
  };

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: portTitle,
          category: portCat,
          client_name: portClient,
          description: portDesc,
          duration: portDur,
          media_type: portMediaType,
          audio_url: portAudioUrl,
          image_url: portImageUrl,
        }),
      });
      if (!res.ok) throw new Error('Erro ao adicionar ao portfólio.');
      setPortTitle('');
      setPortClient('');
      setPortDesc('');
      setPortAudioUrl('');
      setPortImageUrl('');
      await onRefresh();
      notify('ok', 'Item adicionado ao portfólio!');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao criar item.');
    }
  };

  const handleDeletePortfolio = async (id: number) => {
    await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await onRefresh();
    notify('ok', 'Item removido do portfólio.');
  };

  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/photos', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: photoTitle,
          category: photoCat,
          caption: photoCaption,
          image_url: photoUrl,
        }),
      });
      if (!res.ok) throw new Error('Erro ao adicionar foto.');
      setPhotoTitle('');
      setPhotoCaption('');
      setPhotoUrl('');
      await onRefresh();
      notify('ok', 'Foto adicionada à galeria do estúdio.');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao adicionar foto.');
    }
  };

  const handleDeletePhoto = async (id: number) => {
    await fetch(`/api/admin/photos/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await onRefresh();
    notify('ok', 'Foto removida.');
  };

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          client_name: testName,
          client_role: testRole,
          company: testCompany,
          quote: testQuote,
          rating: testRating,
        }),
      });
      if (!res.ok) throw new Error('Erro ao cadastrar depoimento.');
      setTestName('');
      setTestRole('');
      setTestCompany('');
      setTestQuote('');
      await onRefresh();
      notify('ok', 'Depoimento cadastrado.');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao cadastrar depoimento.');
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await onRefresh();
    notify('ok', 'Depoimento removido.');
  };

  const handleQuoteStatus = async (id: number, status: string) => {
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await fetchQuotes();
      notify('ok', 'Status do orçamento atualizado.');
    }
  };

  const handleDeleteQuote = async (id: number) => {
    await fetch(`/api/admin/quotes/${id}`, { method: 'DELETE', headers: authHeaders(false) });
    await fetchQuotes();
    notify('ok', 'Solicitação excluída.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword: currPwd, newPassword: newPwd }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao alterar senha.');
      setCurrPwd('');
      setNewPwd('');
      notify('ok', 'Senha administrativa alterada com sucesso!');
    } catch (err) {
      notify('err', err instanceof Error ? err.message : 'Erro ao alterar senha.');
    }
  };

  if (authChecking) {
    return (
      <div className="py-24 text-center text-sm text-zinc-400">
        Verificando sessão administrativa...
      </div>
    );
  }

  if (!token) {
    return (
      <div className="py-20 px-4">
        <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-[#121216] p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Painel Administrativo</h1>
            <p className="text-sm text-zinc-400">
              Área restrita para gerenciamento de áudios, fotos, serviços, preços e orçamentos do {data.settings.brand_name}.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Senha de Acesso
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha do estúdio"
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold transition-colors disabled:opacity-60"
            >
              {loggingIn ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'quotes', label: `Orçamentos (${quotes.length})` },
    { id: 'texts', label: 'Textos & Contato' },
    { id: 'services', label: 'Serviços' },
    { id: 'plans', label: 'Planos & Preços' },
    { id: 'demos', label: 'Áudios (Demos)' },
    { id: 'portfolio', label: 'Portfólio' },
    { id: 'photos', label: 'Fotos do Estúdio' },
    { id: 'testimonials', label: 'Depoimentos' },
    { id: 'security', label: 'Segurança' },
  ];

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
              Gestão do Estúdio
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">
              Painel Administrativo · J.A VOZ
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 hover:bg-white/5 text-xs font-semibold text-zinc-200 transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#D4AF37]" />
            Sair da Área Admin
          </button>
        </div>

        {feedback && (
          <div
            role="status"
            className={`rounded-xl px-4 py-3 text-sm font-medium border flex items-center gap-2 ${
              feedback.type === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#D4AF37] text-[#09090B]'
                  : 'bg-[#121216] border border-white/10 text-zinc-300 hover:text-zinc-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: QUOTES */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-100">Solicitações de Orçamento e Contato</h2>
              <button
                type="button"
                onClick={fetchQuotes}
                className="text-xs font-semibold text-[#D4AF37] hover:underline"
              >
                Atualizar lista
              </button>
            </div>
            {quotes.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#121216] p-10 text-center space-y-2">
                <Inbox className="w-8 h-8 text-zinc-500 mx-auto" />
                <p className="text-sm text-zinc-300 font-medium">Nenhuma solicitação recebida ainda.</p>
                <p className="text-xs text-zinc-500">Quando visitantes enviarem pedidos pelo site, eles aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((q) => {
                  const cleanPhone = q.phone.replace(/\D/g, '');
                  const waHref = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                    `Olá ${q.name}! Aqui é do J.A VOZ – Estúdio de Gravações. Recebemos seu pedido (${
                      q.service_name || q.plan_name || 'Orçamento'
                    }) e vamos te atender agora.`
                  )}`;
                  return (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-white/10 bg-[#121216] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span className="font-mono text-[#D4AF37]">#{q.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>{new Date(q.created_at + 'Z').toLocaleString('pt-BR')}</span>
                          {q.service_name && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-zinc-200">{q.service_name}</span>
                            </>
                          )}
                          {q.plan_name && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#D4AF37]">{q.plan_name}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-zinc-100">
                          {q.name} <span className="font-normal text-zinc-400">({q.phone})</span>
                        </h3>
                        <p className="text-sm text-zinc-300">{q.message}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <select
                          aria-label={`Status da solicitação ${q.id}`}
                          value={q.status}
                          onChange={(e) => handleQuoteStatus(q.id, e.target.value)}
                          className="rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-xs text-zinc-100"
                        >
                          <option value="Novo">Novo</option>
                          <option value="Em Atendimento">Em Atendimento</option>
                          <option value="Orçado">Orçado</option>
                          <option value="Concluído">Concluído</option>
                        </select>

                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Responder WhatsApp
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuote(q.id)}
                          aria-label="Excluir solicitação"
                          className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: TEXTS & CONTACT */}
        {activeTab === 'texts' && (
          <form onSubmit={saveSettings} className="rounded-2xl border border-white/10 bg-[#121216] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold text-zinc-100">Alterar Textos do Site e Informações de Contato</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Nome da Marca</label>
                <input
                  type="text"
                  value={settingsForm.brand_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, brand_name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Slogan</label>
                <input
                  type="text"
                  value={settingsForm.slogan}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Frase de Impacto (Hero)</label>
              <input
                type="text"
                value={settingsForm.hero_title}
                onChange={(e) => setSettingsForm({ ...settingsForm, hero_title: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Subtítulo Principal</label>
              <textarea
                rows={2}
                value={settingsForm.hero_subtitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Imagem do Banner Principal</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsForm.hero_image}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hero_image: e.target.value })}
                    className="flex-1 rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-100"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 hover:bg-white/5 text-xs text-zinc-200">
                    <Upload className="w-3.5 h-3.5" />
                    Enviar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadFile(f, 'image');
                          if (url) setSettingsForm({ ...settingsForm, hero_image: url });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Imagem Sobre Nós</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settingsForm.about_image}
                    onChange={(e) => setSettingsForm({ ...settingsForm, about_image: e.target.value })}
                    className="flex-1 rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-100"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 hover:bg-white/5 text-xs text-zinc-200">
                    <Upload className="w-3.5 h-3.5" />
                    Enviar
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadFile(f, 'image');
                          if (url) setSettingsForm({ ...settingsForm, about_image: url });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">História do Estúdio (Sobre Nós)</label>
              <textarea
                rows={3}
                value={settingsForm.about_story}
                onChange={(e) => setSettingsForm({ ...settingsForm, about_story: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Missão</label>
                <textarea
                  rows={2}
                  value={settingsForm.about_mission}
                  onChange={(e) => setSettingsForm({ ...settingsForm, about_mission: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Compromisso</label>
                <textarea
                  rows={2}
                  value={settingsForm.about_commitment}
                  onChange={(e) => setSettingsForm({ ...settingsForm, about_commitment: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">WhatsApp (somente números com 55)</label>
                <input
                  type="text"
                  value={settingsForm.whatsapp_number}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">WhatsApp (Exibição)</label>
                <input
                  type="text"
                  value={settingsForm.whatsapp_display}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_display: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Instagram (@)</label>
                <input
                  type="text"
                  value={settingsForm.instagram_handle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram_handle: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">URL do Instagram</label>
                <input
                  type="text"
                  value={settingsForm.instagram_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Localização</label>
                <input
                  type="text"
                  value={settingsForm.location}
                  onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Horários de Atendimento</label>
                <input
                  type="text"
                  value={settingsForm.business_hours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, business_hours: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </form>
        )}

        {/* TAB: SERVICES */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleCreateService} className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Adicionar Novo Serviço</h2>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Nome do Serviço *</label>
                <input
                  type="text"
                  required
                  value={svcTitle}
                  onChange={(e) => setSvcTitle(e.target.value)}
                  placeholder="Ex: Jingle Político / Empresarial"
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Categoria</label>
                <input
                  type="text"
                  value={svcCategory}
                  onChange={(e) => setSvcCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Descrição *</label>
                <textarea
                  rows={3}
                  required
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Imagem do Serviço</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={svcImg}
                    onChange={(e) => setSvcImg(e.target.value)}
                    placeholder="/uploads/images/..."
                    className="flex-1 rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-100"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs text-zinc-200 hover:bg-white/5">
                    <Upload className="w-3.5 h-3.5" />
                    Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadFile(f, 'image');
                          if (url) setSvcImg(url);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Adicionar Serviço
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Serviços Cadastrados ({data.services.length})</h2>
              {data.services.map((svc) => (
                <ServiceEditorRow
                  key={svc.id}
                  service={svc}
                  onSave={handleUpdateService}
                  onDelete={handleDeleteService}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB: PLANS & PRICING */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleCreatePlan} className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Cadastrar Novo Plano / Preço</h2>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Nome do Plano *</label>
                <input
                  type="text"
                  required
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Ex: Combo 5 Vinhetas DJ"
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Valor / Preço Promocional *</label>
                <input
                  type="text"
                  required
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  placeholder="Ex: R$ 150,00 ou Sob consulta"
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={planSub}
                  onChange={(e) => setPlanSub(e.target.value)}
                  placeholder="Descrição resumida do pacote"
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Observação de Pagamento / Prazo</label>
                <input
                  type="text"
                  value={planNote}
                  onChange={(e) => setPlanNote(e.target.value)}
                  placeholder="Ex: Entrega em até 24h via WhatsApp"
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Itens Inclusos (1 por linha)</label>
                <textarea
                  rows={4}
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  placeholder={'Locução profissional\nEfeitos especiais\nArquivo WAV + MP3'}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={planHighlight}
                  onChange={(e) => setPlanHighlight(e.target.checked)}
                  className="rounded border-white/20"
                />
                Destacar como plano principal
              </label>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Plano
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Editar Preços e Pacotes ({data.plans.length})</h2>
              {data.plans.map((plan) => (
                <PlanEditorRow
                  key={plan.id}
                  plan={plan}
                  onSave={handleUpdatePlan}
                  onDelete={handleDeletePlan}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB: DEMOS (UPLOAD AUDIO) */}
        {activeTab === 'demos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleCreateDemo} className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Enviar Novo Áudio (Ouça Nosso Trabalho)</h2>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Arquivo de Áudio (MP3, WAV, OGG) *</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#D4AF37]/50 bg-[#09090B] px-4 py-3 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10">
                    <FileAudio className="w-4 h-4" />
                    {demoAudioUrl ? 'Áudio carregado! Trocar arquivo' : 'Selecionar arquivo de áudio'}
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadFile(f, 'audio');
                          if (url) setDemoAudioUrl(url);
                        }
                      }}
                    />
                  </label>
                </div>
                {demoAudioUrl && <p className="text-[11px] text-emerald-400 mt-1 truncate">{demoAudioUrl}</p>}
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Nome da Faixa *</label>
                <input
                  type="text"
                  required
                  value={demoTitle}
                  onChange={(e) => setDemoTitle(e.target.value)}
                  placeholder="Ex: Vinheta DJ Paredão 2026"
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Categoria</label>
                  <select
                    value={demoCat}
                    onChange={(e) => setDemoCat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-zinc-100"
                  >
                    <option value="Vinhetas">Vinhetas</option>
                    <option value="Spots Comerciais">Spots Comerciais</option>
                    <option value="Chamadas de Eventos">Chamadas de Eventos</option>
                    <option value="Locuções">Locuções</option>
                    <option value="Aberturas">Aberturas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Duração</label>
                  <input
                    type="text"
                    value={demoDur}
                    onChange={(e) => setDemoDur(e.target.value)}
                    placeholder="00:15"
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={demoDesc}
                  onChange={(e) => setDemoDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Imagem de Capa (opcional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={demoCoverUrl}
                    onChange={(e) => setDemoCoverUrl(e.target.value)}
                    placeholder="URL ou envie uma imagem"
                    className="flex-1 rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-100"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs text-zinc-200 hover:bg-white/5">
                    <Upload className="w-3.5 h-3.5" />
                    Capa
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadFile(f, 'image');
                          if (url) setDemoCoverUrl(url);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!demoAudioUrl || uploading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Publicar Áudio
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Faixas Publicadas ({data.demos.length})</h2>
              {data.demos.map((track) => (
                <div key={track.id} className="rounded-2xl border border-white/10 bg-[#121216] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#D4AF37] font-medium">{track.category} · {track.plays_count} plays</p>
                      <h3 className="text-base font-bold text-zinc-100">{track.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDemo(track.id)}
                      className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10"
                      aria-label={`Remover ${track.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <AudioPlayer src={track.audio_url} title={track.title} durationHint={track.duration} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleCreatePortfolio} className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Adicionar Trabalho ao Portfólio</h2>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={portTitle}
                  onChange={(e) => setPortTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Categoria</label>
                  <select
                    value={portCat}
                    onChange={(e) => setPortCat(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-zinc-100"
                  >
                    <option value="Vinhetas">Vinhetas</option>
                    <option value="Spots Comerciais">Spots Comerciais</option>
                    <option value="Chamadas de Eventos">Chamadas de Eventos</option>
                    <option value="Locuções">Locuções</option>
                    <option value="Artes Produzidas">Artes Produzidas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Tipo de Mídia</label>
                  <select
                    value={portMediaType}
                    onChange={(e) => setPortMediaType(e.target.value as 'audio' | 'art')}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-zinc-100"
                  >
                    <option value="audio">Áudio + Capa</option>
                    <option value="art">Arte / Flyer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Cliente</label>
                  <input
                    type="text"
                    value={portClient}
                    onChange={(e) => setPortClient(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Duração / Formato</label>
                  <input
                    type="text"
                    value={portDur}
                    onChange={(e) => setPortDur(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={portDesc}
                  onChange={(e) => setPortDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>

              {portMediaType === 'audio' && (
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Enviar Arquivo de Áudio</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={portAudioUrl}
                      onChange={(e) => setPortAudioUrl(e.target.value)}
                      placeholder="/uploads/audio/..."
                      className="flex-1 rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-100"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs text-zinc-200 hover:bg-white/5">
                      <Upload className="w-3.5 h-3.5" />
                      Áudio
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.ogg,.m4a"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const url = await uploadFile(f, 'audio');
                            if (url) setPortAudioUrl(url);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Imagem / Flyer / Capa</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={portImageUrl}
                    onChange={(e) => setPortImageUrl(e.target.value)}
                    placeholder="/uploads/images/..."
                    className="flex-1 rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-100"
                  />
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/15 text-xs text-zinc-200 hover:bg-white/5">
                    <Upload className="w-3.5 h-3.5" />
                    Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = await uploadFile(f, 'image');
                          if (url) setPortImageUrl(url);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Salvar no Portfólio
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Itens do Portfólio ({data.portfolio.length})</h2>
              {data.portfolio.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-[#121216] p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#09090B] shrink-0">
                      <SmartImage src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#D4AF37] font-medium truncate">
                        {item.category} · {item.client_name || 'Estúdio'}
                      </p>
                      <h3 className="text-sm font-bold text-zinc-100 truncate">{item.title}</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePortfolio(item.id)}
                    className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0"
                    aria-label={`Excluir ${item.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: STUDIO PHOTOS */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleCreatePhoto} className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Adicionar Foto do Estúdio</h2>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Arquivo de Foto *</label>
                <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#D4AF37]/50 bg-[#09090B] px-4 py-3 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10">
                  <ImageIcon className="w-4 h-4" />
                  {photoUrl ? 'Foto carregada! Escolher outra' : 'Enviar foto (JPG, PNG, WEBP)'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const url = await uploadFile(f, 'image');
                        if (url) setPhotoUrl(url);
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Categoria</label>
                <input
                  type="text"
                  value={photoCat}
                  onChange={(e) => setPhotoCat(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Legenda</label>
                <textarea
                  rows={2}
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <button
                type="submit"
                disabled={!photoUrl || uploading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Adicionar Foto
              </button>
            </form>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.photos.map((ph) => (
                <div key={ph.id} className="rounded-2xl border border-white/10 bg-[#121216] overflow-hidden">
                  <div className="aspect-[4/3] bg-[#09090B]">
                    <SmartImage src={ph.image_url} alt={ph.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-[#D4AF37]">{ph.category}</p>
                      <h3 className="text-sm font-bold text-zinc-100 truncate">{ph.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(ph.id)}
                      className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form onSubmit={handleCreateTestimonial} className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Cadastrar Depoimento</h2>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Função / Cargo</label>
                  <input
                    type="text"
                    value={testRole}
                    onChange={(e) => setTestRole(e.target.value)}
                    placeholder="Ex: DJ / Empresário"
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Empresa / Equipe</label>
                  <input
                    type="text"
                    value={testCompany}
                    onChange={(e) => setTestCompany(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Avaliação (1 a 5)</label>
                <select
                  value={testRating}
                  onChange={(e) => setTestRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm text-zinc-100"
                >
                  <option value={5}>5 estrelas</option>
                  <option value={4}>4 estrelas</option>
                  <option value={3}>3 estrelas</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Depoimento *</label>
                <textarea
                  rows={3}
                  required
                  value={testQuote}
                  onChange={(e) => setTestQuote(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Depoimento
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-lg font-bold text-zinc-100">Depoimentos Publicados ({data.testimonials.length})</h2>
              {data.testimonials.map((t) => (
                <div key={t.id} className="rounded-2xl border border-white/10 bg-[#121216] p-5 flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-zinc-100">
                      {t.client_name} · <span className="font-normal text-zinc-400">{t.client_role}</span>
                    </h3>
                    <p className="text-sm text-zinc-300">“{t.quote}”</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTestimonial(t.id)}
                    className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="max-w-lg rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold text-zinc-100">Alterar Senha Administrativa</h2>
            </div>
            <div>
              <label className="block text-xs text-zinc-300 mb-1">Senha Atual *</label>
              <input
                type="password"
                required
                value={currPwd}
                onChange={(e) => setCurrPwd(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-300 mb-1">Nova Senha (mín. 6 caracteres) *</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#09090B] text-sm font-bold"
            >
              <Save className="w-4 h-4" />
              Atualizar Senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const ServiceEditorRow: React.FC<{
  service: ServiceItem;
  onSave: (svc: ServiceItem) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = ({ service, onSave, onDelete }) => {
  const [title, setTitle] = useState(service.title);
  const [category, setCategory] = useState(service.category);
  const [description, setDescription] = useState(service.description);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121216] p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm font-semibold text-zinc-100"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-300"
        />
      </div>
      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-300"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onSave({ ...service, title, category, description })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#09090B] text-xs font-bold"
        >
          <Save className="w-3.5 h-3.5" />
          Salvar
        </button>
        <button
          type="button"
          onClick={() => onDelete(service.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remover
        </button>
      </div>
    </div>
  );
};

const PlanEditorRow: React.FC<{
  plan: PricingPlan;
  onSave: (plan: PricingPlan) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}> = ({ plan, onSave, onDelete }) => {
  const [title, setTitle] = useState(plan.title);
  const [priceText, setPriceText] = useState(plan.price_text);
  const [billingNote, setBillingNote] = useState(plan.billing_note);
  const [subtitle, setSubtitle] = useState(plan.subtitle);
  const [highlighted, setHighlighted] = useState(plan.highlighted === 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121216] p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm font-semibold text-zinc-100"
        />
        <input
          type="text"
          value={priceText}
          onChange={(e) => setPriceText(e.target.value)}
          placeholder="Valor (ex: R$ 120,00)"
          className="rounded-lg border border-[#D4AF37]/40 bg-[#09090B] px-3 py-2 text-sm font-bold text-[#D4AF37]"
        />
      </div>
      <input
        type="text"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-300"
      />
      <input
        type="text"
        value={billingNote}
        onChange={(e) => setBillingNote(e.target.value)}
        placeholder="Observação do valor"
        className="w-full rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-xs text-zinc-400"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={highlighted}
            onChange={(e) => setHighlighted(e.target.checked)}
          />
          Destacar plano
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onSave({
                ...plan,
                title,
                price_text: priceText,
                billing_note: billingNote,
                subtitle,
                highlighted: highlighted ? 1 : 0,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#09090B] text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5" />
            Atualizar Preço
          </button>
          <button
            type="button"
            onClick={() => onDelete(plan.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remover
          </button>
        </div>
      </div>
    </div>
  );
};
