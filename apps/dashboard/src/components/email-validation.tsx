'use client';

import { useState, useEffect } from 'react';

interface EmailValidationProps {
  email: string;
  onValidationChange?: (isValid: boolean) => void;
}

export function EmailValidation({ email, onValidationChange }: EmailValidationProps) {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isValid: false, message: '', type: 'info' });

  useEffect(() => {
    if (!email) {
      setValidation({ isValid: false, message: '', type: 'info' });
      onValidationChange?.(false);
      return;
    }

    const result = validateEmail(email);
    setValidation(result);
    onValidationChange?.(result.isValid);
  }, [email, onValidationChange]);

  if (!validation.message) return null;

  return (
    <div className={`text-xs ${
      validation.type === 'success' ? 'text-green-400' :
      validation.type === 'error' ? 'text-red-400' :
      'text-zinc-400'
    }`}>
      {validation.message}
    </div>
  );
}

function validateEmail(email: string): {
  isValid: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
} {
  // Formato básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Formato de email inválido',
      type: 'error'
    };
  }

  // Dominios comunes válidos
  const validDomains = [
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
    'empresa.com', 'business.com', 'corporation.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return {
      isValid: false,
      message: 'Dominio no encontrado',
      type: 'error'
    };
  }

  // Verificar caracteres especiales comunes en errores
  if (email.includes('..') || email.includes('.@') || email.includes('@.')) {
    return {
      isValid: false,
      message: 'Formato de email incorrecto',
      type: 'error'
    };
  }

  // Verificar longitud razonable
  if (email.length > 254) {
    return {
      isValid: false,
      message: 'Email demasiado largo',
      type: 'error'
    };
  }

  return {
    isValid: true,
    message: 'Email válido',
    type: 'success'
  };
}
