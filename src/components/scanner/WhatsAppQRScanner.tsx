import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, MessageSquare, Loader2 } from 'lucide-react';

interface WhatsAppQRScannerProps {
  onDataExtracted: (data: any) => void;
}

export const WhatsAppQRScanner: React.FC<WhatsAppQRScannerProps> = ({ onDataExtracted }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractPhoneFromQR = (qrText: string): string => {
    // Extract phone number from WhatsApp QR format
    // Format: https://wa.me/1234567890 or whatsapp://send?phone=1234567890
    const waLinkMatch = qrText.match(/wa\.me\/(\+?\d+)/);
    if (waLinkMatch) {
      const phone = waLinkMatch[1];
      return phone.startsWith('+') ? phone : `+${phone}`;
    }

    const whatsappMatch = qrText.match(/phone=(\+?\d+)/);
    if (whatsappMatch) {
      const phone = whatsappMatch[1];
      return phone.startsWith('+') ? phone : `+${phone}`;
    }

    // Direct phone number pattern
    const phoneMatch = qrText.match(/(\+?\d{10,15})/);
    if (phoneMatch) {
      const phone = phoneMatch[1];
      return phone.startsWith('+') ? phone : `+${phone}`;
    }

    return qrText;
  };

  const extractDataFromQR = async (imageFile: File) => {
    setIsScanning(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);

      // Simulate QR scanning - Replace with actual QR scanner library
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock QR data - Replace with actual QR scanner results
      const mockQRText = "https://wa.me/+1234567890";
      const phoneNumber = extractPhoneFromQR(mockQRText);
      
      const extractedData = {
        phone: phoneNumber,
        whatsappUrl: mockQRText,
        contactMethod: 'WhatsApp'
      };

      toast({
        title: "Success",
        description: "WhatsApp contact extracted successfully!",
      });

      onDataExtracted(extractedData);
    } catch (error) {
      console.error('QR Scan Error:', error);
      toast({
        title: "Error",
        description: "Failed to extract data from QR code",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      extractDataFromQR(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      extractDataFromQR(file);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare size={20} />
          WhatsApp QR Scanner
        </CardTitle>
        <CardDescription>
          Upload or capture a WhatsApp QR code to extract contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewImage && (
          <div className="relative">
            <img 
              src={previewImage} 
              alt="WhatsApp QR preview" 
              className="w-full max-w-sm mx-auto rounded-lg border shadow-sm"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Scanning QR code...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
            >
              <Upload size={24} />
              Upload QR Image
            </Button>
          </div>

          <div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col gap-2"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isScanning}
            >
              <Camera size={24} />
              Camera Scan
            </Button>
          </div>
        </div>

        {isScanning && (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Scanning QR code...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};