# Módulo Iniciativas do MVP

## Documentos padronizados e anexos

A aba Documentos contém Documentos padronizados, com Gerar TAP e Gerar TEP, e Anexos. Os modais usam os dados atuais da iniciativa e complementos específicos; Salvar iniciativa preserva os complementos no cadastro. As prévias oferecem Salvar como PDF / Imprimir, com seleção de Salvar como PDF no navegador. Consulte [Geração do TAP](tap.md) e [Geração do TEP](tep.md) para os campos, persistência e limitações. Os PDFs não recebem aprovação ou assinatura nem são anexados automaticamente. O TEP não altera o ciclo administrativo ou o progresso da iniciativa.

O SISEGP centraliza o cadastro e o acompanhamento das iniciativas do EGP/TJRS. Nesta entrega, criação, edição e consulta usam `InitiativeEditor.mount()` em `assets/js/initiative-editor.js`. São scripts clássicos, sem framework ou backend.

## Navegação e componentes

- `#/initiative/new`: exatamente quatro abas — Dados da Iniciativa, Classificação, Equipe e Documentos. Status Report aparece somente após salvar, na edição/consulta de iniciativas existentes.
- `#/initiative/:id` e `#/initiative/:id/edit`: os mesmos formulários, precedidos por Visão Geral. Essa aba é inicial e só aparece para registros existentes.
- Abas usam `role=tab`, painéis associados e teclado com setas, Home e End. Todas ficam no mesmo formulário; trocar de aba não recria os campos.
- Alterações são rascunhos em memória. Salvar iniciativa confirma o conjunto. Há indicação de pendências, confirmação para sair internamente e `beforeunload` na recarga/fechamento.

## Campos e distribuição

O grid tem 12 colunas. Em telas até 1250/980/720/430 px, os campos são redistribuídos, com uma coluna no celular.

| Card | Linhas no desktop |
| --- | --- |
| Dados da Iniciativa | Nome (6), Data de início (2), Previsão de término (2), Data real de término (2); Tipo (3), Departamento (3), Setor (3), SEI (3); Patrocinador (3), Solicitante (3), Gerente de Projeto (3), Responsável (3); Escopo (6), Objetivo/Descrição (6); Benefício (6), Observações (6). |
| Áreas e partes interessadas (card sem título) | Áreas Envolvidas (6), Partes Interessadas (6). Status e conclusão são alterados pelos indicadores no cabeçalho após salvar a iniciativa; novos cadastros iniciam em ABERTO e 0%. O indicador Conclusão abre modal com número editável de 0 a 100, prévia da barra e gravação com histórico/log e tratamento de falha. O formulário preserva o progresso existente. |
| Anexos da iniciativa | Exclusivamente na aba Documentos, com arquivo único, descrição obrigatória e botão Adicionar anexo. Tabela compacta inclui descrição. Arquivos antigos permanecem disponíveis independentemente da origem. |
| Replanejamento | Botão Replanejamento (N) no canto superior direito de Dados da Iniciativa. Modal com nova data, justificativa de quatro linhas, um arquivo opcional e histórico. Atualiza a previsão de término no rascunho; confirmar tudo em Salvar iniciativa. |
| Classificação | Uma linha no desktop: DITIC (2), Estratégica (2), Eixo (4), Biênio PDTIC (2) e Ciclo (2), com redistribuição responsiva em telas menores. ENTICJUD e Objetivo Estratégico não são exibidos; valores anteriores são preservados. GP e Responsável ficam na aba Dados da Iniciativa; mantêm manager e mvp.classification.owner no armazenamento. |
| Priorização | Criticidade, Complexidade, Importância, Necessidade; Impacto no PE, Determinação Legal, Prazo, Orçamento. Cada campo ocupa 3 colunas. SCORE simulado no canto direito do título soma os pontos das opções selecionadas em tempo real, tanto no cadastro quanto na edição. |

Cada campo de priorização tem ícone (i) ao lado do label com explicação curta, disponível por mouse, clique e foco de teclado. Escape fecha a ajuda, assim como sair do foco ou clicar fora. Os textos esclarecem os critérios, sem interferir em seleções, SCORE ou gravação.
| Estimativa de Horas | HST numérica não negativa, independente da equipe, com unidade horas. |
| Equipe | Nome (5), Papel (3), HST (3), botão primário compacto (1). |
| Status Report | Tipo (2), Data (2), Status da Iniciativa (3), Responsável (3), % de Conclusão (2); Realizações, Impedimentos, Próximas Atividades (4 cada). Percentual pertence ao relatório e aparece na lista. |

Nome, solicitante, patrocinador, responsável e SEI são textos livres; SEI não tem máscara ou validação de domínio definida. Os quatro textos longos de Dados usam 3 linhas; os três textos do Status Report usam 5 linhas, com redimensionamento vertical. Tipo, departamento, setor, classificações, GP, status e tipo/situação do relatório são selects provenientes dos cadastros auxiliares. Nome da iniciativa é obrigatório.

## Regras de interação

