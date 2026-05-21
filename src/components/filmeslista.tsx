import { useCallback } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFilmes } from "../hooks/useFilmes";
import { CATEGORIAS } from "../lib/tmdb";
import { Cores, Radius, State, TextColor } from "../utils/cores";
import BarraBusca from "./barraBusca";
import Categorias from "./categorias";
import FilmeCard from "./filmecard";
import FilmeDetalhe from "./filmedetalhe";
import { SkeletonRow } from "./SkeletonCard";
import { type Filme } from "../types/filme";

const CARD_WIDTH = 170;

export default function FilmesLista() {
  const {
    busca, setBusca,
    carregando,
    erro, retry,
    categoriaAtiva, setCategoriaAtiva,
    filmesExibidos,
    modoSearch,
    filmeSelecionado, setFilmeSelecionado,
  } = useFilmes();

  const renderItem = useCallback(
    ({ item }: { item: Filme }) => (
      <FilmeCard
        filme={item}
        onPress={setFilmeSelecionado}
        style={modoSearch ? styles.cardGrid : undefined}
      />
    ),
    [modoSearch, setFilmeSelecionado]
  );

  const keyExtractor = useCallback(
    (item: Filme) => item.id.toString(),
    []
  );

  const handleFechar = useCallback(
    () => setFilmeSelecionado(null),
    [setFilmeSelecionado]
  );

  return (
    <View style={styles.container}>
      <BarraBusca value={busca} onChange={setBusca} />

      {!modoSearch && (
        <Categorias ativa={categoriaAtiva} onChange={setCategoriaAtiva} />
      )}

      <Text style={styles.secaoTitulo}>
        {modoSearch ? `Resultados para "${busca}"` : CATEGORIAS[categoriaAtiva].label}
      </Text>

      {/* Estado de erro */}
      {erro ? (
        <View style={styles.erroContainer}>
          <Text style={styles.erroTexto}>{erro}</Text>
          <TouchableOpacity
            style={styles.erroBotao}
            onPress={retry}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
          >
            <Text style={styles.erroBotaoTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : carregando && filmesExibidos.length === 0 ? (
        <SkeletonRow count={3} />
      ) : (
        <FlatList
          data={filmesExibidos}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal={!modoSearch}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          key={modoSearch ? "grid" : "list"}
          contentContainerStyle={modoSearch ? styles.grid : styles.lista}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews={!modoSearch}
          getItemLayout={
            !modoSearch
              ? (_, index) => ({
                  length: CARD_WIDTH + 12,
                  offset: (CARD_WIDTH + 12) * index,
                  index,
                })
              : undefined
          }
          ListEmptyComponent={
            !carregando ? (
              <View style={styles.vazioContainer}>
                <Text style={styles.vazioEmoji}>🎬</Text>
                <Text style={styles.vazio}>
                  {modoSearch ? "Nenhum resultado encontrado." : ""}
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <FilmeDetalhe
        filme={filmeSelecionado}
        onFechar={handleFechar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  secaoTitulo: {
    color: TextColor.primary,
    fontFamily: "Poppins_700Bold",
    fontSize: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  lista: { paddingHorizontal: 16, paddingBottom: 24 },
  grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  cardGrid: {
    width: Dimensions.get("window").width - 32,
    marginRight: 0,
  },
  vazioContainer: {
    alignItems: "center",
    paddingTop: 40,
    gap: 8,
  },
  vazioEmoji: {
    fontSize: 40,
    opacity: 0.5,
  },
  vazio: {
    color: Cores.primaria + "66",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    fontSize: 14,
  },
  erroContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 32,
    gap: 16,
  },
  erroTexto: {
    color: State.error,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  erroBotao: {
    backgroundColor: Cores.primaria,
    borderRadius: Radius.md,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  erroBotaoTexto: {
    color: Cores.fundo,
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
  },
});
