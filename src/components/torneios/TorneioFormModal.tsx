import { useState, useMemo, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Torneio, Categoria } from '@/types/torneiros'; // ajuste o caminho se necessário

type Props = {
  modo: 'create' | 'edit';
  torneio?: Torneio;
  onClose: () => void;
  onSave: (t: Torneio) => void;
};

export default function TorneioFormModal({ modo, torneio, onClose, onSave }: Props) {
  const [form, setForm] = useState<Torneio>(() => {
    if (torneio) return torneio;
    return {
      id: nanoid(),
      nome: '',
      descricao: '',
      local: '',
      dataInicio: '',
      dataFim: '',
      // Removido: status no formulário de criação
      status: 'Inscrições', // setado automaticamente no create
      criadoPor: '', // preencher do usuário logado
      categorias: [],
    };
  });

  const addCategoria = useCallback(() => {
    const nova: Categoria = {
      id: nanoid(),
      nome: '',
      limiteDuplas: undefined, // opcional
      formato: 'double-elim-semi-3p',
      bestOfSF: 1,
      bestOfFinal: 1,
      duplas: [],
      chaveamento: {
        status: 'nao-gerado',
        matches: [],
        roundAtual: 0,
        configuracao: {},
      },
    };
    setForm(prev => ({ ...prev, categorias: [...(prev.categorias ?? []), nova] }));
  }, []);

  const updateCategoria = useCallback((id: string, patch: Partial<Categoria>) => {
    setForm(prev => ({
      ...prev,
      categorias: (prev.categorias ?? []).map(c => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const removeCategoria = useCallback((id: string) => {
    setForm(prev => ({
      ...prev,
      categorias: (prev.categorias ?? []).filter(c => c.id !== id),
    }));
  }, []);

  const salvar = useCallback(() => {
    const payload: Torneio = {
      ...form,
      // No create, garantimos status inicial:
      status: modo === 'create' ? 'Inscrições' : form.status,
    };
    onSave(payload);
  }, [form, onSave, modo]);

  return (
    <div className="modal">
      <div className="modal-box">
        <h2 className="text-xl font-semibold">
          {modo === 'create' ? 'Criar Torneio' : 'Editar Torneio'}
        </h2>

        <div className="mt-4 space-y-3">
          <label className="form-control">
            <span className="label-text">Nome</span>
            <input
              className="input input-bordered"
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text">Descrição</span>
            <textarea
              className="textarea textarea-bordered"
              value={form.descricao ?? ''}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="form-control">
              <span className="label-text">Local</span>
              <input
                className="input input-bordered"
                value={form.local ?? ''}
                onChange={e => setForm(f => ({ ...f, local: e.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label-text">Data inicial</span>
              <input
                type="date"
                className="input input-bordered"
                value={form.dataInicio ?? ''}
                onChange={e => setForm(f => ({ ...f, dataInicio: e.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label-text">Data final</span>
              <input
                type="date"
                className="input input-bordered"
                value={form.dataFim ?? ''}
                onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))}
              />
            </label>
          </div>

          {/* Removido: campo de Status no formulário de criação/edição */}
          {/* Se desejar permitir edição de status apenas no modo 'edit', pode renderizar condicionalmente aqui. */}

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Categorias</h3>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={addCategoria}
              >
                Adicionar categoria
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {(form.categorias ?? []).map(cat => (
                <div key={cat.id} className="p-3 rounded border border-base-300 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <label className="form-control">
                      <span className="label-text">Nome da categoria</span>
                      <input
                        className="input input-bordered"
                        value={cat.nome}
                        onChange={e => updateCategoria(cat.id, { nome: e.target.value })}
                        placeholder="Ex.: Masculina, Iniciante, Mista..."
                      />
                    </label>
                    <label className="form-control">
                      <span className="label-text">Limite de duplas (opcional)</span>
                      <input
                        type="number"
                        min={0}
                        className="input input-bordered"
                        value={cat.limiteDuplas ?? ''}
                        onChange={e => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value);
                          updateCategoria(cat.id, { limiteDuplas: v });
                        }}
                        placeholder="Ex.: 8, 16"
                      />
                    </label>
                    <label className="form-control">
                      <span className="label-text">Semifinal (best-of)</span>
                      <select
                        className="select select-bordered"
                        value={cat.bestOfSF ?? 1}
                        onChange={e => updateCategoria(cat.id, { bestOfSF: Number(e.target.value) as 1 | 3 })}
                      >
                        <option value={1}>Melhor de 1</option>
                        <option value={3}>Melhor de 3</option>
                      </select>
                    </label>
                    <label className="form-control">
                      <span className="label-text">Final (best-of)</span>
                      <select
                        className="select select-bordered"
                        value={cat.bestOfFinal ?? 1}
                        onChange={e => updateCategoria(cat.id, { bestOfFinal: Number(e.target.value) as 1 | 3 })}
                      >
                        <option value={1}>Melhor de 1</option>
                        <option value={3}>Melhor de 3</option>
                      </select>
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => removeCategoria(cat.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={salvar}>
              Salvar
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
