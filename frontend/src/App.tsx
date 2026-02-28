import { AuthContext, useAuthState } from './hooks/useAuth';
import { Router } from './router/Router';

export function App() {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      <Router />
    </AuthContext.Provider>
  );
}
