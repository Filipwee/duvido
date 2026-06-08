# Plugins instalados no orquestrador

Esta pasta contém plugins externos integrados ao sistema de agentes.
Cada plugin é independente — pode ser atualizado, removido, ou substituído
sem afetar o núcleo do orquestrador.

## Plugins atuais

### `understand-anything/` (v2.7.5)

Plugin do projeto [Lum1104/Understand-Anything](https://github.com/Lum1104/Understand-Anything)
(MIT). Análise de codebases via pipeline multi-agente que constrói um grafo
de conhecimento navegável e dashboard interativo.

**Como o orquestrador o usa:**

- **Agente** `codebase-explorer` (Yara) em `.claude/agents/codebase-explorer.md`
- **Skill** `/explore-codebase` em `.claude/skills/explore-codebase/SKILL.md`
- **Hooks** (auto-update do grafo a cada commit) integrados em `.claude/settings.json`

**Comandos diretos do plugin** (Yara os opera, mas usuário também pode chamar
diretamente):

- `/understand` — pipeline completo
- `/understand-chat` — Q&A sobre o código
- `/understand-dashboard` — abrir dashboard web
- `/understand-diff` — análise de impacto de PR/diff
- `/understand-explain <alvo>` — deep-dive
- `/understand-domain` — fluxos de domínio de negócio
- `/understand-onboard` — guia de onboarding
- `/understand-knowledge` — análise de wikis Karpathy-pattern

**Output:** `.understand-anything/` no diretório do projeto sendo analisado
(não nesta pasta). Conteúdo:
- `knowledge-graph.json` — ✅ commitar
- `config.json`, `meta.json` — ✅ commitar
- `intermediate/`, `diff-overlay.json` — ❌ não commitar (locais)

**Build do plugin:** O plugin tem código TypeScript em `understand-anything/src/`
e `understand-anything/packages/core/`. Na primeira execução, a skill
`/understand` faz o build automaticamente (`pnpm install && pnpm build`).
Requer Node 20+ e pnpm no PATH.

**Documentação original:** ver `understand-anything-docs/` (README.md original,
CLAUDE.md do projeto, install.sh/ps1 do upstream, LICENSE).

**Licença:** MIT. Copyright (c) Lum1104. Veja
`understand-anything-docs/LICENSE`.

## Adicionar novo plugin

1. Coloque o conteúdo do plugin em `.claude/plugins/<nome>/`
2. Crie agente em `.claude/agents/<nome>-operator.md` que sabe como operar o plugin
3. Crie skill wrapper em `.claude/skills/<nome-friendly>/SKILL.md` para entrada padronizada
4. Atualize `.claude/settings.json` (permissões + hooks do plugin)
5. Documente em `CLAUDE.md` (raiz) na seção "Plugins instalados"
6. Adicione linhas relevantes ao orchestrator.md (Viktor) — quando acionar
7. Adicione tabela na cheatsheet
