import React, { memo, useState, useCallback, useEffect } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button, Input } from '@/components/common';
import { Modal } from '@/components/common/Modal';
import { 
  Save, 
  Clock, 
  Target, 
  BookOpen,
  Plus,
  X,
  Package
} from 'lucide-react';
import type { TreinoComPrancheta, PranchetaData, Exercicio } from '@/types';

interface TreinoFormProps {
  isOpen: boolean;
  onClose: () => void;
  treino?: TreinoComPrancheta | null;
  pranchetaData?: PranchetaData;
  selectedExercicios?: Exercicio[];
}

interface TreinoFormData {
  nome: string;
  tipo: 'tecnico' | 'fisico' | 'tatico' | 'jogo';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao: number;
  objetivo: string;
  equipamentos: string[];
  observacoes: string;
  professorId: number;
  unidade: string;
  data: string;
  status: 'planejado' | 'em-andamento' | 'concluido';
}

const EQUIPAMENTOS_DISPONIVEIS = [
  'Bola de futevôlei',
  'Rede',
  'Cones',
  'Coletes',
  'Cronômetro',
  'Apito',
  'Marcadores',
  'Elástico',
  'Escada de agilidade',
  'Bola medicinal',
  'Bambolê',
  'Bastões',
];

const TIPOS_TREINO = [
  { value: 'tecnico', label: 'Técnico', description: 'Foco em fundamentos e técnicas individuais' },
  { value: 'fisico', label: 'Físico', description: 'Condicionamento físico e resistência' },
  { value: 'tatico', label: 'Tático', description: 'Estratégias de jogo e posicionamento' },
  { value: 'jogo', label: 'Jogo', description: 'Simulação de partidas e situações reais' },
];

const NIVEIS = [
  { value: 'iniciante', label: 'Iniciante', description: 'Para alunos começando no futevôlei' },
  { value: 'intermediario', label: 'Intermediário', description: 'Para alunos com conhecimento básico' },
  { value: 'avancado', label: 'Avançado', description: 'Para alunos experientes' },
];

