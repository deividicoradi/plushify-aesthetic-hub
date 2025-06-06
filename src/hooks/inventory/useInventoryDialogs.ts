import { useState } from "react";

export const useInventoryDialogs = () => {
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'entrada' | 'saida'>('entrada');

  const dialogs = {
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    isHistoryOpen,
    isCategoriesOpen,
    isReportsOpen,
    isBarcodeScannerOpen,
    transactionType,
  };

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
      case 'history':
        setIsHistoryOpen(true);
        break;
      case 'categories':
        setIsCategoriesOpen(true);
        break;
      case 'reports':
        setIsReportsOpen(true);
        break;
      case 'barcodeScanner':
        setIsBarcodeScannerOpen(true);
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
      case 'history':
        setIsHistoryOpen(false);
        break;
      case 'categories':
        setIsCategoriesOpen(false);
        break;
      case 'reports':
        setIsReportsOpen(false);
        break;
      case 'barcodeScanner':
        setIsBarcodeScannerOpen(false);
        break;
    }
  };

  return {
    dialogs,
    openDialog,
    closeDialog,
    // Keep individual states for backward compatibility
    isNewProductOpen,
    isEditProductOpen,
    isTransactionOpen,
    isHistoryOpen,
    isCategoriesOpen,
    isReportsOpen,
    isBarcodeScannerOpen,
    transactionType,
    setIsNewProductOpen,
    setIsEditProductOpen,
    setIsTransactionOpen,
    setIsHistoryOpen,
    setIsCategoriesOpen,
    setIsReportsOpen,
    setIsBarcodeScannerOpen,
    setTransactionType,
  };
};
