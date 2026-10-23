# Orientações para agentes — SISEGP / TJRS

## Contexto e objetivo

Este repositório contém o protótipo funcional do Sistema do Escritório de Gestão de Projetos (SISEGP), destinado a apoiar o Escritório de Projetos do Tribunal de Justiça do Rio Grande do Sul (TJRS), também denominado EGP/PMO na interface.

O objetivo é validar a experiência de centralização e acompanhamento das iniciativas institucionais: portfólio, responsabilidades, planejamento, entregas, riscos, impedimentos, reuniões, documentos e informações para governança. Os principais públicos representados são gerentes de projetos (GPs), chefia do EGP e gestores que consultam informações executivas.

Trate o sistema como protótipo front-end com dados de exemplo. A aparência institucional, os nomes e os endereços presentes no código não comprovam integração, identidade autenticada nem uso em produção. Não acrescente dados reais de processos, documentos sigilosos, credenciais ou informações pessoais para demonstrar funcionalidades.

Estas orientações se aplicam a toda a pasta. Antes de alterar qualquer fluxo, leia a implementação correspondente; o README descreve intenções e pode divergir do comportamento atual.

## Arquitetura e arquivos

Não há framework, dependências de terceiros, gerenciador de pacotes, etapa de build, backend ou banco de dados. A aplicação usa HTML, CSS, JavaScript em scripts clássicos, SVG e armazenamento do navegador.

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura global, marca TJRS, menu, área `#conteudo`, pesquisa, notificações, modal e região de toasts. |
| `assets/js/data.js` | Catálogos, gerador de 200 iniciativas, modelos de artefatos, arquivos de exemplo e API `window.DemoData`. |
| `assets/js/charts.js` | Agregações, gráficos SVG/CSS, paleta e escape de HTML; expõe `window.AppCharts`. |
| `assets/js/app.js` | Estado, roteamento, renderização de telas, formulários, eventos, persistência, evolução e logs locais. |
| `assets/js/initiative-options.js` | Carga oficial de referência para os selects do MVP. |
| `assets/js/auxiliary-data.js`, `assets/js/auxiliary-view.js` | Persistência, vínculos e manutenção dos cadastros auxiliares. |
| `assets/js/initiative-editor.js`, `assets/js/mvp-views.js` | Formulários compartilhados, Visão Geral e consultas/indicadores do MVP. |
| `assets/css/styles.css` | Tokens visuais, componentes, layouts, responsividade e impressão. |
| `assets/css/institutional.css` | Camada visual TJRS baseada no protótipo RAAD de 20/10/2026 e no modelo local; carregar depois de styles.css. |
| `assets/images/` | Marca institucional e favicon locais. |
| `README.md` | Apresentação, execução, funcionalidades, limitações e possíveis evoluções. |

Preserve a ordem de carregamento: `data.js`, `charts.js`, `initiative-options.js`, `auxiliary-data.js`, `initiative-editor.js`, `demo-completion.js`, `mvp-views.js`, `auxiliary-view.js`, `tap.js`, `tep.js`, `app.js`. Os scripts usam IIFEs e `'use strict'`. Não converta para módulos ou introduza bibliotecas, CDN, bundler ou servidor sem necessidade expressa da tarefa.

## Navegação e módulos

O menu lateral exibe somente Iniciativas e Cadastro de GP (sob Administração). Página inicial, Repositório do EGP, Relatórios (incluindo o submenu), Logs, Configurações e Governança foram retirados do menu por solicitação do usuário; suas rotas e funcionalidades permanecem acessíveis por links diretos. Não restaurar esses itens ao ajustar a navegação. A marca lateral usa `assets/images/tjrs-instituicao.png`, fornecida pelo usuário como braasao2.png, sem distorção. Os links da marca superior e da marca lateral apontam para `#/initiatives`.

O roteamento é feito por `location.hash` e pelo evento `hashchange`, sem reescrita de URL no servidor. Preserve links profundos, navegação voltar/avançar e a página de conteúdo não encontrado.

Após login, abrir `#/initiatives`. Essa também é a rota padrão sem hash e o destino de acesso a `#/login` com sessão já autenticada. O item Página inicial foi removido do menu. A rota explícita `#/dashboard` continua disponível por link direto; não redirecionar outros links profundos autenticados.

| Rota | Área |
| --- | --- |
| `#/dashboard` | Painel executivo exclusivamente com cards numéricos e gráficos, sem listas, tabelas ou filtros. |
| `#/initiatives` | Portfólio com pesquisa, filtros, ordenação, paginação de 20 itens e modos cards/tabela. |
| `#/initiative/new` | Cadastro de iniciativa. |
| `#/initiative/INI-001` | Detalhes de uma iniciativa; o identificador é variável. |
| `#/initiative/INI-001/edit` | Edição da iniciativa. |
| `#/artifacts` | Rota removida; exibe conteúdo não encontrado. |
| `#/repository` | Repositório geral do EGP. |
| `#/reports`, `#/gp-report` | Relatórios e carteira por GP, somente com campos do MVP. |
| `#/critical`, `#/impediments` | Indisponibilidade informativa; fora do menu ativo do MVP. |
| `#/logs` | Histórico local de eventos, com filtros e paginação. |
| `#/managers`, `#/settings`, `#/governance` | GPs, configurações e visão de governança. |
| `#/settings/catalog/:nome`, `#/settings/organization`, `#/settings/organization/sectors` | Manutenção específica dos auxiliares e estrutura organizacional; nome do cadastro é codificado na URL. |
| `#/action/...` | Telas auxiliares; algumas dependem de contexto mantido em memória. |

