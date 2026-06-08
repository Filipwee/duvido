# Stack `java-spring`

🪶 Stack para backend Java moderno com Spring Boot.

## Linguagem / Framework

- **Linguagem**: Java 17 LTS (com features de 21 LTS quando disponível — virtual threads, sequenced collections, pattern matching for switch)
- **Framework**: Spring Boot 3.x (web, data-jpa, security, validation, actuator)
- **Build**: Maven 3.8+
- **Test**: JUnit 5 + Mockito + AssertJ + MockMvc + Testcontainers
- **Lint/Format**: Spotless (Google Java Format)
- **ORM**: Spring Data JPA + Hibernate + Flyway (migrations)

## Quando usar

- API REST de produção, alta confiabilidade, padrão corporativo
- Sistema com transações ACID em RDBMS (PostgreSQL, MySQL)
- Integrações pesadas com JMS, JPA, Spring ecosystem
- Time familiar com tipagem estática + verbosidade explícita

## Quando NÃO usar (alternativa)

- CLI ou script curto → considerar `python-fastapi` ou `go`
- Serviço de baixa latência com poucos recursos → `go`
- Backend simples com poucas integrações → `node-typescript` ou `python-fastapi`
