import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const abrirVisiocar = () => {
    window.location.href = '/visiocar.html';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4">
      <Card className="max-w-lg mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[#ff6b00]">VisioCar Dashboard</h1>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-[#333] hover:text-[#ff6b00]"
            >
              Logout
            </Button>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[#ff6b00] text-white rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/>
                <circle cx="6.5" cy="16.5" r="2.5" />
                <circle cx="16.5" cy="16.5" r="2.5" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-[#333] mb-2">Sistema de Gestão Financeira</h2>
          </div>
          
          <p className="mb-4 text-center text-gray-600">
            Clique no botão abaixo para acessar o sistema completo de gestão financeira da VisioCar.
          </p>
          
          <Button 
            onClick={abrirVisiocar}
            className="w-full bg-[#ff6b00] hover:bg-opacity-90 text-white flex items-center justify-center gap-2 py-6 h-auto"
          >
            <span>Acessar o Sistema</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