O cadastro MVP usa quatro abas (Dados da Iniciativa, Classificação, Equipe e Documentos). A edição/consulta usa seis, com Visão Geral inicial e Status Report exclusivo de iniciativas salvas. As antigas áreas de RACI, riscos, marcos, cronograma, evolução e reuniões permanecem no código legado, fora das telas ativas de iniciativas. Consulte a seção MVP e os documentos específicos antes de criar links.

## Dados, regras e persistência

- A entidade central é a iniciativa, identificada por `id` no padrão inicial `INI-001`. Preserve identificadores únicos e referências ao alterar cadastro ou duplicação.
- O código público do MVP usa `AuxiliaryData.initiativeCode(item)`: departamento atual + número global do ID (ex.: `DSUP-068`). Cards, Visão Geral, tabelas e CSV usam esse código; pesquisa aceita código e ID legado. IDs internos, URLs e referências permanecem estáveis. Mudança de departamento ou renomeação do catálogo altera o prefixo exibido, sem renumerar nem desvincular registros. Sem departamento, mostrar SEM-DEPARTAMENTO como prefixo.
- Preserve os campos consumidos pelas telas e as coleções `risks`, `milestones`, `activities`, `evolutions`, `meetings`, `files`, `raci` e `statusReports`. Novos campos precisam de valores padrão para registros antigos.
- Use `AuxiliaryData` como fonte dos selects e filtros do MVP. `InitiativeOptions` é a carga de referência; os catálogos antigos de `DemoData` permanecem apenas para compatibilidade e geração demonstrativa. Não manter listas ativas divergentes.
- Os 200 registros pertencem à carga inicial, não a uma contagem fixa após cadastros ou arquivamentos. Há nove pessoas no catálogo de gestores; o gerador distribui iniciativas entre as oito primeiras.
- O gerador usa sementes para diversos atributos, mas também usa `new Date()`: reuniões, prazos de risco e alguns estados variam com a data de execução. Não assuma que a carga inteira é independente do relógio.
- Mantenha progresso numérico entre 0 e 100. Preserve a coerência com a situação, especialmente conclusão, ao alterar regras.
- Arquivamento usa `archived`; as consultas de portfólio ativo devem excluir esses registros. Não substitua arquivamento por exclusão definitiva.
- Datas de domínio são normalmente `YYYY-MM-DD`; a apresentação é brasileira (`DD/MM/AAAA`). Preserve o tratamento local das datas, evitando deslocamentos por conversão UTC.
- Não usar indicadores de atraso, vencimento, risco ou desatualização nas consultas ativas do MVP. Os helpers `isDelayed`, `isStale` e `isDueSoon` permanecem no legado; sua existência não autoriza reintroduzir campos fora do cadastro.
- Criticidade e nível de risco são dimensões distintas; risco também contém probabilidade, impacto e pontuação. Não intercambie esses campos por semelhança do texto.
- Alterações persistentes de iniciativas devem passar pelo fluxo `persist()`/`DemoData.save()`, atualizar os indicadores pertinentes e informar falhas de gravação quando o fluxo for modificado.

| Armazenamento | Chave | Conteúdo |
| --- | --- | --- |
| `localStorage` | `sisegp-data-v2` | Iniciativas e seus registros associados. |
| `localStorage` | `sisegp-audit-v1` | Eventos locais, limitados aos 2.500 mais recentes. |
| `localStorage` | `sisegp-view` | Preferência de cards/tabela. |
| `localStorage` | `sisegp-catalogs-v1` | Cadastros auxiliares, IDs, situação, hierarquia, aliases e pontuações opcionais. |
| `sessionStorage` | `sisegp-access-logged` | Controle de registro de acesso da sessão. |
| `sessionStorage` | `sisegp-authenticated` | Acesso simulado da aba; removido pela opção Sair no menu do usuário. |

O menu do usuário no cabeçalho permite acessar o perfil e sair. Sair encerra apenas a sessão simulada e fecha overlays; não limpa iniciativas nem logs. O visual adapta o layout e as marcas de `modelo-app-master` em HTML/CSS, sem incorporar Angular ou a biblioteca externa `@ditic/modelo-ui-lib`.

Preserve compatibilidade com os dados já gravados. Há normalizações de coleções, status reports, reuniões e nomes legados no início de `app.js`; considere-as ao alterar o esquema. Não renomeie chaves nem limpe armazenamento como solução para incompatibilidade sem tratar a migração. Restauração de iniciativas e limpeza dos logs são operações distintas; confira o manipulador de cada ação.

Para ações relevantes, reutilize os mecanismos `recordAutomatic()` e `addAuditLog()` quando aplicáveis. Diferencie evolução manual e automática, preservando `source`, `automatic` e a ligação `auditId`. Os logs são demonstrações locais editáveis pelo navegador, sem garantia de auditoria institucional.

## Convenções de implementação

