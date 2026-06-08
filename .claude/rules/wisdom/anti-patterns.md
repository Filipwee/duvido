# Anti-Patterns Universais

🪶 LIDO SOB DEMANDA por Lucas, Renata, Otávio.

Anti-patterns que aparecem em qualquer linguagem. Específicos do stack ficam
em `stacks/<active>/anti-patterns.md`.

## God Class / God Object / God Module

Classe/módulo que sabe demais e faz demais. Centenas de linhas, dezenas de
métodos, múltiplas responsabilidades.

```
❌ class TransactionManager {
       validar()
       persistir()
       enviarEmail()
       gerarRelatorioDiario()
       calcularImposto()
       sincronizarComERP()
       // ... 50 outros métodos
   }

✅ TransactionService persiste;
   TransactionValidator valida;
   TransactionNotifier notifica;
   TransactionReportService gera relatórios;
   TaxCalculator calcula impostos;
   ErpSyncService sincroniza.
```

**Sintoma**: arquivo cresce sem parar; cada feature nova "encaixa" lá.
**Cura**: SRP — extrair por responsabilidade.

## Magic Number / Magic String

```
❌ if (idade > 18) { ... }
   if (tipo == 'P') { ... }
   timeout = 5000

✅ const IDADE_MAIORIDADE = 18
   const TIPO_PESSOA_FISICA = 'P'
   const TIMEOUT_REQUEST_MS = 5000
```

Em enum quando aplicável:

```
enum TipoConta { PESSOA_FISICA = 'P', PESSOA_JURIDICA = 'J' }
```

**Sintoma**: número/string aparece direto no código; o leitor precisa adivinhar
o significado.

## Catch and Ignore (engolir erro)

```
❌ try { risky() } catch { /* nada */ }
❌ try: risky() except: pass
❌ result, _ := risky()   // Go: descartar erro sem comentário

✅ try {
       risky()
   } catch (ResourceNotFoundException e) {
       // not found neste contexto = default seguro
       return DEFAULT_VALUE;
   }

✅ result, err := risky()
   if err != nil {
       return fmt.Errorf("contexto: %w", err)
   }
```

**Sintoma**: bug em produção sem rastro nos logs.
**Regra de Otávio**: catch vazio sem comentário justificativo = bloqueador.

## Boolean Trap

```
❌ ativar(true, false, true, false)
❌ User user = new User("João", true, false, true)

✅ ativar(AtivarOpcoes { enviarEmail: true, notificarAdmin: false, ... })
✅ User user = User.builder()
       .nome("João")
       .ativo(true)
       .verificado(false)
       .premium(true)
       .build()
```

**Sintoma**: chamada com `(true, false, true)` — quem lê tem que ir na
assinatura entender o que cada um significa.

## Primitive Obsession

```
❌ string cpf = "12345678900"           // qualquer string aceita
❌ double valor = 100.50                // sem precisão monetária
❌ string telefone = "11999999999"      // sem validação

✅ class CPF { ... validação interna ... }
✅ class Money { ... usa BigDecimal/Decimal/string ... }
✅ class PhoneNumber { ... }
```

Em linguagens com tipos newtype (Rust, Haskell): `pub struct CPF(String)`.
Em outras: classe pequena com validação. Não obrigatório para tudo — só para
valores com regras de domínio.

## Anemic Domain Model

Domínio que é só getters/setters, e a lógica vive toda em services.

```
❌ class Transaction {
       getStatus()
       setStatus(s)   // qualquer um pode mudar
   }
   class TransactionService {
       approve(tx) {
           if (tx.getStatus() == PENDING) tx.setStatus(APPROVED);
       }
   }

✅ class Transaction {
       approve() {
           if (this.status != PENDING) throw IllegalState(...)
           this.status = APPROVED
           this.approvedAt = now()
       }
   }
   class TransactionService {
       process(id) {
           tx = repo.findById(id)
           tx.approve()        // comportamento mora no domínio
           repo.save(tx)
       }
   }
```

**Sintoma**: invariantes do domínio são responsabilidade de quem chama, não
do próprio objeto — fácil esquecer.

## Lava Layer

Várias camadas/abstrações empilhadas sem propósito claro, refletindo a
arqueologia do projeto.

```
❌ Controller → Service → BusinessService → ManagerService → ProcessorService → Repository
   (cada camada só repassa para a próxima)

✅ Controller → Service → Repository
   (camadas com responsabilidades distintas)
```

**Cura**: revisar com Sergio (Architect) e remover camadas sem propósito.

## Train Wreck (violação de Demeter)

```
❌ user.getAddress().getCity().getState().getCountry().getCode()

✅ user.getCountryCode()
   ou: user.getAddress().getCountryCode()  // até 2 níveis ok
```

**Sintoma**: cadeia de getters; mudar qualquer elo quebra muita coisa.

## Shotgun Surgery

Mudar uma regra de negócio requer mexer em 20 arquivos diferentes.

```
❌ Limite de saque hardcoded em SaqueService, ExtratoService,
   RelatorioMensalService, ApiController, AdminController, ...

✅ Limite vem de LimitesService.getLimite(tipo)
   ou de configuração externalizada
```

**Sintoma**: medo de mudar uma regra simples por causa do efeito dominó.

## Yo-yo Problem

Hierarquia de herança muito profunda — para entender uma classe você precisa
subir e descer várias vezes na árvore.

```
❌ A ← B ← C ← D ← E ← F ← MinhaClasse
✅ Composição > herança profunda
✅ Máximo 2-3 níveis de herança
```

## Refactor Mercenário

Refatorar tudo sem pedido, junto com a feature.

```
❌ PR de "adicionar campo X" toca 47 arquivos não relacionados.

✅ PR pequeno, focado.
   Refactor separado, comunicado, com risco avaliado.
```

**Cura**: Otávio bloqueia; Lucas/Renata aprendem disciplina de PR. Refactor é
trabalho próprio, planejado.

## Spaghetti Async / Callback Hell

Específico de linguagens com async (JS, Python, Rust, C#). Detalhes no
`stacks/<active>/anti-patterns.md`.

## Copy-Paste Engineering

```
❌ TransactionAService, TransactionBService, TransactionCService
   (95% código idêntico, 5% específico)

✅ TransactionService<T extends TransactionType>
   ou: Strategy pattern
   ou: Composição com função/lambda específica por tipo
```

**Sintoma**: bug encontrado em um lugar; "será que está nos outros também?"

## Sinais que algo deu errado

- Arquivo ultrapassou o limite do stack
- Função/método ultrapassou o limite do stack
- "Tem outro lugar que faz parecido?" sem certeza
- Você está com medo de mudar uma regra
- Você não sabe qual camada modificar
- O teste tem mais código que o método testado

Quando notar isso, **escale para Sergio (Architect)** se for estrutural; para
**Otávio (Reviewer)** se for local.
