# Guia de Segurança - Acesso a Dados de Clientes

## ⚠️ CRÍTICO: Tabela `clients` contém PII sensível

A tabela `clients` contém informações pessoais identificáveis (PII):
- Email
- Telefone
- CPF (número de identificação fiscal brasileiro)
- Endereço completo
- CEP

## 🔒 Proteções Implementadas

### 1. Políticas RLS RESTRICTIVE
As políticas RLS são do tipo **RESTRICTIVE**, o que significa:
- Todos os usuários só podem acessar seus próprios dados (`user_id = auth.uid()`)
- É impossível para um usuário ver dados de outro usuário
- As políticas são validadas a nível de banco de dados

### 2. Constraints de Segurança
- `user_id` NÃO PODE ser NULL
- `user_id` NÃO PODE ser UUID vazio
- CPF e email são validados por funções seguras
- Validação de formato de CEP e telefone

### 3. Índices de Performance
- Índice em `user_id` para queries RLS rápidas

## 📋 Melhores Práticas

### ✅ RECOMENDADO: Use a função RPC para listagem
```typescript
// Use isto para listagem com auditoria automática
const { data, error } = await supabase.rpc('get_clients_masked', {
  p_mask_sensitive: false  // ou true para mascarar PII
});
```

**Benefícios:**
- Auditoria automática de todos os acessos
- Log de segurança em `whatsapp_security_logs`
- Possibilidade de mascaramento de dados sensíveis
- Monitoramento centralizado

### ⚠️ PERMITIDO: Acesso direto para operações específicas
```typescript
// Acesso direto ainda é seguro devido às políticas RLS RESTRICTIVE
// Mas NÃO gera logs de auditoria
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('user_id', user.id);
```

**Quando usar acesso direto:**
- INSERT de novos clientes
- UPDATE de dados existentes
- DELETE de registros
- Queries com filtros complexos específicos

**NUNCA remover** `.eq('user_id', user.id)` - é redundante com RLS mas é boa prática!

### ❌ NUNCA FAÇA ISSO
```typescript
// NUNCA fazer queries sem auth check
const { data } = await supabase.from('clients').select('*');

// NUNCA desabilitar RLS
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

// NUNCA armazenar dados sensíveis em localStorage
localStorage.setItem('clientData', JSON.stringify(client));
```

## 🔍 Monitoramento de Segurança

### Verificar logs de acesso
```sql
SELECT 
  event_type,
  severity,
  details,
  created_at
FROM whatsapp_security_logs
WHERE event_type IN ('CLIENTS_LIST_ACCESS', 'CLIENT_DATA_ACCESS', 'PII_ACCESS_CLIENTS')
ORDER BY created_at DESC
LIMIT 100;
```

### Verificar políticas RLS
```sql
SELECT 
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN permissive = 'RESTRICTIVE' THEN '✅ Seguro'
        ELSE '⚠️ Revisar'
    END as status
FROM pg_policies 
WHERE tablename = 'clients';
```

## 🚨 Resposta a Incidentes

Se suspeitar de vazamento de dados:

1. Verificar logs de auditoria imediatamente
2. Identificar padrões de acesso suspeitos
3. Revogar tokens de sessão comprometidos
4. Notificar usuários afetados conforme LGPD

## 📚 Funções Seguras Disponíveis

- `get_clients_masked(p_mask_sensitive)` - Lista clientes com auditoria
- `get_client_data_secure(p_client_id, p_mask_sensitive)` - Cliente individual
- `get_client_data_admin(p_client_id)` - Acesso admin (requer role)
- `mask_sensitive_data(input_text, mask_type)` - Mascarar dados

## ✅ Checklist de Segurança para Novos Recursos

Ao adicionar funcionalidade que acessa `clients`:

- [ ] RLS policies estão habilitadas?
- [ ] Usando função RPC para auditoria quando apropriado?
- [ ] Dados sensíveis NÃO são logados no console?
- [ ] Validação de entrada implementada?
- [ ] Dados sensíveis NÃO são armazenados em localStorage?
- [ ] Testes de segurança realizados?
- [ ] Documentação de segurança atualizada?

## 📖 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
