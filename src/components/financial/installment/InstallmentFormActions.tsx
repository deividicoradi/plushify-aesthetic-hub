
import React from 'react';
import { Button } from "@/components/ui/button";

interface InstallmentFormActionsProps {
  loading: boolean;
  installment?: any;
  onCancel: () => void;
}

const InstallmentFormActions = ({ loading, installment, onCancel }: InstallmentFormActionsProps) => {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : installment ? "Salvar" : "Criar Parcelamento"}
      </Button>
    </div>
  );
};

export default InstallmentFormActions;
