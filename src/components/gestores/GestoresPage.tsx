import React, { memo, useState, useMemo, useCallback } from 'react';
import { useAppState, useNotifications } from '@/contexts';
import { Button, Input, Modal } from '@/components/common';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Building2,
  Shield
} from 'lucide-react';
import type { Gestor, Unidade } from '@/types';

interface GestorFormData {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cargo: string;
  unidades: string[];
  ativo: boolean;
}

interface GestorFormErrors {
  nome?: string;
  email?: string;
  senha?: string;
  cargo?: string;
  unidades?: string;
}

export const GestoresPage: React.FC = memo(() => {
  const { userLogado, dadosMockados, setGestores, setUnidades } = useAppState();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGestor, setEditingGestor] = useState<Gestor | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState<GestorFormData>({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cargo: '',
    unidades: [],
    ativo: true
  });
  
  const [errors, setErrors] = useState<GestorFormErrors>({});

  // Access control - only admin can access
  if (userLogado?.perfil !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Acesso Negado
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Apenas administradores podem acessar esta área.
        </p>
      </div>
    );
  }

  const gestores = dadosMockados.gestores;
  const unidades = dadosMockados.unidades;

  // Filter gestores based on search
  const filteredGestores = useMemo(() => {
    if (!searchTerm) return gestores;
    
    const search = searchTerm.toLowerCase();
    return gestores.filter(gestor => 
      gestor.nome.toLowerCase().includes(search) ||
      gestor.email.toLowerCase().includes(search) ||
      gestor.cargo.toLowerCase().includes(search)
    );
  }, [gestores, searchTerm]);

  const validateForm = useCallback((): boolean => {
    const newErrors: GestorFormErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }
    
    if (formData.unidades.length === 0) {
      newErrors.unidades = 'Selecione pelo menos uma unidade';
    }
    
    // Senha obrigatória apenas na criação
    if (!editingGestor && !formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    }
    
    // Check for duplicate email
    const existingGestor = gestores.find(g => 
      g.email === formData.email && g.id !== editingGestor?.id
    );
    if (existingGestor) {
      newErrors.email = 'Este email já está sendo usado por outro gestor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, editingGestor, gestores]);

  const resetForm = useCallback(() => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      telefone: '',
      cargo: '',
      unidades: [],
      ativo: true
    });
    setErrors({});
    setEditingGestor(null);
    setShowPassword(false);
  }, []);

  const openModal = useCallback((gestor?: Gestor) => {
    if (gestor) {
      setEditingGestor(gestor);
      setFormData({
        nome: gestor.nome,
        email: gestor.email,
        senha: '', // Don't show existing password
        telefone: gestor.telefone,
        cargo: gestor.cargo,
        unidades: [...gestor.unidades],
        ativo: gestor.ativo ?? true
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const updateUnidadesGestorId = useCallback((gestorId: number, selectedUnidades: string[], previousUnidades: string[] = []) => {
    setUnidades(prev => prev.map(unidade => {
      // Remove gestor from previously assigned units that are no longer selected
      if (previousUnidades.includes(unidade.nome) && !selectedUnidades.includes(unidade.nome) && unidade.gestorId === gestorId) {
        return { ...unidade, gestorId: 0 }; // Set to 0 or another default value
      }
      
      // Assign gestor to newly selected units
      if (selectedUnidades.includes(unidade.nome)) {
        return { ...unidade, gestorId };
      }
      
      return unidade;
    }));
  }, [setUnidades]);

  const handleSave = useCallback(() => {
    if (!validateForm()) return;
    
    if (editingGestor) {
      // Update existing gestor
      const updatedGestor: Gestor = {
        ...editingGestor,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cargo: formData.cargo,
        unidades: formData.unidades,
        ativo: formData.ativo,
        // Only update password if provided
        ...(formData.senha && { senha: formData.senha })
      };
      
      setGestores(prev => prev.map(g => g.id === editingGestor.id ? updatedGestor : g));
      updateUnidadesGestorId(editingGestor.id, formData.unidades, editingGestor.unidades);
      
      addNotification({
        type: 'success',
        title: 'Gestor atualizado',
        message: `${formData.nome} foi atualizado com sucesso`
      });
    } else {
      // Create new gestor
      const newId = Math.max(...gestores.map(g => g.id), 0) + 1;
      const newGestor: Gestor = {
        id: newId,
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        cargo: formData.cargo,
        unidades: formData.unidades,
        permissoes: ['gestor'], // Default permissions
        ativo: formData.ativo
      };
      
      setGestores(prev => [...prev, newGestor]);
      updateUnidadesGestorId(newId, formData.unidades);
      
      addNotification({
        type: 'success',
        title: 'Gestor criado',
        message: `${formData.nome} foi adicionado com sucesso`
      });
    }
    
    closeModal();
  }, [formData, editingGestor, gestores, setGestores, updateUnidadesGestorId, validateForm, addNotification, closeModal]);

  const toggleGestorStatus = useCallback((gestor: Gestor) => {
    const newStatus = !gestor.ativo;
    setGestores(prev => prev.map(g => 
      g.id === gestor.id ? { ...g, ativo: newStatus } : g
    ));
    
    addNotification({
      type: 'success',
      title: `Gestor ${newStatus ? 'ativado' : 'desativado'}`,
      message: `${gestor.nome} foi ${newStatus ? 'ativado' : 'desativado'} com sucesso`
    });
  }, [setGestores, addNotification]);

  const deleteGestor = useCallback((gestor: Gestor) => {
    // Check if gestor is assigned to any active unit
    const assignedUnits = unidades.filter(u => u.gestorId === gestor.id && u.ativa);
    
    if (assignedUnits.length > 0) {
      addNotification({
        type: 'error',
        title: 'Não é possível excluir',
        message: `O gestor ${gestor.nome} está vinculado a unidades ativas: ${assignedUnits.map(u => u.nome).join(', ')}. Transfira essas unidades para outro gestor antes de excluir.`
      });
      return;
    }
    
    if (window.confirm(`Tem certeza que deseja excluir o gestor ${gestor.nome}?`)) {
      setGestores(prev => prev.filter(g => g.id !== gestor.id));
      // Remove from any units that might reference this gestor
      setUnidades(prev => prev.map(u => 
        u.gestorId === gestor.id ? { ...u, gestorId: 0 } : u
      ));
      
      addNotification({
        type: 'success',
        title: 'Gestor excluído',
        message: `${gestor.nome} foi removido com sucesso`
      });
    }
  }, [unidades, setGestores, setUnidades, addNotification]);

  const handleUnidadeChange = useCallback((unidadeName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      unidades: checked 
        ? [...prev.unidades, unidadeName]
        : prev.unidades.filter(u => u !== unidadeName)
    }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestores
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie os gestores do sistema
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          leftIcon={<Plus className="h-5 w-5" />}
          className="w-full sm:w-auto"
        >
          Novo Gestor
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar por nome, email ou cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Gestores List */}
      <div className="grid gap-4">
        {filteredGestores.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Nenhum gestor encontrado' : 'Nenhum gestor cadastrado'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Tente ajustar seus critérios de busca' : 'Comece adicionando um novo gestor'}
            </p>
          </div>
        ) : (
          filteredGestores.map((gestor) => (
            <div
              key={gestor.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {gestor.nome}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        gestor.ativo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {gestor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{gestor.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{gestor.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>{gestor.cargo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{gestor.unidades.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal(gestor)}
                    leftIcon={<Edit className="h-4 w-4" />}
                  >
                    Editar
                  </Button>
                  
                  <Button
                    variant={gestor.ativo ? "danger" : "success"}
                    size="sm"
                    onClick={() => toggleGestorStatus(gestor)}
                  >
                    {gestor.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteGestor(gestor)}
                    leftIcon={<Trash className="h-4 w-4" />}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingGestor ? 'Editar Gestor' : 'Novo Gestor'}
        size="lg"
      >
        <div className="space-y-4">
          {/* Nome */}
          <Input
            label="Nome"
            required
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            error={errors.nome}
            placeholder="Digite o nome completo"
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            error={errors.email}
            placeholder="Digite o email"
          />

          {/* Telefone */}
          <Input
            label="Telefone"
            value={formData.telefone}
            onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
            placeholder="(11) 99999-9999"
          />

          {/* Senha */}
          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              required={!editingGestor}
              value={formData.senha}
              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
              error={errors.senha}
              placeholder={editingGestor ? "Deixe em branco para manter a atual" : "Digite a senha"}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Cargo */}
          <Input
            label="Cargo"
            required
            value={formData.cargo}
            onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
            error={errors.cargo}
            placeholder="Ex: Gerente, Supervisor, Coordenador"
          />

          {/* Unidades */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Unidades <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {unidades.map((unidade) => (
                <label key={unidade.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.unidades.includes(unidade.nome)}
                    onChange={(e) => handleUnidadeChange(unidade.nome, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{unidade.nome}</span>
                </label>
              ))}
            </div>
            {errors.unidades && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.unidades}</p>
            )}
          </div>

          {/* Ativo */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Ativo</span>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingGestor ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});