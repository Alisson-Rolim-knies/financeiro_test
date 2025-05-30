export function useAuth() {
  const isAuthenticated = (): boolean => {
    return localStorage.getItem('visiocarLoggedIn') === 'true';
  };

  const login = (password: string): boolean => {
    if (password === 'visiocar') {
      localStorage.setItem('visiocarLoggedIn', 'true');
      // Redirecionar diretamente para o aplicativo principal
      window.location.href = '/visiocar.html';
      return true;
    }
    return false;
  };

  const logout = (): void => {
    localStorage.removeItem('visiocarLoggedIn');
  };

  return {
    isAuthenticated,
    login,
    logout
  };
}
