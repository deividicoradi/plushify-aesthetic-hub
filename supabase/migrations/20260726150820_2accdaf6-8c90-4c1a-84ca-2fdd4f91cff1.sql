-- A constraint original só aceitava valores capitalizados
-- ('Aluguel','Energia','Internet','Material','Salários','Marketing','Outros'),
-- mas o formulário de despesas (ExpenseCategorySelect) sempre enviou slugs em
-- minúsculo e com categorias diferentes (material, equipamento, marketing,
-- aluguel, salario, servicos, impostos, outros) — nenhum valor batia,
-- então toda criação de despesa falhava com "violates check constraint
-- expenses_category_check". Ampliamos a constraint para aceitar os valores
-- reais enviados pelo formulário, mantendo os antigos por segurança.

ALTER TABLE public.expenses DROP CONSTRAINT expenses_category_check;

ALTER TABLE public.expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN (
    'Aluguel','Energia','Internet','Material','Salários','Marketing','Outros',
    'material','equipamento','marketing','aluguel','salario','servicos','impostos','outros'
  ));