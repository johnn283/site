import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import type {
  DemoTrack,
  PortfolioItem,
  PricingPlan,
  QuoteRequest,
  ServiceItem,
  SiteSettings,
  StudioDataPayload,
  StudioPhoto,
  Testimonial,
} from '../src/types/studio.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'javoz.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return `${usedSalt}:${derived}`;
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Áudio',
      image_url TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS pricing_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      price_text TEXT NOT NULL,
      billing_note TEXT NOT NULL,
      features_json TEXT NOT NULL,
      highlighted INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS portfolio_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      client_name TEXT NOT NULL DEFAULT '',
      duration TEXT NOT NULL DEFAULT '00:15',
      audio_url TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      media_type TEXT NOT NULL DEFAULT 'audio',
      featured INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS demo_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL DEFAULT '00:10',
      audio_url TEXT NOT NULL,
      cover_url TEXT NOT NULL DEFAULT '',
      plays_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      client_role TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      quote TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS studio_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Estúdio',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS quote_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      service_name TEXT NOT NULL DEFAULT '',
      plan_name TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Novo',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData(): void {
  const defaultPassword = process.env.ADMIN_PASSWORD?.trim() || 'javoz2026';

  const defaultSettings: Record<string, string> = {
    brand_name: 'J.A VOZ – ESTÚDIO DE GRAVAÇÕES',
    slogan: 'SUA VOZ EM OUTRO NÍVEL!',
    hero_title: 'SUA VOZ MERECE QUALIDADE PROFISSIONAL!',
    hero_subtitle:
      'Produção sonora de alto impacto, masterização cristalina e direção artística para DJs, paredões, emissoras, carros de som, lojas e grandes eventos.',
    hero_image: '/src/assets/images/hero_audio_studio_1794957729170.jpg',
    about_title: 'Precisão acústica, identidade sonora e potência em cada gravação',
    about_story:
      'O J.A VOZ – Estúdio de Gravações nasceu em São Luís Gonzaga do Maranhão com o propósito de elevar o padrão da publicidade sonora e das produções musicais da região para o nível das maiores produtoras do país. Equipado com microfones condensadores de diafragma largo, pré-amplificadores de estúdio e acústica tratada, cada projeto recebe atenção cirúrgica na captação, edição, efeitos e masterização.',
    about_mission:
      'Entregar gravações com impacto imediato, clareza vocal superior e agilidade na entrega, fazendo com que a marca do cliente ou o som do DJ se destaque onde quer que toque.',
    about_commitment:
      'Compromisso absoluto com prazos, atendimento direto pelo WhatsApp e rigor técnico em cada faixa finalizada em alta definição.',
    about_image: '/src/assets/images/studio_mixing_console_1794957730562.jpg',
    whatsapp_number: '5599984147758',
    whatsapp_display: '(99) 98414-7758',
    instagram_handle: '@estududio.gravacao',
    instagram_url: 'https://instagram.com/estududio.gravacao',
    email: 'contato@javozestudio.com.br',
    location: 'São Luís Gonzaga do Maranhão – MA',
    business_hours: 'Segunda a Sábado: 08h00 às 19h00',
    admin_password_hash: hashPassword(defaultPassword),
  };

  const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)');
  const txSettings = db.transaction(() => {
    for (const [key, value] of Object.entries(defaultSettings)) {
      insertSetting.run(key, value);
    }
    db.prepare("UPDATE site_settings SET value = '5599984147758' WHERE key = 'whatsapp_number' AND value = '5599981263139'").run();
    db.prepare("UPDATE site_settings SET value = '(99) 98414-7758' WHERE key = 'whatsapp_display' AND value = '(99) 98126-3139'").run();
    db.prepare("UPDATE site_settings SET value = '@estududio.gravacao' WHERE key = 'instagram_handle' AND value = '@javozestudio'").run();
    db.prepare("UPDATE site_settings SET value = 'https://instagram.com/estududio.gravacao' WHERE key = 'instagram_url' AND value = 'https://instagram.com/javozestudio'").run();
  });
  txSettings();

  const serviceCount = (db.prepare('SELECT COUNT(*) AS count FROM services').get() as { count: number }).count;
  if (serviceCount === 0) {
    const insertService = db.prepare(
      'INSERT INTO services (title, slug, description, category, image_url, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, 1)'
    );
    const seedServices = [
      [
        'Vinhetas para DJs',
        'vinhetas-para-djs',
        'Vinhetas personalizadas para DJs, paredões e equipes de som com efeitos de estúdio, impacto grave e identidade marcante.',
        'Áudio & Efeitos',
        '/src/assets/images/studio_condenser_mic_1794957729574.jpg',
        1,
      ],
      [
        'Spots Comerciais',
        'spots-comerciais',
        'Gravações profissionais para divulgação de lojas, empresas e promoções com trilha licenciada e locução persuasiva.',
        'Publicidade',
        '/src/assets/images/studio_mixing_console_1794957730562.jpg',
        2,
      ],
      [
        'Locuções para Carro de Som',
        'locucoes-carro-de-som',
        'Locuções comerciais projetadas para máxima inteligibilidade e potência em carros de som e divulgação urbana.',
        'Publicidade Móvel',
        '/src/assets/images/hero_audio_studio_1794957729170.jpg',
        3,
      ],
      [
        'Chamadas para Eventos',
        'chamadas-para-eventos',
        'Chamadas profissionais para festas, shows, vaquejadas e eventos com energia de palco e sound design cinematográfico.',
        'Eventos',
        '/src/assets/images/event_flyer_art_sample_1794957730126.jpg',
        4,
      ],
      [
        'Aberturas Personalizadas',
        'aberturas-personalizadas',
        'Aberturas épicas para paredões, carros de som e apresentações ao vivo com drops de sub-grave e masterização de alta pressão.',
        'Produção Especial',
        '/src/assets/images/studio_dj_headphones_1794957730422.jpg',
        5,
      ],
      [
        'Atualização de Pendrives',
        'atualizacao-de-pendrives',
        'Atualização de repertórios musicais, nivelamento de volume e organização profissional de pastas e arquivos de áudio.',
        'Repertório',
        '/src/assets/images/studio_dj_headphones_1794957730422.jpg',
        6,
      ],
      [
        'Artes para Eventos',
        'artes-para-eventos',
        'Criação de flyers, capas para redes sociais e materiais visuais de divulgação alinhados com a identidade do seu evento.',
        'Design Visual',
        '/src/assets/images/event_flyer_art_sample_1794957730126.jpg',
        7,
      ],
    ] as const;

    for (const s of seedServices) {
      insertService.run(...s);
    }
  }

  const planCount = (db.prepare('SELECT COUNT(*) AS count FROM pricing_plans').get() as { count: number }).count;
  if (planCount === 0) {
    const insertPlan = db.prepare(
      'INSERT INTO pricing_plans (title, subtitle, price_text, billing_note, features_json, highlighted, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
    );
    const seedPlans = [
      [
        'Pacote Spot Comercial',
        'Ideal para lojas, mercados, farmácias e campanhas promocionais',
        'Sob consulta',
        'Valor configurado pelo estúdio conforme duração',
        JSON.stringify([
          'Roteiro revisado e locução profissional',
          'Trilha sonora e efeitos de transição',
          'Masterização para rádio, WhatsApp e carro de som',
          'Entrega rápida em MP3 320kbps e WAV',
        ]),
        0,
        1,
      ],
      [
        'Pacote DJ & Paredão',
        'Vinhetas e aberturas exclusivas com pressão sonora de palco',
        'Sob consulta',
        'Condições promocionais configuráveis no painel',
        JSON.stringify([
          'Abertura personalizada ou combo de vinhetas',
          'Efeitos especiais, risers e sub-grave calibrado',
          'Versões limpas (dry) e produzidas (wet)',
          'Identidade sonora exclusiva para sua equipe',
        ]),
        1,
        2,
      ],
      [
        'Combo Evento Completo',
        'Chamada em áudio + arte visual profissional para divulgação',
        'Sob consulta',
        'Orçamento personalizado por porte do evento',
        JSON.stringify([
          'Chamada oficial para shows, festas e vaquejadas',
          'Flyer profissional para feed e stories',
          'Adaptação para carros de som e rádios locais',
          'Suporte direto com o estúdio durante a campanha',
        ]),
        0,
        3,
      ],
    ] as const;

    for (const p of seedPlans) {
      insertPlan.run(...p);
    }
  }

  const demoCount = (db.prepare('SELECT COUNT(*) AS count FROM demo_tracks').get() as { count: number }).count;
  if (demoCount === 0) {
    const insertDemo = db.prepare(
      'INSERT INTO demo_tracks (title, category, description, duration, audio_url, cover_url, plays_count) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const seedDemos = [
      [
        'Vinheta DJ – Impacto Noturno',
        'Vinhetas',
        'Produção com voz grave, efeitos de transição estéreo e batida calibrada para entrada de set e paredões.',
        '00:08',
        '/uploads/demos/vinheta-dj-impacto.wav',
        '/src/assets/images/studio_condenser_mic_1794957729574.jpg',
        142,
      ],
      [
        'Spot Comercial – Super Ofertas',
        'Spots Comerciais',
        'Locução comercial dinâmica com cama musical moderna para divulgação em rádio, redes sociais e carro de som.',
        '00:10',
        '/uploads/demos/spot-comercial-varejo.wav',
        '/src/assets/images/studio_mixing_console_1794957730562.jpg',
        98,
      ],
      [
        'Chamada Oficial – Grande Vaquejada',
        'Chamadas de Eventos',
        'Chamada de alto impacto para festas e vaquejadas com fanfarra épica e presença vocal em primeiro plano.',
        '00:09',
        '/uploads/demos/chamada-vaquejada-fest.wav',
        '/src/assets/images/event_flyer_art_sample_1794957730126.jpg',
        116,
      ],
      [
        'Spot Comercial – Elétrica (Materiais Elétricos e Automotivos)',
        'Spots Comerciais',
        'Spot publicitário gravado pelo estúdio J.A VOZ para a Elétrica, destacando materiais elétricos residenciais e acessórios automotivos com locução dinâmica e trilha musical.',
        '02:37',
        '/assets/aistudio/el_tricar_577a9584.mp3',
        '/src/assets/images/hero_audio_studio_1794957729170.jpg',
        0,
      ],
      [
        'Spot Comercial – Frango na Brasa (Frango Assado)',
        'Spots Comerciais',
        'Spot comercial produzido pelo estúdio J.A VOZ para o Frango na Brasa, com locução publicitária envolvente e trilha animada para carro de som e redes sociais.',
        '03:49',
        '/assets/aistudio/frango_assado_580589e3.mp3',
        '/src/assets/images/studio_mixing_console_1794957730562.jpg',
        0,
      ],
    ] as const;

    for (const d of seedDemos) {
      insertDemo.run(...d);
    }
  }

  const eletricaAudioUrl = '/assets/aistudio/el_tricar_577a9584.mp3';
  const hasEletrica = db
    .prepare('SELECT id FROM demo_tracks WHERE audio_url = ?')
    .get(eletricaAudioUrl) as { id: number } | undefined;
  if (!hasEletrica) {
    const legacyEletricaSlot = db
      .prepare('SELECT id FROM demo_tracks WHERE audio_url = ?')
      .get('/uploads/demos/locucao-carro-som.wav') as { id: number } | undefined;
    if (legacyEletricaSlot) {
      db.prepare(
        'UPDATE demo_tracks SET title = ?, category = ?, description = ?, duration = ?, audio_url = ?, cover_url = ?, plays_count = 0 WHERE id = ?'
      ).run(
        'Spot Comercial – Elétrica (Materiais Elétricos e Automotivos)',
        'Spots Comerciais',
        'Spot publicitário gravado pelo estúdio J.A VOZ para a Elétrica, destacando materiais elétricos residenciais e acessórios automotivos com locução dinâmica e trilha musical.',
        '02:37',
        eletricaAudioUrl,
        '/src/assets/images/hero_audio_studio_1794957729170.jpg',
        legacyEletricaSlot.id
      );
    } else {
      db.prepare(
        'INSERT INTO demo_tracks (title, category, description, duration, audio_url, cover_url, plays_count) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        'Spot Comercial – Elétrica (Materiais Elétricos e Automotivos)',
        'Spots Comerciais',
        'Spot publicitário gravado pelo estúdio J.A VOZ para a Elétrica, destacando materiais elétricos residenciais e acessórios automotivos com locução dinâmica e trilha musical.',
        '02:37',
        eletricaAudioUrl,
        '/src/assets/images/hero_audio_studio_1794957729170.jpg',
        0
      );
    }
  }

  const frangoAudioUrl = '/assets/aistudio/frango_assado_580589e3.mp3';
  const hasFrango = db
    .prepare('SELECT id FROM demo_tracks WHERE audio_url = ?')
    .get(frangoAudioUrl) as { id: number } | undefined;
  if (!hasFrango) {
    const legacySlot = db
      .prepare('SELECT id FROM demo_tracks WHERE audio_url = ?')
      .get('/uploads/demos/abertura-paredao-grave.wav') as { id: number } | undefined;
    if (legacySlot) {
      db.prepare(
        'UPDATE demo_tracks SET title = ?, category = ?, description = ?, duration = ?, audio_url = ?, cover_url = ?, plays_count = 0 WHERE id = ?'
      ).run(
        'Spot Comercial – Frango na Brasa (Frango Assado)',
        'Spots Comerciais',
        'Spot comercial produzido pelo estúdio J.A VOZ para o Frango na Brasa, com locução publicitária envolvente e trilha animada para carro de som e redes sociais.',
        '03:49',
        frangoAudioUrl,
        '/src/assets/images/studio_mixing_console_1794957730562.jpg',
        legacySlot.id
      );
    } else {
      db.prepare(
        'INSERT INTO demo_tracks (title, category, description, duration, audio_url, cover_url, plays_count) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(
        'Spot Comercial – Frango na Brasa (Frango Assado)',
        'Spots Comerciais',
        'Spot comercial produzido pelo estúdio J.A VOZ para o Frango na Brasa, com locução publicitária envolvente e trilha animada para carro de som e redes sociais.',
        '03:49',
        frangoAudioUrl,
        '/src/assets/images/studio_mixing_console_1794957730562.jpg',
        0
      );
    }
  }

  const cavalgadaAudioUrl = '/assets/aistudio/demostra__o_cavolgada_da_amizade_89e27f96.mp3';
  const hasCavalgada = db
    .prepare('SELECT id FROM demo_tracks WHERE audio_url = ?')
    .get(cavalgadaAudioUrl) as { id: number } | undefined;
  if (!hasCavalgada) {
    db.prepare(
      'INSERT INTO demo_tracks (title, category, description, duration, audio_url, cover_url, plays_count) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      '12ª Cavalgada da Amizade – São Luís Gonzaga e Região',
      'Chamadas de Eventos',
      'Chamada oficial gravada e produzida pelo estúdio J.A VOZ para a 12ª Cavalgada da Amizade (20 de Dezembro), com atrações musicais e encontro de paredões em São Luís Gonzaga – MA.',
      '02:14',
      cavalgadaAudioUrl,
      '/src/assets/images/event_flyer_art_sample_1794957730126.jpg',
      0
    );
  }

  const portfolioCount = (db.prepare('SELECT COUNT(*) AS count FROM portfolio_items').get() as { count: number }).count;
  if (portfolioCount === 0) {
    const insertPortfolio = db.prepare(
      'INSERT INTO portfolio_items (title, category, description, client_name, duration, audio_url, image_url, media_type, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)'
    );
    const seedPortfolio = [
      [
        'Vinheta Oficial Equipe Som Automotivo',
        'Vinhetas',
        'Vinheta personalizada com cortes rítmicos e graves profundos para apresentações em eventos automotivos.',
        'Equipe Impacto Som',
        '00:08',
        '/uploads/demos/vinheta-dj-impacto.wav',
        '/src/assets/images/studio_condenser_mic_1794957729574.jpg',
        'audio',
      ],
      [
        'Spot Campanha Aniversário de Loja',
        'Spots Comerciais',
        'Peça publicitária completa com trilha vibrante e locução varejista de alta conversão.',
        'Magazine Central SLG',
        '00:10',
        '/uploads/demos/spot-comercial-varejo.wav',
        '/src/assets/images/studio_mixing_console_1794957730562.jpg',
        'audio',
      ],
      [
        'Chamada Festival & Vaquejada Regional',
        'Chamadas de Eventos',
        'Chamada oficial veiculada em rádios, carros de som e redes sociais com alcance regional.',
        'Parque Serra Dourada',
        '00:09',
        '/uploads/demos/chamada-vaquejada-fest.wav',
        '/src/assets/images/event_flyer_art_sample_1794957730126.jpg',
        'audio',
      ],
      [
        'Locução Promocional Para Carro de Som',
        'Locuções',
        'Gravação externa otimizada para alto-falantes e sistemas móveis com máxima nitidez de fala.',
        'Supermercado Boa Compra',
        '00:08',
        '/uploads/demos/locucao-carro-som.wav',
        '/src/assets/images/hero_audio_studio_1794957729170.jpg',
        'audio',
      ],
      [
        'Identidade Visual – Noite Ouro Festival',
        'Artes Produzidas',
        'Direção de arte para flyer principal de show com iluminação dourada e diagramação para feed e stories.',
        'Arena Gonzaga Eventos',
        'Arte HD',
        '',
        '/src/assets/images/event_flyer_art_sample_1794957730126.jpg',
        'art',
      ],
      [
        'Abertura Paredão Potência Máxima',
        'Vinhetas',
        'Abertura completa de 10 segundos com síntese de sub-grave e efeitos cinematográficos.',
        'Paredão Elite MA',
        '00:10',
        '/uploads/demos/abertura-paredao-grave.wav',
        '/src/assets/images/studio_dj_headphones_1794957730422.jpg',
        'audio',
      ],
    ] as const;

    for (const p of seedPortfolio) {
      insertPortfolio.run(...p);
    }
  }

  const testimonialCount = (db.prepare('SELECT COUNT(*) AS count FROM testimonials').get() as { count: number }).count;
  if (testimonialCount === 0) {
    const insertTestimonial = db.prepare(
      'INSERT INTO testimonials (client_name, client_role, company, quote, rating, active) VALUES (?, ?, ?, ?, ?, 1)'
    );
    const seedTestimonials = [
      [
        'DJ Marcos Vinícius',
        'DJ & Produtor de Paredão',
        'Equipe Batida Forte',
        'Depois que gravamos nossa abertura e pacote de vinhetas no J.A VOZ, a qualidade do nosso som mudou completamente. Grave limpo, voz forte e entrega no mesmo dia.',
        5,
      ],
      [
        'Renata Almeida',
        'Gerente Comercial',
        'Casa dos Móveis Gonzaga',
        'Os spots comerciais aumentaram o movimento na nossa semana de promoções. O áudio chama atenção na rua e nas redes sociais com clareza profissional.',
        5,
      ],
      [
        'Carlos Eduardo Silva',
        'Organizador de Eventos',
        'Arena Vaquejada MA',
        'Fechamos a chamada em áudio junto com a arte oficial do evento. Atendimento ágil pelo WhatsApp e resultado impecável do início ao fim.',
        5,
      ],
    ] as const;

    for (const t of seedTestimonials) {
      insertTestimonial.run(...t);
    }
  }

  const photoCount = (db.prepare('SELECT COUNT(*) AS count FROM studio_photos').get() as { count: number }).count;
  if (photoCount === 0) {
    const insertPhoto = db.prepare(
      'INSERT INTO studio_photos (title, caption, image_url, category) VALUES (?, ?, ?, ?)'
    );
    const seedPhotos = [
      [
        'Cabine Acústica & Captação Vocal',
        'Microfone condensador de grande diafragma em ambiente acusticamente tratado.',
        '/src/assets/images/hero_audio_studio_1794957729170.jpg',
        'Cabine',
      ],
      [
        'Mesa de Mixagem e Masterização',
        'Processamento analógico e digital para pressão sonora de estúdio.',
        '/src/assets/images/studio_mixing_console_1794957730562.jpg',
        'Equipamentos',
      ],
      [
        'Microfone Condensador Série Ouro',
        'Captação de alta sensibilidade para locuções comerciais e vinhetas.',
        '/src/assets/images/studio_condenser_mic_1794957729574.jpg',
        'Microfones',
      ],
      [
        'Monitoramento de Referência',
        'Fones e interfaces profissionais para controle preciso de graves e agudos.',
        '/src/assets/images/studio_dj_headphones_1794957730422.jpg',
        'Monitoração',
      ],
    ] as const;

    for (const ph of seedPhotos) {
      insertPhoto.run(...ph);
    }
  }
}

