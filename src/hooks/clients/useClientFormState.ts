import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  payment_method: string;
  status: string;
}

const emptyForm: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  cpf: '',
  cep: '',
  address: '',
  neighborhood: '',
  city: '',
  state: '',
  payment_method: '',
  status: 'Ativo',
};

// Compartilhado entre NewClientDialog e EditClientDialog — só a origem dos
// dados iniciais muda (formulário vazio vs dados de um cliente existente).
export function useClientFormState(client?: Partial<ClientFormData> | null) {
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        cpf: client.cpf || '',
        cep: client.cep || '',
        address: client.address || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        payment_method: client.payment_method || '',
        status: client.status || 'Ativo',
      });
    }
  }, [client]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;

    if (e.target.name === 'cpf') {
      value = value.replace(/\D/g, '').slice(0, 11);
    }
    if (e.target.name === 'cep') {
      value = value.replace(/\D/g, '').slice(0, 8);
    }

    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  }

  async function searchCep(cep: string) {
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setForm((prev) => ({
          ...prev,
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  }

  const reset = () => setForm(emptyForm);

  return { form, setForm, handleInput, searchCep, loadingCep, reset };
}