- Faça alterações focadas no pedido. Evite reformatar arquivos inteiros ou reorganizar a arquitetura junto de uma mudança pontual.
- Use português do Brasil na interface e documentação, preservando acentuação e UTF-8. Os identificadores existentes são predominantemente em inglês; siga o contexto local.
- Reutilize os helpers de componentes, formulários, badges, gráficos e ícones antes de criar alternativas.
- Os eventos são majoritariamente delegados no `document`, por atributos `data-*`. Ao adicionar controles, conecte renderização e manipulador sem duplicar listeners após cada renderização.
- Conteúdo de usuário e armazenamento local deve passar por `escapeHtml()` ao entrar em templates HTML, inclusive atributos. Valide separadamente URLs, identificadores, números e valores usados em estilos; escape de HTML não substitui essas validações.
- Após inserir componentes dinâmicos com `data-icon`, considere `hydrateIcons()`. Novas rotas devem preservar o título da página, o estado ativo do menu e o foco do conteúdo.
- Evite formulários aninhados e preserve validação e vínculos entre rótulos e campos. Não exiba mensagem de gravação real para uma ação que apenas altera a apresentação.

## Interface, acessibilidade e impressão

Mantenha a identidade visual existente: azuis institucionais, superfícies claras, tipografia do sistema, logo local e cores semânticas de sucesso, alerta e risco. Reutilize variáveis de `:root`, componentes e convenções como `.button`, `.panel`, `.field` e `.badge`.

O padrão visual global está em `institutional.css`: Arial/Helvetica local, cabeçalho #073b68 de 64px, menu branco de 268px, fundo #f3f5f7, títulos leves, superfícies brancas, campos #f8fafb, botões e cards arredondados e faixa verde/vermelha/amarela no cabeçalho das páginas. Usa as imagens institucionais locais do modelo. Não importar dependências Angular nem fontes externas. As regras visuais estão limitadas a telas quando necessário para preservar impressão, layouts de formulários e metadados dos cards. As cores administrativas configuráveis e o destaque vermelho de SR com mais de 15 dias permanecem preservados.

Preserve o funcionamento em desktop, tablet e celular. O CSS contém pontos de adaptação em 1250, 980, 720 e 430 pixels. Confira tabelas, Gantt, filtros, cards e menu lateral em telas estreitas.

Mantenha HTML semântico, link de salto, foco visível, labels, navegação por teclado e atributos ARIA coerentes. Botões apenas com ícone precisam de nome acessível. Situações e riscos precisam de texto além de cor. Confira abertura, fechamento por Escape e gerenciamento de foco em overlays quando estes forem alterados.

A exportação CSV usa BOM UTF-8, separador `;`, aspas escapadas e o resultado de `filteredInitiatives()`. Preserve a compatibilidade com conteúdo acentuado e a correspondência entre filtros e exportação.

O PDF usa `window.print()` e a opção de salvar do navegador. O CSS de impressão configura A4 paisagem e oculta controles globais. Alterações em relatórios precisam considerar impressão, quebras e legibilidade do documento.

## Limites e divergências conhecidos

- Não há autenticação, autorização efetiva, colaboração simultânea nem integração ativa com SEI, GIE, Microsoft 365 ou IA.
- Uploads guardam metadados, sem preservar os bytes dos arquivos. Não descreva esse fluxo como armazenamento documental completo.
- Algumas telas auxiliares, cadastros administrativos e ações rápidas exibem formulários ou toasts sem implementar toda a operação sugerida. Verifique a mutação efetiva e a persistência antes de afirmar que uma função está pronta.
- O download auxiliar de documento produz texto `.txt`; os formatos DOCX/XLSX/PPTX apresentados nos catálogos não significam geração desses arquivos.
- Notificações automáticas estão indisponíveis no MVP. Calendário e gráficos históricos ilustrativos permanecem somente no código legado, fora do dashboard ativo. Indicadores ativos derivam dos dados cadastrados.
- Por solicitação do usuário, os cards de aviso demonstrativo foram removidos do portfólio, consultas e editor; `demoBanner()` retorna vazio. A natureza fictícia dos dados permanece documentada, sem qualquer integração ou informação oficial.
- O README menciona `.htaccess`, mas esse arquivo não está presente na pasta analisada. Não presuma que os cabeçalhos citados estão configurados.
- O README usa o caminho de publicação `/tjrs/sisegp/`. Servindo diretamente esta raiz de trabalho, a URL local é `/`; o subcaminho só existe se o servidor o disponibilizar.

Esses pontos são contexto para manutenção, não uma solicitação para corrigir todos eles em cada tarefa. Atualize a documentação quando uma mudança alterar esses limites.

## Execução e validação

Abra `index.html` diretamente ou execute um servidor estático nesta pasta, se o interpretador estiver disponível:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Acesse `http://127.0.0.1:8080/`. Não há comandos `npm install` ou `npm run build`. Os testes do editor MVP usam apenas Node.js: `node --test tests/initiative-editor.test.cjs`. Eles verificam lógica com um adaptador DOM mínimo; não substituem validação visual e interativa no navegador. O armazenamento pode variar entre `file://`, endereços, portas e perfis do navegador; use a mesma origem ao verificar persistência.

Se Node.js estiver disponível, confira a sintaxe dos scripts alterados:

```powershell
node --check assets/js/data.js
node --check assets/js/charts.js
node --check assets/js/app.js
```

