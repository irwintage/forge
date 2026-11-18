# Optional backend for real public ratings and feedback

The V19 chat works without this backend. Ratings are not public until the backend is deliberately deployed. In that mode, the frontend buttons remain disabled, and no public rating counts are fabricated.

**Stack**: Cloudflare Worker + D1 + Cloudflare Turnstile, with a Worker route such as `https://api.example.com`.

1. Create a D1 database. Apply `schema.sql` using `wrangler d1 execute YOUR_DB --file=chat/backend/schema.sql --remote`.
2. Deploy `worker.js` to a Worker with D1 binding **DB**, secret **TURNSTILE_SECRET**, and text variable **ALLOWED_ORIGIN=https://forge.chrysasynth.com**. Replace with the actual Forge origin.
3. V19.9 already loads Cloudflare Turnstile for an explicit submission and sends a freshly acquired token. Add your public site key in `chat/config.js`, and configure the secret in the Worker as `TURNSTILE_SECRET`. The Worker rejects unverified POSTs. Test both ends before going live.
4. After testing the service with real verification, set `apiBase` in `chat/config.js`. CORS is not an authentication system; also configure Cloudflare WAF rate limiting for public endpoints.
5. Display ratings only from `GET /api/tools/{id}/ratings` and never from localStorage or seeded data. The initial response should be `{"count":0,"average":0}`.

**Privacy and moderation**: Decide on moderation, retention and abuse handling before public release. Anonymous ratings are open to repeated submissions even with a CAPTCHA; for trusted one-vote-per-user behaviour, add login and a unique `(user_id,tool_id)` constraint. Unmoderated text feedback should not be automatically published. No chat conversation data is sent to this Worker.
