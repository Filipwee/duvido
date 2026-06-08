# DISCOVERY — Jogo do Duvido

> Investigação do protótipo original (Replit) antes de reconstruir em Next.js.
> Fonte: `https://interactive-fun-site--filipemotta20.replit.app`
> Stack original detectada: **Vite + React + Framer Motion + Tailwind**, client-side puro,
> sem backend. Fonte **Inter** (Google Fonts). Bundle único (~505 KB JS / ~97 KB CSS).

---

## 1. O que é o jogo

"Jogo do Duvido" é um **party game presencial facilitado por app**. O app **não joga** —
ele é o "mestre de cerimônias": sorteia uma **categoria/desafio**, roda um **timer**, e no
final revela o **gabarito** (lista de respostas válidas) para os jogadores conferirem e
"duvidarem" uns dos outros. Toda a interação social (falar respostas em voz alta, duvidar)
acontece fora da tela.

### Regras inferidas (jogo de mesa)
1. O app sorteia uma **categoria** (ex.: "Jogadores de futebol famosos").
2. Os jogadores, em rodadas, dizem itens que pertencem àquela categoria.
3. Quando alguém acha que o outro inventou / está blefando, grita **"DUVIDO"**.
4. O **timer** (60s por padrão) controla o tempo de cada disputa.
5. No fim, o app mostra o **gabarito** — a lista oficial de respostas aceitas — para
   resolver as dúvidas (quem estava certo / quem blefou).
6. Avança para a **próxima rodada** com uma nova categoria.

> Nota: o app não rastreia pontuação nem jogadores no protótipo — placar é "social/manual".
> (Oportunidade de melhoria opcional na reconstrução; ver §8.)

---

## 2. Telas / fluxo (máquina de estados)

O estado central é `{ screen, round, currentCategory, duration }`.
Quatro telas (`screen`): **home → reveal → timer → gabarito → (próxima rodada)**.

```
            startRound()                goToTimer()             goToGabarito()
  home  ───────────────►  reveal  ───────────────►  timer  ───────────────►  gabarito
   ▲       (sorteia          │   (suspense 1.8s,        │  (countdown 60s)        │
   │        categoria)       │    depois revela)        │                         │
   │                         └── skipCategory() ◄───────┘                         │
   └──────────────────────────  goHome() ◄──── nextRound() (novo sorteio) ◄───────┘
```

| Tela | Conteúdo | Ações (botões) |
|------|----------|----------------|
| **home** | Marca "DUVIDO" em gradiente; subtítulo; frase de chamada | `INICIAR` |
| **reveal** | Animação de suspense (~1.8s) → revela o nome da categoria sorteada. Frase aleatória de abertura: *"A categoria é..."*, *"Preparem-se..."*, *"O desafio de hoje..."*, *"Atenção jogadores..."*, *"O sorteio foi feito..."* | `LIGAR O TIMER`, `pular categoria` (skip) |
| **timer** | Contagem regressiva (anel/círculo de progresso) a partir de `duration` (60s) | `VER GABARITO`, próximo |
| **gabarito** | "Rodada N" + nome da categoria + **lista de respostas válidas** (answers) | `PRÓXIMA RODADA`, `voltar ao início` |

### Ações do store (Context/reducer no original)
`startRound`, `skipCategory`, `goToTimer`, `goToGabarito`, `nextRound`, `goHome`.
Sorteio: `qc(currentName)` → filtra a categoria atual e pega uma aleatória das restantes
(`Math.random`), evitando repetir a mesma duas vezes seguidas.

---

## 3. Dados do jogo

- **510 categorias**, cada uma no formato:
  ```ts
  { name: string; answers: string[] }
  ```
- Exemplo real:
  ```json
  { "name": "Jogadores de futebol famosos",
    "answers": ["Pelé","Maradona","Ronaldo Fenômeno","Ronaldinho","Zidane",
                "Messi","Cristiano Ronaldo","Beckham","Neymar","Mbappé"] }
  ```
- Temas variados: futebol, capitais, animais, filmes/Oscar, química (tabela periódica),
  história (guerras, líderes), música (Spotify, R&B, funk), games, mitologia, super-heróis,
  comidas, profissões, monumentos, etc. Tudo em **português brasileiro**.
- Estado inicial: `currentCategory` vazio (`{name:"", answers:[]}`), `round:0`, `duration:60`.

> O dataset completo (510 categorias) deve ser **extraído do bundle original** e salvo como
> `src/lib/game/categories.ts` (ou `.json`) na reconstrução. É o ativo central do jogo.

---

## 4. Identidade visual

