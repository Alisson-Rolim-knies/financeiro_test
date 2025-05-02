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
          
          <p className="mb-4">
            Para acessar o aplicativo completo, abra o arquivo index.html original.
          </p>
          
          <Button 
            onClick={() => window.open('index.html', '_blank')}
            className="w-full bg-[#ff6b00] hover:bg-opacity-90 text-white"
          >
            Abrir Aplicação Principal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
