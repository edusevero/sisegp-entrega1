/**
 * Constante global para definição de parâmetros para execução da app em ambiente de DEV
 */
export const environment = {
  production: false,
  apiUrl: "/api/modelo",
  apm: {
    instanceUrl: "https://ingest-otel-staging.tjrs.jus.br/v1/traces",
    serviceName: "modelo-app",
    otpl: true,
  },
  keycloak: {
    url: "https://sso-infra-external-dev.tjrs.jus.br/auth",
    realm: "infra-tjrs-govbr",
    clientId: "modelo",
    idpHint: "keycloak-infra-tjrs",
  },
  altcha: {
    worker: 4,
  },
};
