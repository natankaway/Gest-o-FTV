import React, { useState, useCallback, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { generateId, getStatusBadgeClass } from '@/utils';
import { UnidadeForm } from './UnidadeForm';
import type { Unidade, UnidadeFormData } from '@/types';

export const UnidadesTab: React.FC = () => {
  const { dadosMockados, setUnidades, dadosMockados: { agendamentos, presencas, alunos } } = useAppState();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUnidade, setEditingUnidade] = useState<Unidade | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter units based on search term
  const filteredUnidades = useMemo(() => {
    if (!searchTerm.trim()) return dadosMockados.unidades;
    
    const term = searchTerm.toLowerCase();
    return dadosMockados.unidades.filter(unidade =>
      unidade.nome.toLowerCase().includes(term) ||
      unidade.endereco.toLowerCase().includes(term) ||
      unidade.email.toLowerCase().includes(term)
    );
  }, [dadosMockados.unidades, searchTerm]);

  // Check if unit can be deleted (has dependencies)
  const checkCanDelete = useCallback((unidadeNome: string) => {
    const hasAgendamentos = agendamentos.some(a => a.unidade === unidadeNome);
    const hasPresencas = presencas.some(p => p.unidade === unidadeNome);
    const hasAlunos = alunos.some(a => a.unidade === unidadeNome);
    
    return {
      canDelete: !hasAgendamentos && !hasPresencas && !hasAlunos,
      dependencies: {
        agendamentos: hasAgendamentos,
        presencas: hasPresencas,
        alunos: hasAlunos
      }
    };
  }, [agendamentos, presencas, alunos]);

  const handleAdd = useCallback(() => {
    setEditingUnidade(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((unidade: Unidade) => {
    setEditingUnidade(unidade);
    setIsFormOpen(true);
  }, []);

  const handleToggleActive = useCallback((unidade: Unidade) => {
    setUnidades(prev => prev.map(u => 
      u.id === unidade.id ? { ...u, ativa: !u.ativa } : u
    ));
    
    addNotification({
      type: 'success',
      title: unidade.ativa ? 'Unidade desativada' : 'Unidade ativada',
      message: `${unidade.nome} foi ${unidade.ativa ? 'desativada' : 'ativada'} com sucesso`
    });
  }, [setUnidades, addNotification]);

  const handleDelete = useCallback((unidade: Unidade) => {
    const deleteCheck = checkCanDelete(unidade.nome);
    
    if (!deleteCheck.canDelete) {
      const dependencies = [];
      if (deleteCheck.dependencies.alunos) dependencies.push('alunos');
      if (deleteCheck.dependencies.agendamentos) dependencies.push('agendamentos');
      if (deleteCheck.dependencies.presencas) dependencies.push('presenças');
      
      addNotification({
        type: 'error',
        title: 'Não é possível excluir',
        message: `Esta unidade possui ${dependencies.join(', ')} vinculados. Remova essas dependências primeiro.`
      });
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a unidade "${unidade.nome}"?\n\nEsta ação não pode ser desfeita.`
    );
    
    if (confirmed) {
      setUnidades(prev => prev.filter(u => u.id !== unidade.id));
      
      addNotification({
        type: 'success',
        title: 'Unidade excluída',
        message: `${unidade.nome} foi excluída com sucesso`
      });
    }
  }, [checkCanDelete, setUnidades, addNotification]);

  const handleSave = useCallback((formData: UnidadeFormData) => {
    if (editingUnidade) {
      // Update existing unit
      setUnidades(prev => prev.map(u => 
        u.id === editingUnidade.id ? { ...u, ...formData } : u
      ));
      
      addNotification({
        type: 'success',
        title: 'Unidade atualizada',
        message: `${formData.nome} foi atualizada com sucesso`
      });
    } else {
      // Add new unit
      const newUnidade: Unidade = {
        id: generateId(),
        ...formData
      };
      
      setUnidades(prev => [...prev, newUnidade]);
      
      addNotification({
        type: 'success',
        title: 'Unidade criada',
        message: `${formData.nome} foi criada com sucesso`
      });
    }
    
    setIsFormOpen(false);
    setEditingUnidade(null);
  }, [editingUnidade, setUnidades, addNotification]);

  const handleCancel = useCallback(() => {
    setIsFormOpen(false);
    setEditingUnidade(null);
  }, []);

  if (isFormOpen) {
    return (
      <UnidadeForm
        unidade={editingUnidade}
        onSave={handleSave}
        onCancel={handleCancel}
        gestores={dadosMockados.gestores}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gestão de Unidades
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gerencie as unidades do centro de treinamento
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar unidades por nome, endereço ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Units List */}
      <div className="space-y-4">
        {filteredUnidades.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando a primeira unidade do centro de treinamento'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Unidade
              </button>
            )}
          </div>
        ) : (
          filteredUnidades.map((unidade) => {
            const deleteCheck = checkCanDelete(unidade.nome);
            const gestor = dadosMockados.gestores.find(g => g.id === unidade.gestorId);
            
            return (
              <div
                key={unidade.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {unidade.nome}
                      </h3>
                      <span className={getStatusBadgeClass(unidade.ativa ? 'ativo' : 'inativo')}>
                        {unidade.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{unidade.endereco}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{unidade.telefone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>{unidade.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>Gestor: {gestor?.nome || 'Não definido'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(unidade)}
                      className={`p-2 rounded-lg transition-colors ${
                        unidade.ativa
                          ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                          : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={unidade.ativa ? 'Desativar unidade' : 'Ativar unidade'}
                    >
                      {unidade.ativa ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(unidade)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Editar unidade"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(unidade)}
                      disabled={!deleteCheck.canDelete}
                      className={`p-2 rounded-lg transition-colors ${
                        deleteCheck.canDelete
                          ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      title={
                        deleteCheck.canDelete 
                          ? 'Excluir unidade' 
                          : 'Não é possível excluir - possui dependências'
                      }
                    >
                      {deleteCheck.canDelete ? (
                        <Trash2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Configuration Details */}
                {unidade.configuracoes && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>
                        Funcionamento: {unidade.configuracoes.horarioFuncionamento.inicio} às {unidade.configuracoes.horarioFuncionamento.fim}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>Capacidade máxima: {unidade.configuracoes.capacidadeMaxima} pessoas</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};