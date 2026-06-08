---
name: refactor-code
description: Refatora código preservando comportamento. Aciona Sergio (se a mudança é estrutural/multi-módulo → ADR), garante rede de testes via Sofia ANTES de tocar o código, executa com Lucas/Renata em passos pequenos, valida com Max (testes verdes) e revisa com Otávio. Use quando o usuário pede "refatorar X", "reduzir complexidade", "extrair", "renomear", "limpar", "tirar dívida técnica".
---

# Refactor Code

Refatorar = mudar a estrutura **sem mudar o comportamento externo**. A regra de
ouro sênior: nunca refatore sem rede de testes que prove que o comportamento não
mudou.

## Argumento esperado
Classe, pacote, componente ou área alvo (via $ARGUMENTS). Se vazio, usa o diff do
branch atual ou pergunta ao usuário o que incomoda.

## Passo a passo (Viktor orquestra)

### 1. Classificar o refactor (local vs estrutural)
Viktor (heurística "qual papel resolve isso?"):
- **Local** (dentro de uma classe/componente: extrair método, renomear, simplificar branch) → pula Sergio, vai direto a Lucas/Renata.
- **Estrutural** (troca de padrão, move responsabilidade entre módulos, toca 2+ pacotes, muda contrato) → **Sergio primeiro**. Se a decisão sobrevive à feature, vira ADR (`adr-template.md`).

### 2. Garantir rede de testes ANTES (Sofia)
Sofia confirma que existe teste cobrindo o comportamento atual da área.
- Se **não** há → Sofia escreve testes de caracterização (capturam o comportamento que existe hoje, mesmo que feio) e roda para confirmar verde **antes** de qualquer mudança.
- Sem essa rede, o refactor não começa — é o item que evita regressão silenciosa.

### 3. Executar em passos pequenos (Lucas / Renata)
- Lucas (backend) ou Renata (frontend) aplica o refactor em incrementos pequenos e reversíveis.
- Respeita os limites do projeto: método ≤ 20 linhas, classe ≤ 200 linhas, componente ≤ 200 linhas (ver `coding-standards.md`).
- **Nenhuma mudança de comportamento** — se aparecer necessidade de mudar comportamento, vira outra task (feature/bug), não refactor.

### 4. Validar (Max)
comando de teste do stack ativo. Os testes
pré-existentes + de caracterização **continuam verdes**. Build verde.
Loop de correção com Lucas/Renata — máximo 3 ciclos, depois escala.

### 5. Revisar (Otávio)
Otávio verifica: comportamento externo idêntico, complexidade reduzida de fato,
nenhum método/classe novo acima do limite, sem dívida nova introduzida.
Veredito explícito.

### 6. Registrar e reportar
- Se foi estrutural: Sergio fechou ADR; Iris linka em `architecture.md`.
- Viktor reporta: o que mudou, por que está mais simples, testes verdes, veredito.

## Critério de pronto desta skill
- [ ] Comportamento externo idêntico (testes pré-existentes/caracterização passam)
- [ ] Nenhum método novo > 20 linhas; nenhuma classe/componente novo > 200 linhas
- [ ] build + testes do stack ativo verdes
- [ ] Otávio aprovou (ou aprovou com ressalvas resolvidas)
- [ ] ADR criado se a decisão foi arquitetural
