import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { ensureDemoAudioFiles } from './server/audioSeed.ts';
import {
  createDemoTrack,
  createPhoto,
  createPlan,
  createPortfolioItem,
  createQuoteRequest,
  createService,
  createTestimonial,
  deleteDemoTrack,
  deletePhoto,
  deletePlan,
  deletePortfolioItem,
  deleteQuoteRequest,
  deleteService,
  deleteTestimonial,
  getAdminPasswordHash,
  getStudioData,
  incrementDemoPlay,
  initDatabase,
  listQuoteRequests,
  updateAdminPasswordHash,
  updatePlan,
  updateQuoteStatus,
  updateService,
  updateSettings,
  verifyPasswordHash,
} from './server/db.ts';

dotenv.config();

const PORT = 3000;
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const AUDIO_UPLOAD_DIR = path.join(UPLOADS_DIR, 'audio');
const IMAGE_UPLOAD_DIR = path.join(UPLOADS_DIR, 'images');

fs.mkdirSync(AUDIO_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });

ensureDemoAudioFiles(UPLOADS_DIR);
initDatabase();

const SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() ||
  crypto.createHash('sha256').update(`javoz-${process.cwd()}-studio-key`).digest('hex');

interface TokenPayload {
  role: 'admin';
  exp: number;
}

function signAdminToken(): string {
  const payload: TokenPayload = {
    role: 'admin',
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as TokenPayload;
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({ error: 'Sessão administrativa inválida ou expirada.' });
    return;
  }
  next();
}

const audioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AUDIO_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp3';
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    cb(null, `${base || 'audio'}-${Date.now()}${ext}`);
  },
});

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGE_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    cb(null, `${base || 'foto'}-${Date.now()}${ext}`);
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de áudio inválido. Envie MP3, WAV, OGG ou M4A.'));
    }
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagem inválido. Envie JPG, PNG ou WEBP.'));
    }
  },
});

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Serve uploaded audio and studio photos with range requests enabled
  app.use('/uploads', express.static(UPLOADS_DIR, { acceptRanges: true }));
  app.use(
    '/assets/aistudio',
    express.static(path.resolve(process.cwd(), 'public/assets/aistudio'), { acceptRanges: true })
  );

  // Public Studio Data
  app.get('/api/studio', (_req, res) => {
    res.json(getStudioData());
  });

  // Track audio playback counter
  app.post('/api/demos/:id/play', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }
    incrementDemoPlay(id);
    res.json({ ok: true });
  });

  // Public Quote / Contact Submission
  app.post('/api/quotes', (req, res) => {
    const { name, phone, email, service_name, plan_name, message } = req.body ?? {};
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Informe seu nome completo.' });
      return;
    }
    if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length < 8) {
      res.status(400).json({ error: 'Informe um WhatsApp ou telefone válido.' });
      return;
    }
    if (!message || typeof message !== 'string' || message.trim().length < 4) {
      res.status(400).json({ error: 'Descreva brevemente o que você precisa gravar ou produzir.' });
      return;
    }

    const created = createQuoteRequest({
      name: name.trim(),
      phone: phone.trim(),
      email: typeof email === 'string' ? email.trim() : '',
      service_name: typeof service_name === 'string' ? service_name.trim() : '',
      plan_name: typeof plan_name === 'string' ? plan_name.trim() : '',
      message: message.trim(),
    });
    res.status(201).json(created);
  });

  // Admin Login & Session
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body ?? {};
    if (typeof password !== 'string' || password.length === 0) {
      res.status(400).json({ error: 'Digite a senha de acesso.' });
      return;
    }
    const storedHash = getAdminPasswordHash();
    if (!verifyPasswordHash(password, storedHash)) {
      res.status(401).json({ error: 'Senha incorreta.' });
      return;
    }
    res.json({ token: signAdminToken() });
  });

  app.get('/api/admin/session', requireAdmin, (_req, res) => {
    res.json({ authenticated: true });
  });

  app.post('/api/admin/change-password', requireAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    const storedHash = getAdminPasswordHash();
    if (!verifyPasswordHash(currentPassword, storedHash)) {
      res.status(401).json({ error: 'Senha atual incorreta.' });
      return;
    }
    updateAdminPasswordHash(newPassword);
    res.json({ ok: true });
  });

  // Admin: Settings (texts, contact info, hero/about)
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const updated = updateSettings(req.body ?? {});
    res.json(updated);
  });

  // Admin: Services CRUD
  app.post('/api/admin/services', requireAdmin, (req, res) => {
    const { title, description, category, image_url } = req.body ?? {};
    if (!title || !description) {
      res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
      return;
    }
    const created = createService({
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category || 'Áudio').trim(),
      image_url: String(image_url || '').trim(),
    });
    res.status(201).json(created);
  });

  app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
    const updated = updateService(Number(req.params.id), req.body ?? {});
    if (!updated) {
      res.status(404).json({ error: 'Serviço não encontrado.' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
    const ok = deleteService(Number(req.params.id));
    res.json({ ok });
  });

  // Admin: Pricing Plans CRUD
  app.post('/api/admin/plans', requireAdmin, (req, res) => {
    const { title, subtitle, price_text, billing_note, features, highlighted } = req.body ?? {};
    if (!title || !price_text) {
      res.status(400).json({ error: 'Nome do plano e valor são obrigatórios.' });
      return;
    }
    const created = createPlan({
      title: String(title).trim(),
      subtitle: String(subtitle || '').trim(),
      price_text: String(price_text).trim(),
      billing_note: String(billing_note || '').trim(),
      features: Array.isArray(features) ? features.map(String) : [],
      highlighted: highlighted ? 1 : 0,
    });
    res.status(201).json(created);
  });

  app.put('/api/admin/plans/:id', requireAdmin, (req, res) => {
    const updated = updatePlan(Number(req.params.id), req.body ?? {});
    if (!updated) {
      res.status(404).json({ error: 'Plano não encontrado.' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/admin/plans/:id', requireAdmin, (req, res) => {
    res.json({ ok: deletePlan(Number(req.params.id)) });
  });

  // Admin: Portfolio CRUD
  app.post('/api/admin/portfolio', requireAdmin, (req, res) => {
    const { title, category, description, client_name, duration, audio_url, image_url, media_type } = req.body ?? {};
    if (!title || !category) {
      res.status(400).json({ error: 'Título e categoria são obrigatórios.' });
      return;
    }
    const created = createPortfolioItem({
      title: String(title).trim(),
      category: String(category).trim(),
      description: String(description || '').trim(),
      client_name: String(client_name || '').trim(),
      duration: String(duration || (media_type === 'art' ? 'Arte HD' : '00:15')).trim(),
      audio_url: String(audio_url || '').trim(),
      image_url: String(image_url || '').trim(),
      media_type: media_type === 'art' ? 'art' : 'audio',
    });
    res.status(201).json(created);
  });

  app.delete('/api/admin/portfolio/:id', requireAdmin, (req, res) => {
    res.json({ ok: deletePortfolioItem(Number(req.params.id)) });
  });

  // Admin: Demo Tracks CRUD
  app.post('/api/admin/demos', requireAdmin, (req, res) => {
    const { title, category, description, duration, audio_url, cover_url } = req.body ?? {};
    if (!title || !audio_url) {
      res.status(400).json({ error: 'Título e arquivo de áudio são obrigatórios.' });
      return;
    }
    const created = createDemoTrack({
      title: String(title).trim(),
      category: String(category || 'Demonstração').trim(),
      description: String(description || '').trim(),
      duration: String(duration || '00:15').trim(),
      audio_url: String(audio_url).trim(),
      cover_url: String(cover_url || '').trim(),
    });
    res.status(201).json(created);
  });

  app.delete('/api/admin/demos/:id', requireAdmin, (req, res) => {
    res.json({ ok: deleteDemoTrack(Number(req.params.id)) });
  });

  // Admin: Testimonials CRUD
  app.post('/api/admin/testimonials', requireAdmin, (req, res) => {
    const { client_name, client_role, company, quote, rating } = req.body ?? {};
    if (!client_name || !quote) {
      res.status(400).json({ error: 'Nome do cliente e depoimento são obrigatórios.' });
      return;
    }
    const created = createTestimonial({
      client_name: String(client_name).trim(),
      client_role: String(client_role || 'Cliente').trim(),
      company: String(company || '').trim(),
      quote: String(quote).trim(),
      rating: Number(rating) || 5,
    });
    res.status(201).json(created);
  });

  app.delete('/api/admin/testimonials/:id', requireAdmin, (req, res) => {
    res.json({ ok: deleteTestimonial(Number(req.params.id)) });
  });

  // Admin: Studio Photos CRUD
  app.post('/api/admin/photos', requireAdmin, (req, res) => {
    const { title, caption, image_url, category } = req.body ?? {};
    if (!title || !image_url) {
      res.status(400).json({ error: 'Título e imagem são obrigatórios.' });
      return;
    }
    const created = createPhoto({
      title: String(title).trim(),
      caption: String(caption || '').trim(),
      image_url: String(image_url).trim(),
      category: String(category || 'Estúdio').trim(),
    });
    res.status(201).json(created);
  });

  app.delete('/api/admin/photos/:id', requireAdmin, (req, res) => {
    res.json({ ok: deletePhoto(Number(req.params.id)) });
  });

  // Admin: Quote Requests management
  app.get('/api/admin/quotes', requireAdmin, (_req, res) => {
    res.json(listQuoteRequests());
  });

  app.patch('/api/admin/quotes/:id', requireAdmin, (req, res) => {
    const { status } = req.body ?? {};
    if (!status) {
      res.status(400).json({ error: 'Status inválido.' });
      return;
    }
    const updated = updateQuoteStatus(Number(req.params.id), String(status));
    if (!updated) {
      res.status(404).json({ error: 'Solicitação não encontrada.' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/admin/quotes/:id', requireAdmin, (req, res) => {
    res.json({ ok: deleteQuoteRequest(Number(req.params.id)) });
  });

  // Admin: Real File Uploads
  app.post('/api/admin/upload-audio', requireAdmin, uploadAudio.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo de áudio enviado.' });
      return;
    }
    res.status(201).json({ url: `/uploads/audio/${req.file.filename}`, filename: req.file.originalname });
  });

  app.post('/api/admin/upload-image', requireAdmin, uploadImage.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      return;
    }
    res.status(201).json({ url: `/uploads/images/${req.file.filename}`, filename: req.file.originalname });
  });

  // Error handler for Multer / API
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(400).json({ error: err.message || 'Erro interno no servidor.' });
  });

  // Frontend serving (Vite dev middleware vs production dist/)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`J.A VOZ Studio server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
