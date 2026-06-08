# Definition of Done

🪶 LIDO SOB DEMANDA — checklist final antes de marcar uma TASK como `done`.

Independente de linguagem. Itens específicos do stack (qual comando rodar, qual
framework de teste, qual coverage tool) ficam em `stacks/<active>/build-reference.md`.

## Por que existe

Sem checklist explícita, "pronto" vira opinião. O time precisa que "pronto"
seja **verificável e reprodutível** — não importa quem entregou ou em qual
linguagem.

## Quando aplica

- Quando Lucas/Renata terminam uma TASK e vão entregar a Otávio.
- Quando Otávio revisa antes de aprovar merge.
- Quando Viktor decide se a feature pode fechar (`current-plan.md → done`).

Em modo `lean` algumas linhas relaxam — ver coluna correspondente.

## Checklist universal

### Código
- [ ] Compila / type-checa sem erro nem warning
- [ ] Sem TODO/FIXME novo sem dono e contexto (`// TODO(autor, data): ...`)
- [ ] Sem código morto (imports não usados, branches mortos, código comentado)
- [ ] Sem `print`/`console.log`/`fmt.Println` em código de produção
- [ ] Sem credenciais hardcoded
- [ ] Sem chamadas a serviços externos sem timeout
- [ ] Sem SQL string-concatenado (uso de bind params, ORM ou query builder)
- [ ] Funções/métodos dentro do limite do stack (ver `stacks/<active>/language-rules.md`)
- [ ] Tratamento de erro segue `wisdom/error-handling.md` + `stacks/<active>/patterns.md`

### Testes
- [ ] Happy path testado
- [ ] Pelo menos 1 cenário de exceção/erro testado
- [ ] Pelo menos 1 edge case (null/nil/None, vazio, limite numérico) testado
- [ ] Cobertura ≥ threshold do stack (ver `stacks/<active>/test-skeletons.md`)
- [ ] Testes rodam isoladamente (sem dependência de ordem)
- [ ] Sem `@Disabled`/`it.skip`/`t.Skip()` sem justificativa + ticket de retomada
- [ ] **Mutação rápida**: ao mudar 1 linha do código real, pelo menos 1 teste falha

### Smoke E2E (obrigatório para feature de backend ou full-stack)
- [ ] Feature backend respondeu **HTTP 200 com payload não-vazio sobre dado real** rodando localmente (`curl`/Postman/DevTools)
- [ ] Se há frontend: a tela carregou, fez request real, mostrou resposta — sem erro no console
- [ ] Token/auth foi enviado e validado (se rota protegida)

> Smoke E2E **não é teste automatizado** — é Lucas/Renata validando manualmente
> que a coisa funciona fim-a-fim. Em modo `lean` continua obrigatório.

### Segurança (Nina valida em features sensíveis)
- [ ] Sem PII em log (CPF, email completo, token, senha)
- [ ] Rotas protegidas têm auth real (não placeholder)
- [ ] Input validado no boundary (request → DTO/schema)
- [ ] Dependências novas escaneadas (`npm audit`/`pip-audit`/`govulncheck`/etc. limpo ou exceção justificada)
- [ ] SQL via bind params (já no checklist de código, mas Nina re-verifica)
- [ ] Secrets vêm de env/secret store, não do código

### Documentação
- [ ] Endpoint novo documentado (OpenAPI/Swagger gerado, ou docstring no router)
- [ ] Decisão arquitetural não-trivial registrada (`decisions.md` ou ADR)
- [ ] README atualizado se nova env var/config foi introduzida
- [ ] Migration tem comentário do propósito

### Estado do projeto
- [ ] `current-plan.md` atualizado (status da TASK → done; próxima task identificada)
- [ ] `dashboard.md` atualizado (cobertura/build status se mudou)
- [ ] `feedback-log.md` atualizado (auto-feedback do agente, conforme `agent-conventions.md`)

### Review
- [ ] Otávio aprovou (veredito: ✅ APROVADO ou ⚠️ APROVADO COM RESSALVAS — bloqueadores resolvidos)
- [ ] Se ⚠️ APROVADO COM RESSALVAS: ressalvas viraram TASKs futuras OU foram corrigidas antes do merge

## Por modo do profile

| Item | `lean` | `medium` | `full` |
|------|--------|----------|--------|
| Code básico (compila, sem print, sem creds) | ✅ | ✅ | ✅ |
| Happy path testado | ✅ | ✅ | ✅ |
| Edge cases testados | ⚠️ ≥1 | ✅ 2-3 | ✅ todos relevantes |
| Cobertura mínima | piso baixo | threshold do stack | threshold + branches |
| Smoke E2E manual | ✅ | ✅ | ✅ |
| Nina valida | só se sensível | ✅ | ✅ |
| ADR formal | só decisões grandes | decisões médias+ | toda decisão não-óbvia |
| Mutation test | ❌ | sample | ✅ |
| Performance test | ❌ | só se crítica | ✅ |
| Acessibilidade WCAG AA | bom-senso | ✅ | ✅ + AAA crítico |

> `lean` corta cerimônia, **não corta smoke E2E nem segurança crítica**.

## O que NÃO está no DoD (importante)

- Performance afinada ao milissegundo — é otimização, não pronto
- 100% de cobertura — métrica inflacionável, sem garantia de qualidade
- Aprovação do usuário final — escopo de Olivia (PM), não do agente
- Deploy em produção — escopo de Téo (SRE)
- Postmortem / lessons learned — escopo de Viktor + Iris (ocorre depois)

## Quem assina

- **Lucas/Renata**: marcam os itens da seção "Código" e "Testes" antes de entregar a Otávio
- **Sofia**: confirma "Testes" + "Smoke E2E" (orienta Lucas/Renata se faltou)
- **Otávio**: verifica todo o checklist; veredito final dele
- **Viktor**: marca a TASK como `done` no `current-plan.md`

Sem o checklist passar, a TASK **não fecha**. Em modo `lean`, alguns itens
viram WARN em vez de FAIL — mas nunca silenciados.
