import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { Professional } from '@/hooks/useProfessionals';

interface ProfessionalSelectorProps {
  selectedProfessionals: Professional[];
  availableProfessionals: Professional[];
  onAddProfessional: (professional: Professional) => void;
  onRemoveProfessional: (professionalId: string) => void;
  disabled?: boolean;
}

const ProfessionalSelector: React.FC<ProfessionalSelectorProps> = ({
  selectedProfessionals,
  availableProfessionals,
  onAddProfessional,
  onRemoveProfessional,
  disabled = false
}) => {
  const unselectedProfessionals = availableProfessionals.filter(
    prof => !selectedProfessionals.some(selected => selected.id === prof.id)
  );

  const handleSelectProfessional = (professionalId: string) => {
    const professional = availableProfessionals.find(prof => prof.id === professionalId);
    if (professional) {
      onAddProfessional(professional);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select onValueChange={handleSelectProfessional} disabled={disabled}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione um profissional" />
          </SelectTrigger>
          <SelectContent>
            {unselectedProfessionals.length === 0 ? (
              <SelectItem value="none" disabled>
                Todos os profissionais já foram selecionados
              </SelectItem>
            ) : (
              unselectedProfessionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.name} {professional.email && `(${professional.email})`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Professionals */}
      {selectedProfessionals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Profissionais selecionados:</p>
          <div className="flex flex-wrap gap-2">
            {selectedProfessionals.map((professional) => (
              <Badge
                key={professional.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1"
              >
                <span>{professional.name}</span>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onRemoveProfessional(professional.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {selectedProfessionals.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum profissional selecionado
        </p>
      )}
    </div>
  );
};

export default ProfessionalSelector;