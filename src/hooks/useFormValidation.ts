import { useState } from 'react';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationRules {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  cpf?: boolean;
  cnpj?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FormValidationConfig {
  [fieldName: string]: ValidationRules;
}

// Utilitários de validação
const validateCPF = (cpf: string): boolean => {
  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica sequências inválidas
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 === 10 || checkDigit1 === 11) checkDigit1 = 0;
  
  // Verifica primeiro dígito
  if (checkDigit1 !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 === 10 || checkDigit2 === 11) checkDigit2 = 0;
  
  // Verifica segundo dígito
  return checkDigit2 === parseInt(cleanCPF.charAt(10));
};

const validateCNPJ = (cnpj: string): boolean => {
  // Remove formatação
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica sequências inválidas
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let checkDigit1 = sum % 11;
  checkDigit1 = checkDigit1 < 2 ? 0 : 11 - checkDigit1;
  
  // Verifica primeiro dígito
  if (checkDigit1 !== parseInt(cleanCNPJ.charAt(12))) return false;
  
  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  let checkDigit2 = sum % 11;
  checkDigit2 = checkDigit2 < 2 ? 0 : 11 - checkDigit2;
  
  // Verifica segundo dígito
  return checkDigit2 === parseInt(cleanCNPJ.charAt(13));
};

const validateEmail = (email: string): boolean => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Remove formatação
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com ou sem 9 no celular)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;
  
  // Verifica se começa com código de área válido (11-99)
  const areaCode = parseInt(cleanPhone.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) return false;
  
  return true;
};

// Sanitização de inputs
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove caracteres perigosos restantes
};

export const sanitizeNumericInput = (input: string): string => {
  return input.replace(/[^\d]/g, '');
};

export const formatCPF = (cpf: string): string => {
  const clean = sanitizeNumericInput(cpf);
  if (clean.length <= 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return clean.substring(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj: string): string => {
  const clean = sanitizeNumericInput(cnpj);
  if (clean.length <= 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return clean.substring(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone: string): string => {
  const clean = sanitizeNumericInput(phone);
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return clean;
};

export const useFormValidation = (config: FormValidationConfig) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateField = (fieldName: string, value: string): string | null => {
    const rules = config[fieldName];
    if (!rules) return null;

    const sanitizedValue = sanitizeInput(value);

    // Required validation
    if (rules.required && (!sanitizedValue || sanitizedValue.trim() === '')) {
      return 'Este campo é obrigatório';
    }

    // Skip other validations if field is empty and not required
    if (!sanitizedValue || sanitizedValue.trim() === '') {
      return null;
    }

    // Email validation
    if (rules.email && !validateEmail(sanitizedValue)) {
      return 'E-mail inválido';
    }

    // Phone validation
    if (rules.phone && !validatePhone(sanitizedValue)) {
      return 'Telefone inválido';
    }

    // CPF validation
    if (rules.cpf && !validateCPF(sanitizedValue)) {
      return 'CPF inválido';
    }

    // CNPJ validation
    if (rules.cnpj && !validateCNPJ(sanitizedValue)) {
      return 'CNPJ inválido';
    }

    // Length validations
    if (rules.minLength && sanitizedValue.length < rules.minLength) {
      return `Mínimo de ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
      return `Máximo de ${rules.maxLength} caracteres`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(sanitizedValue);
    }

    return null;
  };

  const validateForm = (formData: Record<string, string>): boolean => {
    const newErrors: ValidationError[] = [];

    Object.keys(config).forEach(fieldName => {
      const value = formData[fieldName] || '';
      const error = validateField(fieldName, value);
      
      if (error) {
        newErrors.push({
          field: fieldName,
          message: error
        });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(errors.filter(error => error.field !== fieldName));
  };

  return {
    errors,
    validateForm,
    validateField,
    getFieldError,
    clearErrors,
    clearFieldError
  };
};