import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { NovoProdutoModal } from '@/components/forms';
import { 
  Package, 
  Plus, 
  Search, 
  Download, 
  Edit,
  Trash,
  Building,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import type { Produto } from '@/types';

interface ProdutoCardProps {
  produto: Produto;
  onEdit: (produto: Produto) => void;
  onDelete: (id: number) => void;
}

const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onEdit, onDelete }) => {
  const getStockStatus = () => {
    if (produto.estoque === 0) {
      return {
        text: 'Sem estoque',
        color: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        icon: <AlertCircle className="h-4 w-4" />
      };
    } else if (produto.estoque <= 5) {
      return {
        text: 'Estoque baixo',
        color: 'text-yellow-600 dark:text-yellow-400',
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: <AlertCircle className="h-4 w-4" />
      };
    } else {
      return {
        text: 'Em estoque',
        color: 'text-green-600 dark:text-green-400',
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        icon: <CheckCircle className="h-4 w-4" />
      };
    }
  };

  const getCategoryColor = () => {
    const colors = {
      'Bebidas': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Acessórios': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Cuidados': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    };
    return colors[produto.categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {produto.nome}
            </h3>
            <div className="flex items-center space-x-2">
              <Building className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {produto.unidade}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor()}`}>
          {produto.categoria}
        </span>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-1">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Preço</span>
        </div>
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          R$ {produto.preco.toFixed(2)}
        </div>
      </div>

      {/* Stock Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          {stockStatus.icon}
          <span className="text-sm font-medium text-gray-900 dark:text-white">Estoque</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {produto.estoque} unidades
          </span>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.badge}`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onEdit(produto)}
          leftIcon={<Edit className="h-4 w-4" />}
          className="flex-1"
        >
          Editar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDelete(produto.id)}
          leftIcon={<Trash className="h-4 w-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Excluir
        </Button>
      </div>
    </div>
  );
};

export const ProdutosPage: React.FC = memo(() => {
  const { dadosMockados, setProdutos } = useAppState();
  const { produtos } = dadosMockados;
  const { addNotification } = useNotifications();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [unidadeFilter, setUnidadeFilter] = useState('todas');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [estoqueFilter, setEstoqueFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  // Dados filtrados
  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto => {
      const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           produto.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUnidade = unidadeFilter === 'todas' || produto.unidade === unidadeFilter;
      const matchesCategoria = categoriaFilter === 'todas' || produto.categoria === categoriaFilter;
      
      const matchesEstoque = estoqueFilter === 'todos' ||
                            (estoqueFilter === 'disponivel' && produto.estoque > 0) ||
                            (estoqueFilter === 'baixo' && produto.estoque > 0 && produto.estoque <= 5) ||
                            (estoqueFilter === 'zerado' && produto.estoque === 0);
      
      return matchesSearch && matchesUnidade && matchesCategoria && matchesEstoque;
    });
  }, [produtos, searchTerm, unidadeFilter, categoriaFilter, estoqueFilter]);

  // Opções para filtros
  const unidadesDisponiveis = useMemo(() => {
    return [...new Set(produtos.map(p => p.unidade))].filter(Boolean);
  }, [produtos]);

  const categoriasDisponiveis = useMemo(() => {
    return [...new Set(produtos.map(p => p.categoria))].filter(Boolean);
  }, [produtos]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalProdutos = produtos.length;
    const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.preco * p.estoque), 0);
    const produtosSemEstoque = produtos.filter(p => p.estoque === 0).length;
    const produtosEstoqueBaixo = produtos.filter(p => p.estoque > 0 && p.estoque <= 5).length;
    
    return {
      total: totalProdutos,
      valorEstoque: valorTotalEstoque.toFixed(2),
      semEstoque: produtosSemEstoque,
      estoqueBaixo: produtosEstoqueBaixo
    };
  }, [produtos]);

  const handleEdit = useCallback((produto: Produto) => {
    setEditingProduto(produto);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProdutos(prev => prev.filter(p => p.id !== id));
      addNotification({
        type: 'success',
        title: 'Produto excluído',
        message: 'Produto removido com sucesso'
      });
    }
  }, [setProdutos, addNotification]);

  const handleAddNew = useCallback(() => {
    setEditingProduto(null);
    setShowModal(true);
  }, []);

  const exportToCSV = useCallback(() => {
    try {
      if (filteredProdutos.length === 0) {
        addNotification({
          type: 'warning',
          title: 'Nenhum dado para exportar',
          message: 'Não há produtos para exportar'
        });
        return;
      }

      const csvData = filteredProdutos.map(produto => ({
        Nome: produto.nome,
        Preco: produto.preco,
        Categoria: produto.categoria,
        Estoque: produto.estoque,
        Unidade: produto.unidade,
        ValorTotal: (produto.preco * produto.estoque).toFixed(2)
      }));

      const headers = Object.keys(csvData[0]!).join(',');
      const rows = csvData.map(row => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `produtos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        title: 'Exportação concluída',
        message: 'Dados dos produtos exportados com sucesso!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro na exportação',
        message: 'Não foi possível exportar os dados'
      });
    }
  }, [filteredProdutos, addNotification]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Sistema de Produtos/Loja
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gerencie o estoque e vendas de produtos do centro de treinamento
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            variant="secondary"
            onClick={exportToCSV}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exportar CSV
          </Button>
          <Button
            onClick={handleAddNew}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Produtos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Estoque</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.valorEstoque}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sem Estoque</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.semEstoque}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estoque Baixo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.estoqueBaixo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Unit Filter */}
          <div>
            <select
              value={unidadeFilter}
              onChange={(e) => setUnidadeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas as unidades</option>
              {unidadesDisponiveis.map(unidade => (
                <option key={unidade} value={unidade}>{unidade}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todas">Todas as categorias</option>
              {categoriasDisponiveis.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={estoqueFilter}
              onChange={(e) => setEstoqueFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos os estoques</option>
              <option value="disponivel">Disponível</option>
              <option value="baixo">Estoque baixo</option>
              <option value="zerado">Sem estoque</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredProdutos.length} de {produtos.length} produtos
        </p>
        {searchTerm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearchTerm('')}
          >
            Limpar busca
          </Button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProdutos.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum produto encontrado</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece adicionando um novo produto.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleAddNew} leftIcon={<Plus className="h-4 w-4" />}>
                Adicionar Primeiro Produto
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProdutos.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Novo Produto Modal */}
      <NovoProdutoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        editingProduto={editingProduto}
      />
    </div>
  );
});