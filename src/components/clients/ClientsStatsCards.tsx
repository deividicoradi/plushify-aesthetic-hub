
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface ClientsStatsCardsProps {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  loading: boolean;
}

const ClientsStatsCards: React.FC<ClientsStatsCardsProps> = ({
  totalClients,
  activeClients,
  newThisMonth,
  loading,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Clientes</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalClients.toLocaleString()}</p>
            )}
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 p-6 rounded-xl border border-green-200/50 dark:border-green-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Clientes Ativos</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activeClients.toLocaleString()}</p>
            )}
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 p-6 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Novos Este Mês</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">+{newThisMonth}</p>
            )}
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <Plus className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsStatsCards;
