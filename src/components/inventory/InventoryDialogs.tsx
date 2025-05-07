
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ProductForm } from "./ProductForm";
import { EditProductForm } from "./EditProductForm";
import { StockTransaction } from "./StockTransaction";
import { TransactionHistory } from "./TransactionHistory";
import { CategoryManagement } from "./CategoryManagement";
import { InventoryReports } from "./InventoryReports";

type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min_stock: number;
};

type InventoryDialogsProps = {
  isNewProductOpen: boolean;
  setIsNewProductOpen: (value: boolean) => void;
  isEditProductOpen: boolean;
  setIsEditProductOpen: (value: boolean) => void;
  isTransactionOpen: boolean;
  setIsTransactionOpen: (value: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (value: boolean) => void;
  isCategoriesOpen: boolean;
  setIsCategoriesOpen: (value: boolean) => void;
  isReportsOpen: boolean;
  setIsReportsOpen: (value: boolean) => void;
  selectedProduct: Product | null;
  transactionType: 'entrada' | 'saida';
  onSuccess: () => void;
};

export const InventoryDialogs = ({
  isNewProductOpen,
  setIsNewProductOpen,
  isEditProductOpen,
  setIsEditProductOpen,
  isTransactionOpen,
  setIsTransactionOpen,
  isHistoryOpen,
  setIsHistoryOpen,
  isCategoriesOpen,
  setIsCategoriesOpen,
  isReportsOpen,
  setIsReportsOpen,
  selectedProduct,
  transactionType,
  onSuccess
}: InventoryDialogsProps) => {
  return (
    <>
      <Sheet open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Novo Produto</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm onSuccess={() => {
              setIsNewProductOpen(false);
              onSuccess();
            }} />
          </div>
        </SheetContent>
      </Sheet>
      
      <Sheet open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar Produto</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedProduct && (
              <EditProductForm
                product={selectedProduct}
                onSuccess={() => {
                  setIsEditProductOpen(false);
                  onSuccess();
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {transactionType === 'entrada' ? 'Entrada' : 'Saída'} de Estoque - {selectedProduct?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {selectedProduct && (
              <StockTransaction
                productId={selectedProduct.id}
                type={transactionType}
                onSuccess={() => {
                  setIsTransactionOpen(false);
                  onSuccess();
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Transações</DialogTitle>
          </DialogHeader>
          <TransactionHistory />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciamento de Categorias</DialogTitle>
          </DialogHeader>
          <CategoryManagement />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isReportsOpen} onOpenChange={setIsReportsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relatórios de Estoque</DialogTitle>
          </DialogHeader>
          <InventoryReports />
        </DialogContent>
      </Dialog>
    </>
  );
};