Adapte a validação ao impacto da mudança:

1. Confira carregamento dos recursos e console; ao alterar navegação global, percorra as rotas do menu, links diretos e endereço inexistente.
2. Para portfólio, combine pesquisa/filtros, ordenação, paginação, cards/tabela, métricas e exportação.
3. Para dados, confira criação/edição, recarga da página, duplicação e arquivamento em um perfil de teste. Não restaure dados do usuário para realizar testes.
4. Para áreas da iniciativa, verifique o registro alterado, o histórico automático/manual, logs e indicadores relacionados.
5. Para interface, confira desktop e celular, teclado, overlays e console; para relatórios, verifique a prévia de impressão.
6. Para mudanças de esquema, verifique carga inicial e registros previamente persistidos, incluindo coleções ausentes.

Uma alteração apenas documental exige revisão do conteúdo e dos caminhos, sem necessidade de instalar ferramentas ou criar testes. Informe o que foi efetivamente verificado e qualquer validação de navegador não realizada; não repita como evidência própria a seção histórica de validação do README.

Ao entregar mudanças, resuma o resultado, os arquivos relevantes e as verificações realizadas. Atualize este guia quando arquitetura, comandos, armazenamento ou fluxos mudarem de forma material.

## SISEGP — Módulo Iniciativas (MVP)

Consulte estas regras e [docs/modulo-iniciativas.md](docs/modulo-iniciativas.md) antes de alterar o módulo central do SISEGP. A finalidade é centralizar iniciativas e registros associados para acompanhamento do EGP/TJRS. A documentação dos cadastros está em [docs/cadastros-auxiliares.md](docs/cadastros-auxiliares.md); padrões visuais, Dashboard, cores e Configurações estão em [docs/interface-mvp.md](docs/interface-mvp.md).

