# Anti-Patterns — Java / Spring Boot

🪶 LIDO SOB DEMANDA por Lucas (escrever) e Otávio (revisar).

> Universais (God Class, Magic String, Catch and Ignore, Boolean Trap) vivem
> em `rules/wisdom/anti-patterns.md`. Aqui apenas o que é específico de Java/Spring.

## N+1 Query (Hibernate)

```java
// ❌ Dispara 1 query para usuários + N queries para pedidos
List<User> users = userRepository.findAll();
for (User user : users) {
    int orderCount = user.getOrders().size();  // query por usuário!
}

// ✅ Uma query com JOIN FETCH
@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.active = true")
List<User> findActiveUsersWithOrders();
```

## Anemic Domain Model

```java
// ❌ Entity sem comportamento — só getters/setters
// Toda lógica fica espalhada em services
public class Order {
    private OrderStatus status;
    // só getters e setters...
}
// Service precisa saber que status DELIVERED não pode ser cancelado
if (order.getStatus() != DELIVERED && order.getStatus() != CANCELLED) {
    order.setStatus(CANCELLED);
}

// ✅ Comportamento onde faz sentido
public class Order {
    private OrderStatus status;

    public void cancel() {
        if (status == DELIVERED)
            throw new BusinessRuleException("Pedido entregue não pode ser cancelado");
        if (status == CANCELLED)
            throw new BusinessRuleException("Pedido já cancelado");
        this.status = CANCELLED;
    }
}
```

## Transaction Too Long

```java
// ❌ Abre transação e faz chamada externa dentro
@Transactional
public void processPayment(Payment payment) {
    repository.save(payment);
    externalPaymentGateway.charge(payment);  // pode demorar 5s ou falhar
    emailService.send(payment);              // não transacional
}

// ✅ Separa o que é transacional do que não é
@Transactional
public Payment persistPayment(Payment payment) {
    return repository.save(payment);
}

public void processPayment(PaymentRequest request) {
    Payment payment = persistPayment(toEntity(request));  // transação curta
    gatewayService.charge(payment);                       // fora da transação
    emailService.notifySuccess(payment);
}
```

## `@Transactional` em método privado (self-invocation)

```java
// ❌ Chamada do próprio bean — proxy do Spring não intercepta
@Service
public class OrderService {
    public void publicMethod() {
        privateMethod();  // chama via `this`, não via proxy → @Transactional ignorado
    }
    @Transactional
    private void privateMethod() { /* ... */ }
}

// ✅ Extrai para outro bean ou torna público + chama via proxy injetado
```

## Field injection com `@Autowired`

```java
// ❌ Não testável sem reflection, esconde dependências, NPE em test sem Spring context
@Service
public class TransactionService {
    @Autowired private TransactionRepository repo;
    @Autowired private NotificationService notifier;
}

// ✅ Construtor + @RequiredArgsConstructor — dependências explícitas, mockáveis
@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository repo;
    private final NotificationService notifier;
}
```

## `@Data` em `@Entity`

```java
// ❌ @Data gera equals/hashCode usando TODOS os campos, incluindo lazy collections
// → carrega tudo, ProxyInitializationException, comparações erradas
@Entity
@Data
public class User {
    @Id private UUID id;
    @OneToMany private List<Order> orders;
}

// ✅ Explícito — só id no equals/hashCode
@Entity
@Getter @Setter @NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {
    @Id @EqualsAndHashCode.Include
    private UUID id;
    @OneToMany private List<Order> orders;
}
```

## `Optional` em campo ou parâmetro

```java
// ❌ Optional foi desenhado para tipo de retorno
public class User {
    private Optional<String> email;  // ruim — campo
}
public void save(Optional<User> user) { /* ... */ }  // ruim — parâmetro

// ✅ Optional só em retorno; null + @Nullable ou overload para o resto
public Optional<User> findById(UUID id) { /* ... */ }
```

## `new BigDecimal(double)`

```java
// ❌ Imprecisão herdada do double
new BigDecimal(0.1)  // → 0.1000000000000000055511151231257827021181583404541015625

// ✅
BigDecimal.valueOf(0.1)   // → 0.1
new BigDecimal("0.1")     // → 0.1
```

## `findAll()` sem paginação em endpoint público

```java
// ❌ Lista cresce sem limite — OOM ou timeout em produção
@GetMapping
public List<Transaction> list() {
    return service.findAll();
}

// ✅ Paginação sempre
@GetMapping
public Page<Transaction> list(@PageableDefault(size = 20) Pageable pageable) {
    return service.findAll(pageable);
}
```

## Logging de PII (CPF, senha, token, e-mail completo)

```java
// ❌ Bloqueador de segurança (LGPD/GDPR)
log.info("Login: cpf={}, senha={}", user.getCpf(), password);

// ✅ Mascarar / não logar
log.info("Login: cpfHash={}", hash(user.getCpf()));  // sem senha jamais
```
