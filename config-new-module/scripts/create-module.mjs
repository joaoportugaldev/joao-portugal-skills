import { existsSync, globSync, mkdirSync, renameSync, rmSync, mkdtempSync } from 'node:fs';
import { config, checkPath, json, name, namespace, readJson, roots, run, workspacePatterns, write } from '../../config-utils/workspace.mjs';

run(['name', 'scope', 'modules-dir'], (options) => {
  const settings = config();
  const moduleName = name(options.name);
  const manifest = readJson('package.json');
  if (manifest.packageManager && !manifest.packageManager.startsWith('npm@')) {
    throw new Error('Use o fluxo manual com o gerenciador declarado no projeto.');
  }

  const patterns = workspacePatterns(manifest);
  const [, configuredRoot] = roots(settings);
  const root = name(options['modules-dir'] ?? settings.modulesDir ??
    (patterns.includes('modules/*') ? configuredRoot : 'packages'));
  const target = `${root}/${moduleName}`;
  checkPath(target);
  if (!patterns.includes(`${root}/*`) && !patterns.includes(target)) {
    throw new Error(`Workspace sem cobertura para ${target}.`);
  }
  if (existsSync(target)) throw new Error(`Destino já existe: ${target}`);

  const packageName = namespace(options, settings) + moduleName;
  const manifests = patterns.map((pattern) => `${pattern}/package.json`);
  for (const path of globSync(manifests, { exclude: ['**/node_modules/**', '**/.git/**'] })) {
    if (readJson(path).name === packageName) throw new Error(`Nome já registrado em ${path}.`);
  }

  const files = {
    'package.json': json({
      name: packageName,
      version: '0.0.0',
      private: true,
      type: 'module',
      exports: './src/index.js',
      scripts: { test: 'node --test' },
    }),
    'src/index.js': 'export {};\n',
    'test/index.test.js': `import test from 'node:test';\n\ntest('carrega o ponto de entrada público', async () => {\n  await import('${packageName}');\n});\n`,
  };

  if (!options.apply) {
    for (const path of Object.keys(files)) console.log(`[FILE_CREATE] ${target}/${path}`);
    return;
  }
  mkdirSync(root, { recursive: true });
  const staging = mkdtempSync(`${root}/.scaffold-`);
  try {
    for (const [path, content] of Object.entries(files)) write(`${staging}/${path}`, content, true);
    if (existsSync(target)) throw new Error(`Destino já existe: ${target}`);
    renameSync(staging, target);
    console.log(`[DIR_CREATE] ${target}`);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
});
