# VotoCola: ficha do Google Play

Textos e respostas prontos para o Play Console. Distribuição: **somente Brasil**.

## Detalhes do app

- **Nome do app** (máx. 30): `VotoCola: colinha eleições 2026`
- **Descrição curta** (máx. 80): `Monte sua colinha das eleições 2026 com os candidatos do seu estado.`
- **Categoria:** Ferramentas
- **E-mail de contato:** support@nexti.dev
- **Site:** https://nexti.dev
- **Política de privacidade:** https://votocola.nexti.dev/privacidade

## Descrição completa

```
Vote sem esquecer nenhum número. O VotoCola ajuda você a montar a sua colinha para o 1º turno das eleições de 2026, em 4 de outubro.

COMO FUNCIONA
1. Escolha seu estado: aparecem só os candidatos que estarão na sua urna, na ordem de votação (deputado federal, deputado estadual ou distrital, senador nas duas vagas, governador e presidente).
2. Conheça os candidatos: foto, número, partido, federação ou coligação, histórico eleitoral, plano de governo, redes sociais e situação da candidatura.
3. Monte e leve sua colinha: compartilhe a imagem ou baixe o PDF para imprimir. Levar a colinha em papel é permitido; o uso do celular na cabine de votação é proibido.

DESTAQUES
• Busca por nome, número ou partido, com filtros por cargo, posição política e perfil (mulheres, pessoas negras, quilombolas, quem já foi eleito, primeira eleição e outros)
• Avisos sobre candidaturas indeferidas ou com recurso
• PDF em preto e branco pronto para imprimir, com duas cópias por folha
• Sem cadastro: sua colinha fica só no seu celular

DADOS E TRANSPARÊNCIA
As informações de candidaturas vêm do Portal de Dados Abertos do Tribunal Superior Eleitoral (dadosabertos.tse.jus.br). A posição política (esquerda a direita) é uma classificação editorial aproximada, feita por partido. Confira sempre os números em fontes oficiais antes de votar.

O VotoCola é um aplicativo independente, mantido pela Nexti. Não é um serviço oficial e não é afiliado ao Tribunal Superior Eleitoral (TSE), a partidos ou a candidatos, nem faz propaganda eleitoral.

O app é gratuito e exibe anúncios.
```

## Recursos gráficos

Gerados em `docs/loja/graficos/`:

- **Ícone** 512×512: `icone-512.png`
- **Gráfico de recursos** 1024×500: `grafico-recursos-1024x500.png`
- **Capturas de tela do celular** 1080×1920 (5, para ser elegível a destaque): `captura-1` a `captura-5`. A colinha, a busca e o perfil usam **candidatos e partidos fictícios** (avatares DiceBear "notionists", CC0), para não associar o app a nenhum candidato real.

## Classificação do conteúdo (questionário IARC)

- Categoria: **Utilitário, produtividade, comunicação ou outro**
- Violência, sexo, linguagem imprópria, drogas, jogos de azar: **Não** para tudo
- Interação entre usuários / conteúdo gerado por usuários: **Não**
- Compartilha a localização do usuário: **Não**
- Compras digitais: **Não**
- Resultado esperado: **Livre**

## Declarações

- **ID de publicidade:** Sim (o SDK do AdMob declara a permissão AD_ID)
- **App governamental:** Não

## Público-alvo e conteúdo

- **Faixa etária:** 18 anos ou mais (o voto é facultativo aos 16 e 17 anos; incluir essas faixas traz exigências extras de revisão, então vale só se fizer questão)
- **Anúncios:** Sim, o app contém anúncios
- **App de notícias:** Não
- **App governamental:** Não (e a descrição deixa explícita a não afiliação ao TSE)
- **Acesso ao app:** todas as funções ficam disponíveis sem login

## Segurança dos dados

Coerente com a política de privacidade. O próprio app não coleta dados pessoais: estado e colinha ficam no aparelho, e o servidor recebe só "+1" anônimo por candidato. **Quem coleta é o SDK do Google AdMob**, e isso precisa ser declarado.

- **O app coleta ou compartilha dados do usuário?** Sim (pelo SDK de anúncios)
- **Todos os dados são criptografados em trânsito?** Sim
- **Os usuários podem pedir a exclusão dos dados?** Não há dados vinculados ao usuário no app; os dados de anúncios são controlados nas configurações do Google (explicado na política)

Os quatro tipos abaixo (do SDK do AdMob), todos **coletados e compartilhados**, com as mesmas finalidades: **Analytics**, **Advertising or marketing** e **Fraud prevention, security, and compliance**.

- Local aproximado (derivado do IP)
- Interações com o app (interações com anúncios)
- Diagnóstico (falhas e desempenho do SDK)
- Identificadores do dispositivo ou outros (ID de publicidade)

Marcar como **processado de forma temporária**: nenhum. **Obrigatório** (não opcional): todos, porque o SDK de anúncios roda para todos os usuários.

Referência do Google sobre o que o SDK do AdMob coleta: https://developers.google.com/admob/android/privacy/play-data-disclosure
