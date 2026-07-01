// Svelte's transition:fly/fade/scale use the Web Animations API directly, so they
// aren't caught by a `prefers-reduced-motion` CSS media query — check explicitly
// and zero out the duration instead.
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
