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
        'S2-T02 module-tree absence gate: the renderer has exactly one source root, src/core/. ' +
        'No src/modules/ tree, module import edge or module registration path is admitted ' +
        '(brief S2 section 3, DEC-097 section 2).',
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
