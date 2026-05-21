import React, { useCallback, useMemo, useState } from "react";
import {
  Alert, FlatList, Image, Modal, StyleSheet, Text, TextInput,
  TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View, StatusBar,
} from "react-native";
import Animated, {
  FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle,
  withSpring, withTiming, runOnJS,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useListas } from "../../context/ListasContext";
import { type Lista, type ListaFilme } from "../../types/lista";
import { Cores, Radius, Surface, Border, TextColor, Touch, Spacing, State } from "../../utils/cores";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w185";
const MAX_ANIMATED = 8;

const ListaCard = React.memo(function ListaCard({ lista, index, onPress }: { lista: Lista; index: number; onPress: (l: Lista) => void }) {
  const primeiros = lista.filmes.slice(0, 3);
  const hp = useCallback(() => onPress(lista), [lista, onPress]);
  const card = (
    <TouchableOpacity style={s.listaCard} onPress={hp} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Lista ${lista.nome}, ${lista.filmes.length} filmes`}>
      <View style={s.miniPosters}>
        {primeiros.length > 0 ? primeiros.map((f, i) => (
          <Image key={f.filmeId} source={{ uri: `${IMAGE_BASE}${f.posterPath}` }} style={[s.miniPoster, { zIndex: 3 - i, marginLeft: i > 0 ? -20 : 0 }]} resizeMode="cover" />
        )) : (
          <View style={[s.miniPoster, s.miniPosterEmpty]}><Text style={s.miniPosterEmoji}>{lista.icone}</Text></View>
        )}
      </View>
      <View style={s.listaInfo}>
        <Text style={s.listaNome}>{lista.nome}</Text>
        <Text style={s.listaCount}>{lista.filmes.length} {lista.filmes.length === 1 ? "filme" : "filmes"}</Text>
      </View>
    </TouchableOpacity>
  );
  return index < MAX_ANIMATED ? <Animated.View entering={FadeInDown.delay(index * 80).duration(400).springify()}>{card}</Animated.View> : card;
});

function ListaDetalheModal({ listaId, listas, onFechar, onRemoverFilme, onDeletarLista }: {
  listaId: string | null; listas: Lista[]; onFechar: () => void;
  onRemoverFilme: (lid: string, fid: number) => void; onDeletarLista: (lid: string) => void;
}) {
  const { height } = useWindowDimensions();
  const DETAIL_H = height * 0.75;
  const translateY = useSharedValue(DETAIL_H);
  const backdropOp = useSharedValue(0);
  const lista = useMemo(() => listas.find((l) => l.id === listaId) ?? null, [listas, listaId]);

  React.useEffect(() => {
    if (listaId) {
      translateY.value = withSpring(0, { damping: 22, stiffness: 130 });
      backdropOp.value = withTiming(1, { duration: 250 });
    } else { translateY.value = DETAIL_H; backdropOp.value = 0; }
  }, [listaId]);

  const fechar = useCallback(() => {
    translateY.value = withTiming(DETAIL_H, { duration: 280 });
    backdropOp.value = withTiming(0, { duration: 250 }, () => runOnJS(onFechar)());
  }, [onFechar, translateY, backdropOp, DETAIL_H]);

  const handleDeletar = useCallback(() => {
    if (!lista) return;
    Alert.alert("Deletar lista", `Deletar "${lista.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Deletar", style: "destructive", onPress: () => { onDeletarLista(lista.id); fechar(); } },
    ]);
  }, [lista, onDeletarLista, fechar]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOp.value }));

  const renderFilme = useCallback(({ item, index: idx }: { item: ListaFilme; index: number }) => {
    const row = (
      <View style={s.filmeRow}>
        {item.posterPath ? <Image source={{ uri: `${IMAGE_BASE}${item.posterPath}` }} style={s.filmePoster} resizeMode="cover" /> : <View style={[s.filmePoster, s.miniPosterEmpty]}><Text style={{ fontSize: 20 }}>🎬</Text></View>}
        <Text style={s.filmeTitulo} numberOfLines={2}>{item.titulo}</Text>
        <TouchableOpacity onPress={() => onRemoverFilme(listaId!, item.filmeId)} hitSlop={Touch.hitSlop} accessibilityRole="button" accessibilityLabel={`Remover ${item.titulo}`}>
          <Text style={s.filmeRemover}>✕</Text>
        </TouchableOpacity>
      </View>
    );
    return idx < MAX_ANIMATED ? <Animated.View entering={FadeInRight.delay(idx * 50).duration(300)}>{row}</Animated.View> : row;
  }, [listaId, onRemoverFilme]);

  if (!listaId || !lista) return null;

  return (
    <Modal transparent visible={!!listaId} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={fechar}><Animated.View style={[s.backdrop, backdropStyle]} /></TouchableWithoutFeedback>
      <Animated.View style={[s.detailSheet, { height: DETAIL_H }, sheetStyle]}>
        <View style={s.handle} />
        <View style={s.detailHeader}>
          <Text style={s.detailTitulo}>{lista.icone} {lista.nome}</Text>
          <Text style={s.detailCount}>{lista.filmes.length} filmes</Text>
        </View>
        {lista.filmes.length === 0 ? (
          <View style={s.detailVazio}>
            <Text style={s.detailVazioEmoji}>📭</Text>
            <Text style={s.detailVazioTxt}>Nenhum filme adicionado</Text>
            <Text style={s.detailVazioSub}>Toque em um filme na aba Início e adicione aqui!</Text>
          </View>
        ) : (
          <FlatList data={lista.filmes} keyExtractor={(i) => i.filmeId.toString()} renderItem={renderFilme}
            showsVerticalScrollIndicator={false} contentContainerStyle={s.detailLista}
            initialNumToRender={10} maxToRenderPerBatch={8} windowSize={7} />
        )}
        {lista.tipo === "custom" && (
          <TouchableOpacity style={s.btnDeletar} onPress={handleDeletar} activeOpacity={0.85}>
            <Text style={s.btnDeletarTxt}>🗑 Deletar lista</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Modal>
  );
}

export default function ListasTab() {
  const { listas, carregando, criarLista, removeFilme, deletarLista } = useListas();
  const [listaAbertaId, setListaAbertaId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const handleCriar = useCallback(async () => { if (!novoNome.trim()) return; await criarLista(novoNome); setNovoNome(""); setCriando(false); }, [novoNome, criarLista]);
  const handleRemoverFilme = useCallback((lid: string, fid: number) => { removeFilme(lid, fid); }, [removeFilme]);
  const handleDeletar = useCallback((lid: string) => { deletarLista(lid); }, [deletarLista]);
  const handleAbrir = useCallback((l: Lista) => setListaAbertaId(l.id), []);
  const renderItem = useCallback(({ item, index }: { item: Lista; index: number }) => <ListaCard lista={item} index={index} onPress={handleAbrir} />, [handleAbrir]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Cores.fundo} />
      <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
        <Text style={s.headerTitulo}>📋 Minhas Listas</Text>
        <TouchableOpacity style={s.btnNova} onPress={() => setCriando(true)} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Criar nova lista">
          <Text style={s.btnNovaTxt}>+ Nova</Text>
        </TouchableOpacity>
      </Animated.View>
      {criando && (
        <Animated.View entering={FadeInDown.duration(300)} style={s.criarBox}>
          <TextInput style={s.criarInput} placeholder="Nome da lista..." placeholderTextColor={Cores.primaria + "55"} value={novoNome} onChangeText={setNovoNome} maxLength={50} autoFocus returnKeyType="done" onSubmitEditing={handleCriar} />
          <TouchableOpacity style={s.criarBtn} onPress={handleCriar} activeOpacity={0.85}><Text style={s.criarBtnTxt}>Criar</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => { setCriando(false); setNovoNome(""); }} hitSlop={Touch.hitSlop}><Text style={s.criarCancel}>✕</Text></TouchableOpacity>
        </Animated.View>
      )}
      {carregando ? (
        <View style={s.loadingBox}><Text style={s.loadingTxt}>Carregando listas...</Text></View>
      ) : listas.length === 0 ? (
        <View style={s.vazio}><Text style={s.vazioEmoji}>📋</Text><Text style={s.vazioTitulo}>Sem listas</Text></View>
      ) : (
        <FlatList data={listas} keyExtractor={(i) => i.id} renderItem={renderItem} contentContainerStyle={s.lista} showsVerticalScrollIndicator={false} />
      )}
      <ListaDetalheModal listaId={listaAbertaId} listas={listas} onFechar={() => setListaAbertaId(null)} onRemoverFilme={handleRemoverFilme} onDeletarLista={handleDeletar} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Border.subtle },
  headerTitulo: { fontSize: 20, fontFamily: "Poppins_700Bold", color: TextColor.primary },
  btnNova: { backgroundColor: Cores.primaria, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, minHeight: 36, justifyContent: "center" },
  btnNovaTxt: { fontFamily: "Poppins_600SemiBold", color: Cores.fundo, fontSize: 13 },
  criarBox: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Border.subtle },
  criarInput: { flex: 1, backgroundColor: Surface.input, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10, color: TextColor.primary, fontFamily: "Poppins_400Regular", fontSize: 14, borderWidth: 1, borderColor: Border.medium },
  criarBtn: { backgroundColor: Cores.secundaria, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md },
  criarBtnTxt: { fontFamily: "Poppins_600SemiBold", color: Cores.fundo, fontSize: 13 },
  criarCancel: { fontSize: 18, color: Cores.primaria + "66", padding: 4 },
  lista: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl, gap: 14 },
  listaCard: { backgroundColor: Surface.card, borderRadius: Radius.md, overflow: "hidden", borderWidth: 1, borderColor: Border.subtle, flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  miniPosters: { flexDirection: "row", width: 80, height: 60, alignItems: "center" },
  miniPoster: { width: 42, height: 58, borderRadius: 6, backgroundColor: Cores.primaria + "15", borderWidth: 1, borderColor: Border.subtle },
  miniPosterEmpty: { justifyContent: "center", alignItems: "center" },
  miniPosterEmoji: { fontSize: 22 },
  listaInfo: { flex: 1, gap: 2 },
  listaNome: { fontSize: 15, fontFamily: "Poppins_700Bold", color: TextColor.primary },
  listaCount: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88" },
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingTxt: { color: Cores.primaria + "88", fontFamily: "Poppins_400Regular", fontSize: 14 },
  vazio: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  vazioEmoji: { fontSize: 56 },
  vazioTitulo: { fontSize: 18, fontFamily: "Poppins_700Bold", color: TextColor.primary },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000000cc" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Cores.primaria + "44", alignSelf: "center", marginTop: 12, marginBottom: 8 },
  detailSheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: Surface.sheet, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, borderTopWidth: 1, borderColor: Border.light },
  detailHeader: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Border.subtle },
  detailTitulo: { fontSize: 18, fontFamily: "Poppins_700Bold", color: TextColor.primary },
  detailCount: { fontSize: 12, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88", marginTop: 2 },
  detailLista: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 80, gap: 10 },
  detailVazio: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, padding: 40 },
  detailVazioEmoji: { fontSize: 48 },
  detailVazioTxt: { fontSize: 16, fontFamily: "Poppins_700Bold", color: TextColor.primary, textAlign: "center" },
  detailVazioSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88", textAlign: "center", lineHeight: 20 },
  filmeRow: { flexDirection: "row", alignItems: "center", backgroundColor: Surface.card, borderRadius: Radius.sm, padding: 10, gap: 12, borderWidth: 1, borderColor: Border.subtle },
  filmePoster: { width: 45, height: 65, borderRadius: 6, backgroundColor: Cores.primaria + "15" },
  filmeTitulo: { flex: 1, fontSize: 14, fontFamily: "Poppins_600SemiBold", color: TextColor.primary, lineHeight: 19 },
  filmeRemover: { fontSize: 14, color: Cores.primaria + "44", padding: 8 },
  btnDeletar: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: State.danger + "15", borderWidth: 1, borderColor: State.danger + "44", borderRadius: Radius.md, paddingVertical: 14, alignItems: "center" },
  btnDeletarTxt: { color: State.danger, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
});
