
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import WhatsAppQRScanner from "@/components/communication/WhatsAppQRScanner";

const WhatsAppConnection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/communication')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-serif">Conectar WhatsApp</h1>
            <p className="text-muted-foreground">
              Configure a conexão do seu WhatsApp para envio automático de mensagens
            </p>
          </div>
        </div>

        {/* WhatsApp QR Scanner */}
        <WhatsAppQRScanner />
      </div>
    </div>
  );
};

export default WhatsAppConnection;
