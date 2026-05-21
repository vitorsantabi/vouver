import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert, FlatList, Image, Modal, ScrollView, StatusBar, StyleSheet, Text,
  TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View,
} from "react-native";
import Animated, {
  FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle,
  withSpring, withTiming, runOnJS, Layout,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAvaliacao, type FilmeAvaliado } from "../../context/AvaliacoesContext";
import { auth } from "../../lib/firebase";
import { Cores, Radius, Surface, Border, TextColor, Touch, Spacing, State } from "../../utils/cores";

const IMAGE_BASE_SM = "https://image.tmdb.org/t/p/w185";
const IMAGE_BASE_LG = "https://image.tmdb.org/t/p/w342";
const CRITICA_MAX = 150;
const MAX_ANIMATED = 8;

function EstrelaNota({ nota }: { nota: number }) {
  return (
    <View style={s.estrelasRow} accessibilityLabel={`${nota} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[s.estrela, i <= nota && s.estrelaAtiva]}>★</Text>
      ))}
    </View>
  );
}

const CardItem = React.memo(function CardItem({ item, index, onPress, onRemover }: {
  item: FilmeAvaliado; index: number; onPress: (f: FilmeAvaliado) => void; onRemover: (id: number) => void;
}) {
  const handleRemover = useCallback(() => {
    Alert.alert("Remover", "Remover avaliação?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => onRemover(item.id) },
    ]);
  }, [item.id, onRemover]);
  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  const card = (
    <TouchableOpacity style={s.card} onPress={handlePress} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${item.title}`}>
      {item.poster_path ? (
        <Image source={{ uri: `${IMAGE_BASE_SM}${item.poster_path}` }} style={s.poster} resizeMode="cover" />
      ) : (
        <View style={[s.poster, s.semPoster]}><Text style={s.semPosterIcon}>🎬</Text></View>
      )}
      <View style={s.cardInfo}>
        <Text style={s.cardTitulo} numberOfLines={2}>{item.title}</Text>
        <Text style={s.cardAno}>{item.release_date?.slice(0, 4) ?? "—"} · ⭐ {item.vote_average?.toFixed(1)}</Text>
        <EstrelaNota nota={item.minhaNotaId} />
        {item.critica ? (
          <Text style={s.criticaPreview} numberOfLines={1}>💬 {item.critica}</Text>
        ) : (
          <Text style={s.minhaNotaTxt}>Sua nota: {item.minhaNotaId}/5</Text>
        )}
      </View>
      <TouchableOpacity style={s.removerBtn} onPress={handleRemover} hitSlop={Touch.hitSlop} accessibilityRole="button" accessibilityLabel={`Remover avaliação de ${item.title}`}>
        <Text style={s.removerTxt}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (index < MAX_ANIMATED) {
    return <Animated.View entering={FadeInRight.delay(index * 60).duration(350).springify()} layout={Layout.springify()}>{card}</Animated.View>;
  }
  return card;
});

