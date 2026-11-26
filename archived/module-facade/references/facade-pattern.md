# Facade Pattern

## Estrutura esperada

- Coloque a facade junto à entrada pública do módulo. Em projetos que organizam facades como adaptadores, um caminho possível é `src/adapters/facade/`.
- Nomeie cada método pela operação que expõe. Preserve o vocabulário do domínio e as assinaturas existentes.
- Reutilize DTOs e contexto do caso de uso. Adapte resultados apenas quando a interface pública da facade exigir.
- Se a composição local montar casos de uso na facade, injete as portas por interface e forneça a cada operação apenas suas dependências. Se houver dependências opcionais por compatibilidade, use o erro estabelecido quando a operação precisar de uma porta ausente.

## Exemplo

A facade recebe a interface do repositório no construtor. Cada chamada a `criarRecurso` instancia o caso de uso e encaminha a entrada e o usuário à operação pública `executar`.

```ts
type EntradaCriarRecurso = { nome: string };
type RecursoDTO = { id: string; nome: string };
type UsuarioAutenticado = { id: string };

interface RecursoRepositorio {
  salvar(dados: { nome: string; criadoPorId: string }): Promise<RecursoDTO>;
}

class CriarRecurso {
  constructor(private readonly repositorio: RecursoRepositorio) {}

  executar(entrada: EntradaCriarRecurso, usuario: UsuarioAutenticado): Promise<RecursoDTO> {
    return this.repositorio.salvar({
      nome: entrada.nome,
      criadoPorId: usuario.id,
    });
  }
}

export class RecursoFacade {
  constructor(private readonly repositorio: RecursoRepositorio) {}

  criarRecurso(entrada: EntradaCriarRecurso, usuario: UsuarioAutenticado): Promise<RecursoDTO> {
    const casoDeUso = new CriarRecurso(this.repositorio);
    return casoDeUso.executar(entrada, usuario);
  }
}
```

## Exports e composição

- Exponha a facade e os tipos usados pelo consumidor no ponto de entrada do módulo. Preserve a convenção local de exports.
- Monte adaptadores concretos na raiz de composição. Entregue a facade pronta a controllers e demais consumidores por injeção.
- Em renomeações, revise imports, barrels e composição. Preserve rotas e formatos HTTP quando o contrato de transporte não estiver no escopo.

## Estratégia de testes

- Exercite a interface pública da facade e verifique entrada, contexto, resultado e falhas. Ao verificar a composição, use casos de uso reais com portas simuladas ou em memória.
- Quando houver autorização por papel, cubra os acessos permitidos e rejeitados pela entrada pública. Verifique que a rejeição impede efeitos.
- Cubra dependências opcionais ausentes quando fizerem parte do contrato. Siga o runner e o espelhamento de testes do projeto.

## Armadilhas comuns

- Chamar um método interno do caso de uso e contornar sua autorização. Use a operação pública.
- Duplicar regras de negócio ou mapeamento de transporte na facade. Mantenha a responsabilidade com o caso de uso, o domínio ou o adaptador HTTP conforme a regra.
- Instanciar infraestrutura concreta na facade. Injete as dependências montadas pela aplicação.
