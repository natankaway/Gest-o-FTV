import React, { useState, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { Plus, Edit2, RefreshCw, Star, Save, MapPin } from 'lucide-react';

const DIAS_SEMANA = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

export const AuloesMelhoradoTab: React.FC = () => {
  const { dadosMockados, setConfigCT } = useAppState();
  const { addNotification } = useNotifications();
  
  const [editingAulao, setEditingAulao] = useState<any>(null);
  
  const aulaoesMelhorados = dadosMockados.configCT.aulaoesMelhorados || [];
  const unidades = dadosMockados.unidades || [];

  const handleNovoAulao = useCallback((tipo: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    
    setEditingAulao({
      nome: '',
      unidade: unidades[0]?.nome || 'Centro', // Primeira unidade disponível
      horaInicio: '08:00',
      horaFim: '10:00',
      capacidade: undefined,
      ativo: true,
      tipo,
      ...(tipo === 'fixo-recorrente' ? {
        diaSemana: 'sabado',
        dataInicio: hoje
      } : {
        dataEspecifica: hoje
      }),
      configuracao: {
        permiteReposicao: true
      }
    });
  }, [unidades]);

  const handleSaveAulao = useCallback((aulaoData: any) => {
    const novoAulao = {
      id: aulaoData.id || Date.now(),
      ...aulaoData
    };

    setConfigCT(prev => ({
      ...prev,
      aulaoesMelhorados: aulaoData.id 
        ? prev.aulaoesMelhorados?.map((a: any) => a.id === aulaoData.id ? novoAulao : a) || [novoAulao]
        : [...(prev.aulaoesMelhorados || []), novoAulao]
    }));

    addNotification({
      type: 'success',
      title: 'Aulão salvo',
      message: `Aulão "${novoAulao.nome}" foi salvo com sucesso`
    });

    setEditingAulao(null);
  }, [setConfigCT, addNotification]);

  const handleDeleteAulao = useCallback((aulaoId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este aulão?')) {
      setConfigCT(prev => ({
        ...prev,
        aulaoesMelhorados: prev.aulaoesMelhorados?.filter((a: any) => a.id !== aulaoId) || []
      }));
      
      addNotification({
        type: 'success',
        title: 'Aulão excluído',
        message: 'Aulão foi removido com sucesso'
      });
    }
  }, [setConfigCT, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Sistema de Aulões
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Crie aulões fixos (todo sábado) ou extras (data específica)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleNovoAulao('fixo-recorrente')}
            variant="secondary"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Aulão Fixo
          </Button>
          <Button
            onClick={() => handleNovoAulao('extra-pontual')}
            leftIcon={<Star className="h-4 w-4" />}
          >
            Aulão Extra
          </Button>
        </div>
      </div>

      {/* Formulário */}
      {editingAulao && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
          <h4 className="text-lg font-semibold mb-4">
            {editingAulao.tipo === 'fixo-recorrente' ? (
              <>
                <RefreshCw className="inline w-5 h-5 mr-2 text-blue-600" />
                {editingAulao.id ? 'Editar Aulão Fixo' : 'Novo Aulão Fixo (Recorrente)'}
              </>
            ) : (
              <>
                <Star className="inline w-5 h-5 mr-2 text-orange-600" />
                {editingAulao.id ? 'Editar Aulão Extra' : 'Novo Aulão Extra (Pontual)'}
              </>
            )}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Nome *</label>
              <input
                type="text"
                value={editingAulao.nome}
                onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                placeholder="Ex: Aulão de Sábado"
              />
            </div>

            {/* Unidade */}
            <div>
              <label className="block text-sm font-medium mb-2">Unidade *</label>
              <select
                value={editingAulao.unidade}
                onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, unidade: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              >
                {unidades.map(unidade => (
                  <option key={unidade.id} value={unidade.nome}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo específico */}
            {editingAulao.tipo === 'fixo-recorrente' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Dia da Semana *</label>
                <select
                  value={editingAulao.diaSemana || ''}
                  onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, diaSemana: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                >
                  {DIAS_SEMANA.map(dia => (
                    <option key={dia.value} value={dia.value}>{dia.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Data Específica *</label>
                <input
                  type="date"
                  value={editingAulao.dataEspecifica || ''}
                  onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, dataEspecifica: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                />
              </div>
            )}

            {/* Horários */}
            <div>
              <label className="block text-sm font-medium mb-2">Hora Início *</label>
              <input
                type="time"
                value={editingAulao.horaInicio}
                onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, horaInicio: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hora Fim *</label>
              <input
                type="time"
                value={editingAulao.horaFim}
                onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, horaFim: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              />
            </div>

            {/* Capacidade - AGORA OPCIONAL */}
<div>
  <label className="block text-sm font-medium mb-2">Capacidade (Opcional)</label>
  <input
    type="number"
    min="1"
    value={editingAulao.capacidade || ''}
    onChange={(e) => setEditingAulao((prev: any) => ({ 
      ...prev, 
      capacidade: e.target.value ? parseInt(e.target.value) : undefined 
    }))}
    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
    placeholder="Deixe vazio para capacidade ilimitada"
  />
</div>

            {/* Valor Especial */}
            <div>
              <label className="block text-sm font-medium mb-2">Valor Especial (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editingAulao.valorEspecial || ''}
                onChange={(e) => setEditingAulao((prev: any) => ({ 
                  ...prev, 
                  valorEspecial: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                placeholder="Deixe vazio para valor padrão"
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={editingAulao.descricao || ''}
                onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, descricao: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                rows={3}
                placeholder="Descrição do aulão..."
              />
            </div>
          </div>

          {/* Checkbox Ativo */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="aulaoAtivo"
              checked={editingAulao.ativo}
              onChange={(e) => setEditingAulao((prev: any) => ({ ...prev, ativo: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="aulaoAtivo" className="text-sm">Aulão ativo</label>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={() => handleSaveAulao(editingAulao)}
              disabled={!editingAulao.nome.trim()}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
            <Button
              variant="secondary"
              onClick={() => setEditingAulao(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Aulões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {aulaoesMelhorados.map((aulao: any) => (
          <div key={aulao.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900 dark:text-white">{aulao.nome}</h5>
              <div className="flex items-center gap-2">
                {aulao.tipo === 'fixo-recorrente' ? (
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                ) : (
                  <Star className="w-4 h-4 text-orange-600" />
                )}
                <button
                  onClick={() => setEditingAulao(aulao)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAulao(aulao.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {/* Tipo e Data/Recorrência */}
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {aulao.tipo === 'fixo-recorrente' ? (
                  <span>Toda {DIAS_SEMANA.find(d => d.value === aulao.diaSemana)?.label}</span>
                ) : (
                  <span>{aulao.dataEspecifica ? new Date(aulao.dataEspecifica).toLocaleDateString('pt-BR') : 'Data não definida'}</span>
                )}
              </div>

              {/* Horário */}
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{aulao.horaInicio} às {aulao.horaFim}</span>
              </div>

              {/* Unidade */}
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{aulao.unidade}</span>
              </div>

             {/* Capacidade */}
<div className="flex items-center">
  <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
  <span>
    {aulao.capacidade ? `Capacidade: ${aulao.capacidade}` : 'Capacidade: Ilimitada'}
  </span>
</div>

              {/* Valor Especial */}
              {aulao.valorEspecial && (
                <div className="text-green-600 dark:text-green-400 font-medium">
                  R$ {aulao.valorEspecial.toFixed(2)}
                </div>
              )}
            </div>

            {/* Status e Tipo */}
            <div className="mt-3 flex gap-2">
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                aulao.ativo 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {aulao.ativo ? 'Ativo' : 'Inativo'}
              </span>
              
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                aulao.tipo === 'fixo-recorrente'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
              }`}>
                {aulao.tipo === 'fixo-recorrente' ? 'Fixo' : 'Extra'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {aulaoesMelhorados.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Nenhum aulão criado ainda
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Use os botões acima para criar seu primeiro aulão.
          </p>
        </div>
      )}
    </div>
  );
};