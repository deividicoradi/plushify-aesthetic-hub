# Configuração do WhatsApp Server no VPS (Produção)

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ ou CentOS 7+
- Domínio: plushify.com.br
- Acesso SSH ao servidor
- Node.js 18+ instalado

## 🚀 Passo 1: Configuração do Servidor

### 1.1 Conectar ao VPS via SSH
```bash
ssh root@SEU_IP_VPS
# ou
ssh usuario@SEU_IP_VPS
```

### 1.2 Instalar Node.js (se não estiver instalado)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 1.3 Instalar PM2 (Gerenciador de Processos)
```bash
sudo npm install -g pm2
```

### 1.4 Instalar Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

## 🌐 Passo 2: Configuração do Domínio

### 2.1 Configurar DNS (no painel do seu provedor de domínio)
```
Tipo: A
Nome: whatsapp
Valor: SEU_IP_VPS
TTL: 300
```

Resultado: `whatsapp.plushify.com.br` apontará para seu VPS.

## 📂 Passo 3: Setup da Aplicação WhatsApp

### 3.1 Criar diretório do projeto
```bash
mkdir -p /var/www/whatsapp-server
cd /var/www/whatsapp-server
```

### 3.2 Criar package.json
```bash
cat > package.json << 'EOF'
{
  "name": "plushify-whatsapp-server",
  "version": "1.0.0",
  "description": "WhatsApp Web API Server for Plushify",
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
```

### 3.3 Copiar o código do servidor
```bash
# Copie o conteúdo do arquivo docs/whatsapp-server/server.js
nano server.js
```

### 3.4 Instalar dependências
```bash
npm install
```

### 3.5 Configurar variáveis de ambiente
```bash
cat > .env << 'EOF'
# Porta do servidor WhatsApp
PORT=8787

# Configurações do Supabase
SUPABASE_URL=https://wmoylybbwikkqbxiqwbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
SUPABASE_JWT_SECRET=SUA_JWT_SECRET_AQUI

# Configurações de produção
NODE_ENV=production
EOF
```

**⚠️ IMPORTANTE: Substitua as variáveis:**
- `SUPABASE_SERVICE_ROLE_KEY`: Pegar no Supabase > Settings > API
- `SUPABASE_JWT_SECRET`: Pegar no Supabase > Settings > API

## 🔒 Passo 4: Configuração SSL (HTTPS)

### 4.1 Instalar Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

### 4.2 Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/whatsapp.plushify.com.br
```

Conteúdo do arquivo:
```nginx
server {
    listen 80;
    server_name whatsapp.plushify.com.br;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

### 4.3 Ativar o site
```bash
sudo ln -s /etc/nginx/sites-available/whatsapp.plushify.com.br /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 Obter certificado SSL
```bash
sudo certbot --nginx -d whatsapp.plushify.com.br
```

## 🚀 Passo 5: Executar a Aplicação

### 5.1 Configurar PM2
```bash
cd /var/www/whatsapp-server

# Criar arquivo de configuração do PM2
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

# Criar diretório de logs
mkdir logs

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5.2 Verificar se está funcionando
```bash
# Verificar status
pm2 status

# Verificar logs
pm2 logs whatsapp-server

# Testar endpoint
curl -I https://whatsapp.plushify.com.br
```

## 📱 Passo 6: Configurar no App Plushify

1. **Acessar o app Plushify**
2. **Ir em WhatsApp > Configurações**
3. **Configurar URL do servidor:**
   ```
   https://whatsapp.plushify.com.br
   ```
4. **Salvar e testar conexão**

## 🔧 Comandos Úteis de Manutenção

```bash
# Verificar status do serviço
pm2 status

# Reiniciar serviço
pm2 restart whatsapp-server

# Ver logs em tempo real
pm2 logs whatsapp-server --lines 100

# Monitorar recursos
pm2 monit

# Backup dos dados de autenticação do WhatsApp
tar -czf backup-whatsapp-$(date +%Y%m%d).tar.gz .wwebjs_auth/

# Restaurar backup
tar -xzf backup-whatsapp-YYYYMMDD.tar.gz
```

## 🛡️ Segurança Adicional

### 6.1 Firewall
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 6.2 Fail2ban (Proteção contra ataques)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📊 Monitoramento

### 7.1 Logs importantes
```bash
# Logs do WhatsApp Server
tail -f /var/www/whatsapp-server/logs/combined.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do sistema
journalctl -f -u nginx
```

### 7.2 Verificação de saúde
```bash
# Script de health check
cat > health-check.sh << 'EOF'
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://whatsapp.plushify.com.br)
if [ $RESPONSE -eq 200 ] || [ $RESPONSE -eq 401 ]; then
    echo "✅ WhatsApp Server está funcionando"
else
    echo "❌ WhatsApp Server com problema - HTTP $RESPONSE"
    pm2 restart whatsapp-server
fi
EOF

chmod +x health-check.sh

# Adicionar ao crontab para verificar a cada 5 minutos
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/whatsapp-server/health-check.sh >> /var/log/whatsapp-health.log 2>&1") | crontab -
```

## ✅ Checklist Final

- [ ] DNS configurado (whatsapp.plushify.com.br)
- [ ] SSL/HTTPS funcionando
- [ ] Servidor Node.js rodando na porta 8787
- [ ] PM2 configurado para auto-restart
- [ ] Nginx proxy configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Firewall configurado
- [ ] Logs sendo gerados
- [ ] App Plushify configurado com nova URL
- [ ] Teste de conexão WhatsApp funcionando

## 🆘 Troubleshooting

### Problemas comuns:

1. **"Cannot connect to WhatsApp"**
   - Verificar se o servidor está rodando: `pm2 status`
   - Verificar logs: `pm2 logs whatsapp-server`

2. **SSL/HTTPS não funciona**
   - Verificar certificado: `sudo certbot certificates`
   - Renovar se necessário: `sudo certbot renew`

3. **502 Bad Gateway**
   - Verificar se a aplicação está rodando na porta 8787
   - Verificar configuração do Nginx

4. **QR Code não aparece**
   - Verificar logs do WhatsApp Web.js
   - Reiniciar o serviço: `pm2 restart whatsapp-server`

## 📞 Próximos Passos

Após a configuração, você poderá:
1. Conectar seu WhatsApp Business real
2. Enviar e receber mensagens através do app
3. Integrar com os clientes do sistema
4. Automatizar respostas (futuro desenvolvimento)