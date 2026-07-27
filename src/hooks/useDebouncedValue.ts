import { useEffect, useState } from 'react';

// Debounce genérico de valor — o input continua controlado pelo estado
// "cru" (digitação sempre instantânea), só o valor usado pra filtrar/
// consultar é atualizado ~300ms depois que o usuário para de digitar.
// Existia um useDebounceSearch mais específico (busca assíncrona com
// AbortController), mas a maioria dos campos de busca do app só filtra
// uma lista já carregada em memória — não precisam desse aparato, só
// evitar refiltrar/re-renderizar a cada tecla.
export const useDebouncedValue = <T,>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
};
