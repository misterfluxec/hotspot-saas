'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, Sparkles, Upload, Download } from 'lucide-react';

interface PortalConfig {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  title: string;
  subtitle: string;
  welcomeMessage: string;
  logoUrl?: string;
  backgroundImage?: string;
}

const defaultConfig: PortalConfig = {
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  backgroundColor: '#1F2937',
  textColor: '#FFFFFF',
  title: 'Bienvenido a nuestro WiFi',
  subtitle: 'Conéctate rápidamente y disfruta de internet',
  welcomeMessage: 'Por favor ingresa tus datos para acceder a la red WiFi',
};

const colorPresets = [
  { name: 'Azul Profesional', primary: '#3B82F6', secondary: '#1E40AF', background: '#1F2937' },
  { name: 'Verde Moderno', primary: '#10B981', secondary: '#059669', background: '#1F2937' },
  { name: 'Púrpura Elegante', primary: '#8B5CF6', secondary: '#7C3AED', background: '#1F2937' },
  { name: 'Naranja Vibrante', primary: '#F97316', secondary: '#EA580C', background: '#1F2937' },
];

export default function PortalEditor() {
  const [config, setConfig] = useState<PortalConfig>(defaultConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessType, setBusinessType] = useState('restaurante');

  const handleColorChange = (field: keyof PortalConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTextChange = (field: keyof PortalConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.background,
    }));
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessType }),
      });

      if (response.ok) {
        const suggestions = await response.json();
        
        // Aplicar sugerencias de IA
        setConfig(prev => ({
          ...prev,
          title: suggestions.title || prev.title,
          subtitle: suggestions.subtitle || prev.subtitle,
          welcomeMessage: suggestions.welcomeMessage || prev.welcomeMessage,
          primaryColor: suggestions.primaryColor || prev.primaryColor,
          secondaryColor: suggestions.secondaryColor || prev.secondaryColor,
        }));
      }
    } catch (error) {
      console.error('Error generando con IA:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/portal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert('Configuración guardada exitosamente');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Editor de Portal WiFi</h1>
        <p className="text-zinc-400">Personaliza la experiencia de conexión de tus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controles de Personalización */}
        <div className="space-y-6">
          {/* IA Assistant */}
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                Asistente de IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessType" className="text-zinc-300">
                  Tipo de Negocio
                </Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="cafeteria">Cafetería</SelectItem>
                    <SelectItem value="tienda">Tienda</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="gimnasio">Gimnasio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generando...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sugerir con IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Colores */}
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Colores y Diseño
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor" className="text-zinc-300">
                    Color Primario
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="h-10 w-20 bg-zinc-800/50 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="flex-1 bg-zinc-800/50 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="secondaryColor" className="text-zinc-300">
                    Color Secundario
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="h-10 w-20 bg-zinc-800/50 border-zinc-700"
                    />
                    <Input
                      type="text"
                      value={config.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="flex-1 bg-zinc-800/50 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor" className="text-zinc-300">
                  Color de Fondo
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="h-10 w-20 bg-zinc-800/50 border-zinc-700"
                  />
                  <Input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1 bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Presets */}
              <div>
                <Label className="text-zinc-300">Paletas Predefinidas</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {colorPresets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => applyPreset(preset)}
                      className="border-zinc-700 text-zinc-300 hover:border-zinc-600"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          ></div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          ></div>
                        </div>
                        <span className="text-xs">{preset.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Textos */}
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white">Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-zinc-300">
                  Título Principal
                </Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => handleTextChange('title', e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="subtitle" className="text-zinc-300">
                  Subtítulo
                </Label>
                <Input
                  id="subtitle"
                  value={config.subtitle}
                  onChange={(e) => handleTextChange('subtitle', e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="welcomeMessage" className="text-zinc-300">
                  Mensaje de Bienvenida
                </Label>
                <textarea
                  id="welcomeMessage"
                  value={config.welcomeMessage}
                  onChange={(e) => handleTextChange('welcomeMessage', e.target.value)}
                  className="w-full h-20 bg-zinc-800/50 border-zinc-700 text-white rounded-md p-3 resize-none"
                />
              </div>

              <div>
                <Label htmlFor="logo" className="text-zinc-300">
                  Logo
                </Label>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Logo
                  </Button>
                  <span className="text-sm text-zinc-400">PNG o JPG, máximo 2MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview en Tiempo Real */}
        <div className="lg:sticky lg:top-6">
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Vista Previa
                </div>
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  Tiempo Real
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-zinc-700 rounded-lg overflow-hidden">
                {/* Mobile Preview Frame */}
                <div className="bg-zinc-800 p-4">
                  <div className="bg-white rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
                    {/* Portal Preview */}
                    <div
                      className="relative p-8 flex flex-col items-center justify-center text-center"
                      style={{
                        backgroundColor: config.backgroundColor,
                        color: config.textColor,
                        minHeight: '500px'
                      }}
                    >
                      {/* Logo placeholder */}
                      <div className="w-20 h-20 bg-zinc-300 rounded-lg mb-6 flex items-center justify-center">
                        <span className="text-zinc-600 text-2xl font-bold">LOGO</span>
                      </div>

                      {/* Title */}
                      <h1
                        className="text-3xl font-bold mb-4"
                        style={{ color: config.primaryColor }}
                      >
                        {config.title}
                      </h1>

                      {/* Subtitle */}
                      <p className="text-lg mb-8 opacity-90">
                        {config.subtitle}
                      </p>

                      {/* Welcome Message */}
                      <p className="text-sm mb-8 opacity-80 max-w-md">
                        {config.welcomeMessage}
                      </p>

                      {/* Form placeholder */}
                      <div className="w-full max-w-sm space-y-4">
                        <input
                          type="email"
                          placeholder="Correo electrónico"
                          className="w-full px-4 py-3 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500"
                        />
                        <input
                          type="password"
                          placeholder="Contraseña WiFi"
                          className="w-full px-4 py-3 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500"
                        />
                        <button
                          className="w-full py-3 rounded-lg text-white font-medium transition-colors"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          Conectarse
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 text-xs opacity-60">
                        Powered by HotSpot SaaS
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={saveConfig}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Guardar Cambios
                </Button>
                <Button variant="outline" className="border-zinc-700 text-zinc-300">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
