'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SimpleCaptcha({ onVerify }: { onVerify: (verified: boolean) => void }) {
  const [captcha, setCaptcha] = useState({ question: '', answer: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer = 0;
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '×':
        answer = num1 * num2;
        break;
    }

    setCaptcha({
      question: `${num1} ${operation} ${num2} = ?`,
      answer: answer.toString()
    });
    setUserAnswer('');
    setIsVerified(false);
    onVerify(false);
  };

  const handleVerify = () => {
    const verified = userAnswer === captcha.answer;
    setIsVerified(verified);
    onVerify(verified);
    
    if (!verified) {
      setTimeout(() => {
        setUserAnswer('');
      }, 1000);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha" className="text-zinc-300">
        Verificación de seguridad
      </Label>
      <div className="flex items-center gap-2">
        <div className="bg-zinc-800 px-3 py-2 rounded text-white font-mono">
          {captcha.question}
        </div>
        <Input
          id="captcha"
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Respuesta"
          className="bg-zinc-900 border-zinc-800 text-white h-12 px-4 flex-1"
          maxLength={3}
        />
        <Button
          type="button"
          onClick={handleVerify}
          disabled={!userAnswer || isVerified}
          className="bg-zinc-700 hover:bg-zinc-600 text-white h-12 px-4"
        >
          Verificar
        </Button>
        <Button
          type="button"
          onClick={generateCaptcha}
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-12 px-4"
        >
          ↻
        </Button>
      </div>
      {isVerified && (
        <p className="text-xs text-green-400">✓ Verificación correcta</p>
      )}
      {userAnswer && !isVerified && userAnswer !== captcha.answer && (
        <p className="text-xs text-red-400">Respuesta incorrecta</p>
      )}
    </div>
  );
}