- **Tema escuro** ("dark"), fundo azul-marinho profundo.
- **Fonte**: `Inter` (pesos 400/500/600/700), via Google Fonts.
- **Cores de destaque**: azul neon **`#2563EB`** e verde neon **`#00FF88`** — usados em
  gradientes e *glows* (box-shadow brilhante).
- **Animações**: Framer Motion (fade/slide, suspense na revelação, anel de timer, hover/tap
  com `scale`).

### Paleta (do CSS — formato HSL do Tailwind/shadcn)
| Token | Valor | Aprox. |
|-------|-------|--------|
| `--background` | `222 47% 5%` | `#070A12` (navy quase preto) |
| `--foreground` | `0 0% 98%` | `#FAFAFA` |
| `--card` | `222 40% 7%` | `#0B0F1A` |
| `--border` / `--card-border` | `222 30% 14%` | `#1A2233` |
| `--primary` (sidebar-primary) | `221 83% 53%` | `#2563EB` |

### Hex inline mais usados
| Cor | Uso |
|-----|-----|
| `#00FF88` (14×) | Verde neon — botão "LIGAR O TIMER", acentos, glow `rgba(0,255,136,…)` |
| `#2563EB` (7×) | Azul primário — botão INICIAR, gradientes, glow `rgba(37,99,235,…)` |
| `#1D4ED8` | Azul mais escuro — gradiente de botão |
| `#93C5FD` | Azul claro — texto/detalhe |
| `#ffffff` | Gradiente de título |

Gradientes-chave:
- Título "DUVIDO": `linear-gradient(135deg, #ffffff 0%, #2563EB 60%, #00FF88 100%)` (texto clipado)
- Botão primário: `linear-gradient(135deg, #1D4ED8, #2563EB)` + `box-shadow 0 0 25px rgba(37,99,235,.5)`
- Fundo: radiais sutis `rgba(37,99,235,.15)` e `rgba(0,255,136,.08)`

---

## 5. Componentes identificados

- **BrandTitle** — "DUVIDO" com gradiente clipado + subtítulo.
- **HomeScreen** — título + frase de chamada + botão `INICIAR`.
- **RevealScreen** — suspense temporizado (1.8s) → nome da categoria; botões timer/skip.
- **TimerScreen** — anel de contagem regressiva (SVG/círculo), número grande de segundos.
- **GabaritoScreen** — "Rodada N", nome da categoria, lista de `answers`, botão próxima rodada.
- **GlowButton** — botão com gradiente + box-shadow neon, micro-interações (hover/tap scale).
- **Background glows** — camadas de radial-gradient decorativas.

---

## 6. Interações principais

- Sorteio aleatório sem repetição imediata da categoria.
- Revelação com delay de suspense (~1.8s) antes de mostrar a categoria.
- Timer regressivo de 60s (valor default; aparenta ser fixo no protótipo).
- Transições animadas entre telas (`AnimatePresence` mode="wait").
- Botão "pular categoria" sorteia outra sem gastar rodada.

---

## 7. `data-testid` encontrados (úteis pro E2E)

`button-skip-category`, `button-gabarito` — e provavelmente `start-btn` (home),
`button-timer`/`button-next-round`. Vou padronizar `data-testid` na reconstrução para o
teste Playwright.

---

## 8. Decisões / lacunas a validar com você (antes de codar)

1. **Fidelidade vs. melhoria**: reproduzo o protótipo **1:1** (sem placar, sem jogadores) ou
   adiciono os extras pedidos no escopo (Zustand store, localStorage de preferências/placar)?
   → Sugiro: **fiel ao fluxo**, mas com a infra pedida (Zustand, localStorage, shadcn) e
   **timer configurável** (ex.: 30/60/90s) como única melhoria de UX leve. Confirmar.
2. **Dataset**: vou **extrair as 510 categorias do bundle original** e versioná-las como
   `src/lib/game/categories.ts`. Confirmar que pode usar esse conteúdo (é seu).
3. **Pontuação/placar**: o escopo menciona `localStorage` para "placar". O protótipo não tem
   placar. Quer que eu **adicione um placar manual** (botões +1 por jogador) ou só persisto
   **preferências** (duração do timer)? → Sugiro começar só com preferências; placar opcional.
4. **Timer fixo vs. configurável**: protótipo = 60s fixo. Proponho expor seleção de duração.

---

## ✋ PARADA — aguardando sua aprovação

Conforme o Passo 1, **paro aqui**. Não escrevi nenhum código do projeto ainda
(só este `DISCOVERY.md`). Me responda as 4 perguntas do §8 (ou só diga "pode seguir,
fiel + extras de infra") e eu avanço para o **Passo 2 (setup do Next.js)**.
