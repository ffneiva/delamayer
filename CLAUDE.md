# CLAUDE.md

As instruções deste projeto vivem em **[`AGENTS.md`](AGENTS.md)**.

Elas valem para qualquer agente, de qualquer modelo — e para humanos. Manter uma
cópia aqui só criaria duas versões da mesma regra, que divergiriam no primeiro
ajuste.

Leia `AGENTS.md` antes de qualquer alteração. O resumo do que ele exige:

1. **Issue → branch → PR.** Nada entra na `main` direto. O PR menciona a Issue
   com `Closes #N`.
2. **Conventional Commits**, validados pelo commitlint.
3. **Todo conteúdo em `src/lib/business.ts`.** Texto não fica em componente.
4. **Nenhuma promessa de prazo ou resultado; nenhum número sem fonte.** É um
   site de assessoria de crédito — esta é a regra que sustenta a marca.
5. **Movimento nunca esconde conteúdo de forma irreversível**, e
   `prefers-reduced-motion` desliga tudo que não é essencial.
6. **Orçamento de 170 kB comprimidos** no caminho crítico, verificado no CI.
7. **Nada de infraestrutura no repositório.** Ele é público: nenhuma chave, ARN,
   ID de conta ou nome de bucket.
