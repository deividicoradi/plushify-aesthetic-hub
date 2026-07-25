// Fonte única de receita/despesa/crescimento do negócio — antes disso, Painel
// Financeiro, Relatórios e Analytics Avançado recalculavam esse mesmo
// agregado (payments pagos + fechamentos de caixa - despesas, crescimento
// mês atual vs anterior) em 3 hooks paralelos, cada um com pequenas
// divergências de fonte. Este hook é o mesmo cálculo de useFinancialMetrics,
// só reexportado com o nome que todo consumidor novo deve usar.
export { useFinancialMetrics as useFinancialOverview } from './useFinancialMetrics';
export type { FinancialMetrics as FinancialOverview } from './useFinancialMetrics';
