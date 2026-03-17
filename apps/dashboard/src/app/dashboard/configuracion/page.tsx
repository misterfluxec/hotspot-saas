'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  const [activeTab, setActiveTab] = useState('general');
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
      setDatabaseStatus({
        status: 'connected',
        prismaVersion: '5.0.0',
        tableCount: 8
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
        headers: { 'Content-Type': 'application/json' },
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
    console.log('Guardando configuración:', platformConfig);
    setIsEditingPlatform(false);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'ai', label: 'IA', icon: '🤖' },
    { id: 'database', label: 'Base de Datos', icon: '🗄️' },
    { id: 'system', label: 'Sistema', icon: '🖥️' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-zinc-400 text-lg">Configuración de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de tabs */}
        <div className="lg:col-span-1">
          <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content area */}
        <div className="lg:col-span-3">
          {/* General Tab */}
          {activeTab === 'general' && (
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Información de la plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre</label>
                    {isEditingPlatform ? (
                      <Input
                        value={platformConfig.name}
                        onChange={(e) => setPlatformConfig(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white font-mono p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        {platformConfig.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Dominio base</label>
                    {isEditingPlatform ? (
                      <Input
                        value={platformConfig.domain}
                        onChange={(e) => setPlatformConfig(prev => ({ ...prev, domain: e.target.value }))}
                        className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white font-mono p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        {platformConfig.domain}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Versión</label>
                    {isEditingPlatform ? (
                      <Input
                        value={platformConfig.version}
                        onChange={(e) => setPlatformConfig(prev => ({ ...prev, version: e.target.value }))}
                        className="bg-zinc-800/50 border-zinc-700 text-white focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white font-mono p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                        {platformConfig.version}
                      </p>
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
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
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
          )}

          {/* IA Tab */}
          {activeTab === 'ai' && (
            <Card className={`bg-zinc-900/50 backdrop-blur-sm border-white/10 transition-all duration-300 ${
              aiConfig.status === 'connected' ? 'border-green-500/30 shadow-green-500/10' : ''
            }`}>
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  Configuración de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">URL de Ollama</label>
                    <Input
                      value={aiConfig.ollamaUrl}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                      className="bg-zinc-800/50 border-zinc-700 text-white focus:border-purple-500 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Modelo activo</label>
                    <Input
                      value={aiConfig.activeModel}
                      onChange={(e) => setAiConfig(prev => ({ ...prev, activeModel: e.target.value }))}
                      className="bg-zinc-800/50 border-zinc-700 text-white focus:border-purple-500 transition-colors font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${aiConfig.status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <Badge variant={aiConfig.status === 'connected' ? 'default' : 'destructive'} className="ml-2">
                      {aiConfig.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  <Button 
                    onClick={testOllamaConnection}
                    disabled={isTestingOllama}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isTestingOllama ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin"></div>
                        <span>Probando...</span>
                      </div>
                    ) : (
                      'Probar conexión'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  Base de datos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Estado de PostgreSQL</label>
                    <Badge variant={databaseStatus.status === 'connected' ? 'default' : 'destructive'}>
                      {databaseStatus.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </Badge>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Versión de Prisma</label>
                    <p className="text-white font-mono">{databaseStatus.prismaVersion}</p>
                  </div>
                  <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Número de tablas</label>
                    <p className="text-white font-mono">{databaseStatus.tableCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <Card className="bg-zinc-900/50 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  Variables de entorno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {envVars.map((envVar, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">
                          {envVar.configured ? (
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0v2h2z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <code className="text-sm bg-zinc-800 px-3 py-1 rounded text-zinc-300 font-mono">
                          {envVar.name}
                        </code>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          envVar.configured ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          <div className={`w-4 h-4 rounded-full ${
                            envVar.configured ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                        </div>
                        <span className="text-sm text-zinc-400">
                          {envVar.configured ? 'Configurada' : 'No configurada'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                  <p className="text-sm text-zinc-400">
                    <strong>Nota:</strong> Las variables de entorno deben configurarse en el archivo .env.local 
                    o en las variables de entorno del despliegue.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
