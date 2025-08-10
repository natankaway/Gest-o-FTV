import type { Torneio, Categoria, Dupla, BracketState, Match } from '@/types';

/**
 * Immutable state update utilities for tournament management
 * All functions return new objects/arrays to ensure proper re-rendering
 */

export const torneioStateUtils = {
  /**
   * Updates a tournament by ID, applying an updater function
   */
  updateTorneioById: (
    torneios: Torneio[], 
    torneioId: string, 
    updater: (torneio: Torneio) => Torneio
  ): Torneio[] => {
    return torneios.map(torneio => 
      torneio.id === torneioId ? updater(torneio) : torneio
    );
  },

  /**
   * Updates a category within a tournament
   */
  updateCategoria: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string, 
    updater: (categoria: Categoria) => Categoria
  ): Torneio[] => {
    return torneioStateUtils.updateTorneioById(torneios, torneioId, (torneio) => ({
      ...torneio,
      categorias: torneio.categorias.map(categoria =>
        categoria.id === categoriaId ? updater(categoria) : categoria
      )
    }));
  },

  /**
   * Adds a new category to a tournament
   */
  pushCategoria: (
    torneios: Torneio[], 
    torneioId: string, 
    novaCategoria: Categoria
  ): Torneio[] => {
    return torneioStateUtils.updateTorneioById(torneios, torneioId, (torneio) => ({
      ...torneio,
      categorias: [...torneio.categorias, novaCategoria]
    }));
  },

  /**
   * Removes a category from a tournament
   */
  removeCategoria: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string
  ): Torneio[] => {
    return torneioStateUtils.updateTorneioById(torneios, torneioId, (torneio) => ({
      ...torneio,
      categorias: torneio.categorias.filter(categoria => categoria.id !== categoriaId)
    }));
  },

  /**
   * Adds a new dupla to a specific category
   */
  pushDupla: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string, 
    novaDupla: Dupla
  ): Torneio[] => {
    return torneioStateUtils.updateCategoria(torneios, torneioId, categoriaId, (categoria) => ({
      ...categoria,
      duplas: [...categoria.duplas, novaDupla]
    }));
  },

  /**
   * Updates an existing dupla in a category
   */
  updateDupla: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string, 
    duplaId: string,
    updater: (dupla: Dupla) => Dupla
  ): Torneio[] => {
    return torneioStateUtils.updateCategoria(torneios, torneioId, categoriaId, (categoria) => ({
      ...categoria,
      duplas: categoria.duplas.map(dupla =>
        dupla.id === duplaId ? updater(dupla) : dupla
      )
    }));
  },

  /**
   * Removes a dupla from a category
   */
  removeDupla: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string, 
    duplaId: string
  ): Torneio[] => {
    return torneioStateUtils.updateCategoria(torneios, torneioId, categoriaId, (categoria) => ({
      ...categoria,
      duplas: categoria.duplas.filter(dupla => dupla.id !== duplaId)
    }));
  },

  /**
   * Updates the bracket/chaveamento for a category
   */
  updateChaveamento: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string, 
    chaveamentoUpdater: (chaveamento: BracketState) => BracketState
  ): Torneio[] => {
    return torneioStateUtils.updateCategoria(torneios, torneioId, categoriaId, (categoria) => ({
      ...categoria,
      chaveamento: chaveamentoUpdater(categoria.chaveamento)
    }));
  },

  /**
   * Updates a specific match result in the bracket
   */
  updateMatchResult: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string, 
    matchId: string, 
    result: Partial<Match>
  ): Torneio[] => {
    return torneioStateUtils.updateChaveamento(torneios, torneioId, categoriaId, (chaveamento) => ({
      ...chaveamento,
      matches: chaveamento.matches.map(match =>
        match.id === matchId ? { ...match, ...result } : match
      )
    }));
  },

  /**
   * Validates if a dupla has duplicate players
   */
  validateDuplaPlayers: (dupla: Pick<Dupla, 'jogadores'>): boolean => {
    const [jogador1, jogador2] = dupla.jogadores;
    
    // Both are students - compare by ID
    if (jogador1.tipo === 'aluno' && jogador2.tipo === 'aluno') {
      return jogador1.id !== jogador2.id;
    }
    
    // Both are guests - compare by normalized name
    if (jogador1.tipo === 'convidado' && jogador2.tipo === 'convidado') {
      const nome1 = jogador1.nome.trim().toLowerCase();
      const nome2 = jogador2.nome.trim().toLowerCase();
      return nome1 !== nome2;
    }
    
    // One student, one guest - always valid
    return true;
  },

  /**
   * Checks if a category has reached its dupla limit
   */
  canAddDupla: (categoria: Categoria): boolean => {
    if (!categoria.limiteDuplas) return true;
    return categoria.duplas.length < categoria.limiteDuplas;
  }
};