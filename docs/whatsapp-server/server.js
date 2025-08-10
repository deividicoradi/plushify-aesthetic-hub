/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET; // opcional

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Estado em memória simples (recomenda-se persistir em banco ou cache externo)
const sessions = new Map(); // userId -> { client, status, qrCode, sessionId }
const messagesByUser = new Map(); // userId -> []
const contactsByUser = new Map(); // userId -> []

async function authenticate(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) throw new Error('Missing token');

  // Tentar verificar via Supabase Admin
  if (supabase) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) throw new Error('Invalid token');
    return data.user.id;
  }

  // Alternativa local (se SUPABASE_JWT_SECRET definido)
  if (SUPABASE_JWT_SECRET) {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    return decoded.sub;
  }

  throw new Error('No verification configured');
}

function ensureStore(userId) {
  if (!messagesByUser.has(userId)) messagesByUser.set(userId, []);
  if (!contactsByUser.has(userId)) contactsByUser.set(userId, []);
}

async function persistContact(userId, phone, name) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('whatsapp_contatos')
    .upsert({
      user_id: userId,
      telefone: phone,
      nome: name || phone,
      ultima_interacao: new Date().toISOString(),
    }, { onConflict: 'user_id,telefone' })
    .select('*')
    .single();
  if (error) console.error('Persist contact error:', error);
  return data;
}

async function persistMessage(userId, contato_id, direcao, conteudo) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('whatsapp_mensagens')
    .insert({
      user_id: userId,
      contato_id,
      direcao,
      conteudo,
      tipo: 'texto',
      status: direcao === 'enviada' ? 'enviada' : 'recebida',
      horario: new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) console.error('Persist message error:', error);
  return data;
}

async function bootstrapClient(userId) {
  let record = sessions.get(userId);
  if (record?.client) return record;

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: `user-${userId}` }),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
  });

  record = { client, status: 'desconectado', sessionId: `sess-${userId}`, qrCode: null };
  sessions.set(userId, record);

  client.on('qr', async (qr) => {
    const qrDataUrl = await qrcode.toDataURL(qr);
    record.qrCode = qrDataUrl;
    record.status = 'pareando';
    console.log(`[${userId}] QR code atualizado`);
  });

  client.on('ready', () => {
    record.status = 'conectado';
    record.qrCode = null;
    console.log(`[${userId}] WhatsApp pronto`);
  });

  client.on('disconnected', (reason) => {
    record.status = 'desconectado';
    record.qrCode = null;
    console.log(`[${userId}] Desconectado:`, reason);
  });

  client.on('message', async (msg) => {
    try {
      ensureStore(userId);
      const phone = msg.from.replace('@c.us', '');
      const name = msg._data?.notifyName || phone;
      const contact = await persistContact(userId, phone, name);
      const contato_id = contact?.id || phone; // fallback
      messagesByUser.get(userId).push({
        id: msg.id._serialized,
        contato_id,
        direcao: 'recebida',
        conteudo: msg.body,
        tipo: 'texto',
        status: 'recebida',
        horario: new Date().toISOString(),
        whatsapp_contatos: contact || { id: contato_id, nome: name, telefone: phone },
      });
      await persistMessage(userId, contato_id, 'recebida', msg.body);
    } catch (e) {
      console.error('on message error', e);
    }
  });

  await client.initialize();
  return record;
}

app.get('/', async (req, res) => {
  try {
    const userId = await authenticate(req);
    const rec = sessions.get(userId) || { status: 'desconectado', sessionId: null };
    res.json({ success: true, status: rec.status, sessionId: rec.sessionId, qrCode: rec.qrCode || null });
  } catch (e) {
    res.status(401).json({ success: false, error: e.message });
  }
});

app.post('/', async (req, res) => {
  try {
    const userId = await authenticate(req);
    const { action, phone, message, contactName } = req.body || {};

    if (action === 'connect') {
      const rec = await bootstrapClient(userId);
      res.json({ success: true, message: 'Sessão iniciada', status: rec.status, sessionId: rec.sessionId, qrCode: rec.qrCode });
      return;
    }

    if (action === 'disconnect') {
      const rec = sessions.get(userId);
      if (rec?.client) await rec.client.logout();
      sessions.set(userId, { status: 'desconectado', client: null, sessionId: `sess-${userId}`, qrCode: null });
      res.json({ success: true });
      return;
    }

    if (action === 'send-message') {
      if (!phone || !message) throw new Error('phone e message são obrigatórios');
      const rec = await bootstrapClient(userId);
      await rec.client.sendMessage(`${phone.replace(/\D/g, '')}@c.us`, message);

      ensureStore(userId);
      const contact = await persistContact(userId, phone, contactName || phone);
      const contato_id = contact?.id || phone;
      const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      messagesByUser.get(userId).push({
        id: msgId,
        contato_id,
        direcao: 'enviada',
        conteudo: message,
        tipo: 'texto',
        status: 'enviada',
        horario: new Date().toISOString(),
        whatsapp_contatos: contact || { id: contato_id, nome: contactName || phone, telefone: phone },
      });
      await persistMessage(userId, contato_id, 'enviada', message);

      res.json({ success: true, messageId: msgId });
      return;
    }

    res.status(400).json({ success: false, error: 'Ação inválida' });
  } catch (e) {
    console.error('POST / error', e);
    res.status(400).json({ success: false, error: e.message });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const userId = await authenticate(req);
    ensureStore(userId);
    const { contactId, limit = 50 } = req.query;
    let msgs = messagesByUser.get(userId);
    if (contactId) msgs = msgs.filter((m) => m.contato_id === contactId);
    msgs = msgs.slice(-Number(limit));
    res.json({ success: true, messages: msgs });
  } catch (e) {
    res.status(401).json({ success: false, error: e.message });
  }
});

app.get('/contacts', async (req, res) => {
  try {
    const userId = await authenticate(req);
    ensureStore(userId);
    res.json({ success: true, contacts: contactsByUser.get(userId) });
  } catch (e) {
    res.status(401).json({ success: false, error: e.message });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`WhatsApp service listening on :${port}`));
