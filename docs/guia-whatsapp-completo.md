# 🚀 Guia Completo - Deploy WhatsApp Server

## ✅ PASSO 1: Preparar o Ambiente Windows

### 1.1 Abrir Git Bash como Administrador
```bash
# Clique com botão direito no Git Bash e selecione "Executar como administrador"
```

### 1.2 Navegar para o projeto
```bash
cd /c/plushify-whatsapp
# ou onde estiver seu projeto
```

### 1.3 Verificar se os arquivos existem
```bash
ls -la scripts/
ls -la docs/whatsapp-server/
```

## ✅ PASSO 2: Preparar Chaves do Supabase

### 2.1 Obter SERVICE_ROLE_KEY
1. Acesse: https://supabase.com/dashboard/project/wmoylybbwikkqbxiqwbq/settings/api
2. Copie a `service_role` key (secreta!)

### 2.2 Obter JWT_SECRET  
1. Acesse: https://supabase.com/dashboard/project/wmoylybbwikkqbxiqwbq/settings/api
2. Copie o `JWT Secret`

### 2.3 Anotar as informações:
```
SUPABASE_URL=https://wmoylybbwikkqbxiqwbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
SUPABASE_JWT_SECRET=SUA_JWT_SECRET_AQUI
```

## ✅ PASSO 3: Executar o Deploy

### 3.1 Tornar o script executável
```bash
chmod +x scripts/deploy-whatsapp.sh
```

### 3.2 Executar o deploy
```bash
./scripts/deploy-whatsapp.sh 31.97.30.241 root
```

### 3.3 Acompanhar o processo
O script irá mostrar:
- 🔗 Conectando no VPS
- 📦 Instalando Node.js, PM2, Nginx
- 🔒 Configurando SSL
- 🚀 Fazendo deploy da aplicação

## ✅ PASSO 4: Configurar Variáveis no VPS

### 4.1 Conectar no VPS via SSH
```bash
ssh root@31.97.30.241
```

### 4.2 Editar o arquivo .env
```bash
nano /var/www/whatsapp-server/.env
```

### 4.3 Configurar as variáveis:
```env
PORT=8787
SUPABASE_URL=https://wmoylybbwikkqbxiqwbq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
SUPABASE_JWT_SECRET=SUA_JWT_SECRET_AQUI
NODE_ENV=production
```

### 4.4 Salvar e sair
```bash
# Pressione Ctrl+X, depois Y, depois Enter
```

## ✅ PASSO 5: Reiniciar e Verificar

### 5.1 Reiniciar a aplicação
```bash
pm2 restart whatsapp-server
```

### 5.2 Verificar logs
```bash
pm2 logs whatsapp-server
```

### 5.3 Verificar status
```bash
pm2 status
```

### 5.4 Testar se está funcionando
```bash
curl https://whatsapp.plushify.com.br
# Deve retornar: {"error":"Missing token"}
```

## ✅ PASSO 6: Configurar no App Plushify

### 6.1 Acessar configurações WhatsApp
1. Abra o app Plushify
2. Vá em **WhatsApp > Configurações**

### 6.2 Definir URL do servidor
```
URL do Servidor: https://whatsapp.plushify.com.br
```

### 6.3 Testar conexão
1. Clique em **Conectar WhatsApp**
2. Deve aparecer o QR Code
3. Escaneie com seu WhatsApp

## ✅ PASSO 7: Testes Finais

### 7.1 Verificar QR Code
- O QR code deve aparecer na tela
- Escanear com WhatsApp Business

### 7.2 Enviar mensagem teste
- Envie uma mensagem para um contato
- Verifique se aparece no app

### 7.3 Receber mensagem teste
- Peça para alguém te enviar uma mensagem
- Verifique se aparece no app

## 🔧 COMANDOS ÚTEIS PARA MONITORAMENTO

### Verificar status do servidor
```bash
ssh root@31.97.30.241
pm2 status
pm2 logs whatsapp-server
```

### Reiniciar se necessário
```bash
pm2 restart whatsapp-server
```

### Verificar se o domínio está funcionando
```bash
curl -I https://whatsapp.plushify.com.br
```

### Ver uso de recursos
```bash
pm2 monit
```

## ❌ PROBLEMAS COMUNS

### Erro de conexão SSH
```bash
# Se der erro de SSH, tente:
ssh -o StrictHostKeyChecking=no root@31.97.30.241
```

### SSL não funciona
```bash
# Regenerar certificado SSL
sudo certbot --nginx -d whatsapp.plushify.com.br --force-renewal
```

### App não conecta
1. Verificar se as chaves do Supabase estão corretas
2. Verificar se o app está rodando: `pm2 status`
3. Verificar logs: `pm2 logs whatsapp-server`

## ✅ CHECKLIST FINAL

- [ ] Deploy executado com sucesso
- [ ] Chaves do Supabase configuradas
- [ ] Aplicação rodando (pm2 status)
- [ ] SSL funcionando (https://)
- [ ] URL configurada no app Plushify
- [ ] QR Code aparecendo
- [ ] WhatsApp conectado
- [ ] Mensagens sendo enviadas/recebidas

## 🎯 PRÓXIMOS PASSOS

1. ✅ **Deploy realizado**
2. ⚠️ **Configurar chaves do Supabase** ← VOCÊ ESTÁ AQUI
3. ⚠️ **Testar conexão WhatsApp**
4. ⚠️ **Enviar primeira mensagem**

---

💡 **Dica**: Mantenha este guia salvo para futuras configurações!