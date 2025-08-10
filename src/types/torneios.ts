export type Jogador =
  | { tipo: 'aluno'; id: string; nome: string }
  | { tipo: 'convidado'; nome: string };

export type Dupla = {
  id: string;
  nome?: string;
  jogadores: [Jogador, Jogador];
  unidadeId?: string;
  inscritoEm: string; // ISO
};

export type Match = {
  id: string;
  categoriaId: string;
  fase: 'WB' | 'LB' | 'SF' | 'F' | '3P';
  round: number;
  a?: string; // teamId
  b?: string; // teamId
  horario?: string; // ISO
  placar?: { a: number; b: number };
  bestOf?: 1 | 3;
  vencedor?: string;
  perdedor?: string;
  proximoVencedorMatchId?: string;
  proximoPerdedorMatchId?: string;
};

export type BracketState = {
  status: 'nao-gerado' | 'gerado' | 'em-andamento' | 'finalizado';
  matches: Match[];
  roundAtual?: number;
  configuracao: { sorteioInicialSeed?: number };
};

export type Categoria = {
  id: string;
  nome: string;
  limiteDuplas?: number;
  formato: 'double-elim-semi-3p';
  bestOfSF?: 1 | 3;
  bestOfFinal?: 1 | 3;
  duplas: Dupla[];
  chaveamento: BracketState;
};

export type Torneio = {
  id: string;
  nome: string;
  descricao?: string;
  local?: string;
  dataInicio?: string; // ISO
  dataFim?: string; // ISO
  status: 'Inscrições' | 'Sorteio' | 'Em andamento' | 'Finalizado';
  criadoPor: string;
  categorias: Categoria[];
};
