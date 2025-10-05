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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-gray-900/95 to-slate-900/95 backdrop-blur-sm" />

      <div className={`relative w-full max-w-md transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
      } backdrop-blur-xl rounded-2xl shadow-2xl border ${
        isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
      }`}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <div className="relative p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className={`text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2`}>
              Gestão FTV
            </h2>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sistema de Gestão de Futevôlei
            </p>
          </div>

          <div className="space-y-5" onKeyPress={handleKeyPress}>
            <div className="space-y-1">
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
            </div>

            <div className="space-y-1">
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
                  className={`absolute right-3 top-9 transition-colors ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              loading={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              aria-describedby="login-help"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          <div className={`mt-8 p-5 rounded-xl border-2 border-dashed transition-all ${
            isDarkMode
              ? 'bg-gray-700/30 border-gray-600/50'
              : 'bg-orange-50/50 border-orange-200/50'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-gray-600' : 'bg-orange-100'
              }`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Credenciais para teste
                </p>
                <div className="space-y-2 text-xs">
                  <div className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-semibold min-w-[70px]">Admin:</span>
                    <span className="font-mono">admin@ct.com / admin123</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-semibold min-w-[70px]">Professor:</span>
                    <span className="font-mono">carlos@email.com / 123456</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="font-semibold min-w-[70px]">Aluno:</span>
                    <span className="font-mono">joao@email.com / 123456</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});