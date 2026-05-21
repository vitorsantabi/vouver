import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { auth, db, firebaseReady } from "../lib/firebase";
import { type Filme } from "../types/filme";

export type FilmeAvaliado = Filme & { minhaNotaId: number; critica?: string };

type AvaliacoesCtx = {
  avaliados: FilmeAvaliado[];
  carregando: boolean;
  avaliar: (filme: Filme, nota: number) => Promise<void>;
  salvarCritica: (filmeId: number, critica: string) => Promise<void>;
  remover: (id: number) => Promise<void>;
};

const Ctx = createContext<AvaliacoesCtx>({
  avaliados: [],
  carregando: false,
  avaliar: async () => {},
  salvarCritica: async () => {},
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
  // Ref para armazenar o unsub do Firestore e evitar memory leak
  const unsubFirestoreRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!firebaseReady) {
      setCarregando(false);
      return;
    }

    const unsubAuth = auth.onAuthStateChanged((user) => {
      // Limpa listener do Firestore anterior antes de criar novo
      if (unsubFirestoreRef.current) {
        unsubFirestoreRef.current();
        unsubFirestoreRef.current = null;
      }

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

      unsubFirestoreRef.current = unsubFirestore;
    });

    return () => {
      unsubAuth();
      // Cleanup do Firestore listener ao desmontar o provider
      if (unsubFirestoreRef.current) {
        unsubFirestoreRef.current();
        unsubFirestoreRef.current = null;
      }
    };
  }, []);

  // Salva ou atualiza avaliação no Firestore
  const avaliar = useCallback(async (filme: Filme, nota: number) => {
    if (!Number.isInteger(nota) || nota < 1 || nota > 5) return;
    const col = colecaoUsuario();
    const docRef = doc(col, String(filme.id));
    await setDoc(docRef, { ...filme, minhaNotaId: nota }, { merge: true });
  }, []);

  // Salva crítica no Firestore (merge para não sobrescrever outros campos)
  const salvarCritica = useCallback(async (filmeId: number, critica: string) => {
    const col = colecaoUsuario();
    const docRef = doc(col, String(filmeId));
    await setDoc(docRef, { critica: critica.trim().slice(0, 150) }, { merge: true });
  }, []);

  // Remove avaliação do Firestore
  const remover = useCallback(async (id: number) => {
    const col = colecaoUsuario();
    await deleteDoc(doc(col, String(id)));
  }, []);

  return (
    <Ctx.Provider value={{ avaliados, carregando, avaliar, salvarCritica, remover }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAvaliacao = () => useContext(Ctx);
