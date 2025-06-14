
-- Verificar e remover a constraint que está bloqueando os tipos de pagamento
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_type_check;

-- Criar uma constraint mais flexível que aceite os tipos que estamos usando
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_type_check 
CHECK (type IN ('pix', 'dinheiro', 'cartao_debito', 'cartao_credito', 'transferencia', 'boleto', 'cheque', 'vale_alimentacao', 'vale_refeicao', 'outros'));
