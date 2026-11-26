import { __CLASS__ } from "../../src/__NAME__/model";
import { Criar__CLASS__ } from "../../src/__NAME__/usecases";
import { Repositorio__CLASS__EmMemoria } from "./mock/in-memory-__NAME__.repository";

test("Criar__CLASS__ usa a porta de persistência", async () => {
  const repositorio = new Repositorio__CLASS__EmMemoria();
  const casoDeUso = new Criar__CLASS__(repositorio);
  const entidade = new __CLASS__({});

  await casoDeUso.executar({ entidade });
  expect(await repositorio.obterPorId(entidade.id.valor)).toBe(entidade);
});
