
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { generateFinancialReport } from '@/utils/pdfReports';
import { ReportData } from '@/utils/reports/types';

interface GenerateReportButtonProps {
  reportData: ReportData | undefined;
  reportType: string;
  isLoading: boolean;
}

export const GenerateReportButton = ({ 
  reportData, 
  reportType, 
  isLoading 
}: GenerateReportButtonProps) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateReport = async () => {
    console.log('🔄 Iniciando geração de relatório PDF...');
    console.log('📊 Dados do relatório:', reportData);
    console.log('📄 Tipo de relatório:', reportType);
    
    if (!reportData) {
      console.error('❌ Nenhum dado de relatório disponível');
      toast({
        title: "Erro",
        description: "Nenhum dado disponível para gerar o relatório",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('📝 Chamando função generateFinancialReport...');
      await generateFinancialReport(reportData, reportType);
      console.log('✅ PDF gerado com sucesso!');
      toast({
        title: "Sucesso!",
        description: "Relatório PDF gerado com sucesso.",
      });
    } catch (error: any) {
      console.error('❌ Erro ao gerar relatório PDF:', error);
      console.error('❌ Stack trace:', error.stack);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-center">
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || isLoading || !reportData}
            className="flex items-center gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Download className="w-4 h-4 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Gerar Relatório PDF
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
