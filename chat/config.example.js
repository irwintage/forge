/* Copy to config.js after deploying Cloudflare Worker + D1 + Turnstile. */
window.FORGE_CHAT_CONFIG = {
  apiBase: 'https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev',
  turnstileSiteKey: 'YOUR_PUBLIC_TURNSTILE_SITE_KEY'
};
