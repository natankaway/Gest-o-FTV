import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { X, DollarSign, Upload, AlertCircle, Calculator } from 'lucide-react';
import type { Produto, ProdutoFormData } from '@/types';

interface NovoProdutoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduto?: Produto | null;
}

const INITIAL_FORM_DATA: ProdutoFormData = {
  nome: '',
  preco: 0,
  precoCusto: 0,
  categoria: 'suplemento',
  estoque: 0,
  estoqueMinimo: 5,
  descricao: '',
  marca: '',
  fornecedor: '',
  codigoBarras: '',
  unidade: 'Centro',
  ativo: true,
  imagem: ''
};

const CATEGORIAS_PRODUTO = [
  { value: 'suplemento', label: 'Suplemento', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'equipamento', label: 'Equipamento', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'acessorio', label: 'Acessório', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { value: 'vestuario', label: 'Vestuário', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' }
];

export const NovoProdutoModal: React.FC<NovoProdutoModalProps> = ({
  isOpen,
  onClose,
  editingProduto
}) => {
  const { dadosMockados, setProdutos } = useAppState();
  const { unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<ProdutoFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMargemCalculator, setShowMargemCalculator] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (editingProduto) {
      const editFormData: ProdutoFormData = {
        nome: editingProduto.nome,
        preco: editingProduto.preco,
        precoCusto: editingProduto.precoCusto || 0,
        categoria: editingProduto.categoria,
        estoque: editingProduto.estoque,
        estoqueMinimo: editingProduto.estoqueMinimo || 5,
        descricao: editingProduto.descricao || '',
        marca: editingProduto.marca || '',
        fornecedor: editingProduto.fornecedor || '',
        codigoBarras: editingProduto.codigoBarras || '',
        unidade: editingProduto.unidade,
        ativo: editingProduto.ativo ?? true,
        imagem: editingProduto.imagem || ''
      };
      
      setFormData(editFormData);
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
    setShowMargemCalculator(false);
  }, [editingProduto, isOpen]);

  // Calculate profit margin
  const margemLucro = useMemo(() => {
    if (formData.preco > 0 && formData.precoCusto && formData.precoCusto > 0) {
      return ((formData.preco - formData.precoCusto) / formData.preco * 100).toFixed(1);
    }
    return '0.0';
  }, [formData.preco, formData.precoCusto]);

  const valorEstoque = useMemo(() => {
    return (formData.preco * formData.estoque).toFixed(2);
  }, [formData.preco, formData.estoque]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do produto é obrigatório';
    }

    if (!formData.preco || formData.preco <= 0) {
      newErrors.preco = 'Preço deve ser maior que zero';
    }

    if (formData.precoCusto && formData.precoCusto >= formData.preco) {
      newErrors.precoCusto = 'Preço de custo deve ser menor que o preço de venda';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (formData.estoque < 0) {
      newErrors.estoque = 'Estoque não pode ser negativo';
    }

    if (formData.estoqueMinimo && formData.estoqueMinimo < 0) {
      newErrors.estoqueMinimo = 'Estoque mínimo não pode ser negativo';
    }

    if (!formData.unidade) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingProduto) {
        // Update existing produto
        setProdutos(prev => prev.map(produto => {
          if (produto.id === editingProduto.id) {
            const updatedProduto: Produto = {
              ...produto,
              ...formData
            };
            
            return updatedProduto;
          }
          return produto;
        }));
        
        addNotification({
          type: 'success',
          title: 'Produto atualizado',
          message: `${formData.nome} foi atualizado com sucesso!`
        });
      } else {
        // Create new produto
        const novoProduto: Produto = {
          id: Date.now(),
          ...formData
        };

        setProdutos(prev => [...prev, novoProduto]);
        
        addNotification({
          type: 'success',
          title: 'Produto criado',
          message: `${formData.nome} foi adicionado ao estoque!`
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar o produto. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingProduto, setProdutos, addNotification, onClose]);

  const handleInputChange = useCallback((field: keyof ProdutoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a server
      // For now, we'll just store the file name
      setFormData(prev => ({ ...prev, imagem: file.name }));
      addNotification({
        type: 'info',
        title: 'Imagem selecionada',
        message: `${file.name} será enviada com o produto`
      });
    }
  }, [addNotification]);

  const calculateMargemFromPercentage = useCallback((percentage: number) => {
    if (formData.precoCusto && formData.precoCusto > 0) {
      const newPrice = formData.precoCusto / (1 - percentage / 100);
      setFormData(prev => ({ ...prev, preco: Number(newPrice.toFixed(2)) }));
      setShowMargemCalculator(false);
    }
  }, [formData.precoCusto]);

  const getStockAlert = () => {
    if (formData.estoque === 0) {
      return { type: 'error', message: 'Produto sem estoque' };
    } else if (formData.estoqueMinimo && formData.estoque <= formData.estoqueMinimo) {
      return { type: 'warning', message: 'Estoque baixo - reabastecer' };
    }
    return null;
  };

  const stockAlert = getStockAlert();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingProduto ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: Whey Protein 1kg"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIAS_PRODUTO.map(categoria => (
                  <button
                    key={categoria.value}
                    type="button"
                    onClick={() => handleInputChange('categoria', categoria.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                      formData.categoria === categoria.value
                        ? categoria.color + ' border-current'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                    }`}
                  >
                    {categoria.label}
                  </button>
                ))}
              </div>
              {errors.categoria && <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preço de Custo
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precoCusto || ''}
                  onChange={(e) => handleInputChange('precoCusto', Number(e.target.value))}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.precoCusto ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0,00"
                />
              </div>
              {errors.precoCusto && <p className="text-red-500 text-xs mt-1">{errors.precoCusto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preço de Venda *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.preco || ''}
                  onChange={(e) => handleInputChange('preco', Number(e.target.value))}
                  className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.preco ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="0,00"
                />
                <button
                  type="button"
                  onClick={() => setShowMargemCalculator(!showMargemCalculator)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Calculadora de margem"
                >
                  <Calculator className="h-4 w-4" />
                </button>
              </div>
              {errors.preco && <p className="text-red-500 text-xs mt-1">{errors.preco}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Margem de Lucro
              </label>
              <div className={`px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 ${
                parseFloat(margemLucro) < 20 ? 'border-red-300 text-red-700 dark:border-red-600 dark:text-red-400' :
                parseFloat(margemLucro) < 40 ? 'border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-400' :
                'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400'
              }`}>
                <span className="font-medium">{margemLucro}%</span>
              </div>
            </div>
          </div>

          {/* Margin Calculator */}
          {showMargemCalculator && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">Calculadora de Margem</h4>
              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 40, 50].map(percentage => (
                  <button
                    key={percentage}
                    type="button"
                    onClick={() => calculateMargemFromPercentage(percentage)}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded text-sm font-medium transition-colors"
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                Clique na margem desejada para calcular o preço automaticamente
              </p>
            </div>
          )}

          {/* Stock Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estoque Atual
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque || ''}
                onChange={(e) => handleInputChange('estoque', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.estoque ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="0"
              />
              {errors.estoque && <p className="text-red-500 text-xs mt-1">{errors.estoque}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoqueMinimo || ''}
                onChange={(e) => handleInputChange('estoqueMinimo', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.estoqueMinimo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="5"
              />
              {errors.estoqueMinimo && <p className="text-red-500 text-xs mt-1">{errors.estoqueMinimo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor do Estoque
              </label>
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                R$ {valorEstoque}
              </div>
            </div>
          </div>

          {/* Stock Alert */}
          {stockAlert && (
            <div className={`p-3 rounded-lg border ${
              stockAlert.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                : 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
            }`}>
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">{stockAlert.message}</span>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ex: Growth"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fornecedor
              </label>
              <input
                type="text"
                value={formData.fornecedor}
                onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nome do fornecedor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código de Barras
              </label>
              <input
                type="text"
                value={formData.codigoBarras}
                onChange={(e) => handleInputChange('codigoBarras', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Código EAN/UPC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unidade *
              </label>
              <select
                value={formData.unidade}
                onChange={(e) => handleInputChange('unidade', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.unidade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione uma unidade</option>
                {unidades.map(unidade => (
                  <option key={unidade.id} value={unidade.nome}>
                    {unidade.nome}
                  </option>
                ))}
              </select>
              {errors.unidade && <p className="text-red-500 text-xs mt-1">{errors.unidade}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descrição detalhada do produto..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagem do Produto
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Upload
              </Button>
            </div>
            {formData.imagem && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Imagem selecionada: {formData.imagem}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => handleInputChange('ativo', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="ativo" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Produto ativo (disponível para venda)
            </label>
          </div>

          {/* Product Summary */}
          {formData.nome && formData.preco > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Resumo do Produto</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Nome:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.nome}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Preço:</span>
                  <div className="font-medium text-gray-900 dark:text-white">R$ {formData.preco.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Estoque:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.estoque} unidades</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Margem:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{margemLucro}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : editingProduto ? 'Atualizar Produto' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};