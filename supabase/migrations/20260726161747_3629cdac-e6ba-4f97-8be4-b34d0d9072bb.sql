DROP TRIGGER IF EXISTS on_auth_user_created_start_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_start_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_start_trial_on_signup();