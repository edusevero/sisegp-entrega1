# Conclusão por Status Report

O campo % de Conclusão da aba Status Report registra `statusReports[].progress`, independente dos demais relatórios. Novas inclusões e edições exigem valor finito entre 0 e 100, com decimais permitidos. O percentual aparece na tabela, na visualização do relatório e no resumo do último relatório da Visão Geral. O cadastro inicial segue sem Status Report.

O campo usa `report-progress`. Para novas inclusões, Responsável pelo Relatório vem com o gerente atual da iniciativa e % de Conclusão com o percentual do relatório mais recente (fallback para o percentual atual da iniciativa, inclusive zero). Ambos são editáveis. Após confirmar, os demais campos são limpos e essas sugestões são reaplicadas para a próxima inclusão. Sugestões não marcam o formulário como alterado, não criam relatório e não impedem salvar outras abas. Mudanças manuais nesses campos exigem confirmar o relatório. Ao editar um relatório existente, carregar seus próprios valores, inclusive percentual ausente, sem substituí-los pelas sugestões. Trocar o GP no rascunho atualiza a sugestão de responsável somente na inclusão e enquanto ela não foi substituída manualmente.

Não grava ao digitar nem atualiza o cabeçalho durante edição de um histórico. Confirmar relatório adiciona/atualiza o rascunho; Salvar iniciativa persiste pela chave existente `sisegp-data-v2`, com os mecanismos de histórico/log e rollback. Percentual isolado alterado precisa ser confirmado junto a um relatório; não há gravação isolada pela aba.

## Percentual atual e cabeçalho

`InitiativeEditor.latestStatusReport()` escolhe o relatório de data válida mais recente; datas iguais usam a última entrada na coleção. `reportProgress()` valida a leitura sem converter ausência ou texto vazio em zero. `syncReportProgress()` sincroniza o percentual atual da iniciativa com o relatório escolhido, mantendo cabeçalho, portfólio, consultas e CSV coerentes pela projeção existente.

- Inserir ou editar um relatório anterior mantém o percentual do mais recente no cabeçalho.
- Editar o relatório mais recente ou mudar datas recalcula o percentual atual ao confirmar.
- Excluir o mais recente recupera o percentual do anterior, quando disponível.
- Se não houver relatório ou o mais recente não tiver percentual válido, preservar o percentual atual da iniciativa. Relatórios antigos sem percentual exibem Não informado. Nenhuma migração atribui o percentual global a todo o histórico.
- O indicador Último Status Report do page-header continua usando a data válida mais recente e abrindo a aba, sem alteração da navegação.

O modal de Conclusão do cabeçalho continua disponível, bloqueado com rascunho pendente, e atualiza também o percentual do relatório mais recente quando existe. A regra já existente de status administrativo FINALIZADO em 100% mantém a sincronização com esse relatório. Ambos preservam o rollback dos dados/logs em falha. Alterar o percentual de um relatório não altera seu status de acompanhamento nem o ciclo administrativo.

Os registros antigos e as coleções associadas são preservados. A futura API/banco deve incluir percentual opcional no Status Report e seleção explícita do relatório atual por data; não usar zero como padrão para informação histórica ausente.
