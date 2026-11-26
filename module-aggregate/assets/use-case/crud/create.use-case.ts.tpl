import type { CasoDeUso } from "__SHARED_PACKAGE__";
import type { __CLASS__ } from "../model";
import type { Repositorio__CLASS__ } from "../provider";

export type EntradaCriar__CLASS__ = { entidade: __CLASS__ };
export type SaidaCriar__CLASS__ = void;

/** Criar __NAME__ por meio da porta de persistência. */
export class Criar__CLASS__ implements CasoDeUso<EntradaCriar__CLASS__, SaidaCriar__CLASS__> {
  constructor(private readonly repositorio: Repositorio__CLASS__) {}

  executar(entrada: EntradaCriar__CLASS__): Promise<SaidaCriar__CLASS__> {
    return this.repositorio.criar(entrada.entidade);
  }
}
