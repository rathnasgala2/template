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
      name: 'preview-entry-reaches-no-node-only-module',
      comment:
        'src/core/preview.js runs in a browser: nothing it reaches, directly or transitively, may import a Node core module, Eleventy or the schemas validator, or be one of the Node-only modules (file readers, the media pipeline, theme loading, the validated palette sheet).',
      severity: 'error',
      from: { path: '^src/core/preview\\.js$' },
      to: {
        reachable: true,
        pathNot: '^src/core/preview\\.js$',
        path: [
          '^node_modules/@11ty/',
          '^node_modules/@rathnasgala2/schemas/(?!src/palette\\.js$)',
          'internal/(theme-assets|eleventy-render|messages|fs-walk)\\.js$',
          'internal/[a-z-]+-node\\.js$',
          'internal/appearance/palette-sheet\\.js$',
          'internal/media/(pipeline|audio)\\.js$',
          '^src/core/index\\.js$',
        ],
      },
    },
    {
      name: 'preview-entry-imports-no-core-module',
      severity: 'error',
      from: { path: '^src/core/(preview\\.js|internal/article-preview\\.js)$' },
      to: { dependencyTypes: ['core'] },
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
