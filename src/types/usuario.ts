export type UsuarioStats = {
  totalAvaliados: number;
  totalCriticas: number;
  notaMedia: number;
  generoFavorito?: string;
  horasAssistidas?: number;
};

export type Usuario = {
  uid: string;
  nome: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  stats: UsuarioStats;
};
