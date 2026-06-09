# Dashboard do Projeto
Atualizado: 2026-06-08

## Status geral
🟢 Em produção: https://duvido.fun (Vercel, deploy automático na `main`).
Repo: https://github.com/Filipwee/duvido (MIT).

## Projeto ativo
- **Nome:** jogo-do-duvido (facilitador de jogo de festa presencial)
- **Stack ativo:** nextjs (Next.js 16 App Router / React 19 / Tailwind v4 / shadcn)
- **Perfil:** prototype
- **Modo:** lean
- **Deploy alvo:** Vercel (client-side only)

## Feature em andamento
(nenhuma — fluxo base completo; aguardando próximo pedido)

## Últimas 5 entregas
- Camada de domínio: tipos + 510 categorias + lógica de sorteio (commit 92e2a67)
- 4 telas do jogo (home/reveal/timer/gabarito) + store Zustand persistida
- DS-001 — Design Spec do fluxo (Helena)
- 19 testes unitários (domínio + store) + 2 smoke E2E Playwright
- Metadata "Duvido!" no lugar do boilerplate

## Métricas
- Build: ✅ `next build` verde
- Testes: ✅ 19 unit + 2 E2E
- Tasks fechadas: 2 (domínio, frontend)
- Tasks abertas: 0

## Próximo passo prático
Próximo pedido do usuário. Candidatos: deploy na Vercel (`/deploy`), polimento visual
(tema festivo), ou novas categorias.
