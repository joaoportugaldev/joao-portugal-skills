# Controller Pattern

## Paths de referência

- `<backend>/src/modules/<módulo>/controllers/recurso.controller.ts`
- `<backend>/src/modules/<módulo>/controllers/index.ts`
- `<backend>/src/bootstrap/api.ts`
- `<backend>/src/modules/<módulo>/controllers/test/recurso.integration.http`

Adapte esses caminhos à estrutura do projeto consumidor.

## Papel do controller

- Converter a requisição HTTP em uma entrada tipada para a operação.
- Delegar à dependência injetada e converter a saída em uma resposta HTTP.
- Importar contratos públicos e receber dependências já montadas pela composição.
- Manter validações de domínio, permissões de negócio e persistência nas camadas responsáveis.

## Padrões de implementação

Um controller reúne as operações de um recurso em uma classe e declara os caminhos no construtor. Separe controllers quando houver recursos ou capacidades distintas. Ao consolidar, preserve aliases, precedência e a cadeia de middleware de cada rota.

- O construtor centraliza os caminhos e chama um método privado por operação.
- Cada método registra o verbo HTTP e aplica o middleware de autenticação antes do handler protegido.
- O handler extrai os campos aceitos, converte os valores HTTP para os tipos do contrato e encaminha o contexto autenticado. Se o contrato declara `id: string` e `page?: number`, entregue um ID textual e converta o parâmetro de paginação em número quando informado.
- O handler retorna o status e o corpo previstos no contrato. Em caso de falha, encaminha o erro com `next(erro)`.

Formato HTTP inclui a estrutura da requisição e a conversão de valores como paginação. A lista de status válidos de um pedido é uma regra do domínio: encaminhe o filtro `status` ao caso de uso de listagem e deixe o objeto de valor validá-lo antes da consulta.

### Exemplo: casos de uso injetados diretamente

O controller recebe cada caso de uso tipado como `UseCase<XxxIn, XxxOut>`, já construído pela composição. Não há Facade. `requireActor` e `HttpHelper` são os helpers HTTP do projeto: o primeiro converte a sessão em `Actor`; o segundo lança o erro HTTP correspondente ao código de falha do `Result`, que o middleware central formata.

```ts
import type { UseCase } from "@poiesis/shared";
import type {
  CancelarPedidoIn,
  CriarPedidoIn,
  FecharPedidoIn,
  FecharPedidoOut,
  ListarPedidosIn,
  ListarPedidosOut,
  PedidoDTO,
} from "@namespace/vendas/pedido";
import type { Express, RequestHandler } from "express";
import { requireActor } from "../../../shared/http/actor-from-jwt";
import { HttpHelper } from "../../../shared/http/http.helper";

export class PedidoController {
  constructor(
    private readonly servidor: Express,
    private readonly casosDeUso: {
      criar: UseCase<CriarPedidoIn, PedidoDTO>;
      listar: UseCase<ListarPedidosIn, ListarPedidosOut>;
      fechar: UseCase<FecharPedidoIn, FecharPedidoOut>;
      cancelar: UseCase<CancelarPedidoIn, PedidoDTO>;
    },
    private readonly autenticar: RequestHandler,
  ) {
    this.Criar("/pedidos");
    this.Listar("/pedidos");
    this.Fechar("/pedidos/:id/fechamento");
    this.Cancelar("/pedidos/:id/cancelamento");
  }

  private Criar(rota: string): void {
    this.servidor.post(rota, this.autenticar, async (req, res, next) => {
      try {
        const resultado = await this.casosDeUso.criar.execute({
          actor: requireActor(req.jwtDecoded),
          clienteId: String(req.body?.clienteId ?? ""),
          itens: Array.isArray(req.body?.itens) ? req.body.itens : [],
        });
        HttpHelper.throwsIfFailed(resultado);
        res.status(201).json(resultado.instance);
      } catch (erro) {
        next(erro);
      }
    });
  }

  private Listar(rota: string): void {
    this.servidor.get(rota, this.autenticar, async (req, res, next) => {
      try {
        const { status, pagina, tamanhoPagina } = req.query;
        const resultado = await this.casosDeUso.listar.execute({
          actor: requireActor(req.jwtDecoded),
          status: typeof status === "string" ? status : undefined,
          // Os parâmetros da URL seguem o idioma da API; o caso de uso recebe o formato do pacote compartilhado.
          page: pagina === undefined ? undefined : Number(pagina),
          pageSize: tamanhoPagina === undefined ? undefined : Number(tamanhoPagina),
        });
        HttpHelper.throwsIfFailed(resultado);
        res.status(200).json(resultado.instance);
      } catch (erro) {
        next(erro);
      }
    });
  }

  private Fechar(rota: string): void {
    this.servidor.post(rota, this.autenticar, async (req, res, next) => {
      try {
        const resultado = await this.casosDeUso.fechar.execute({
          actor: requireActor(req.jwtDecoded),
          id: String(req.params.id),
          itensSemEstoqueConfirmadosIds: req.body?.itensSemEstoqueConfirmadosIds,
        });
        HttpHelper.throwsIfFailed(resultado);
        // `FecharPedidoOut` é uma união por `status`. Todo desfecho é sucesso: o cliente lê `status`.
        res.status(200).json(resultado.instance);
      } catch (erro) {
        next(erro);
      }
    });
  }

  private Cancelar(rota: string): void {
    this.servidor.post(rota, this.autenticar, async (req, res, next) => {
      try {
        const resultado = await this.casosDeUso.cancelar.execute({
          actor: requireActor(req.jwtDecoded),
          id: String(req.params.id),
          motivo: String(req.body?.motivo ?? ""),
        });
        HttpHelper.throwsIfFailed(resultado);
        res.status(200).json(resultado.instance);
      } catch (erro) {
        next(erro);
      }
    });
  }
}
```

Composição, em `bootstrap/api.ts`: cada caso de uso é construído com suas portas e entregue ao controller.

```ts
const pedidoRepository = new PedidoRepositoryKnex(conexao);

new PedidoController(
  servidor,
  {
    criar: new CriarPedidoUseCase(pedidoRepository),
    listar: new ListarPedidosUseCase(new ListagemPedidosQueryKnex(conexao), auth),
    fechar: new FecharPedidoUseCase(pedidoRepository, estoque, auth),
    cancelar: new CancelarPedidoUseCase(pedidoRepository, auth),
  },
  autenticar,
);
```

Controllers que ainda dependem de uma Facade são legado. Ao refatorar o agregado, troque a Facade pelos casos de uso, como acima.

## Checklist de implementação

- Verbo, caminho, autenticação, payload e status correspondem ao contrato do consumidor.
- Cada campo HTTP é convertido para o tipo declarado na entrada da operação. O submódulo proprietário aplica as regras de negócio.
- O método privado usa a operação injetada e encaminha erros ao middleware central.
- O barrel e a composição registram o controller uma vez.
- O typecheck ou build do backend e os testes relevantes cobrem a alteração. Requisições `.integration.http` são manuais. Reporte a execução apenas se foram enviadas a um servidor.

## Armadilhas comuns

- Verificar tipo de usuário ou permissão no controller, ou repassar o usuário inteiro da sessão. Entregue o `Actor` e deixe a autorização no caso de uso.
- Renomear um caminho público para acompanhar o nome da classe. Atualize consumidores apenas quando a mudança de rota fizer parte do contrato.
- Propagar todo o body ou tratar conversões por cast como validação. Selecione os campos aceitos e valide o formato de transporte.
- Trocar `next(erro)` por uma resposta genérica no handler. Preserve o mapeamento central de falhas.
