
import React, { useState } from 'react';
import { Users, UserPlus, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { TeamMemberForm } from '@/components/team/TeamMemberForm';
import { useToast } from '@/hooks/use-toast';

export const TeamManagement = () => {
  const { teamMembers, loading, createTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  const handleAddMember = () => {
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
      if (editingMember) {
        await updateTeamMember(editingMember.id, data);
      } else {
        await createTeamMember(data);
      }
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestão de Equipe
            </CardTitle>
            <Button onClick={handleAddMember}>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum membro cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando membros à sua equipe para gerenciar melhor seu negócio.
              </p>
              <Button onClick={handleAddMember}>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Membro
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
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
    </div>
  );
};
