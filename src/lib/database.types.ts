export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: number
          auth_user_id: string | null
          nome: string
          telefone: string
          email: string
          perfil: 'admin' | 'gestor' | 'professor' | 'aluno'
          ativo: boolean
          profile_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          auth_user_id?: string | null
          nome: string
          telefone: string
          email: string
          perfil: 'admin' | 'gestor' | 'professor' | 'aluno'
          ativo?: boolean
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          auth_user_id?: string | null
          nome?: string
          telefone?: string
          email?: string
          perfil?: 'admin' | 'gestor' | 'professor' | 'aluno'
          ativo?: boolean
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      alunos: {
        Row: {
          id: number
          usuario_id: number
          tipo_plano: 'mensalidade' | 'plataforma' | 'experimental'
          plano_id: number | null
          plataforma_parceira: string | null
          unidade: string
          status: 'ativo' | 'pendente' | 'inativo'
          vencimento: string | null
          nivel: 'iniciante' | 'intermediario' | 'avancado'
          data_matricula: string
          objetivo: string | null
          nomes_checkin: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usuario_id: number
          tipo_plano: 'mensalidade' | 'plataforma' | 'experimental'
          plano_id?: number | null
          plataforma_parceira?: string | null
          unidade: string
          status?: 'ativo' | 'pendente' | 'inativo'
          vencimento?: string | null
          nivel?: 'iniciante' | 'intermediario' | 'avancado'
          data_matricula: string
          objetivo?: string | null
          nomes_checkin?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          usuario_id?: number
          tipo_plano?: 'mensalidade' | 'plataforma' | 'experimental'
          plano_id?: number | null
          plataforma_parceira?: string | null
          unidade?: string
          status?: 'ativo' | 'pendente' | 'inativo'
          vencimento?: string | null
          nivel?: 'iniciante' | 'intermediario' | 'avancado'
          data_matricula?: string
          objetivo?: string | null
          nomes_checkin?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      professores: {
        Row: {
          id: number
          usuario_id: number
          tipo_pagamento: 'fixo' | 'horas-variaveis' | 'hora-fixa'
          valor_fixo: number | null
          valor_hora_fixa: number | null
          valores_horas: Json | null
          valor_aulao: number | null
          especialidades: string[]
          experiencia: '1-3' | '3-5' | '5-10' | '10+' | null
          unidades: string[]
          unidade_principal: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usuario_id: number
          tipo_pagamento: 'fixo' | 'horas-variaveis' | 'hora-fixa'
          valor_fixo?: number | null
          valor_hora_fixa?: number | null
          valores_horas?: Json | null
          valor_aulao?: number | null
          especialidades?: string[]
          experiencia?: '1-3' | '3-5' | '5-10' | '10+' | null
          unidades?: string[]
          unidade_principal?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          usuario_id?: number
          tipo_pagamento?: 'fixo' | 'horas-variaveis' | 'hora-fixa'
          valor_fixo?: number | null
          valor_hora_fixa?: number | null
          valores_horas?: Json | null
          valor_aulao?: number | null
          especialidades?: string[]
          experiencia?: '1-3' | '3-5' | '5-10' | '10+' | null
          unidades?: string[]
          unidade_principal?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gestores: {
        Row: {
          id: number
          usuario_id: number
          cargo: string
          unidades: string[]
          permissoes: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          usuario_id: number
          cargo: string
          unidades?: string[]
          permissoes?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          usuario_id?: number
          cargo?: string
          unidades?: string[]
          permissoes?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
