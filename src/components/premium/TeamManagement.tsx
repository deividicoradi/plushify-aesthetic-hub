
import React, { useState } from 'react';
import { Users, UserPlus, Shield, Search, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';
import { useTeamLimits } from '@/hooks/useTeamLimits';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { TeamMemberForm } from '@/components/team/TeamMemberForm';
import { UserLimitDisplay } from '@/components/team/UserLimitDisplay';
import { UserLimitModal } from '@/components/team/UserLimitModal';
import { CommissionsPanel, StaffCommissionsPanel } from '@/components/team/CommissionsPanel';
import { useStaffMode } from '@/contexts/StaffModeContext';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const CommissionsUpgradePrompt = () => (
  <Alert className="border-plush-200 bg-plush-50 dark:bg-plush-950/30">
    <Crown className="h-4 w-4 text-plush-600" />
    <AlertDescription className="text-plush-800 dark:text-plush-200">
      Comissão por profissional é exclusiva do plano Premium. Faça upgrade para pagar comissão automática por atendimento concluído.
    </AlertDescription>
  </Alert>
);

export const TeamManagement = () => {
  const { teamMembers, loading, createTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  const { checkUserLimit, getUserLimitInfo } = useTeamLimits();
  const { hasFeature } = usePlanLimits();
  const { isStaffMode } = useStaffMode();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const { toast } = useToast();

  const limitInfo = getUserLimitInfo();

  // Filtrar membros baseado na busca
  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const handleAddMember = () => {
    // O limite do plano só se aplica a quem ocupa vaga (counts_as_seat) —
    // cadastro de profissional-só-agenda continua liberado mesmo no limite,
    // então o formulário sempre pode abrir; a checagem real acontece no
    // submit, condicionada à escolha feita no formulário.
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
      
      // Limite de plano só vale pra quem ocupa vaga (counts_as_seat) —
      // membro cadastrado só como profissional (sem acesso ao sistema)
      // não esbarra nele.
      const willCountAsSeat = data.counts_as_seat !== false;
      if (!editingMember && willCountAsSeat && !checkUserLimit()) {
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

  if (isStaffMode) {
    return hasFeature('hasCommissions') ? <StaffCommissionsPanel /> : <CommissionsUpgradePrompt />;
  }

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

  const memberNames = Object.fromEntries(teamMembers.map((m) => [m.id, m.name]));

  return (
    <Tabs defaultValue="team" className="space-y-4 sm:space-y-6">
      <TabsList>
        <TabsTrigger value="team">Equipe</TabsTrigger>
        <TabsTrigger value="commissions">Comissões</TabsTrigger>
      </TabsList>

      <TabsContent value="commissions">
        {hasFeature('hasCommissions') ? (
          <CommissionsPanel memberNames={memberNames} canManage />
        ) : (
          <CommissionsUpgradePrompt />
        )}
      </TabsContent>

      <TabsContent value="team" className="space-y-4 sm:space-y-6">
      {/* Display de limite de usuários */}
      <UserLimitDisplay variant="inline" />
      
      {/* Barra de busca e botão */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar membros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200 w-full"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={handleAddMember}
            className="gap-2 touch-target w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar Membro</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            Gestão de Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              {searchTerm ? (
                <>
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhum membro encontrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Não encontramos membros com o termo "{searchTerm}".
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhum membro cadastrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece adicionando membros à sua equipe para gerenciar melhor seu negócio.
                  </p>
                  <Button onClick={handleAddMember} className="w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Membro
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
      </TabsContent>

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
    </Tabs>
  );
};
