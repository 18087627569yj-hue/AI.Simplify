export function getResource(name, fallback) {
  const resources = globalThis.__resources;
  return resources && resources[name] ? resources[name] : fallback;
}
