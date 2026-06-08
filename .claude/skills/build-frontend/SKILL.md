---
name: build-frontend
description: Cria, refatora ou estende a aplicação frontend no stack frontend ativo do projeto (geralmente React/TypeScript, mas adaptável a Vue/Svelte/etc.). Aciona Helena (design spec) antes de Renata (implementação) em UI nova, e conforme a etapa Olivia (brief), Bruno (scaffold), Sofia (testes), Max (build) e Otávio (review). Use quando o pedido envolve UI, página, componente, hook/composable ou integração com a API REST.
---

# Build Frontend

Você está construindo ou alterando a camada de **frontend**, no stack frontend
ativo do projeto. Stack default do sistema: `typescript-react`. Stack ativo vem
de `.claude/project-profile.md` → `active_stacks`. Siga o fluxo abaixo,
ajustando ao escopo do pedido.

Em time real, UI nasce de **design**, não de improviso do dev. Por isso Helena
(Design Spec) entra antes de Renata em qualquer UI não-trivial. E se o pedido
vier vago de produto, Olivia (brief) entra antes de tudo.

## Argumento esperado
Descrição da tarefa de frontend. Passada via $ARGUMENTS.
Exemplos:
- "criar página de listagem de transações"
- "adicionar formulário de login com validação"
- "scaffold inicial do frontend"

## Passo a passo (Viktor executa)

### 1. Classificação inicial
- **Pedido vago de produto?** → **Olivia** faz brief primeiro (passo 1a)
- **Scaffold inicial?** (não existe pasta do frontend) → começa pelo passo 2
- **UI nova / mudança de fluxo?** → **Helena** faz design spec (passo 2b) antes de Renata
- **Refactor / ajuste pontual / componente padrão de UI library?** → vai direto ao passo 3 (dispensa Helena — modo enxuto, ver `protocols/vetoes.md`)
- **Bug visual ou de comportamento?** → Renata diagnostica primeiro

### 1a. Brief de produto (Olivia) — se o pedido for vago
Olivia entrega `PB-NNN` com critério de aceite + métrica de sucesso.
Veto: feature sem critério não avança. Pula se o pedido já vem claro do usuário.

### 2. Scaffold inicial (somente se a pasta do frontend não existir)
Aciona **Bruno (scaffolder)** com briefing. Bruno lê
`.claude/stacks/<active-fe>/scaffold-reference.md` e entrega esqueleto:
- Estrutura padrão da stack
- Manifesto de deps base
- Config de typecheck/lint/format se aplicável
- Estrutura de diretórios convencionada
- Variáveis de ambiente exemplo (`.env.example`)
- Atualiza `.gitignore` da raiz se o frontend é em subpasta

Bruno entrega esqueleto — Renata preenche.

### 2b. Design Spec (Helena) — antes de Renata em UI nova
Aciona **Helena (designer)** com briefing:
- Brief da Olivia (`PB-NNN`) se existir, ou o pedido do usuário
- Componentes de UI library já instalados

Helena entrega `DS-NNN` (em `.claude/context/design/`) com:
- Fluxo do usuário + wireframe textual (ASCII)
- 4 estados obrigatórios: padrão, vazio, loading, erro
- Hierarquia visual + componentes a reusar
- Microcopy + acessibilidade (tab order, ARIA, contraste WCAG AA)

**Veto de Helena:** Renata não implementa UI sem Design Spec (exceto modo enxuto).

Helena dialoga lateralmente com Renata (viabilidade) e Olivia (fluxo bate com brief).

### 3. Acionar Renata (frontend)
Briefing inclui:
- Tarefa exata do usuário ($ARGUMENTS)
- **Design Spec da Helena (`DS-NNN`)** — Renata implementa o que foi desenhado, não improvisa
- Se há endpoints novos: caminho exato + DTOs/schemas do backend (Read no
  Controller/Handler/Router/Schema do backend, na linguagem ativa)
- Componentes já existentes (Glob no diretório do frontend)
- Padrões a respeitar — Renata lê:
  - `.claude/stacks/<active-fe>/language-rules.md`
  - `.claude/stacks/<active-fe>/patterns.md`
  - `.claude/stacks/<active-fe>/anti-patterns.md`

Durante a implementação, Renata pode dialogar lateralmente com Helena (dúvida
de design) e Lucas (contrato REST).

Renata entrega:
- Lista de arquivos modificados/criados
- Decisões tomadas (estrutura de feature, hooks/composables criados)
- Sinalizações para Sofia e Otávio

### 4. Se componente tem lógica complexa → acionar Sofia
Quando vale teste:
- Hooks/composables/stores customizados
- Reducers / lógica de estado
- Funções utilitárias puras
- Componentes com branches condicionais não triviais

Sofia escreve testes no framework do stack (Vitest/Jest/etc. — ver
`stacks/<active-fe>/test-skeletons.md`).

NÃO valem teste (regra do projeto):
- Componentes de apresentação puros sem lógica
- Re-exports de UI library

### 5. Acionar Max (build) — validação
Max executa, dentro da pasta do frontend, os comandos do stack ativo (ver
`stacks/<active-fe>/build-reference.md`):
- typecheck
- lint
- build de produção

Se erro → Max aciona Renata com diagnóstico. Loop até 3 ciclos.

### 6. Acionar Otávio (reviewer) — e Nina se houver auth/PII
Review específico para frontend — Otávio carrega:
- `.claude/stacks/<active-fe>/patterns.md`
- `.claude/stacks/<active-fe>/anti-patterns.md`
- `.claude/stacks/<active-fe>/language-rules.md`

Verifica:
- Tipos sem `any` (ou equivalente largo)
- A11y conforme Design Spec da Helena
- Sem prop drilling abusivo, sem componentes acima do limite do stack
- Server state via gerenciador idiomático (React Query / Pinia / loaders), não fetch+effect manual
- Integração com back: shape do DTO bate com o que o backend entrega
- Implementação fiel à Design Spec (estados vazio/loading/erro presentes)

**Se a feature toca auth, token ou PII** → **Nina** revisa em paralelo:
- Token em httpOnly cookie quando possível, evita localStorage para token (risco XSS)
- Sem dado sensível em console/log ou em estado global exposto
- Veto de Nina (vuln Alta/Crítica) sobrescreve approval de Otávio.

### 7. Atualizar Iris (context)
Iris linka a Design Spec (`DS-NNN`) em `architecture.md` e atualiza CHANGELOG.

### 8. Reportar ao usuário
- Arquivos criados/alterados
- Design Spec de referência (`DS-NNN`)
- Como rodar: comando de dev do stack (ver `project-profile.md` → `commands.run_dev`)
- Endpoints consumidos do back
- Próximos passos sugeridos

## Critério de pronto desta skill
- [ ] Brief da Olivia (se pedido era vago de produto)
- [ ] Design Spec da Helena (`DS-NNN`) — em UI nova
- [ ] Renata implementou fiel à spec e devolveu lista de arquivos
- [ ] typecheck zero erro
- [ ] lint zero erro
- [ ] build verde
- [ ] Testes passando (se foram criados)
- [ ] Otávio aprovou (+ Nina se feature sensível)
- [ ] Iris linkou Design Spec e atualizou CHANGELOG
- [ ] Usuário recebeu instruções para rodar localmente
