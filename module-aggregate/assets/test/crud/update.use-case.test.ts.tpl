import { __CLASS__ } from "../../src/__NAME__/model";
import { Atualizar__CLASS__ } from "../../src/__NAME__/usecases";
import { Repositorio__CLASS__EmMemoria } from "./mock/in-memory-__NAME__.repository";

test("Atualizar__CLASS__ usa a porta de persistência", async () => {
  const repositorio = new Repositorio__CLASS__EmMemoria();
  const casoDeUso = new Atualizar__CLASS__(repositorio);
  const entidade = new __CLASS__({});
  await repositorio.criar(entidade);

  const atualizada = new __CLASS__({ id: entidade.id.valor });
  await casoDeUso.executar({ entidade: atualizada });
  expect(await repositorio.obterPorId(entidade.id.valor)).toBe(atualizada);
});
