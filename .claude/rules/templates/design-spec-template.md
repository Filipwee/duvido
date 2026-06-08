# Template — Design Spec

🪶 LIDO SOB DEMANDA por Helena (designer). Formato obrigatório de saída.

Toda entrega de Helena é uma **Design Spec** em
`.claude/context/design/DS-NNN-<slug>.md`. Iris linka em `architecture.md`.

```markdown
# DS-NNN: <título curto>
Data: YYYY-MM-DD
Status: rascunho | aprovado | em-implementação | entregue
Autor: Helena (designer)
Brief de referência: PB-NNN (link)

## Objetivo de UX
<1 parágrafo — qual problema do brief este design resolve, e como mediremos
sucesso pela perspectiva de UX (não a métrica de produto da Olivia, mas
"usuário completa a tarefa em X cliques" ou similar)>

## Persona em uso
<copia da Olivia + contexto de uso desta tela específica>

## Fluxo do usuário
Passo a passo, do gatilho até o resultado:

1. Usuário está em <tela origem>
2. Clica em <gatilho> → navega para <tela nova>
3. Vê <estado inicial>
4. Preenche/seleciona <campos>
5. Confirma → <feedback de sucesso> → <próximo passo>

Caminhos alternativos (erro, cancelamento): ...

## Wireframe textual

### Estado padrão (happy path)
\```
┌──────────────────────────────────────────────┐
│ < Voltar              Título da página       │
├──────────────────────────────────────────────┤
│                                              │
│  [Filtro: ▼ Todos]   [+ Novo registro]      │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ Linha 1                          $X  │   │
│  │ Linha 2                          $Y  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│             [< Anterior]  [Próximo >]        │
└──────────────────────────────────────────────┘
\```

### Estado: vazio (sem dados)
\```
(wireframe ASCII do estado vazio — incluindo CTA pra ação que destrava)
\```

### Estado: loading
\```
(wireframe ASCII do skeleton — onde aparece, quanto tempo aprox)
\```

### Estado: erro
\```
(wireframe ASCII — mensagem útil + ação de retry)
\```

### Estado: muitos dados (limite superior)
\```
(paginação? virtual scroll? como se comporta com 10k registros?)
\```

## Hierarquia visual
- **Primária** (ação central): <ex: botão "Confirmar" no canto inferior direito>
- **Secundária** (apoio): <ex: link "Cancelar" à esquerda do primário>
- **Terciária** (navegação): <ex: breadcrumb no topo>

## Componentes do design system

Usa apenas componentes já instalados em `frontend/src/components/ui/`:
- `Button` (variant: `default` para primária, `outline` para secundária, `ghost` para terciária)
- `Input`, `Label`, `FormMessage`
- `Card` para agrupar registros
- `Dialog` para confirmação destrutiva
- `Skeleton` para loading
- `Table`, `TableHeader`, `TableRow` para listagens
- ...

Se a feature precisar de componente **novo** no design system, justifico:
- **Nome do componente**: <ex: `DataTablePagination`>
- **Por que não dá pra reusar existente**: <razão técnica>
- **Composição interna**: <Button + Select + texto>

## Microcopy
- **Botão primário**: "<texto exato>"
- **Empty state**: "<texto + CTA>"
- **Erro de validação por campo**:
  - Campo X obrigatório: "<texto>"
  - Campo X formato inválido: "<texto>"
- **Erro de servidor**: "<texto + ação>"
- **Confirmação destrutiva**: "<texto da pergunta + texto do botão de confirmar>"

## Acessibilidade
- **Tab order**: <campo 1 → campo 2 → botão primário → botão secundário>
- **aria-label** em elementos sem label visível (botão de ícone): <listar>
- **aria-live** em loading/error: `polite` para loading, `assertive` para erro crítico
- **Foco inicial** ao abrir a tela: <onde>
- **Foco após submit**: <onde — geralmente próxima ação ou mensagem de sucesso>
- **Contraste**: verificado para todos os textos
- **Modal/Dialog**: foco preso dentro (shadcn cuida), `Esc` fecha

## Responsividade
- **Mobile (375px)**: <o que muda — geralmente stack vertical, table vira card>
- **Tablet (768px)**: <o que muda>
- **Desktop (1280px)**: <referência principal — layout completo>

## Decisões de design (trade-offs)
- <decisão>: <alternativa rejeitada + porquê>

## Riscos de UX
- <risco>: <mitigação>

## Perguntas pendentes
- [ ] <à Olivia se afeta critério de aceite>
- [ ] <à Renata se afeta implementação>
- [ ] <ao usuário se afeta produto>

## Próximo passo prático
👉 <ex: "Renata implementa DS-005 reusando Card + Table + Button — sem componente novo" | "Aguardando resposta da Olivia sobre estado vazio">
```

## Design Spec curta (modo enxuto — mudança 1-2 tasks ou perfil protótipo)

Quando Viktor declara modo enxuto, Helena entrega uma **spec curta**. O que
NÃO encolhe nunca: os 4 estados (padrão/vazio/loading/erro) e a acessibilidade
mínima (tab order + contraste). O que encolhe: wireframe vira lista, microcopy
vira bullets, responsividade só se a tela mudar de layout.

```markdown
# DS-NNN: <título> (spec curta)
Data: YYYY-MM-DD | Autor: Helena | Brief: PB-NNN

**Fluxo:** <1-2 frases>
**Layout:** <descrição textual — quais componentes shadcn, em que ordem>
**Estados:**
- vazio: <texto + CTA>
- loading: <skeleton onde>
- erro: <mensagem + retry>
- padrão: <o que aparece com dado>
**a11y:** tab order <ordem>; contraste WCAG AA; aria-label em <ícones>
👉 Próximo: Renata implementa reusando <componentes>
```

Não cabe spec curta se: tela nova complexa, fluxo de múltiplos passos, ou
componente novo no design system. Nesses casos, template completo.
