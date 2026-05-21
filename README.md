# VouVer 🎬

Um aplicativo mobile em **Expo + React Native** para descobrir filmes, gerenciar listas personalizadas e acessar perfis de usuário.

---

## 🚀 Visão geral

O **VouVer** oferece uma experiência completa para quem quer explorar filmes de forma prática:

- Descoberta de lançamentos e populares
- Busca de filmes com cartões informativos
- Listas salvas e organizadas pelo usuário
- Cadastro e login com Firebase
- Integração com API de filmes (TMDB)

---
## ✨ Video do Projeto


https://github.com/user-attachments/assets/66a49cac-fb70-4c89-8d2f-30b604aafa8c


## ✨ Recursos principais

| Função                   | Descrição                                                |
| ------------------------ | -------------------------------------------------------- |
| 🎥 Tela de descoberta    | Página inicial com filmes em destaque e recomendações    |
| 🔍 Busca de filmes       | Pesquisa rápida por títulos e visualização de resultados |
| 📚 Listas personalizadas | Crie, salve e gerencie suas listas de filmes             |
| 👤 Perfil do usuário     | Cadastro, login e detalhes do usuário                    |
| ☁️ Firebase              | Autenticação e persistência de dados no Firebase         |
| 🧠 API TMDB              | Dados de filmes carregados pela API externa              |

---

## 📁 Estrutura do projeto

- `src/app/` — páginas e rotas do Expo Router
- `src/components/` — componentes de interface reutilizáveis
- `src/context/` — contexto de avaliações e listas
- `src/hooks/` — hooks personalizados
- `src/services/` — lógica de autenticação, listas e estado
- `src/lib/` — integração com Firebase e TMDB
- `src/types/` — tipos TypeScript do app
- `src/utils/` — utilitários de estilo e fontes

---

## ⚙️ Instalação e execução

Instale as dependências:

```bash
npm install
```

Execute o app:

```bash
npm start
```

Plataformas disponíveis:

```bash
npm run android
npm run ios
npm run web
```

---

## 🧪 Scripts úteis

- `npm start` — inicia o Expo DevTools
- `npm run android` — executa no emulador Android
- `npm run ios` — executa no simulador iOS
- `npm run web` — executa no navegador
- `npm run lint` — verifica o código com ESLint

---

## 🔧 Configuração adicional

1. Crie um arquivo `.env` a partir de `.env.example`.
2. Atualize a chave da API TMDB em `src/lib/tmdb.ts`.
3. Verifique as credenciais do Firebase em `src/lib/firebase.ts`.

> Nota: O `.env.example` oferece a estrutura das variáveis necessárias, mas não contém valores reais.

---

## 📌 Observações

- Este projeto está baseado no **Expo SDK 55**.
- Utiliza o **Expo Router** para navegação por arquivos.
- A pasta principal de desenvolvimento é `src/app/`.

---

## 💡 Como contribuir

1. Faça um fork do repositório.
2. Crie uma branch com a sua melhoria.
3. Abra um pull request explicando a mudança.

---

## 📞 Contato

Se quiser, posso ajudar a adicionar mais detalhes no README ou documentar cada tela do app.
