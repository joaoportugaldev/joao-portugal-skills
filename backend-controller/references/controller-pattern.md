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

Use o [ClienteController](../../../../apps/backend/src/modules/comercial/cliente/controllers/cliente.controller.ts) como referência de granularidade. Ele reúne consultas e alterações do Cliente em uma classe e declara os caminhos no construtor. Separe controllers quando houver recursos ou capacidades distintas. Ao consolidar, preserve aliases, precedência e a cadeia de middleware de cada rota.

- O construtor centraliza os caminhos e chama um método privado por operação.
- Cada método registra o verbo HTTP e aplica o middleware de autenticação antes do handler protegido.
- O handler extrai os campos aceitos, normaliza filtros e paginação quando aplicáveis e encaminha o contexto autenticado conforme o contrato da operação.
- O handler retorna o status e o corpo previstos no contrato. Em caso de falha, encaminha o erro com `next(erro)`.

Formato HTTP inclui a estrutura da requisição e a conversão de valores como paginação. A lista de estados válidos de um teste premium é uma regra do Comercial. Encaminhe o filtro `status` ao caso de uso de listagem e deixe o `StatusTestePremiumVO` validá-lo antes da consulta.

### Injeção direta de casos de uso

Tipifique cada dependência com o contrato compartilhado. O handler chama `execute`, converte a instância do `Result` em resposta HTTP e encaminha a falha mapeada com `next(erro)`.

```ts
import type { UseCase } from "@sagil/shared";
import type { CriarTestePremiumIn, TestePremiumDTO } from "@sagil/comercial";

type CriarTestePremium = UseCase<CriarTestePremiumIn, TestePremiumDTO>;
```

### Exemplo com facade

O middleware injetado autentica a requisição e preenche `req.jwtDecoded` antes de chamar o handler. O controller converte a sessão em `Actor` com `requireActor` e o entrega à operação; ele não decide quem pode executá-la.

```ts
import type { Actor } from "@sagil/shared";
import type { Express, RequestHandler } from "express";
import { requireActor } from "../../../shared/http/actor-from-jwt";

type EntradaCriarRecurso = { nome: string };
type RecursoDTO = { id: string; nome: string };

interface RecursoFacade {
    criarRecurso(entrada: EntradaCriarRecurso, actor: Actor): Promise<RecursoDTO>;
    obterRecursoPorId(entrada: { id: string }, actor: Actor): Promise<RecursoDTO>;
}

export default class RecursoController {
    constructor(
        private readonly servidor: Express,
        private readonly facade: RecursoFacade,
        private readonly autenticar: RequestHandler,
    ) {
        this.CriarRecurso("/recursos");
        this.ObterRecursoPorId("/recursos/:id");
    }

    private CriarRecurso(rota: string): void {
        this.servidor.post(
            rota,
            this.autenticar,
            async (req, res, next) => {
                try {
                    const entrada: EntradaCriarRecurso = {
                        nome: req.body.nome,
                    };
                    const recurso = await this.facade.criarRecurso(
                        entrada,
                        requireActor(req.jwtDecoded),
                    );

                    res.status(201).json(recurso);
                } catch (erro) {
                    next(erro);
                }
            },
        );
    }

    private ObterRecursoPorId(rota: string): void {
        this.servidor.get(
            rota,
            this.autenticar,
            async (req, res, next) => {
                try {
                    const recurso = await this.facade.obterRecursoPorId(
                        { id: String(req.params.id) },
                        requireActor(req.jwtDecoded),
                    );

                    res.status(200).json(recurso);
                } catch (erro) {
                    next(erro);
                }
            },
        );
    }
}
```

## Checklist de implementação

- Verbo, caminho, autenticação, payload e status correspondem ao contrato do consumidor.
- O método privado usa a operação injetada e encaminha erros ao middleware central.
- O barrel e a composição registram o controller uma vez.
- O typecheck ou build do backend e os testes relevantes cobrem a alteração. Requisições `.integration.http` são manuais. Reporte a execução apenas se foram enviadas a um servidor.

## Armadilhas comuns

- Verificar tipo de usuário ou permissão no controller, ou repassar o usuário inteiro da sessão. Entregue o `Actor` e deixe a autorização no caso de uso.
- Renomear um caminho público para acompanhar o nome da classe. Atualize consumidores apenas quando a mudança de rota fizer parte do contrato.
- Propagar todo o body ou tratar conversões por cast como validação. Selecione os campos aceitos e valide o formato de transporte.
- Trocar `next(erro)` por uma resposta genérica no handler. Preserve o mapeamento central de falhas.
