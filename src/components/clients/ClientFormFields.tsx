import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, CreditCard, FileText, MapPin } from 'lucide-react';
import type { ClientFormData } from '@/hooks/clients/useClientFormState';
import { formatCepDisplay, formatCpfDisplay } from '@/utils/clientFormat';

interface ClientFormFieldsProps {
  form: ClientFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (field: 'payment_method' | 'status', value: string) => void;
  onCepBlur: (cep: string) => void;
  loadingCep: boolean;
}

// Campos compartilhados entre NewClientDialog e EditClientDialog — antes
// duplicados palavra por palavra nos dois arquivos (mesmas 3 seções:
// Informações Básicas, Endereço, Pagamento e Status).
export const ClientFormFields: React.FC<ClientFormFieldsProps> = ({
  form,
  onInputChange,
  onSelectChange,
  onCepBlur,
  loadingCep,
}) => {
  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5" />
          Informações Básicas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome *
            </Label>
            <Input
              id="name"
              name="name"
              required
              value={form.name}
              onChange={onInputChange}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CPF *
            </Label>
            <Input
              id="cpf"
              name="cpf"
              required
              value={formatCpfDisplay(form.cpf)}
              onChange={onInputChange}
              placeholder="000.000.000-00"
              maxLength={14}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onInputChange}
              placeholder="cliente@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Telefone
            </Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={onInputChange}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Endereço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              name="cep"
              value={formatCepDisplay(form.cep)}
              onChange={onInputChange}
              onBlur={(e) => onCepBlur(e.target.value.replace(/\D/g, ''))}
              placeholder="00000-000"
              maxLength={9}
              disabled={loadingCep}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Logradouro</Label>
            <Input
              id="address"
              name="address"
              value={form.address}
              onChange={onInputChange}
              placeholder="Rua, Avenida..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              value={form.neighborhood}
              onChange={onInputChange}
              placeholder="Bairro"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              name="city"
              value={form.city}
              onChange={onInputChange}
              placeholder="Cidade"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              name="state"
              value={form.state}
              onChange={onInputChange}
              placeholder="UF"
              maxLength={2}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pagamento e Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento Preferida</Label>
            <Select value={form.payment_method} onValueChange={(value) => onSelectChange('payment_method', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={form.status} onValueChange={(value) => onSelectChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
};
