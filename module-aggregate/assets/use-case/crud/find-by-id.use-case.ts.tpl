import type { CasoDeUso } from "__SHARED_PACKAGE__";
import type { __CLASS__ } from "../model";
import type { Repositorio__CLASS__ } from "../provider";

export type EntradaObter__CLASS__PorId = { id: string };
export type SaidaObter__CLASS__PorId = __CLASS__ | null;

/** Obter __NAME__ por meio da porta de persistência. */
export class Obter__CLASS__PorId implements CasoDeUso<EntradaObter__CLASS__PorId, SaidaObter__CLASS__PorId> {
  constructor(private readonly repositorio: Repositorio__CLASS__) {}

  executar(entrada: EntradaObter__CLASS__PorId): Promise<SaidaObter__CLASS__PorId> {
    return this.repositorio.obterPorId(entrada.id);
  }
}
