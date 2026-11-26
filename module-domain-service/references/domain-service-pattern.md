# Domain Service Pattern

## Quando criar

Use um serviço de domínio quando a regra de negócio não pertencer naturalmente a uma entidade ou objeto de valor. Coloque a regra junto à capacidade proprietária ou em uma área compartilhada do mesmo domínio quando houver reúso. Mantenha invariantes no modelo que controla seu estado e orquestração no caso de uso.

## Estrutura esperada

Use uma função ou classe simples nomeada pela regra. Receba apenas os dados necessários e torne explícitos tempo ou configuração variável. Deixe I/O, persistência, efeitos e coordenação entre domínios na aplicação.

## Exemplo

Recorte autocontido do cálculo de preço por ponto. O cálculo recebe a tabela e os sensores e devolve um valor em centavos sem alterar os dados recebidos.

```ts
type SensorPrecificavel = Readonly<{
  tipo: "temperatura" | "porta";
  certificado: boolean;
}>;

type TabelaPrecos = Readonly<{
  temperaturaCertificada: number;
  temperaturaSemCertificado: number;
  porta: number;
}>;

class Precificador {
  calcularPonto(sensores: readonly SensorPrecificavel[], tabela: TabelaPrecos): number {
    return sensores.reduce((total, sensor) => {
      if (sensor.tipo === "porta") return total + tabela.porta;

      const valor = sensor.certificado
        ? tabela.temperaturaCertificada
        : tabela.temperaturaSemCertificado;
      return total + valor;
    }, 0);
  }
}
```

## Estratégia de testes

Teste entradas representativas, limites e valores vazios ou inválidos conforme a regra. Fixe data e configuração variáveis. Ao extrair uma regra, verifique que o caso de uso mantém seu comportamento.
