export type Filme = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  overview: string;
  genre_ids?: number[];
  runtime?: number;
  backdrop_path?: string | null;
};

/** Mapa de IDs de gênero TMDB → nomes em português */
export const GENERO_NOMES: Record<number, string> = {
  28: "Ação",
  12: "Aventura",
  16: "Animação",
  35: "Comédia",
  80: "Crime",
  99: "Documentário",
  18: "Drama",
  10751: "Família",
  14: "Fantasia",
  36: "História",
  27: "Terror",
  10402: "Música",
  9648: "Mistério",
  10749: "Romance",
  878: "Ficção Científica",
  10770: "Cinema TV",
  53: "Thriller",
  10752: "Guerra",
  37: "Faroeste",
};
