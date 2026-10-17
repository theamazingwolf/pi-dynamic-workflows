import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const sdkNames = [
  "@earendil-works/pi-coding-agent",
  "@earendil-works/pi-ai",
  "@earendil-works/pi-agent-core",
  "@earendil-works/pi-tui",
  "@earendil-works/pi-telemetry",
  "@earendil-works/pi-codemode",
  "@earendil-works/pi-mcp",
];

type Manifest = { name: string; version: string; dependencies?: Record<string, string> };

function installedManifest(name: string, from: string): { path: string; manifest: Manifest } {
  for (const directory of createRequire(from).resolve.paths(name) ?? []) {
    const path = join(directory, name, "package.json");
    try {
      const manifest: Manifest = JSON.parse(readFileSync(path, "utf8"));
      if (manifest.name === name) return { path, manifest };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  throw new Error(`Cannot find manifest for ${name} from ${from}`);
}

test("Pi 1.2 test SDK stays physically aligned through transitive caret dependencies", () => {
  const root = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(readFileSync(root, "utf8"));
  for (const name of [sdkNames[0], sdkNames[3]]) {
    assert.equal(packageJson.peerDependencies[name], "*", `${name} must be host-provided`);
  }
  for (const name of [sdkNames[0], sdkNames[1], sdkNames[3]]) {
    assert.equal(packageJson.devDependencies[name], "1.2.0", `${name} dev pin`);
  }

  const visited = new Set<string>();
  function visit(name: string, from: string): void {
    const { path, manifest } = installedManifest(name, from);
    assert.equal(manifest.version, "1.2.0", `${name} resolved from ${from}`);
    if (visited.has(path)) return;
    visited.add(path);
    for (const dependency of Object.keys(manifest.dependencies ?? {})) {
      if (sdkNames.includes(dependency)) visit(dependency, path);
    }
  }
  for (const name of [sdkNames[0], sdkNames[1], sdkNames[3]]) visit(name, fileURLToPath(root));
  assert.equal(visited.size, sdkNames.length, "one physical copy of each Pi SDK package");
});
