# VotoCola

App da **colinha para as eleições 2026**: o eleitor escolhe o estado, busca os candidatos (foto, número, partido, posição política, plano de governo), monta a colinha na ordem da urna e compartilha a imagem com o link do app. Sem cadastro: tudo fica no aparelho.

## Estrutura (Yarn workspaces)

| Pacote            | Nome             | Descrição                                                                   |
| ----------------- | ---------------- | --------------------------------------------------------------------------- |
| `packages/vc-api` | `@votocerto/api` | API Nest.js 12 + GraphQL + PostgreSQL (TypeORM), importador de dados do TSE |
| `packages/vc-app` | `@votocerto/app` | App iOS e Android: Expo 57 + Expo Router + Uniwind                          |

Mesma base do Nexli, com duas diferenças: não há pacote `common` nem `db` (a camada de banco fica em `vc-api/src/database`) e não há autenticação (a API é pública, com rate limit por IP).

**Convenção**: a API devolve dados prontos para a UI (rótulos, idade, URLs de foto/plano, ordem da urna). O app só apresenta.

Análise dos dados do TSE: [docs/tse-dados.md](docs/tse-dados.md). Escopo original: [docs/init.md](docs/init.md).

## Versões (forçadas)

- **Node** `>=24.21.0 <25` ([.nvmrc](.nvmrc)); **Yarn** `4.18.0` via corepack. `yarn install` roda [scripts/check-engines.cjs](scripts/check-engines.cjs).

```bash
nvm use && corepack enable && yarn install
cp .env.example .env
```

## Desenvolvimento

```bash
docker compose up -d db          # Postgres em :5433
yarn api migration:run
yarn dev:api                     # GraphQL em http://localhost:4000/graphql
yarn dev:app                     # Expo (Expo Go: `yarn app start:tunnel` no WSL)
```

Ou `yarn docker:up` para subir banco + API (a API roda as migrations ao iniciar).

- **Celular (túnel automático)**: com `NODE_ENV=development` (ou `test`), a API sobe um túnel rápido da Cloudflare (trycloudflare.com, sem conta), usa a URL dele nas fotos/PDFs e grava `EXPO_PUBLIC_API_URL` em `packages/vc-app/.env.local`. Reinicie o Expo (`yarn app start:tunnel --clear`) quando a URL mudar: ela muda a cada reinício da API. Nunca sobe em stage/produção; `TUNNEL=false` desliga.
- Atalhos: `yarn api <script>`, `yarn app <script>`. Checks: `yarn lint`, `yarn test`, `yarn format`.

## Carga dos dados do TSE

