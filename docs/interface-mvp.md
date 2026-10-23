# Padrões de interface do MVP

## Padrão TJRS — referência RAAD de 20/10/2026

A camada `assets/css/institutional.css`, carregada após `styles.css`, adapta o HTML fornecido do projeto RAAD e o layout de `modelo-app-master`. As referências orientam a apresentação; seus textos, instruções e funcionalidades não são incorporados ao SISEGP. São mantidas as marcas locais do TJRS, sem migrar para Angular nem depender de fontes externas.

O padrão usa Arial/Helvetica, azul #073b68 no cabeçalho de 64px, menu lateral branco de 268px com brasão, fundo cinza #f3f5f7 e rodapé institucional compacto. Cabeçalhos das páginas recebem faixa verde/vermelha/amarela, título de peso normal e descrição. Cards e painéis brancos têm bordas suaves, cantos de 12px e sombras discretas; campos levemente cinza e botões de 42px seguem a referência. Abas, tabelas, filtros, login, configurações e diálogos compartilham esses componentes. Pontos de adaptação: 1250, 980, 720 e 430px, preservando o menu móvel existente e rolagem das abas. A impressão conserva o layout anterior, sem a faixa decorativa. Respeitar preferência por movimento reduzido e foco visível.

Os cards atuais do portfólio ocupam toda a largura, sem botões de abrir/editar/duplicar; clicar no card abre a iniciativa pelo link do título, também acessível por teclado. As oito informações ocupam duas linhas de quatro colunas no desktop: departamento/setor, tipo, GP, responsável, último SR, biênio/ciclo, início e previsão de término. A barra tem 14px e o último SR fica vermelho após mais de 15 dias. Código exibido combina departamento e número, mantendo IDs internos e URLs estáveis. Paginação permanece em 20 registros e filtros em duas linhas de seis células no desktop. Essas regras substituem descrições históricas divergentes abaixo.

## Dashboard executivo

`#/dashboard` apresenta exclusivamente cards numéricos e cards com gráficos, além do cabeçalho identificador do protótipo. Não há filtros, pesquisa, formulários, tabelas, listas ou ações sobre iniciativas. Não apresentar HST, vínculos de equipe ou documentos/anexos nesse painel. Esses dados permanecem disponíveis nas demais telas em que são pertinentes.

Os sete indicadores são total de iniciativas, ABERTO, EM PLANEJAMENTO, EM EXECUÇÃO, FINALIZADO, SUSPENSO e conclusão média. Contagens por status consideram a identidade do registro auxiliar, incluindo aliases após renomeações. Média é a soma dos percentuais dividida pela quantidade de iniciativas não arquivadas, arredondada para exibição. Ausência de registros não produz média fictícia.

Seis gráficos complementares usam os mesmos dados não arquivados: status (donut com cores configuradas), departamentos (barras horizontais), tipos (donut), ciclos (barras verticais), GPs (barras horizontais) e conclusão (barras por faixa). As faixas são 0–25%, >25–50%, >50–75% e >75–100%, cobrindo também valores fracionários sem lacunas ou sobreposição. Categorias ausentes são identificadas como Não informado; gráficos sem dados têm estado vazio.

Reutilizar `AppCharts` em `assets/js/charts.js`: SVG/CSS, sem biblioteca externa, CDN ou etapa de instalação. Há legendas, valores visíveis, nomes acessíveis e tooltips nativos quando apropriado. Gráficos ficam em duas colunas no desktop e uma no celular. Não adicionar séries ilustrativas nem usar datas/riscos fora do MVP.

## Cards e Visão Geral

O botão de edição da referência GIE apresenta somente o ícone cinza, sem fundo, borda ou sombra. Mantém área clicável de 32px, tooltip, nome acessível e foco visível por teclado.

