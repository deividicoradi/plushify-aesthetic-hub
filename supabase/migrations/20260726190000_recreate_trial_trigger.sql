-- Confirmado por teste real: chamar public.start_subscription() diretamente
-- funciona (cria a assinatura normalmente), mas nenhum cadastro novo pelo
-- fluxo padrão recebia uma linha em user_subscriptions automaticamente.
-- Isso indica que o trigger on_auth_user_created_start_trial pode ter sido
-- desanexado de auth.users em algum momento — as duas migrations recentes
-- que corrigiram auto_start_trial_on_signup() só recriaram a FUNÇÃO
-- (CREATE OR REPLACE), nunca o TRIGGER em si. Recria o trigger de forma
-- idempotente pra garantir que ele está de fato anexado.

DROP TRIGGER IF EXISTS on_auth_user_created_start_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_start_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_start_trial_on_signup();
