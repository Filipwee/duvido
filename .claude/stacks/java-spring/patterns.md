# Padrões — Java / Spring Boot

🪶 LIDO SOB DEMANDA por Lucas (escrever) e Otávio (revisar).

> Princípios universais (SOLID, Clean Code) vivem em `rules/wisdom/`. Este arquivo é específico do ecossistema Spring.
## Repository Pattern

```java
// Interface — define o contrato
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Método derivado — Spring Data gera a query
    List<Transaction> findByUserIdAndStatus(UUID userId, TransactionStatus status);

    // JPQL para queries mais complexas
    @Query("""
        SELECT t FROM Transaction t
        WHERE t.userId = :userId
          AND t.transactionDate BETWEEN :start AND :end
        ORDER BY t.transactionDate DESC
        """)
    Page<Transaction> findByUserIdAndDateRange(
        @Param("userId") UUID userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        Pageable pageable
    );

    // Projection para evitar carregar entidade completa
    @Query("SELECT t.id as id, t.description as description, t.amount as amount FROM Transaction t WHERE t.userId = :userId")
    List<TransactionSummary> findSummariesByUserId(@Param("userId") UUID userId);
}
```

## Service Pattern (interface + impl)

```java
// Sempre interface pública — facilita mock em testes
public interface TransactionService {
    TransactionResponse create(TransactionRequest request);
    TransactionResponse findById(UUID id);
    Page<TransactionResponse> listByUser(UUID userId, Pageable pageable);
    TransactionResponse update(UUID id, TransactionRequest request);
    void delete(UUID id);
}

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)  // padrão read-only, sobrescreve onde escreve
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository repository;
    private final TransactionMapper mapper;

    @Override
    @Transactional  // sobrescreve para escrita
    public TransactionResponse create(TransactionRequest request) {
        log.info("Criando transação para usuário={}", request.userId());
        Transaction entity = mapper.toEntity(request);
        Transaction saved = repository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    public TransactionResponse findById(UUID id) {
        return repository.findById(id)
            .map(mapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Transação: " + id));
    }
}
```

## Builder para objetos de teste

```java
// Em testes — builder estático via Lombok
@Builder
public class TransactionTestBuilder {
    @Builder.Default UUID id = UUID.randomUUID();
    @Builder.Default UUID userId = UUID.randomUUID();
    @Builder.Default String description = "Compra teste";
    @Builder.Default BigDecimal amount = BigDecimal.valueOf(100.00);
    @Builder.Default TransactionStatus status = TransactionStatus.PENDING;
    @Builder.Default LocalDate transactionDate = LocalDate.now();

    public Transaction build() { ... }
}

// Uso no teste
Transaction tx = TransactionTestBuilder.builder()
    .amount(BigDecimal.valueOf(500))
    .status(TransactionStatus.APPROVED)
    .build();
```

## Strategy Pattern — quando há variações de algoritmo

```java
// Útil para: cálculo de desconto, categorização, cobrança por tipo
public interface TransactionCategorizer {
    TransactionCategory categorize(String description);
}

@Component("keywordCategorizer")
public class KeywordCategorizer implements TransactionCategorizer {
    @Override
    public TransactionCategory categorize(String description) {
        String lower = description.toLowerCase();
        if (lower.contains("supermercado") || lower.contains("mercado"))
            return TransactionCategory.FOOD;
        if (lower.contains("farmácia") || lower.contains("drogaria"))
            return TransactionCategory.HEALTH;
        return TransactionCategory.OTHER;
    }
}
```

## Pagination padrão

```java
// Controller — sempre expõe paginação em listagens
@GetMapping
public Page<TransactionResponse> list(
    @RequestParam UUID userId,
    @PageableDefault(size = 20, sort = "createdAt", direction = DESC) Pageable pageable
) {
    return service.listByUser(userId, pageable);
}
```

## Specification Pattern — filtros dinâmicos

```java
// Quando há múltiplos filtros opcionais
public class TransactionSpecification {

    public static Specification<Transaction> byUserId(UUID userId) {
        return (root, query, cb) -> userId == null ? null
            : cb.equal(root.get("userId"), userId);
    }

    public static Specification<Transaction> byStatus(TransactionStatus status) {
        return (root, query, cb) -> status == null ? null
            : cb.equal(root.get("status"), status);
    }

    public static Specification<Transaction> afterDate(LocalDate from) {
        return (root, query, cb) -> from == null ? null
            : cb.greaterThanOrEqualTo(root.get("transactionDate"), from);
    }
}

// Uso
repository.findAll(
    where(byUserId(userId))
        .and(byStatus(status))
        .and(afterDate(from)),
    pageable
);
```