- **Criação:** exatamente quatro abas — Dados da Iniciativa, Classificação, Equipe e Documentos. **Edição e consulta de existentes:** os mesmos componentes, com Visão Geral inicial e Status Report ao final (seis abas). Não renderizar formulário nem aba de Status Report no cadastro inicial. Preservar dados existentes sem duas implementações independentes.
- **Dados da Iniciativa:** grid responsivo de 12 colunas. Nome/início/previsão de término em 8/2/2; segunda linha tipo/departamento/setor/SEI em 3/3/3/3; terceira linha patrocinador/solicitante/GP/responsável em 3/3/3/3 (GP e responsável transferidos da aba Classificação, mantendo os campos manager e mvp.classification.owner); escopo/descrição e benefício/observações em pares 6/6. Datas opcionais usam `start`/`end` (YYYY-MM-DD), validando término igual ou posterior ao início sem substituir `originalEnd`. Textos longos têm 3 linhas. Nome é obrigatório; SEI é texto livre. Trocar departamento limpa setor incompatível.
- **Áreas e partes interessadas:** na aba Dados da Iniciativa, o card não tem título visível e contém somente Áreas Envolvidas e Partes Interessadas, em 6/6. Áreas usam lista suspensa compacta com checkboxes, chips removíveis e resumo adicional; partes interessadas permitem múltiplos nomes sem duplicação. Anexos ficam exclusivamente na aba Documentos, incluindo arquivos antigos de qualquer origem.
- **Atualização da Administração:** o select administrativo foi removido da criação e edição. Novas iniciativas começam em ABERTO; existentes preservam o status salvo. Alterações de status ficam no card do page-header. Conclusão/progresso ocupam 6/6 no formulário; o indicador Conclusão do cabeçalho também é botão e abre modal com número de 0 a 100 e barra sincronizada. Bloquear esse modal com rascunho pendente. Salvar atualiza percentual, data, histórico automático e log, sem alterar status; falhas revertem estado/log e mantêm modal aberto. Não aplicar esse fluxo à situação de acompanhamento de Status Reports.
- **Classificação:** uma única linha no desktop com DITIC (2), estratégica (2), eixo (4), biênio (2) e ciclo (2), no grid de 12 colunas, com redistribuição responsiva em telas menores. ENTICJUD e Objetivo Estratégico foram removidos do card, preservando os dados existentes. GP (select dos ativos) e responsável (texto livre) ficam em Dados da Iniciativa. Priorização contém oito selects em duas linhas de quatro (3 colunas). HST é numérica não negativa e independente das horas dos integrantes. O SCORE demonstrativo soma os oito critérios de priorização, com pontos fixos pseudoaleatórios por opção (5–25), recalculados ao alterar os selects. Valor vazio contribui zero. Não representa pesos oficiais e não altera pontuações do cadastro auxiliar.
- **Equipe:** nome/papel/HST/botão em 5/3/3/1. Nome obrigatório, HST não negativa; adicionar, editar, excluir com confirmação. Botão compacto + com nome acessível vira Salvar/✓ na edição e retorna à inclusão após confirmar, limpando campos. Não há Cancelar edição, RACI nova ou disponibilidade. Impedir duplicação involuntária de nome/papel.
- **Status Report:** tipo/data/Status da Iniciativa/responsável/% de Conclusão em 2/2/3/3/2; realizações/impedimentos/próximas atividades em três textareas iguais de 5 linhas. Label exatamente Status da Iniciativa. Tipo, data válida, situação, GP e percentual de 0 a 100 são obrigatórios. Tabela por data decrescente com percentual por relatório e visualizar/editar/excluir confirmada. Sem Cancelar edição; após confirmar, limpar e voltar à inclusão. O percentual atual da iniciativa acompanha o relatório mais recente, preservando os históricos.
- **Estados separados:** `administrativeStatus` é ciclo administrativo. `statusReports[].monitoringStatus` é situação de acompanhamento (inicialmente Em dia, Atrasado, Em risco). Preservar o campo legado `status` sem inferir ciclo a partir de Atrasada. Não intercambiar criticidade com risco.
- **Visão Geral:** somente existentes. A capa tem fundo azul institucional, texto contrastante, código/nome, informações principais, badge de status e barra do único percentual salvo. Indicadores claros separados usam ícones para GP/HST/contagens. Manter informações principais e último relatório por data com conteúdo completo acessível. Ausências usam Não informado/estado vazio. Atualizar após salvamento, sem valor de progresso paralelo.
- **Fonte única:** `AuxiliaryData` em `assets/js/auxiliary-data.js` atende selects e filtros. Configurações permite administrar todos os cadastros; Cadastro de GP reutiliza o mesmo componente. A carga em `initiative-options.js` foi conferida com o DOCX local. Preservar grafia oficial, inclusive Seção ERP INTEGRS E DADOS. Não inventar CPF/e-mail.
- **Integridade auxiliar:** IDs estáveis, setores vinculados ao departamento, aliases para renomeações, sem exclusão física. Inativos continuam nos vínculos existentes e não são oferecidos em novos. Duplicidade é impedida dentro do cadastro (e do departamento para setores). Carga idempotente complementa somente valores ausentes, considerando aliases/parentesco, sem reativar ou sobrescrever nomes, cores válidas, pontuações ou dados manuais. Dados locais ilegíveis não são sobrescritos. Pontuações auxiliares são opcionais/null e independentes do score demonstrativo do formulário. Não transferir setor existente entre departamentos.
- **Persistência:** manter `sisegp-data-v2`, logs e demais chaves existentes. Auxiliares usam `sisegp-catalogs-v1`. `catalogRefs` associa IDs preservando os campos textuais legados; relatórios têm referências próprias. `resolveRecord()` lê nomes atuais e `bindRecord()` reconstrói IDs após alterações explícitas. Preservar campos e coleções não expostos; não limpar armazenamento para migrar esquema.
- **Rascunhos:** trocar abas não perde valores nem altera dados persistidos. Confirmar integrantes/relatórios nos botões próprios e depois salvar a iniciativa. Tratar falhas mantendo o formulário e revertendo a mutação do estado. Reutilizar logs/evolução automática quando aplicável. Manter avisos de alterações pendentes, Escape, foco e ARIA coerentes.
- **Arquivos:** documentos e anexos compartilham `files`, com origem/categoria. No card de anexos da aba Documentos, adicionar um arquivo por vez, com descrição obrigatória no input e confirmação por Adicionar anexo. Exibir nome/descrição/extensão/tamanho/data; descrições antigas ausentes usam Não informada. Evitar duplicação por nome/tamanho: nova inclusão do mesmo arquivo atualiza a descrição e reanexa o conteúdo em memória, preservando origem e demais metadados. Não salvar a iniciativa com arquivo/descrição pendentes de inclusão. Permitir remoção confirmada. Persistir só metadados, incluindo `files[].description`; File/bytes ficam em Map na sessão, sem base64/binários no localStorage. Download/prévia dependem desse conteúdo temporário; após recarga selecionar novamente. Sem versionamento nem integração externa.
- **Consultas:** Dashboard, portfólio, relatórios e governança usam a mesma projeção `MvpViews.project()` dos registros não arquivados. Somente campos do MVP e derivações legítimas. Portfólio/relatórios preservam pesquisa, filtros, ordenação e exportação; CSV usa exatamente os filtrados com BOM/;/aspas. Não mostrar cronograma, prazo, riscos, impedimentos estruturados ou decisões simuladas. A natureza demonstrativa é documentada; os cards de aviso foram removidos por solicitação do usuário.
- **Dashboard:** exclusivamente cards numéricos e gráficos; sem pesquisa, filtros, formulários, tabelas ou listas de iniciativas. Indicadores: total, abertas, planejamento, execução, finalizadas, suspensas e conclusão média. Não apresentar HST, vínculos de equipe ou documentos/anexos nesse painel. Donuts, barras horizontais/verticais e faixas de conclusão usam `AppCharts` SVG/CSS existente, sem nova biblioteca. Legendas/tooltips, estados vazios e responsividade são obrigatórios; não inventar valores para preencher gráficos.
- **Cards de iniciativas:** grid responsivo com altura consistente, fundo claro, bordas/sombras discretas, código/título, status, departamento/setor, tipo, GP, ciclo informado, progresso e ações existentes. Limitar título a duas linhas com tooltip completo; ícones discretos não substituem labels. Reutilizar `AppUI.icon()` e `hydrateIcons()`. Badges/chips são usados seletivamente para estados, tipo/ciclo e situação, sem poluição visual.
- **Cores de status:** somente `AuxiliaryData` guarda o mapa inicial `initialStatusColors` e o campo persistente `color`. O mapeamento exato está em docs/interface-mvp.md; EM AJUSTES e FINALIZADO começam ambos em `#6699CC`. Validar `#RRGGBB`. Picker e hexadecimal são administráveis em Configurações. Todos os componentes e gráficos de status leem `statusStyle()`/`statusBadge()`, calculando contraste sem alterar o HEX armazenado. Status Report é independente e não herda essas cores.
- **Configurações:** painel de cards agrupados em Administração, Classificação, Priorização e Status Report, com ícone/descrição/contagem. Cada cadastro tem rota própria e manutenção genérica com breadcrumb, voltar, Novo Cadastro, pesquisa, situação e ações. Departamentos/Setores têm navegação relacionada. Criticidade é coleção única; GPs reutilizam a estrutura existente. Confirmar ativação/inativação e tratar falhas de gravação. Preservar links diretos e voltar/avançar.
- **Navegação:** Ajuda e tour guiado removido do menu; Modo Apresentação removido do dashboard. Relatórios integralmente fora do MVP não aparecem no menu e suas rotas exibem indisponibilidade. Preservar implementações futuras com prefixo legacy e dados sem reativar telas incompatíveis.
- **Arquitetura e futuro:** preservar HTML/CSS/JS clássicos, identidade institucional, responsividade, componentes, foco e impressão. A modelagem de banco é preliminar; futura API/banco deve incorporar classificação adicional, criticidade, HST e relacionamentos com equipe/documentos/relatórios. N:N usa relações próprias, nunca IDs concatenados. Backend, autenticação/autorização, colaboração e armazenamento documental real permanecem pendentes.
- **Documentação permanente:** toda tarefa futura que modificar campos, regras, cadastros, relacionamentos, navegação, arquitetura ou comportamento deve atualizar o AGENTS.md na mesma tarefa, além dos documentos específicos quando necessário. Manter interfaces, entidades e futura API consistentes, sem instruções redundantes/conflitantes nem regras de negócio inventadas.


