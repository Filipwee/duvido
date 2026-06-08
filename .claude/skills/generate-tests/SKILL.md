---
name: generate-tests
description: Gera testes para código existente, no framework do stack ativo (JUnit, pytest, Vitest, go test, etc.). Aciona Sofia para analisar o código, identificar casos a cobrir e escrever testes. Em seguida Max executa para confirmar que passam. Use quando o usuário pede "escreve testes para X" ou quando Otávio aponta cobertura insuficiente.
---

# Generate Tests

Você está gerando testes para código existente, no framework do **stack ativo**
do projeto. Siga este fluxo.

## Argumento esperado
Classe/módulo/arquivo alvo. Passado via $ARGUMENTS.
Se vazio, usa o diff do branch atual (Viktor decide o range conforme o stack).

## Passo a passo (Viktor executa)

### 1. Identificar o que testar
Viktor lista os arquivos relevantes com Glob nos paths convencionais do stack
(ver `paths.backend_root` / `paths.frontend_root` em `project-profile.md`):
- Services / use cases / handlers / routes
- Domain models com lógica
- Helpers/utils com lógica

### 2. Acionar Sofia (tester)
Briefing inclui:
- Arquivos a cobrir (lidos via Read)
- Cobertura existente (se houver relatório do stack)
- Critério: ver `stacks/<active>/test-skeletons.md` — Sofia sabe o que cobre
  cada camada no idiom do stack (unit, slice, integração)

Sofia entrega:
- Arquivos de teste criados/atualizados
- Lista de casos cobertos por classe/módulo

### 3. Acionar Max (build)
Executa o comando de teste do stack ativo (ver `stacks/<active>/build-reference.md`).

Loop automático: se teste falhar por mock mal configurado ou config → Sofia
corrige, Max re-executa.
Máximo 3 ciclos.

### 4. Cobertura
Max roda o comando de cobertura do stack (ex.: `mvn test jacoco:report`,
`pytest --cov`, `vitest run --coverage`, `go test -coverprofile=...`) e
reporta cobertura por camada.

### 5. Reportar ao usuário
- Testes criados: lista de arquivos
- Casos cobertos: resumo por classe/módulo
- Cobertura: % (se disponível)
- Casos edge não cobertos (sugestão futura)

## Priorização de casos (Sofia segue esta ordem)

1. **Caminho feliz** — fluxo principal funciona
2. **Not found / null/nil/None** — recurso não existe
3. **Validação** — input inválido lança exceção/erro certo
4. **Autorização** — acesso negado quando sem permissão
5. **Edge cases** — zero, negativo, string vazia, lista vazia, limite numérico
6. **Concorrência** — só se houver estado compartilhado óbvio (race detector quando o stack suporta)

## Critério de pronto desta skill
- [ ] Testes gerados para todos os arquivos alvo
- [ ] Comando de teste do stack verde (zero falhas)
- [ ] Cobertura ≥ threshold do stack (ver `stacks/<active>/test-skeletons.md`)
- [ ] Usuário recebeu relatório de cobertura
