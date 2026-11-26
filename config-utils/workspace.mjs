import { existsSync, readFileSync, lstatSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export const json = (value) => JSON.stringify(value, null, 2) + '\n';

export function readJson(path, fallback) {
  if (!existsSync(path) && fallback !== undefined) return fallback;
  const value = JSON.parse(readFileSync(path, 'utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Objeto JSON esperado em ${path}`);
  }
  return value;
}

export function run(allowed, execute) {
  try {
    const args = process.argv.slice(2);
    if (args.includes('--help')) {
      console.log(['--apply', ...allowed.map((key) => `--${key} <valor>`)].join(' '));
      return;
    }
    const options = {};
    while (args.length) {
      const flag = args.shift();
      if (flag === '--apply') {
        options.apply = true;
        continue;
      }
      const key = flag.slice(2);
      if (!flag.startsWith('--') || !allowed.includes(key) || !args[0] || args[0].startsWith('--')) {
        throw new Error(`Opção inválida ou sem valor: ${flag}`);
      }
      options[key] = args.shift();
    }
    execute(options);
  } catch (error) {
    console.error(`[FAIL] ${error.message}`);
    process.exitCode = 1;
  }
}

export function name(value) {
  if (typeof value !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`Nome inválido: ${value}`);
  }
  return value;
}

export function namespace(options, config) {
  const scope = options.scope ?? config.namespace;
  if (scope === undefined) return '';
  if (typeof scope !== 'string' || !scope.startsWith('@')) {
    throw new Error('Namespace deve usar o formato @organização.');
  }
  name(scope.slice(1));
  return scope + '/';
}

export function roots(config) {
  const result = [config.appsDir ?? 'apps', config.modulesDir ?? 'modules', config.packagesDir ?? 'packages'];
  result.forEach(name);
  if (result.slice(1).includes(result[0])) {
    throw new Error('A raiz de aplicações precisa ser distinta das raízes de pacotes.');
  }
  return result;
}

function readSettings(path) {
  const settings = readJson(path, {});
  if (settings.version === undefined && settings.defaults === undefined) return settings;
  if (settings.version !== 1 || !settings.defaults ||
      typeof settings.defaults !== 'object' || Array.isArray(settings.defaults)) {
    throw new Error(`Configuração inválida em ${path}: esperado version 1 e um objeto defaults.`);
  }
  return settings.defaults;
}

export function config() {
  return {
    ...readSettings('.agents/skills/.env/skills.config.json'),
    ...readSettings('skills.config.json'),
    ...readSettings('skills.config.local.json'),
  };
}

export function workspacePatterns(manifest) {
  const patterns = manifest.workspaces ?? [];
  if (!Array.isArray(patterns) || patterns.some((pattern) => typeof pattern !== 'string')) {
    throw new Error('O script exige workspaces npm em formato de lista.');
  }
  return patterns;
}

export function checkPath(path) {
  let current = '';
  for (const part of path.split('/')) {
    current = join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) {
      throw new Error(`Caminho contém link simbólico: ${current}`);
    }
  }
}

export function write(path, content, apply, update = false) {
  checkPath(path);
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return;
  if (existsSync(path) && !update) throw new Error(`Arquivo já existe: ${path}`);
  console.log(`[${existsSync(path) ? 'FILE_UPDATE' : 'FILE_CREATE'}] ${path}`);
  if (!apply) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, { flag: update ? 'w' : 'wx' });
}