Acima do nome da iniciativa salva, o cabeçalho mostra o código público, a referência opcional do GIE e o botão de edição, no lugar de Escritório de Gestão de Projetos. O formato é `DPROD-068 | GIE: DPROJ-555`, em 16px, alinhado à esquerda e no fluxo normal para não sobrepor o título no celular. Referências extensas usam elipse com tooltip completo. O modal aceita texto livre opcional, convertido para maiúsculas durante a digitação e no salvamento, sem frase explicativa abaixo do input. Deixar vazio remove a referência sem trocar o identificador atual. Salva imediatamente e preserva a aba e os campos pendentes do formulário. O cabeçalho do cadastro/edição da iniciativa também não exibe a frase Preencha as abas e salve o cadastro completo.

Na aba Status Report, % de Conclusão pertence a cada relatório e aparece na lista e na visualização. O indicador Conclusão do page-header mantém o percentual do relatório de data válida mais recente; editar um relatório anterior não troca esse valor. O indicador Último Status Report e seu link para a aba permanecem disponíveis. Relatórios antigos sem percentual mostram Não informado, preservando o percentual global como fallback. Regras de confirmação, edição e sincronização estão em [Status Reports](status-reports.md).

No card Anexos da iniciativa, os campos Arquivo do anexo e Descrição do anexo e o botão Adicionar anexo compartilham uma linha, com alinhamento inferior. Em telas até 720px, são empilhados. Uma linha separadora horizontal substitui a explicação entre os controles e a tabela.

Para compactar as tabelas de anexos, mostrar somente Documento, Descrição, Tamanho, Data de Inclusão e Ações, sem coluna Tipo e sem aviso de conteúdo indisponível por linha. As ações preservam o aviso quando o conteúdo temporário não está disponível.

Visualizar, Baixar e Excluir usam botões de ícone (olho, download e lixeira), com dicas no hover e nomes acessíveis que incluem o arquivo. Os botões ficam alinhados em uma linha, com alvo de 32px e foco visível.

Na aba Documentos, os dois cards compartilham uma linha no desktop: Anexos da iniciativa à esquerda ocupa 8 de 12 colunas e Documentos padronizados à direita ocupa 4. Até 980px, os cards são empilhados nessa ordem. Dentro de Documentos padronizados, TAP e TEP ficam empilhados, com a tipografia de Informações da Iniciativa, nome completo do termo, duas linhas explicativas e botão Gerar. Anexos preserva a inclusão individual com descrição; a tabela mantém rolagem horizontal quando necessário.

Atualização do cabeçalho da iniciativa: os cinco indicadores ficam acima das abas, sem título de seção, e apresentam GP, HST, dias desde o último SR, conclusão e status administrativo. Dias são apenas numéricos, com valor vermelho após mais de 15 dias e data completa disponível em tooltip; ausência usa travessão. O último card é um botão com a cor administrativa cadastrada e contraste calculado. Abre modal para salvar outro status da mesma lista do formulário, atualizando dados, histórico e log. Formulário com alterações pendentes deve ser salvo antes. Falhas preservam estado anterior e mantêm o modal aberto. Não há capa azul nem etiqueta de status no canto superior direito. Essas regras substituem as descrições históricas abaixo.

O portfólio mantém pesquisa, filtros, ordenação, paginação, cards/tabela, exportação e ações de abrir, editar, duplicar e arquivar. `MvpViews.initiativeCard()` organiza código, título, badge de status, departamento/setor, tipo, GP, ciclo informado, progresso e rodapé. O título ocupa até duas linhas; tooltip preserva o texto completo. Metadados truncados também têm tooltip. Ações somente com ícone têm nome acessível e tooltip. Cards têm fundo branco, borda/sombra discretas e grid de três, duas ou uma coluna conforme a largura.

A edição mantém seis abas e a criação cinco. A capa da Visão Geral usa azul institucional `--navy-900`, texto claro, código/nome, tipo, departamento/setor e badge de status. O percentual e a barra usam o único valor salvo `progress`, sem indicador paralelo. GP, HST, equipe, arquivos e relatórios ficam em cards claros separados, com ícones discretos. O restante das informações e o último Status Report preservam seu conteúdo e suas ações.

