#!/bin/bash

# Script de configuração completa do WhatsApp Server na VPS Hostinger
# Execute: bash setup-whatsapp-vps.sh

set -e

echo "🚀 Configurando WhatsApp Server na VPS..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Atualizar sistema
print_info "Atualizando sistema Ubuntu..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependências essenciais
print_info "Instalando dependências..."
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release

# 3. Instalar Node.js 18+
print_info "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js instalado: $node_version"
print_status "NPM instalado: $npm_version"

# 4. Instalar PM2 globalmente
print_info "Instalando PM2..."
sudo npm install -g pm2

# 5. Instalar dependências para Chrome/Chromium (necessário para whatsapp-web.js)
print_info "Instalando dependências do Chrome..."
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Instalar Chromium
sudo apt install -y chromium-browser

# 6. Criar estrutura do projeto
print_info "Criando estrutura do projeto..."
mkdir -p /var/www/whatsapp-server
cd /var/www/whatsapp-server

# 7. Criar package.json
print_info "Configurando package.json..."
cat > package.json << 'EOF'
{
  "name": "whatsapp-server",
  "version": "1.0.0",
  "description": "WhatsApp Web.js Server for Plushify",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "whatsapp-web.js": "^1.31.0",
    "qrcode": "^1.5.3",
    "@supabase/supabase-js": "^2.49.4",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF

# 8. Instalar dependências npm
print_info "Instalando dependências npm..."
npm install

# 9. Criar arquivo server.js (o mesmo do docs)
print_info "Criando server.js..."
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.SUPABASE_JWT_SECRET;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Armazenamento em memória
const sessions = new Map();
const messagesByUser = new Map();
const contactsByUser = new Map();

// Autenticação
async function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return null;
      return user;
    } else if (jwtSecret) {
      const decoded = jwt.verify(token, jwtSecret);
      return { id: decoded.sub };
    }
  } catch (error) {
    console.error('Auth error:', error);
  }
  
  return null;
}

// Garantir que stores existam para o usuário
function ensureStore(userId) {
  if (!messagesByUser.has(userId)) {
    messagesByUser.set(userId, []);
  }
  if (!contactsByUser.has(userId)) {
    contactsByUser.set(userId, []);
  }
}

// Persistir contato no Supabase (opcional)
async function persistContact(userId, phone, name) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('whatsapp_contatos')
      .upsert({
        user_id: userId,
        telefone: phone,
        nome: name,
        atualizado_em: new Date().toISOString()
      });
    
    if (error) console.error('Error persisting contact:', error);
  } catch (error) {
    console.error('Error persisting contact:', error);
  }
}

// Persistir mensagem no Supabase (opcional)
async function persistMessage(userId, contato_id, direcao, conteudo) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('whatsapp_mensagens')
      .insert({
        user_id: userId,
        contato_id,
        direcao,
        conteudo,
        enviado_em: new Date().toISOString()
      });
    
    if (error) console.error('Error persisting message:', error);
  } catch (error) {
    console.error('Error persisting message:', error);
  }
}

// Configurar cliente WhatsApp
function bootstrapClient(userId) {
  if (sessions.has(userId)) {
    return sessions.get(userId);
  }

  ensureStore(userId);
  
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    }
  });

  const session = {
    client,
    status: 'desconectado',
    qrCode: null,
    sessionId: userId
  };

  // Event handlers
  client.on('qr', async (qr) => {
    console.log(`QR Code gerado para usuário ${userId}`);
    try {
      session.qrCode = await QRCode.toDataURL(qr);
      session.status = 'pareando';
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
    }
  });

  client.on('ready', async () => {
    console.log(`Cliente WhatsApp conectado para usuário ${userId}`);
    session.status = 'conectado';
    session.qrCode = null;
    
    // Buscar contatos
    try {
      const contacts = await client.getContacts();
      const userContacts = contacts
        .filter(contact => contact.name && contact.number)
        .map(contact => ({
          id: contact.id._serialized,
          phone: contact.number,
          name: contact.name,
          isGroup: contact.isGroup
        }));
      
      contactsByUser.set(userId, userContacts);
      
      // Persistir contatos
      for (const contact of userContacts) {
        await persistContact(userId, contact.phone, contact.name);
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    }
  });

  client.on('disconnected', (reason) => {
    console.log(`Cliente WhatsApp desconectado para usuário ${userId}:`, reason);
    session.status = 'desconectado';
    session.qrCode = null;
    sessions.delete(userId);
  });

  client.on('message', async (message) => {
    if (!message.from.includes('@g.us')) { // Ignorar grupos
      const messageData = {
        id: message.id._serialized,
        from: message.from,
        body: message.body,
        timestamp: message.timestamp,
        direction: 'received'
      };
      
      messagesByUser.get(userId).push(messageData);
      await persistMessage(userId, message.from, 'recebida', message.body);
    }
  });

  sessions.set(userId, session);
  return session;
}