- Setor pertence ao departamento. Trocar departamento limpa setor incompatível. Setores inativos já vinculados são preservados; novos vínculos oferecem registros ativos.
- Áreas usam `details/summary` com lista de checkboxes, resumo compacto, até dois chips e contador adicional. Abrir mostra todos os ativos e vínculos inativos/legados; cada seleção pode ser removida. Escape fecha a lista. Partes interessadas permitem inclusão por botão/Enter e exclusão individual; nomes repetidos não são adicionados.
- Conclusão aceita valores finitos entre 0 e 100. A barra atualiza imediatamente. Ela não muda automaticamente o status.
- Equipe exige nome e HST numérica não negativa. O botão `+` tem tooltip/nome acessível; ao editar passa a `✓`/Salvar integrante. Após confirmar, limpa os campos. Não existe Cancelar edição. Duplicatas por mesmo nome e papel são impedidas; excluir exige confirmação.
- Status Report exige tipo, data válida, situação, GP e percentual finito de 0 a 100. O label é exatamente **Status da Iniciativa**, mas seus valores são de acompanhamento. Não existe Cancelar edição; após confirmar inclusão/edição, os campos são limpos e o botão retorna ao modo de inclusão, com responsável sugerido pelo GP atual e percentual sugerido pelo último relatório (fallback para conclusão da iniciativa). Essas sugestões editáveis não criam relatório nem bloqueiam salvar outras abas; editar um relatório carrega seus próprios valores. A tabela mostra % de Conclusão por relatório e ordena por data decrescente, com última entrada primeiro em empate. Permite visualizar, editar e excluir mediante confirmação. Cabeçalho e consultas usam a conclusão do relatório mais recente, sem recuperar o percentual de um histórico apenas por editá-lo. Consulte [Status Reports](status-reports.md) para sincronização e compatibilidade.
- Integrantes e relatórios que ainda estão nos campos superiores devem ser confirmados nos botões próprios antes de salvar a iniciativa.

## Visão Geral

`MvpViews.overview()` apresenta uma capa azul institucional com nome, código, tipo, departamento/setor, badge de status e barra do percentual salvo. GP, HST e contagens de equipe, arquivos e relatórios usam cards claros separados com ícones. Mostra objetivo/descrição, escopo, benefício, DITIC, biênio, eixo, ciclo, SEI, áreas e partes interessadas. O último relatório é escolhido pela data, com resumos de até 240 caracteres e ação para o conteúdo completo. Ausências aparecem como Não informado ou estado vazio. Não calcula datas de cronograma, riscos ou decisões fictícias. Após salvar, o editor é reaberto na Visão Geral com os novos dados. Cores e padrões estão em [Interface do MVP](interface-mvp.md).

## Modelo, compatibilidade e arquivos

`gieReference` é um campo textual opcional da iniciativa, vazio para registros antigos. Serve somente à referência do identificador no sistema anterior e é exibido em maiúsculas ao lado do código público, acima do nome da iniciativa no page-header. O input converte para maiúsculas ao digitar e salvar. Um botão abre o modal para cadastrar, editar ou remover essa referência. O modal salva imediatamente na mesma chave de dados, com histórico automático/log e rollback, sincronizando o rascunho sem descartar mudanças nas abas. Não afeta o ID, numeração sequencial, código público derivado do departamento, links ou relacionamentos. Não há integração com o GIE. A futura API/banco deve contemplar esse atributo opcional.

As iniciativas continuam em `sisegp-data-v2`. `mvp.classification` contém `ditic`, `strategic`, `biennium`, `axis`, `cycle`, `owner`, `enticjud`, `objective`, `criticality`, `complexity`, `importance`, `necessity`, `impact`, `legal`, `deadline`, `budget`, `hst`. `manager` identifica o GP. `mvp.members` contém objetos com nome/papel/HST; `mvp.areas` e `mvp.stakeholders` são arrays. As coleções legadas permanecem sem exclusão.

`replans` mantém o histórico de replanejamentos (padrão []): id, date, previousEnd, newEnd, justification e attachment opcional com metadados id/name/size/mime. Data e justificativa são obrigatórias; a nova data não pode anteceder o início. A confirmação do modal atualiza actualEnd (data real) no rascunho, preservando end (previsão) e originalEnd. actualEnd é opcional e inicia vazio nos registros antigos; novos previousEnd/newEnd referem-se à data real, preservando históricos legados sem reinterpretá-los. Um único anexo é aceito por registro, sem bytes persistidos. Novos registros produzem evolução automática e log quando a iniciativa é salva, com o rollback existente em falha. A futura estrutura de BD deverá prever uma relação 1:N para replanejamentos e, para cada registro, no máximo um anexo.

`administrativeStatus` guarda o ciclo administrativo. O campo legado `status` recebe a forma compatível quando há equivalência conhecida, ou o texto do novo status cadastrado. A situação legada Atrasada não implica um ciclo administrativo; preserve-a até escolha explícita. `statusReports[].monitoringStatus` é independente; relatórios também têm `type`, `owner`, `date`, `progress`, `achievements`, `impediments`, `nextSteps`. `progress` do relatório é opcional nos dados antigos (ausência equivale a null para leitura, sem preenchimento fictício). Não inventar migração entre situações distintas.

