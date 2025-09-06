
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Service, useServices } from '@/hooks/useServices';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useProfessionals, Professional } from '@/hooks/useProfessionals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ProfessionalSelector from './ProfessionalSelector';
import { toast } from 'sonner';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, professionals: Professional[]) => Promise<boolean>;
  service?: Service | null;
  title: string;
}

export const ServiceForm = ({ isOpen, onClose, onSubmit, service, title }: ServiceFormProps) => {
  const { user } = useAuth();
  const { hasReachedLimit } = usePlanLimits();
  const { services } = useServices();
  const { professionals } = useProfessionals();
  const [selectedProfessionals, setSelectedProfessionals] = useState<Professional[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: '',
    active: true
  });
  const [loading, setLoading] = useState(false);

  // Fetch service professionals when editing
  const fetchServiceProfessionals = async (serviceId: string) => {
    if (!user) return;
    
    try {
      // First get the professional IDs linked to this service
      const { data: serviceProfessionals, error: spError } = await supabase
        .from('service_professionals')
        .select('professional_id')
        .eq('service_id', serviceId)
        .eq('user_id', user.id);

      if (spError) throw spError;

      if (serviceProfessionals && serviceProfessionals.length > 0) {
        const professionalIds = serviceProfessionals.map(sp => sp.professional_id);
        
        // Then get the full professional data
        const { data: professionalsData, error: profError } = await supabase
          .from('professionals')
          .select('*')
          .in('id', professionalIds)
          .eq('user_id', user.id);

        if (profError) throw profError;
        
        setSelectedProfessionals(professionalsData || []);
      }
    } catch (error) {
      console.error('Error fetching service professionals:', error);
    }
  };

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        category: service.category || '',
        active: service.active
      });
      fetchServiceProfessionals(service.id);
    } else {
      setFormData({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        category: '',
        active: true
      });
      setSelectedProfessionals([]);
    }
  }, [service, isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome do serviço é obrigatório');
      return;
    }

    // Check limits only for new services  
    if (!service && hasReachedLimit('services', services.length)) {
      toast.error('Limite de serviços atingido para seu plano atual');
      return;
    }
    
    setLoading(true);
    
    try {
      // Submit the service data along with selected professionals
      const success = await onSubmit(formData, selectedProfessionals);
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProfessional = (professional: Professional) => {
    setSelectedProfessionals(prev => [...prev, professional]);
  };

  const handleRemoveProfessional = (professionalId: string) => {
    setSelectedProfessionals(prev => prev.filter(prof => prof.id !== professionalId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Corte de Cabelo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do serviço..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Ex: Cabelo, Unhas, Estética"
            />
          </div>

          <div className="space-y-2">
            <Label>Profissionais</Label>
            <ProfessionalSelector
              selectedProfessionals={selectedProfessionals}
              availableProfessionals={professionals}
              onAddProfessional={handleAddProfessional}
              onRemoveProfessional={handleRemoveProfessional}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleChange('active', checked)}
            />
            <Label htmlFor="active">Serviço ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
