---
name: run-build
description: Executa build no tooling do stack ativo (Maven/Gradle/npm/Poetry/go build/cargo/etc.) e interpreta resultado. Aciona Max. Loop automático de correção com Lucas se houver erro. Use quando o usuário quer compilar, testar ou empacotar o projeto.
---

# Run Build

## Passo a passo

### 1. Acionar Max (build)
Max lê:
- `.claude/project-profile.md` → `commands.build` e `commands.test`
- `.claude/stacks/<active>/build-reference.md` → comandos exatos do stack

Comandos típicos por stack (referência rápida):
- **java-spring**: `mvn clean package` (build), `mvn test` (testes), `mvn compile`
- **python-fastapi**: `poetry run pytest` (testes), `poetry build` (pacote)
- **node-typescript**: `npm run build`, `npm run test -- --run`
- **typescript-react**: `npm run build`, `npm run test -- --run`, `npm run typecheck`
- **go**: `go build ./...`, `go test -race -cover ./...`

Para projetos full-stack (múltiplos `active_stacks`), Max executa os builds
em ordem e agrega o relatório.

### 2. Se build verde
Reporta ao usuário: ✅ BUILD OK — X testes passando, cobertura Y%

### 3. Se erro de compilação/typecheck
Max diagnostica usando a tabela de classificação em
`stacks/<active>/build-reference.md` → aciona Lucas/Renata com contexto preciso
(arquivo:linha + mensagem + diagnóstico).
Lucas/Renata corrige → Max roda novamente.
Máximo 3 ciclos.

### 4. Se falha de teste
Max classifica: bug no código (Lucas/Renata) | teste frágil (Sofia) | config (Max).
Aciona o responsável, repete.

### 5. Se não resolve em 3 ciclos
Viktor reporta ao usuário com diagnóstico completo.

## Critério de pronto
- [ ] Build verde (zero erros, zero falhas de teste)
- [ ] Cobertura ≥ threshold do stack (ver `stacks/<active>/test-skeletons.md`)
- [ ] Usuário informado do resultado
