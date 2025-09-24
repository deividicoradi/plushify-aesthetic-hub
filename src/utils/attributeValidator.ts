// Validador de atributos DOM para prevenir setAttribute com valores inválidos

export const validateAttribute = (name: string, value: any): boolean => {
  // Verificar se o nome do atributo é válido
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return false;
  }
  
  // Verificar se o valor não é undefined, null ou empty string inválida
  if (value === undefined || value === null) {
    return false;
  }
  
  // Converter para string e verificar se não é inválida
  const stringValue = String(value);
  if (stringValue === 'undefined' || stringValue === 'null' || stringValue === '') {
    return false;
  }
  
  return true;
};

export const safeSetAttribute = (element: Element, name: string, value: any): void => {
  if (!element || !validateAttribute(name, value)) {
    console.warn(`[ATTRIBUTE] Skipping invalid attribute: ${name}=${value}`);
    return;
  }
  
  try {
    element.setAttribute(name, String(value));
  } catch (error) {
    console.warn(`[ATTRIBUTE] Failed to set attribute ${name}:`, error);
  }
};

export const safeRemoveAttribute = (element: Element, name: string): void => {
  if (!element || !name || typeof name !== 'string') {
    return;
  }
  
  try {
    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
    }
  } catch (error) {
    console.warn(`[ATTRIBUTE] Failed to remove attribute ${name}:`, error);
  }
};

// Validador seguro sem monkey patch para evitar conflitos de inicialização
if (typeof window !== 'undefined') {
  // Verificar se já foi inicializado para evitar múltiplas execuções
  if (!(window as any).__ATTRIBUTE_VALIDATOR_INITIALIZED__) {
    (window as any).__ATTRIBUTE_VALIDATOR_INITIALIZED__ = true;
    
    // Observar setAttribute chamadas sem modificar o prototype
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          const target = mutation.target;
          const attrName = mutation.attributeName;
          if (attrName) {
            const attrValue = target.getAttribute(attrName);
            if (!validateAttribute(attrName, attrValue)) {
              console.warn(`[ATTRIBUTE] Invalid attribute detected: ${attrName}=${attrValue}`);
              safeRemoveAttribute(target, attrName);
            }
          }
        }
      });
    });
    
    // Observar apenas quando DOM estiver carregado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeOldValue: true
        });
      });
    } else {
      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeOldValue: true
      });
    }
    
    console.log('[ATTRIBUTE] ✅ Validador de atributos DOM ativado (observer mode)');
  }
}