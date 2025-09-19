// Sistema de validação de formulários
// Garante que todos os campos tenham id ou name

export const validateFormAccessibility = () => {
  const issues: string[] = [];
  
  // Verificar inputs sem id ou name
  const inputs = document.querySelectorAll('input:not([id]):not([name])');
  if (inputs.length > 0) {
    issues.push(`${inputs.length} inputs sem id/name encontrados`);
    inputs.forEach((input, index) => {
      const placeholder = (input as HTMLInputElement).placeholder;
      console.warn(`Input sem id/name: ${placeholder || `input ${index + 1}`}`);
    });
  }
  
  // Verificar selects sem id ou name
  const selects = document.querySelectorAll('select:not([id]):not([name])');
  if (selects.length > 0) {
    issues.push(`${selects.length} selects sem id/name encontrados`);
  }
  
  // Verificar textareas sem id ou name
  const textareas = document.querySelectorAll('textarea:not([id]):not([name])');
  if (textareas.length > 0) {
    issues.push(`${textareas.length} textareas sem id/name encontrados`);
  }
  
  if (issues.length === 0) {
    console.log('[FORM] ✅ Todos os inputs com id/name válidos');
    return true;
  } else {
    console.error('[FORM] ❌ Problemas encontrados:', issues);
    return false;
  }
};

export const validateCSPCompliance = () => {
  // Verificar se há scripts bloqueados por CSP
  const blockedScripts = Array.from(document.querySelectorAll('script')).filter(script => {
    const src = script.src;
    return src && !src.includes('localhost') && !src.includes('lovable.dev') && 
           !src.includes('stripe.com') && !src.includes('google');
  });
  
  if (blockedScripts.length === 0) {
    console.log('[CSP] ✅ Scripts liberados com segurança');
    return true;
  } else {
    console.warn('[CSP] ❌ Scripts potencialmente bloqueados:', blockedScripts.map(s => s.src));
    return false;
  }
};

export const validateKeepAlive = async () => {
  try {
    const { pingKeepAlive } = await import('./keepAlive');
    const result = await pingKeepAlive();
    
    if (result?.ok && result?.headersEcho) {
      console.log('[KEEPALIVE] ✅ Resposta 200 OK com CORS válido', result.headersEcho);
      return true;
    } else {
      console.error('[KEEPALIVE] ❌ Resposta inválida ou sem headers CORS');
      return false;
    }
  } catch (error) {
    console.error('[KEEPALIVE] ❌ Falha na validação:', error);
    return false;
  }
};

// Executar todas as validações
export const runFullValidation = async () => {
  console.log('🔍 Iniciando validação completa da aplicação...');
  
  const formValid = validateFormAccessibility();
  const cspValid = validateCSPCompliance();
  const keepAliveValid = await validateKeepAlive();
  
  const allValid = formValid && cspValid && keepAliveValid;
  
  console.log(`🎯 Validação ${allValid ? 'CONCLUÍDA' : 'FALHOU'} - Form: ${formValid ? '✅' : '❌'}, CSP: ${cspValid ? '✅' : '❌'}, KeepAlive: ${keepAliveValid ? '✅' : '❌'}`);
  
  return allValid;
};