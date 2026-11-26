import type { CasoDeUso } from "__SHARED_PACKAGE__";
import type { Repositorio__CLASS__ } from "../provider";

export type EntradaExcluir__CLASS__ = { id: string };
export type SaidaExcluir__CLASS__ = void;

/** Excluir __NAME__ por meio da porta de persistência. */
export class Excluir__CLASS__ implements CasoDeUso<EntradaExcluir__CLASS__, SaidaExcluir__CLASS__> {
  constructor(private readonly repositorio: Repositorio__CLASS__) {}

  executar(entrada: EntradaExcluir__CLASS__): Promise<SaidaExcluir__CLASS__> {
    return this.repositorio.excluir(entrada.id);
  }
}
