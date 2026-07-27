// Compartilhado entre NewClientDialog e EditClientDialog — antes duplicado
// palavra por palavra nos dois arquivos.

export function formatCpfDisplay(cpf: string) {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
}

export function formatCepDisplay(cep: string) {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
}

export function validateClientForm(form: { name: string; cpf: string }): string | null {
  if (!form.name.trim()) return 'Nome é obrigatório';
  if (!form.cpf.trim()) return 'CPF é obrigatório';
  if (form.cpf.length !== 11) return 'CPF deve ter 11 dígitos';
  return null;
}
