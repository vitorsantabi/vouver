import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { useFilmes } from "../hooks/useFilmes";
import { CATEGORIAS } from "../lib/tmdb";
import { Cores } from "../utils/cores";
import BarraBusca from "./barraBusca";
import Categorias from "./categorias";
import FilmeCard from "./filmecard";
import FilmeDetalhe from "./filmedetalhe";

export default function FilmesLista() {
  const {
    busca, setBusca,
    carregando,
    categoriaAtiva, setCategoriaAtiva,
    filmesExibidos,
    modoSearch,
    filmeSelecionado, setFilmeSelecionado,
  } = useFilmes();

  return (
    <View style={styles.container}>
      <BarraBusca value={busca} onChange={setBusca} />

      {!modoSearch && (
        <Categorias ativa={categoriaAtiva} onChange={setCategoriaAtiva} />
      )}

      <Text style={styles.secaoTitulo}>
        {modoSearch ? `Resultados para "${busca}"` : CATEGORIAS[categoriaAtiva].label}
      </Text>

      {carregando && filmesExibidos.length === 0 && (
        <ActivityIndicator color={Cores.primaria} size="large" style={styles.loader} />
      )}

      <FlatList
        data={filmesExibidos}
        renderItem={({ item }) => (
          <FilmeCard
            filme={item}
            onPress={setFilmeSelecionado}
            style={modoSearch ? styles.cardGrid : undefined}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        horizontal={!modoSearch}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        key={modoSearch ? "grid" : "list"}
        contentContainerStyle={modoSearch ? styles.grid : styles.lista}
        ListEmptyComponent={
          !carregando
            ? <Text style={styles.vazio}>{modoSearch ? "Nenhum resultado." : ""}</Text>
            : null
        }
      />

      <FilmeDetalhe
        filme={filmeSelecionado}
        onFechar={() => setFilmeSelecionado(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  secaoTitulo: {
    color: "#f1f5f9",
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  lista: { paddingHorizontal: 16, paddingBottom: 24 },
  grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  cardGrid: {
    width: Dimensions.get("window").width - 32,
    marginRight: 0,
  },
  loader: { marginTop: 40 },
  vazio: {
    color: Cores.primaria + "66",
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
});
