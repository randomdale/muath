import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "default",
  title: "muath-blog",
  projectId: "rnv8idh", // or hardcode for now
  dataset: "production",      // usually "production"
  plugins: [deskTool()],
  schema: { types: schemaTypes },
});
