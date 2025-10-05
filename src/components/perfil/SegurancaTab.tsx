// src/components/perfil/SegurancaTab.tsx
import React, { useState, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Input, Button } from '@/components/common';
import { Lock, Eye, EyeOff, Shield, Smartphone, AlertTriangle } from 'lucide-react';

interface SenhaFormData {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

interface SenhaErrors {
  senhaAtual?: string;
  novaSenha?: string;
  confirmarSenha?: string;
}

export const SegurancaTab: React.FC = () => {
  const { userLogado, dadosMockados, setAlunos } = useAppState();
  const { addNotification } = useNotifications();

  const [senhaForm, setSenhaForm] = useState<SenhaFormData>({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const [errors, setErrors] = useState<SenhaErrors>({});
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('(11) 9****-9999');

  const alunoAtual = dadosMockados.alunos.find(a => a.id === userLogado?.id);

  const validateSenhaForm = useCallback((): boolean => {
    const newErrors: SenhaErrors = {};

    if (!senhaForm.senhaAtual) {
      newErrors.senhaAtual = 'Senha atual é obrigatória';
    } else if (senhaForm.senhaAtual !== alunoAtual?.senha) {
      newErrors.senhaAtual = 'Senha atual incorreta';
    }

    if (!senhaForm.novaSenha) {
      newErrors.novaSenha = 'Nova senha é obrigatória';
    } else if (senhaForm.novaSenha.length < 6) {
      newErrors.novaSenha = 'Senha deve ter no mínimo 6 caracteres';
    } else if (senhaForm.novaSenha === senhaForm.senhaAtual) {
      newErrors.novaSenha = 'Nova senha deve ser diferente da atual';
    }

    if (!senhaForm.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (senhaForm.confirmarSenha !== senhaForm.novaSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [senhaForm, alunoAtual]);

  const handleSenhaChange = useCallback((field: keyof SenhaFormData, value: string) => {
    setSenhaForm(prev => ({ ...prev, [field]: value }));
    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleAlterarSenha = useCallback(() => {
    if (!validateSenhaForm() || !alunoAtual) return;

    // Atualizar senha do aluno
    setAlunos(prev => prev.map(aluno => 
      aluno.id === alunoAtual.id
        ? { ...aluno, senha: senhaForm.novaSenha }
        : aluno
    ));

    // Limpar formulário
    setSenhaForm({
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    });

    addNotification({
      type: 'success',
      title: 'Senha alterada',
      message: 'Sua senha foi alterada com sucesso!'
    });
  }, [validateSenhaForm, alunoAtual, senhaForm, setAlunos, addNotification]);

  const handleToggle2FA = useCallback(() => {
    setTwoFactorEnabled(!twoFactorEnabled);
    
    addNotification({
      type: twoFactorEnabled ? 'info' : 'success',
      title: twoFactorEnabled ? '2FA desativada' : '2FA ativada',
      message: twoFactorEnabled 
        ? 'Autenticação em dois fatores foi desativada'
        : 'Autenticação em dois fatores foi ativada com sucesso!'
    });
  }, [twoFactorEnabled, addNotification]);

  const getSenhaStrength = useCallback((senha: string): { strength: number; label: string; color: string } => {
    if (!senha) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    
    if (senha.length >= 6) strength += 25;
    if (senha.length >= 8) strength += 25;
    if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) strength += 25;
    if (/[0-9]/.test(senha)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(senha)) strength += 10;

    if (strength < 30) return { strength, label: 'Fraca', color: 'bg-red-500' };
    if (strength < 60) return { strength, label: 'Média', color: 'bg-yellow-500' };
    if (strength < 80) return { strength, label: 'Boa', color: 'bg-blue-500' };
    return { strength, label: 'Forte', color: 'bg-green-500' };
  }, []);

  const senhaStrength = getSenhaStrength(senhaForm.novaSenha);

  return (
    <div className="space-y-8">
      {/* Alterar Senha */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Alterar Senha
          </h3>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Senha Atual */}
          <div className="relative">
            <Input
              label="Senha Atual"
              type={showSenhaAtual ? 'text' : 'password'}
              value={senhaForm.senhaAtual}
              onChange={(e) => handleSenhaChange('senhaAtual', e.target.value)}
              error={errors.senhaAtual}
              placeholder="Digite sua senha atual"
              required
            />
            <button
              type="button"
              onClick={() => setShowSenhaAtual(!showSenhaAtual)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showSenhaAtual ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Nova Senha */}
          <div className="relative">
            <Input
              label="Nova Senha"
              type={showNovaSenha ? 'text' : 'password'}
              value={senhaForm.novaSenha}
              onChange={(e) => handleSenhaChange('novaSenha', e.target.value)}
              error={errors.novaSenha}
              placeholder="Digite a nova senha"
              required
            />
            <button
              type="button"
              onClick={() => setShowNovaSenha(!showNovaSenha)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showNovaSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>

            {/* Indicador de Força da Senha */}
            {senhaForm.novaSenha && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Força da senha:
                  </span>
                  <span className={`text-xs font-medium ${
                    senhaStrength.strength < 30 ? 'text-red-600' :
                    senhaStrength.strength < 60 ? 'text-yellow-600' :
                    senhaStrength.strength < 80 ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {senhaStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${senhaStrength.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${senhaStrength.strength}%` }}
                  />
                </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use pelo menos 8 caracteres com letras maiúsculas, minúsculas, números e símbolos
                  </p>
                </div>
              )}
            </div>

          {/* Confirmar Nova Senha */}
          <div className="relative">
            <Input
              label="Confirmar Nova Senha"
              type={showConfirmarSenha ? 'text' : 'password'}
              value={senhaForm.confirmarSenha}
              onChange={(e) => handleSenhaChange('confirmarSenha', e.target.value)}
              error={errors.confirmarSenha}
              placeholder="Confirme a nova senha"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirmarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Botão Alterar Senha */}
          <Button onClick={handleAlterarSenha} className="w-full">
            Alterar Senha
          </Button>
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Autenticação em Dois Fatores */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Autenticação em Dois Fatores (2FA)
          </h3>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                Adicione uma camada extra de segurança
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Com a autenticação em dois fatores ativada, você receberá um código via SMS 
                toda vez que fizer login em um novo dispositivo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 dark:text-white">
                Autenticação via SMS
              </p>
              {twoFactorEnabled && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                  Ativa
                </span>
              )}
            </div>
            {twoFactorEnabled && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {phoneNumber}
              </p>
            )}
          </div>

          <button
            onClick={handleToggle2FA}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="space-y-3">
            <Input
              label="Número de Telefone para 2FA"
              icon={Smartphone}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(11) 99999-9999"
            />
            <Button variant="secondary" size="sm">
              Atualizar Número
            </Button>
          </div>
        )}
      </div>

      {/* Divisor */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Sessões Ativas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sessões Ativas
        </h3>

        <div className="space-y-3">
          {/* Sessão Atual */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Este dispositivo
                  </p>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                    Atual
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Chrome • São Paulo, SP • Último acesso: agora
                </p>
              </div>
            </div>
          </div>

          {/* Outras Sessões */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  iPhone 13 Pro
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Safari • Rio de Janeiro, RJ • Último acesso: há 2 dias
                </p>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium">
                Encerrar
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Samsung Galaxy S21
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Chrome • São Paulo, SP • Último acesso: há 5 dias
                </p>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium">
                Encerrar
              </button>
            </div>
          </div>

          <Button variant="secondary" className="w-full">
            Encerrar Todas as Outras Sessões
          </Button>
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Zona de Perigo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Zona de Perigo
          </h3>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">
            Desativar Conta
          </h4>
          <p className="text-sm text-red-800 dark:text-red-300 mb-4">
            Ao desativar sua conta, você não poderá mais acessar o sistema. 
            Seus dados serão mantidos por 30 dias antes da exclusão definitiva.
          </p>
          <Button variant="secondary" className="border-red-300 text-red-600 hover:bg-red-50">
            Desativar Minha Conta
          </Button>
        </div>
      </div>
    </div>
  );
};