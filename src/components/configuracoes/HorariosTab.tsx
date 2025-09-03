// src/components/configuracoes/HorariosTab.tsx

import React, { useState, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button } from '@/components/common';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  MapPin, 
  Users,
  Calendar,
  Target,
  Save
} from 'lucide-react';
import type { HorarioFixo, NivelAula, AulaoConfig } from '@/types';

interface HorarioFixoFormData extends Omit<HorarioFixo, 'id'> {
  id?: number;
}

interface NivelFormData extends Omit<NivelAula, 'id'> {
  id?: number;
}

interface AulaoFormData extends Omit<AulaoConfig, 'id'> {
  id?: number;
}

const DIAS_SEMANA = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const CORES_NIVEIS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
];

export const HorariosTab: React.FC = () => {
  const { dadosMockados, setConfigCT } = useAppState();
  const { addNotification } = useNotifications();
  
  const [activeSection, setActiveSection] = useState<'niveis' | 'horarios' | 'aulaoes'>('niveis');
  const [editingNivel, setEditingNivel] = useState<NivelFormData | null>(null);
  const [editingHorario, setEditingHorario] = useState<HorarioFixoFormData | null>(null);
  const [editingAulao, setEditingAulao] = useState<AulaoFormData | null>(null);

  const configCT = dadosMockados.configCT;
  const niveisAula = configCT.niveisAula || [];
  const horariosFixos = configCT.horariosFixos || [];
  const aulaoes = configCT.aulaoes || [];

  // ======= GESTÃO DE NÍVEIS =======
  const handleSaveNivel = useCallback((nivelData: NivelFormData) => {
    const novoNivel: NivelAula = {
      id: nivelData.id || Date.now(),
      nome: nivelData.nome,
      descricao: nivelData.descricao,
      cor: nivelData.cor,
      ativo: nivelData.ativo
    };

    setConfigCT(prev => ({
      ...prev,
      niveisAula: nivelData.id 
        ? prev.niveisAula?.map(n => n.id === nivelData.id ? novoNivel : n) || [novoNivel]
        : [...(prev.niveisAula || []), novoNivel]
    }));

    addNotification({
      type: 'success',
      title: nivelData.id ? 'Nível atualizado' : 'Nível criado',
      message: `Nível "${novoNivel.nome}" foi ${nivelData.id ? 'atualizado' : 'criado'} com sucesso`
    });

    setEditingNivel(null);
  }, [setConfigCT, addNotification]);

  const handleDeleteNivel = useCallback((nivelId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este nível?')) {
      setConfigCT(prev => ({
        ...prev,
        niveisAula: prev.niveisAula?.filter(n => n.id !== nivelId) || []
      }));
      
      addNotification({
        type: 'success',
        title: 'Nível excluído',
        message: 'Nível foi removido com sucesso'
      });
    }
  }, [setConfigCT, addNotification]);

  // ======= GESTÃO DE HORÁRIOS FIXOS =======
  const handleSaveHorario = useCallback((horarioData: HorarioFixoFormData) => {
    const novoHorario: HorarioFixo = {
      id: horarioData.id || Date.now(),
      unidade: horarioData.unidade,
      diaSemana: horarioData.diaSemana,
      horaInicio: horarioData.horaInicio,
      horaFim: horarioData.horaFim,
      capacidade: horarioData.capacidade,
      nivelId: horarioData.nivelId,
      ativo: horarioData.ativo
    };

    setConfigCT(prev => ({
      ...prev,
      horariosFixos: horarioData.id 
        ? prev.horariosFixos?.map(h => h.id === horarioData.id ? novoHorario : h) || [novoHorario]
        : [...(prev.horariosFixos || []), novoHorario]
    }));

    addNotification({
      type: 'success',
      title: horarioData.id ? 'Horário atualizado' : 'Horário criado',
      message: 'Horário foi salvo com sucesso'
    });

    setEditingHorario(null);
  }, [setConfigCT, addNotification]);

  const handleDeleteHorario = useCallback((horarioId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este horário?')) {
      setConfigCT(prev => ({
        ...prev,
        horariosFixos: prev.horariosFixos?.filter(h => h.id !== horarioId) || []
      }));
      
      addNotification({
        type: 'success',
        title: 'Horário excluído',
        message: 'Horário foi removido com sucesso'
      });
    }
  }, [setConfigCT, addNotification]);

  // ======= GESTÃO DE AULÕES =======
  const handleSaveAulao = useCallback((aulaoData: AulaoFormData) => {
    const novoAulao: AulaoConfig = {
      id: aulaoData.id || Date.now(),
      nome: aulaoData.nome,
      data: aulaoData.data,
      horaInicio: aulaoData.horaInicio,
      horaFim: aulaoData.horaFim,
      unidade: aulaoData.unidade,
      capacidade: aulaoData.capacidade,
      nivelId: aulaoData.nivelId,
      valorEspecial: aulaoData.valorEspecial,
      descricao: aulaoData.descricao,
      ativo: aulaoData.ativo
    };

    setConfigCT(prev => ({
      ...prev,
      aulaoes: aulaoData.id 
        ? prev.aulaoes?.map(a => a.id === aulaoData.id ? novoAulao : a) || [novoAulao]
        : [...(prev.aulaoes || []), novoAulao]
    }));

    addNotification({
      type: 'success',
      title: aulaoData.id ? 'Aulão atualizado' : 'Aulão criado',
      message: 'Aulão foi salvo com sucesso'
    });

    setEditingAulao(null);
  }, [setConfigCT, addNotification]);

  const handleDeleteAulao = useCallback((aulaoId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este aulão?')) {
      setConfigCT(prev => ({
        ...prev,
        aulaoes: prev.aulaoes?.filter(a => a.id !== aulaoId) || []
      }));
      
      addNotification({
        type: 'success',
        title: 'Aulão excluído',
        message: 'Aulão foi removido com sucesso'
      });
    }
  }, [setConfigCT, addNotification]);

  // ======= FORMULÁRIOS =======
  const NivelForm = ({ nivel, onSave, onCancel }: {
    nivel: NivelFormData | null;
    onSave: (data: NivelFormData) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<NivelFormData>(
      nivel || { nome: '', descricao: '', cor: CORES_NIVEIS[0], ativo: true }
    );

    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-lg font-medium mb-4">
          {nivel ? 'Editar Nível' : 'Novo Nível'}
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              placeholder="Ex: Iniciante"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <input
              type="text"
              value={formData.descricao || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              placeholder="Descrição do nível"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cor</label>
            <div className="flex space-x-2">
              {CORES_NIVEIS.map(cor => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cor }))}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.cor === cor ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="nivelAtivo"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="nivelAtivo" className="text-sm">Nível ativo</label>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => onSave(formData)}
              disabled={!formData.nome.trim()}
              className="flex-1"
            >
              Salvar
            </Button>
            <Button
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const HorarioForm = ({ horario, onSave, onCancel }: {
    horario: HorarioFixoFormData | null;
    onSave: (data: HorarioFixoFormData) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState<HorarioFixoFormData>(
      horario || { 
        unidade: dadosMockados.unidades[0]?.nome || '',
        diaSemana: 'segunda',
        horaInicio: '08:00',
        horaFim: '09:00',
        capacidade: 8,
        ativo: true
      }
    );

    return (
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-lg font-medium mb-4">
          {horario ? 'Editar Horário' : 'Novo Horário'}
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unidade *</label>
            <select
              value={formData.unidade}
              onChange={(e) => setFormData(prev => ({ ...prev, unidade: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              required
            >
              {dadosMockados.unidades.map(unidade => (
                <option key={unidade.id} value={unidade.nome}>
                  {unidade.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dia da Semana *</label>
            <select
              value={formData.diaSemana}
              onChange={(e) => setFormData(prev => ({ ...prev, diaSemana: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              required
            >
              {DIAS_SEMANA.map(dia => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hora Início *</label>
            <input
              type="time"
              value={formData.horaInicio}
              onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Hora Fim *</label>
            <input
              type="time"
              value={formData.horaFim}
              onChange={(e) => setFormData(prev => ({ ...prev, horaFim: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Capacidade *</label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.capacidade}
              onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nível (Opcional)</label>
            <select
              value={formData.nivelId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, nivelId: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
            >
              <option value="">Todos os níveis</option>
              {niveisAula.filter(n => n.ativo).map(nivel => (
                <option key={nivel.id} value={nivel.id}>
                  {nivel.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="horarioAtivo"
            checked={formData.ativo}
            onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="horarioAtivo" className="text-sm">Horário ativo</label>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={() => onSave(formData)}
            disabled={!formData.unidade || !formData.horaInicio || !formData.horaFim}
            className="flex-1"
          >
            Salvar
          </Button>
          <Button
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configuração de Horários e Aulas
        </h3>
      </div>

      {/* Navegação das seções */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'niveis', label: 'Níveis de Aula', icon: Target },
            { key: 'horarios', label: 'Horários Fixos', icon: Clock },
            { key: 'aulaoes', label: 'Aulões', icon: Calendar }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeSection === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Seção Níveis */}
      {activeSection === 'niveis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Níveis de Aula
            </h4>
            <Button
              onClick={() => setEditingNivel({ nome: '', descricao: '', cor: CORES_NIVEIS[0], ativo: true })}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Novo Nível
            </Button>
          </div>

          {editingNivel && (
            <NivelForm
              nivel={editingNivel}
              onSave={handleSaveNivel}
              onCancel={() => setEditingNivel(null)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {niveisAula.map(nivel => (
              <div key={nivel.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: nivel.cor }}
                    />
                    <span className="font-medium">{nivel.nome}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingNivel(nivel)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNivel(nivel.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {nivel.descricao && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{nivel.descricao}</p>
                )}
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  nivel.ativo 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {nivel.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção Horários Fixos */}
      {activeSection === 'horarios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Horários Fixos Semanais
            </h4>
            <Button
              onClick={() => setEditingHorario({
                unidade: dadosMockados.unidades[0]?.nome || '',
                diaSemana: 'segunda',
                horaInicio: '08:00',
                horaFim: '09:00',
                capacidade: 8,
                ativo: true
              })}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Novo Horário
            </Button>
          </div>

          {editingHorario && (
            <HorarioForm
              horario={editingHorario}
              onSave={handleSaveHorario}
              onCancel={() => setEditingHorario(null)}
            />
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Dia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Capacidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {horariosFixos.map(horario => {
                  const nivel = horario.nivelId ? niveisAula.find(n => n.id === horario.nivelId) : null;
                  const diaLabel = DIAS_SEMANA.find(d => d.value === horario.diaSemana)?.label || horario.diaSemana;
                  
                  return (
                    <tr key={horario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {horario.unidade}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {diaLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {horario.horaInicio} - {horario.horaFim}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {horario.capacidade}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {nivel ? (
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: nivel.cor }}
                            />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {nivel.nome}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Todos os níveis
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          horario.ativo
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {horario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingHorario(horario)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHorario(horario.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seção Aulões */}
      {activeSection === 'aulaoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Aulões Programados
            </h4>
            <Button
              onClick={() => setEditingAulao({
                nome: '',
                data: new Date().toISOString().split('T')[0],
                horaInicio: '09:00',
                horaFim: '11:00',
                unidade: dadosMockados.unidades[0]?.nome || '',
                capacidade: 20,
                ativo: true
              })}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Novo Aulão
            </Button>
          </div>

          {editingAulao && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h4 className="text-lg font-medium mb-4">
                {editingAulao.id ? 'Editar Aulão' : 'Novo Aulão'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Nome do Aulão *</label>
                  <input
                    type="text"
                    value={editingAulao.nome}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, nome: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Ex: Aulão de Finais de Semana"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data *</label>
                  <input
                    type="date"
                    value={editingAulao.data}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, data: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unidade *</label>
                  <select
                    value={editingAulao.unidade}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, unidade: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    required
                  >
                    {dadosMockados.unidades.map(unidade => (
                      <option key={unidade.id} value={unidade.nome}>
                        {unidade.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hora Início *</label>
                  <input
                    type="time"
                    value={editingAulao.horaInicio}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, horaInicio: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hora Fim *</label>
                  <input
                    type="time"
                    value={editingAulao.horaFim}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, horaFim: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capacidade *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingAulao.capacidade}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, capacidade: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nível (Opcional)</label>
                  <select
                    value={editingAulao.nivelId || ''}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, nivelId: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                  >
                    <option value="">Todos os níveis</option>
                    {niveisAula.filter(n => n.ativo).map(nivel => (
                      <option key={nivel.id} value={nivel.id}>
                        {nivel.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor Especial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingAulao.valorEspecial || ''}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, valorEspecial: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Deixe vazio para usar valor padrão"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={editingAulao.descricao || ''}
                    onChange={(e) => setEditingAulao(prev => ({ ...prev!, descricao: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    rows={3}
                    placeholder="Descrição do aulão..."
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="aulaoAtivo"
                  checked={editingAulao.ativo}
                  onChange={(e) => setEditingAulao(prev => ({ ...prev!, ativo: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="aulaoAtivo" className="text-sm">Aulão ativo</label>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  onClick={() => handleSaveAulao(editingAulao)}
                  disabled={!editingAulao.nome.trim() || !editingAulao.data}
                  className="flex-1"
                >
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aulaoes.map(aulao => {
              const nivel = aulao.nivelId ? niveisAula.find(n => n.id === aulao.nivelId) : null;
              const dataFormatada = new Date(aulao.data).toLocaleDateString('pt-BR');
              const isPassado = new Date(aulao.data) < new Date();
              
              return (
                <div key={aulao.id} className={`bg-white dark:bg-gray-800 p-4 rounded-lg border ${
                  isPassado ? 'opacity-75' : ''
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">{aulao.nome}</h5>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingAulao(aulao)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAulao(aulao.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {dataFormatada} {isPassado && '(Passado)'}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {aulao.horaInicio} - {aulao.horaFim}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {aulao.unidade}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      Capacidade: {aulao.capacidade}
                    </div>
                    
                    {nivel && (
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: nivel.cor }}
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {nivel.nome}
                        </span>
                      </div>
                    )}
                    
                    {aulao.valorEspecial && (
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        R$ {aulao.valorEspecial.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {aulao.descricao && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {aulao.descricao}
                    </p>
                  )}

                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      aulao.ativo 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {aulao.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {aulaoes.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Nenhum aulão programado
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece criando seu primeiro aulão.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};