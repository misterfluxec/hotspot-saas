'use client';

export function PasswordStrength({ password }: { password: string }) {
  const strength = calculateStrength(password);
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength 
                ? strength <= 2 ? 'bg-red-500' 
                : strength <= 3 ? 'bg-yellow-500' 
                : 'bg-green-500'
                : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-400">
        {getStrengthText(strength)}
      </p>
    </div>
  );
}

function calculateStrength(password: string): number {
  let strength = 0;
  
  // Longitud
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Complejidad
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  return Math.min(4, Math.floor(strength * 0.8));
}

function getStrengthText(strength: number): string {
  switch (strength) {
    case 0:
    case 1:
      return 'Contraseña muy débil';
    case 2:
      return 'Contraseña débil';
    case 3:
      return 'Contraseña buena';
    case 4:
      return 'Contraseña excelente';
    default:
      return '';
  }
}
