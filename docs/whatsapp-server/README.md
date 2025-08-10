# Microserviço WhatsApp Web (Node + whatsapp-web.js)

Este guia configura um serviço Node externo que gerencia sessões do WhatsApp Web via QR Code e expõe uma API que seu app consome.

Importante:
- Este serviço roda fora do Lovable (em um VPS/Render/Fly/Docker etc.)
- Ele verifica o token do Supabase enviado pelo frontend (Authorization: Bearer ...)
- Ele persiste contatos/mensagens nas tabelas existentes do seu Supabase (opcional, recomendado)

## Endpoints esperados pelo app

Base URL: https://seu-dominio.com/whatsapp (configure no app em: WhatsApp > Configurações)

- GET    /            → status atual { status: 'desconectado'|'pareando'|'conectado', sessionId, qrCode? }
- POST   /            → { action: 'connect' | 'disconnect' | 'send-message', ... }
- GET    /messages    → lista de mensagens (query: contactId?, limit=50)

Payloads:
- Conectar: POST / { action: 'connect' }
- Desconectar: POST / { action: 'disconnect' }
- Enviar mensagem: POST / { action: 'send-message', phone, message, contactName? }

Headers: Authorization: Bearer <supabase_access_token>

## Variáveis de ambiente necessárias

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY  (para persistir dados; mantenha em segredo!)
- PORT (opcional, padrão 8787)

Recomendado para verificação de tokens (alternativa):
- SUPABASE_JWT_SECRET (permite verificar JWT localmente via jsonwebtoken)

## Instalação

```
npm init -y
npm i express cors whatsapp-web.js qrcode @supabase/supabase-js jsonwebtoken
```

## Execução

```
node server.js
# ou com nodemon
```

## Observações
- O QR code expira periodicamente; o serviço renova e envia a imagem base64.
- Mantenha o telefone do WhatsApp com internet.
- Em produção, monte um volume para salvar sessão (ex: .wwebjs_auth) e evitar reconexões.
