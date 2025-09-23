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

// Monkey patch global setAttribute para prevenir valores inválidos
if (typeof window !== 'undefined') {
  const originalSetAttribute = Element.prototype.setAttribute;
  
  Element.prototype.setAttribute = function(name: string, value: any) {
    if (!validateAttribute(name, value)) {
      console.warn(`[ATTRIBUTE] Blocked invalid setAttribute: ${name}=${value}`);
      return;
    }
    
    return originalSetAttribute.call(this, name, String(value));
  };
  
  console.log('[ATTRIBUTE] ✅ Validador de atributos DOM ativado');
}