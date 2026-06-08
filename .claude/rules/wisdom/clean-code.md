# Clean Code Universal

🪶 LIDO SOB DEMANDA por Lucas, Renata, Otávio.

Princípios de Robert C. Martin, adaptados para qualquer linguagem.

## Nomes

- **Revele a intenção**: `daysSinceCreation` > `d`
- **Use o domínio**: `transaction` no código se o usuário fala "transação"
- **Evite ruído**: `theTransactionData`, `data1` — informação sem valor
- **Pronunciável e pesquisável**: `txDt` é ilegível; `transactionDate` é grepável
- **Substantivo para coisas, verbo para ações**: `Transaction` (classe), `saveTransaction()` (método)
- **Booleans afirmativos**: `isActive` > `isNotInactive`

Convenções por linguagem vivem em `stacks/<active>/language-rules.md`. O que
não muda: **o nome carrega significado**, em qualquer linguagem.

## Funções

- **Pequenas**: até N linhas (N depende da linguagem — ver stack ativo)
- **Faça uma coisa**: se você usa "e" para descrever, deve dividir
- **Um nível de abstração**: não misture validação de baixo nível com orquestração
- **Poucos parâmetros**: idealmente 0–3. 4+ é sinal de objeto faltando
- **Sem side effects ocultos**: função chamada `getX()` não pode mutar estado
- **Sem boolean trap**: `setActive(true, false, false)` — quem lê não entende

```
❌ processar(true, false, true, 5, "ABC")     // o que tudo isso significa?
✅ processar(ProcessarRequest { ativar: true, notificar: false, ... })
```

## Comentários

> "Comentários são uma falha de comunicação." — extremo, mas ensina algo.

```
❌ // incrementa i
   i = i + 1

❌ // verifica se usuário tem permissão
   if (user.role == 'admin' || user.role == 'editor') { ... }

✅ if (user.canEdit(resource)) { ... }   // método nomeado em vez de comentário
```

Comentários úteis:
- **Por que** (não o que): "// Worker offset porque clock skew entre nós"
- **TODO com contexto**: `// TODO(lucas, 2026-06-15): trocar por X após migração Y`
- **Aviso legal/regulatório**: "// Reportar a SEFAZ até 5min — SLA contratual"
- **Justificar suprimir lint**: `// noqa: B008 — escopo restrito, dependencies pattern`

## Formatação

- **Vertical**: dentro de um arquivo, código relacionado fica junto
- **Horizontal**: linhas curtas (≤ 100-120 cols, depende do stack)
- **Indentação**: tool do stack decide (gofmt, prettier, black, etc.) — não discuta
- **Espaçamento**: separe blocos lógicos com linha em branco

## Objetos e estruturas de dados

| Objeto | Estrutura de dados |
|--------|-------------------|
| Esconde dados, expõe comportamento | Expõe dados, sem comportamento |
| Difícil adicionar funcionalidade | Difícil adicionar tipo novo |

```
// Objeto (encapsulado)
class Transaction {
    private _amount: Decimal;
    canBeRefunded(): boolean { ... }
}

// Estrutura de dados (POJO/POPO/struct/record)
record TransactionRecord { id: string; amount: number; }
```

Os dois são válidos — em contextos diferentes. DTOs nas bordas são estruturas
de dados; domínio rico no centro é objeto.

## Tell, Don't Ask

```
❌ if (account.getBalance() >= amount) {
       account.setBalance(account.getBalance() - amount);
   }

✅ account.withdraw(amount)
   // (internamente lança InsufficientFundsException se não pode)
```

Não pergunte ao objeto sobre seu estado interno para decidir o que fazer —
mande ele fazer.

## Law of Demeter (princípio do mínimo conhecimento)

```
❌ user.getAccount().getBalance().getValue()    // train wreck

✅ user.getAccountBalance()                      // delegação
   user.getBalance()                             // ainda melhor
```

Cada unidade fala só com vizinhos imediatos, não com vizinhos de vizinhos.

## DRY — Don't Repeat Yourself

Cuidado: **repetir 2× é melhor que abstrair errado.**

| Sintoma | Resposta |
|---------|----------|
| Mesmo código em 2 lugares | Aguardar — pode ser coincidência |
| Mesmo código em 3+ lugares com mesmo motivo | Extrair |
| Mesmo código com motivo diferente | NÃO unificar — vai gerar acoplamento ruim |

## Boy Scout Rule

> "Deixe o acampamento mais limpo do que encontrou."

Toca em um arquivo → melhora algo pequeno (renomeia, remove import sobrando,
clarifica um nome). Pequenos passos somam — sem refactor gigante.

## Sinais de código sujo (red flags)

- Função com mais que o limite do stack
- Classe com mais que o limite do stack
- Comentário explicando o que o código faz (versus por quê)
- Método que precisa scrollar
- Nome com mais de 3 palavras concatenadas
- 4+ parâmetros
- Boolean trap
- Magic number/string
- Catch sem ação (engole erro)
- Código morto (comentado, importado e não usado)
- TODO sem autor/data/contexto

Otávio bloqueia review em red flags graves. Sergio (Architect) endereça
quando o problema é estrutural (precisa redesign).