// Rotas
app.get('/', async (req, res) => {
  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const session = sessions.get(user.id) || { status: 'desconectado', qrCode: null, sessionId: user.id };
  
  res.json({
    status: session.status,
    sessionId: session.sessionId,
    qrCode: session.qrCode,
    timestamp: new Date().toISOString()
  });
});

app.post('/', async (req, res) => {
  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { action, phone, message, contactName } = req.body;

  try {
    switch (action) {
      case 'connect':
        const session = bootstrapClient(user.id);
        session.client.initialize();
        res.json({ success: true, message: 'Conectando...' });
        break;

      case 'disconnect':
        const existingSession = sessions.get(user.id);
        if (existingSession) {
          await existingSession.client.logout();
        }
        res.json({ success: true, message: 'Desconectado' });
        break;

      case 'send-message':
        const activeSession = sessions.get(user.id);
        if (!activeSession || activeSession.status !== 'conectado') {
          return res.status(400).json({ error: 'WhatsApp não conectado' });
        }

        const formattedPhone = phone.replace(/\D/g, '') + '@c.us';
        await activeSession.client.sendMessage(formattedPhone, message);
        
        const sentMessage = {
          id: Date.now().toString(),
          to: formattedPhone,
          body: message,
          timestamp: Date.now(),
          direction: 'sent'
        };
        
        messagesByUser.get(user.id).push(sentMessage);
        await persistMessage(user.id, formattedPhone, 'enviada', message);
        
        res.json({ success: true, message: 'Mensagem enviada' });
        break;

      default:
        res.status(400).json({ error: 'Ação inválida' });
    }
  } catch (error) {
    console.error('Erro na ação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/messages', async (req, res) => {
  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { contactId, limit = 50 } = req.query;
  ensureStore(user.id);
  
  let messages = messagesByUser.get(user.id) || [];
  
  if (contactId) {
    messages = messages.filter(msg => 
      msg.from === contactId || msg.to === contactId
    );
  }
  
  messages = messages.slice(-parseInt(limit));
  res.json({ messages });
});

app.get('/contacts', async (req, res) => {
  const user = await authenticate(req);
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  ensureStore(user.id);
  const contacts = contactsByUser.get(user.id) || [];
  res.json({ contacts });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Server rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
});
EOF

# 10. Criar arquivo .env
print_info "Configurando variáveis de ambiente..."
cat > .env << 'EOF'
PORT=8787
SUPABASE_URL=https://wmoylybbwikkqbxiqwbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
NODE_ENV=production
EOF

print_warning "IMPORTANTE: Você precisa editar o arquivo .env com suas chaves do Supabase!"
print_info "Execute: nano .env"

# 11. Configurar PM2
print_info "Configurando PM2..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'whatsapp-server',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8787
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Criar pasta de logs
mkdir -p logs

# 12. Configurar firewall
print_info "Configurando firewall..."
sudo ufw allow 8787/tcp
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 13. Configurar Nginx (para proxy reverso)
print_info "Instalando e configurando Nginx..."
sudo apt install -y nginx

# Criar configuração do Nginx
sudo tee /etc/nginx/sites-available/whatsapp-server << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/whatsapp-server /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 14. Configurar permissões
print_info "Configurando permissões..."
sudo chown -R $USER:$USER /var/www/whatsapp-server
chmod +x /var/www/whatsapp-server/server.js

# 15. Salvar configuração PM2
print_info "Salvando configuração PM2..."
pm2 startup
pm2 save

print_status "✅ Configuração completa!"
echo ""
print_info "PRÓXIMOS PASSOS:"
echo "1. Configure suas chaves no arquivo .env:"
echo "   nano /var/www/whatsapp-server/.env"
echo ""
echo "2. Inicie o servidor:"
echo "   cd /var/www/whatsapp-server"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "3. Teste o servidor:"
echo "   curl http://31.97.30.241"
echo ""
echo "4. Configure no Plushify:"
echo "   WHATSAPP_SERVER_URL=http://31.97.30.241"
echo ""
print_warning "Lembre-se de configurar as variáveis SUPABASE_SERVICE_ROLE_KEY e SUPABASE_JWT_SECRET!"