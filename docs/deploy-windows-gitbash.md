# Deploy WhatsApp Server - Guia Windows Git Bash

## Passo a Passo Completo

### 1. Abrir Git Bash
- Clique com botão direito em qualquer pasta
- Selecione "Git Bash Here" ou abra Git Bash e navegue para seu projeto

### 2. Navegar para o projeto Plushify
```bash
cd /c/Users/SeuUsuario/Desktop/plushify-project
# ou onde estiver seu projeto
```

### 3. Criar arquivo server.js
```bash
mkdir -p docs/whatsapp-server
cat > docs/whatsapp-server/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8787;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.SUPABASE_JWT_SECRET;

let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Middleware
app.use(cors());
app.use(express.json());

// Estados em memória
const sessions = new Map();
const messagesByUser = new Map();
const contactsByUser = new Map();

// Autenticação
async function authenticate(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Token não fornecido');
    }

    const token = authHeader.substring(7);
    
    if (supabase) {
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) throw new Error('Token inválido');
        return data.user.id;
    }
    
    if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded.sub || decoded.user_id;
    }
    
    throw new Error('Configuração de autenticação ausente');
}

// Funções auxiliares
function ensureStore(userId) {
    if (!messagesByUser.has(userId)) messagesByUser.set(userId, []);
    if (!contactsByUser.has(userId)) contactsByUser.set(userId, []);
}

async function persistContact(userId, phone, name) {
    if (!supabase) return;
    
    try {
        await supabase
            .from('whatsapp_contacts')
            .upsert({
                user_id: userId,
                phone: phone,
                name: name || phone,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,phone' });
    } catch (error) {
        console.error('Erro ao persistir contato:', error);
    }
}

async function persistMessage(userId, contato_id, direcao, conteudo) {
    if (!supabase) return;
    
    try {
        await supabase
            .from('whatsapp_messages')
            .insert({
                user_id: userId,
                contato_id: contato_id,
                direcao: direcao,
                conteudo: conteudo,
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Erro ao persistir mensagem:', error);
    }
}

// Inicializar cliente WhatsApp
async function bootstrapClient(userId) {
    if (sessions.has(userId)) {
        const session = sessions.get(userId);
        if (session.status === 'conectado') return session;
    }

    ensureStore(userId);

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: userId }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    const session = {
        client: client,
        status: 'pareando',
        qrCode: null,
        sessionId: `session_${userId}_${Date.now()}`
    };

    sessions.set(userId, session);

    client.on('qr', async (qr) => {
        try {
            const qrCodeDataURL = await qrcode.toDataURL(qr);
            session.qrCode = qrCodeDataURL;
            session.status = 'pareando';
            console.log(`QR Code gerado para usuário ${userId}`);
        } catch (error) {
            console.error('Erro ao gerar QR code:', error);
        }
    });

    client.on('ready', () => {
        session.status = 'conectado';
        session.qrCode = null;
        console.log(`WhatsApp conectado para usuário ${userId}!`);
    });

    client.on('disconnected', (reason) => {
        session.status = 'desconectado';
        session.qrCode = null;
        console.log(`WhatsApp desconectado para usuário ${userId}:`, reason);
    });

    client.on('message', async (message) => {
        try {
            const contact = await message.getContact();
            const contactName = contact.pushname || contact.name || contact.number;
            
            // Persistir contato
            await persistContact(userId, contact.number, contactName);
            
            // Armazenar mensagem localmente
            const messageData = {
                id: message.id._serialized,
                from: contact.number,
                fromName: contactName,
                body: message.body,
                timestamp: message.timestamp,
                direction: 'recebida'
            };
            
            messagesByUser.get(userId).push(messageData);
            
            // Persistir mensagem
            await persistMessage(userId, contact.number, 'recebida', message.body);
            
            console.log(`Mensagem recebida de ${contactName}: ${message.body}`);
        } catch (error) {
            console.error('Erro ao processar mensagem recebida:', error);
        }
    });

    client.initialize();
    return session;
}

// Rotas da API
app.get('/', async (req, res) => {
    try {
        const userId = await authenticate(req);
        const session = sessions.get(userId);
        
        if (!session) {
            return res.json({
                status: 'desconectado',
                sessionId: null,
                qrCode: null
            });
        }

        res.json({
            status: session.status,
            sessionId: session.sessionId,
            qrCode: session.qrCode
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

app.post('/', async (req, res) => {
    try {
        const userId = await authenticate(req);
        const { action, phone, message, contactName } = req.body;

        switch (action) {
            case 'connect':
                const session = await bootstrapClient(userId);
                res.json({
                    success: true,
                    status: session.status,
                    sessionId: session.sessionId,
                    qrCode: session.qrCode
                });
                break;

            case 'disconnect':
                const currentSession = sessions.get(userId);
                if (currentSession && currentSession.client) {
                    await currentSession.client.logout();
                    sessions.delete(userId);
                }
                res.json({ success: true, status: 'desconectado' });
                break;

            case 'send-message':
                const activeSession = sessions.get(userId);
                if (!activeSession || activeSession.status !== 'conectado') {
                    return res.status(400).json({ error: 'WhatsApp não conectado' });
                }

                try {
                    const chatId = `${phone}@c.us`;
                    await activeSession.client.sendMessage(chatId, message);
                    
                    // Persistir contato se fornecido
                    if (contactName) {
                        await persistContact(userId, phone, contactName);
                    }
                    
                    // Armazenar mensagem enviada
                    const sentMessage = {
                        id: `sent_${Date.now()}`,
                        to: phone,
                        toName: contactName || phone,
                        body: message,
                        timestamp: Date.now(),
                        direction: 'enviada'
                    };
                    
                    messagesByUser.get(userId).push(sentMessage);
                    
                    // Persistir mensagem
                    await persistMessage(userId, phone, 'enviada', message);
                    
                    res.json({ success: true, message: 'Mensagem enviada' });
                } catch (error) {
                    res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
                }
                break;

            default:
                res.status(400).json({ error: 'Ação inválida' });
        }
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

app.get('/messages', async (req, res) => {
    try {
        const userId = await authenticate(req);
        const { contactId, limit = 50 } = req.query;
        
        ensureStore(userId);
        let messages = messagesByUser.get(userId) || [];
        
        if (contactId) {
            messages = messages.filter(msg => 
                msg.from === contactId || msg.to === contactId
            );
        }
        
        messages = messages
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, parseInt(limit));
        
        res.json({ messages });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

app.get('/contacts', async (req, res) => {
    try {
        const userId = await authenticate(req);
        
        if (supabase) {
            const { data, error } = await supabase
                .from('whatsapp_contacts')
                .select('*')
                .eq('user_id', userId)
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            res.json({ contacts: data || [] });
        } else {
            ensureStore(userId);
            res.json({ contacts: contactsByUser.get(userId) || [] });
        }
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor WhatsApp rodando na porta ${PORT}`);
});
EOF
```

### 4. Tornar o script executável
```bash
chmod +x scripts/deploy-whatsapp.sh
```

### 5. Executar o deploy
```bash
./scripts/deploy-whatsapp.sh 31.97.30.241 root
```

### 6. Acompanhar o processo
O script irá:
- ✅ Conectar no VPS
- ✅ Instalar Node.js, PM2, Nginx
- ✅ Configurar SSL
- ✅ Fazer deploy da aplicação

### 7. Configurar variáveis de ambiente (após deploy)
```bash
# Conectar no VPS
ssh root@31.97.30.241

# Editar arquivo .env
nano /var/www/whatsapp-server/.env
```

### 8. Adicionar suas chaves do Supabase:
```env
PORT=8787
SUPABASE_URL=https://wmoylybbwikkqbxiqwbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
SUPABASE_JWT_SECRET=SUA_JWT_SECRET_AQUI
NODE_ENV=production
```

### 9. Reiniciar aplicação
```bash
pm2 restart whatsapp-server
pm2 logs whatsapp-server
```

### 10. Configurar no app Plushify
No app, ir em WhatsApp > Configurações e definir:
**URL do Servidor:** `https://whatsapp.plushify.com.br`

## Comandos úteis para monitoramento:
```bash
# Status da aplicação
pm2 status

# Ver logs
pm2 logs whatsapp-server

# Reiniciar se necessário
pm2 restart whatsapp-server

# Verificar se está funcionando
curl https://whatsapp.plushify.com.br
```

## Próximos passos:
1. ✅ Deploy realizado
2. ⚠️ Configurar chaves do Supabase
3. ⚠️ Testar conexão WhatsApp
4. ⚠️ Enviar primeira mensagem