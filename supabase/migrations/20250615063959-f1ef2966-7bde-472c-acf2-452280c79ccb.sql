
-- Remover a função com CASCADE para remover dependências automáticas
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;

-- Remover as tabelas relacionadas ao estoque/inventário
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