## Preenchimento demonstrativo e portfólio

## Replanejamento da iniciativa

Na aba Status Report de iniciativas existentes, % de Conclusão pertence a cada relatório em `statusReports[].progress`, na primeira linha em 2/2/3/3/2 (tipo/data/situação/responsável/percentual), e aparece na lista e na visualização. Exigir percentual finito de 0 a 100, aceitando decimais, ao confirmar relatório. Na inclusão, responsável vem do GP atual e percentual do último relatório (fallback para conclusão da iniciativa); ambos editáveis. Após confirmar, limpar os demais campos e reaplicar essas sugestões. Sugestões intocadas não geram pendência nem criam relatório; alterações manuais exigem confirmação. Edição carrega valores próprios do relatório. Trocar GP só atualiza a sugestão ainda não substituída manualmente, fora da edição. Salvar percentual isolado pela aba não cria relatório. Confirmar relatório e depois Salvar iniciativa persiste seus dados e sincroniza `initiative.progress` com o relatório de data válida mais recente (em empate, a última entrada na coleção). Editar/inserir um histórico não substitui o percentual do mais recente. Excluir ou mudar a data recalcula qual relatório é atual. Registros antigos sem percentual mostram Não informado, sem inventar histórico; na ausência de percentual válido no último relatório, preservar o percentual atual da iniciativa. Alteração no modal de Conclusão do cabeçalho atualiza também o relatório mais recente, quando existe, com o mesmo rollback/log existente. A regra administrativa de FINALIZADO em 100% também mantém essa sincronização. Mudança efetiva de progresso gera evolução/log ao salvar. Administração continua sem esse campo e cadastro inicial sem Status Report. Ver [Status Reports](docs/status-reports.md); futura API/banco deve prever percentual opcional por relatório.

No page-header, Último Status Report é um botão que ativa a aba Status Report (índice 4) da iniciativa atual e move o foco para sua aba. Não recarrega a página nem descarta alterações pendentes do formulário.

O botão Replanejamento aparece somente para iniciativas existentes (`source.id`), na edição/consulta. Não aparece no cadastro de uma nova iniciativa; salvar primeiro para disponibilizar essa ação.

Atualização: primeira linha de Dados da Iniciativa contém Nome (6), Início (2), Previsão de término (2) e Data real de término (2). Novo campo `actualEnd` é opcional e inicia vazio em registros antigos. Replanejamento atualiza somente `actualEnd`, preservando `end` (previsão) e `originalEnd`. Nos novos registros, previousEnd/newEnd guardam datas reais; históricos antigos não são modificados. Validar data real igual ou posterior ao início. Essas regras substituem referências anteriores abaixo a replanejamento alterando a previsão/end.

O card sem título na aba Dados da Iniciativa exibe somente Áreas Envolvidas e Partes Interessadas. O campo de percentual e sua barra foram removidos desse card. A conclusão é editada pelo modal do indicador do cabeçalho para iniciativas salvas; novas começam com 0%. O salvamento do formulário preserva o percentual existente, sem depender de controles de progresso no formulário.

