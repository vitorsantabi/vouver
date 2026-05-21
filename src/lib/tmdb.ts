import axios from "axios";

const TMDB_TOKEN = process.env.EXPO_PUBLIC_TMDB_TOKEN;

if (!TMDB_TOKEN && __DEV__) {
  console.warn("[TMDB] Token não configurado. Adicione EXPO_PUBLIC_TMDB_TOKEN ao .env");
}

export const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
  params: { language: "pt-BR" },
  timeout: 10000,
});

export type Categoria = {
  label: string;
  endpoint: string;
  params: Record<string, unknown>;
};

export const CATEGORIAS: Categoria[] = [
  { label: "🔥 Em Alta",     endpoint: "/discover/movie", params: { sort_by: "popularity.desc" } },
  { label: "⭐ Mais Votados", endpoint: "/discover/movie", params: { sort_by: "vote_average.desc", "vote_count.gte": 1000 } },
  { label: "🎬 Ação",        endpoint: "/discover/movie", params: { sort_by: "popularity.desc", with_genres: 28 } },
  { label: "😂 Comédia",     endpoint: "/discover/movie", params: { sort_by: "popularity.desc", with_genres: 35 } },
  { label: "😱 Terror",      endpoint: "/discover/movie", params: { sort_by: "popularity.desc", with_genres: 27 } },
];
