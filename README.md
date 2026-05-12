<div align="center">

<img src="assets/images/icon.png" alt="VouVer Logo" width="120" height="120" style="border-radius: 24px"/>

# VouVer 🎬

**Descubra, avalie e organize os filmes que você quer ver.**

[![Expo](https://img.shields.io/badge/Expo-SDK_53-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.76-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%2B_Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

</div>

---

## 📸 Screenshots

> Adicione suas screenshots na pasta `assets/screenshots/` e substitua os links abaixo.


https://github.com/user-attachments/assets/364d4fe0-5364-4020-9e50-24fb715e8789


---

## ✨ Funcionalidades

- 🔐 **Autenticação** — Login e cadastro com e-mail/senha ou conta Google
- 🎬 **Feed de Filmes** — Categorias curadas pela TMDB (Em Alta, Mais Votados, Ação, Comédia, Terror)
- 🔍 **Busca inteligente** — Pesquisa com debounce de 400ms, resultado em tempo real
- ⭐ **Avaliações** — Dê de 1 a 5 estrelas para cada filme e salve no Firebase
- 👤 **Perfil pessoal** — Veja seus filmes avaliados, nota média e estatísticas
- 🌙 **Tema escuro** — Interface dark premium com paleta teal/laranja

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React Native + Expo SDK 53 |
| Navegação | Expo Router (file-based) |
| Linguagem | TypeScript |
| Autenticação | Firebase Auth (e-mail + Google OAuth) |
| Banco de dados | Firebase Firestore |
| API de filmes | TMDB (The Movie Database) |
| HTTP Client | Axios |
| Fontes | Google Fonts — Poppins |
| Estilo | StyleSheet (React Native) |

---

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar navigation
│   │   ├── index.tsx        # 🏠 Home — Feed de filmes
│   │   └── perfil.tsx       # 👤 Perfil do usuário
│   ├── _layout.tsx          # Root layout + Providers
│   ├── index.tsx            # Tela de Login
│   └── cadastro.tsx         # Tela de Cadastro
├── components/
│   ├── barraBusca.tsx       # Campo de busca
│   ├── categorias.tsx       # Abas de categoria
│   ├── filmecard.tsx        # Card de filme
│   ├── filmedetalhe.tsx     # Bottom sheet de detalhes + avaliação
│   └── filmeslista.tsx      # Orquestrador da lista
├── context/
│   └── AvaliacoesContext.tsx # Estado global de avaliações (Firestore)
├── hooks/
│   └── useFilmes.ts         # Fetch, busca e cache de filmes
├── lib/
│   ├── firebase.ts          # Configuração Firebase
│   └── tmdb.ts              # Cliente Axios para TMDB
├── types/
│   └── filme.ts             # Tipo Filme (compartilhado)
└── utils/
    ├── cores.tsx            # Paleta de cores
    └── fonts.ts             # Carregamento de fontes
```

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) 18+
- [Expo Go](https://expo.dev/go) no celular (ou emulador Android/iOS)
- Conta no [Firebase](https://console.firebase.google.com)
- Conta na [TMDB](https://www.themoviedb.org)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/VouVer.git
cd VouVer
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais reais:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=seu_app_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu_client_id.apps.googleusercontent.com
EXPO_PUBLIC_TMDB_TOKEN=seu_tmdb_bearer_token
```

### 4. Configure o Firebase

**Firestore Database:**
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um banco Firestore em modo **Produção**
3. Implante as regras de segurança:

```bash
firebase deploy --only firestore:rules
```

**Authentication:**
- Habilite os provedores: **E-mail/Senha** e **Google**

### 5. Inicie o app

```bash
npx expo start --clear
```

Escaneie o QR Code com o Expo Go ou pressione:
- `a` — Android Emulator
- `i` — iOS Simulator

---

## 🔑 Obtendo as credenciais

### Firebase
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um projeto → Adicione um app Web
3. Copie as configurações para o `.env`

### TMDB
1. Crie uma conta em [themoviedb.org](https://www.themoviedb.org)
2. Acesse **Configurações → API**
3. Copie o **Token de Acesso de Leitura da API** (JWT)

### Google OAuth
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. APIs e Serviços → Credenciais → Criar credencial → ID do cliente OAuth
3. Tipo: **Aplicativo Web**
4. URI de redirecionamento: `https://auth.expo.io/@SEU_USUARIO/VouVer`

---

## 🔒 Segurança

- Nenhuma credencial real está neste repositório
- O arquivo `.env` está no `.gitignore`
- As Firestore Security Rules garantem que cada usuário só acessa seus próprios dados
- Consulte a [auditoria de segurança](docs/security-audit.md) para detalhes técnicos completos

---

## 🎨 Paleta de Cores

| Cor | Hex | Uso |
|---|---|---|
| ![#0B132B](https://placehold.co/15x15/0B132B/0B132B.png) Fundo | `#0B132B` | Background principal |
| ![#5BC0BE](https://placehold.co/15x15/5BC0BE/5BC0BE.png) Primária | `#5BC0BE` | Textos, bordas, ícones |
| ![#F9DE7E](https://placehold.co/15x15/F9DE7E/F9DE7E.png) Secundária | `#F9DE7E` | Estrelas de avaliação |
| ![#F28627](https://placehold.co/15x15/F28627/F28627.png) Accent | `#F28627` | Botões de ação, CTAs |

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ❤️ e ☕ por **Vitor**

[![GitHub](https://img.shields.io/badge/GitHub-@seu--usuario-181717?logo=github)](https://github.com/seu-usuario)

</div>
# vouver
