export const useAnalyticsChartData = () => {
  const pipelineByAmountData = [
    { name: 'Corte', value: 35000, fill: '#8884d8' },
    { name: 'Coloração', value: 25000, fill: '#82ca9d' },
    { name: 'Tratamento', value: 18000, fill: '#ffc658' },
    { name: 'Manicure', value: 12000, fill: '#ff7c7c' },
    { name: 'Outros', value: 8000, fill: '#8dd1e1' }
  ];

  const pipelineByCountData = [
    { name: 'Corte', value: 145, fill: '#8884d8' },
    { name: 'Coloração', value: 89, fill: '#82ca9d' },
    { name: 'Tratamento', value: 67, fill: '#ffc658' },
    { name: 'Manicure', value: 156, fill: '#ff7c7c' },
    { name: 'Outros', value: 43, fill: '#8dd1e1' }
  ];

  const quarterlyData = [
    { quarter: 'Q4 2023', revenue: 89500 },
    { quarter: 'Q1 2024', revenue: 95200 },
    { quarter: 'Q2 2024', revenue: 108300 },
    { quarter: 'Q3 2024', revenue: 125600 }
  ];

  const monthlyRevenueData = [
    { month: 'Set 2023', revenue: 28500 },
    { month: 'Out 2023', revenue: 31200 },
    { month: 'Nov 2023', revenue: 29800 },
    { month: 'Dez 2023', revenue: 35600 },
    { month: 'Jan 2024', revenue: 32100 },
    { month: 'Fev 2024', revenue: 28900 },
    { month: 'Mar 2024', revenue: 34200 },
    { month: 'Abr 2024', revenue: 35800 },
    { month: 'Mai 2024', revenue: 38500 },
    { month: 'Jun 2024', revenue: 34000 },
    { month: 'Jul 2024', revenue: 41200 },
    { month: 'Ago 2024', revenue: 43100 },
    { month: 'Set 2024', revenue: 41300 }
  ];

  return {
    pipelineByAmountData,
    pipelineByCountData,
    quarterlyData,
    monthlyRevenueData
  };
};