export function getAdminPasswordHash(): string {
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get('admin_password_hash') as
    | { value: string }
    | undefined;
  return row?.value ?? '';
}

export function updateAdminPasswordHash(newPassword: string): void {
  const hashed = hashPassword(newPassword);
  db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run('admin_password_hash', hashed);
}

export function getPublicSettings(): SiteSettings {
  const rows = db.prepare("SELECT key, value FROM site_settings WHERE key != 'admin_password_hash'").all() as Array<{
    key: string;
    value: string;
  }>;
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }
  return map as unknown as SiteSettings;
}

export function updateSettings(partial: Partial<SiteSettings>): SiteSettings {
  const allowedKeys: Array<keyof SiteSettings> = [
    'brand_name',
    'slogan',
    'hero_title',
    'hero_subtitle',
    'hero_image',
    'about_title',
    'about_story',
    'about_mission',
    'about_commitment',
    'about_image',
    'whatsapp_number',
    'whatsapp_display',
    'instagram_handle',
    'instagram_url',
    'email',
    'location',
    'business_hours',
  ];
  const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
  const tx = db.transaction(() => {
    for (const key of allowedKeys) {
      if (typeof partial[key] === 'string') {
        stmt.run(key, partial[key]);
      }
    }
  });
  tx();
  return getPublicSettings();
}

