import type { CodegenConfig } from '@graphql-codegen/cli'

// Types come from schema.graphql, exported from the backend with `npm run schema`,
// so codegen and type checks don't need a running API.
const config: CodegenConfig = {
  schema: 'schema.graphql',
  // Tests use the app's documents; they don't define their own.
  documents: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/gql/**/*'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
      config: {
        scalars: { DateTime: 'string', Date: 'string' },
        // Recommended by Apollo: null (not optional) for nullable fields,
        // unknown for unconfigured scalars, and a non-optional __typename.
        avoidOptionals: { field: true, inputValue: false },
        defaultScalarType: 'unknown',
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        // Required by verbatimModuleSyntax and erasableSyntaxOnly in tsconfig.
        useTypeImports: true,
        enumsAsTypes: true,
      },
    },
  },
}

export default config