O card Dados da Iniciativa tem botão Replanejamento (N) no canto superior direito, na criação e na edição. Abre modal com nova data de término obrigatória, justificativa obrigatória em textarea de quatro linhas, um anexo opcional e histórico completo em ordem inversa. Validar data real e igual ou posterior ao início; permitir apenas um arquivo. Confirmar o modal adiciona ao rascunho e atualiza end; é necessário Salvar iniciativa para persistir. Cancelar o modal não adiciona registro. Histórico e contador incluem registros pendentes do rascunho. Preservar campos não relacionados e originalEnd; quando ausente, usar o término anterior ao primeiro replanejamento.

Coleção `replans` normalizada para [] em registros antigos, na mesma chave sisegp-data-v2. Cada registro contém id, date, previousEnd, newEnd, justification e attachment opcional (id/name/size/mime). Anexo persiste somente metadados; não prometer armazenamento documental. Ao salvar, novos IDs de replanejamento geram evolução automática e auditId pelo fluxo existente. Falha de persistência mantém rascunho e reverte estado/logs; recargas e edições preservam histórico. A futura modelagem do BD deverá incluir relacionamento 1:N com iniciativa e anexo opcional por replanejamento.

O indicador de priorização mostra visualmente apenas SCORE ao lado do número, sem a palavra simulado. A natureza demonstrativa das pontuações permanece documentada e no nome acessível do indicador.

Os oito labels de priorização têm botão de ajuda (i), com textos de `priorityHelp` no editor: criticidade, complexidade, importância, necessidade, impacto no Planejamento Estratégico, determinação legal, prazo e orçamento. Mostrar tooltip ao passar mouse, focar pelo teclado ou clicar; clique fixa/fecha, Escape fecha, sair do foco ou clicar fora fecha. Usar botão type=button, aria-expanded/controls/describedby e role=tooltip, sem incluir botão dentro do label. Ajuda não altera rascunho nem SCORE; os textos são orientativos, sem pesos ou regras institucionais oficiais.

O ícone de ajuda é discreto (círculo visual de 14px, texto de 11px, cor neutra e fundo transparente), com alvo clicável de 24px e alinhamento à direita na linha do label. Preservar foco visível e a área do tooltip relativa à largura do campo.

O tooltip de priorização abre acima da linha do label, com fundo amarelo-claro #fff8dc, texto #514a32, borda #eadca2 e sombra suave, mantendo caráter informativo discreto.

Os cards abrem a iniciativa pelo link nativo do título, expandido por CSS à superfície do card, com foco de teclado. Não exibem botões de abrir, editar ou duplicar. As oito informações ocupam duas linhas de quatro colunas iguais no desktop, duas colunas em tablet e uma em celular. A barra de progresso ocupa a largura disponível e tem 14px de altura. Exibir a data válida mais recente de Status Report e dias de calendário até hoje (data local; cálculo sem efeito de horário de verão); informar ausência ou data futura explicitamente.

No card, o responsável usa `mvp.classification.owner` ao lado do GP. Último SR e Biênio / Ciclo são entradas da mesma lista de metadados, com rótulo, valor e ícone; não usar um chip separado para ciclo. A explicação dos cálculos não aparece no portfólio; as regras continuam documentadas aqui e nos relatórios.

No cabeçalho da página de uma iniciativa existente, cinco cards apresentam GP, estimativa HST, Último Status Report (número seguido de dias), Conclusão (%) e Status da Iniciativa. `MvpViews.headerSummary()` reúne código e cards de `summaryMetrics()` com valores salvos acima das abas. Não há etiqueta de status nem capa azul. O código da iniciativa e a referência GIE ficam acima do nome, no lugar do texto Escritório de Gestão de Projetos, em 16px e no fluxo normal do cabeçalho, sem sobreposição. Não exibir a frase Preencha as abas e salve o cadastro completo no editor. Os cinco indicadores não exibem ícones e têm espaçamento compacto. Último SR usa a data válida mais recente, dias de calendário e número vermelho estritamente após 15 dias; ausência aparece como travessão e data futura tem contagem negativa, sem alerta. Conclusão usa `progress`, sem cálculo paralelo.

O card Status da Iniciativa é um botão com fundo e texto contrastante de `AuxiliaryData.statusStyle()` e abre modal com o mesmo catálogo de status administrativos usado no formulário (ativos + valor atual). Não confundir com a situação do SR. Alterações pendentes no formulário impedem a abertura para preservar o rascunho; orientar salvar primeiro. Gravação pelo modal atualiza status administrativo, referência auxiliar, status legado, data de atualização, evolução automática e log; FINALIZADO define progresso 100. Persistir com rollback do estado/log se falhar e manter modal aberto para tentar novamente. Atualizar o cabeçalho após sucesso. `showModal()` respeita retorno false de onConfirm para não fechar em falhas/validação.

Os cards também exibem `start` e `end` como Data de início e Previsão de término em DD/MM/AAAA. Destacar em vermelho o último Status Report quando tiver estritamente mais de 15 dias de calendário; não destacar relatório ausente, inválido ou futuro. Esse destaque visual não altera a situação cadastrada do SR nem o indicador SR Atrasados.

`demo-completion.js` complementa os campos ausentes do cadastro MVP das iniciativas existentes, inclusive classificação, equipe, anexos (somente metadados) e Status Reports. Usa os catálogos auxiliares e preserva valores preenchidos, IDs e coleções legadas. O marcador `demoCompletionVersion: 1` evita recompletar registros em recargas posteriores; cadastros salvos pelo editor recebem o marcador e continuam permitindo campos opcionais vazios. A base complementada passa pelo armazenamento habitual e alimenta dashboard, portfólio e relatórios. Não são criados bytes de documentos nem dados pessoais reais.