export const TreinoForm: React.FC<TreinoFormProps> = memo(({
  isOpen,
  onClose,
  treino,
  pranchetaData,
  selectedExercicios = [],
}) => {
  const { dadosMockados, setTreinos } = useAppState();
  const { professores, unidades } = dadosMockados;
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState<TreinoFormData>({
    nome: '',
    tipo: 'tecnico',
    nivel: 'intermediario',
    duracao: 60,
    objetivo: '',
    equipamentos: [],
    observacoes: '',
    professorId: professores.length > 0 ? professores[0]?.id || 1 : 1,
    unidade: unidades.length > 0 ? unidades[0]?.nome || 'Centro' : 'Centro',
    data: '',
    status: 'planejado',
  });

  const [exerciciosSelecionados, setExerciciosSelecionados] = useState<Exercicio[]>([]);
  const [novoEquipamento, setNovoEquipamento] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (treino) {
      setFormData({
        nome: treino.nome,
        tipo: treino.tipo,
        nivel: treino.nivel,
        duracao: treino.duracao,
        objetivo: treino.objetivo,
        equipamentos: treino.equipamentos,
        observacoes: treino.observacoes || '',
        professorId: treino.professorId,
        unidade: treino.unidade,
        data: treino.data || '',
        status: treino.status || 'planejado',
      });
      
      // Convert existing exercises to Exercicio format
      const exercicios = treino.exercicios.map(ex => ({
        id: parseInt(ex.id),
        nome: ex.nome,
        duracao: ex.duracao,
        descricao: ex.descricao,
        categoria: 'tecnica' as const,
        equipamentos: [],
        nivel: treino.nivel,
      }));
      setExerciciosSelecionados(exercicios);
    } else {
      // Reset form for new training
      const today = new Date().toISOString().split('T')[0] || '';
      setFormData({
        nome: '',
        tipo: 'tecnico',
        nivel: 'intermediario',
        duracao: selectedExercicios.reduce((acc, ex) => acc + ex.duracao, 60),
        objetivo: '',
        equipamentos: [],
        observacoes: '',
        professorId: professores.length > 0 ? professores[0]?.id || 1 : 1,
        unidade: unidades.length > 0 ? unidades[0]?.nome || 'Centro' : 'Centro',
        data: today,
        status: 'planejado',
      });
      setExerciciosSelecionados([...selectedExercicios]);
    }
    setErrors({});
  }, [treino, selectedExercicios, professores, unidades, isOpen]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do treino é obrigatório';
    }

    if (!formData.objetivo.trim()) {
      newErrors.objetivo = 'Objetivo do treino é obrigatório';
    }

    if (formData.duracao < 15) {
      newErrors.duracao = 'Duração mínima é 15 minutos';
    }

    if (formData.duracao > 240) {
      newErrors.duracao = 'Duração máxima é 240 minutos';
    }

    if (!formData.data) {
      newErrors.data = 'Data do treino é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const professor = professores.find(p => p.id === formData.professorId);
      
      const exerciciosFormatted = exerciciosSelecionados.map((ex, index) => ({
        id: ex.id.toString(),
        nome: ex.nome,
        duracao: ex.duracao,
        descricao: ex.descricao,
        ordem: index + 1,
      }));

      const treinoData: TreinoComPrancheta = {
        id: treino?.id || Date.now(),
        nome: formData.nome,
        tipo: formData.tipo,
        nivel: formData.nivel,
        duracao: formData.duracao,
        objetivo: formData.objetivo,
        equipamentos: formData.equipamentos,
        exercicios: exerciciosFormatted,
        observacoes: formData.observacoes,
        professorId: formData.professorId,
        professor: professor?.nome || 'Professor não encontrado',
        unidade: formData.unidade,
        data: formData.data,
        status: formData.status,
        ...(pranchetaData && { pranchetaData }),
      };

      if (treino) {
        // Update existing training
        setTreinos(prev => prev.map(t => t.id === treino.id ? treinoData : t));
        addNotification({
          type: 'success',
          title: 'Treino atualizado',
          message: 'Treino foi atualizado com sucesso'
        });
      } else {
        // Create new training
        setTreinos(prev => [...prev, treinoData]);
        addNotification({
          type: 'success',
          title: 'Treino criado',
          message: 'Novo treino foi criado com sucesso'
        });
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao salvar treino. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  }, [formData, exerciciosSelecionados, pranchetaData, treino, professores, validateForm, setTreinos, addNotification, onClose]);

  // Handle equipment
  const adicionarEquipamento = useCallback((equipamento: string) => {
    if (equipamento && !formData.equipamentos.includes(equipamento)) {
      setFormData(prev => ({
        ...prev,
        equipamentos: [...prev.equipamentos, equipamento]
      }));
    }
  }, [formData.equipamentos]);

  const removerEquipamento = useCallback((equipamento: string) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.filter(eq => eq !== equipamento)
    }));
  }, []);

  const adicionarNovoEquipamento = useCallback(() => {
    if (novoEquipamento.trim()) {
      adicionarEquipamento(novoEquipamento.trim());
      setNovoEquipamento('');
    }
  }, [novoEquipamento, adicionarEquipamento]);

  // Remove exercise
  const removerExercicio = useCallback((exercicioId: number) => {
    setExerciciosSelecionados(prev => prev.filter(ex => ex.id !== exercicioId));
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={treino ? 'Editar Treino' : 'Novo Treino'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Nome do Treino"
              required
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              error={errors.nome}
              placeholder="Ex: Treino de Defesa 2x2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tipo de Treino
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {TIPOS_TREINO.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label} - {tipo.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Nível
            </label>
            <select
              value={formData.nivel}
              onChange={(e) => setFormData(prev => ({ ...prev, nivel: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {NIVEIS.map(nivel => (
                <option key={nivel.value} value={nivel.value}>
                  {nivel.label} - {nivel.description}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Duração (minutos)"
            type="number"
            min={15}
            max={240}
            required
            value={formData.duracao}
            onChange={(e) => setFormData(prev => ({ ...prev, duracao: parseInt(e.target.value) || 0 }))}
            error={errors.duracao}
          />

          <Input
            label="Data do Treino"
            type="date"
            required
            value={formData.data}
            onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
            error={errors.data}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Professor
            </label>
            <select
              value={formData.professorId}
              onChange={(e) => setFormData(prev => ({ ...prev, professorId: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {professores.map(professor => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Unidade
            </label>
            <select
              value={formData.unidade}
              onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.nome}>
                  {unidade.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Objetivo do Treino
          </label>
          <textarea
            value={formData.objetivo}
            onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
            rows={3}
            className={`w-full p-3 border rounded-lg resize-none ${
              errors.objetivo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="Descreva o objetivo principal deste treino..."
          />
          {errors.objetivo && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.objetivo}</p>
          )}
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
            <Package className="inline w-4 h-4 mr-1" />
            Equipamentos Necessários
          </label>
          
          {/* Selected equipment */}
          {formData.equipamentos.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.equipamentos.map(equipamento => (
                <span
                  key={equipamento}
                  className="inline-flex items-center bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
                >
                  {equipamento}
                  <button
                    type="button"
                    onClick={() => removerEquipamento(equipamento)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Available equipment */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {EQUIPAMENTOS_DISPONIVEIS
                .filter(eq => !formData.equipamentos.includes(eq))
                .map(equipamento => (
                <button
                  key={equipamento}
                  type="button"
                  onClick={() => adicionarEquipamento(equipamento)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  + {equipamento}
                </button>
              ))}
            </div>

            {/* Add custom equipment */}
            <div className="flex space-x-2">
              <Input
                placeholder="Adicionar equipamento personalizado..."
                value={novoEquipamento}
                onChange={(e) => setNovoEquipamento(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && adicionarNovoEquipamento()}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={adicionarNovoEquipamento}
                leftIcon={<Plus size={16} />}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Exercises */}
        {exerciciosSelecionados.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              <BookOpen className="inline w-4 h-4 mr-1" />
              Exercícios Selecionados ({exerciciosSelecionados.length})
            </label>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {exerciciosSelecionados.map((exercicio, index) => (
                <div
                  key={exercicio.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{exercicio.nome}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {exercicio.duracao} min
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerExercicio(exercicio.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas Preview */}
        {pranchetaData && pranchetaData.items.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              <Target className="inline w-4 h-4 mr-1" />
              Prancheta Tática
            </label>
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ Prancheta tática será salva com este treino ({pranchetaData.items.length} elementos)
              </p>
            </div>
          </div>
        )}

        {/* Observations */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Observações (Opcional)
          </label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Observações adicionais sobre o treino..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            leftIcon={<Save size={16} />}
          >
            {treino ? 'Atualizar' : 'Criar'} Treino
          </Button>
        </div>
      </form>
    </Modal>
  );
});