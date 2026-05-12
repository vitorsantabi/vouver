import { useEffect, useRef, useState } from "react";
import { CATEGORIAS, tmdb } from "../lib/tmdb";
import { type Filme } from "../types/filme";

export function useFilmes() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Filme[]>([]);
  const [cache, setCache] = useState<Record<string, Filme[]>>({});
  const [carregando, setCarregando] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState(0);
  const [filmeSelecionado, setFilmeSelecionado] = useState<Filme | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca por categoria (com cache)
  useEffect(() => {
    const cat = CATEGORIAS[categoriaAtiva];
    if (cache[cat.label]) return;

    setCarregando(true);
    tmdb
      .get(cat.endpoint, { params: cat.params })
      .then((res) => setCache((prev) => ({ ...prev, [cat.label]: res.data.results })))
      .catch((err) => console.error("Erro categoria:", err.message))
      .finally(() => setCarregando(false));
  }, [categoriaAtiva]);

  // Busca por texto (debounce 400ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!busca.trim()) { setResultados([]); return; }

    debounceRef.current = setTimeout(() => {
      setCarregando(true);
      tmdb
        .get("/search/movie", { params: { query: busca } })
        .then((res) => setResultados(res.data.results))
        .catch((err) => console.error("Erro busca:", err.message))
        .finally(() => setCarregando(false));
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [busca]);

  const modoSearch = busca.trim().length > 0;
  const filmesExibidos = modoSearch ? resultados : cache[CATEGORIAS[categoriaAtiva].label] ?? [];

  return {
    busca, setBusca,
    carregando,
    categoriaAtiva, setCategoriaAtiva,
    filmesExibidos,
    modoSearch,
    filmeSelecionado, setFilmeSelecionado,
  };
}
