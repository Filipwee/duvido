# DS-001: Fluxo completo do Jogo do Duvido (spec curta)
Data: 2026-06-08
Status: rascunho
Autor: Helena (designer)
Brief de referência: (produto descrito diretamente — sem PB formal em prototype)

---

## Contexto de uso

1 dispositivo, passado de mão em mão em festa presencial. Iluminação variável, distância de braço. Mobile-first 375px. Toda interação social (dizer respostas em voz alta, gritar "DUVIDO") acontece offline — o app só facilita.

---

## Fluxo entre telas

```
home ──[Sortear categoria]──> reveal ──[Iniciar timer]──> timer
  ^                                                          │
  │                              [Revelar gabarito / zera]  │
  └──────────[Nova categoria]── gabarito <──────────────────┘
```

---

## Nota sobre loading state

Toda a lógica é client-side síncrona (`pickCategory`, `pickRevealPhrase`). Não há rede, não há async — **estado "loading" não existe** neste app. Os quatro estados relevantes por tela são: padrão, vazio (edge case), erro e sucesso/resultado.

---

## Tela 1 — home

**Layout:** tela cheia com fundo escuro festivo. Centralizado verticalmente:
- Nome do app ("Duvido!") em tipografia grande, destaque
- Subtítulo: "Passe o celular e desafie seus amigos"
- `Button size="lg"` variant `default`: "Sortear categoria" (ação primária, ocupa ~80% da largura, min-height 56px)
- Link/botão discreto abaixo: "Preferências" abre `Dialog`

**Dialog de preferências:**
- Título: "Preferências"
- "Tempo do timer:" — seletor segmentado (5 opções: 30s / 45s / 60s / 90s / 120s) usando `Button` variant `outline` toggleável; selecionado vira `default`
- "Som:" — toggle on/off (`Button` variant `ghost` com ícone lucide `Volume2`/`VolumeX`)
- Botão fechar: `Button` variant `outline` "Fechar"
- Persistência: `localStorage` via `Preferences` type já definido

**Estados:**
- padrão: botão "Sortear" ativo, preferências com valores do localStorage (ou defaults: 60s, som on)
- vazio: impossível — 510 categorias, `pickCategory` nunca retorna vazio
- erro: `pickCategory` lança apenas se lista for vazia (impossível com dataset fixo) — tratar com `ErrorBoundary` genérico que mostra "Algo deu errado. Recarregue a página." e botão "Recarregar"
- sucesso: ao clicar "Sortear", navega imediatamente para reveal

