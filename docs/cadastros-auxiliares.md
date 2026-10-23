# Cadastros Auxiliares

Configurações (`#/settings`) apresenta cards agrupados de todos os selects do MVP: Departamentos, Setores, Tipos de Iniciativas, Status administrativo, Áreas Envolvidas, Classificação DITIC, Iniciativa Estratégica (SIM/NÃO, independente de Determinação Legal), Biênio PDTIC, Eixo, Ciclo, ENTICJUD, Objetivo Estratégico, GPs, oito dimensões de priorização, Tipo de Relatório e Situação do Status Report. `#/managers` reutiliza a mesma manutenção de GPs. Consulte [Padrões de interface](interface-mvp.md) para grupos, rotas e cores.

## Fonte e carga inicial

`assets/js/initiative-options.js` contém os valores transcritos do documento `docs/referencias/Conteúdo dos SELECTs.docx`. A referência foi conferida: DSISADM usa **Seção ERP INTEGRS E DADOS**, sem o FIN adicional que apareceu no segundo pedido. A grafia **VALORIZAÇÃO REAL DAS PESSOAL** foi preservada. Não corrigir ou acrescentar valores oficiais por inferência.

`assets/js/auxiliary-data.js` cria `sisegp-catalogs-v1` quando não existe carga anterior e complementa somente referências ausentes, considerando nomes, aliases e parentesco. IDs existentes são preservados; novas inclusões recebem IDs próprios. Não há sobrescrita de alterações legítimas, cores válidas, pontuações, reativação automática ou duplicação em cada execução. Status antigos sem cor recebem o mapa inicial documentado. Se um conteúdo local existente não puder ser lido, ele não é sobrescrito: a carga fica em memória e a gravação é impedida com mensagem de erro.

GPs começam com os sete nomes da referência e os GPs já existentes no protótipo, preservando a situação de cadastro. Não são criados CPF ou e-mail. O catálogo antigo `DemoData.managers` é mantido para compatibilidade; a interface ativa usa `AuxiliaryData`, inclusive GP no cadastro e responsável pelo relatório.

## Registro e manutenção

Cada registro tem `id`, `key` (cadastro), `name`, `active`, `parentId` (setores), `points` (opcional) e `aliases` (nomes anteriores). Status administrativos também têm `color`, validado como `#RRGGBB`, com picker e hexadecimal sincronizados. A interface permite abrir um cadastro por card/rota, pesquisar, filtrar ativos/inativos, usar Novo Cadastro, editar e ativar/inativar com confirmação. Não há exclusão física. Criticidade e GPs não têm coleções duplicadas.

Duplicatas são impedidas por nome normalizado, sem diferenciar maiúsculas/minúsculas e espaços externos, dentro do mesmo cadastro. Setores consideram também o departamento; nomes/aliases de outro registro não podem ser reutilizados ambiguamente. Departamento deve existir; novos setores exigem um departamento ativo. O departamento de um setor já criado não pode ser trocado; cadastre outro setor e inative o anterior para preservar os vínculos.

Somente as oito dimensões de priorização têm campo numérico opcional `points`. Ausência é `null`, não zero implícito. Pontuação deve ser finita. Não há valores iniciais inventados nem cálculo automático de score.

## Integridade e consumo

`AuxiliaryData.list()`, `names()` e `find()` centralizam as consultas. Formulários novos oferecem ativos. Um valor inativo/legado já usado é exibido para preservar o vínculo, identificado quando inativo; não é oferecido em novos registros. A edição de relatório também preserva o valor antigo; ao voltar para inclusão, suas opções são reconstruídas somente com ativos.

Setores têm referência ao ID do departamento; renomear o departamento mantém seus setores. Renomeações registram aliases e preservam IDs. `resolveRecord()` resolve referências de iniciativas e relatórios para o nome atual em todas as interfaces. `bindRecord()` reconstrói os IDs após escolhas do usuário. Áreas usam referências individuais, não uma coluna de IDs separados por vírgula. Registros antigos por nome continuam sendo lidos e recebem referências ao salvar, sem limpar iniciativas nem logs.

Gravações auxiliares são independentes da chave das iniciativas. Uma falha mantém a coleção anterior e informa o erro. A interface registra as ações no mecanismo local de logs; isso não representa auditoria institucional. Alterações aparecem nos selects ao abrir o cadastro e nas consultas ao navegar, sem manter uma segunda lista de iniciativas.

Na futura API, transportar IDs e relacionamentos explicitamente, com chaves estrangeiras e tabelas associativas para N:N. O banco preliminar ainda precisa dos campos adicionais de classificação/criticidade/HST. Não criar banco de produção, pesos, autenticação ou integrações nesta camada de protótipo.


Eixo atualizado: (PESSOAS) Valorização real das pessoas; (PARTICIPAÇÃO) Participação e transparência; (INOVAÇÃO) Inovação com foco em resultados; (DADOS) Gestão de dados para eficiência; (GESTÃO) Eficiência e modernização administrativa. A migração preserva IDs, aliases, situação e renomeações manuais. OUTROS fica inativo, preservando vínculos existentes. ENTICJUD e Objetivo Estratégico permanecem nos dados e cadastros legados, fora do card Classificação da Iniciativa.
