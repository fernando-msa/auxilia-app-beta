# Modelo de dados (Firestore)

## Visão geral
O app usa duas coleções principais para alimentar a home:

- `noticias`
- `atividades`

As coleções são lidas publicamente no cliente para renderizar a home.
A escrita acontece somente via endpoint server-side (`/api/admin/content`) com validação de token e e-mail permitido.

## Coleção `noticias`
Documento com os seguintes campos:

- `titulo` (`string`, obrigatório)
- `resumo` (`string`, obrigatório)
- `categoria` (`string`, obrigatório)
- `createdAt` (`Timestamp`, gerado no servidor)
- `createdBy` (`string`, e-mail de quem publicou)

## Coleção `atividades`
Documento com os seguintes campos:

- `titulo` (`string`, obrigatório)
- `local` (`string`, obrigatório)
- `data` (`string`, obrigatório)
- `publico` (`string`, obrigatório)
- `createdAt` (`Timestamp`, gerado no servidor)
- `createdBy` (`string`, e-mail de quem publicou)

## Índices e ordenação
As consultas da home ordenam por `createdAt` em ordem decrescente.
Se o Firestore solicitar índice composto em produção, crie conforme o link sugerido no erro do console.
