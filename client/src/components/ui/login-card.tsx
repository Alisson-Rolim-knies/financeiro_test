import { useState, FormEvent, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CarIcon, EyeIcon, EyeOffIcon, ExclamationCircleIcon, ArrowRightIcon } from '@/assets/icons';

interface LoginCardProps {
  onLogin: (password: string) => boolean;
  showError: boolean;
  onErrorClear: () => void;
}

export function LoginCard({ onLogin, showError, onErrorClear }: LoginCardProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle showing error animation
  useEffect(() => {
    if (showError) {
      setIsShaking(true);
      setPassword('');
      setTimeout(() => {
        setIsShaking(false);
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
      }, 400);
    }
  }, [showError]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = onLogin(password);
    
    if (success) {
      // Apply success animation
      if (cardRef.current) {
        cardRef.current.classList.add('opacity-50');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Keep focus on password input after toggling
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }, 0);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (showError) {
      onErrorClear();
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo and Branding */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-[#ff6b00] text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CarIcon className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-[#ff6b00]">VisioCar</h1>
        <p className="text-[#333] mt-2">Sistema de Gestão Financeira</p>
      </div>

      {/* Login Card */}
      <Card 
        ref={cardRef}
        className={`transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}
      >
        <CardContent className="p-8">
          <h2 className="text-xl font-bold text-[#333] mb-6 text-center">Acesso ao Sistema</h2>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input Group */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#333]">
                Senha
              </label>
              <div className="relative">
                <Input 
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-6 border border-gray-300 rounded-lg"
                  placeholder="Digite sua senha" 
                  required
                />
                <Button 
                  type="button" 
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#ff6b00] transition-colors"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {showError && (
              <div className="bg-red-100 text-[#dc3545] p-3 rounded-lg text-sm flex items-start">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 mt-0.5 shrink-0" />
                <span>Senha incorreta. Por favor, tente novamente.</span>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-[#ff6b00] hover:bg-opacity-90 text-white py-6 h-auto rounded-lg font-medium transition-all transform active:scale-[0.98]"
            >
              Entrar
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="text-center mt-6 text-sm text-gray-500">
        <p>VisioCar v1.2.0 &copy; 2023</p>
      </div>

      {/* Add shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
