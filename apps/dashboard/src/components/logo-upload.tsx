'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploadProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string | null) => void;
}

export function LogoUpload({ currentLogo, onLogoChange }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen (JPG, PNG, GIF)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no puede superar los 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Simular upload (en producción iría a un servicio como Cloudinary, S3, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar URL simulada
      const mockUrl = `https://picsum.photos/seed/${Date.now()}/200/200.jpg`;
      onLogoChange(mockUrl);
      
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error al subir el logo. Por favor intenta nuevamente.');
      setPreview(currentLogo || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onLogoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Logo del Negocio</h3>
            <p className="text-sm text-zinc-400">
              Sube el logo de tu negocio. Formatos recomendados: JPG, PNG, GIF. Máximo 5MB.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {preview ? (
              <div className="relative group">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                  <img
                    src={preview}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-zinc-600" />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="logo-upload"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Subiendo...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {preview ? 'Cambiar Logo' : 'Subir Logo'}
                  </div>
                )}
              </Button>

              {preview && (
                <p className="text-xs text-green-400">
                  ✓ Logo subido correctamente
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
