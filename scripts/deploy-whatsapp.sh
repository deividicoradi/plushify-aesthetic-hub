#!/bin/bash

# Deploy Script para WhatsApp Server - Plushify
# Uso: ./deploy-whatsapp.sh [IP_DO_VPS] [USUARIO]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
VPS_IP="${1:-SEU_IP_AQUI}"
VPS_USER="${2:-root}"
DOMAIN="whatsapp.plushify.com.br"
APP_DIR="/var/www/whatsapp-server"

echo -e "${BLUE}🚀 Iniciando deploy do WhatsApp Server para produção${NC}"
echo -e "${YELLOW}📡 VPS: ${VPS_IP}${NC}"
echo -e "${YELLOW}👤 Usuário: ${VPS_USER}${NC}"
echo -e "${YELLOW}🌐 Domínio: ${DOMAIN}${NC}"

# Verificar se o IP foi fornecido
if [ "$VPS_IP" = "SEU_IP_AQUI" ]; then
    echo -e "${RED}❌ Por favor, forneça o IP do VPS como primeiro parâmetro${NC}"
    echo -e "${YELLOW}Uso: ./deploy-whatsapp.sh IP_DO_VPS [USUARIO]${NC}"
    exit 1
fi

# Função para executar comandos no VPS
run_remote() {
    ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "$1"
}

# Função para copiar arquivos
copy_file() {
    scp -o StrictHostKeyChecking=no "$1" ${VPS_USER}@${VPS_IP}:"$2"
}

echo -e "${BLUE}📋 Verificando conexão com o VPS...${NC}"
if ! run_remote "echo 'Conexão estabelecida'"; then
    echo -e "${RED}❌ Não foi possível conectar ao VPS${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conexão com VPS estabelecida${NC}"

echo -e "${BLUE}🔧 Instalando dependências básicas...${NC}"
run_remote "
    # Atualizar sistema
    apt update && apt upgrade -y
    
    # Instalar Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Instalar PM2 globalmente
    npm install -g pm2
    
    # Instalar Nginx
    apt install -y nginx
    
    # Instalar Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Criar diretório da aplicação
    mkdir -p ${APP_DIR}
    cd ${APP_DIR}
"

echo -e "${GREEN}✅ Dependências instaladas${NC}"

echo -e "${BLUE}📁 Criando estrutura da aplicação...${NC}"

# Criar package.json temporário
cat > /tmp/package.json << 'EOF'
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

# Criar arquivo .env template
cat > /tmp/.env << 'EOF'
# Porta do servidor WhatsApp
PORT=8787

# Configurações do Supabase
SUPABASE_URL=https://wmoylybbwikkqbxiqwbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=COLE_SUA_SERVICE_ROLE_KEY_AQUI
SUPABASE_JWT_SECRET=COLE_SUA_JWT_SECRET_AQUI

# Configurações de produção
NODE_ENV=production
EOF

# Criar ecosystem.config.js
cat > /tmp/ecosystem.config.js << 'EOF'
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

# Criar configuração do Nginx
cat > /tmp/whatsapp.nginx << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
EOF

# Criar health check script
cat > /tmp/health-check.sh << 'EOF'
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://whatsapp.plushify.com.br)
if [ $RESPONSE -eq 200 ] || [ $RESPONSE -eq 401 ]; then
    echo "$(date): ✅ WhatsApp Server está funcionando"
else
    echo "$(date): ❌ WhatsApp Server com problema - HTTP $RESPONSE"
    pm2 restart whatsapp-server
fi
EOF

echo -e "${BLUE}📤 Copiando arquivos para o VPS...${NC}"

# Copiar arquivos
copy_file "/tmp/package.json" "${APP_DIR}/package.json"
copy_file "/tmp/.env" "${APP_DIR}/.env"
copy_file "/tmp/ecosystem.config.js" "${APP_DIR}/ecosystem.config.js"
copy_file "/tmp/health-check.sh" "${APP_DIR}/health-check.sh"
copy_file "docs/whatsapp-server/server.js" "${APP_DIR}/server.js"
copy_file "/tmp/whatsapp.nginx" "/tmp/whatsapp.nginx"

echo -e "${GREEN}✅ Arquivos copiados${NC}"

echo -e "${BLUE}🔧 Configurando aplicação...${NC}"
run_remote "
    cd ${APP_DIR}
    
    # Instalar dependências Node.js
    npm install
    
    # Criar diretório de logs
    mkdir -p logs
    
    # Tornar health-check executável
    chmod +x health-check.sh
    
    # Configurar Nginx
    cp /tmp/whatsapp.nginx /etc/nginx/sites-available/${DOMAIN}
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração Nginx
    nginx -t
    
    # Reiniciar Nginx
    systemctl restart nginx
    systemctl enable nginx
"

echo -e "${GREEN}✅ Aplicação configurada${NC}"

echo -e "${BLUE}🔒 Configurando SSL...${NC}"
run_remote "
    # Obter certificado SSL
    certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@plushify.com.br
"

echo -e "${GREEN}✅ SSL configurado${NC}"

echo -e "${BLUE}🚀 Iniciando aplicação...${NC}"
run_remote "
    cd ${APP_DIR}
    
    # Iniciar com PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup ubuntu -u ${VPS_USER} --hp /home/${VPS_USER}
    
    # Configurar health check no crontab
    (crontab -l 2>/dev/null; echo '*/5 * * * * ${APP_DIR}/health-check.sh >> /var/log/whatsapp-health.log 2>&1') | crontab -
"

echo -e "${GREEN}✅ Aplicação iniciada${NC}"

echo -e "${BLUE}🛡️ Configurando firewall...${NC}"
run_remote "
    # Configurar UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 'Nginx Full'
    ufw --force enable
"

echo -e "${GREEN}✅ Firewall configurado${NC}"

echo -e "${BLUE}🧪 Testando instalação...${NC}"
sleep 5

# Testar se o servidor está respondendo
if curl -f -s "https://${DOMAIN}" > /dev/null; then
    echo -e "${GREEN}✅ Servidor WhatsApp funcionando!${NC}"
else
    echo -e "${YELLOW}⚠️ Servidor pode estar iniciando... Aguarde alguns minutos${NC}"
fi

echo -e "${GREEN}🎉 Deploy concluído!${NC}"
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo -e "${YELLOW}1. Edite o arquivo .env no servidor para adicionar suas chaves do Supabase:${NC}"
echo -e "   ssh ${VPS_USER}@${VPS_IP}"
echo -e "   nano ${APP_DIR}/.env"
echo ""
echo -e "${YELLOW}2. Reinicie a aplicação após editar o .env:${NC}"
echo -e "   pm2 restart whatsapp-server"
echo ""
echo -e "${YELLOW}3. Configure no app Plushify a URL:${NC}"
echo -e "   https://${DOMAIN}"
echo ""
echo -e "${YELLOW}4. Verifique os logs:${NC}"
echo -e "   pm2 logs whatsapp-server"
echo ""
echo -e "${BLUE}🔗 URLs importantes:${NC}"
echo -e "   Servidor: https://${DOMAIN}"
echo -e "   Status: pm2 status"
echo -e "   Logs: pm2 logs whatsapp-server"

# Limpeza
rm -f /tmp/package.json /tmp/.env /tmp/ecosystem.config.js /tmp/whatsapp.nginx /tmp/health-check.sh

echo -e "${GREEN}✨ Deploy finalizado com sucesso!${NC}"