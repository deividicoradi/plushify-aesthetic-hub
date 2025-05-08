
import React, { useState } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Product } from "@/hooks/useInventory";
import { convertToCSV, downloadFile } from "@/utils/fileUtils";

interface ExportHandlerProps {
  selectedProducts: Product[];
  setSelectedProducts: (products: Product[]) => void;
  allProducts: Product[];
}

export const ExportHandler = ({ 
  selectedProducts, 
  setSelectedProducts, 
  allProducts 
}: ExportHandlerProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // If products are selected, export only those. Otherwise, export all products.
      const productsToExport = selectedProducts.length > 0 ? selectedProducts : allProducts;
      
      // Create a simplified version without internal fields
      const cleanedProducts = productsToExport.map(({ id, name, category, stock, min_stock, barcode }) => ({
        id, name, category, stock, min_stock, barcode
      }));
      
      // Create CSV and JSON data
      const jsonData = JSON.stringify(cleanedProducts, null, 2);
      const csvData = convertToCSV(cleanedProducts);
      
      // Prompt user for format
      const format = window.confirm(
        'Escolha o formato de exportação:\nOK para JSON, Cancelar para CSV'
      ) ? 'json' : 'csv';
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `inventario-${timestamp}.${format}`;
      
      if (format === 'json') {
        downloadFile(jsonData, fileName, 'application/json');
      } else {
        downloadFile(csvData, fileName, 'text/csv');
      }
      
      toast.success(`${productsToExport.length} produtos exportados com sucesso!`);
      
      // Clear selection after export if any were selected
      if (selectedProducts.length > 0) {
        setSelectedProducts([]);
      }
    } catch (error: any) {
      toast.error(`Erro ao exportar: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="gap-2" 
      onClick={handleExport} 
      disabled={isExporting}
    >
      <FileUp className="w-4 h-4" />
      Exportar
    </Button>
  );
};
