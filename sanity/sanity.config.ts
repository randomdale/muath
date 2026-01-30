import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'muath-blog',

  projectId: 'rnvo8idh',
  dataset: 'production',

  tools: [structureTool()],

  schema: {
    types: schemaTypes,
  },
})
