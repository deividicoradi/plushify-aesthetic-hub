
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { exportFinancialData, ExportData, ExportOptions } from '@/utils/exportUtils';
import { generateFinancialReport } from '@/utils/pdfReports';

interface ExportButtonsProps {
  reportData: ExportData;
  isLoading?: boolean;
}

export const ExportButtons = ({ reportData, isLoading = false }: ExportButtonsProps) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includePayments: true,
    includeExpenses: true,
    includeInstallments: true,
    includeCashClosures: false,
    groupByCategory: true,
    groupByMethod: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!reportData) {
      toast({
        title: "Erro",
        description: "Nenhum dado disponível para exportação",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      if (exportOptions.format === 'pdf') {
        await generateFinancialReport(reportData, 'consolidado');
      } else {
        await exportFinancialData(reportData, exportOptions);
      }
      
      toast({
        title: "Sucesso!",
        description: `Relatório ${exportOptions.format.toUpperCase()} gerado com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getFormatIcon = () => {
    switch (exportOptions.format) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4" />;
      case 'csv': return <File className="w-4 h-4" />;
      default: return <Download className="w-4 h-4" />;
    }
  };

  const hasData = reportData && (
    (exportOptions.includePayments && reportData.payments.length > 0) ||
    (exportOptions.includeExpenses && reportData.expenses.length > 0) ||
    (exportOptions.includeInstallments && reportData.installments.length > 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar Relatórios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formato de Exportação */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Formato</label>
          <Select 
            value={exportOptions.format} 
            onValueChange={(value: any) => updateOption('format', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel (.xlsx)
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4" />
                  CSV (.csv)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF (.pdf)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dados a incluir */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Dados a Incluir</label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-payments"
                checked={exportOptions.includePayments}
                onCheckedChange={(checked) => updateOption('includePayments', checked)}
              />
              <label htmlFor="include-payments" className="text-sm">
                Pagamentos ({reportData?.payments.length || 0})
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-expenses"
                checked={exportOptions.includeExpenses}
                onCheckedChange={(checked) => updateOption('includeExpenses', checked)}
              />
              <label htmlFor="include-expenses" className="text-sm">
                Despesas ({reportData?.expenses.length || 0})
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-installments"
                checked={exportOptions.includeInstallments}
                onCheckedChange={(checked) => updateOption('includeInstallments', checked)}
              />
              <label htmlFor="include-installments" className="text-sm">
                Parcelamentos ({reportData?.installments.length || 0})
              </label>
            </div>
          </div>
        </div>

        {/* Opções de agrupamento (apenas para Excel/CSV) */}
        {exportOptions.format !== 'pdf' && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Análises Adicionais</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="group-by-category"
                  checked={exportOptions.groupByCategory}
                  onCheckedChange={(checked) => updateOption('groupByCategory', checked)}
                />
                <label htmlFor="group-by-category" className="text-sm">
                  Análise por Categoria
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="group-by-method"
                  checked={exportOptions.groupByMethod}
                  onCheckedChange={(checked) => updateOption('groupByMethod', checked)}
                />
                <label htmlFor="group-by-method" className="text-sm">
                  Análise por Método de Pagamento
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Exportação */}
        <div className="pt-4">
          <Button 
            onClick={handleExport}
            disabled={isExporting || isLoading || !hasData}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>
                <Download className="w-4 h-4 mr-2 animate-spin" />
                Gerando {exportOptions.format.toUpperCase()}...
              </>
            ) : (
              <>
                {getFormatIcon()}
                <span className="ml-2">
                  Exportar {exportOptions.format.toUpperCase()}
                </span>
              </>
            )}
          </Button>
          
          {!hasData && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Selecione pelo menos um tipo de dado para exportar
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