function DetalheModal({ filme, onFechar, onSalvarCritica, onRemover }: {
  filme: FilmeAvaliado | null; onFechar: () => void;
  onSalvarCritica: (id: number, critica: string) => Promise<void>;
  onRemover: (id: number) => void;
}) {
  const { height } = useWindowDimensions();
  const SHEET_H = height * 0.82;
  const translateY = useSharedValue(SHEET_H);
  const backdropOp = useSharedValue(0);
  const [critica, setCritica] = useState("");
  const [salvando, setSalvando] = useState(false);

  React.useEffect(() => {
    if (filme) {
      setCritica(filme.critica ?? "");
      translateY.value = withSpring(0, { damping: 22, stiffness: 130 });
      backdropOp.value = withTiming(1, { duration: 250 });
    } else { translateY.value = SHEET_H; backdropOp.value = 0; }
  }, [filme]);

  const fechar = useCallback(() => {
    translateY.value = withTiming(SHEET_H, { duration: 280 });
    backdropOp.value = withTiming(0, { duration: 250 }, () => runOnJS(onFechar)());
  }, [onFechar, translateY, backdropOp, SHEET_H]);

  const handleSalvar = useCallback(async () => {
    if (!filme) return;
    setSalvando(true);
    try {
      await onSalvarCritica(filme.id, critica);
      fechar();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a crítica. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }, [filme, critica, onSalvarCritica, fechar]);

  const handleRemover = useCallback(() => {
    if (!filme) return;
    Alert.alert("Remover avaliação", `Remover "${filme.title}" dos seus avaliados?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: () => { onRemover(filme.id); fechar(); } },
    ]);
  }, [filme, onRemover, fechar]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOp.value }));

  if (!filme) return null;
  const ano = filme.release_date?.slice(0, 4) ?? "—";
  const nota = filme.vote_average ?? 0;
  const corNota = nota >= 7.5 ? "#4ade80" : nota >= 5 ? Cores.secundaria : "#f87171";
  const restante = CRITICA_MAX - critica.length;

  return (
    <Modal transparent visible={!!filme} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={fechar}><Animated.View style={[s.backdrop, backdropStyle]} /></TouchableWithoutFeedback>
      <Animated.View style={[s.sheet, { height: SHEET_H }, sheetStyle]}>
        <View style={s.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.sheetScroll} keyboardShouldPersistTaps="handled">
          <View style={s.sheetTopo}>
            {filme.poster_path ? (
              <Image source={{ uri: `${IMAGE_BASE_LG}${filme.poster_path}` }} style={s.sheetPoster} resizeMode="cover" />
            ) : (
              <View style={[s.sheetPoster, s.semPoster]}><Text style={s.semPosterIcon}>🎬</Text></View>
            )}
            <View style={s.sheetInfo}>
              <Text style={s.sheetTitulo}>{filme.title}</Text>
              <Text style={s.sheetAno}>📅 {ano}</Text>
              <View style={s.sheetNotaRow}>
                <View style={[s.notaCirculo, { borderColor: corNota }]}>
                  <Text style={[s.notaNum, { color: corNota }]}>{nota.toFixed(1)}</Text>
                  <Text style={[s.notaLabel, { color: corNota + "aa" }]}>TMDB</Text>
                </View>
                <View style={s.suaNotaBox}>
                  <Text style={s.suaNotaTxt}>Sua nota</Text>
                  <EstrelaNota nota={filme.minhaNotaId} />
                </View>
              </View>
            </View>
          </View>
          {filme.overview ? (<View style={s.secao}><Text style={s.secaoTitulo}>Sinopse</Text><Text style={s.sinopse}>{filme.overview}</Text></View>) : null}
          <View style={s.secao}>
            <Text style={s.secaoTitulo}>Sua Crítica</Text>
            <View style={s.criticaWrapper}>
              <TextInput style={s.criticaInput} placeholder="Escreva sua opinião sobre o filme..." placeholderTextColor={Cores.primaria + "55"} value={critica} onChangeText={(v) => setCritica(v.slice(0, CRITICA_MAX))} maxLength={CRITICA_MAX} multiline numberOfLines={3} textAlignVertical="top" accessibilityLabel="Campo de crítica do filme" />
              <Text style={[s.criticaCounter, restante < 20 && s.criticaCounterWarn]}>{restante}</Text>
            </View>
          </View>
        </ScrollView>
        <View style={s.sheetFooter}>
          <TouchableOpacity style={s.btnRemover} onPress={handleRemover} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Remover avaliação">
            <Text style={s.btnRemoverTxt}>🗑 Remover</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnSalvar, salvando && s.btnDisabled]} onPress={handleSalvar} disabled={salvando} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Salvar crítica">
            <Text style={s.btnSalvarTxt}>{salvando ? "Salvando..." : "Salvar"}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

export default function PerfilTab() {
  const router = useRouter();
  const { avaliados, salvarCritica, remover } = useAvaliacao();
  const usuario = auth.currentUser;
  const [filmeAberto, setFilmeAberto] = useState<FilmeAvaliado | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    }
  }, [router]);

  const handleRemover = useCallback(async (id: number) => { await remover(id); }, [remover]);
  const handleAbrirFilme = useCallback((filme: FilmeAvaliado) => setFilmeAberto(filme), []);
  const handleFechar = useCallback(() => setFilmeAberto(null), []);

  const handleSalvarCritica = useCallback(
    async (id: number, texto: string) => { await salvarCritica(id, texto); },
    [salvarCritica]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FilmeAvaliado; index: number }) => (
      <CardItem item={item} index={index} onPress={handleAbrirFilme} onRemover={handleRemover} />
    ), [handleAbrirFilme, handleRemover]
  );
  const keyExtractor = useCallback((item: FilmeAvaliado) => item.id.toString(), []);
  const primeiroNome = usuario?.displayName?.split(" ")[0] ?? usuario?.email?.split("@")[0] ?? "você";
  const reversedList = useMemo(() => [...avaliados].reverse(), [avaliados]);

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={Cores.fundo} />
      <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
        <View style={s.avatarContainer}>
          <View style={s.avatar}><Text style={s.avatarLetra}>{primeiroNome[0]?.toUpperCase() ?? "?"}</Text></View>
          <View>
            <Text style={s.nome}>{usuario?.displayName ?? primeiroNome}</Text>
            <Text style={s.email}>{usuario?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.botaoSair} onPress={handleLogout} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Sair da conta">
          <Text style={s.textSair}>Sair</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={s.stats}>
        <View style={s.statItem}>
          <Text style={s.statNumero}>{avaliados.length}</Text>
          <Text style={s.statLabel}>Avaliados</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNumero}>{avaliados.length > 0 ? (avaliados.reduce((sum, f) => sum + f.minhaNotaId, 0) / avaliados.length).toFixed(1) : "—"}</Text>
          <Text style={s.statLabel}>Nota média</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNumero}>{avaliados.filter((f) => f.critica).length}</Text>
          <Text style={s.statLabel}>Críticas</Text>
        </View>
      </Animated.View>
      {avaliados.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.vazio}>
          <Text style={s.vazioEmoji}>🎬</Text>
          <Text style={s.vazioTitulo}>Nenhum filme avaliado</Text>
          <Text style={s.vazioSub}>Toque em um filme e dê sua nota para ele aparecer aqui.</Text>
        </Animated.View>
      ) : (
        <FlatList data={reversedList} keyExtractor={keyExtractor} renderItem={renderItem} contentContainerStyle={s.lista} showsVerticalScrollIndicator={false} initialNumToRender={8} maxToRenderPerBatch={5} windowSize={7} />
      )}
      <DetalheModal filme={filmeAberto} onFechar={handleFechar} onSalvarCritica={handleSalvarCritica} onRemover={handleRemover} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.fundo },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Border.subtle },
  avatarContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Cores.primaria + "22", borderWidth: 2, borderColor: Cores.primaria, justifyContent: "center", alignItems: "center" },
  avatarLetra: { fontSize: 20, fontFamily: "Poppins_700Bold", color: Cores.primaria },
  nome: { fontSize: 15, fontFamily: "Poppins_700Bold", color: TextColor.primary },
  email: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88" },
  botaoSair: { backgroundColor: Cores.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, minHeight: 36, justifyContent: "center" },
  textSair: { fontFamily: "Poppins_600SemiBold", color: Cores.fundo, fontSize: 12 },
  stats: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: Spacing.xl, gap: 24, borderBottomWidth: 1, borderBottomColor: Border.subtle },
  statItem: { alignItems: "center", gap: 2 },
  statNumero: { fontSize: 26, fontFamily: "Poppins_700Bold", color: Cores.primaria },
  statLabel: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88" },
  statDivider: { width: 1, height: 36, backgroundColor: Border.subtle },
  vazio: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10, padding: Spacing.xxxl },
  vazioEmoji: { fontSize: 56 },
  vazioTitulo: { fontSize: 18, fontFamily: "Poppins_700Bold", color: TextColor.primary, textAlign: "center" },
  vazioSub: { fontSize: 13, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88", textAlign: "center", lineHeight: 20 },
  lista: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xxl, gap: 12 },
  card: { flexDirection: "row", backgroundColor: Surface.card, borderRadius: Radius.md, overflow: "hidden", borderWidth: 1, borderColor: Border.subtle, alignItems: "center" },
  poster: { width: 80, height: 110 },
  semPoster: { backgroundColor: Cores.primaria + "15", justifyContent: "center", alignItems: "center" },
  semPosterIcon: { fontSize: 28 },
  cardInfo: { flex: 1, padding: 12, gap: 4 },
  cardTitulo: { fontSize: 14, fontFamily: "Poppins_700Bold", color: TextColor.primary, lineHeight: 19 },
  cardAno: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Cores.primaria + "99" },
  estrelasRow: { flexDirection: "row", gap: 2, marginTop: 4 },
  estrela: { fontSize: 16, color: Cores.primaria + "33" },
  estrelaAtiva: { color: Cores.secundaria },
  minhaNotaTxt: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88" },
  criticaPreview: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Cores.primaria + "aa", marginTop: 2 },
  removerBtn: { padding: 14, alignSelf: "flex-start" },
  removerTxt: { fontSize: 14, color: Cores.primaria + "44" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000000cc" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: Surface.sheet, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, borderTopWidth: 1, borderColor: Border.light },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Cores.primaria + "44", alignSelf: "center", marginTop: 12, marginBottom: 8 },
  sheetScroll: { padding: 20, gap: 20, paddingBottom: 100 },
  sheetTopo: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  sheetPoster: { width: 110, height: 165, borderRadius: Radius.md, backgroundColor: Cores.primaria + "15" },
  sheetInfo: { flex: 1, gap: 8, paddingTop: 4 },
  sheetTitulo: { color: TextColor.primary, fontSize: 17, fontFamily: "Poppins_700Bold", lineHeight: 24 },
  sheetAno: { color: Cores.primaria + "99", fontSize: 13, fontFamily: "Poppins_400Regular" },
  sheetNotaRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
  notaCirculo: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, justifyContent: "center", alignItems: "center", backgroundColor: Cores.fundo },
  notaNum: { fontSize: 15, fontFamily: "Poppins_700Bold", lineHeight: 18 },
  notaLabel: { fontSize: 8, fontFamily: "Poppins_400Regular" },
  suaNotaBox: { gap: 4 },
  suaNotaTxt: { fontSize: 11, fontFamily: "Poppins_400Regular", color: Cores.primaria + "88" },
  secao: { gap: 8 },
  secaoTitulo: { color: Cores.primaria, fontSize: 12, fontFamily: "Poppins_700Bold", textTransform: "uppercase", letterSpacing: 1 },
  sinopse: { color: TextColor.muted, fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  criticaWrapper: { backgroundColor: Cores.primaria + "10", borderRadius: Radius.md, borderWidth: 1, borderColor: Border.subtle, padding: 14 },
  criticaInput: { color: TextColor.primary, fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 20, minHeight: 70, padding: 0 },
  criticaCounter: { textAlign: "right", color: Cores.primaria + "55", fontFamily: "Poppins_400Regular", fontSize: 11, marginTop: 6 },
  criticaCounterWarn: { color: State.error },
  sheetFooter: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Surface.sheet, borderTopWidth: 1, borderTopColor: Border.subtle },
  btnRemover: { flex: 1, borderRadius: Radius.md, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: State.danger + "44", backgroundColor: State.danger + "10", minHeight: Touch.minHeight, justifyContent: "center" },
  btnRemoverTxt: { color: State.danger, fontFamily: "Poppins_600SemiBold", fontSize: 14 },
  btnSalvar: { flex: 2, backgroundColor: Cores.primaria, borderRadius: Radius.md, paddingVertical: 14, alignItems: "center", minHeight: Touch.minHeight, justifyContent: "center" },
  btnSalvarTxt: { color: Cores.fundo, fontFamily: "Poppins_700Bold", fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
});
