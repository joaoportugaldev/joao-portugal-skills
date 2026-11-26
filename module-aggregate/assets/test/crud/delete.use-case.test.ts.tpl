import { __CLASS__ } from "../../src/__NAME__/model";
import { Excluir__CLASS__ } from "../../src/__NAME__/usecases";
import { Repositorio__CLASS__EmMemoria } from "./mock/in-memory-__NAME__.repository";

test("Excluir__CLASS__ usa a porta de persistência", async () => {
  const repositorio = new Repositorio__CLASS__EmMemoria();
  const casoDeUso = new Excluir__CLASS__(repositorio);
  const entidade = new __CLASS__({});
  await repositorio.criar(entidade);

  await casoDeUso.executar({ id: entidade.id.valor });
  expect(await repositorio.obterPorId(entidade.id.valor)).toBeNull();
});
