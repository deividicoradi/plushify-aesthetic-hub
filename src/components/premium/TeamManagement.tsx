
import React, { useState } from 'react';
import { Users, UserPlus, Shield, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';
import { useTeamLimits } from '@/hooks/useTeamLimits';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { TeamMemberForm } from '@/components/team/TeamMemberForm';
import { UserLimitDisplay } from '@/components/team/UserLimitDisplay';
import { UserLimitModal } from '@/components/team/UserLimitModal';
import { useToast } from '@/hooks/use-toast';

export const TeamManagement = () => {
  const { teamMembers, loading, createTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  const { checkUserLimit, getUserLimitInfo } = useTeamLimits();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const limitInfo = getUserLimitInfo();

  // Filtrar membros baseado na busca
  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = () => {
    // Verificar se pode adicionar mais usuários
    if (!limitInfo.canAdd) {
      setShowLimitModal(true);
      return;
    }
    
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteTeamMember(id);
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      setFormLoading(true);
      
      // Se está criando um novo membro, verificar limites novamente
      if (!editingMember && !checkUserLimit()) {
        setIsFormOpen(false);
        setShowLimitModal(true);
        return;
      }
      
      if (editingMember) {
        await updateTeamMember(editingMember.id, data);
      } else {
        await createTeamMember(data);
      }
      
      setIsFormOpen(false);
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando membros da equipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display de limite de usuários */}
      <UserLimitDisplay variant="inline" />
      
      {/* Barra de busca e botão */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar membros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
          />
        </div>
        
        <div className="flex gap-2 w-full justify-end">
          <Button 
            onClick={handleAddMember}
            disabled={!limitInfo.canAdd}
            className="gap-2 touch-target"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar Membro</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestão de Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Nenhum membro encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Não encontramos membros com o termo "{searchTerm}".
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">Nenhum membro cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece adicionando membros à sua equipe para gerenciar melhor seu negócio.
                  </p>
                  <Button onClick={handleAddMember} disabled={!limitInfo.canAdd}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Membro
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onEdit={handleEditMember}
                  onDelete={handleDeleteMember}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TeamMemberForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        member={editingMember}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      <UserLimitModal
        open={showLimitModal}
        onOpenChange={setShowLimitModal}
        onCancel={() => setShowLimitModal(false)}
      />
    </div>
  );
};
