// src/components/perfil/NotificacoesTab.tsx
import React, { useState, useCallback } from 'react';
import { useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { Mail, MessageSquare, Smartphone, Bell } from 'lucide-react';

interface NotificacoesPreferencias {
  email: {
    lembreteAula: boolean;
    vencimentoMensalidade: boolean;
    novosTorneios: boolean;
    newsletter: boolean;
  };
  sms: {
    lembreteAula: boolean;
    confirmacaoPagamento: boolean;
  };
  push: {
    checkinSucesso: boolean;
    conquistasDesbloqueadas: boolean;
    mudancaRanking: boolean;
  };
  whatsapp: {
    lembretesAula: boolean;
    promocoesNovidades: boolean;
  };
}

export const NotificacoesTab: React.FC = () => {
  const { addNotification } = useNotifications();

  const [preferencias, setPreferencias] = useState<NotificacoesPreferencias>({
    email: {
      lembreteAula: true,
      vencimentoMensalidade: true,
      novosTorneios: true,
      newsletter: false
    },
    sms: {
      lembreteAula: true,
      confirmacaoPagamento: false
    },
    push: {
      checkinSucesso: true,
      conquistasDesbloqueadas: true,
      mudancaRanking: true
    },
    whatsapp: {
      lembretesAula: true,
      promocoesNovidades: false
    }
  });

  const toggleNotificacao = useCallback((
    tipo: keyof NotificacoesPreferencias,
    campo: string
  ) => {
    setPreferencias(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [campo]: !prev[tipo][campo as keyof typeof prev[typeof tipo]]
      }
    }));
  }, []);

  const handleSave = useCallback(() => {
    addNotification({
      type: 'success',
      title: 'Preferências salvas',
      message: 'Suas preferências de notificação foram atualizadas!'
    });
  }, [addNotification]);

  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificações por Email
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { key: 'lembreteAula', label: 'Lembrete de aula (2h antes)', desc: 'Receba um email antes de suas aulas' },
            { key: 'vencimentoMensalidade', label: 'Vencimento de mensalidade (3 dias antes)', desc: 'Não perca o prazo de pagamento' },
            { key: 'novosTorneios', label: 'Novos torneios disponíveis', desc: 'Seja notificado sobre novas competições' },
            { key: 'newsletter', label: 'Newsletter semanal', desc: 'Resumo das atividades e novidades' }
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotificacao('email', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                  preferencias.email[item.key as keyof typeof preferencias.email]
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.email[item.key as keyof typeof preferencias.email]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* SMS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificações por SMS
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { key: 'lembreteAula', label: 'Lembrete de aula (1h antes)', desc: 'SMS rápido antes da aula' },
            { key: 'confirmacaoPagamento', label: 'Confirmação de pagamento', desc: 'Receba SMS quando o pagamento for confirmado' }
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotificacao('sms', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                  preferencias.sms[item.key as keyof typeof preferencias.sms]
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.sms[item.key as keyof typeof preferencias.sms]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Push (App) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificações Push (App)
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { key: 'checkinSucesso', label: 'Check-in realizado com sucesso', desc: 'Confirmação instantânea de presença' },
            { key: 'conquistasDesbloqueadas', label: 'Conquistas desbloqueadas', desc: 'Notificação quando ganhar badges' },
            { key: 'mudancaRanking', label: 'Mudança de posição no ranking', desc: 'Acompanhe sua evolução no ranking' }
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotificacao('push', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                  preferencias.push[item.key as keyof typeof preferencias.push]
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.push[item.key as keyof typeof preferencias.push]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notificações por WhatsApp
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { key: 'lembretesAula', label: 'Lembretes de aula', desc: 'Receba lembretes via WhatsApp' },
            { key: 'promocoesNovidades', label: 'Promoções e novidades', desc: 'Fique por dentro das ofertas' }
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleNotificacao('whatsapp', item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                  preferencias.whatsapp[item.key as keyof typeof preferencias.whatsapp]
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferencias.whatsapp[item.key as keyof typeof preferencias.whatsapp]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleSave}>
          Salvar Preferências
        </Button>
      </div>
    </div>
  );
};

// =============================================================================
// src/components/perfil/ContatosEmergenciaTab.tsx
// =============================================================================

import { Phone, Plus, Trash2, Heart, UserPlus } from 'lucide-react';
import { Input } from '@/components/common';

interface ContatoEmergencia {
  id: number;
  nome: string;
  parentesco: string;
  telefone: string;
}

interface PlanoSaude {
  operadora: string;
  numeroCarteira: string;
}

export const ContatosEmergenciaTab: React.FC = () => {
  const { addNotification } = useNotifications();

  const [contatos, setContatos] = useState<ContatoEmergencia[]>([
    { id: 1, nome: 'Maria Silva', parentesco: 'Esposa', telefone: '(11) 98888-8888' },
    { id: 2, nome: 'Pedro Silva', parentesco: 'Filho', telefone: '(11) 97777-7777' }
  ]);

  const [planoSaude, setPlanoSaude] = useState<PlanoSaude>({
    operadora: 'Unimed',
    numeroCarteira: '123456789012345'
  });

  const [informacoesMedicas, setInformacoesMedicas] = useState('');

  const handleAddContato = useCallback(() => {
    const novoContato: ContatoEmergencia = {
      id: Date.now(),
      nome: '',
      parentesco: '',
      telefone: ''
    };
    setContatos(prev => [...prev, novoContato]);
  }, []);

  const handleRemoveContato = useCallback((id: number) => {
    setContatos(prev => prev.filter(c => c.id !== id));
    addNotification({
      type: 'info',
      title: 'Contato removido',
      message: 'Contato de emergência foi removido'
    });
  }, [addNotification]);

  const handleUpdateContato = useCallback((id: number, field: keyof ContatoEmergencia, value: string) => {
    setContatos(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  }, []);

  const handleSave = useCallback(() => {
    addNotification({
      type: 'success',
      title: 'Informações salvas',
      message: 'Contatos de emergência atualizados com sucesso!'
    });
  }, [addNotification]);

  return (
    <div className="space-y-6">
      {/* Contatos de Emergência */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contatos de Emergência
            </h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddContato}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Adicionar
          </Button>
        </div>

        <div className="space-y-4">
          {contatos.map((contato, index) => (
            <div
              key={contato.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  Contato {index + 1}
                </p>
                {contatos.length > 1 && (
                  <button
                    onClick={() => handleRemoveContato(contato.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nome Completo"
                  value={contato.nome}
                  onChange={(e) => handleUpdateContato(contato.id, 'nome', e.target.value)}
                  placeholder="Nome do contato"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parentesco
                  </label>
                  <select
                    value={contato.parentesco}
                    onChange={(e) => handleUpdateContato(contato.id, 'parentesco', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="Cônjuge">Cônjuge</option>
                    <option value="Pai/Mãe">Pai/Mãe</option>
                    <option value="Filho(a)">Filho(a)</option>
                    <option value="Irmão(ã)">Irmão(ã)</option>
                    <option value="Amigo(a)">Amigo(a)</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <Input
                  label="Telefone"
                  value={contato.telefone}
                  onChange={(e) => handleUpdateContato(contato.id, 'telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plano de Saúde */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Plano de Saúde / Convênio
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Operadora"
            value={planoSaude.operadora}
            onChange={(e) => setPlanoSaude(prev => ({ ...prev, operadora: e.target.value }))}
            placeholder="Ex: Unimed, Amil, SulAmérica..."
          />

          <Input
            label="Número da Carteira"
            value={planoSaude.numeroCarteira}
            onChange={(e) => setPlanoSaude(prev => ({ ...prev, numeroCarteira: e.target.value }))}
            placeholder="000000000000000"
          />
        </div>
      </div>

      {/* Informações Médicas */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informações Médicas Relevantes
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alergias, condições pré-existentes, medicamentos, etc.
          </label>
          <textarea
            value={informacoesMedicas}
            onChange={(e) => setInformacoesMedicas(e.target.value)}
            rows={4}
            placeholder="Descreva aqui alergias, condições médicas importantes, medicamentos de uso contínuo..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Estas informações podem ser cruciais em caso de emergência
          </p>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={handleSave}>
          Salvar Informações
        </Button>
      </div>
    </div>
  );
};