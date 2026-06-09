# Duvido! 🎉

Facilitador do **Jogo do Duvido** para festas presenciais. O app sorteia uma
categoria, cria suspense, roda um timer cheio de drama e revela o gabarito —
toda a brincadeira social (dizer as respostas em voz alta e gritar **"DUVIDO!"**)
acontece offline, entre os jogadores. Um único celular, passado de mão em mão.

## Como se joga

1. **Sorteie** uma categoria (são 510, de capitais a craques de futebol).
2. Curta o **suspense** da revelação.
3. Inicie o **timer** — tic-tac a cada segundo, tensão crescente nos últimos
   15s e um grande **"triiimm"** no fim.
4. Confira o **gabarito** oficial com confete e parta pra próxima.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** · **framer-motion** (animações) · **Zustand** (estado)
- Áudio sintetizado via **Web Audio API** (sem assets binários)
- 100% client-side — preferências (duração do timer e som) salvas em `localStorage`
- Testes: **Vitest** + Testing Library (unit) e **Playwright** (E2E)

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts úteis

| Comando         | O que faz                           |
| --------------- | ----------------------------------- |
| `npm run dev`   | Servidor de desenvolvimento         |
| `npm run build` | Build de produção                   |
| `npm run check` | Lint + typecheck + testes unitários |
| `npm run test`  | Testes unitários (Vitest)           |
| `npm run e2e`   | Testes end-to-end (Playwright)      |

> Primeira vez rodando E2E numa máquina nova: `npm run e2e:install` (baixa o Chromium).

## Deploy

Configurado para **Vercel**: deploy automático a cada push na `main` e preview
por pull request.
