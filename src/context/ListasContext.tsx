import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { auth, firebaseReady } from "../lib/firebase";
import { type Lista } from "../types/lista";
import { type Filme } from "../types/filme";
import {
  inicializarListasPadrao,
  ouvirListas,
  criarLista as criarListaService,
  adicionarFilmeNaLista as addService,
  removerFilmeDaLista as removeService,
  deletarLista as deleteService,
} from "../services/listas";

type ListasCtx = {
  listas: Lista[];
  carregando: boolean;
  criarLista: (nome: string) => Promise<string>;
  addFilme: (listaId: string, filme: Filme) => Promise<void>;
  removeFilme: (listaId: string, filmeId: number) => Promise<void>;
  deletarLista: (listaId: string) => Promise<void>;
  filmeNaLista: (listaId: string, filmeId: number) => boolean;
};

const Ctx = createContext<ListasCtx>({
  listas: [],
  carregando: true,
  criarLista: async () => "",
  addFilme: async () => {},
  removeFilme: async () => {},
  deletarLista: async () => {},
  filmeNaLista: () => false,
});

export function ListasProvider({ children }: { children: React.ReactNode }) {
  const [listas, setListas] = useState<Lista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!firebaseReady) {
      setCarregando(false);
      return;
    }

    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

      if (!user) {
        setListas([]);
        setCarregando(false);
        return;
      }

      // Garante que listas padrão existam
      try {
        await inicializarListasPadrao();
      } catch (e) {
        if (__DEV__) console.warn("Erro ao inicializar listas:", e);
      }

      // Listener em tempo real
      unsubRef.current = ouvirListas(
        (data) => { setListas(data); setCarregando(false); },
        () => setCarregando(false)
      );
    });

    return () => {
      unsubAuth();
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    };
  }, []);

  const criarLista = useCallback(async (nome: string) => {
    return criarListaService(nome);
  }, []);

  const addFilme = useCallback(async (listaId: string, filme: Filme) => {
    await addService(listaId, filme);
  }, []);

  const removeFilme = useCallback(async (listaId: string, filmeId: number) => {
    await removeService(listaId, filmeId);
  }, []);

  const deletar = useCallback(async (listaId: string) => {
    await deleteService(listaId);
  }, []);

  const filmeNaLista = useCallback(
    (listaId: string, filmeId: number) => {
      const lista = listas.find((l) => l.id === listaId);
      return lista?.filmes.some((f) => f.filmeId === filmeId) ?? false;
    },
    [listas]
  );

  return (
    <Ctx.Provider value={{ listas, carregando, criarLista, addFilme, removeFilme, deletarLista: deletar, filmeNaLista }}>
      {children}
    </Ctx.Provider>
  );
}

export const useListas = () => useContext(Ctx);
