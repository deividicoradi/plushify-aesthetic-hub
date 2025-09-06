import React from 'react';
import { Calendar, CalendarPlus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppointmentsEmptyStateProps {
  searchQuery?: string;
  hasFilters?: boolean;
  onCreateNew?: () => void;
  onClearFilters?: () => void;
}

export const AppointmentsEmptyState = ({ 
  searchQuery, 
  hasFilters, 
  onCreateNew,
  onClearFilters 
}: AppointmentsEmptyStateProps) => {
  const isSearchOrFilter = searchQuery || hasFilters;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-full blur-xl"></div>
        <div className="relative bg-white dark:bg-gray-800 p-6 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          {isSearchOrFilter ? (
            <Search className="w-12 h-12 text-gray-400" />
          ) : (
            <CalendarPlus className="w-12 h-12 text-blue-500" />
          )}
        </div>
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {isSearchOrFilter ? 'Nenhum resultado encontrado' : 'Sua agenda está vazia'}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          {isSearchOrFilter 
            ? 'Não encontramos agendamentos que correspondam aos seus critérios de busca ou filtros aplicados.'
            : 'Comece criando seu primeiro agendamento e organize sua agenda de forma eficiente.'
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isSearchOrFilter ? (
            <>
              {onClearFilters && (
                <Button
                  variant="outline"
                  onClick={onClearFilters}
                  className="gap-2 transition-all duration-200 hover:scale-105"
                >
                  <Filter className="w-4 h-4" />
                  Limpar Filtros
                </Button>
              )}
              {onCreateNew && (
                <Button
                  onClick={onCreateNew}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Novo Agendamento
                </Button>
              )}
            </>
          ) : (
            onCreateNew && (
              <Button
                onClick={onCreateNew}
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <CalendarPlus className="w-5 h-5" />
                Criar Primeiro Agendamento
              </Button>
            )
          )}
        </div>
      </div>

      {!isSearchOrFilter && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Organize</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Gerencie todos os seus compromissos</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-100 dark:border-green-900/50">
            <CalendarPlus className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Agende</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Crie novos agendamentos facilmente</p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg border border-purple-100 dark:border-purple-900/50">
            <Search className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Encontre</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Busque e filtre rapidamente</p>
          </div>
        </div>
      )}
    </div>
  );
};