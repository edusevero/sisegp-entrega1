/**
 * Constante global para definição de parâmetros para execução da app em ambiente de HML
 */
export const environment = {
  production: false,
  apiUrl: "https://ditic-intra-staging.tjrs.jus.br/api/modelo",
  apm: {
    instanceUrl: "https://ingest-otel-staging.tjrs.jus.br/v1/traces",
    serviceName: "modelo-app",
    otpl: true,
    // backend em outra origem: recebe o header traceparent para correlacionar os traces
    tracingOrigins: ["https://ditic-intra-staging.tjrs.jus.br"],
  },
  keycloak: {
    url: "https://sso-infra-external-staging.tjrs.jus.br/auth",
    realm: "infra-tjrs-govbr",
    clientId: "modelo",
    idpHint: "keycloak-infra-tjrs",
  },
  altcha: {
    worker: 4,
  },
};
