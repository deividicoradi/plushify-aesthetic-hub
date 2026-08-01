import React from 'react';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { HelpContent } from '@/components/help/HelpContent';
import { SupportTickets } from '@/components/help/SupportTickets';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';

const HelpCenter = () => {
  return (
    <ResponsiveLayout
      title="Central de Ajuda"
      subtitle="Encontre respostas e suporte para suas dúvidas"
      icon={HelpCircle}
    >
      <SEO
        title="Central de Ajuda - Plushify"
        description="Encontre respostas, tutoriais e suporte para usar o Plushify."
        path="/app/help"
      />
      <Tabs defaultValue="help" className="space-y-6">
        <TabsList>
          <TabsTrigger value="help" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            Ajuda
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Meus Chamados
          </TabsTrigger>
        </TabsList>
        <TabsContent value="help">
          <HelpContent />
        </TabsContent>
        <TabsContent value="support">
          <SupportTickets />
        </TabsContent>
      </Tabs>
    </ResponsiveLayout>
  );
};

export default HelpCenter;
