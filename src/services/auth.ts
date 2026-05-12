import { GoogleAuthProvider, signInWithCredential, UserCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

/**
 * Finaliza o login Google trocando o id_token por credencial Firebase.
 * Chamado pelo hook useGoogleAuth após obter a resposta do provider.
 */
export async function signInWithGoogleCredential(
  idToken: string
): Promise<UserCredential> {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
}
