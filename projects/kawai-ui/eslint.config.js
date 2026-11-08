// @ts-check
const { defineConfig } = require('eslint/config');
const rootConfig = require('../../eslint.config.js');

// kawai-ui uses the workspace config as is. Add project-only overrides here.
module.exports = defineConfig([...rootConfig]);
