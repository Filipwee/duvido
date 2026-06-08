# Regras de Linguagem — Java 17+ / Spring Boot 3.x

🪶 LIDO SOB DEMANDA por agentes técnicos.

## Versão e features obrigatórias

Java 17 LTS — use os recursos modernos:

```java
// ✅ Records para DTOs
public record TransactionRequest(
    @NotBlank String description,
    @NotNull BigDecimal amount
) {}

// ✅ Pattern matching instanceof
if (obj instanceof String s) {
    return s.toUpperCase();
}

// ✅ Switch expression
String label = switch (status) {
    case PENDING -> "Pendente";
    case APPROVED -> "Aprovado";
    case REJECTED -> "Rejeitado";
};

// ✅ Text blocks para SQL/JSON longos
String query = """
    SELECT t FROM Transaction t
    WHERE t.userId = :userId
    AND t.status = :status
    ORDER BY t.createdAt DESC
    """;

// ✅ var para variáveis locais óbvias
var transactions = repository.findAll();
```

## Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Classe | PascalCase | `TransactionService` |
| Interface | PascalCase (sem `I`) | `TransactionRepository` |
| Método | camelCase, verbo | `findByUserId`, `calculateTotal` |
| Variável | camelCase | `totalAmount` |
| Constante | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Pacote | lowercase, sem hífen | `com.example.transaction` |
| Enum | PascalCase, valor SCREAMING | `TransactionStatus.PENDING` |

## Estrutura de pacotes

Organização **por feature** (não por camada) quando > 5 features:

```
com.example.app/
  transaction/          ← feature
    TransactionController.java
    TransactionService.java
    TransactionRepository.java
    Transaction.java
    TransactionRequest.java
    TransactionResponse.java
  user/                 ← feature
    ...
  shared/               ← componentes transversais
    exception/
    config/
    security/
```

## Regras de código (limites duros)

- Máximo **20 linhas** por método (extraia se maior)
- Máximo **200 linhas** por classe (divida se maior)
- Máximo **4 parâmetros** por método (use objeto se mais)
- **Zero** campos `public` mutáveis — sempre encapsulado
- **Zero** `System.out` — use SLF4J com `@Slf4j`
- **Zero** `@Autowired` em campo — sempre construtor (`@RequiredArgsConstructor`)
- **Zero** SQL raw concatenado — JPQL ou Criteria API

## Spring Boot 3.x — convenções obrigatórias

```java
// SecurityConfig — não usa WebSecurityConfigurerAdapter (deprecado)
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

## JPA / Hibernate

```java
// ✅ JPQL com parâmetros nomeados
@Query("SELECT t FROM Transaction t WHERE t.userId = :userId AND t.status = :status")
Page<Transaction> findByUserIdAndStatus(
    @Param("userId") UUID userId,
    @Param("status") TransactionStatus status,
    Pageable pageable
);

// ✅ Projection para evitar carregar entidade completa
public interface TransactionSummary {
    UUID getId();
    String getDescription();
    BigDecimal getAmount();
}

// ✅ Fetch join para evitar N+1
@Query("SELECT u FROM User u JOIN FETCH u.transactions WHERE u.id = :id")
Optional<User> findByIdWithTransactions(@Param("id") UUID id);
```

## Lombok — anotações permitidas

```java
@Getter @Setter         // ✅ em entities
@NoArgsConstructor      // ✅ obrigatório em @Entity
@AllArgsConstructor     // ✅ em testes
@RequiredArgsConstructor // ✅ em services (injeta final fields)
@Builder                // ✅ em test builders
@Slf4j                  // ✅ em qualquer classe com log
@Data                   // ⚠️ cuidado em @Entity (equals/hashCode problemático)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)  // ✅ em @Entity
```

## BigDecimal — regras obrigatórias

```java
// ✅ Monetário sempre BigDecimal, nunca double/float
private BigDecimal amount;

// ✅ Comparação
amount.compareTo(BigDecimal.ZERO) > 0

// ✅ Operações com escala definida
amount.multiply(rate).setScale(2, RoundingMode.HALF_UP)

// ❌ Nunca
new BigDecimal(0.1)  // impreciso — use BigDecimal.valueOf(0.1) ou "0.1"
```

## Validação — Bean Validation

```java
public record TransactionRequest(
    @NotBlank(message = "descrição é obrigatória")
    @Size(max = 200, message = "máximo 200 caracteres")
    String description,

    @NotNull(message = "valor é obrigatório")
    @Positive(message = "valor deve ser positivo")
    @Digits(integer = 10, fraction = 2)
    BigDecimal amount,

    @NotNull
    @PastOrPresent(message = "data não pode ser futura")
    LocalDate transactionDate
) {}
```

## Flyway — migrações de banco

```
src/main/resources/db/migration/
  V1__create_users_table.sql
  V2__create_transactions_table.sql
  V3__add_index_transaction_user_id.sql
```

Regras:
- Nunca alterar migration já executada — crie nova
- Nomenclatura: `V{número}__{descricao_snake_case}.sql`
- Sempre inclui `NOT NULL` e defaults onde possível

## Format de log

```java
log.info("Transação criada: id={}, usuário={}", transacao.getId(), userId);
log.warn("Tentativa {} de {} falhou: {}", tentativa, maxTentativas, motivo);
log.error("Erro ao processar transação id={}", id, ex);  // ex como último arg
```

## Versionamento de API

- Versão na URL: `/api/v1/recurso`
- Nunca quebra contrato de v1 — cria v2 se necessário
- `@Deprecated` em endpoint obsoleto antes de remover

## Windows: cuidados específicos

- `File.separator` em vez de `/` hardcoded ao construir paths
- `Charset.forName("UTF-8")` explícito em `new FileReader/Writer`
- Evitar `ProcessBuilder` com comandos Unix — usar equivalente Java puro