`catalogRefs` guarda IDs dos auxiliares, incluindo referências de classificação e áreas. Relatórios têm referências próprias. Aliases e IDs permitem ler rótulos renomeados sem substituir indiscriminadamente texto livre. Ao salvar uma seleção alterada, `bindRecord()` recalcula as referências para não restaurar a opção antiga.

Anexos e documentos compartilham `files`, diferenciados por `origin`. Inclui-se um arquivo por vez com descrição obrigatória e botão Adicionar anexo; selecionar o arquivo não confirma a inclusão. Nome original, descrição, extensão, tamanho e data são exibidos quando disponíveis. Descrições antigas ausentes aparecem como Não informada. Não se duplica arquivo de mesmo nome/tamanho; confirmar a inclusão novamente atualiza a descrição e reanexa o conteúdo em memória, preservando os demais metadados. Arquivo ou descrição pendentes precisam ser adicionados ou limpos antes de salvar a iniciativa. Apenas metadados, incluindo `files[].description`, são persistidos; `File`/bytes/base64 nunca vão para localStorage. Conteúdo fica em um Map até recarga/fechamento. Há download na sessão e prévia de PDF/imagens raster comuns; outros formatos devem ser baixados. Excluir metadados exige confirmação. Não há versionamento.

## Consultas e indicadores

Dashboard, portfólio, relatórios gerais, carteira por GP e governança usam a mesma projeção `MvpViews.project()` das iniciativas não arquivadas. O Dashboard é exclusivamente executivo: cards numéricos e gráficos, sem tabelas/listas ou filtros, conforme [Interface do MVP](interface-mvp.md). Nas demais consultas, filtros usam os catálogos auxiliares e os valores legados efetivamente utilizados: status administrativo, departamento, GP, tipo, ciclo, DITIC, áreas envolvidas, criticidade e iniciativa estratégica, além da pesquisa textual. Há ordenação e, no portfólio, cards/tabela e paginação de 20 itens. Os cards organizam código/título, status colorido, departamento/setor, tipo, GP, ciclo, progresso e ações. HST ausente em todos os registros é apresentada como Não informado onde esse indicador é pertinente, nunca no Dashboard.

Indicadores fora do Dashboard podem incluir total, média dos percentuais, HST preenchidas e contagens de integrantes/documentos/relatórios. O Dashboard limita-se aos totais/status e conclusão média, com gráficos derivados do cadastro. Não usar prazo, risco, impedimento estruturado, cronograma, disponibilidade, score ou decisões simuladas. Consultas filtráveis calculam indicadores sobre os filtrados; o Dashboard usa todos os não arquivados. CSV usa o mesmo conjunto filtrado, BOM UTF-8, `;` e aspas escapadas. Impressão usa `window.print()` com CSS A4 paisagem. Status administrativos sempre usam `AuxiliaryData.statusStyle()`/`statusBadge()`, inclusive em relatórios e governança; a situação do Status Report permanece separada.

`#/critical` e `#/impediments` mostram indisponibilidade e não aparecem no menu ativo. Implementações futuras permanecem no código com prefixo `legacy`. A consulta detalhada usa as seis abas, sem reexpor as antigas áreas fora do MVP. Dados de exemplo estão explicitamente identificados como demonstrativos. Notificações automáticas permanecem indisponíveis, sem contagens fictícias. Ajuda e tour guiado foi removido do menu; Modo Apresentação não aparece no dashboard.

## Evolução e validação

Backend/API REST, autenticação, autorização, auditoria institucional, colaboração e conteúdo documental persistente continuam pendentes. A modelagem preliminar deve incluir os novos campos de classificação, criticidade e HST e relações apropriadas para equipe, documentos, relatórios, áreas e partes interessadas. Para N:N, usar tabelas associativas, nunca IDs concatenados. Pesos oficiais e cálculo de HST por equipe não foram definidos. O score demonstrativo do formulário usa pontos pseudoaleatórios fixos de 5 a 25 para cada opção; campos vazios somam zero. É derivado dos oito selects salvos, sem sobrescrever priorityScore legado ou points dos cadastros auxiliares e sem persistir total duplicado. Reabrir reproduz a soma; aliases de opções oficiais preservam os pontos após renomeação. O detalhamento dos pontos aparece no tooltip do total. Esse score não é usado nos relatórios ou em decisões de governança; a regra oficial futura deverá substituí-lo.

Execute `node --test tests/initiative-editor.test.cjs` e `node --check` para os scripts alterados. Os testes usam armazenamento isolado e um adaptador DOM mínimo; não substituem conferência de navegador, teclado real, responsividade, console e impressão.


Eixo atualizado: (PESSOAS) Valorização real das pessoas; (PARTICIPAÇÃO) Participação e transparência; (INOVAÇÃO) Inovação com foco em resultados; (DADOS) Gestão de dados para eficiência; (GESTÃO) Eficiência e modernização administrativa. A migração preserva IDs, aliases, situação e renomeações manuais. OUTROS fica inativo, preservando vínculos existentes. ENTICJUD e Objetivo Estratégico permanecem nos dados e cadastros legados, fora do card Classificação da Iniciativa.
