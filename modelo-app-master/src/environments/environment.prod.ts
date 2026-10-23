/**
 * Constante global para definição de parâmetros para execução da app em ambiente de PRD
 */
export const environment = {
  production: true,
  apiUrl: "https://ditic-intra.tjrs.jus.br/api/modelo",
  apm: {
    instanceUrl: "https://ingest-otel.tjrs.jus.br/v1/traces",
    serviceName: "modelo-app",
    otpl: true,
    // backend em outra origem: recebe o header traceparent para correlacionar os traces
    tracingOrigins: ["https://ditic-intra.tjrs.jus.br"],
  },
  keycloak: {
    url: "https://sso-infra-external.tjrs.jus.br/auth",
    realm: "infra-tjrs-govbr",
    clientId: "modelo",
    idpHint: "keycloak-infra-tjrs",
  },
  altcha: {
    worker: 4,
  },
};
