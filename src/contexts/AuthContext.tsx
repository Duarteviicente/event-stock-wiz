import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/inventory';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users] = useLocalStorage<User[]>('users', []);
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>('currentUserId', null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUserId) {
      const user = users.find(u => u.id === currentUserId);
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUserId(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [currentUserId, users]);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUserId(user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserId(null);
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
