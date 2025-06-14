
import { useState } from "react";

export const useInventoryDialogs = () => {
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'entrada' | 'saida'>('entrada');

  const openDialog = (dialogType: string) => {
    switch (dialogType) {
      case 'productForm':
        setIsNewProductOpen(true);
        break;
      case 'editProduct':
        setIsEditProductOpen(true);
        break;
      case 'transaction':
        setIsTransactionOpen(true);
        break;
    }
  };

  const closeDialog = (dialogType: string) => {
    switch (dialogType) {
      case 'productForm':
        setIsNewProductOpen(false);
        break;
      case 'editProduct':
        setIsEditProductOpen(false);
        break;
      case 'transaction':
        setIsTransactionOpen(false);
        break;
    }
  };

  return {
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    transactionType,
    setIsNewProductOpen,
    setIsEditProductOpen,
    setIsTransactionOpen,
    setTransactionType,
    openDialog,
    closeDialog,
  };
};
