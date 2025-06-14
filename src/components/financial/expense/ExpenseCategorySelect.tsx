
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExpenseCategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const ExpenseCategorySelect = ({ value, onValueChange }: ExpenseCategorySelectProps) => {
  const categories = [
    { value: 'material', label: 'Material' },
    { value: 'equipamento', label: 'Equipamento' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'salario', label: 'Salário' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'impostos', label: 'Impostos' },
    { value: 'outros', label: 'Outros' },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="category">Categoria *</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ExpenseCategorySelect;
