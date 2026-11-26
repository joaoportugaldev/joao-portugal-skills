import { __CLASS__ } from "../../src/__NAME__/model";
import { Obter__CLASS__PorId } from "../../src/__NAME__/usecases";
import { Repositorio__CLASS__EmMemoria } from "./mock/in-memory-__NAME__.repository";

test("Obter__CLASS__PorId usa a porta de persistência", async () => {
  const repositorio = new Repositorio__CLASS__EmMemoria();
  const casoDeUso = new Obter__CLASS__PorId(repositorio);
  const entidade = new __CLASS__({});
  await repositorio.criar(entidade);

  expect(await casoDeUso.executar({ id: entidade.id.valor })).toBe(entidade);
  expect(await casoDeUso.executar({ id: "ausente" })).toBeNull();
});
