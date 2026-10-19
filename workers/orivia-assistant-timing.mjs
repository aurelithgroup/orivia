// One instance per message. Nothing is shared between people or conversation turns.
export function assistantTiming(tools, clock = Date.now) {
 const timings = {modelMs:0, toolWallMs:0, searchMs:0, pageMs:0, pageCacheHits:0};
 const pages = new Map();
 const measure = async (key, work) => {
  const start = clock();
  try { return await work(); }
  finally { timings[key] += Math.max(0, clock() - start); }
 };
 const search = (...args) => measure('searchMs', () => tools.search(...args));
 const fetchPage = (url, options = {}) => {
  // Keep the exact address and policy options: no merging query strings, branches or access rules.
  const key = JSON.stringify([String(url), options.kind || '', options.host || '']);
  if (pages.has(key)) { timings.pageCacheHits++; return pages.get(key); }
  const pending = measure('pageMs', () => tools.fetchPage(url, options));
  // Bound retained HTML. Only successful reads survive; failures can be tried again.
  if (pages.size >= 8) pages.delete(pages.keys().next().value);
  pages.set(key, pending);
  const forget = () => { if (pages.get(key) === pending) pages.delete(key); };
  pending.then(result => { if (!result?.ok) forget(); }, forget);
  return pending;
 };
 return {tools:{...tools, search, fetchPage}, timings, measure};
}