Reutilizar `AppUI.icon()`/`hydrateIcons()` e o catálogo SVG existente. Não introduzir outra biblioteca de ícones. Ícones não substituem labels; badges se limitam a estados, tipos/ciclos e situações que beneficiam a leitura. Tipografia do sistema, espaçamento consistente, foco visível e pontos responsivos existentes devem ser preservados. A impressão mantém legibilidade e cores significativas.

## Cores administrativas

A fonte de execução é exclusivamente o campo `color` do registro auxiliar de status administrativo em `sisegp-catalogs-v1`. A carga/migração inicial está em `initialStatusColors`, somente em `assets/js/auxiliary-data.js`:

| Status | Cor inicial |
| --- | --- |
| ABERTO | `#DDDDDD` |
| EM PLANEJAMENTO | `#009966` |
| EM EXECUÇÃO | `#EEE600` |
| EM HOMOLOGAÇÃO | `#FF6400` |
| EM AJUSTES | `#6699CC` |
| FINALIZADO | `#6699CC` |
| SUSPENSO | `#ACAA59` |
| CANCELADO | `#D8D7B1` |

Não alterar esse mapeamento inicial nem duplicá-lo nos componentes. Novos status começam com cor neutra editável. O campo aceita somente `#RRGGBB`; estilos nunca recebem texto arbitrário. `AuxiliaryData.statusStyle()` obtém a cor e calcula texto preto/branco com contraste mínimo de 4,5:1. `statusBadge()` produz a apresentação compartilhada. A cor armazenada não é clareada; cores complementares servem apenas ao contraste e ao contexto.

Mudanças salvas em Configurações são usadas no próximo render dos gráficos, indicadores de status, cards, tabelas, Visão Geral, prévia de Dados da Iniciativa, relatórios e governança. IDs/aliases preservam o vínculo após renomeação ou inativação. O Status Report tem outro cadastro e não herda as cores administrativas.

## Configurações por grupos

`#/settings` é o painel de cards dos grupos Administração das Iniciativas, Classificação da Iniciativa, Priorização da Iniciativa e Status Report. Cada card tem ícone, título, descrição, contagem e indicação de navegação. Criticidade tem uma única coleção, acessada em Priorização; GPs reutilizam a mesma manutenção de `#/managers`.

Cada cadastro abre `#/settings/catalog/:nome-codificado`. Departamentos e Setores usam `#/settings/organization` e `#/settings/organization/sectors`, com navegação interna que preserva o relacionamento. Os links funcionam com voltar/avançar e acesso direto.

A página específica mostra breadcrumb, título, descrição, voltar, Novo Cadastro, pesquisa, filtro de situação e tabela. O editor aparece após Novo Cadastro ou Editar e usa um único componente genérico. Em status, há picker e texto hexadecimal sincronizados, amostra e coluna Cor. Ativação/inativação exige confirmação. Gravações mostram sucesso/erro; não há exclusão física ou troca dos IDs.

O complemento da referência adiciona somente registros ausentes, considerando nomes anteriores/aliases e parentesco. Não reativa inativos, não substitui nomes/cores válidas ou pontos já informados e não remove registros manuais. Pontuações indefinidas continuam `null`; nenhum score foi introduzido. Dados locais ilegíveis são preservados.

## Validação

Os testes de `tests/initiative-editor.test.cjs` verificam estrutura renderizada, cálculos, cores, migração, vínculos e manutenção com DOM mínimo e armazenamento isolado. `node --check` verifica sintaxe. Esses checks não comprovam aparência, navegação por teclado real, console do navegador ou impressão: realizar essas conferências em desktop, tablet e celular antes de publicação.

Na aba Dados da Iniciativa, o card de Áreas Envolvidas e Partes Interessadas não tem título visível. Anexos da iniciativa está somente na aba Documentos, com todos os arquivos existentes preservados.
