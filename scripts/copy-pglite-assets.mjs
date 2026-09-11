import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");

if (!existsSync(destDir)) {
  process.exit(0);
}
mkdirSync(destDir, { recursive: true });
for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm", "initdb.js"]) {
  const from = join(srcDir, name);
  if (!existsSync(from)) continue;
  copyFileSync(from, join(destDir, name));
}
