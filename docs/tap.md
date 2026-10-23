# Geração do Termo de Abertura de Projeto

A aba Documentos contém o card Documentos padronizados, com Gerar TAP e [Gerar TEP](tep.md), e o card Anexos. Anexos inclui um arquivo por vez, com descrição obrigatória e confirmação por Adicionar anexo, mantendo visualização, download e remoção de arquivos existentes e as mesmas limitações de conteúdo temporário da sessão.

Gerar TAP abre um modal com os complementos do modelo `TERMO DE ABERTURA DE PROJETO (2).docx` fornecido pelo usuário. A prévia HTML preserva as seções e tabelas do modelo, com layout próprio A4 retrato; não é uma conversão do DOCX nem uma reprodução exata da paginação do Word. O botão Salvar como PDF / Imprimir abre a impressão do navegador, onde o usuário seleciona Salvar como PDF. Não há envio a serviços externos, assinatura, aprovação automática ou inclusão automática do PDF nos anexos.

## Correspondência dos dados

| Informação do TAP | Origem |
| --- | --- |
| Identificação e nome | Código público e título da iniciativa; cadastro ainda não salvo é identificado explicitamente. |
| Setor responsável | Departamento e setor. |
| GP e áreas envolvidas | Gerente de projeto e áreas confirmadas no rascunho. |
| Início e término previsto | `start` e `end`; não usar data real de término. |
| Duração estimada | Sugestão calculada em meses médios de 30,4375 dias, arredondada a uma casa decimal; editável no modal. |
| Descrição geral do escopo | Escopo Principal. |
| Objetivos SMART | Descrição da iniciativa como sugestão editável, sem presumir que o texto atende ao método SMART. |
| Impacto institucional | Benefício Esperado como sugestão editável. |
| Inclusões do escopo | Escopo Principal como sugestão editável. |
| Governança | Integrantes e papéis confirmados na equipe como sugestão; área deve ser complementada. |
| Alinhamento estratégico | Eixo cadastrado. |
| Cronograma macro | Início e término previstos, além dos marcos preenchidos no modal. |
| Objetivo do documento | Texto fixo do modelo. |

## Informações complementares

Não havia campos próprios no MVP para gerente do setor, duração em meses, problema/risco atual, necessidade da iniciativa, impacto institucional detalhado, objetivos SMART, inclusões/exclusões explícitas, entregas principais, matriz de governança com área, marcos do cronograma macro, premissas, restrições, riscos de alto nível, critérios de sucesso e de aceite, local/data de emissão. Esses campos são oferecidos no modal; local inicia como Porto Alegre e data usa o dia local da geração, substituindo a data fixa do modelo. Critérios de sucesso continuam opcionais. Campos sem conteúdo aparecem como Não informado; não preencher lacunas com dados simulados do legado.

Governança aceita uma linha por pessoa/grupo, com três colunas separadas por `|`: Nome / Grupo, Área, Qualificação / Papel. Cronograma complementar aceita Marco, Previsão, Observação no mesmo formato. Linhas sem três colunas ou sem nome/marco são rejeitadas. Valores são escapados na prévia. Duração deve ser finita e não negativa; data de emissão deve existir no calendário. Nome da iniciativa é exigido e datas da iniciativa são verificadas antes da abertura do modal.

## Rascunho e persistência

A geração usa os valores atuais do formulário, inclusive alterações ainda não salvas, sem descartar outras abas. Integrantes e áreas precisam estar confirmados pelos controles existentes. Cancelar o modal não altera a iniciativa. Gerar abre uma janela independente e armazena os complementos em `initiative.tap` no rascunho. É necessário Salvar iniciativa para persistir na chave existente `sisegp-data-v2`, usando o mesmo tratamento de falhas e histórico do cadastro. A geração isoladamente não registra uma gravação ou aprovação. Registros antigos sem `tap` recebem sugestões em memória; nenhuma migração destrutiva é necessária. Bloqueio de popup mantém o modal e os campos preenchidos. A futura API/banco deve prever os complementos de TAP associados à iniciativa.

O script clássico `assets/js/tap.js` expõe `window.InitiativeTap`, fornece o layout de impressão compartilhado com o TEP e é carregado depois de `auxiliary-view.js`, antes de `tep.js` e `app.js`, sem dependências externas. Os testes do editor cobrem integração com o rascunho, persistência dos complementos, escape e seções do modelo.
