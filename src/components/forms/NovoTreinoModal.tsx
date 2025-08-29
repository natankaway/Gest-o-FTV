import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { X, Plus, Trash, Clock, Target, Play, GripVertical } from 'lucide-react';
import type { Treino, TreinoFormData, Exercicio } from '@/types';

interface NovoTreinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTreino?: Treino | null;
}

const INITIAL_FORM_DATA: TreinoFormData = {
  nome: '',
  tipo: 'tecnico',
  nivel: 'iniciante',
  duracao: 60,
  objetivo: '',
  equipamentos: [],
  exercicios: [],
  professorId: 0,
  unidade: 'Centro',
  observacoes: ''
};

const TIPOS_TREINO = [
  { value: 'tecnico', label: 'Técnico', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { value: 'fisico', label: 'Físico', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  { value: 'tatico', label: 'Tático', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { value: 'jogo', label: 'Jogo', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' }
];

const EQUIPAMENTOS_DISPONIVEIS = [
  'Bola',
  'Rede',
  'Cones',
  'Escada de Agilidade',
  'Colchonetes',
  'Marcadores',
  'Apito',
  'Cronômetro',
  'Pranchas',
  'Elásticos'
];

export const NovoTreinoModal: React.FC<NovoTreinoModalProps> = ({
  isOpen,
  onClose,
  editingTreino
}) => {
  const { dadosMockados, setTreinos } = useAppState();
  const { professores, exercicios, unidades } = dadosMockados;
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState<TreinoFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExercicios, setSelectedExercicios] = useState<Exercicio[]>([]);
  const [showExercicioLibrary, setShowExercicioLibrary] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize form when editing
  useEffect(() => {
    if (editingTreino) {
      const editFormData: TreinoFormData = {
        nome: editingTreino.nome,
        tipo: editingTreino.tipo,
        nivel: editingTreino.nivel,
        duracao: editingTreino.duracao,
        objetivo: editingTreino.objetivo,
        equipamentos: editingTreino.equipamentos,
        exercicios: editingTreino.exercicios,
        professorId: editingTreino.professorId,
        unidade: editingTreino.unidade,
        observacoes: editingTreino.observacoes || ''
      };
      
      setFormData(editFormData);
      
      // Set selected exercises based on exercicios in the treino
      const treinoExercicios = editingTreino.exercicios.map(ex => {
        const exercicioCompleto = exercicios.find(e => e.id.toString() === ex.id);
        return exercicioCompleto || {
          id: parseInt(ex.id),
          nome: ex.nome,
          duracao: ex.duracao,
          descricao: ex.descricao,
          categoria: 'tecnica' as const,
          equipamentos: [],
          nivel: 'iniciante' as const
        };
      });
      setSelectedExercicios(treinoExercicios);
    } else {
      setFormData(INITIAL_FORM_DATA);
      setSelectedExercicios([]);
    }
    setErrors({});
    setShowExercicioLibrary(false);
  }, [editingTreino, isOpen, exercicios]);

  // Update duration when exercises change
  useEffect(() => {
    const totalDuration = formData.exercicios.reduce((acc, ex) => acc + ex.duracao, 0);
    if (totalDuration !== formData.duracao) {
      setFormData(prev => ({ ...prev, duracao: totalDuration }));
    }
  }, [formData.exercicios]);

  const availableProfessores = useMemo(() => {
    return professores.filter(professor => professor.ativo);
  }, [professores]);

  const filteredExercicios = useMemo(() => {
    return exercicios.filter(ex => !selectedExercicios.some(sel => sel.id === ex.id));
  }, [exercicios, selectedExercicios]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do treino é obrigatório';
    }

    if (!formData.professorId) {
      newErrors.professorId = 'Professor é obrigatório';
    }

    if (!formData.objetivo.trim()) {
      newErrors.objetivo = 'Objetivo do treino é obrigatório';
    }

    if (formData.exercicios.length === 0) {
      newErrors.exercicios = 'Pelo menos um exercício deve ser adicionado';
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
      const professor = professores.find(p => p.id === formData.professorId);
      
      if (editingTreino) {
        // Update existing treino
        setTreinos(prev => prev.map(treino => {
          if (treino.id === editingTreino.id) {
            const updatedTreino: Treino = {
              ...treino,
              ...formData,
              professor: professor?.nome || ''
            };
            
            return updatedTreino;
          }
          return treino;
        }));
        
        addNotification({
          type: 'success',
          title: 'Treino atualizado',
          message: `Treino "${formData.nome}" foi atualizado com sucesso!`
        });
      } else {
        // Create new treino
        const novoTreino: Treino = {
          id: Date.now(),
          ...formData,
          professor: professor?.nome || '',
          data: new Date().toISOString().substring(0, 10),
          status: 'planejado'
        };

        setTreinos(prev => [...prev, novoTreino]);
        
        addNotification({
          type: 'success',
          title: 'Treino criado',
          message: `Treino "${formData.nome}" criado com sucesso!`
        });
      }

      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar o treino. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, editingTreino, setTreinos, addNotification, onClose, professores]);

  const handleInputChange = useCallback((field: keyof TreinoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleAddExercicio = useCallback((exercicio: Exercicio) => {
    const exercicioTreino = {
      id: exercicio.id.toString(),
      nome: exercicio.nome,
      duracao: exercicio.duracao,
      descricao: exercicio.descricao,
      ordem: formData.exercicios.length + 1
    };

    setFormData(prev => ({
      ...prev,
      exercicios: [...prev.exercicios, exercicioTreino]
    }));

    setSelectedExercicios(prev => [...prev, exercicio]);
    
    // Auto-add equipment if not already included
    const newEquipamentos = [...formData.equipamentos];
    exercicio.equipamentos.forEach(eq => {
      if (!newEquipamentos.includes(eq)) {
        newEquipamentos.push(eq);
      }
    });
    setFormData(prev => ({ ...prev, equipamentos: newEquipamentos }));
  }, [formData.exercicios, formData.equipamentos]);

  const handleRemoveExercicio = useCallback((index: number) => {
    const exercicioToRemove = formData.exercicios[index];
    if (!exercicioToRemove) return;
    
    const exercicioCompleto = selectedExercicios.find(ex => ex.id.toString() === exercicioToRemove.id);
    
    setFormData(prev => ({
      ...prev,
      exercicios: prev.exercicios.filter((_, i) => i !== index).map((ex, newIndex) => ({
        ...ex,
        ordem: newIndex + 1
      }))
    }));

    if (exercicioCompleto) {
      setSelectedExercicios(prev => prev.filter(ex => ex.id !== exercicioCompleto.id));
    }
  }, [formData.exercicios, selectedExercicios]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newExercicios = [...formData.exercicios];
    const draggedItem = newExercicios[draggedIndex];
    
    if (!draggedItem) {
      setDraggedIndex(null);
      return;
    }
    
    // Remove from old position
    newExercicios.splice(draggedIndex, 1);
    
    // Insert at new position
    newExercicios.splice(dropIndex, 0, draggedItem);
    
    // Update order
    const reorderedExercicios = newExercicios.map((ex, index) => ({
      ...ex,
      ordem: index + 1
    }));

    setFormData(prev => ({ ...prev, exercicios: reorderedExercicios }));
    setDraggedIndex(null);
  }, [draggedIndex, formData.exercicios]);

  const handleToggleEquipamento = useCallback((equipamento: string) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.includes(equipamento)
        ? prev.equipamentos.filter(eq => eq !== equipamento)
        : [...prev.equipamentos, equipamento]
    }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingTreino ? 'Editar Treino' : 'Novo Treino'}
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
                Nome do Treino *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ex: Treino Técnico - Básico"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Professor *
              </label>
              <select
                value={formData.professorId || ''}
                onChange={(e) => handleInputChange('professorId', Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.professorId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecione um professor</option>
                {availableProfessores.map(professor => (
                  <option key={professor.id} value={professor.id}>
                    {professor.nome}
                  </option>
                ))}
              </select>
              {errors.professorId && <p className="text-red-500 text-xs mt-1">{errors.professorId}</p>}
            </div>
          </div>

          {/* Type, Level, Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Treino
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS_TREINO.map(tipo => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => handleInputChange('tipo', tipo.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.tipo === tipo.value
                        ? tipo.color
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tipo.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nível
              </label>
              <select
                value={formData.nivel}
                onChange={(e) => handleInputChange('nivel', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duração Total
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => handleInputChange('duracao', Number(e.target.value))}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  readOnly
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">min</span>
              </div>
            </div>
          </div>

          {/* Objective and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Objetivo *
              </label>
              <textarea
                value={formData.objetivo}
                onChange={(e) => handleInputChange('objetivo', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.objetivo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Descreva o objetivo principal do treino..."
              />
              {errors.objetivo && <p className="text-red-500 text-xs mt-1">{errors.objetivo}</p>}
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

          {/* Equipment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Equipamentos Necessários
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {EQUIPAMENTOS_DISPONIVEIS.map(equipamento => (
                <button
                  key={equipamento}
                  type="button"
                  onClick={() => handleToggleEquipamento(equipamento)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.equipamentos.includes(equipamento)
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  } border`}
                >
                  {equipamento}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exercícios do Treino *
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Arraste para reordenar os exercícios
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowExercicioLibrary(!showExercicioLibrary)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Adicionar Exercício
              </Button>
            </div>

            {errors.exercicios && <p className="text-red-500 text-xs mb-2">{errors.exercicios}</p>}

            {/* Exercise Library */}
            {showExercicioLibrary && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Biblioteca de Exercícios</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredExercicios.map(exercicio => (
                    <div
                      key={exercicio.id}
                      className="bg-white dark:bg-gray-600 rounded-lg p-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => handleAddExercicio(exercicio)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">{exercicio.nome}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{exercicio.descricao}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {exercicio.duracao}min
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <Target className="h-3 w-3 inline mr-1" />
                              {exercicio.nivel}
                            </span>
                          </div>
                        </div>
                        <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Exercises */}
            <div className="space-y-2">
              {formData.exercicios.map((exercicio, index) => (
                <div
                  key={`${exercicio.id}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {exercicio.ordem}. {exercicio.nome}
                        </h5>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {exercicio.duracao}min
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercicio(index)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{exercicio.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {formData.exercicios.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Play className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum exercício adicionado ainda</p>
                <p className="text-sm">Clique em "Adicionar Exercício" para começar</p>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Observações adicionais sobre o treino..."
            />
          </div>

          {/* Training Preview */}
          {formData.exercicios.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Preview do Treino</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Exercícios:</span>
                  <span className="text-blue-600 dark:text-blue-200 ml-2">{formData.exercicios.length}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Duração Total:</span>
                  <span className="text-blue-600 dark:text-blue-200 ml-2">{formData.duracao} minutos</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Equipamentos:</span>
                  <span className="text-blue-600 dark:text-blue-200 ml-2">{formData.equipamentos.length}</span>
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
              {isSubmitting ? 'Salvando...' : editingTreino ? 'Atualizar Treino' : 'Criar Treino'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};