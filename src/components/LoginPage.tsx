import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { User } from '@/types/inventory';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [users, setUsers] = useLocalStorage<User[]>('users', []);

  useEffect(() => {
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: crypto.randomUUID(),
        email: 'admin@system.com',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador',
        createdAt: new Date().toISOString(),
      };
      setUsers([defaultAdmin]);
      toast.info('Utilizador padrão criado: admin@system.com / admin123');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (login(email, password)) {
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Email ou palavra-passe incorretos');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Gestão de Inventário</CardTitle>
          <CardDescription>Entre com as suas credenciais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Palavra-passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