export function getStudioData(): StudioDataPayload {
  const settings = getPublicSettings();
  const services = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY sort_order ASC, id ASC').all() as ServiceItem[];
  const rawPlans = db.prepare('SELECT * FROM pricing_plans WHERE active = 1 ORDER BY sort_order ASC, id ASC').all() as Array<
    Omit<PricingPlan, 'features'> & { features_json: string }
  >;
  const plans: PricingPlan[] = rawPlans.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle,
    price_text: p.price_text,
    billing_note: p.billing_note,
    features: safeParseFeatures(p.features_json),
    highlighted: p.highlighted,
    active: p.active,
    sort_order: p.sort_order,
  }));
  const portfolio = db.prepare('SELECT * FROM portfolio_items ORDER BY featured DESC, id DESC').all() as PortfolioItem[];
  const demos = db.prepare('SELECT * FROM demo_tracks ORDER BY id DESC').all() as DemoTrack[];
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE active = 1 ORDER BY id DESC').all() as Testimonial[];
  const photos = db.prepare('SELECT * FROM studio_photos ORDER BY id DESC').all() as StudioPhoto[];

  return { settings, services, plans, portfolio, demos, testimonials, photos };
}

function safeParseFeatures(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function createService(data: Omit<ServiceItem, 'id' | 'slug' | 'sort_order' | 'active'>): ServiceItem {
  const slug = data.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM services').get() as { m: number }).m;
  const info = db
    .prepare(
      'INSERT INTO services (title, slug, description, category, image_url, sort_order, active) VALUES (?, ?, ?, ?, ?, ?, 1)'
    )
    .run(data.title, slug, data.description, data.category || 'Áudio', data.image_url || '', maxOrder + 1);
  return db.prepare('SELECT * FROM services WHERE id = ?').get(info.lastInsertRowid) as ServiceItem;
}

export function updateService(id: number, data: Partial<ServiceItem>): ServiceItem | null {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(id) as ServiceItem | undefined;
  if (!existing) return null;
  db.prepare('UPDATE services SET title = ?, description = ?, category = ?, image_url = ?, active = ? WHERE id = ?').run(
    data.title ?? existing.title,
    data.description ?? existing.description,
    data.category ?? existing.category,
    data.image_url ?? existing.image_url,
    data.active ?? existing.active,
    id
  );
  return db.prepare('SELECT * FROM services WHERE id = ?').get(id) as ServiceItem;
}

export function deleteService(id: number): boolean {
  const info = db.prepare('DELETE FROM services WHERE id = ?').run(id);
  return info.changes > 0;
}

export function createPlan(data: Omit<PricingPlan, 'id' | 'active' | 'sort_order'>): PricingPlan {
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), 0) AS m FROM pricing_plans').get() as { m: number }).m;
  const info = db
    .prepare(
      'INSERT INTO pricing_plans (title, subtitle, price_text, billing_note, features_json, highlighted, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)'
    )
    .run(
      data.title,
      data.subtitle,
      data.price_text,
      data.billing_note,
      JSON.stringify(data.features || []),
      data.highlighted ? 1 : 0,
      maxOrder + 1
    );
  const row = db.prepare('SELECT * FROM pricing_plans WHERE id = ?').get(info.lastInsertRowid) as Omit<
    PricingPlan,
    'features'
  > & { features_json: string };
  return { ...row, features: safeParseFeatures(row.features_json) };
}

