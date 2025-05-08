
import React from "react";
import { FileDown, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { Product } from "@/hooks/inventory/useProductsData";
import { convertToCSV, downloadFile } from "@/utils/fileUtils";

interface ExportHandlerProps {
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  allProducts: Product[];
}

export const ExportHandler: React.FC<ExportHandlerProps> = ({ 
  selectedProducts, 
  setSelectedProducts,
  allProducts 
}) => {
  const isAnySelected = selectedProducts.length > 0;

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = selectedProducts.length > 0 ? selectedProducts : allProducts;
    
    try {
      if (dataToExport.length === 0) {
        toast.error("Não há dados para exportar");
        return;
      }

      let content = '';
      let fileName = `produtos-${new Date().toISOString().split('T')[0]}`;
      let contentType = '';

      if (format === 'csv') {
        content = convertToCSV(dataToExport);
        fileName += '.csv';
        contentType = 'text/csv';
      } else {
        content = JSON.stringify(dataToExport, null, 2);
        fileName += '.json';
        contentType = 'application/json';
      }

      downloadFile(content, fileName, contentType);
      toast.success(`Exportação para ${format.toUpperCase()} concluída!`);
      
      // Clear selection after export
      if (isAnySelected) {
        setSelectedProducts([]);
      }
    } catch (error: any) {
      toast.error(`Erro ao exportar: ${error.message}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isAnySelected 
              ? `Exportar (${selectedProducts.length})` 
              : 'Exportar Todos'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar como CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="w-4 h-4 mr-2" />
          Exportar como JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
