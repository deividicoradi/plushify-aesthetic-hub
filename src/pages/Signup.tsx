
import { Navigate } from 'react-router-dom';

// Esta rota tinha um formulário de cadastro completo (nome, e-mail, senha,
// tipo de serviço) que parecia real, mas o submit nunca chamava
// supabase.auth.signUp — era um setTimeout fake que mostrava "Cadastro
// realizado com sucesso!" e mandava pro /dashboard sem nenhuma conta ter
// sido criada, jogando a pessoa de volta pro login. Não havia nenhum link
// pra /signup em lugar nenhum do site (o cadastro real sempre foi por
// /auth?tab=signup), então em vez de manter uma segunda tela de cadastro
// pra sustentar, redireciona quem cair aqui direto pro fluxo que funciona.
const Signup = () => <Navigate to="/auth?tab=signup" replace />;

export default Signup;