export function updatePlan(id: number, data: Partial<PricingPlan>): PricingPlan | null {
  const existing = db.prepare('SELECT * FROM pricing_plans WHERE id = ?').get(id) as
    | (Omit<PricingPlan, 'features'> & { features_json: string })
    | undefined;
  if (!existing) return null;
  db.prepare(
    'UPDATE pricing_plans SET title = ?, subtitle = ?, price_text = ?, billing_note = ?, features_json = ?, highlighted = ? WHERE id = ?'
  ).run(
    data.title ?? existing.title,
    data.subtitle ?? existing.subtitle,
    data.price_text ?? existing.price_text,
    data.billing_note ?? existing.billing_note,
    data.features ? JSON.stringify(data.features) : existing.features_json,
    data.highlighted !== undefined ? (data.highlighted ? 1 : 0) : existing.highlighted,
    id
  );
  const row = db.prepare('SELECT * FROM pricing_plans WHERE id = ?').get(id) as Omit<PricingPlan, 'features'> & {
    features_json: string;
  };
  return { ...row, features: safeParseFeatures(row.features_json) };
}

export function deletePlan(id: number): boolean {
  const info = db.prepare('DELETE FROM pricing_plans WHERE id = ?').run(id);
  return info.changes > 0;
}

export function createPortfolioItem(
  data: Omit<PortfolioItem, 'id' | 'created_at' | 'featured'> & { featured?: number }
): PortfolioItem {
  const info = db
    .prepare(
      'INSERT INTO portfolio_items (title, category, description, client_name, duration, audio_url, image_url, media_type, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      data.title,
      data.category,
      data.description,
      data.client_name || '',
      data.duration || (data.media_type === 'art' ? 'Arte HD' : '00:15'),
      data.audio_url || '',
      data.image_url || '',
      data.media_type || 'audio',
      data.featured ?? 1
    );
  return db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(info.lastInsertRowid) as PortfolioItem;
}

