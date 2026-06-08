# Build Reference — <LINGUAGEM/BUILD-TOOL>

🪶 LIDO SOB DEMANDA por Max. Comandos, classificação de erros e formato de
relatório. O **escopo** de Max (DevOps light) é igual em qualquer stack — só
mudam os comandos.

## Comandos (multiplataforma)

```bash
# Verificar versão da toolchain
<comando de --version>

# Instalar dependências
<comando>

# Compilar / type-check (se aplicável)
<comando>

# Rodar testes
<comando>

# Rodar testes com cobertura
<comando>

# Build de produção (artefato distribuível)
<comando>

# Lint
<comando>

# Format
<comando>

# Rodar localmente em modo dev
<comando>
```

## Classificação de erros de build

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| <pattern do erro> | <causa> | <Lucas/Renata/Max/usuário> |
| ... | ... | ... |

## Classificação de erros de teste

| Padrão | Diagnóstico | Quem corrige |
|--------|------------|-------------|
| <pattern> | <interpretação> | <Lucas/Sofia/Max> |

## Problemas comuns no ambiente

| Problema | Solução |
|---------|---------|
| <ex: faltando toolchain no PATH> | <solução> |
| ... | ... |

## CI — exemplo de workflow (GitHub Actions)

```yaml
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - <setup específico da linguagem>
      - run: <install>
      - run: <lint>
      - run: <test>
      - run: <build>
```

## Formato do relatório de build (Max usa em toda execução)

```markdown
## Build Report
Data: YYYY-MM-DD HH:MM
Comando: `<comando exato>`

### Resultado
✅ PASSOU | ❌ FALHOU

### Erros encontrados (se houver)
1. **Arquivo**: `<caminho>:<linha>`
   **Erro**: `<mensagem>`
   **Diagnóstico**: <interpretação>
   **Ação**: <quem corrige + o quê>

### Testes
- Total: X | Passaram: Y | Falharam: Z | Pulados: W
- Cobertura: X% (se a ferramenta gera)

### Próximo passo
<frase clara — o que destrava>
```
