export type TipoLista = "quero_ver" | "assistindo" | "favoritos" | "custom";

export type ListaFilme = {
  filmeId: number;
  titulo: string;
  posterPath: string | null;
  addedAt: string;
};

export type Lista = {
  id: string;
  nome: string;
  tipo: TipoLista;
  icone: string;
  filmes: ListaFilme[];
  createdAt: string;
  updatedAt: string;
};

/** Listas padrão criadas automaticamente no primeiro acesso */
export const LISTAS_PADRAO: Omit<Lista, "id" | "createdAt" | "updatedAt">[] = [
  { nome: "Quero Ver", tipo: "quero_ver", icone: "👀", filmes: [] },
  { nome: "Assistindo", tipo: "assistindo", icone: "▶️", filmes: [] },
  { nome: "Favoritos", tipo: "favoritos", icone: "❤️", filmes: [] },
];
