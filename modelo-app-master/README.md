# Projeto Modelo

Aplicação front-end Angular modelo Arquitetura DITIC 4.1

### Tecnologias Utilizadas

- [Angular 21](https://angular.dev) ([@angular/cli](https://angular.dev/tools/cli)), zoneless (sem Zone.js)
- [@angular/material 21](https://material.angular.dev/guide/getting-started)
- [@ditic/modelo-ui-lib 1.11](https://gitlab.tjrs.jus.br/ditic/assesgov/arqsis/modelo4/modelo-ui/-/wikis/home)
- [Vitest](https://angular.dev/guide/testing) para testes unitários (builder `@angular/build:unit-test`)

A versão do projeto acompanha a versão do `@angular/cli` instalado.

### Pré-requisitos

- Node.js `^20.19 || ^22.12 || >=24`.
- Registry da biblioteca: `npm config set @ditic:registry=https://gitlab.tjrs.jus.br/api/v4/projects/1169/packages/npm/`

### Dependências

Todas as dependências de DEV e PROD então em `./package.json`

## Desenvolvimento

### Configuração do Ambiente de Desenvolvimento

<https://gitlab.tjrs.jus.br/ditic/assesgov/arqsis/dtic/-/wikis/Ambiente>

### Clonando o projeto

```shell
git clone https://gitlab.tjrs.jus.br/dsis/apoio/arqsis/modelo4/modelo-app.git
cd modelo-app/
```

### Instalando dependências

```shell
npm install
```

### Comandos

| Objetivo | Comando |
| --- | --- |
| Build de produção | `npm run build_prd` |
| Lint | `npx ng lint` |
| Testes (Vitest) | `npx ng test --watch=false` |
| Atualizar Angular e biblioteca | `npm run update` |

### Rodando a aplicação

```shell
# Apontando para o back-end publicado no KUBERNETES(k8s) de Desenvolvimento
npm run start
```

```shell
# Apontando para o back-end publicado no LOCALHOST
npm run start_local
```

### Customização de Estilos (CSS)

Se for necessário uma alteração para toda a aplicação, utilize o `src/styles.scss`.

O arquivo `styles.scss` importado da lib [Modelo UI](https://gitlab.tjrs.jus.br/ditic/assesgov/arqsis/modelo4/modelo-ui/-/wikis/home) aplicará a identidade visual da aplicação no padrão DITIC 4.1.

## Infraestrutura

Descrição da infraestrutura da aplicação.

### Banco de Dados

<https://gitlab.tjrs.jus.br/dsis/apoio/arqsis/modelo/modelo-db>

### Web Services

<https://gitlab.tjrs.jus.br/dsis/apoio/arqsis/modelo/modelo-service>

### Integração Contínua

Este projeto utiliza CI/CD para realizar os builds, testes e deploys nos ambientes de desenvolvimento, homologação e produção seguindo o processo [Git-Flow](https://gitlab.tjrs.jus.br/ditic/assesgov/arqsis/automation/gitlab/-/wikis/Git-Flow) de forma autommatizada, conforme documentação de [CI/CD](https://gitlab.tjrs.jus.br/ditic/assesgov/arqsis/automation/gitlab/-/wikis/CI-CD).

### Ambientes (front-end)

Atualmente implantado no servidor [Kubernetes](https://gitlab.tjrs.jus.br/ditic/adm/arqsis/automation/k8s/-/wikis/home).

- Desenvolvimento - <https://ditic-intra-dev.tjrs.jus.br/modelo/>
- Homologação - <https://ditic-intra-staging.tjrs.jus.br/modelo/>
- Produção - <https://ditic-intra.tjrs.jus.br/modelo/>

## Logs / Monitoramento

### Opensearch

#### Traces

- Desenvolvimento e Homologação: <https://opensearch-dashboard-staging.tjrs.jus.br/app/observability-traces#/services?serviceId=modelo-app&mode=data_prepper>
- Produção - <https://opensearch-dashboard.tjrs.jus.br/app/observability-traces#/services?serviceId=modelo-app&mode=data_prepper>

#### Logs

TO DO!

### SonarQube

**Project:** modelo-app

<http://sonar-01.tjrs.gov.br:9000/dashboard?id=modelo-app>
