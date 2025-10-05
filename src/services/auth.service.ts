import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

export interface AuthCredentials {
  email: string;
  senha: string;
}

export interface SignUpData extends AuthCredentials {
  nome: string;
  telefone: string;
  perfil: 'admin' | 'gestor' | 'professor' | 'aluno';
}

export const authService = {
  async signIn(credentials: AuthCredentials): Promise<User | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.senha,
      });

      if (authError) throw authError;
      if (!authData.user) return null;

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .maybeSingle();

      if (usuarioError) throw usuarioError;
      if (!usuario) return null;

      let user: User = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil as User['perfil'],
      };

      if (usuario.perfil === 'gestor') {
        const { data: gestor } = await supabase
          .from('gestores')
          .select('unidades')
          .eq('usuario_id', usuario.id)
          .maybeSingle();

        if (gestor) {
          user.unidades = gestor.unidades;
        }
      }

      if (usuario.perfil === 'aluno') {
        const { data: aluno } = await supabase
          .from('alunos')
          .select('unidade')
          .eq('usuario_id', usuario.id)
          .maybeSingle();

        if (aluno) {
          user.unidade = aluno.unidade;
        }
      }

      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    }
  },

  async signUp(data: SignUpData): Promise<User | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
      });

      if (authError) throw authError;
      if (!authData.user) return null;

      const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: authData.user.id,
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          perfil: data.perfil,
          ativo: true,
        })
        .select()
        .single();

      if (usuarioError) throw usuarioError;

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil as User['perfil'],
      };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return null;
    }
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) return null;

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      if (!usuario) return null;

      let user: User = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil as User['perfil'],
      };

      if (usuario.perfil === 'gestor') {
        const { data: gestor } = await supabase
          .from('gestores')
          .select('unidades')
          .eq('usuario_id', usuario.id)
          .maybeSingle();

        if (gestor) {
          user.unidades = gestor.unidades;
        }
      }

      if (usuario.perfil === 'aluno') {
        const { data: aluno } = await supabase
          .from('alunos')
          .select('unidade')
          .eq('usuario_id', usuario.id)
          .maybeSingle();

        if (aluno) {
          user.unidade = aluno.unidade;
        }
      }

      return user;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const user = await this.getCurrentUser();
          callback(user);
        } else {
          callback(null);
        }
      })();
    });
  },
};
