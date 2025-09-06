-- Limpar registros duplicados, mantendo apenas o mais recente por usuário
WITH ranked_sessions AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM whatsapp_sessoes
)
DELETE FROM whatsapp_sessoes
WHERE id IN (
  SELECT id FROM ranked_sessions WHERE rn > 1
);

-- Adicionar constraint única para evitar duplicatas futuras
ALTER TABLE whatsapp_sessoes 
ADD CONSTRAINT unique_user_session UNIQUE (user_id);