# Build Reference — Java / Maven

🪶 LIDO SOB DEMANDA por Max. Comandos, classificação de erros e formato de
relatório. O escopo de papel (DevOps light, limites) está em `agents/build.md`.

## Comandos (multiplataforma — funciona em Windows, Linux, macOS)

```bash
# Verificar versão da toolchain
mvn --version
java -version

# Instalar dependências (sem rodar testes)
mvn -q -DskipTests dependency:go-offline

# Compilar apenas
mvn compile

# Rodar testes
mvn test

# Build completo (compile + test + package)
mvn package

# Build sem testes (só quando necessário p/ debug)
mvn package -DskipTests

# Forçar atualização de dependências
mvn package -U

# Limpar e rebuildar
mvn clean package

# Rodar teste específico
mvn test -Dtest=NomeClasseTest

# Ver árvore de dependências
mvn dependency:tree

# Verificar conflitos de versão
mvn dependency:tree -Dverbose

# Rodar localmente (Spring Boot)
mvn spring-boot:run

# Format (Spotless)
mvn spotless:apply

# Cobertura (JaCoCo)
mvn test jacoco:report
```

> **Windows**: se `mvn` não for encontrado, usar caminho completo:
> `%MAVEN_HOME%\bin\mvn.cmd` ou adicionar `MAVEN_HOME\bin` ao PATH.

## Classificação de erros de compilação

| Mensagem | Causa | Quem corrige |
|----------|-------|-------------|
| `cannot find symbol` | Classe não importada ou não existe | Lucas |
| `method X not found` | Interface mudou ou typo | Lucas |
| `incompatible types` | Tipo errado atribuído | Lucas |
| `variable might not have been initialized` | Missing init | Lucas |
| Plugin ou dependency error em `pom.xml` | Config errada | Max mesmo |
| `JAVA_HOME is not set` | Variável de ambiente | Usuário (reportar) |
| `Lombok não processa` | annotationProcessorPaths ausente | Max corrige `pom.xml` |
| `MapStruct não gera` | Ordem dos processors errada (Lombok antes) | Max corrige `pom.xml` |

## Classificação de erros de teste

| Padrão | Diagnóstico | Quem corrige |
|--------|------------|-------------|
| `AssertionError` | Comportamento inesperado | Lucas ou Sofia |
| `NullPointerException` no teste | Mock não configurado | Sofia |
| `BeanCreationException` | Config de Spring errada | Lucas |
| `DataAccessException` | Schema desatualizado | Lucas |
| `Connection refused` | Banco não disponível | Usar H2 (Max/Sofia) |
| `ProxyInitializationException` | `@Data` em entity com lazy | Lucas |

## Problemas comuns no ambiente

| Problema | Solução |
|---------|---------|
| `Could not transfer artifact` | Verificar proxy: `mvn -Dhttps.proxyHost=... package` |
| `Encoding ISO-8859-1` nos warnings | `-Dfile.encoding=UTF-8` ou no `pom.xml` |
| Lombok não processa | Verificar `annotationProcessorPaths` no `maven-compiler-plugin` |
| MapStruct não gera | Ordem em `annotationProcessorPaths`: Lombok ANTES de MapStruct |
| Porta 8080 ocupada | `server.port=0` em `application-test.yml`, ou matar processo |

## CI — exemplo de workflow (GitHub Actions)

```yaml
name: ci
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
      - run: mvn -B verify
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: jacoco-report
          path: target/site/jacoco/
```

## Formato do relatório de build (Max usa em toda execução)

```markdown
## Build Report
Data: YYYY-MM-DD HH:MM
Comando: `mvn clean package`

### Resultado
❌ FALHOU | ✅ PASSOU

### Erros encontrados
1. **Arquivo**: `src/main/java/.../NomeClasse.java:42`
   **Erro**: `cannot find symbol: class NomeDto`
   **Diagnóstico**: NomeDto não foi criado ou está no pacote errado
   **Ação**: Acionar Lucas para criar/mover NomeDto

### Testes
- Total: X | Passaram: Y | Falharam: Z | Pulados: W
- Cobertura: X% (se JaCoCo configurado)

### Próximo passo
<o que destrava>
```

## Regras invioláveis (estendem o universal de Max)

- Nunca usa `-DskipTests` em build final — só durante debug
- Nunca altera `pom.xml` de produção sem acionar Otávio
- Sempre roda `mvn clean` antes de diagnosticar erro de classpath
- Reporta cobertura quando disponível — não apenas pass/fail
- Notifica Nina ao detectar vulnerabilidade Alta/Crítica em dependência
