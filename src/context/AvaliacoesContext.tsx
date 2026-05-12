import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { type Filme } from "../types/filme";

export type FilmeAvaliado = Filme & { minhaNotaId: number };

type AvaliacoesCtx = {
  avaliados: FilmeAvaliado[];
  carregando: boolean;
  avaliar: (filme: Filme, nota: number) => Promise<void>;
  remover: (id: number) => Promise<void>;
};

const Ctx = createContext<AvaliacoesCtx>({
  avaliados: [],
  carregando: false,
  avaliar: async () => {},
  remover: async () => {},
});

// Retorna a referência da subcoleção do usuário logado
function colecaoUsuario() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  return collection(db, "usuarios", uid, "avaliados");
}

export function AvaliacoesProvider({ children }: { children: React.ReactNode }) {
  const [avaliados, setAvaliados] = useState<FilmeAvaliado[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Escuta mudanças em tempo real no Firestore para o usuário atual
  useEffect(() => {
    // Aguarda auth estar pronto
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setAvaliados([]);
        setCarregando(false);
        return;
      }

      const col = collection(db, "usuarios", user.uid, "avaliados");
      const unsubFirestore = onSnapshot(
        col,
        (snap) => {
          const lista = snap.docs.map((d) => d.data() as FilmeAvaliado);
          setAvaliados(lista);
          setCarregando(false);
        },
        (err) => {
          if (__DEV__) console.error("Firestore onSnapshot erro:", err.message);
          setCarregando(false);
        }
      );

      return unsubFirestore; // limpa listener do Firestore quando usuário muda
    });

    return unsubAuth;
  }, []);

  // Salva ou atualiza avaliação no Firestore
  const avaliar = useCallback(async (filme: Filme, nota: number) => {
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) return;
    const col = colecaoUsuario();
    const docRef = doc(col, String(filme.id));
    await setDoc(docRef, { ...filme, minhaNotaId: nota });
  }, []);

  // Remove avaliação do Firestore
  const remover = useCallback(async (id: number) => {
    const col = colecaoUsuario();
    await deleteDoc(doc(col, String(id)));
  }, []);

  return (
    <Ctx.Provider value={{ avaliados, carregando, avaliar, remover }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAvaliacao = () => useContext(Ctx);
