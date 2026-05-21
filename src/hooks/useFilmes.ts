import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIAS, tmdb } from "../lib/tmdb";
import { type Filme } from "../types/filme";

export function useFilmes() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Filme[]>([]);
  const [cache, setCache] = useState<Record<string, Filme[]>>({});
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState(0);
  const [filmeSelecionado, setFilmeSelecionado] = useState<Filme | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca por categoria (com cache + AbortController)
  useEffect(() => {
    const cat = CATEGORIAS[categoriaAtiva];
    if (cache[cat.label]) return;

    const controller = new AbortController();
    setCarregando(true);
    setErro(null);

    tmdb
      .get(cat.endpoint, {
        params: cat.params,
        signal: controller.signal,
      })
      .then((res) => {
        if (!controller.signal.aborted) {
          setCache((prev) => ({ ...prev, [cat.label]: res.data.results }));
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setErro(
            "Não foi possível carregar os filmes. Verifique sua conexão."
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      });

    return () => controller.abort();
  }, [categoriaAtiva, retryCounter]);

  // Busca por texto (debounce 400ms + AbortController)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!busca.trim()) {
      setResultados([]);
      setErro(null);
      return;
    }

    const controller = new AbortController();

    debounceRef.current = setTimeout(() => {
      setCarregando(true);
      setErro(null);
      tmdb
        .get("/search/movie", {
          params: { query: busca },
          signal: controller.signal,
        })
        .then((res) => {
          if (!controller.signal.aborted) {
            setResultados(res.data.results);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setErro("Erro ao buscar. Tente novamente.");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setCarregando(false);
          }
        });
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [busca]);

  const modoSearch = busca.trim().length > 0;
  const filmesExibidos =
    modoSearch ? resultados : (cache[CATEGORIAS[categoriaAtiva].label] ?? []);

  const retry = useCallback(() => {
    setErro(null);
    if (!modoSearch) {
      // Limpa cache da categoria e incrementa counter para forçar re-fetch
      const cat = CATEGORIAS[categoriaAtiva];
      setCache((prev) => {
        const next = { ...prev };
        delete next[cat.label];
        return next;
      });
      setRetryCounter((c) => c + 1);
    } else {
      // Re-trigger da busca via counter (sem hack de espaço)
      setRetryCounter((c) => c + 1);
    }
  }, [modoSearch, categoriaAtiva]);

  return {
    busca,
    setBusca,
    carregando,
    erro,
    retry,
    categoriaAtiva,
    setCategoriaAtiva,
    filmesExibidos,
    modoSearch,
    filmeSelecionado,
    setFilmeSelecionado,
  };
}
