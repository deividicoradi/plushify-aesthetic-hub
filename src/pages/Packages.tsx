import React, { useState } from 'react';
import { Package, Plus, Crown, Gift } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { FeatureGuard } from '@/components/FeatureGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useServicePackages, ServicePackage } from '@/hooks/packages/useServicePackages';
import { useClientPackages, isPackageUsable } from '@/hooks/packages/useClientPackages';
import { useGiftCards, ClientGiftCard } from '@/hooks/packages/useGiftCards';
import { useServices } from '@/hooks/useServices';
import { useClients } from '@/hooks/useClients';
import { ServicePackageForm } from '@/components/packages/ServicePackageForm';
import { PurchasePackageDialog } from '@/components/packages/PurchasePackageDialog';
import { PurchaseGiftCardDialog } from '@/components/packages/PurchaseGiftCardDialog';
import { RedeemGiftCardDialog } from '@/components/packages/RedeemGiftCardDialog';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

export const PackagesContent = () => {
  const { servicePackages, loading: loadingTemplates, createServicePackage, updateServicePackage } = useServicePackages();
  const { clientPackages, loading: loadingSold, purchasePackage } = useClientPackages();
  const { giftCards, loading: loadingGiftCards, purchaseGiftCard, redeemGiftCard } = useGiftCards();
  const { services } = useServices();
  const { clients } = useClients();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchaseGiftCardOpen, setPurchaseGiftCardOpen] = useState(false);
  const [redeemGiftCardTarget, setRedeemGiftCardTarget] = useState<ClientGiftCard | null>(null);

  const serviceNameById = new Map(services.map((s) => [s.id, s.name]));
  const clientNameById = new Map(clients.map((c) => [c.id, c.name]));

  const handleAddTemplate = () => {
    setEditingPackage(null);
    setFormOpen(true);
  };

  const handleEditTemplate = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Parameters<typeof createServicePackage>[0]) => {
    setFormLoading(true);
    try {
      if (editingPackage) {
        await updateServicePackage(editingPackage.id, data);
      } else {
        await createServicePackage(data);
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs defaultValue="templates" className="space-y-4 sm:space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Modelos de Pacote</TabsTrigger>
          <TabsTrigger value="sold">Pacotes Vendidos</TabsTrigger>
          <TabsTrigger value="giftcards">Vale-presentes</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4 sm:space-y-6">
          <div className="flex justify-end">
            <Button onClick={handleAddTemplate} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Modelo
            </Button>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Modelos de Pacote
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {loadingTemplates ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : servicePackages.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhum modelo cadastrado</h3>
                  <p className="text-sm text-muted-foreground">Crie um modelo de pacote pra começar a vender.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {servicePackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      role="button"
                      onClick={() => handleEditTemplate(pkg)}
                      className="rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">{pkg.name}</p>
                        <Badge variant={pkg.active ? 'default' : 'outline'}>
                          {pkg.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {serviceNameById.get(pkg.service_id) || 'Serviço removido'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pkg.total_sessions} sessões · válido {pkg.validity_days} dias
                      </p>
                      <p className="font-semibold mt-1">{formatCurrency(pkg.price)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sold" className="space-y-4 sm:space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setPurchaseOpen(true)} className="gap-2" disabled={servicePackages.filter((p) => p.active).length === 0}>
              <Plus className="w-4 h-4" />
              Vender Pacote
            </Button>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                Pacotes Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {loadingSold ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : clientPackages.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhum pacote vendido ainda</h3>
                  <p className="text-sm text-muted-foreground">Venda o primeiro pacote pra um cliente.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientPackages.map((pkg) => {
                    const usable = isPackageUsable(pkg);
                    return (
                      <div key={pkg.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{clientNameById.get(pkg.client_id) || 'Cliente removido'}</p>
                          <p className="text-xs text-muted-foreground">
                            {pkg.package_name} · válido até {formatDate(pkg.expires_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-semibold">{pkg.sessions_used}/{pkg.total_sessions} sessões</span>
                          <Badge variant={usable ? 'default' : 'outline'}>
                            {pkg.status === 'completed' ? 'Concluído' : usable ? 'Ativo' : pkg.status === 'active' ? 'Vencido' : 'Cancelado'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="giftcards" className="space-y-4 sm:space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setPurchaseGiftCardOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Vender Vale-presente
            </Button>
          </div>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                Vale-presentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {loadingGiftCards ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : giftCards.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhum vale-presente vendido ainda</h3>
                  <p className="text-sm text-muted-foreground">Venda o primeiro vale-presente pra um cliente.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {giftCards.map((card) => (
                    <div key={card.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{clientNameById.get(card.client_id) || 'Cliente removido'}</p>
                        <p className="text-xs text-muted-foreground">
                          Vendido em {formatDate(card.purchased_at)} · valor inicial {formatCurrency(card.initial_value)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold">{formatCurrency(card.balance)} disponível</span>
                        <Badge variant={card.status === 'active' ? 'default' : 'outline'}>
                          {card.status === 'active' ? 'Ativo' : card.status === 'redeemed' ? 'Usado' : 'Cancelado'}
                        </Badge>
                        {card.status === 'active' && (
                          <Button size="sm" variant="outline" onClick={() => setRedeemGiftCardTarget(card)}>
                            Registrar uso
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServicePackageForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        servicePackage={editingPackage}
        loading={formLoading}
      />

      <PurchasePackageDialog
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        servicePackages={servicePackages}
        onPurchase={purchasePackage}
      />

      <PurchaseGiftCardDialog
        open={purchaseGiftCardOpen}
        onOpenChange={setPurchaseGiftCardOpen}
        onPurchase={purchaseGiftCard}
      />

      <RedeemGiftCardDialog
        open={!!redeemGiftCardTarget}
        onOpenChange={(open) => { if (!open) setRedeemGiftCardTarget(null); }}
        giftCard={redeemGiftCardTarget}
        onRedeem={redeemGiftCard}
      />
    </div>
  );
};

const Packages = () => {
  return (
    <ResponsiveLayout
      title="Pacotes de Serviços"
      subtitle="Venda pacotes de sessões e vale-presentes"
      icon={Package}
    >
      <FeatureGuard
        planFeature="hasServicePackages"
        fallback={
          <div className="text-center py-8 sm:py-12">
            <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-plush-500 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Pacotes de Serviços
            </h2>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade está disponível apenas para assinantes Premium.
            </p>
          </div>
        }
      >
        <PackagesContent />
      </FeatureGuard>
    </ResponsiveLayout>
  );
};

export default Packages;