No portfólio, filtros ocupam duas linhas de seis células no desktop, com adaptação em telas menores. Cada card ocupa uma linha completa e a paginação contém 20 registros. Os indicadores são Iniciativas, Conclusão média, Status Reports e SR Atrasados. O último conta todos os relatórios com situação Atrasado nas iniciativas filtradas, incluindo o histórico e reconhecendo renomeações do catálogo. A ação de arquivar foi retirada dos cards. Os avisos demonstrativos em cards foram removidos por solicitação do usuário; o sistema continua sendo um protótipo local.


Eixo atualizado: (PESSOAS) Valorização real das pessoas; (PARTICIPAÇÃO) Participação e transparência; (INOVAÇÃO) Inovação com foco em resultados; (DADOS) Gestão de dados para eficiência; (GESTÃO) Eficiência e modernização administrativa. A migração preserva IDs, aliases, situação e renomeações manuais. OUTROS fica inativo, preservando vínculos existentes. ENTICJUD e Objetivo Estratégico permanecem nos dados e cadastros legados, fora do card Classificação da Iniciativa.

Na manutenção de Gerentes de Projetos (Cadastro de GP, #/managers), não exibir o botão Voltar às Configurações nem a frase descritiva “Mantenha os registros utilizados nos selects. IDs e vínculos existentes são preservados.” no cabeçalho. Os demais cadastros auxiliares mantêm esse botão.

## Referência do sistema anterior

O botão de referência GIE mostra apenas o ícone cinza, sem fundo, borda ou sombra, inclusive no hover. Preservar alvo clicável de 32px, nome acessível, tooltip e foco visível por teclado.

O cabeçalho de iniciativas salvas apresenta o código público atual e um botão de edição da referência do GIE. O modal tem um input textual opcional, sem frase explicativa, com conversão para maiúsculas durante a digitação e ao salvar, para `gieReference`, exibido como `código atual | GIE: referência` quando preenchido; vazio remove apenas essa referência. Não substituir ID interno, sequência, código público, URLs ou vínculos. Registros antigos recebem valor vazio na normalização, sem limpeza de armazenamento. O modal salva imediatamente pela persistência existente (`sisegp-data-v2`), atualiza data, evolução automática/log e o rascunho do editor sem remontar a tela, preservando valores e aba pendentes. Falha reverte estado/logs e mantém modal/input abertos. A referência não é integração, alias de ID ou autenticação no GIE. Manter escape, foco e layout responsivo sem sobreposição do título; referência extensa pode ser truncada visualmente com tooltip. Futura API/banco deve prever o campo opcional da iniciativa.

## Documentos padronizados na aba Documentos

No card Anexos da iniciativa, Arquivo do anexo, Descrição do anexo e Adicionar anexo ficam na mesma linha, alinhados pela base dos controles. Até 720px, empilhar para preservar legibilidade. Uma linha separadora horizontal fica entre os controles e a tabela, sem frase explicativa.

As tabelas de anexos exibem Documento, Descrição, Tamanho, Data de Inclusão e Ações. Não exibir coluna Tipo/extensão separada nem a frase Conteúdo indisponível nesta sessão em cada linha; preservar os metadados e o aviso ao tentar visualizar/baixar conteúdo ausente.

As ações Visualizar, Baixar e Excluir dos anexos usam apenas os ícones eye, download e trash do AppUI, em botões compactos alinhados. Preservar title, nome acessível com ação/arquivo, foco e os manipuladores existentes; hidratar ícones nas atualizações da tabela.

Na aba Documentos, exibir na mesma linha do desktop Anexos da iniciativa à esquerda (8 de 12 colunas) e Documentos padronizados à direita (4 de 12 colunas). Até 980px, empilhar os cards nessa ordem. Os termos ficam empilhados dentro do card estreito, na ordem Termo de Abertura do Projeto e Termo de Encerramento de Projeto, com a tipografia de Informações da Iniciativa. Cada termo tem duas linhas explicativas e seu botão Gerar. O card de anexos preserva envio individual e descrição.

Documentos contém Documentos padronizados, com Gerar TAP e Gerar TEP, e Anexos da iniciativa. `assets/js/tap.js` expõe `window.InitiativeTap` e fornece o layout A4 retrato compartilhado; `assets/js/tep.js` expõe `window.InitiativeTep`. Ambos usam o rascunho atual e oferecem Salvar como PDF pela impressão do navegador. Complementos ficam em `initiative.tap` e `initiative.tep`, persistidos somente por Salvar iniciativa com os logs e reversão de falhas existentes. Cancelamento ou popup bloqueado não confirma complementos. Não usar riscos, marcos ou RACI legados como conteúdo real. A geração não equivale a aprovação/assinatura, não anexa PDF automaticamente e não muda status/progresso da iniciativa. Não copiar nomes, datas fixas ou marcações exemplificativas dos modelos. Registros antigos permanecem compatíveis. Consulte [Geração do TAP](docs/tap.md) e [Geração do TEP](docs/tep.md); futura API/banco deve prever esses complementos e a descrição dos anexos.

