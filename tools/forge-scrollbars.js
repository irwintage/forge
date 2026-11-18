/* Forge embedded pages: suppress only a genuinely non-scrolling document bar.
   Internal panels remain scrollable.  No continuous polling. */
(() => {
  const update = () => {
    const doc = document.documentElement;
    const body = document.body;
    if (!doc || !body) return;
    // Undo previous determination before measuring real document overflow.
    doc.classList.remove('forge-no-document-scroll');
    const viewHeight = doc.clientHeight || window.innerHeight;
    const contentHeight = Math.max(doc.scrollHeight, body.scrollHeight);
    // Tiny layout rounding differences should not produce a full-height scrollbar.
    const negligible = contentHeight - viewHeight <= 5;
    doc.classList.toggle('forge-no-document-scroll', negligible);
  };
  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; update(); });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule, { once: true });
  else schedule();
  window.addEventListener('load', schedule);
  window.addEventListener('resize', schedule);
  // Async-loaded panels and fonts can change page height without navigation.
  if (typeof ResizeObserver !== 'undefined') {
    const setup = () => {
      const observer = new ResizeObserver(schedule);
      if (document.body) observer.observe(document.body);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once:true });
    else setup();
  }
})();
