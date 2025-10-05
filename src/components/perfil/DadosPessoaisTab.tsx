// src/components/perfil/DadosPessoaisTab.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Input, Button } from '@/components/common';
import { Camera, User, Mail, Phone, Calendar, CreditCard, MapPin } from 'lucide-react';

interface DadosFormData {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cpf: string;
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

interface FormErrors {
  [key: string]: string;
}

export const DadosPessoaisTab: React.FC = () => {
  const { userLogado, dadosMockados, setAlunos } = useAppState();
  const { addNotification } = useNotifications();

  const alunoAtual = useMemo(() => {
    if (!userLogado || userLogado.perfil !== 'aluno') return null;
    return dadosMockados.alunos.find(a => a.id === userLogado.id);
  }, [userLogado, dadosMockados.alunos]);

  const [formData, setFormData] = useState<DadosFormData>({
    nome: alunoAtual?.nome || '',
    email: alunoAtual?.email || '',
    telefone: alunoAtual?.telefone || '',
    dataNascimento: '15/03/1990',
    cpf: '123.456.789-00',
    endereco: {
      rua: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleInputChange = useCallback((field: keyof DadosFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleEnderecoChange = useCallback((field: keyof DadosFormData['endereco'], value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome || formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone || !/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato inválido. Use: (11) 99999-9999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(() => {
    if (!validateForm() || !alunoAtual) return;

    setAlunos(prev => prev.map(aluno => 
      aluno.id === alunoAtual.id
        ? {
            ...aluno,
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone
          }
        : aluno
    ));

    setIsEditing(false);

    addNotification({
      type: 'success',
      title: 'Perfil atualizado',
      message: 'Suas informações foram salvas com sucesso!'
    });
  }, [validateForm, alunoAtual, formData, setAlunos, addNotification]);

  const handleCancel = useCallback(() => {
    if (!alunoAtual) return;
    
    setFormData({
      nome: alunoAtual.nome,
      email: alunoAtual.email,
      telefone: alunoAtual.telefone,
      dataNascimento: '15/03/1990',
      cpf: '123.456.789-00',
      endereco: {
        rua: 'Rua das Flores, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      }
    });
    setErrors({});
    setIsEditing(false);
  }, [alunoAtual]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        addNotification({
          type: 'success',
          title: 'Foto atualizada',
          message: 'Sua foto de perfil foi alterada com sucesso!'
        });
      };
      reader.readAsDataURL(file);
    }
  }, [addNotification]);

  const handleRemoveImage = useCallback(() => {
    setProfileImage(null);
    addNotification({
      type: 'info',
      title: 'Foto removida',
      message: 'Sua foto de perfil foi removida'
    });
  }, [addNotification]);

  if (!alunoAtual) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Erro ao carregar dados do perfil
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Foto de Perfil */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
              <span className="text-4xl font-bold text-white">
                {alunoAtual.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </div>
          )}
          <label
            htmlFor="profile-image"
            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors"
          >
            <Camera className="h-5 w-5" />
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
        {profileImage && (
          <button
            onClick={handleRemoveImage}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
          >
            Remover foto
          </button>
        )}
      </div>

      {/* Formulário */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Informações Pessoais
          </h3>
          {!isEditing && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Nome Completo"
              icon={User}
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              error={errors.nome}
              disabled={!isEditing}
              required
            />
          </div>

          <div>
            <Input
              label="Email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              disabled={!isEditing}
              required
            />
          </div>

          <div>
            <Input
              label="Telefone"
              icon={Phone}
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              error={errors.telefone}
              disabled={!isEditing}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <Input
              label="Data de Nascimento"
              icon={Calendar}
              value={formData.dataNascimento}
              onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Input
              label="CPF"
              icon={CreditCard}
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Endereço */}
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Rua e Número"
                value={formData.endereco.rua}
                onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Input
                label="Bairro"
                value={formData.endereco.bairro}
                onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Input
                label="CEP"
                value={formData.endereco.cep}
                onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                disabled={!isEditing}
                placeholder="00000-000"
              />
            </div>

            <div>
              <Input
                label="Cidade"
                value={formData.endereco.cidade}
                onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={formData.endereco.estado}
                onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              >
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="BA">Bahia</option>
                <option value="PE">Pernambuco</option>
                <option value="CE">Ceará</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botões */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar Alterações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};