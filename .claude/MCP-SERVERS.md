# MCP Servers — Multi-Stack Orchestrator

MCP (Model Context Protocol) conecta o Claude Code a sistemas externos.
Cada agente pode usar MCPs específicos para acessar dados reais.

> **Importante**: MCP **não substitui** ferramentas nativas (Read, Write, Bash).
> Ele adiciona acesso a serviços externos.

## MCPs úteis para projetos backend (qualquer linguagem)

| Agente | MCP | Para quê |
|--------|-----|---------|
| `reviewer` | github | Ler PRs, comentar diretamente |
| `context` | notion / confluence | Sincronizar docs de arquitetura |
| `build` | github (Actions) | Ver status de CI/CD |
| `coder` | postgres-mcp | Inspecionar schema real antes de gerar Entity |
| `tester` | github | Ver issues relacionados a testes |

## Como adicionar (no Claude Code — Windows)

```bash
# PostgreSQL
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb

# GitHub
claude mcp add github -- npx -y @modelcontextprotocol/server-github

# Notion
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

## Verificar ativos
```
/mcp
```

## Segurança
- Nunca conectar MCP com acesso de escrita ao banco de produção
- Tokens em variáveis de ambiente (`%GITHUB_TOKEN%` no Windows)
- Nunca commitar tokens — usar `.env` (já no .gitignore)

## Próxima iteração
Quando o projeto real estiver definido, listar aqui os MCPs efetivamente conectados.
