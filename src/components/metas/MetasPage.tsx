import React, { useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { 
  Target, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { MetaFormModal } from './MetaFormModal';
import type { MetaGeral } from '@/types';

type StatusFilter = 'todos' | 'em-andamento' | 'concluida' | 'atrasada';
type EscopoFilter = 'todos' | 'CT' | 'Unidade';

export const MetasPage: React.FC = () => {
  const { 
    dadosMockados, 
    userLogado, 
    setMetasGerais 
  } = useAppState();
  const { addNotification } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [escopoFilter, setEscopoFilter] = useState<EscopoFilter>('todos');
  const [unidadeFilter, setUnidadeFilter] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaGeral | null>(null);

  // Verificar acesso
  const hasAccess = userLogado?.perfil === 'admin' || userLogado?.perfil === 'gestor';

  // Função para calcular status da meta
  const getMetaStatus = useCallback((meta: MetaGeral) => {
    const progresso = Math.min(100, (meta.valorAtual / meta.valorAlvo) * 100);
    const hoje = new Date();
    const prazo = meta.prazo ? new Date(meta.prazo) : null;
    
    if (progresso >= 100) return 'concluida';
    if (prazo && hoje > prazo) return 'atrasada';
    return 'em-andamento';
  }, []);

  // Filtrar metas baseado no perfil do usuário
  const metasFiltradas = useMemo(() => {
    let metas = dadosMockados.metasGerais || [];

    // Filtro por perfil
    if (userLogado?.perfil === 'gestor') {
      const unidadesGestor = userLogado.unidades || [];
      metas = metas.filter(meta => 
        meta.escopo === 'CT' || 
        (meta.escopo === 'Unidade' && meta.unidadeId && unidadesGestor.includes(meta.unidadeId))
      );
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      metas = metas.filter(meta =>
        meta.titulo.toLowerCase().includes(term) ||
        meta.descricao?.toLowerCase().includes(term) ||
        meta.responsavel?.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      metas = metas.filter(meta => getMetaStatus(meta) === statusFilter);
    }

    // Filtro por escopo
    if (escopoFilter !== 'todos') {
      metas = metas.filter(meta => meta.escopo === escopoFilter);
    }

    // Filtro por unidade
    if (unidadeFilter !== 'todas') {
      metas = metas.filter(meta => 
        meta.escopo === 'CT' || meta.unidadeId === unidadeFilter
      );
    }

    return metas;
  }, [dadosMockados.metasGerais, userLogado, searchTerm, statusFilter, escopoFilter, unidadeFilter, getMetaStatus]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const emAndamento = metasFiltradas.filter(meta => getMetaStatus(meta) === 'em-andamento').length;
    const atrasadas = metasFiltradas.filter(meta => getMetaStatus(meta) === 'atrasada').length;
    const concluidas = metasFiltradas.filter(meta => getMetaStatus(meta) === 'concluida').length;
    
    return { emAndamento, atrasadas, concluidas };
  }, [metasFiltradas, getMetaStatus]);

  const handleCreateMeta = useCallback(() => {
    setEditingMeta(null);
    setShowModal(true);
  }, []);

  const handleEditMeta = useCallback((meta: MetaGeral) => {
    // Verificar permissão para editar
    if (userLogado?.perfil === 'gestor' && meta.escopo === 'Unidade') {
      const unidadesGestor = userLogado.unidades || [];
      if (!meta.unidadeId || !unidadesGestor.includes(meta.unidadeId)) {
        addNotification({
          type: 'error',
          title: 'Acesso negado',
          message: 'Você não tem permissão para editar esta meta'
        });
        return;
      }
    }
    
    setEditingMeta(meta);
    setShowModal(true);
  }, [userLogado, addNotification]);

  const handleDeleteMeta = useCallback((meta: MetaGeral) => {
    // Verificar permissão para excluir
    if (userLogado?.perfil === 'gestor' && meta.escopo === 'Unidade') {
      const unidadesGestor = userLogado.unidades || [];
      if (!meta.unidadeId || !unidadesGestor.includes(meta.unidadeId)) {
        addNotification({
          type: 'error',
          title: 'Acesso negado',
          message: 'Você não tem permissão para excluir esta meta'
        });
        return;
      }
    }

    if (window.confirm(`Tem certeza que deseja excluir a meta "${meta.titulo}"?`)) {
      setMetasGerais(prev => prev.filter(m => m.id !== meta.id));
      addNotification({
        type: 'success',
        title: 'Meta excluída',
        message: 'Meta excluída com sucesso'
      });
    }
  }, [userLogado, setMetasGerais, addNotification]);

  const handleSaveMeta = useCallback((metaData: Omit<MetaGeral, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const agora = new Date().toISOString();
    
    if (editingMeta) {
      // Editar meta existente
      const metaAtualizada: MetaGeral = {
        ...editingMeta,
        ...metaData,
        atualizadoEm: agora
      };
      
      setMetasGerais(prev => prev.map(m => m.id === editingMeta.id ? metaAtualizada : m));
      addNotification({
        type: 'success',
        title: 'Meta atualizada',
        message: 'Meta atualizada com sucesso'
      });
    } else {
      // Criar nova meta
      const novaMeta: MetaGeral = {
        id: Date.now().toString(),
        ...metaData,
        criadoEm: agora,
        atualizadoEm: agora
      };
      
      setMetasGerais(prev => [...prev, novaMeta]);
      addNotification({
        type: 'success',
        title: 'Meta criada',
        message: 'Meta criada com sucesso'
      });
    }
    
    setShowModal(false);
    setEditingMeta(null);
  }, [editingMeta, setMetasGerais, addNotification]);

  const formatarProgresso = useCallback((meta: MetaGeral) => {
    return Math.min(100, (meta.valorAtual / meta.valorAlvo) * 100);
  }, []);

  const formatarData = useCallback((data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  }, []);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Você não tem permissão para acessar esta funcionalidade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="h-8 w-8 text-blue-600" />
            Metas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie e acompanhe as metas do CT e das unidades
          </p>
        </div>
        
        <button
          onClick={handleCreateMeta}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nova Meta
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filtro Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="todos">Todos os Status</option>
            <option value="em-andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="atrasada">Atrasada</option>
          </select>

          {/* Filtro Escopo */}
          <select
            value={escopoFilter}
            onChange={(e) => setEscopoFilter(e.target.value as EscopoFilter)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="todos">Todos os Escopos</option>
            <option value="CT">CT (Global)</option>
            <option value="Unidade">Por Unidade</option>
          </select>

          {/* Filtro Unidade */}
          <select
            value={unidadeFilter}
            onChange={(e) => setUnidadeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="todas">Todas as Unidades</option>
            {dadosMockados.unidades.map(unidade => (
              <option key={unidade.id} value={unidade.nome}>
                {unidade.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{estatisticas.emAndamento}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Atrasadas</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{estatisticas.atrasadas}</p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Concluídas</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{estatisticas.concluidas}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Lista de Metas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Meta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Escopo/Unidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {metasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma meta encontrada
                  </td>
                </tr>
              ) : (
                metasFiltradas.map((meta) => {
                  const progresso = formatarProgresso(meta);
                  const status = getMetaStatus(meta);
                  
                  return (
                    <tr key={meta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {meta.titulo}
                          </div>
                          {meta.descricao && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {meta.descricao}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {meta.escopo === 'CT' ? (
                            <Building2 className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Building2 className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {meta.escopo === 'CT' ? 'CT (Global)' : meta.unidadeId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {meta.valorAtual.toLocaleString()} / {meta.valorAlvo.toLocaleString()}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {progresso.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                status === 'concluida' 
                                  ? 'bg-green-600' 
                                  : status === 'atrasada' 
                                  ? 'bg-red-600' 
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, progresso)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {meta.prazo ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            {formatarData(meta.prazo)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sem prazo</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status === 'concluida'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : status === 'atrasada'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {status === 'concluida' ? 'Concluída' : status === 'atrasada' ? 'Atrasada' : 'Em andamento'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {meta.responsavel ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <User className="h-4 w-4" />
                            {meta.responsavel}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Sem responsável</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMeta(meta)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMeta(meta)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <MetaFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingMeta(null);
          }}
          onSave={handleSaveMeta}
          editingMeta={editingMeta}
          userLogado={userLogado}
          unidades={dadosMockados.unidades}
        />
      )}
    </div>
  );
};