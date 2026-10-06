// ketcher-standalone's package.json "exports" has no "types" entry for this
// sub-path. It exposes the same API as the default entry.
declare module "ketcher-standalone/dist/binaryWasm" {
  export { StandaloneStructServiceProvider } from "ketcher-standalone";
}
