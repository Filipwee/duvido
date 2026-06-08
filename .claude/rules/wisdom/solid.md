# SOLID Universal

🪶 LIDO SOB DEMANDA por Lucas, Renata, Otávio.

Os princípios são independentes de linguagem; a sintaxe é exemplo.

## S — Single Responsibility

Uma classe/módulo/função tem **uma razão para mudar**.

> "Uma classe deve fazer uma coisa, mas fazê-la bem." — Robert C. Martin

```
❌ TransactionService faz: validar + persistir + enviar email + gerar relatório
✅ TransactionService persiste;
   TransactionValidator valida;
   NotificationService envia email;
   ReportGenerator gera relatório.
```

A coesão é o teste: se você pode explicar o que a unidade faz em uma frase
**sem usar "e"**, está OK.

## O — Open/Closed

Aberto para extensão, fechado para modificação.

Adicionar comportamento novo NÃO deveria exigir editar código existente. Use
**polimorfismo** (interface/trait/protocol) — o mecanismo varia por linguagem,
o princípio não.

```
❌ if metodoPagamento == "cartao": ...
   elif metodoPagamento == "boleto": ...
   elif metodoPagamento == "pix": ...
   (adicionar Apple Pay = editar isso)

✅ interface MetodoPagamento { processar(...) }
   class Cartao implements MetodoPagamento { ... }
   class Boleto implements MetodoPagamento { ... }
   class Pix implements MetodoPagamento { ... }
   class ApplePay implements MetodoPagamento { ... }  // só adicionar
```

Go usa duck typing (implementação implícita), Rust usa traits, Python usa
protocols ou ABCs, Java/TS usam interfaces. **Mesmo princípio.**

## L — Liskov Substitution

Subtipos devem ser substituíveis pelos seus tipos base sem quebrar invariantes.

```
class Bird { fly() { ... } }
class Penguin extends Bird {
    fly() { throw new Error("pinguim não voa"); }  // ❌ viola LSP
}
```

A hierarquia está errada. Corrigir:

```
class Bird { eat() { ... } }
class FlyingBird extends Bird { fly() { ... } }
class Penguin extends Bird { swim() { ... } }
```

> **Regra prática**: se uma subclasse precisa lançar `UnsupportedOperationException`
> (ou equivalente) para um método herdado, a hierarquia está errada.

## I — Interface Segregation

Clientes não devem depender de métodos que não usam.

```
❌ interface RepositorioCompleto {
       salvar(); buscar(); excluir();
       gerarRelatorio(); exportarCSV(); enviarEmail();
   }

✅ interface Repositorio { salvar(); buscar(); excluir(); }
   interface Relatorio { gerarRelatorio(); exportarCSV(); }
   interface Notificador { enviarEmail(); }
```

Em Go: interfaces curtas, declaradas onde **são usadas** (não onde
implementadas) — isso é ISP elevado a idiom. Em Python: protocolos pequenos
(`Reader`, `Writer`). Em TS: tipos compostos.

## D — Dependency Inversion

Módulos de alto nível não dependem de módulos de baixo nível. Ambos dependem
de **abstrações**.

```
❌ class TransactionService {
       db = new PostgresDB();  // depende de implementação concreta
   }

✅ class TransactionService {
       constructor(repo: TransactionRepository) { this.repo = repo; }
   }
   class PostgresTransactionRepository implements TransactionRepository { ... }
```

DI varia: Spring auto-wire, FastAPI `Depends`, Go injeção manual via
constructor, NestJS providers. **Independente do mecanismo, sempre injete pela
abstração**, nunca instancie a dependência dentro do consumidor.

## Resumo

| Princípio | Pergunta-chave |
|-----------|---------------|
| SRP | Quantas razões essa unidade tem para mudar? |
| OCP | Adicionar comportamento novo exige editar código existente? |
| LSP | Subclasses respeitam o contrato da superclasse? |
| ISP | Clientes dependem de métodos que não usam? |
| DIP | Dependo de abstração ou de implementação concreta? |

SOLID é guia — não dogma. Em código pequeno (script, prototype), 100% SOLID
pode ser over-engineering. Em sistema que vai durar > 6 meses, viola-los
custa caro.
