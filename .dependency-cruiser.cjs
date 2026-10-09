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
      name: 'only-core-and-interactions-are-source-roots',
      comment:
        'Source roots are src/core/ and src/modules/interactions/ only; no other module tree is admitted.',
      severity: 'error',
      from: {},
      to: { path: '^src/modules/(?!interactions/)' },
    },
    {
      name: 'core-never-imports-modules',
      comment:
        'src/core/ never imports from src/modules/. The interactions browser script is emitted as data (read from disk), not imported.',
      severity: 'error',
      from: { path: '^src/core/' },
      to: { path: '^src/modules/' },
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