export function deletePortfolioItem(id: number): boolean {
  return db.prepare('DELETE FROM portfolio_items WHERE id = ?').run(id).changes > 0;
}

export function createDemoTrack(data: Omit<DemoTrack, 'id' | 'plays_count' | 'created_at'>): DemoTrack {
  const info = db
    .prepare(
      'INSERT INTO demo_tracks (title, category, description, duration, audio_url, cover_url, plays_count) VALUES (?, ?, ?, ?, ?, ?, 0)'
    )
    .run(
      data.title,
      data.category,
      data.description,
      data.duration || '00:15',
      data.audio_url,
      data.cover_url || '/src/assets/images/studio_condenser_mic_1794957729574.jpg'
    );
  return db.prepare('SELECT * FROM demo_tracks WHERE id = ?').get(info.lastInsertRowid) as DemoTrack;
}

export function incrementDemoPlay(id: number): void {
  db.prepare('UPDATE demo_tracks SET plays_count = plays_count + 1 WHERE id = ?').run(id);
}

export function deleteDemoTrack(id: number): boolean {
  return db.prepare('DELETE FROM demo_tracks WHERE id = ?').run(id).changes > 0;
}

export function createTestimonial(data: Omit<Testimonial, 'id' | 'active' | 'created_at'>): Testimonial {
  const info = db
    .prepare('INSERT INTO testimonials (client_name, client_role, company, quote, rating, active) VALUES (?, ?, ?, ?, ?, 1)')
    .run(data.client_name, data.client_role, data.company || '', data.quote, data.rating || 5);
  return db.prepare('SELECT * FROM testimonials WHERE id = ?').get(info.lastInsertRowid) as Testimonial;
}

