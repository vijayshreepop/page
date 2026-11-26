import { FILES, same } from './draft.js';

/** Short fingerprint of one file, so the draft does not store a second full copy. */
export function fileFingerprint(value) {
  const s = JSON.stringify(value);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return `${s.length}-${(h >>> 0).toString(36)}`;
}
export const fingerprint = (data) => Object.fromEntries(FILES.map((f) => [f, fileFingerprint(data[f])]));

/** Files you have not edited follow the published website. Edited files are kept as they are. */
export function reconcile(draft, published) {
  const now = fingerprint(published);
  const data = { ...draft.data };
  const base = { ...draft.base };
  for (const f of FILES) {
    const untouched = fileFingerprint(draft.data[f]) === draft.base[f];
    if (untouched || same(draft.data[f], published[f])) { data[f] = structuredClone(published[f]); base[f] = now[f]; }
  }
  return { data, base };
}
