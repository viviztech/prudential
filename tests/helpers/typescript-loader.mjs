const root = new URL("../../", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  const target = specifier.startsWith("@/") ? new URL(specifier.slice(2), root).href : specifier;
  try {
    return await nextResolve(target, context);
  } catch (error) {
    if (!["ERR_MODULE_NOT_FOUND", "ERR_UNSUPPORTED_DIR_IMPORT"].includes(error.code)
      || !/^(\.{1,2}\/|file:)/.test(target)) throw error;
    for (const suffix of [".ts", ".tsx", "/index.ts"]) {
      try { return await nextResolve(`${target}${suffix}`, context); } catch { /* Try the next source extension. */ }
    }
    throw error;
  }
}
