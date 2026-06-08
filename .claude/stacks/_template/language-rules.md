# Regras de Linguagem — <LINGUAGEM>

🪶 LIDO SOB DEMANDA por agentes técnicos. Convenções da linguagem que valem
para todo código novo do projeto.

## Versão e features obrigatórias

(Versão mínima + features que devemos usar — ex: pattern matching, async/await,
generics, records, etc.)

## Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tipo público | <ex: PascalCase> | `TransactionService` |
| Função/método | <ex: snake_case ou camelCase> | `find_by_id` ou `findById` |
| Constante | <ex: SCREAMING_SNAKE> | `MAX_RETRIES` |
| Arquivo de módulo | <ex: snake_case.ext> | `transaction_service.py` |
| Diretório/pacote | <ex: lowercase, sem hífen> | `transactions` |

## Estrutura de módulos / pacotes

(Por feature? Por camada? Mostre a estrutura padrão.)

## Regras de código (limites duros)

- Máximo **<N>** linhas por função/método
- Máximo **<N>** linhas por arquivo/classe
- Máximo **<N>** parâmetros por função (use objeto/dataclass se mais)
- **Zero** <coisas proibidas — ex: `any`, `null` solto, SQL string, logging sem contexto>

## Formato de log estruturado

(Mostre o padrão da linguagem — `slog`, `logging`, `winston`, `slf4j`, etc.)

## Tratamento de erro

(Mostre o padrão idiomático — exception hierarchy, `Result<T, E>`, multiple return,
panic vs recoverable, etc.)

## Versionamento de API (se for API)

(URL? Header? Como deprecar?)

## Estilo de imports

(Ordem de imports, alias, absolute vs relative.)

## Diferenças importantes vs outras linguagens populares

(Tabela curta — ajuda quem vem de outro ecossistema. Opcional.)
