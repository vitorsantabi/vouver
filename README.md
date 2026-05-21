# VouVer

Aplicativo mobile em Expo/React Native para descobrir filmes, gerenciar listas e acessar perfil de usuário.

## Sobre

Este projeto é uma versão do app **VouVer**, com navegação por abas, busca de filmes, listas personalizadas e autenticação integrada.

Principais recursos:

- Descoberta de filmes com cards e detalhes
- Busca por filmes e exibição de categorias
- Listas de filmes salvas pelo usuário
- Cadastro e perfil de usuário
- Integração com Firebase e TMDB

## Estrutura do projeto

- `src/app/` - páginas e rotas do Expo Router
- `src/components/` - componentes de interface reutilizáveis
- `src/context/` - contexto de avaliações e listas
- `src/hooks/` - hooks personalizados
- `src/services/` - lógica de autenticação e listas
- `src/lib/` - integração com Firebase e API de filmes
- `src/types/` - tipos TypeScript do app
- `src/utils/` - utilitários de estilo e fontes

## Instalação

Instale as dependências:

```bash
npm install
```

## Executando localmente

Inicie o servidor Expo:

```bash
npm start
```

Você também pode executar diretamente em plataforma:

```bash
npm run android
npm run ios
npm run web
```

## Scripts úteis

- `npm start` — inicia o Expo DevTools
- `npm run android` — executa no emulador Android
- `npm run ios` — executa no simulador iOS
- `npm run web` — executa no navegador
- `npm run lint` — verifica o código com ESLint

## Configuração adicional

- Crie um arquivo `.env` a partir de `.env.example` para armazenar chaves e variáveis de ambiente.
- Verifique as configurações do Firebase em `src/lib/firebase.ts`.
- Ajuste a chave da API TMDB em `src/lib/tmdb.ts` conforme necessário.

## Observações

Este projeto usa o Expo SDK 55 e o Expo Router para navegação baseada em arquivos.
