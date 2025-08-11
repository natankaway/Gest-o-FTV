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
   * Updates a specific match result and propagates winner to next match
   */
  updateMatchResult: (
    torneios: Torneio[], 
    torneioId: string, 
    categoriaId: string, 
    matchId: string, 
    result: { placarA: number; placarB: number }
  ): Torneio[] => {
    return torneioStateUtils.updateChaveamento(torneios, torneioId, categoriaId, (chaveamento) => {
      const updatedMatches = [...chaveamento.matches];
      const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
      
      if (matchIndex === -1) return chaveamento;
      
      const currentMatch = updatedMatches[matchIndex];
      if (!currentMatch || !currentMatch.a || !currentMatch.b) return chaveamento;
      
      const vencedor = result.placarA > result.placarB ? currentMatch.a : currentMatch.b;
      const perdedor = result.placarA > result.placarB ? currentMatch.b : currentMatch.a;
      
      // Update current match
      updatedMatches[matchIndex] = {
        ...currentMatch,
        placar: { a: result.placarA, b: result.placarB },
        vencedor,
        perdedor,
        status: 'finalizado'
      };
      
      // Propagate winner to next match if exists
      if (currentMatch.nextMatchId && currentMatch.nextMatchSlot) {
        const nextMatchIndex = updatedMatches.findIndex(m => m.id === currentMatch.nextMatchId);
        if (nextMatchIndex !== -1) {
          const nextMatch = updatedMatches[nextMatchIndex];
          const slotKey = currentMatch.nextMatchSlot === 1 ? 'a' : 'b';
          updatedMatches[nextMatchIndex] = {
            ...nextMatch,
            [slotKey]: vencedor
          };
        }
      }
      
      // Calculate metrics
      const totalMatches = updatedMatches.length;
      const finalizadas = updatedMatches.filter(m => m.status === 'finalizado').length;
      const allFinished = finalizadas === totalMatches;
      
      return {
        ...chaveamento,
        matches: updatedMatches,
        status: allFinished ? 'finalizado' : (finalizadas > 0 ? 'em-andamento' : 'gerado'),
        roundAtual: torneioStateUtils.calculateCurrentRound(updatedMatches)
      };
    });
  },

  /**
   * Calculates the current round based on match completion
   */
  calculateCurrentRound: (matches: Match[]): number => {
    const matchesByRound = matches.reduce((acc, match) => {
      if (!acc[match.round]) {
        acc[match.round] = [];
      }
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, Match[]>);

    for (const round of Object.keys(matchesByRound).map(Number).sort()) {
      const roundMatches = matchesByRound[round];
      if (roundMatches) {
        const allFinished = roundMatches.every(m => m.status === 'finalizado');
        if (!allFinished) return round;
      }
    }
    
    return Math.max(...Object.keys(matchesByRound).map(Number));
  },

  /**
   * Generates a unique key for a player for comparison purposes
   */
  getJogadorKey: (jogador: Dupla['jogadores'][0]): string => {
    if (jogador.tipo === 'aluno' && jogador.id) {
      return `aluno:${jogador.id}`;
    }
    // For guests, normalize name: trim, lowercase, collapse multiple spaces
    const normalizedName = jogador.nome.trim().toLowerCase().replace(/\s+/g, ' ');
    return `guest:${normalizedName}`;
  },

  /**
   * Validates if a dupla has duplicate players
   */
  validateDuplaPlayers: (dupla: Pick<Dupla, 'jogadores'>): boolean => {
    const [jogador1, jogador2] = dupla.jogadores;
    const key1 = torneioStateUtils.getJogadorKey(jogador1);
    const key2 = torneioStateUtils.getJogadorKey(jogador2);
    return key1 !== key2;
  },

  /**
   * Validates if a dupla would create duplicate players in a category
   */
  validateDuplaUniquenessInCategory: (
    dupla: Pick<Dupla, 'jogadores'>, 
    categoria: Categoria, 
    excludeDuplaId?: string
  ): { isValid: boolean; message?: string } => {
    const [jogador1, jogador2] = dupla.jogadores;
    
    // Get all existing players in category (excluding the dupla being edited)
    const existingPlayerKeys = new Set<string>();
    categoria.duplas.forEach(existingDupla => {
      if (excludeDuplaId && existingDupla.id === excludeDuplaId) return;
      existingDupla.jogadores.forEach(jogador => {
        existingPlayerKeys.add(torneioStateUtils.getJogadorKey(jogador));
      });
    });

    // Check if any player in the new dupla already exists
    const key1 = torneioStateUtils.getJogadorKey(jogador1);
    const key2 = torneioStateUtils.getJogadorKey(jogador2);

    if (existingPlayerKeys.has(key1)) {
      const playerType = jogador1.tipo === 'aluno' ? 'aluno' : 'convidado';
      return {
        isValid: false,
        message: `Este ${playerType} (${jogador1.nome}) já participa de uma dupla nesta categoria.`
      };
    }

    if (existingPlayerKeys.has(key2)) {
      const playerType = jogador2.tipo === 'aluno' ? 'aluno' : 'convidado';
      return {
        isValid: false,
        message: `Este ${playerType} (${jogador2.nome}) já participa de uma dupla nesta categoria.`
      };
    }

    return { isValid: true };
  },

  /**
   * Validates if a dupla would be identical to existing duplas in category
   */
  validateDuplaIdentical: (
    dupla: Pick<Dupla, 'jogadores'>, 
    categoria: Categoria, 
    excludeDuplaId?: string
  ): { isValid: boolean; message?: string } => {
    const [jogador1, jogador2] = dupla.jogadores;
    const key1 = torneioStateUtils.getJogadorKey(jogador1);
    const key2 = torneioStateUtils.getJogadorKey(jogador2);
    
    // Sort keys to handle A/B vs B/A comparison
    const sortedKeys = [key1, key2].sort();

    for (const existingDupla of categoria.duplas) {
      if (excludeDuplaId && existingDupla.id === excludeDuplaId) continue;
      
      const existingKey1 = torneioStateUtils.getJogadorKey(existingDupla.jogadores[0]);
      const existingKey2 = torneioStateUtils.getJogadorKey(existingDupla.jogadores[1]);
      const existingSortedKeys = [existingKey1, existingKey2].sort();
      
      if (sortedKeys[0] === existingSortedKeys[0] && sortedKeys[1] === existingSortedKeys[1]) {
        return {
          isValid: false,
          message: 'Esta dupla já existe nesta categoria.'
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Checks if a category has reached its dupla limit
   */
  canAddDupla: (categoria: Categoria): boolean => {
    if (!categoria.limiteDuplas) return true;
    return categoria.duplas.length < categoria.limiteDuplas;
  }
};