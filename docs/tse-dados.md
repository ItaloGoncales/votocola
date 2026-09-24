# Dados abertos do TSE: dá para montar a base?

**Sim.** O conjunto [Candidatos - 2026](https://dadosabertos.tse.jus.br/dataset/candidatos-2026) tem tudo o que a colinha precisa, exceto a posição política (que é editorial) e o resumo do plano de governo (gerado por nós).

> Layout conferido com os arquivos reais de 23/09/2026 (20.985 candidaturas; 20.061 nos cargos da colinha, 19.042 na disputa).
>
> Observação: o portal e o CDN do TSE (`cdn.tse.jus.br`) responderam **403** para downloads feitos a partir do ambiente de desenvolvimento (bloqueio do Akamai por IP/rede). Baixe os arquivos pelo navegador, ou a partir de uma rede/servidor no Brasil, e passe o caminho para o importador. O layout abaixo segue o dos anos anteriores (2022/2024); o importador lê as colunas **pelo nome do cabeçalho**, então colunas novas ou removidas não quebram nada.

## Arquivos

| Recurso                                                    | Arquivo                                                                 | Uso no app                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------- |
| Candidatos                                                 | `consulta_cand_2026.zip` (CSV por UF + `_BRASIL`)                       | base de candidatos e partidos |
| Fotos                                                      | `foto_cand2026_<UF>_div.zip` (um por UF, `F<UF><SQ_CANDIDATO>_div.jpg`) | foto do candidato             |
| Propostas de governo                                       | PDFs por candidato (só cargos majoritários)                             | link do plano + resumo        |
| Bens, redes sociais, coligações, vagas, motivo de cassação | CSVs                                                                    | futuros filtros/atributos     |

Todos os CSVs: separador `;`, campos entre aspas, codificação Latin-1, `#NULO#`/`#NE#`/`-1`/`-3` para "sem informação".

## Colunas usadas de `consulta_cand`

| Coluna TSE                                                               | Campo                                                                                                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `SQ_CANDIDATO`                                                           | `candidates.tse_id` (chave de importação, fotos e planos)                                                                            |
| `CD_CARGO`                                                               | `office`: 1 presidente, 3 governador, 5 senador, 6 dep. federal, 7 dep. estadual, 8 dep. distrital (vices e suplentes são ignorados) |
| `SG_UF`                                                                  | `state` (`BR` para presidente)                                                                                                       |
| `NR_CANDIDATO`, `NM_URNA_CANDIDATO`, `NM_CANDIDATO`                      | número, nome de urna, nome completo                                                                                                  |
| `NR_PARTIDO`, `SG_PARTIDO`, `NM_PARTIDO`, `SG_FEDERACAO`, `NM_FEDERACAO` | tabela `parties`                                                                                                                     |
| `NM_COLIGACAO`                                                           | coligação                                                                                                                            |
| `DS_GENERO`, `DS_COR_RACA`, `ST_REELEICAO`                               | atributos genéricos (mulher, homem, reeleição, cor/raça)                                                                             |
| `DT_NASCIMENTO`, `DS_GRAU_INSTRUCAO`, `DS_OCUPACAO`                      | detalhes                                                                                                                             |
| `NM_SOCIAL_CANDIDATO`                                                    | nome social, quando houver, substitui o nome civil (que nem entra na busca)                                                          |
| `NR_TURNO`                                                               | só o 1º turno é importado                                                                                                            |

## Arquivo complementar (novo em 2026)

Parte da candidatura saiu do `consulta_cand` e foi para `consulta_cand_complementar_2026`, ligado por `SQ_CANDIDATO`. No principal, `DS_SITUACAO_CANDIDATURA` vem `#NE` em todas as linhas; use sempre os dois arquivos.

| Coluna (complementar)        | Uso                                                                                             |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `DS_SITUACAO_JULGAMENTO`     | `status` (DEFERIDO, INDEFERIDO EM PRAZO RECURSAL OU COM RECURSO, RENÚNCIA, PENDENTE...)         |
| `ST_CANDIDATO_INSERIDO_URNA` | com `status`, define `active`: na urna e sem RENÚNCIA/INDEFERIDO/CANCELADO/PEDIDO NÃO CONHECIDO |
| `ST_QUILOMBOLA`              | atributo `quilombola`                                                                           |
| `ST_REELEICAO`               | atributo `reelection` (**ainda `#NE` em 23/09**: reimporte quando o TSE publicar)               |
| `DS_DETALHE_SITUACAO_CAND`   | `status_detail` (também `#NE` por ora)                                                          |

Outras particularidades: `SG_FEDERACAO` traz a composição (`45-PSDB/23-CIDADANIA`), `NM_COLIGACAO` vale "PARTIDO ISOLADO"/"FEDERAÇÃO" quando não há coligação (só `TP_AGREMIACAO = COLIGAÇÃO` é importado), e "Não divulgável" é tratado como vazio. CPF, e-mail e título de eleitor **não** são importados.

## Redes sociais (`rede_social_candidato_2026`)

Só URLs (`SQ_CANDIDATO`, `NR_ORDEM_REDE_SOCIAL`, `DS_URL`), **sem seguidores nem métricas**. Em 23/09: 61.739 links de 18.491 candidatos, de qualidade irregular (8.247 sem `https://`, muitos em maiúsculas, 1.530 só `@usuario` sem a rede, 2.146 com parâmetros de rastreio, candidato com 214 links). O importador (`import/social.ts`) completa o esquema, identifica a rede pelo domínio, remove rastreio, descarta o inutilizável e guarda 1 link por rede (máx. 8): ficam 46.256 links, 15.470 dos 19.042 candidatos ativos com pelo menos um. Links apontando para hashtags ou páginas de terceiros vêm assim do próprio cadastro.

## Histórico de candidaturas (`historico_candidatura_2026`)

Todas as candidaturas anteriores (2004–2024) de cada candidato de 2026, ligadas por `SQ_CANDIDATO_ATUAL`, com cargo, local, partido e resultado (`DS_SIT_TOT_TURNO`). Não traz votos. O importador ignora a linha da eleição atual, fica com o turno final de cada eleição e simplifica o resultado (Eleito(a) / Suplente / Não eleito(a)). Em 23/09: 44.188 candidaturas anteriores; 5.249 candidatos ativos já foram eleitos e 5.561 disputam a primeira eleição (atributos `elected-before` e `first-run`). Alimenta a seção "Histórico eleitoral" do app e o peso de partida da busca.

Nas redes, WhatsApp e Kwai são descartados por decisão de produto.

## O que não vem do TSE

- **Posição política** (Esquerda … Direita): definida por partido em [party-positions.ts](../packages/vc-api/src/import/party-positions.ts), com possibilidade de sobrescrever por candidato (`candidates.position`). **É uma classificação editorial: revise antes de publicar** e deixe claro no app (a tela do candidato já traz o aviso). Partidos sem mapeamento ficam sem posição; o comando `partidos` lista quais são.
- **Resumo do plano de governo**: gerado a partir do PDF com a API do Claude (`import:tse resumos`). Planos existem só para presidente e governador; senadores e deputados não entregam plano.

## Volume esperado

Em 2022 foram ~29 mil candidaturas (deputados são a grande maioria). Cabe folgado num Postgres pequeno; a busca usa um índice trigram (`pg_trgm`) sobre nome de urna, nome completo, número e sigla.

## Atualização

Os arquivos do TSE são republicados conforme as candidaturas são julgadas. A importação é idempotente (upsert por `SQ_CANDIDATO`) e preserva posição, foto, plano e resumo; rode de novo sempre que o TSE atualizar, principalmente nos dias antes da eleição, para pegar renúncias e indeferimentos.
