# Geração do Termo de Encerramento de Projeto

Na aba Documentos, o card Documentos padronizados contém Gerar TAP e Gerar TEP. O TEP segue a estrutura do modelo `TERMO DE ENCERRAMENTO DE PROJETO (1).docx` fornecido pelo usuário: identificação, dados, objetivo do documento, resultado entregue, status final, avaliação consolidada, pendências/ações pós-projeto e aprovadores. O layout HTML A4 retrato é compartilhado com o TAP; não reproduz exatamente a paginação do Word.

## Aproveitamento e complementos

| Informação | Origem ou preenchimento |
| --- | --- |
| Identificação | Nome e código público da iniciativa; novas iniciativas ainda não salvas são identificadas assim. |
| Setor responsável | Departamento e setor atuais. |
| GP e áreas envolvidas | Gerente de projeto e áreas confirmadas no rascunho. |
| Início e término previsto | `start` e `end`, preservando a distinção de `actualEnd`. |
| Diretor(a) do departamento | Campo novo no modal. Sem nome de exemplo pré-preenchido. |
| Gerente do setor | Sugestão do complemento já salvo do TAP, quando existir; editável. |
| Duração estimada | Sugestão do TAP, quando existir; caso contrário, mesma estimativa de meses médios do TAP, editável. |
| Resultado entregue | Campo novo; não inferir cumprimento do projeto a partir de descrição, percentual ou SR. |
| Status final | Escolha obrigatória entre Concluído, Concluído com ressalvas e Cancelado. Começa sem seleção. |
| Avaliação consolidada | Prazo, Escopo e Qualidade, cada um com escolha obrigatória Atendido, Parcial ou Não atendido; começam sem seleção. |
| Pendências e ações pós-projeto | Lista editável no modal: descrição e local de registro do backlog por pendência. Adicionar/remover linhas; linha totalmente vazia é ignorada, backlog sem descrição é rejeitado. Local é texto livre, sem integração ou navegação automática. |
| Aprovadores | Representante DITIC vazio; patrocinador e GP sugeridos dos campos atuais. Todos editáveis. Não copiar o nome pessoal do modelo. |
| Local e data | Porto Alegre e data local atual como valores iniciais editáveis; não copiar a data fixa do modelo. |
| Objetivo do documento | Texto fixo do modelo. |

Os campos novos detalham informações não previstas no cadastro ativo do MVP. Campos opcionais sem conteúdo aparecem como Não informado; a ausência de pendências é descrita como Nenhuma pendência informada. Selecionar um status ou informar aprovadores no TEP não altera o ciclo administrativo/progresso da iniciativa nem equivale a aceite ou assinatura.

## Fluxo e persistência

1. Gerar TEP aproveita os valores atuais do formulário, inclusive alterações ainda não salvas, sem trocar de rota.
2. Completar o modal e gerar abre uma prévia independente. Salvar como PDF / Imprimir usa a impressão do navegador, com seleção de Salvar como PDF. Não há biblioteca, serviço externo nem inclusão automática do PDF nos anexos.
3. Os complementos ficam em `initiative.tep`, incluindo `pendingActions: [{description, backlog}]`, no rascunho. Salvar iniciativa persiste tudo em `sisegp-data-v2`, com os mecanismos de logs e reversão de falhas existentes. Cancelamento, validação inválida ou popup bloqueado não confirmam os complementos. Campos permanecem disponíveis no modal quando ocorre falha de geração.
4. Registros antigos sem `tep` recebem valores iniciais em memória; dados existentes não são apagados. TAP e TEP mantêm complementos independentes. A futura API/banco deve prever os complementos do TEP e sua lista de pendências associados à iniciativa.

O script clássico `assets/js/tep.js` expõe `window.InitiativeTep` e carrega depois de `tap.js`, antes de `app.js`. As validações aceitam somente as opções definidas, duração finita não negativa e data real do calendário; os valores são escapados na prévia. A geração exige nome e valida as datas da iniciativa antes da abertura do modal.

## Anexos com descrição

No card Anexos da iniciativa, exclusivamente na aba Documentos, escolher um único arquivo, preencher sua descrição e clicar em Adicionar anexo. A descrição é persistida em `files[].description`, junto aos metadados existentes; arquivos antigos sem descrição continuam acessíveis e exibem Não informada. A reinclusão do mesmo nome/tamanho atualiza a descrição e reanexa os bytes apenas na memória da sessão. A iniciativa não pode ser salva com uma inclusão pendente de arquivo/descrição. Falhas de gravação preservam o rascunho e as inclusões já confirmadas. Não há armazenamento documental completo.
