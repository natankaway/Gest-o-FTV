import React, { useState, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Save, Upload, X } from 'lucide-react';
import { formatPhone, validateEmail } from '@/utils';
import type { ConfigCT } from '@/types';

export const GeralTab: React.FC = () => {
  const { dadosMockados, setConfigCT } = useAppState();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<ConfigCT>(dadosMockados.configCT);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    // Validation
    if (!formData.nomeCT.trim()) {
      addNotification({
        type: 'error',
        title: 'Erro de validação',
        message: 'Nome do CT é obrigatório'
      });
      return;
    }

    if (formData.contato?.email && !validateEmail(formData.contato.email)) {
      addNotification({
        type: 'error',
        title: 'Erro de validação',
        message: 'Email de contato inválido'
      });
      return;
    }

    if (formData.horarioFuncionamentoPadrao?.inicio && formData.horarioFuncionamentoPadrao?.fim) {
      if (formData.horarioFuncionamentoPadrao.inicio >= formData.horarioFuncionamentoPadrao.fim) {
        addNotification({
          type: 'error',
          title: 'Erro de validação',
          message: 'Horário de início deve ser anterior ao horário de fim'
        });
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConfigCT(formData);
      
      addNotification({
        type: 'success',
        title: 'Configurações salvas',
        message: 'As configurações gerais foram atualizadas com sucesso'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar as configurações'
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, setConfigCT, addNotification]);

  const handlePhoneChange = useCallback((value: string) => {
    const formattedPhone = formatPhone(value);
    setFormData(prev => ({
      ...prev,
      contato: {
        ...prev.contato,
        telefone: formattedPhone
      }
    }));
  }, []);

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real application, you would upload the file to a server
      // For now, we'll just create a mock URL
      const mockUrl = `https://example.com/logos/${file.name}`;
      setFormData(prev => ({
        ...prev,
        branding: {
          ...prev.branding,
          logoUrl: mockUrl
        }
      }));
      
      addNotification({
        type: 'info',
        title: 'Logo carregada',
        message: 'Logo foi carregada (mock). Em produção, seria enviada para o servidor.'
      });
    }
  }, [addNotification]);

  const removeLogo = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      branding: {
        ...prev.branding,
        logoUrl: ''
      }
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Nome do CT */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome do Centro de Treinamento *
        </label>
        <input
          type="text"
          value={formData.nomeCT}
          onChange={(e) => setFormData(prev => ({ ...prev, nomeCT: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Ex: Gestão FTV"
          required
        />
      </div>

      {/* Contatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email de Contato
          </label>
          <input
            type="email"
            value={formData.contato?.email || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              contato: { ...prev.contato, email: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="contato@futevolei.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Telefone de Contato
          </label>
          <input
            type="tel"
            value={formData.contato?.telefone || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="(11) 3000-0000"
          />
        </div>
      </div>

      {/* Horário de Funcionamento Padrão */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Horário de Funcionamento Padrão
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Início
            </label>
            <input
              type="time"
              value={formData.horarioFuncionamentoPadrao?.inicio || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                horarioFuncionamentoPadrao: {
                  ...prev.horarioFuncionamentoPadrao,
                  inicio: e.target.value,
                  fim: prev.horarioFuncionamentoPadrao?.fim || ''
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Fim
            </label>
            <input
              type="time"
              value={formData.horarioFuncionamentoPadrao?.fim || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                horarioFuncionamentoPadrao: {
                  ...prev.horarioFuncionamentoPadrao,
                  inicio: prev.horarioFuncionamentoPadrao?.inicio || '',
                  fim: e.target.value
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Este horário será usado como padrão para novas unidades
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo do CT
        </label>
        
        {formData.branding?.logoUrl && formData.branding.logoUrl.trim() ? (
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <span className="text-xs text-gray-500">Logo</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white font-medium">
                Logo carregada
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.branding.logoUrl}
              </p>
            </div>
            <button
              onClick={removeLogo}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Remover logo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Clique para carregar</span> ou arraste a logo
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG ou SVG (MAX. 2MB)
                </p>
              </div>
            </label>
          </div>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Opcional: Logo será exibida na interface do sistema
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </div>
  );
};