#!/usr/bin/env node
// Yarn Berry não valida "engines" sozinho; este script bloqueia o install
// caso a versão do Node (ou do Yarn) não bata com o que o projeto exige.
const { engines } = require('../package.json');

const parse = (v) => v.split('.').map((n) => parseInt(n, 10) || 0);
const gte = (a, b) => {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i];
  }
  return true;
};

const satisfies = (version, range) => {
  const [min, max] = range.split(/\s+/).map((r) => r.replace(/^[<>=]+/, ''));
  const v = parse(version);
  return gte(v, parse(min)) && !gte(v, parse(max));
};

const errors = [];

const nodeVersion = process.versions.node;
if (!satisfies(nodeVersion, engines.node)) {
  errors.push(`Node ${nodeVersion} não atende "${engines.node}" (veja .nvmrc).`);
}

const agent = process.env.npm_config_user_agent || '';
const yarnMatch = agent.match(/yarn\/(\d+\.\d+\.\d+)/);
if (!yarnMatch) {
  errors.push('Use Yarn (via corepack): `corepack enable && yarn install`.');
} else if (!satisfies(yarnMatch[1], engines.yarn)) {
  errors.push(`Yarn ${yarnMatch[1]} não atende "${engines.yarn}".`);
}

if (errors.length) {
  console.error('\n[votocerto] Ambiente incompatível:\n - ' + errors.join('\n - ') + '\n');
  process.exit(1);
}
