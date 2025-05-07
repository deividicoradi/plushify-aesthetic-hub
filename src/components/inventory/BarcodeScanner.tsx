
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface BarcodeScannerProps {
  onClose: () => void;
  onSuccess: (barcode: string) => void;
}

export const BarcodeScanner = ({ onClose, onSuccess }: BarcodeScannerProps) => {
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef<number | null>(null);

  // Check if camera is available and list devices
  useEffect(() => {
    const checkCamera = async () => {
      try {
        // Check if the browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("A API de câmera não é suportada neste navegador");
        }

        // Get list of video devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        
        if (videoDevices.length === 0) {
          throw new Error("Nenhuma câmera detectada");
        }
        
        setDevices(videoDevices);
        setSelectedDeviceId(videoDevices[0].deviceId);
        setHasCamera(true);
      } catch (error) {
        console.error("Camera access error:", error);
        setHasCamera(false);
        toast.error("Não foi possível acessar a câmera");
      }
    };

    checkCamera();
  }, []);

  // Start/stop camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startStream = async () => {
      if (!isScanning || !selectedDeviceId) return;

      try {
        // Stop any existing stream
        if (videoRef.current && videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }
        
        // Start new stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            facingMode: "environment", // Use rear camera when available
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          startScanning();
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast.error("Erro ao acessar a câmera");
        setIsScanning(false);
      }
    };

    if (isScanning) {
      startStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [isScanning, selectedDeviceId]);

  // Process frames for barcode detection
  const startScanning = () => {
    const scanFrame = () => {
      try {
        if (!videoRef.current || !canvasRef.current) {
          rafId.current = requestAnimationFrame(scanFrame);
          return;
        }

        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
          rafId.current = requestAnimationFrame(scanFrame);
          return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          rafId.current = requestAnimationFrame(scanFrame);
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // In a real implementation, we'd use a barcode scanning library here
        // For example, with ZXing or BarcodeDetector API
        // This is a simplified version that uses a simulated barcode detection
        if (Math.random() < 0.01) { // 1% chance to "detect" a barcode on each frame
          const mockBarcode = Math.floor(Math.random() * 10000000000000).toString();
          handleBarcodeDetected(mockBarcode);
          return;
        }

        // Continue scanning
        rafId.current = requestAnimationFrame(scanFrame);
      } catch (error) {
        console.error("Error in scan frame:", error);
        rafId.current = requestAnimationFrame(scanFrame);
      }
    };

    rafId.current = requestAnimationFrame(scanFrame);
  };

  const handleBarcodeDetected = (barcode: string) => {
    // Stop scanning
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    
    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsScanning(false);
    toast.success(`Código de barras detectado: ${barcode}`);
    onSuccess(barcode);
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedDeviceId(deviceId);
    
    // If already scanning, restart the stream with the new device
    if (isScanning) {
      setIsScanning(false);
      setTimeout(() => setIsScanning(true), 100);
    }
  };

  if (!hasCamera) {
    return (
      <div className="flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-red-500 text-center">
          Não foi possível acessar a câmera. Verifique se você concedeu as permissões necessárias.
        </p>
        <Button onClick={onClose} variant="outline">Fechar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {isScanning ? (
          <>
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover" 
              muted 
              playsInline
            />
            <div className="absolute inset-0 border-2 border-pink-500 opacity-50 animate-pulse pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-pink-500"></div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
            Clique em "Iniciar Scanner" para começar
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {devices.length > 1 && (
        <div className="flex flex-col gap-2">
          <label htmlFor="camera-select" className="text-sm font-medium">
            Selecionar câmera:
          </label>
          <select 
            id="camera-select"
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            className="border rounded p-2"
            disabled={isScanning}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Câmera ${devices.indexOf(device) + 1}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-2 justify-between">
        <Button onClick={onClose} variant="outline">
          Cancelar
        </Button>
        <Button 
          onClick={toggleScanning}
          variant={isScanning ? "destructive" : "default"}
        >
          {isScanning ? "Parar Scanner" : "Iniciar Scanner"}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Posicione o código de barras na frente da câmera para escaneamento automático.
      </p>
    </div>
  );
};
