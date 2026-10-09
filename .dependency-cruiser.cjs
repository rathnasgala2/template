/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular-dependencies',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'only-src-core-is-a-source-root',
      comment:
        'The renderer has exactly one source root, src/core/. The only file under src/modules/ ' +
        'is the interactions browser script, which is read as data (never imported); no module ' +
        'import edge or registration path is admitted (reader interactions design, section 5).',
      severity: 'error',
      from: {},
      to: { path: '^src/modules' },
    },
    {
      name: 'runtime-does-not-import-repository-tooling',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^(scripts|test)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    enhancedResolveOptions: { exportsFields: ['exports'] },
  },
};
