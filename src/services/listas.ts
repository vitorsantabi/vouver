import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
  LISTAS_PADRAO,
  type Lista,
  type ListaFilme,
  type TipoLista,
} from "../types/lista";
import { type Filme } from "../types/filme";

// ─── Helpers ───────────────────────────────────────────────────────────────
function colecaoListas() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  return collection(db, "usuarios", uid, "listas");
}

function docLista(listaId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado");
  return doc(db, "usuarios", uid, "listas", listaId);
}

// ─── Inicializar listas padrão (chamado no primeiro acesso) ────────────────
export async function inicializarListasPadrao(): Promise<void> {
  const col = colecaoListas();
  const snap = await getDocs(col);

  // Já tem listas? Não recria
  if (!snap.empty) return;

  const now = new Date().toISOString();
  const promises = LISTAS_PADRAO.map((lista) => {
    const id = lista.tipo; // usa o tipo como ID para listas padrão
    return setDoc(doc(col, id), {
      ...lista,
      id,
      createdAt: now,
      updatedAt: now,
    });
  });

  await Promise.all(promises);
}

// ─── Listener em tempo real ────────────────────────────────────────────────
export function ouvirListas(
  callback: (listas: Lista[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const col = colecaoListas();
  return onSnapshot(
    col,
    (snap) => {
      const listas = snap.docs.map((d) => d.data() as Lista);
      // Ordena: padrão primeiro, depois custom por nome
      listas.sort((a, b) => {
        const ordemTipo: Record<TipoLista, number> = {
          quero_ver: 0,
          assistindo: 1,
          favoritos: 2,
          custom: 3,
        };
        return (ordemTipo[a.tipo] ?? 99) - (ordemTipo[b.tipo] ?? 99);
      });
      callback(listas);
    },
    (err) => {
      if (__DEV__) console.error("Listas onSnapshot erro:", err.message);
      onError?.(err);
    }
  );
}

// ─── Criar lista personalizada ─────────────────────────────────────────────
export async function criarLista(nome: string): Promise<string> {
  const col = colecaoListas();
  const docRef = doc(col); // auto-ID
  const now = new Date().toISOString();
  const lista: Lista = {
    id: docRef.id,
    nome: nome.trim().slice(0, 50),
    tipo: "custom",
    icone: "📋",
    filmes: [],
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(docRef, lista);
  return docRef.id;
}

// ─── Adicionar filme a uma lista ───────────────────────────────────────────
// Otimizado: lê apenas o documento da lista (1 read) em vez de toda a coleção
export async function adicionarFilmeNaLista(
  listaId: string,
  filme: Filme
): Promise<void> {
  const ref = docLista(listaId);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error("Lista não encontrada");

  const data = snap.data() as Lista;
  // Evita duplicatas
  if (data.filmes.some((f) => f.filmeId === filme.id)) return;

  const novoFilme: ListaFilme = {
    filmeId: filme.id,
    titulo: filme.title,
    posterPath: filme.poster_path,
    addedAt: new Date().toISOString(),
  };

  await updateDoc(ref, {
    filmes: [...data.filmes, novoFilme],
    updatedAt: new Date().toISOString(),
  });
}

// ─── Remover filme de uma lista ────────────────────────────────────────────
// Otimizado: lê apenas o documento da lista (1 read) em vez de toda a coleção
export async function removerFilmeDaLista(
  listaId: string,
  filmeId: number
): Promise<void> {
  const ref = docLista(listaId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data() as Lista;
  await updateDoc(ref, {
    filmes: data.filmes.filter((f) => f.filmeId !== filmeId),
    updatedAt: new Date().toISOString(),
  });
}

// ─── Deletar lista (só custom) ─────────────────────────────────────────────
export async function deletarLista(listaId: string): Promise<void> {
  await deleteDoc(docLista(listaId));
}
