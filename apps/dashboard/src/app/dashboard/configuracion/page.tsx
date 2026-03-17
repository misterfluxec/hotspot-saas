'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PlatformConfig {
  name: string;
  domain: string;
  version: string;
}

interface AIConfig {
  ollamaUrl: string;
  activeModel: string;
  status: 'connected' | 'disconnected';
}

interface DatabaseStatus {
  status: 'connected' | 'disconnected';
  prismaVersion: string;
  tableCount: number;
}

interface EnvVar {
  name: string;
  configured: boolean;
}

export default function ConfiguracionPage() {
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>({
    name: 'HotSpot SaaS',
    domain: 'labodegaec.com',
    version: '1.0.0'
  });

  const [aiConfig, setAiConfig] = useState<AIConfig>({
    ollamaUrl: 'http://192.168.254.50:11434',
    activeModel: 'phi3:latest',
    status: 'disconnected'
  });

  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    status: 'disconnected',
    prismaVersion: '5.0.0',
    tableCount: 0
  });

  const [envVars, setEnvVars] = useState<EnvVar[]>([
    { name: 'JWT_SECRET', configured: false },
    { name: 'DATABASE_URL', configured: false },
    { name: 'NEXTAUTH_URL', configured: false },
    { name: 'OLLAMA_URL', configured: false }
  ]);

  const [isEditingPlatform, setIsEditingPlatform] = useState(false);
  const [isTestingOllama, setIsTestingOllama] = useState(false);

  // Verificar variables de entorno al cargar
  useEffect(() => {
    checkEnvironmentVariables();
    checkDatabaseConnection();
    testOllamaConnection();
  }, []);

  const checkEnvironmentVariables = () => {
    const updatedEnvVars = envVars.map(envVar => ({
      ...envVar,
      configured: !!process.env[envVar.name] || !!localStorage.getItem(envVar.name)
    }));
    setEnvVars(updatedEnvVars);
  };

  const checkDatabaseConnection = async () => {
    try {
      // Simular verificación de base de datos
      setDatabaseStatus({
        status: 'connected',
        prismaVersion: '5.0.0',
        tableCount: 8 // Número aproximado de tablas
      });
    } catch (error) {
      setDatabaseStatus(prev => ({ ...prev, status: 'disconnected' }));
    }
  };

  const testOllamaConnection = async () => {
    setIsTestingOllama(true);
    try {
      const response = await fetch(`${aiConfig.ollamaUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAiConfig(prev => ({ 
          ...prev, 
          status: 'connected',
          activeModel: data.models?.[0]?.name || 'phi3:latest'
        }));
      } else {
        setAiConfig(prev => ({ ...prev, status: 'disconnected' }));
      }
    } catch (error) {
      setAiConfig(prev => ({ ...prev, status: 'disconnected' }));
    } finally {
      setIsTestingOllama(false);
    }
  };

  const savePlatformConfig = () => {
    // Aquí guardarías la configuración en tu backend
    console.log('Guardando configuración:', platformConfig);
    setIsEditingPlatform(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="text-slate-400 mt-2">Configuración de la plataforma</p>
      </div>

      {/* Información de la plataforma */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Información de la plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Nombre
              </label>
              {isEditingPlatform ? (
                <Input
                  value={platformConfig.name}
                  onChange={(e) => setPlatformConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              ) : (
                <p className="text-white">{platformConfig.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Dominio base
              </label>
              {isEditingPlatform ? (
                <Input
                  value={platformConfig.domain}
                  onChange={(e) => setPlatformConfig(prev => ({ ...prev, domain: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              ) : (
                <p className="text-white">{platformConfig.domain}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Versión
              </label>
              {isEditingPlatform ? (
                <Input
                  value={platformConfig.version}
                  onChange={(e) => setPlatformConfig(prev => ({ ...prev, version: e.target.value }))}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              ) : (
                <p className="text-white">{platformConfig.version}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            {isEditingPlatform ? (
              <>
                <Button onClick={savePlatformConfig} className="bg-blue-600 hover:bg-blue-700">
                  Guardar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingPlatform(false)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditingPlatform(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Editar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuración de IA */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Configuración de IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                URL de Ollama
              </label>
              <Input
                value={aiConfig.ollamaUrl}
                onChange={(e) => setAiConfig(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Modelo activo
              </label>
              <Input
                value={aiConfig.activeModel}
                onChange={(e) => setAiConfig(prev => ({ ...prev, activeModel: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant={aiConfig.status === 'connected' ? 'default' : 'destructive'}>
                {aiConfig.status === 'connected' ? 'Conectado' : 'Desconectado'}
              </Badge>
              <span className="text-sm text-slate-400">
                {aiConfig.status === 'connected' 
                  ? 'Conexión exitosa con Ollama' 
                  : 'No se puede conectar con Ollama'}
              </span>
            </div>
            <Button 
              onClick={testOllamaConnection}
              disabled={isTestingOllama}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTestingOllama ? 'Probando...' : 'Probar conexión'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Base de datos */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Base de datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Estado de PostgreSQL
              </label>
              <Badge variant={databaseStatus.status === 'connected' ? 'default' : 'destructive'}>
                {databaseStatus.status === 'connected' ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Versión de Prisma
              </label>
              <p className="text-white">{databaseStatus.prismaVersion}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Número de tablas
              </label>
              <p className="text-white">{databaseStatus.tableCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variables de entorno */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">Variables de entorno</CardTitle>
          <p className="text-sm text-slate-400">Estado de configuración requerida</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {envVars.map((envVar, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <code className="text-sm bg-slate-800 px-2 py-1 rounded text-slate-300">
                    {envVar.name}
                  </code>
                  <Badge variant={envVar.configured ? 'default' : 'destructive'}>
                    {envVar.configured ? 'Configurada' : 'No configurada'}
                  </Badge>
                </div>
                <div className="text-sm text-slate-400">
                  {envVar.configured ? '✓ Variable detectada' : '✗ Variable faltante'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-400">
              <strong>Nota:</strong> Las variables de entorno deben configurarse en el archivo .env.local 
              o en las variables de entorno del despliegue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
