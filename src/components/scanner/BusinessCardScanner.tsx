import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, FileImage, Loader2 } from 'lucide-react';

interface BusinessCardScannerProps {
  onDataExtracted: (data: any) => void;
}

export const BusinessCardScanner: React.FC<BusinessCardScannerProps> = ({ onDataExtracted }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractDataFromBusinessCard = async (imageFile: File) => {
    setIsScanning(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);

      // Simulate OCR processing - Replace with actual OCR API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data - Replace with actual OCR results
      const extractedData = {
        name: 'John Smith',
        email: 'john.smith@company.com',
        phone: '+1-555-123-4567',
        company: 'Tech Solutions Inc.',
        position: 'Senior Developer',
        address: '123 Business St, City, State 12345',
        website: 'www.techsolutions.com'
      };

      toast({
        title: "Success",
        description: "Business card data extracted successfully!",
      });

      onDataExtracted(extractedData);
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Error",
        description: "Failed to extract data from business card",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      extractDataFromBusinessCard(file);
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
      extractDataFromBusinessCard(file);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage size={20} />
          Business Card Scanner
        </CardTitle>
        <CardDescription>
          Upload or capture a business card image to extract contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewImage && (
          <div className="relative">
            <img 
              src={previewImage} 
              alt="Business card preview" 
              className="w-full max-w-sm mx-auto rounded-lg border shadow-sm"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Extracting data...</p>
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
              Upload from Device
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
              Camera Capture
            </Button>
          </div>
        </div>

        {isScanning && (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Processing image...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};