export function deleteTestimonial(id: number): boolean {
  return db.prepare('DELETE FROM testimonials WHERE id = ?').run(id).changes > 0;
}

export function createPhoto(data: Omit<StudioPhoto, 'id' | 'created_at'>): StudioPhoto {
  const info = db
    .prepare('INSERT INTO studio_photos (title, caption, image_url, category) VALUES (?, ?, ?, ?)')
    .run(data.title, data.caption || '', data.image_url, data.category || 'Estúdio');
  return db.prepare('SELECT * FROM studio_photos WHERE id = ?').get(info.lastInsertRowid) as StudioPhoto;
}

export function deletePhoto(id: number): boolean {
  return db.prepare('DELETE FROM studio_photos WHERE id = ?').run(id).changes > 0;
}

export function createQuoteRequest(
  data: Omit<QuoteRequest, 'id' | 'status' | 'created_at'>
): QuoteRequest {
  const info = db
    .prepare(
      'INSERT INTO quote_requests (name, phone, email, service_name, plan_name, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .run(
      data.name,
      data.phone,
      data.email || '',
      data.service_name || '',
      data.plan_name || '',
      data.message,
      'Novo'
    );
  return db.prepare('SELECT * FROM quote_requests WHERE id = ?').get(info.lastInsertRowid) as QuoteRequest;
}

export function listQuoteRequests(): QuoteRequest[] {
  return db.prepare('SELECT * FROM quote_requests ORDER BY id DESC').all() as QuoteRequest[];
}

export function updateQuoteStatus(id: number, status: string): QuoteRequest | null {
  const info = db.prepare('UPDATE quote_requests SET status = ? WHERE id = ?').run(status, id);
  if (info.changes === 0) return null;
  return db.prepare('SELECT * FROM quote_requests WHERE id = ?').get(id) as QuoteRequest;
}

export function deleteQuoteRequest(id: number): boolean {
  return db.prepare('DELETE FROM quote_requests WHERE id = ?').run(id).changes > 0;
}
