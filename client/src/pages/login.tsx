import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoginCard } from '@/components/ui/login-card';

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState(false);
  
  // Check if already logged in on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('visiocarLoggedIn') === 'true';
    if (isLoggedIn) {
      setLocation('/dashboard');
    }
  }, [setLocation]);

  const handleLogin = (password: string) => {
    if (password === 'visiocar') {
      // Set login state
      localStorage.setItem('visiocarLoggedIn', 'true');
      
      // Redirect after successful login (500ms delay for animation)
      setTimeout(() => {
        setLocation('/dashboard');
      }, 500);
      
      return true;
    } else {
      setLoginError(true);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <LoginCard 
        onLogin={handleLogin} 
        showError={loginError} 
        onErrorClear={() => setLoginError(false)} 
      />
    </div>
  );
}
