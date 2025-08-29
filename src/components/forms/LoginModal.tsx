import React, { useState, useCallback, memo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTheme, useAppState, useNotifications } from '@/contexts';
import { Input, Button } from '@/components/common';
import type { User } from '@/types';

interface LoginData {
  email: string;
  senha: string;
}

interface LoginErrors {
  email?: string;
  senha?: string;
}

export const LoginModal: React.FC = memo(() => {
  const { isDarkMode } = useTheme();
  const { setUserLogado, dadosMockados } = useAppState();
  const { addNotification } = useNotifications();
  
  const [loginData, setLoginData] = useState<LoginData>({ email: '', senha: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: LoginErrors = {};
    
    if (!loginData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!loginData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [loginData]);

  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const { email, senha } = loginData;

      // Admin login
      if (email === 'admin@ct.com' && senha === 'admin123') {
        const adminUser: User = { 
          id: 0, 
          nome: 'Administrador', 
          email, 
          perfil: 'admin'
        };
        setUserLogado(adminUser);
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: 'Bem-vindo, Administrador!'
        });
        return;
      }

      // Professor login
      const professor = dadosMockados.professores.find(p => p.email === email && p.senha === senha);
      if (professor) {
        const professorUser: User = {
          id: professor.id,
          nome: professor.nome,
          email: professor.email,
          perfil: 'professor'
        };
        setUserLogado(professorUser);
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: `Bem-vindo, Prof. ${professor.nome}!`
        });
        return;
      }

      // Gestor login
      const gestor = dadosMockados.gestores.find(g => g.email === email && g.senha === senha && g.ativo);
      if (gestor) {
        const gestorUser: User = {
          id: gestor.id,
          nome: gestor.nome,
          email: gestor.email,
          perfil: 'gestor',
          unidades: gestor.unidades
        };
        setUserLogado(gestorUser);
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: `Bem-vindo, ${gestor.nome}!`
        });
        return;
      }

      // Aluno login
      const aluno = dadosMockados.alunos.find(a => a.email === email && a.senha === senha);
      if (aluno) {
        const alunoUser: User = {
          id: aluno.id,
          nome: aluno.nome,
          email: aluno.email,
          perfil: 'aluno',
          unidade: aluno.unidade
        };
        setUserLogado(alunoUser);
        addNotification({
          type: 'success',
          title: 'Login realizado',
          message: `Bem-vindo, ${aluno.nome}!`
        });
        return;
      }

      // Login failed
      setErrors({ email: 'Email ou senha incorretos' });
      addNotification({
        type: 'error',
        title: 'Erro no login',
        message: 'Credenciais inválidas'
      });
    } catch (error) {
      console.error('Erro no login:', error);
      addNotification({
        type: 'error',
        title: 'Erro no login',
        message: 'Ocorreu um erro inesperado'
      });
    } finally {
      setLoading(false);
    }
  }, [validateForm, loginData, setUserLogado, dadosMockados, addNotification]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }, [handleLogin]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({ ...prev, email: e.target.value }));
  }, []);

  const handleSenhaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({ ...prev, senha: e.target.value }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'
      } rounded-xl p-8 w-full max-w-md`}>
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Sistema de Gestão FTV
          </h2>
          <p className={`${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          } mt-2`}>
            Faça login para continuar
          </p>
        </div>
        
        <div className="space-y-4" onKeyPress={handleKeyPress}>
          <Input
            label="Email"
            type="email"
            value={loginData.email}
            onChange={handleEmailChange}
            error={errors.email}
            required
            autoComplete="email"
            aria-describedby="email-help"
          />
          
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={loginData.senha}
              onChange={handleSenhaChange}
              error={errors.senha}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <Button
            onClick={handleLogin}
            loading={loading}
            className="w-full"
            aria-describedby="login-help"
          >
            Entrar
          </Button>
        </div>
        
        <div className={`mt-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <p className={`text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-600'
          }`}>
            Dados para teste:
          </p>
          <div className="space-y-1 text-xs">
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
              <strong>Admin:</strong> admin@ct.com / admin123
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
              <strong>Professor:</strong> carlos@email.com / 123456
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>
              <strong>Aluno:</strong> joao@email.com / 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});