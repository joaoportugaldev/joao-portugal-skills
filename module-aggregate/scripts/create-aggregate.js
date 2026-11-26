#!/usr/bin/env node

const fs = require('node:fs')
const path = require('node:path')
const { parseArgs } = require('node:util')

const usage = 'node <SKILLS_DIR>/module-aggregate/scripts/create-aggregate.js --module <pacote> --aggregate <agregado> --mode <crud|example>'
const operations = [
  { key: 'create', method: 'criar', input: 'entidade: __CLASS__', output: 'void', body: 'this.registros.set(entidade.id.valor, entidade);', filename: name => `criar-${name}` },
  { key: 'update', method: 'atualizar', input: 'entidade: __CLASS__', output: 'void', body: 'this.registros.set(entidade.id.valor, entidade);', filename: name => `atualizar-${name}` },
  { key: 'delete', method: 'excluir', input: 'id: string', output: 'void', body: 'this.registros.delete(id);', filename: name => `excluir-${name}` },
  { key: 'find-by-id', method: 'obterPorId', input: 'id: string', output: '__CLASS__ | null', body: 'return this.registros.get(id) ?? null;', filename: name => `obter-${name}-por-id` },
]

async function main() {
  const { values } = parseArgs({
    options: {
      module: { type: 'string' },
      aggregate: { type: 'string' },
      mode: { type: 'string' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    console.log(usage)
    return
  }

  const { module: moduleName, aggregate, mode } = values
  if (!moduleName || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(moduleName)) {
    throw new Error('Informe --module com o nome de um pacote existente.')
  }
  if (!['crud', 'example'].includes(mode)) throw new Error('Informe --mode crud ou example.')

  const name = (aggregate ?? '').normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
  if (!/^[a-z]/.test(name)) throw new Error('Informe --aggregate com um nome iniciado por letra.')

  const { config, name: validateDirectoryName } = await import('../../config-utils/workspace.mjs')
  const modulesDir = validateDirectoryName(config().modulesDir ?? 'modules')
  const moduleDir = path.resolve(modulesDir, moduleName)
  const moduleIndex = path.join(moduleDir, 'src', 'index.ts')
  const moduleContent = fs.readFileSync(moduleIndex, 'utf8')
  const aggregateDir = path.join(moduleDir, 'src', name)
  const testDir = path.join(moduleDir, 'test', name)
  const exportLine = `export * from "./${name}";`
  const staleExport = new RegExp(`from\\s*['"]\\./${name}(?:/index)?['"]`)
  if (fs.existsSync(aggregateDir) || fs.existsSync(testDir) || staleExport.test(moduleContent)) {
    throw new Error(`Já existe estrutura ou export para ${name} em ${moduleName}.`)
  }

  const manifest = JSON.parse(fs.readFileSync('packages/shared/package.json', 'utf8'))
  if (!/^(?:@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(manifest.name ?? '')) {
    throw new Error('Nome inválido em packages/shared/package.json.')
  }

  const selected = mode === 'crud' ? operations : [operations[0]]
  const mockOperations = mode === 'crud' ? operations : [operations[0], operations[3]]
  const signature = op => `${op.method}(${op.input}): Promise<${op.output}>`
  const replacements = {
    __NAME__: name,
    __CLASS__: name.split('-').map(part => part[0].toUpperCase() + part.slice(1)).join(''),
    __SHARED_PACKAGE__: manifest.name,
  }
  const sections = {
    __METHODS__: selected.map(op => `  ${signature(op)};`).join('\n'),
    __MOCK_METHODS__: mockOperations.map(op => `  async ${signature(op)} {\n    ${op.body}\n  }`).join('\n\n'),
    __EXPORTS__: selected.map(op => `export * from "./${op.filename(name)}.usecase";`).join('\n'),
  }

  const files = []
  const add = (template, output) => {
    let content = fs.readFileSync(path.join(__dirname, '..', 'assets', template + '.tpl'), 'utf8')
    for (const [token, value] of Object.entries({ ...sections, ...replacements })) {
      content = content.replaceAll(token, () => value)
    }
    if (/__[A-Z_]+__/.test(content)) throw new Error(`Template incompleto: ${template}`)
    files.push({ output, content })
  }

  for (const [template, output] of [
    ['aggregate/index.ts', 'index.ts'],
    ['dto/aggregate.dto.ts', `dto/${name}.dto.ts`],
    ['dto/index.ts', 'dto/index.ts'],
    ['model/entity.ts', `model/${name}.entity.ts`],
    ['model/index.ts', 'model/index.ts'],
    ['provider/repository.ts', `provider/${name}.repository.ts`],
    ['provider/index.ts', 'provider/index.ts'],
    ['use-case/index.ts', 'usecases/index.ts'],
  ]) {
    add(`common/${template}`, path.join(aggregateDir, output))
  }
  add('common/test/mock/in-memory-repository.ts', path.join(testDir, 'mock', `in-memory-${name}.repository.ts`))
  for (const op of selected) {
    const filename = op.filename(name)
    add(`use-case/${mode}/${op.key}.use-case.ts`, path.join(aggregateDir, 'usecases', `${filename}.usecase.ts`))
    add(`test/${mode}/${op.key}.use-case.test.ts`, path.join(testDir, `${filename}.usecase.test.ts`))
  }

  const created = []
  try {
    fs.mkdirSync(aggregateDir)
    created.push(aggregateDir)
    fs.mkdirSync(path.dirname(testDir), { recursive: true })
    fs.mkdirSync(testDir)
    created.push(testDir)
    for (const { output, content } of files) {
      fs.mkdirSync(path.dirname(output), { recursive: true })
      fs.writeFileSync(output, content, { flag: 'wx' })
    }
    if (fs.readFileSync(moduleIndex, 'utf8') !== moduleContent) {
      throw new Error('O index.ts mudou durante a geração. Revise o arquivo e tente novamente.')
    }
    const separator = moduleContent && !moduleContent.endsWith('\n') ? '\n' : ''
    fs.appendFileSync(moduleIndex, `${separator}${exportLine}\n`)
  } catch (error) {
    for (const dir of created.reverse()) fs.rmSync(dir, { recursive: true, force: true })
    throw error
  }
  console.log(`[module-aggregate] Estrutura criada em ${modulesDir}/${moduleName} para ${name} (${mode}).`)
}

main().catch(error => {
  console.error(`[module-aggregate] ${error.message}`)
  process.exitCode = 1
})
