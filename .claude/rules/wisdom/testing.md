# Testing Wisdom — Princípios Universais

🪶 LIDO SOB DEMANDA por Sofia.

Princípios independentes de linguagem. Skeletons e ferramentas específicos
(JUnit, pytest, Vitest, go test, etc.) ficam no `stacks/<active>/test-skeletons.md`.

## F.I.R.S.T.

- **Fast**: testes unitários < 100ms cada (vale para qualquer linguagem)
- **Isolated**: sem dependência de ordem, sem estado compartilhado
- **Repeatable**: mesmo resultado em qualquer ambiente
- **Self-Validating**: passa ou falha — sem interpretação manual
- **Timely**: escrito junto com o código, não depois

## Given-When-Then (obrigatório — qualquer framework)

```
test "deve calcular juros compostos corretamente para 3 meses":
    // Given (preparação)
    principal = 1000
    taxa = 0.01
    meses = 3

    // When (ação testada)
    resultado = calcular_juros_compostos(principal, taxa, meses)

    // Then (asserção)
    assert resultado == 1030.30
```

A sintaxe varia (`describe/it`, `def test_`, `@Test`, `func Test...`), mas a
estrutura é universal — separar setup, ação, asserção.

## O que testar vs não testar

| Testar | Não testar |
|--------|-----------|
| Lógica de negócio | Getters/setters gerados (Lombok, dataclass, etc.) |
| Validações de input | Construtores triviais |
| Tratamento de erro/exception | Frameworks externos (Spring, FastAPI, Express) |
| Branches if/switch/match | Configurações de DI sem lógica |
| Casos-limite (null/nil/None, zero, negativo) | Re-exports de bibliotecas (shadcn, etc.) |

## Pirâmide de testes

```
        E2E (poucos, lentos, frágeis)
       ────
      Slice/Integração (alguns)
     ────────
    Unitários (maioria — rápidos, isolados)
   ──────────
```

Cobertura alta vem da base, não do topo.

## Dublês de teste — vocabulário universal

| Tipo | Propósito | Quando usar |
|---|---|---|
| **Dummy** | Passado mas não usado | Preencher assinatura |
| **Stub** | Retorno fixo | Substituir dependência sem lógica |
| **Spy** | Stub + captura chamadas | Verificar que foi chamado |
| **Mock** | Programação de expectativas | Verificar interação esperada |
| **Fake** | Implementação funcional simplificada | DB in-memory, repository fake |

A escolha entre mock e fake afeta a fragilidade do teste:
- **Fake** > Mock para colaboradores complexos (repository, gateway externo)
- **Mock** quando o ponto-chave é **interação** (foi chamado N vezes, com X)
- **Stub** quando só importa o **retorno**

## Boas práticas (universais)

```
// ✅ Verifica comportamento, não implementação
verify(emailService).sendConfirmation(any())   # Java/Mockito
spy.assert_called_once_with(...)               # Python
expect(mock).toHaveBeenCalledWith(...)         # Vitest
mock.AssertExpectations(t)                     # Go/testify

// ✅ Captura argumento para asserção detalhada
captor = ArgumentCaptor.forClass(Transaction)
verify(repository).save(captor.capture())
assertThat(captor.getValue().status).isEqualTo(APPROVED)

// ❌ Evitar — mock desnecessário (teste fica frágil)
mock_transaction.id = some_id   # crie objeto real em vez disso
```

## Naming de teste — descreva comportamento

```
// ❌ Nome do método testado
test_create()
testCreate()
TestCreate(t)

// ✅ Comportamento esperado
test_create_returns_201_with_valid_body()
deveRetornar404QuandoIdNaoExiste()
TestService_FindByID_NotFound(t)
```

## Parametrize — reduz duplicação (cada framework tem o seu)

```python
# pytest
@pytest.mark.parametrize("amount,expected_status", [
    (100, "APPROVED"),
    (0,   "REJECTED"),
    (-10, "REJECTED"),
])
def test_classify(amount, expected_status):
    assert classify(amount).status == expected_status
```

```java
// JUnit 5
@ParameterizedTest
@CsvSource({"100,APPROVED", "0,REJECTED", "-10,REJECTED"})
void test_classify(int amount, String expected_status) { /* ... */ }
```

```go
// Go — table-driven
for _, tc := range []struct{...}{...} {
    t.Run(tc.name, func(t *testing.T) { /* ... */ })
}
```

## Mutação rápida (validar que o teste falha)

Se o teste passa quando você muda o comportamento que ele testa, ele não está
medindo nada. Após escrever, mude 1 linha do código real (inverte um `if`,
muda um valor de retorno) e confirme que o teste **falha**. Só então o teste
está fazendo seu trabalho.

## Cobertura — métrica, não meta

Cobertura ≥ 80% é piso, não teto. Cobertura **mede** branches executados, não
prova que o comportamento certo está testado. Use mutation testing (PIT em
Java, mutmut em Python, Stryker em JS) quando a cobertura inflacionou.

## Regras invioláveis

- Cada teste tem **exatamente 1 razão pra falhar**
- Sem sleep fixo — usa `await` / fakes de tempo / context com timeout
- Sem banco de produção — sempre in-memory ou containers
- Nome descreve **comportamento esperado**, não o método
- Sem mockar o que não é necessário (excesso = teste inútil)
- Sem `@Disabled`/`skip` sem comentário do porquê + ticket de retomada
