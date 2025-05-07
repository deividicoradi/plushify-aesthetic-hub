
import React, { useRef, useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Camera, ScanBarcode, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BarcodeScannerProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export const BarcodeScanner = ({ onClose, onSuccess }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const scanIntervalRef = useRef<number | null>(null);

  const startScanning = async () => {
    try {
      const constraints = { video: { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        startScanningLoop();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setHasCamera(false);
      toast.error("Não foi possível acessar a câmera do dispositivo. Verifique as permissões.");
    }
  };

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  const startScanningLoop = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
    }
    
    scanIntervalRef.current = window.setInterval(() => {
      captureFrame();
    }, 500) as unknown as number;
  };

  const captureFrame = async () => {
    if (videoRef.current && canvasRef.current && isScanning) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Make sure video is playing
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      try {
        // In a real implementation, we would use a barcode scanning library here
        // For this demo, we'll simulate finding a barcode
        simulateBarcodeScan();
      } catch (error) {
        console.error("Error processing frame:", error);
      }
    }
  };

  const simulateBarcodeScan = async () => {
    // For demonstration purposes, we'll simulate finding a barcode
    // In a real app, use a library like @zxing/library or quagga.js
    
    // Simulate random success (1 in 10 chance)
    if (Math.random() < 0.1) {
      // Generate a random barcode
      const mockBarcode = Math.floor(10000000000 + Math.random() * 90000000000).toString();
      handleBarcodeDetected(mockBarcode);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    stopScanning();
    
    toast.info(`Código de barras detectado: ${barcode}`);
    
    try {
      // Check if product with this barcode exists
      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingProduct) {
        toast.success(`Produto encontrado: ${existingProduct.name}`);
      } else {
        // Ask if user wants to create a new product with this barcode
        const shouldCreate = window.confirm(`Produto com código de barras ${barcode} não encontrado. Deseja cadastrar um novo produto?`);
        
        if (shouldCreate) {
          // Store barcode in sessionStorage
          sessionStorage.setItem('pendingBarcode', barcode);
          onClose();
          onSuccess();
        }
      }
    } catch (error: any) {
      toast.error("Erro ao verificar o produto: " + error.message);
    }
  };

  useEffect(() => {
    // Ask for camera permission when component mounts
    startScanning();
    
    // Clean up when component unmounts
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative w-full max-w-md">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed border-pink-400">
          {hasCamera ? (
            <>
              <video 
                ref={videoRef} 
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {isScanning ? (
                  <div className="h-48 w-48 border-4 border-pink-500 animate-pulse"></div>
                ) : (
                  <div className="text-center p-4 bg-black/50 rounded-lg text-white">
                    <p>Iniciando câmera...</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center p-4">
                <ScanBarcode className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="font-medium">Câmera não disponível</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Verifique se você concedeu permissões de câmera para este site.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-col gap-2 w-full max-w-md">
        <Button 
          onClick={() => isScanning ? stopScanning() : startScanning()} 
          className="gap-2"
          variant={isScanning ? "outline" : "default"}
        >
          <Camera className="h-4 w-4" />
          {isScanning ? "Pausar Scanner" : "Iniciar Scanner"}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground mt-2">
          Posicione o código de barras no centro da câmera para escaneá-lo automaticamente.
        </p>
      </div>
    </div>
  );
};
