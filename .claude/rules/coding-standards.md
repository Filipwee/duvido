# Coding Standards — Universais

🪶 CARREGADO EM TODA SESSÃO. Mantido enxuto de propósito.

Regras agnósticas de linguagem. Convenções específicas (nomenclatura, limites
de linhas, ferramenta de format) vivem em `.claude/stacks/<active>/language-rules.md`.

## Regras universais de código

- **Zero** campos públicos mutáveis — sempre encapsulado, conforme idiom do stack
- **Zero** `print`/`System.out`/`console.log`/`fmt.Println` em código de produção — use o logger estruturado do stack
- **Zero** SQL string-concatenado — sempre bind params, query builder ou ORM
- **Zero** credenciais hardcoded — sempre via env/secret store
- **Zero** chamadas a serviços externos sem timeout
- **Zero** TODO/FIXME sem autor + data + contexto: `// TODO(lucas, 2026-06-15): trocar por X após Y`
- **Zero** código morto (imports não usados, branches mortos, comentário-código)
- **Zero** magic number/string sem constante ou enum nomeado
- **Zero** boolean trap (vários booleans em assinatura — use objeto/options)

Os limites quantitativos (máximo de linhas por função/método, máximo de
parâmetros, máximo de linhas por arquivo) ficam em
`stacks/<active>/language-rules.md` porque variam por linguagem (Go é mais
verboso por design, Python é mais conciso, etc.).

## Estrutura — Package by Feature (universal)

Quando o projeto tem > 5 features, organize por **feature**, não por **camada**:

```
src/
  transaction/                  ← feature
    (controller/handler/router) ← entrada HTTP
    service                     ← lógica
    repository                  ← persistência
    model                       ← entidades/DTOs
    *.test                      ← testes ao lado
  user/                         ← outra feature
  shared/                       ← componentes transversais
    exception/error
    config
    security
```

A extensão dos arquivos e a sintaxe da árvore dependem da linguagem (ver
`stacks/<active>/scaffold-reference.md`). O **princípio** é o mesmo.

## Tratamento de erro — princípio universal

- Lance/retorne erros com contexto (id, chave, operação)
- Preserve a causa original ao envelopar (`cause`, `%w`, `from err`)
- Logue erro **com a causa anexada** (stack trace ou objeto `err`)
- Nunca exponha stack trace ao cliente
- Nunca engula erro silenciosamente

Detalhes em `wisdom/error-handling.md`. Implementação idiomática em
`stacks/<active>/patterns.md`.

## Format de log estruturado

Independentemente da linguagem, o log estruturado segue o mesmo princípio:

```
chave-valor com campos consistentes (id, usuário, operação, latência)
nível claro (INFO operação normal, WARN degradação, ERROR falha)
sem PII (CPF, email completo, token, senha)
em produção: JSON; em desenvolvimento: legível por humano
```

A ferramenta varia (SLF4J + Logback em Java, structlog/python-json-logger em
Python, pino em Node, slog em Go) — o formato chave-valor + sem PII é
universal.

## Versionamento de API

- Versão na URL: `/api/v1/recurso`
- Nunca quebra contrato de v1 — cria v2 se necessário
- Marca endpoint deprecado antes de remover (anotação/header/OpenAPI)
- Documenta breaking changes no CHANGELOG

## Migrations (banco de dados)

- Migrations são **imutáveis** uma vez mergeadas — nunca edite migration aplicada
- Sempre tem direção `up` e (quando possível) `down`
- Nome com data/ordem + descrição: `001_create_transactions_table.sql`
- Test database recria migrations do zero a cada CI

## Multiplataforma (Windows/Linux/macOS)

- `.gitattributes` com `* text=auto eol=lf` em todo projeto
- Encoding UTF-8 default (declarado no manifesto de build quando possível)
- Paths via API do stack (`pathlib.Path`, `path.join`, `Path.of`), não string concat
- Scripts cross-platform quando viável (Node, Python, Go) > scripts shell específicos
