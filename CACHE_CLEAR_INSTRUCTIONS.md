# Como Resolver o Erro "Cannot access 'Ke' before initialization"

## Problema
Este erro indica um problema de dependências circulares ou ordem de inicialização no build do Vite.

## Solução Imediata

### Passo 1: Limpar o Cache do Vite
Execute os seguintes comandos no terminal:

```bash
# Parar o servidor de desenvolvimento (Ctrl+C)

# Remover a pasta de cache do Vite
rm -rf node_modules/.vite

# Opcional: Limpar node_modules e reinstalar (se o problema persistir)
rm -rf node_modules
npm install

# Reiniciar o servidor
npm run dev
```

### Passo 2: Limpar Cache do Navegador
1. Abra o DevTools (F12)
2. Clique com botão direito no ícone de reload
3. Selecione "Esvaziar cache e recarregar forçadamente"

Ou simplesmente:
- **Chrome/Edge**: Ctrl+Shift+Delete → Limpar cache
- **Firefox**: Ctrl+Shift+Delete → Limpar cache

## Mudanças Aplicadas no vite.config.ts

1. **Simplificação do chunking manual** - Removido `manualChunks` para evitar problemas de ordem
2. **Melhor deduplicação do React** - Adicionado `react-dom/client` 
3. **Otimizações no optimizeDeps** - Incluído `react/jsx-runtime` e `react-dom/client`

## Se o Problema Persistir

1. Verifique se há múltiplas versões do React:
```bash
npm list react react-dom
```

2. Force a reinstalação do React:
```bash
npm install react@latest react-dom@latest --save-exact
```

3. Limpe completamente e reconstrua:
```bash
rm -rf node_modules .vite dist
npm install
npm run dev
```

## Prevenção Futura

- Evite importações circulares entre componentes
- Use `import type` para importações de tipos apenas
- Mantenha uma hierarquia clara de dependências
