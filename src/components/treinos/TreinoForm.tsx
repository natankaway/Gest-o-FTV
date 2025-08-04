import React, { useState, useCallback, memo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { 
  Save, 
  X, 
  Clock, 
  Target, 
  BookOpen,
  MapPin,
  User,
  Layers
} from 'lucide-react';
import type { TreinoFormData } from '@/types';
import type { PranchetaData } from '@/types/canvas';

interface FormData {
  nome: string;
  tipo: 'tecnico' | 'fisico' | 'tatico' | 'jogo';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao: number;
  objetivo: string;
  equipamentos: string[];
  exercicios: any[];
  observacoes: string;
  professorId: number;
  unidade: string;
  data: string;
  status: 'planejado' | 'em-andamento' | 'concluido';
}

interface TreinoFormProps {
  treino?: Partial<TreinoFormData> & { id?: number; pranchetaData?: PranchetaData };
  onSave: (data: TreinoFormData & { pranchetaData?: PranchetaData }) => void;
  onCancel: () => void;
  pranchetaData?: PranchetaData | undefined; // Allow undefined explicitly
  isEmbedded?: boolean; // New prop for embedded mode in split-screen
}

export const TreinoForm: React.FC<TreinoFormProps> = memo(({
  treino,
  onSave,
  onCancel,
  pranchetaData,
  isEmbedded = false
}) => {
  const { dadosMockados, userLogado, unidadeSelecionada } = useAppState();
  const { addNotification } = useNotifications();

  const defaultData = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<FormData>({
    nome: treino?.nome || '',
    tipo: treino?.tipo || 'tecnico',
    nivel: treino?.nivel || 'iniciante',
    duracao: treino?.duracao || 60,
    objetivo: treino?.objetivo || '',
    equipamentos: treino?.equipamentos || [],
    exercicios: treino?.exercicios || [],
    observacoes: treino?.observacoes || '',
    professorId: treino?.professorId || userLogado?.id || 0,
    unidade: treino?.unidade || unidadeSelecionada || '',
    data: (treino?.data || defaultData) as string,
    status: treino?.status || 'planejado',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Available equipment options
  const equipamentosDisponiveis = [
    'Bola de futevôlei',
    'Rede',
    'Cones',
    'Arcos',
    'Cordas',
    'Escada de agilidade',
    'Coletes',
    'Marcadores',
    'Cronômetro',
    'Prancheta',
    'Apito',
    'Água',
  ];

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome do treino é obrigatório';
    }

    if (!formData.objetivo?.trim()) {
      newErrors.objetivo = 'Objetivo do treino é obrigatório';
    }

    if (!formData.duracao || formData.duracao < 15) {
      newErrors.duracao = 'Duração mínima é 15 minutos';
    }

    if (formData.duracao && formData.duracao > 240) {
      newErrors.duracao = 'Duração máxima é 240 minutos';
    }

    if (!formData.professorId) {
      newErrors.professorId = 'Professor é obrigatório';
    }

    if (!formData.unidade?.trim()) {
      newErrors.unidade = 'Unidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is being edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleEquipmentToggle = useCallback((equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.includes(equipment)
        ? prev.equipamentos.filter(e => e !== equipment)
        : [...prev.equipamentos, equipment]
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Dados inválidos',
        message: 'Verifique os campos obrigatórios'
      });
      return;
    }

    setIsSaving(true);

    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataToSave: any = {
        nome: formData.nome,
        tipo: formData.tipo,
        nivel: formData.nivel,
        duracao: formData.duracao,
        objetivo: formData.objetivo,
        equipamentos: formData.equipamentos,
        exercicios: formData.exercicios,
        observacoes: formData.observacoes || undefined,
        professorId: formData.professorId,
        unidade: formData.unidade,
        data: formData.data || undefined,
        status: formData.status || undefined,
        pranchetaData: pranchetaData || treino?.pranchetaData
      };

      onSave(dataToSave);

      addNotification({
        type: 'success',
        title: 'Treino salvo',
        message: `Treino "${formData.nome}" foi ${treino ? 'atualizado' : 'criado'} com sucesso`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar o treino'
      });
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formData, pranchetaData, treino, onSave, addNotification]);

  const professores = dadosMockados.professores;
  const unidades = dadosMockados.unidades;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {!isEmbedded && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen size={20} />
              {treino ? 'Editar Treino' : 'Novo Treino'}
            </h2>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSaving}
              >
                <X size={16} />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                loading={isSaving}
              >
                <Save size={16} />
                {treino ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Treino *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                errors.nome 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-gray-100`}
              placeholder="Ex: Treino de saque e recepção"
            />
            {errors.nome && (
              <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Layers size={16} className="inline mr-1" />
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value as FormData['tipo'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="tecnico">Técnico</option>
              <option value="fisico">Físico</option>
              <option value="tatico">Tático</option>
              <option value="jogo">Jogo</option>
            </select>
          </div>

          {/* Nível */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Target size={16} className="inline mr-1" />
              Nível
            </label>
            <select
              value={formData.nivel}
              onChange={(e) => handleInputChange('nivel', e.target.value as FormData['nivel'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>

          {/* Duração */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock size={16} className="inline mr-1" />
              Duração (minutos) *
            </label>
            <input
              type="number"
              min="15"
              max="240"
              step="15"
              value={formData.duracao}
              onChange={(e) => handleInputChange('duracao', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                errors.duracao 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-gray-100`}
            />
            {errors.duracao && (
              <p className="text-red-500 text-sm mt-1">{errors.duracao}</p>
            )}
          </div>

          {/* Professor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User size={16} className="inline mr-1" />
              Professor *
            </label>
            <select
              value={formData.professorId}
              onChange={(e) => handleInputChange('professorId', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                errors.professorId 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-gray-100`}
            >
              <option value="">Selecione um professor</option>
              {professores.map(professor => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
            {errors.professorId && (
              <p className="text-red-500 text-sm mt-1">{errors.professorId}</p>
            )}
          </div>

          {/* Unidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Unidade *
            </label>
            <select
              value={formData.unidade}
              onChange={(e) => handleInputChange('unidade', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                errors.unidade 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-gray-100`}
            >
              <option value="">Selecione uma unidade</option>
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.nome}>
                  {unidade.nome}
                </option>
              ))}
            </select>
            {errors.unidade && (
              <p className="text-red-500 text-sm mt-1">{errors.unidade}</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Objetivo */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objetivo *
            </label>
            <textarea
              value={formData.objetivo}
              onChange={(e) => handleInputChange('objetivo', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical ${
                errors.objetivo 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } text-gray-900 dark:text-gray-100`}
              placeholder="Descreva o objetivo principal do treino..."
            />
            {errors.objetivo && (
              <p className="text-red-500 text-sm mt-1">{errors.objetivo}</p>
            )}
          </div>

          {/* Equipamentos */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Equipamentos Necessários
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {equipamentosDisponiveis.map(equipment => (
                <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.equipamentos.includes(equipment)}
                    onChange={() => handleEquipmentToggle(equipment)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {equipment}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-vertical bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Observações adicionais sobre o treino..."
            />
          </div>
        </div>
      </div>
    </form>
  );
});

TreinoForm.displayName = 'TreinoForm';