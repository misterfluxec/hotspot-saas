'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Wifi, Palette, CheckCircle, Sparkles, MapPin, Settings } from 'lucide-react';

interface OnboardingData {
  logo?: File;
  address: string;
  branchName: string;
  routerType: string;
  routerIp: string;
  template: string;
}

const routerTypes = [
  'MikroTik',
  'Ubiquiti UniFi',
  'Cisco Meraki',
  'TP-Link Omada',
  'Ruckus',
  'Otro'
];

const templates = [
  {
    id: 'aura',
    name: 'Aura',
    description: 'Diseño moderno y minimalista',
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
    preview: '/templates/aura.jpg'
  },
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'Energético y vibrante',
    colors: ['#EF4444', '#8B5CF6', '#EC4899'],
    preview: '/templates/pulse.jpg'
  },
  {
    id: 'vibe',
    name: 'Vibe',
    description: 'Elegante y corporativo',
    colors: ['#1F2937', '#4B5563', '#9CA3AF'],
    preview: '/templates/vibe.jpg'
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    address: '',
    branchName: '',
    routerType: '',
    routerIp: '',
    template: 'aura'
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Mostrar confetti al llegar al paso 4
  useEffect(() => {
    if (currentStep === 4) {
      setShowConfetti(true);
      // Ocultar confetti después de 5 segundos
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Aquí guardaríamos los datos del onboarding
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación
      
      // Redirigir al dashboard del cliente
      router.push('/cliente');
    } catch (error) {
      console.error('Error completando onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">1</span>
                </div>
                Identidad del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logo" className="text-zinc-300">
                  Logo del Negocio
                </Label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="w-24 h-24 bg-zinc-800 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-600">
                    <Upload className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div>
                    <Button variant="outline" className="border-zinc-700 text-zinc-300">
                      Subir Logo
                    </Button>
                    <p className="text-sm text-zinc-400 mt-2">
                      PNG o JPG, máximo 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-zinc-300">
                  Dirección Completa
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={onboardingData.address}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, address: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                  placeholder="Av. Principal #123, Ciudad, País"
                />
              </div>

              <div>
                <Label htmlFor="branchName" className="text-zinc-300">
                  Nombre de la Sucursal Principal
                </Label>
                <Input
                  id="branchName"
                  type="text"
                  value={onboardingData.branchName}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, branchName: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                  placeholder="Sucursal Central"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">2</span>
                </div>
                Infraestructura WiFi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="routerType" className="text-zinc-300">
                  Tipo de Router
                </Label>
                <Select value={onboardingData.routerType} onValueChange={(value) => setOnboardingData(prev => ({ ...prev, routerType: value }))}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecciona el tipo de router" />
                  </SelectTrigger>
                  <SelectContent>
                    {routerTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="routerIp" className="text-zinc-300">
                  IP del Router
                </Label>
                <Input
                  id="routerIp"
                  type="text"
                  value={onboardingData.routerIp}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, routerIp: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500"
                  placeholder="192.168.1.1"
                />
                <p className="text-sm text-zinc-400 mt-2">
                  Asegúrate que el router sea accesible desde esta red
                </p>
              </div>

              <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Conexión Automática</span>
                </div>
                <p className="text-sm text-zinc-400">
                  HotSpot SaaS se conectará automáticamente con tu router para gestionar el acceso WiFi.
                  No requiere configuración manual avanzada.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">3</span>
                </div>
                Diseño WiFi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    onClick={() => setOnboardingData(prev => ({ ...prev, template: template.id }))}
                    className={`cursor-pointer transition-all duration-300 ${
                      onboardingData.template === template.id
                        ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                        : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">
                          {template.name}
                        </CardTitle>
                        {onboardingData.template === template.id && (
                          <Badge className="bg-blue-600 text-white">
                            Seleccionado
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400">
                        {template.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-32 bg-zinc-900 rounded-lg flex items-center justify-center">
                          <Palette className="w-8 h-8 text-zinc-600" />
                        </div>
                        <div className="flex space-x-2">
                          {template.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: color }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                <p className="text-sm text-zinc-400">
                  <strong>Personalización:</strong> Podrás ajustar colores, textos y logos después de completar el onboarding.
                  Los templates son puntos de inicio profesionales.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10 relative overflow-hidden">
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="confetti-container">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="confetti-piece"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
                        animationDuration: `${3 + Math.random() * 2}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}
            
            <CardContent className="pt-8 relative z-10">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    ¡Todo Listo!
                  </h2>
                  <p className="text-zinc-400 text-lg">
                    Tu HotSpot WiFi está configurado y listo para usar
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <div className="text-2xl font-bold text-blue-400 mb-2">14 días</div>
                    <p className="text-zinc-400 text-sm">Período de prueba gratuito</p>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <div className="text-2xl font-bold text-green-400 mb-2">1 sucursal</div>
                    <p className="text-zinc-400 text-sm">Configurada y lista</p>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <div className="text-2xl font-bold text-purple-400 mb-2">24/7</div>
                    <p className="text-zinc-400 text-sm">Soporte técnico</p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                        <span>Configurando...</span>
                      </div>
                    ) : (
                      'Ir al Dashboard'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Configura tu HotSpot WiFi
          </h1>
          <p className="text-zinc-400">
            Completa estos pasos para tener tu sistema funcionando en minutos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Paso {currentStep} de {totalSteps}</span>
            <span className="text-sm text-zinc-400">{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-zinc-700 text-zinc-300"
          >
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!onboardingData.address || !onboardingData.branchName)) ||
                (currentStep === 2 && (!onboardingData.routerType || !onboardingData.routerIp))
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Siguiente
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Estilos CSS para el confetti (agregados como JSX para mantener todo en un archivo)
const ConfettiStyles = () => (
  <style jsx>{`
    .confetti-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }
    
    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      animation: confetti-fall linear forwards;
    }
    
    @keyframes confetti-fall {
      0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
      }
    }
  `}</style>
);