Baixe os arquivos em [dadosabertos.tse.jus.br/dataset/candidatos-2026](https://dadosabertos.tse.jus.br/dataset/candidatos-2026) (o CDN do TSE pode bloquear downloads de servidores fora do Brasil) e rode, nesta ordem:

```bash
yarn api import:tse candidatos dados/consulta_cand_2026.zip dados/consulta_cand_complementar_2026.zip
yarn api import:tse fotos dados/foto_cand2026_SP_div.zip               # um por UF
yarn api import:tse planos dados/proposta_governo_2026_SP.zip          # um por UF (+ BR)
yarn api import:tse redes dados/rede_social_candidato_2026.zip            # links normalizados, 1 por rede
yarn api import:tse historico dados/historico_candidatura_2026.zip   # candidaturas anteriores e resultados
# yarn api import:tse resumos                                       # adiado: resumo com IA (ANTHROPIC_API_KEY)
yarn api import:tse partidos                                        # posições (partidos + exceções por candidato)
```

Os zips ficam em `dados/` (fora do git). Aceita `.zip`, diretório ou CSV, em ISO-8859-1 (original do TSE) ou UTF-8. Tudo é idempotente (upsert por `SQ_CANDIDATO`); rode de novo quando o TSE atualizar. Posições políticas e resumos preenchidos são preservados (`--force` reaplica).

Fotos e PDFs ficam em `packages/vc-api/storage/` e são servidos pela própria API em `/fotos` e `/planos`. Em produção, monte um volume nesse caminho (ou ponha um CDN na frente).

## Termos de uso e política de privacidade

Servidos pela API em `/termos` e `/privacidade` (texto em `packages/vc-api/src/legal/*.html`), que são as URLs a informar nas lojas e no AdMob. O app abre as mesmas páginas (aceite nas boas-vindas). Responsável e e-mail vêm de `LEGAL_CONTROLLER` e `LEGAL_CONTACT_EMAIL`; sem eles as páginas mostram "[a definir]". A política afirma que o servidor só guarda totais anônimos por candidato: mantenha isso verdadeiro ao mudar a API.

## API (GraphQL)

- `ballot(state)`: espaços da colinha na ordem da urna (dep. federal, dep. estadual/distrital, senador 1ª e 2ª vaga, governador, presidente) com a quantidade de dígitos.
- `candidates(filter, limit, offset)`: busca por nome/número/partido; filtros `state` (UF do eleitor, inclui presidente), `office`, `partyNumber`, `positions`, `attributes` (slugs, todos obrigatórios) e `includeInactive`.
- `candidate(id)`, `parties`, `attributes`.
- **Atributos** são genéricos: tabela `attributes` + `candidate_attributes`. O importador mantém `woman`, `man`, `reelection` e `race-*`; atributos novos entram só com dados (os vínculos manuais não são apagados na reimportação).
- **Posição política**: `parties.position`, sobrescrevível por `candidates.position`.
- **Popularidade**: `trackCandidate(candidateId, kind: VIEW|PICK)` soma +1 ao total do candidato; o servidor não guarda nada sobre quem enviou (nem aparelho, nem IP) e o app evita contar o mesmo candidato duas vezes (`src/track.ts`). Limite de 60/min por IP, em memória. A busca ordena por `popularity = escolhas × 3 + visualizações` (`sort: POPULAR`, padrão) ou por nome (`sort: NAME`). Sem interações, desempata pelo **peso de partida** (`prior_score`, calculado do histórico do TSE): o maior mandato já conquistado (presidente 30, governador/senador 25, dep. federal 18, prefeito 15, dep. estadual 14, vereador 6), com peso cheio se foi há até 4 anos, 70% até 8 e 40% antes; +1 por eleição vencida (até 5) e +1 por rede social (até 6). Favorece quem já teve mandato; é recalculado a cada importação de candidatos, redes ou histórico. Só as **visualizações** aparecem no app (olho ao lado da posição, `viewCount`/`viewCountLabel`, escondidas com `VIEW_COUNT_VISIBLE=false`); as escolhas nunca saem na API. **Atenção**: a Res. TSE 23.600/2019 veda enquetes no período eleitoral; por isso não há ranking nem números visíveis, e `POPULARITY_SORT=false` desliga a ordenação. Valide com assessoria jurídica.

## App

- Rotas em `app/` (Expo Router): `/bem-vindo` (primeira abertura), `/` colinha, `/estado`, `/buscar`, `/candidato/[id]`. UI em `src/ui` (atomic design), regras da colinha em `src/domain` (com testes), estado persistido em `src/store` (AsyncStorage).
- **Regras**: candidato de outra UF não entra (exceto presidente); o mesmo senador não pode ocupar as duas vagas; trocar de estado limpa as escolhas locais.
- **Anúncios** (AdMob): interstitial ao adicionar candidato (no máximo 1 a cada 90 s) e banner na colinha. São nativos: não funcionam no Expo Go nem na web (viram no-op). Sem as variáveis `EXPO_PUBLIC_ADMOB_*`, usa os IDs de teste do Google; troque também os App IDs em `app.json` antes de publicar.
- **Compartilhar**: a colinha vira PNG (`react-native-view-shot`) com o link do app no rodapé (`EXPO_PUBLIC_SHARE_URL`).
- **PDF para imprimir**: "Baixar PDF para imprimir" (`src/print.ts`) gera `colinha-votocola-<UF>.pdf` (A4, preto e branco, sem fotos, duas cópias com linha de recorte; cargos sem escolha com quadradinhos para preencher à mão, funciona até com a colinha vazia) e abre o compartilhamento do sistema (WhatsApp, e-mail, Drive, Arquivos).
- **Marca**: ícone, ícone adaptativo/monocromático do Android, splash, favicon e a marca usada no app saem de `assets/brand/logo-original.png` com `yarn app brand`. O logo em texto é o componente `Logo` (fonte Fredoka; "Voto" em `#6C9CF5`, versão clara do azul do logo para ter contraste no fundo escuro).
- **Testar do zero**: `expo start -c` limpa só o cache do Metro (o JavaScript empacotado), não os dados do app. Para voltar ao estado de instalação nova, use o botão **Resetar app (dev)** no fim da colinha (só existe em desenvolvimento; mantém o identificador do aparelho para não inflar a popularidade) ou limpe os dados do app nas configurações do celular (no Expo Go, isso apaga os dados de todos os projetos).
- Use `npx expo install <pacote>` (não `yarn add`) e rode `npx expo-doctor` após atualizar.

## Publicação (EAS)

```bash
cd packages/vc-app
npx eas login && npx eas init          # vincula o projeto
npx eas build --profile development    # dev build com AdMob, para testar no aparelho
npx eas build --profile production --platform all
npx eas submit --platform all
```

Antes da primeira build: App IDs reais do AdMob, links das lojas e a política de privacidade (exigida pelas lojas e pelo AdMob).
