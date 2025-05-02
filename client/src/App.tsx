import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Check login status and redirect accordingly
    const isLoggedIn = localStorage.getItem('visiocarLoggedIn') === 'true';
    
    // If not logged in and not on login page, redirect to login
    if (!isLoggedIn && location !== '/login' && location !== '/') {
      setLocation('/login');
    }
    
    // If logged in and on login page, redirect to dashboard
    if (isLoggedIn && (location === '/login' || location === '/')) {
      setLocation('/dashboard');
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
