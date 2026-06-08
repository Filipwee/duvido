# Skeletons de Código — Java / Spring Boot

🪶 LIDO SOB DEMANDA por Lucas (coder). Padrões obrigatórios de implementação.
Complementa `language-rules.md` (recursos da linguagem), `patterns.md` (padrões
em escala) e `anti-patterns.md` (footguns).
`rules/wisdom/error-handling.md` (hierarquia de exceção).

## Padrões obrigatórios

### Entity
```java
@Entity
@Table(name = "nome_tabela")
@Getter @Setter @NoArgsConstructor
public class NomeEntidade {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String campo;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### Service (interface + impl)
```java
public interface NomeService {
    NomeResponse criar(NomeRequest request);
    NomeResponse buscarPorId(UUID id);
    Page<NomeResponse> listar(Pageable pageable);
    NomeResponse atualizar(UUID id, NomeRequest request);
    void deletar(UUID id);
}
```

### Controller
```java
@RestController
@RequestMapping("/api/v1/recurso")
@RequiredArgsConstructor
@Validated
public class NomeController {
    private final NomeService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NomeResponse criar(@Valid @RequestBody NomeRequest request) {
        return service.criar(request);
    }
}
```

### Exception handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return ErrorResponse.of(ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        // extrai mensagens dos campos
    }
}
```

### DTO como Record (Java 17+)
```java
public record NomeRequest(
    @NotBlank(message = "campo é obrigatório")
    @Size(max = 100)
    String campo,

    @NotNull
    BigDecimal valor
) {}
```

## Mapeamento DTO ↔ Entity

Usar **MapStruct** (não manual, não ModelMapper):
```java
@Mapper(componentModel = "spring")
public interface NomeMapper {
    NomeResponse toResponse(NomeEntidade entity);
    NomeEntidade toEntity(NomeRequest request);
}
```
