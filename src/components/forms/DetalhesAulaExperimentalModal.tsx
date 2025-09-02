// src/components/forms/DetalhesAulaExperimentalModal.tsx
import React, { memo } from 'react';
import { Modal } from '@/components/common';
import { 
  User, Calendar, Clock, MapPin, Phone, Mail, FileText,
  CheckCircle, XCircle, AlertCircle, Clock3, TrendingUp,
  Eye, History, GraduationCap, Star
} from 'lucide-react';
import type { AulaExperimental, ModalProps } from '@/types';

interface DetalhesAulaExperimentalModalProps extends ModalProps {
  aula: AulaExperimental | null;
}

export const DetalhesAulaExperimentalModal: React.FC<DetalhesAulaExperimentalModalProps> = memo(({
  isOpen,
  onClose,
  aula
}) => {
  if (!aula) return null;

  const getStatusColor = (status: string) => {
    const colors = {
      'agendada': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
      'realizada': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
      'nao-compareceu': 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
      'convertido': 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
      'inativo': 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    };
    return colors[status] || colors['agendada'];
  };

  const getStatusText = (status: string) => {
    const texts = {
      'agendada': 'Agendada',
      'realizada': 'Realizada',
      'nao-compareceu': 'Não Compareceu',
      'convertido': 'Convertido para Plano',
      'inativo': 'Inativo'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'agendada': <Clock3 className="h-4 w-4" />,
      'realizada': <CheckCircle className="h-4 w-4" />,
      'nao-compareceu': <XCircle className="h-4 w-4" />,
      'convertido': <TrendingUp className="h-4 w-4" />,
      'inativo': <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || icons['agendada'];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString('pt-BR')
    };
  };

  const agendamento = formatDateTime(aula.dataAgendamento);
  const realizacao = aula.dataRealizacao ? formatDateTime(aula.dataRealizacao) : null;
  const conversao = aula.dataConversao ? formatDateTime(aula.dataConversao) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <span>Detalhes da Aula Experimental</span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(aula.status)}`}>
            {getStatusIcon(aula.status)}
            {getStatusText(aula.status)}
          </span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Informações do Aluno */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Dados do Aluno
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome</label>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{aula.aluno}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Telefone</label>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Phone className="h-3 w-3 text-gray-500" />
                {aula.telefone}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <Mail className="h-3 w-3 text-gray-500" />
                {aula.email}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">ID do Aluno</label>
              <p className="text-sm text-gray-900 dark:text-white">#{aula.alunoId}</p>
            </div>
          </div>
        </div>

        {/* Informações da Aula */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Informações da Aula
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data Agendada</label>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {agendamento.date} às {agendamento.time}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Professor</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {aula.professor || 'Não definido'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Unidade</label>
              <p className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-500" />
                {aula.unidade}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Status Atual</label>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(aula.status)}`}>
                {getStatusIcon(aula.status)}
                {getStatusText(aula.status)}
              </span>
            </div>
          </div>

          {/* Datas Especiais */}
          {(realizacao || conversao) && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {realizacao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data de Realização</label>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                      {realizacao.date} às {realizacao.time}
                    </p>
                  </div>
                )}
                
                {conversao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data de Conversão</label>
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      {conversao.date} às {conversao.time}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Plano Convertido */}
        {aula.planoConvertido && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Plano Convertido
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Tipo de Plano</label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                  {aula.planoConvertido.tipo === 'mensalidade' ? 'Mensalidade' : 'Plataforma Parceira'}
                </p>
              </div>
              
              {aula.planoConvertido.planoId && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">ID do Plano</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    #{aula.planoConvertido.planoId}
                  </p>
                </div>
              )}
              
              {aula.planoConvertido.plataformaParceira && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Plataforma</label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {aula.planoConvertido.plataformaParceira}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        {aula.observacoes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              Observações
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">{aula.observacoes}</p>
            </div>
          </div>
        )}

        {/* Histórico */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            Histórico de Alterações
          </h3>
          
          <div className="space-y-3">
            {aula.historico.map((item, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.statusAnterior ? `${item.statusAnterior} → ` : ''}{item.statusNovo}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(item.data).full}
                  </span>
                </div>
                
                {item.observacao && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.observacao}</p>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Por: {item.usuarioResponsavel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Informações do Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">ID da Aula</label>
              <p className="text-gray-900 dark:text-white">#{aula.id}</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Criado em</label>
              <p className="text-gray-900 dark:text-white">{formatDateTime(aula.criadoEm).full}</p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Última atualização</label>
              <p className="text-gray-900 dark:text-white">{formatDateTime(aula.atualizadoEm).full}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
});