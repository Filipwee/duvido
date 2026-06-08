# Skeletons de Teste — Java / JUnit 5

🪶 LIDO SOB DEMANDA por Sofia. Complementa `rules/wisdom/testing.md`
(princípios F.I.R.S.T, Given-When-Then).

## Test framework

- **Framework**: JUnit 5 (Jupiter)
- **Mocks**: Mockito
- **Assertions**: AssertJ (preferido sobre `org.junit.jupiter.api.Assertions`)
- **HTTP slice**: Spring MockMvc (`@WebMvcTest`)
- **DB slice**: `@DataJpaTest` + H2 ou Testcontainers
- **Integração**: `@SpringBootTest` (cuidado — lento)
- **Fixtures**: Builder pattern (Lombok `@Builder`) ou Test Data Builder dedicado

## Pirâmide de testes — o que Sofia escreve

### Unitários (maioria — rápidos, isolados)

```java
@ExtendWith(MockitoExtension.class)
class NomeServiceTest {

    @Mock
    private NomeRepository repository;

    @Mock
    private NomeMapper mapper;

    @InjectMocks
    private NomeServiceImpl service;

    @Test
    @DisplayName("deve lançar NotFoundException quando recurso não encontrado")
    void deveRetornarNotFoundQuandoNaoExiste() {
        // Given
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> service.buscarPorId(id))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining(id.toString());
    }
}
```

### Slice — Controller (`@WebMvcTest`)

```java
@WebMvcTest(NomeController.class)
class NomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NomeService service;

    @Test
    @DisplayName("POST /api/v1/recurso deve retornar 201 com body válido")
    void deveCriarRecursoComSucesso() throws Exception {
        // Given
        NomeRequest request = new NomeRequest("valor", BigDecimal.TEN);
        NomeResponse response = new NomeResponse(UUID.randomUUID(), "valor");
        when(service.criar(any())).thenReturn(response);

        // When / Then
        mockMvc.perform(post("/api/v1/recurso")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.campo").value("valor"));
    }
}
```

### Slice — Repository (`@DataJpaTest`)

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class NomeRepositoryTest {
    @Autowired
    private NomeRepository repository;

    @Test
    void deveSalvarERecuperarEntidade() {
        // Given
        NomeEntidade entity = new NomeEntidade();
        entity.setCampo("valor");

        // When
        NomeEntidade salvo = repository.save(entity);

        // Then
        assertThat(salvo.getId()).isNotNull();
        assertThat(repository.findById(salvo.getId())).isPresent();
    }
}
```

### Test Data Builder

```java
@Builder
public class TransactionTestBuilder {
    @Builder.Default UUID id = UUID.randomUUID();
    @Builder.Default UUID userId = UUID.randomUUID();
    @Builder.Default String description = "Compra teste";
    @Builder.Default BigDecimal amount = BigDecimal.valueOf(100.00);
    @Builder.Default TransactionStatus status = TransactionStatus.PENDING;

    public Transaction build() { /* ... */ }
}

// Uso
Transaction tx = TransactionTestBuilder.builder()
    .amount(BigDecimal.valueOf(500))
    .status(TransactionStatus.APPROVED)
    .build();
```

### Parametrized tests (reduz duplicação)

```java
@ParameterizedTest(name = "valor {0} deve resultar em status {1}")
@CsvSource({
    "100.00, APPROVED",
    "0.00,   REJECTED",
    "-10.00, REJECTED",
    "9999.99, PENDING_REVIEW"
})
void deveClassificarTransacaoPorValor(String valor, String statusEsperado) {
    var result = service.classificar(new BigDecimal(valor));
    assertThat(result.getStatus().name()).isEqualTo(statusEsperado);
}
```

## Mockito — boas práticas

```java
// ✅ Verifica comportamento, não implementação
verify(emailService, times(1)).sendConfirmation(any(Transaction.class));

// ✅ Captura argumento para asserção detalhada
ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
verify(repository).save(captor.capture());
assertThat(captor.getValue().getStatus()).isEqualTo(TransactionStatus.APPROVED);

// ❌ Evitar — mock desnecessário (teste fica frágil)
when(transaction.getId()).thenReturn(UUID.randomUUID()); // crie Transaction real
```

## Executar testes (multiplataforma)

```bash
# Rodar todos os testes
mvn test

# Rodar classe específica
mvn test -Dtest=NomeServiceTest

# Rodar com relatório de cobertura
mvn test jacoco:report

# Pular testes (só se Max precisar compilar sem testar)
mvn package -DskipTests
```

## Cobertura mínima esperada

| Camada | Cobertura mínima |
|--------|-----------------|
| Service | 90% |
| Controller | 80% (via `@WebMvcTest`) |
| Repository | 70% (via `@DataJpaTest`) |
| Entity/DTO | N/A (sem lógica) |

## Regras invioláveis (estendem o universal)

- Nunca `Thread.sleep` em teste — use `@Timeout` ou Awaitility
- Nunca testar implementação privada — testa comportamento público
- Nunca banco de produção — sempre H2 (`application-test.yml`) ou Testcontainers
- Cada teste tem exatamente 1 razão pra falhar
- `@DisplayName` obrigatório, descrevendo o comportamento esperado
