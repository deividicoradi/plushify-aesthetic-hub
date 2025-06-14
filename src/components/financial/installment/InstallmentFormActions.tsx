
import React from 'react';
import { Button } from "@/components/ui/button";

interface InstallmentFormActionsProps {
  loading: boolean;
  installment?: any;
  onCancel: () => void;
  disabled?: boolean;
}

const InstallmentFormActions = ({ 
  loading, 
  installment, 
  onCancel, 
  disabled = false 
}: InstallmentFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={loading || disabled}
      >
        {loading ? 'Salvando...' : installment ? 'Atualizar' : 'Criar Parcelamento'}
      </Button>
    </div>
  );
};

export default InstallmentFormActions;
