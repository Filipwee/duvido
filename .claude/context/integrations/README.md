# Integration Reports (INT-NNN)

Relatórios técnicos de integração com sistemas externos, de autoria de **Diana
(integrator)**. Cada integração auditada vira um arquivo `INT-NNN-<slug>.md`
aqui (Relatório Técnico de 10 seções + contratos JSON + mapa de erros).

**Formato:** ver `.claude/rules/templates/integration-report-template.md`.

- **Quem escreve:** Diana, em toda auditoria/projeto de integração.
- **Quem lê:** Nina (segurança da integração — auth, secrets, payload), Lucas
  (implementa o contrato), Sergio (onde a integração vive na arquitetura).
- **Quem indexa:** Iris, em `context/architecture.md` → seção "Integrações externas".

> Contratos descobertos também são registrados de forma resumida em
> `memory/decisions.md` (via Iris) para não re-auditar no futuro. O relatório
> completo mora **aqui**.