**a11y:**
- Tab order: botão "Sortear" → link "Preferências"
- Dialog: foco preso dentro (shadcn Dialog cuida); foco inicial no primeiro controle; `Esc` fecha
- `aria-pressed` nos botões de duração selecionada
- Contraste: texto sobre fundo escuro — usar branco puro (#FFF) sobre fundo ≥ #1a1a2e, ratio > 4.5:1

---

## Tela 2 — reveal

**Layout:** tela cheia, centralizada. Animação de suspense com framer-motion:
1. Fase 1 (~1.5s): frase de suspense em tipografia grande (`pickRevealPhrase()` — ex: "A categoria é..."), com efeito de pulso/fade-in
2. Fase 2: nome da categoria em destaque máximo (fonte ≥ 48px, bold), aparece com slide-up ou zoom-in
- `Button size="lg"` variant `default`: "Iniciar timer" — aparece junto com a categoria (não antes)

**Estados:**
- padrão: sequência suspense → nome → botão
- vazio: impossível (mesma razão acima)
- erro: igual ao home — `ErrorBoundary` genérico
- "muitos dados": nome de categoria pode ser longo — clampar em 2 linhas, font-size responsivo (clamp)

**a11y:**
- `aria-live="polite"` na região que exibe a frase de suspense; ao revelar o nome, `aria-live="assertive"` ou foco movido para o elemento do nome
- Botão "Iniciar timer" recebe foco quando aparece (após animação)
- Contraste: nome da categoria em alta legibilidade — branco ou amarelo sobre fundo escuro, ratio ≥ 4.5:1

---

## Tela 3 — timer

**Layout:** tela cheia, hierarquia única: o número do countdown domina.
- Nome da categoria (pequeno, topo) — contexto para quem recebeu o celular
- Contador regressivo centralizado: tipografia monoespacada, ≥ 80px, legível a 60cm
- Cor muda conforme urgência: ≥ 10s = verde/neutro, < 10s = vermelho/laranja (framer-motion para transição de cor)
- Linha de botões na parte inferior (sticky/fixos):
  - `Button` variant `outline` size `lg` com ícone lucide `Pause`/`Play`: "Pausar" / "Retomar"
  - `Button` variant `default` size `lg`: "Revelar gabarito"
- Quando timer chega a 0: vibração (se Vibration API disponível), animação de pulso no número, botão "Revelar gabarito" fica em destaque pulsante; navegação automática após 2s OU ao toque

**Estados:**
- padrão (rodando): contador decrementando, botão "Pausar" visível
- pausado: contador parado, botão "Retomar" visível, overlay sutil ("Pausado")
- zerado: contador em 0, pulso vermelho, navega para gabarito
- erro: sem estado de erro real — o timer é `setInterval` local

**a11y:**
- `aria-live="off"` no contador numérico (anunciar cada segundo é insuportável em leitor de tela — não anunciar)
- `aria-label` descritivo no botão pausar/retomar: "Pausar contagem" / "Retomar contagem"
- Quando zera: `aria-live="assertive"` em região oculta anuncia "Tempo esgotado"
- Botões de tamanho mínimo 56px (toque com polegar em celular passado de mão em mão)
- Contraste do número: vermelho de urgência deve ser ≥ #c0392b sobre fundo escuro — verificar ratio; usar #e74c3c como mínimo (ratio ~4.6:1 sobre #1a1a2e)

---

## Tela 4 — gabarito

**Layout:** tela scrollável.
- Topo: nome da categoria + subtítulo "Gabarito oficial"
- Lista de respostas: cada `answers[i]` em item de lista visual — pode ser simples `ul > li` estilizado ou lista dentro de `Card`; fonte legível ≥ 18px
- Rodapé fixo com 2 botões:
  - `Button` variant `default` size `lg`: "Nova categoria" (ação principal)
  - `Button` variant `outline` size `lg`: "Início" (volta para home)

**Estados:**
- padrão: lista com N respostas (dataset tem respostas variadas — de 3 a ~20 itens)
- vazio: `answers` é array vazio — mostrar "Nenhuma resposta cadastrada para esta categoria." com botão "Nova categoria" imediatamente visível; NÃO esconder os botões de navegação
- erro: igual aos anteriores — `ErrorBoundary` genérico
- muitos dados: categoria com muitas respostas (~20 itens) — scroll nativo; não paginar; rodapé fixo garante que botões sempre aparecem

**a11y:**
- `aria-live="polite"` na região do gabarito ao entrar na tela (anuncia para leitores de tela que o gabarito chegou)
- Lista de respostas como `<ul>` semântico com `<li>` — não usar `div` plano
- Tab order: lista (não focável individualmente — é leitura) → "Nova categoria" → "Início"
- Foco inicial na tela: botão "Nova categoria"

---

## Microcopy (PT-BR)

| Elemento | Texto |
|---|---|
| Botão sortear | "Sortear categoria" |
| Subtítulo home | "Passe o celular e desafie seus amigos" |
| Botão iniciar | "Iniciar timer" |
| Botão pausar | "Pausar" |
| Botão retomar | "Retomar" |
| Botão revelar | "Revelar gabarito" |
| Botão nova categoria | "Nova categoria" |
| Botão voltar início | "Início" |
| Gabarito vazio | "Nenhuma resposta cadastrada para esta categoria." |
| Erro genérico | "Algo deu errado. Recarregue a página." |
| Botão recarregar | "Recarregar" |
| Preferências — título | "Preferências" |
| Preferências — fechar | "Fechar" |
| Timer pausado | "Pausado" |
| Timer zerado (aria, oculto) | "Tempo esgotado" |

---

## Responsividade

- **375px (referência):** layout de coluna única, botões full-width, fonte do timer ≥ 80px
- **430px+ (iPhone Pro Max e similares):** mesmas proporções, padding lateral aumenta levemente
- **768px+:** não é o caso de uso principal (jogo de festa = celular), mas deve funcionar; layout centralizado com max-width ~480px, fundo decorativo nas laterais

---

## Componentes shadcn reusados (nenhum componente novo)

| Componente | Onde |
|---|---|
| `Button` (default, outline, ghost) | Todas as telas |
| `Card` | Gabarito (lista de respostas), opcional |
| `Dialog` | Preferências (home) |

Framer-motion: animações de reveal (tela 2) e pulso do timer (tela 3). Lucide: ícones Volume2/VolumeX (preferências), Pause/Play (timer). Zustand: estado de jogo compartilhado entre telas (Screen atual, Category sorteada, timer running/paused).

---

👉 Próximo passo prático: Renata implementa as 4 telas consumindo `pickCategory`, `pickRevealPhrase` e `TIMER_DURATIONS` de `src/lib/game/index.ts`, reusando Button + Card + Dialog do shadcn já instalados. Estado global de navegação (screen atual, categoria atual, timer) via Zustand. Animações de suspense na tela reveal com framer-motion. Foco especial no tamanho dos botões (min 56px) e no contador do timer (≥ 80px) — o celular é passado de mão em mão.
