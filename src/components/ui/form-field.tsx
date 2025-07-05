import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { 
  sanitizeInput, 
  formatCPF, 
  formatCNPJ, 
  formatPhone,
  sanitizeNumericInput 
} from '@/hooks/useFormValidation';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'cpf' | 'cnpj' | 'textarea' | 'password';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  rows?: number; // Para textarea
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className,
  maxLength,
  rows = 3
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Aplicar formatação específica baseada no tipo
    switch (type) {
      case 'cpf':
        newValue = formatCPF(newValue);
        break;
      case 'cnpj':
        newValue = formatCNPJ(newValue);
        break;
      case 'tel':
        newValue = formatPhone(newValue);
        break;
      default:
        // Sanitizar input padrão
        if (type !== 'password') {
          newValue = sanitizeInput(newValue);
        }
        break;
    }

    onChange(newValue);
  };

  const getInputType = () => {
    switch (type) {
      case 'cpf':
      case 'cnpj':
      case 'tel':
        return 'text';
      default:
        return type;
    }
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (type) {
      case 'cpf':
        return '000.000.000-00';
      case 'cnpj':
        return '00.000.000/0000-00';
      case 'tel':
        return '(00) 00000-0000';
      case 'email':
        return 'seu@email.com';
      default:
        return placeholder;
    }
  };

  const fieldId = `field-${name}`;
  const hasError = !!error;
  const showSuccess = !hasError && value && value.trim() !== '';

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          hasError && 'text-destructive',
          required && 'after:content-["*"] after:ml-1 after:text-destructive'
        )}
      >
        {label}
      </Label>
      
      <div className="relative">
        {type === 'textarea' ? (
          <Textarea
            id={fieldId}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={getPlaceholder()}
            disabled={disabled}
            maxLength={maxLength}
            rows={rows}
            className={cn(
              'w-full',
              hasError && 'border-destructive focus-visible:ring-destructive',
              showSuccess && 'border-green-500 focus-visible:ring-green-500'
            )}
          />
        ) : (
          <Input
            type={getInputType()}
            id={fieldId}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder={getPlaceholder()}
            disabled={disabled}
            maxLength={maxLength}
            className={cn(
              'w-full pr-10',
              hasError && 'border-destructive focus-visible:ring-destructive',
              showSuccess && 'border-green-500 focus-visible:ring-green-500'
            )}
          />
        )}
        
        {/* Success/Error Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {hasError && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          {showSuccess && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Character Count */}
      {maxLength && value && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};