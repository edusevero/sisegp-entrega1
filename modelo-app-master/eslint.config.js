const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const tjrs = require("@ditic/modelo-ui-lib/eslint");

module.exports = defineConfig([
  ...tjrs.configs.recommended,
  globalIgnores(["projects/**/*"]), {
    files: ["**/*.ts"],

    rules: {
        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: "app",
            style: "camelCase",
        }],

        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: "app",
            style: "kebab-case",
        }],
    },
}, {
    files: ["**/*.html"],
    rules: {},
}]);