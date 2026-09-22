/**
 * Minimal ambient typing for the one Eleventy surface
 * `src/core/internal/eleventy-render.js` uses. `@11ty/eleventy` ships no
 * published type declarations; this is deliberately narrow rather than a
 * full re-authoring of its programmatic API.
 */
declare module '@11ty/eleventy' {
  export interface EleventyUserConfig {
    setUseGitIgnore(value: boolean): void;
    setLayoutsDirectory(directory: string): void;
    setQuietMode(value: boolean): void;
    setDataDeepMerge(value: boolean): void;
    addTemplate(
      virtualInputPath: string,
      content: string,
      data?: Record<string, unknown>,
    ): void;
  }

  export interface EleventyConstructorOptions {
    source?: 'cli' | 'script';
    runMode?: 'build' | 'serve' | 'watch';
    dryRun?: boolean;
    quietMode?: boolean;
    configPath?: string | false;
    config?: (eleventyConfig: EleventyUserConfig) => void;
  }

  export default class Eleventy {
    constructor(
      input?: string,
      output?: string,
      options?: EleventyConstructorOptions,
    );
    disableLogger(): void;
    write(): Promise<unknown>;
  }
}
