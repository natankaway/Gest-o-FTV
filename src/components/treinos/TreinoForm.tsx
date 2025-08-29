import React, { memo, useCallback, useEffect, useState } from 'react';
import { useAppState } from '@/contexts';
import { Button } from '@/components/common';
import { Save, X, Clock, Target, BookOpen, MapPin, User, Layers } from 'lucide-react';
import type { TreinoFormData } from '@/types';
import type { PranchetaData } from '@/types/canvas';

interface TreinoFormProps {
  treino?: Partial<TreinoFormData> & { id?: number | string; pranchetaData?: PranchetaData };
  onSave: (data: TreinoFormData & { pranchetaData?: PranchetaData }) => void;
  onCancel: () => void;
  onDataChange: (data: TreinoFormData) => void;
  isEmbedded?: boolean;
}

export const TreinoForm: React.FC<TreinoFormProps> = memo(({
  treino,
  onSave,
  onCancel,
  onDataChange,
  isEmbedded = false
}) => {
  const { dadosMockados, userLogado } = useAppState();
  const [formData, setFormData] = useState<Partial<TreinoFormData>>({});

  useEffect(() => {
    setFormData({
      nome: treino?.nome || '',
      tipo: treino?.tipo || 'tecnico',
      nivel: treino?.nivel || 'iniciante',
      duracao: treino?.duracao || 60,
      objetivo: treino?.objetivo || '',
      professorId: treino?.professorId || userLogado?.id || 0,
      unidade: treino?.unidade || '',
      observacoes: treino?.observacoes || ''
    });
  }, [treino, userLogado]);

  const handleInputChange = useCallback((field: keyof TreinoFormData, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);
    onDataChange(updatedFormData as TreinoFormData);
  }, [formData, onDataChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as TreinoFormData);
  };

  const formElementClasses = "w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"; // <-- ALTERADO: Classe base para todos os campos

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {isEmbedded && (
             <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
                <BookOpen size={20} />
                Detalhes do Treino
            </h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Nome do Treino *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className={formElementClasses} // <-- ALTERADO
              placeholder="Ex: Treino de saque"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"><Layers size={16} className="inline mr-1" />Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value as TreinoFormData['tipo'])}
              className={formElementClasses} // <-- ALTERADO
            >
              <option value="tecnico">Técnico</option>
              <option value="fisico">Físico</option>
              <option value="tatico">Tático</option>
              <option value="jogo">Jogo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"><Target size={16} className="inline mr-1" />Nível</label>
            <select
              value={formData.nivel}
              onChange={(e) => handleInputChange('nivel', e.target.value as TreinoFormData['nivel'])}
              className={formElementClasses} // <-- ALTERADO
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"><Clock size={16} className="inline mr-1" />Duração (min) *</label>
            <input
              type="number"
              min="15"
              step="15"
              value={formData.duracao}
              onChange={(e) => handleInputChange('duracao', parseInt(e.target.value))}
              className={formElementClasses} // <-- ALTERADO
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"><User size={16} className="inline mr-1" />Professor *</label>
            <select
              value={formData.professorId}
              onChange={(e) => handleInputChange('professorId', parseInt(e.target.value))}
              className={formElementClasses} // <-- ALTERADO
            >
              <option value="">Selecione um professor</option>
              {dadosMockados.professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Objetivo *</label>
            <textarea
              value={formData.objetivo}
              onChange={(e) => handleInputChange('objetivo', e.target.value)}
              rows={3}
              className={formElementClasses} // <-- ALTERADO
              placeholder="Descreva o objetivo principal do treino..."
            />
          </div>
        </div>
      </div>
    </form>
  );
});

TreinoForm.displayName = 'TreinoForm';
