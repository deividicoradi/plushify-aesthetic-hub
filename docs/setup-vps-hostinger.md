# 🚀 Configuração WhatsApp na VPS Hostinger

## 📋 Informações do Seu Servidor

- **IP**: 31.97.30.241
- **OS**: Ubuntu 24.04
- **Painel**: Hostinger
- **Chatwoot**: Já instalado

## ⚡ Instalação Rápida

### 1. No terminal SSH (que você já tem aberto):

```bash
# Baixar script de configuração
wget https://raw.githubusercontent.com/seu-repo/plushify/main/scripts/setup-whatsapp-vps.sh

# Dar permissão de execução
chmod +x setup-whatsapp-vps.sh

# Executar instalação
./setup-whatsapp-vps.sh
```

### 2. Configurar variáveis Supabase:

```bash
# Editar arquivo de configuração
nano /var/www/whatsapp-server/.env
```

Adicione suas chaves:
```env
PORT=8787
SUPABASE_URL=https://wmoylybbwikkqbxiqwbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_JWT_SECRET=sua_jwt_secret_aqui
NODE_ENV=production
```

### 3. Iniciar servidor:

```bash
cd /var/www/whatsapp-server
pm2 start ecosystem.config.js
pm2 save
```

### 4. Testar funcionamento:

```bash
# Testar se está rodando
curl http://localhost:8787

# Verificar status
pm2 status
pm2 logs whatsapp-server
```

## 🔧 Configurar no Plushify

Vá na edge function `whatsapp-manager` e altere:

```typescript
const WHATSAPP_SERVER_URL = 'http://31.97.30.241';
```

## 📱 Como usar

1. **Acesse WhatsApp no Plushify**
2. **Clique em "Conectar"**
3. **Escaneie o QR Code**
4. **Aguarde conexão**

## 🔍 Comandos úteis

```bash
# Ver logs em tempo real
pm2 logs whatsapp-server --lines 100

# Reiniciar servidor
pm2 restart whatsapp-server

# Ver status do servidor
pm2 status

# Verificar se porta está aberta
sudo netstat -tlnp | grep 8787

# Ver processos rodando
ps aux | grep node
```

## 🔒 Configuração SSL (Opcional)

Se quiser HTTPS:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado (substitua pelo seu domínio)
sudo certbot --nginx -d seudominio.com
```

## 🚨 Troubleshooting

### Erro: Chrome não encontrado
```bash
sudo apt install -y chromium-browser
```

### Erro: Permissões
```bash
sudo chown -R $USER:$USER /var/www/whatsapp-server
```

### Erro: Porta ocupada
```bash
sudo lsof -ti:8787 | xargs kill -9
```

### Logs de erro
```bash
pm2 logs whatsapp-server --err --lines 50
```