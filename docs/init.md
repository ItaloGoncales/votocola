# App VotoCerto

App que lista todos os candidatos, traz o plano de governo (traz resumo também), mostra foto, número, partido, lado político, etc.

Chamada principal do app é a colinha para as eleições, daqui 2 semanas. Você pode buscar o candidato, e add ele na sua collinha.

A ordem de voto desse ano será: deputado federal, deputado estadual, senador (primeira vaga), senador (segunda vaga), governador e presidente da República.

O ideal é votar somente no representante do seu estado (exceto presidente), então o app não precisa criar usuário, mas precisa salvar o estado do usuário na memória, e passar a listar os candidatos do seu estado. É claro, o usuário pode pesquisar removendo o filtro de estado, e sabendo mais sobre vários candidatos. Ao tentar add um candidato fora do estado, dizer que não é possível votar em um candidato fora do seu estado (acho que a urna nem libera se não me engano)

há dados abertos dos candidatos no tse. Seu papel será analisar os dados disponíveis, e dizer se dá pra criar base:
https://dadosabertos.tse.jus.br/dataset/candidatos-2026

Aplicação deve ser em next para mobile (ios e android), não precisa de site, a API deve ser em nestjs, e usar psql como banco de dados.

Deve conter a base do candidato como dados básicos, partido, posição política (Esquerda,Centro-Esq,Centro,Centro-Dir,Direita)

Depois podemos pensar em tabelas chamadas atributos, e candidato_attr, onde vamos colocar dados de filtro novo, como mulher, reeleição, preto, pardo, branco, etc... Deixar genérica

O app pode ser simples, rápido de se fazer, mas que seja intuitivo e bonito. A monetização será por meio de ADs, vamos adicionar quando o usuário adiciona um candidato, e quando abre o app na visualização da colinha.

O usuário pode compartilhar a imagem da colinha com terceiros, e sempre irá o link do app na loja, para poder fazer outras pessoas baixarem.
