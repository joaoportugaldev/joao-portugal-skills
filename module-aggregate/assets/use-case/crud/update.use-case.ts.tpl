import type { CasoDeUso } from "__SHARED_PACKAGE__";
import type { __CLASS__ } from "../model";
import type { Repositorio__CLASS__ } from "../provider";

export type EntradaAtualizar__CLASS__ = { entidade: __CLASS__ };
export type SaidaAtualizar__CLASS__ = void;

/** Atualizar __NAME__ por meio da porta de persistência. */
export class Atualizar__CLASS__ implements CasoDeUso<EntradaAtualizar__CLASS__, SaidaAtualizar__CLASS__> {
  constructor(private readonly repositorio: Repositorio__CLASS__) {}

  executar(entrada: EntradaAtualizar__CLASS__): Promise<SaidaAtualizar__CLASS__> {
    return this.repositorio.atualizar(entrada.entidade);
  }
}
