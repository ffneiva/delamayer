/**
 * Conventional Commits — a mensagem do commit é a única documentação que
 * sobrevive a todos os refactors, e é dela que sai o histórico legível em
 * `git log --oneline`.
 *
 * Os escopos abaixo espelham as pastas do projeto. `infra` cobre AWS e Actions.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'hero',
        'secoes',
        'diagnostico',
        'seo',
        'marca',
        '3d',
        'a11y',
        'infra',
        'ci',
        'deps',
        'docs',
        'testes',
      ],
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
}
