# Repository Pattern

## Estrutura esperada

Declare a porta de persistência no domínio proprietário. Modele as operações conforme os consumidores e explicite ausência, ordenação, paginação e erros quando aplicáveis. No adaptador, converta registros para a representação do contrato e traduza falhas conhecidas. Injete o adaptador na composição.

## Exemplo

Recorte autocontido do contrato de certificados de calibração e de uma implementação em memória. O retorno expressa a ausência com `null` e a exclusão com booleano. Ajuste o double às garantias da porta real.

```ts
type Certificado = Readonly<{ id: string; identificadorFisico: string }>;

interface RepositorioCertificadoCalibracao {
  salvar(certificado: Certificado): Promise<Certificado>;
  obterPorId(id: string): Promise<Certificado | null>;
  excluirPorId(id: string): Promise<boolean>;
}

class CertificadosEmMemoria implements RepositorioCertificadoCalibracao {
  private readonly registros = new Map<string, Certificado>();

  async salvar(certificado: Certificado): Promise<Certificado> {
    const duplicado = [...this.registros.values()].some(registro =>
      registro.id !== certificado.id
      && registro.identificadorFisico === certificado.identificadorFisico,
    );
    if (duplicado) throw new Error("CERTIFICADO_DUPLICADO");

    this.registros.set(certificado.id, { ...certificado });
    return { ...certificado };
  }

  async obterPorId(id: string): Promise<Certificado | null> {
    const registro = this.registros.get(id);
    return registro ? { ...registro } : null;
  }

  async excluirPorId(id: string): Promise<boolean> {
    return this.registros.delete(id);
  }
}
```

## Checklist e testes

- Propague o executor transacional a todas as escritas que precisam concluir juntas.
- Garanta unicidade no armazenamento quando fizer parte do contrato e traduza a violação correspondente. Uma consulta prévia pode sofrer corrida.
- Preserve a leitura de dados existentes em mudanças de esquema.
- Verifique sucesso, ausência e falhas esperadas. Use integração com o armazenamento real para mapeamento, restrições, concorrência e rollback quando afetados.
