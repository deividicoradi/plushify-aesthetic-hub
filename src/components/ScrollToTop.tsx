import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantâneo, não 'smooth': a troca de rota já é instantânea (React
    // troca o conteúdo na hora), então um scroll suave fazia o usuário ver
    // a página nova ainda na posição de rolagem da página anterior por um
    // instante, antes de deslizar até o topo — parecia "pular" pro lugar
    // errado a cada clique em link.
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

export default ScrollToTop;