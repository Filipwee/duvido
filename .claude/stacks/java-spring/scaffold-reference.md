# Scaffold Reference — Java / Spring Boot

🪶 LIDO SOB DEMANDA por Bruno (scaffolder). Estruturas e dependências base.
Bruno entrega esqueleto sem lógica — Lucas implementa.

## Estrutura padrão que Bruno entrega

```
<projeto>/
├── pom.xml
├── .gitignore
├── .gitattributes                        ← * text=auto eol=lf
├── .mvn/wrapper/                         ← Maven Wrapper (opcional)
├── mvnw, mvnw.cmd                        ← Maven Wrapper
├── src/
│   ├── main/
│   │   ├── java/com/<groupId>/<artifactId>/
│   │   │   ├── <ArtifactId>Application.java      ← main class
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   └── JpaConfig.java
│   │   │   ├── <feature>/                        ← package by feature
│   │   │   │   ├── <Feature>Controller.java
│   │   │   │   ├── <Feature>Service.java         ← interface
│   │   │   │   ├── <Feature>ServiceImpl.java
│   │   │   │   ├── <Feature>Repository.java
│   │   │   │   ├── <Feature>.java                ← @Entity
│   │   │   │   ├── <Feature>Request.java         ← DTO record
│   │   │   │   └── <Feature>Response.java        ← DTO record
│   │   │   └── shared/
│   │   │       └── exception/
│   │   │           ├── GlobalExceptionHandler.java
│   │   │           ├── ResourceNotFoundException.java
│   │   │           ├── BusinessRuleException.java
│   │   │           └── ErrorResponse.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-test.yml              ← H2
│   │       └── db/migration/                     ← Flyway
│   │           └── V1__init.sql
│   └── test/
│       └── java/com/<groupId>/<artifactId>/
│           ├── <Feature>ControllerTest.java      ← @WebMvcTest
│           └── <Feature>ServiceTest.java         ← @ExtendWith(MockitoExtension)
└── .github/workflows/ci.yml
```

## `pom.xml` — dependências base

Sempre incluir:

```xml
<dependencies>
  <!-- web -->
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>

  <!-- persistência -->
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
  <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
  <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>

  <!-- segurança (se feature de auth no escopo) -->
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>

  <!-- observabilidade -->
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>

  <!-- helpers de dev -->
  <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
  <dependency><groupId>org.mapstruct</groupId><artifactId>mapstruct</artifactId></dependency>

  <!-- teste -->
  <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
  <dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>test</scope></dependency>
  <dependency><groupId>org.testcontainers</groupId><artifactId>postgresql</artifactId><scope>test</scope></dependency>
</dependencies>
```

E `<properties>`:

```xml
<properties>
  <java.version>17</java.version>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
  <lombok.version>1.18.32</lombok.version>
  <mapstruct.version>1.5.5.Final</mapstruct.version>
</properties>
```

E `<build><plugins>` — ordem do annotation processor importa:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <configuration>
    <annotationProcessorPaths>
      <path><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><version>${lombok.version}</version></path>
      <path><groupId>org.mapstruct</groupId><artifactId>mapstruct-processor</artifactId><version>${mapstruct.version}</version></path>
    </annotationProcessorPaths>
  </configuration>
</plugin>
```

## Multiplataforma: caminhos e encoding

- Sempre usar `/` em paths dentro de código Java (Java traduz para a plataforma)
- Em `application.yml`, paths de arquivo usam `${user.home}` ou env vars
- Encoding UTF-8 explícito no `pom.xml` (acima)
- Line endings: `.gitattributes` com `* text=auto eol=lf`

## Comandos para Bruno usar

```bash
# Verificar Maven
mvn --version

# Criar estrutura de diretórios (mkdir -p funciona em Git Bash/WSL/Linux/macOS)
mkdir -p src/main/java/com/example/app/{config,shared/exception}
mkdir -p src/main/java/com/example/app/<feature>
mkdir -p src/test/java/com/example/app
mkdir -p src/main/resources/db/migration

# Alternativa: usar Spring Initializr (CLI ou via curl)
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,validation,security,actuator,flyway,postgresql,lombok \
  -d type=maven-project \
  -d javaVersion=17 \
  -d groupId=com.example -d artifactId=myapp -d packaging=jar \
  -o starter.zip && unzip starter.zip
```

## `application.yml` base

```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/myapp}
    username: ${DATABASE_USER:myapp}
    password: ${DATABASE_PASSWORD:myapp}
  jpa:
    hibernate:
      ddl-auto: validate           # nunca create/update em produção
    properties:
      hibernate.format_sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
server:
  port: 8080
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

`application-test.yml` (H2 para testes):

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:test;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
  flyway:
    enabled: false
```
